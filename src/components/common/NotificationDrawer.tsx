import React from 'react';
import { X, Bell, AlertTriangle, Calendar, RefreshCw, Info, Check } from 'lucide-react';
import { NotificationItem } from '../../types';

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: NotificationItem[];
  onMarkAllRead: () => void;
}

export const NotificationDrawer: React.FC<NotificationDrawerProps> = ({
  isOpen,
  onClose,
  notifications,
  onMarkAllRead
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/40 backdrop-blur-2xs flex justify-end">
      <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-200">
        
        {/* Header */}
        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-teal-700" />
            <h3 className="font-bold text-slate-900 text-base">
              Healthcare Notifications
            </h3>
            <span className="bg-teal-100 text-teal-800 text-xs px-2 py-0.5 rounded-full font-bold">
              {notifications.length}
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content list */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {notifications.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-sm">
              No recent notifications
            </div>
          ) : (
            notifications.map((notif) => {
              const isEmergency = notif.type === 'EMERGENCY' || notif.type === 'ALERT';
              return (
                <div
                  key={notif.id}
                  className={`p-3.5 rounded-xl border text-xs transition-all ${
                    isEmergency
                      ? 'bg-rose-50/70 border-rose-200 text-rose-950'
                      : notif.type === 'APPOINTMENT'
                      ? 'bg-blue-50/70 border-blue-200 text-blue-950'
                      : 'bg-slate-50 border-slate-200 text-slate-800'
                  }`}
                >
                  <div className="flex items-start gap-2.5">
                    <div className="shrink-0 mt-0.5">
                      {isEmergency ? (
                        <AlertTriangle className="w-4 h-4 text-rose-600" />
                      ) : notif.type === 'APPOINTMENT' ? (
                        <Calendar className="w-4 h-4 text-blue-600" />
                      ) : (
                        <Info className="w-4 h-4 text-teal-600" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="font-bold text-slate-900 text-xs sm:text-sm">
                        {notif.title}
                      </div>
                      <p className="mt-1 text-slate-600 leading-relaxed">
                        {notif.message}
                      </p>
                      <div className="mt-2 text-[10px] text-slate-400 flex items-center justify-between">
                        <span>{new Date(notif.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        {!notif.isRead && (
                          <span className="font-semibold text-teal-700 bg-teal-50 px-1.5 py-0.5 rounded-sm">New</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-xs">
          <button
            onClick={onMarkAllRead}
            className="flex items-center gap-1 text-slate-600 hover:text-slate-900 font-semibold cursor-pointer"
          >
            <Check className="w-4 h-4" />
            <span>Mark all as read</span>
          </button>
          <button
            onClick={onClose}
            className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 font-bold rounded-lg text-slate-800 cursor-pointer"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
