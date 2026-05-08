import express from 'express';
import type { Application, Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { pool } from './config/db.js';

import jobRoutes from './modules/jobs/jobs.routes.js';
import authRoutes from './modules/auth/auth.routes.js'; 
import profileRoutes from './modules/profile/profile.routes.js';
import crmRoutes from './modules/crm/crm.routes.js';
import { startRadarCron } from './modules/ingestion/radar/cron.js';

dotenv.config();

const app: Application = express();

app.use(cors());
app.use(express.json());

app.use('/api/jobs', jobRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/crm', crmRoutes);

app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'active', message: 'CareerBridge API is running' });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, async () => {
  console.log(`🚀 CareerBridge Server live on port ${PORT}`);
  
  try {
    await pool.query('SELECT 1');
    console.log('📦 Database connection verified.');
  } catch (error) {
    console.error('❌ Database connection failed on startup:', error);
  }

  startRadarCron();
});