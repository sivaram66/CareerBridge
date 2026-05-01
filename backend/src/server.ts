import express from 'express';
import type { Application, Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { pool } from './config/db.js';


// --- Route Imports ---
import jobRoutes from './modules/jobs/jobs.routes.js';
import scraperRoutes from './modules/scraper/scraper.routes.js';
import authRoutes from './modules/auth/auth.routes.js'; 
import profileRoutes from './modules/profile/profile.routes.js';
import crmRoutes from './modules/crm/crm.routes.js';
import aggregatorRoutes from './modules/aggregator/aggregator.routes.js';
import { startAggregatorCron } from './modules/aggregator/aggregator.cron.js';
// ... rest of your setup code ...

dotenv.config();

const app: Application = express();

// Middleware
app.use(cors());
app.use(express.json());


//Routers
app.use('/api/jobs', jobRoutes);
app.use('/api/scraper', scraperRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/crm', crmRoutes);
app.use('/api/aggregator', aggregatorRoutes);

// Health Check Route
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'active', message: 'CareerBridge API is running' });
});

// Start the server
const PORT = process.env.PORT || 5000;

app.listen(PORT, async () => {
  console.log(`CareerBridge Server live on port ${PORT}`);
  // Quick check to ensure DB is actually reachable on startup
  startAggregatorCron();
  try {
    await pool.query('SELECT 1');
  } catch (error) {
    console.error('Database connection failed on startup:', error);
  }
});