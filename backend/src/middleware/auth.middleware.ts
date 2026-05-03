import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/auth.service';
import { query } from '../database/connection';
import { cacheGet } from '../cache/redis';
import logger from '../utils/logger';

export interface AuthRequest extends Request {
  user?: any;
  userId?: string;
}

/**
 * Authenticate JWT token
 */
export async function authenticate(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ error: 'No token provided' });
      return;
    }
    
    const token = authHeader.substring(7);
    
    // Verify token
    const payload = AuthService.verifyToken(token);
    
    // Check session cache
    const session = await cacheGet(`session:${payload.userId}`);
    
    if (!session) {
      res.status(401).json({ error: 'Session expired. Please login again.' });
      return;
    }
    
    // Get user from database
    const users = await query(
      `SELECT * FROM users WHERE id = $1 AND deleted_at IS NULL`,
      [payload.userId]
    );
    
    if (!users[0]) {
      res.status(401).json({ error: 'User not found' });
      return;
    }
    
    const user = users[0];
    
    // Check if user is suspended
    if (user.is_suspended) {
      res.status(403).json({ 
        error: 'Account suspended',
        reason: user.suspension_reason,
        suspendedUntil: user.suspended_until,
      });
      return;
    }
    
    // Attach user to request
    req.user = user;
    req.userId = user.id;
    
    // Update last active
    query(
      `UPDATE users SET last_active_at = NOW() WHERE id = $1`,
      [user.id]
    ).catch(err => logger.error('Failed to update last_active_at:', err));
    
    next();
  } catch (error) {
    logger.error('Authentication error:', error);
    res.status(401).json({ error: 'Invalid or expired token' });
  }
}

/**
 * Require specific role(s)
 */
export function requireRole(...roles: string[]) {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }
    
    const userRoles = req.user.roles || [];
    const hasRole = roles.some(role => userRoles.includes(role));
    
    if (!hasRole) {
      res.status(403).json({ 
        error: 'Insufficient permissions',
        required: roles,
        current: userRoles,
      });
      return;
    }
    
    next();
  };
}

/**
 * Require verification tier
 */
export function requireVerificationTier(minTier: string) {
  const tierOrder = ['tier0_phone', 'tier1_community', 'tier2_document', 'tier3_trusted'];
  
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }
    
    const userTierIndex = tierOrder.indexOf(req.user.verification_tier);
    const requiredTierIndex = tierOrder.indexOf(minTier);
    
    if (userTierIndex < requiredTierIndex) {
      res.status(403).json({ 
        error: 'Verification required',
        currentTier: req.user.verification_tier,
        requiredTier: minTier,
      });
      return;
    }
    
    next();
  };
}

/**
 * Optional authentication (doesn't fail if no token)
 */
export async function optionalAuth(
  req: AuthRequest,
  _res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      next();
      return;
    }
    
    const token = authHeader.substring(7);
    const payload = AuthService.verifyToken(token);
    
    const users = await query(
      `SELECT * FROM users WHERE id = $1 AND deleted_at IS NULL`,
      [payload.userId]
    );
    
    if (users[0] && !users[0].is_suspended) {
      req.user = users[0];
      req.userId = users[0].id;
    }
    
    next();
  } catch (error) {
    // Ignore auth errors for optional auth
    next();
  }
}
