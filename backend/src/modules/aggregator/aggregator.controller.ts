import type { Request, Response } from 'express';
import { db } from '../../config/db.js';
import { targetCompanies } from '../../shared/schema.js';

export const addTargetCompanyHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, atsProvider, boardToken } = req.body;

    // 1. Validation: Make sure the user provided all the required fields
    if (!name || !atsProvider || !boardToken) {
      res.status(400).json({ error: 'Please provide name, atsProvider, and boardToken' });
      return;
    }

    // 2. Database Insert: Save the new company to our target list
    const newCompany = await db.insert(targetCompanies).values({
      name,
      atsProvider,
      boardToken
    }).returning();

    // 3. Success Response: Send the newly created row back to Postman
    res.status(201).json(newCompany[0]);
  } catch (error) {
    console.error('Failed to add target company:', error);
    res.status(500).json({ error: 'Server error while adding company' });
  }
};