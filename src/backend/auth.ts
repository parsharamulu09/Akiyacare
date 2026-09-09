/**
 * Authentication and Authorization Middleware for AikyaCare
 * 
 * Provides:
 * - Secure bcrypt password hashing & verification
 * - Signed JWT token creation and verification
 * - authenticateToken middleware
 * - requireRole middleware for role-based access control
 */

import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'aikyacare-rural-health-secure-jwt-key-2026';
const TOKEN_EXPIRY = '7d';

export interface AuthTokenPayload {
  userId: string;
  role: string;
  name: string;
  phone?: string;
  email?: string;
  patientId?: string;
  workerId?: string;
  doctorId?: string;
  ambulanceId?: string;
  hospitalId?: string;
}

export interface AuthenticatedRequest extends Request {
  user?: AuthTokenPayload;
}

/**
 * Hash a plain text password using bcrypt
 */
export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

/**
 * Compare plain text password with stored hash
 */
export async function comparePassword(password: string, hash: string): Promise<boolean> {
  if (!password || !hash) return false;
  return bcrypt.compare(password, hash);
}

/**
 * Generate signed JWT token
 */
export function generateToken(payload: AuthTokenPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: TOKEN_EXPIRY });
}

/**
 * Verify and decode JWT token
 */
export function verifyToken(token: string): AuthTokenPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as AuthTokenPayload;
  } catch {
    return null;
  }
}

/**
 * Middleware: Extract and verify JWT from Authorization header
 */
export function authenticateToken(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.startsWith('Bearer ')
    ? authHeader.substring(7)
    : (req.query.token as string | undefined);

  if (!token) {
    return res.status(401).json({
      success: false,
      error: 'Authentication token missing. Please sign in.'
    });
  }

  const decoded = verifyToken(token);
  if (!decoded) {
    return res.status(401).json({
      success: false,
      error: 'Session expired or invalid token. Please sign in again.'
    });
  }

  req.user = decoded;
  next();
}

/**
 * Middleware: Enforce role-based access control.
 * Supports role aliases e.g. ASHA <-> HEALTH_WORKER, AMBULANCE <-> AMBULANCE_PARAMEDIC, HOSPITAL <-> HOSPITAL_STAFF.
 */
export function requireRole(...allowedRoles: string[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
    }

    const userRole = normalizeRole(req.user.role);
    const normalizedAllowed = allowedRoles.map(normalizeRole);

    if (!normalizedAllowed.includes(userRole)) {
      return res.status(403).json({
        success: false,
        error: `Access Denied: Role '${req.user.role}' is not authorized to access this resource. Permitted: ${allowedRoles.join(' or ')}.`
      });
    }

    next();
  };
}

/**
 * Normalize role string to handle role representations consistently
 */
export function normalizeRole(role?: string): string {
  if (!role) return '';
  const upper = role.toUpperCase().trim();
  if (upper === 'ASHA' || upper === 'HEALTH_WORKER') return 'HEALTH_WORKER';
  if (upper === 'AMBULANCE' || upper === 'AMBULANCE_PARAMEDIC') return 'AMBULANCE_PARAMEDIC';
  if (upper === 'HOSPITAL' || upper === 'HOSPITAL_STAFF') return 'HOSPITAL_STAFF';
  return upper;
}
