import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/authService';

declare global {
  namespace Express {
    interface Request {
      userId?: string;
      userEmail?: string;
    }
  }
}

export const authenticateToken = async (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  const payload = AuthService.verifyAccessToken(token);
  
  if (!payload) {
    return res.status(403).json({ error: 'Invalid or expired access token' });
  }

  // Attach user info to request object
  req.userId = payload.userId;
  req.userEmail = payload.email;
  
  next();
};