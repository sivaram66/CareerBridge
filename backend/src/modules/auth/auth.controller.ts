import type { Request, Response } from 'express';
import * as authService from './auth.service.js';

export const registerUserHandler = async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body;

  try {
    const result = await authService.registerUser(email, password);
    
    res.status(201).json(result);
  } catch (error: any) {
    console.error('Registration error:', error);
    
    if (error.message === 'User already exists') {
      res.status(400).json({ error: error.message });
      return;
    }

    res.status(500).json({ error: 'Server error during registration' });
  }
};


export const loginUserHandler = async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body;

  try {
    const result = await authService.loginUser(email, password);
    res.status(200).json(result);
  } catch (error: any) {
    console.error('Login error:', error);
    
    if (error.message === 'Invalid credentials') {
      res.status(401).json({ error: error.message });
      return;
    }

    res.status(500).json({ error: 'Server error during login' });
  }
};