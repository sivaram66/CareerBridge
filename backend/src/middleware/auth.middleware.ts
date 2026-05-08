import express, {type Request, type Response, type NextFunction } from 'express';
import * as jwtPkg from 'jsonwebtoken';
const { verify } = jwtPkg;

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-careerbridge-key-change-me-in-production';

// Extend the Express Request type so we can attach the user ID to it
export interface AuthRequest extends Request {
  user?: { userId: number };
}

export const requireAuth = (req: AuthRequest, res: Response, next: NextFunction) => {
  // Get the token from the "Authorization" header (e.g., "Bearer eyJhbGci...")
  const authHeader = req.headers.authorization;
  const token = authHeader?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access denied. No token provided.' });
  }

  try {
    // Verify the token
    const decoded = verify(token, JWT_SECRET) as { userId: number };
    
    // Attach the userId to the request so the next function knows WHO is calling it
    req.user = decoded;
    
    next(); // Let them through!
  } catch (error) {
    return res.status(403).json({ error: 'Invalid or expired token.' });
  }
};