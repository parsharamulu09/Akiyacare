/**
 * Low-Connectivity Engine & Offline Sync Queue for AikyaCare
 * 
 * Manages local persistence, offline triage execution, and automatic
 * bi-directional synchronization upon network restoration.
 */

import { assessEmergencyRisk } from '../triage/emergencyEngine';
import { TriageInput, TriageResult, SyncQueueItem } from '../types';
import { apiClient } from './apiClient';

const QUEUE_STORAGE_KEY = 'aikyacare_pending_sync_queue';
const SIMULATE_OFFLINE_KEY = 'aikyacare_simulated_offline';

export type ConnectivityState = 'ONLINE' | 'SYNCING' | 'OFFLINE';

class OfflineSyncEngine {
  private simulatedOffline: boolean = false;
  private listeners: Set<(state: ConnectivityState, queueLength: number) => void> = new Set();
  private isSyncInProgress: boolean = false;

  constructor() {
    this.simulatedOffline = typeof window !== 'undefined' ? localStorage.getItem(SIMULATE_OFFLINE_KEY) === 'true' : false;

    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => this.handleNetworkChange());
      window.addEventListener('offline', () => this.handleNetworkChange());
    }
  }

  public isOnline(): boolean {
    if (this.simulatedOffline) return false;
    return typeof navigator !== 'undefined' ? navigator.onLine : true;
  }

  public getStatus(): ConnectivityState {
    if (this.isSyncInProgress) return 'SYNCING';
    return this.isOnline() ? 'ONLINE' : 'OFFLINE';
  }

  public toggleOfflineSimulation(forceOffline?: boolean): boolean {
    this.simulatedOffline = forceOffline !== undefined ? forceOffline : !this.simulatedOffline;
    if (typeof window !== 'undefined') {
      localStorage.setItem(SIMULATE_OFFLINE_KEY, String(this.simulatedOffline));
    }
    this.notify();

    if (!this.simulatedOffline && typeof navigator !== 'undefined' && navigator.onLine) {
      this.syncPendingQueue();
    }
    return this.simulatedOffline;
  }

  public getPendingQueue(): SyncQueueItem[] {
    if (typeof window === 'undefined') return [];
    try {
      const data = localStorage.getItem(QUEUE_STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  private saveQueue(queue: SyncQueueItem[]) {
    if (typeof window !== 'undefined') {
      localStorage.setItem(QUEUE_STORAGE_KEY, JSON.stringify(queue));
    }
    this.notify();
  }

  public queueItem(actionType: SyncQueueItem['actionType'], payload: any): SyncQueueItem {
    const item: SyncQueueItem = {
      id: `sync_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      healthWorkerId: 'hw-1',
      actionType,
      payload,
      status: 'PENDING',
      clientCreatedAt: new Date().toISOString(),
      retryCount: 0
    };

    const queue = this.getPendingQueue();
    queue.push(item);
    this.saveQueue(queue);

    // If online, attempt immediate sync
    if (this.isOnline()) {
      this.syncPendingQueue();
    }

    return item;
  }

  public runLocalTriage(input: TriageInput): TriageResult {
    // Executes entirely in-browser using deterministic clinical rules
    const result = assessEmergencyRisk(input);

    // Queue for syncing to central hospital/supervisor registries
    this.queueItem('TRIAGE_CASE', {
      patientName: input.patientName || 'Village Resident',
      age: input.age,
      gender: input.gender,
      symptoms: input.symptoms,
      villageName: 'Narsapur Tanda',
      result
    });

    return result;
  }

  public async syncPendingQueue(): Promise<{ syncedCount: number; message: string }> {
    if (!this.isOnline()) {
      return { syncedCount: 0, message: 'Device is offline. Queued for automatic sync.' };
    }

    const queue = this.getPendingQueue();
    if (queue.length === 0) {
      return { syncedCount: 0, message: 'All cases synced successfully' };
    }

    this.isSyncInProgress = true;
    this.notify();

    try {
      const response = await apiClient.syncOfflineQueue(queue);
      if (response.success) {
        // Clear queue
        this.saveQueue([]);
        this.isSyncInProgress = false;
        this.notify();
        return { syncedCount: response.syncedCount, message: 'All cases synced successfully.' };
      } else {
        throw new Error(response.message || 'Sync failed');
      }
    } catch (err) {
      console.warn('Sync failed, will retry later:', err);
      this.isSyncInProgress = false;
      this.notify();
      return { syncedCount: 0, message: 'Sync failed; saved locally for retry.' };
    }
  }

  private handleNetworkChange() {
    if (this.isOnline()) {
      this.syncPendingQueue();
    }
    this.notify();
  }

  public subscribe(callback: (state: ConnectivityState, queueLength: number) => void): () => void {
    this.listeners.add(callback);
    callback(this.getStatus(), this.getPendingQueue().length);
    return () => this.listeners.delete(callback);
  }

  private notify() {
    const status = this.getStatus();
    const count = this.getPendingQueue().length;
    this.listeners.forEach(cb => cb(status, count));
  }
}

export const offlineSyncEngine = new OfflineSyncEngine();
