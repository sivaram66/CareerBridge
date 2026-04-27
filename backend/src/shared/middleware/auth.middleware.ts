import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

// Extend the Express Request type so TypeScript knows req.user exists
export interface AuthRequest extends Request {
  user?: { userId: number };
}

export const requireAuth = (req: AuthRequest, res: Response, next: NextFunction): void => {
  const token = req.header('Authorization')?.split(' ')[1]; // Expects "Bearer <token>"

  if (!token) {
    res.status(401).json({ error: 'No token, authorization denied' });
    return;
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { userId: number };
    req.user = decoded; // Attach the userId to the request
    next(); // Pass control to the next route handler
  } catch (err) {
    res.status(401).json({ error: 'Token is not valid' });
  }
};