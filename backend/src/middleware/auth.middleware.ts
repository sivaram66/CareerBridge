import express, {type Request, type Response, type NextFunction } from 'express';
import * as jwtPkg from 'jsonwebtoken';
const { verify } = jwtPkg;

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-careerbridge-key-change-me-in-production';

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
    const decoded = verify(token, JWT_SECRET) as { userId: number };
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({ error: 'Invalid or expired token.' });
  }
};