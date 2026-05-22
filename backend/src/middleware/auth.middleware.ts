import { type Request, type Response, type NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthRequest extends Request {
  user?: { userId: number };
}

export const requireAuth = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access denied. No token provided.' });
  }

  try {
    const secret = process.env.JWT_SECRET || 'super-secret-key';
    const decoded = jwt.verify(token, secret) as { userId: number };
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Session expired. Please log in again.' });
  }
};