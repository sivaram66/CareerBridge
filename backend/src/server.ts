import express from 'express';
import type { Application, Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import cron from 'node-cron';
import { pool } from './config/db.js';

import jobRoutes from './modules/jobs/jobs.routes.js';
import authRoutes from './modules/auth/auth.routes.js';
import profileRoutes from './modules/profile/profile.routes.js';
import crmRoutes from './modules/crm/crm.routes.js';
import scraperRoutes from './modules/scraper/scraper.routes.js';
import { startRadarCron } from './modules/ingestion/radar/cron.js';
import { seedJobsIfEmpty } from './scripts/seedJobs.js';

dotenv.config();

const app: Application = express();

app.use(cors());
app.use(express.json());

// ── Routes ──────────────────────────────────────────────
app.use('/api/jobs', jobRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/crm', crmRoutes);
app.use('/api/scraper', scraperRoutes);

// ── Health Check ─────────────────────────────────────────
app.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({ status: 'active', uptime: process.uptime(), message: 'CareerBridge API is live 🚀' });
});

// ── Admin: Manual Sweep Trigger ───────────────────────────
app.post('/api/admin/trigger-sweep', async (_req: Request, res: Response) => {
  res.json({ message: 'Radar sweep triggered. Check server logs for progress.' });
  try {
    const { fetchInternshipsFromGoogle } = await import('./modules/aggregator/aggregator.service.js');
    fetchInternshipsFromGoogle().catch(console.error);
  } catch (err: any) {
    console.error('Sweep trigger error:', err.message);
  }
});

// ── Admin: Manual Job Re-seed ─────────────────────────────
app.post('/api/admin/seed-jobs', async (_req: Request, res: Response) => {
  res.json({ message: 'Job seeding triggered. Check server logs.' });
  seedJobsIfEmpty().catch(console.error);
});

const PORT = process.env.PORT || 5000;
const BASE_URL = process.env.BASE_URL || `http://localhost:${PORT}`;

app.listen(PORT, async () => {
  console.log(`\n🚀 CareerBridge Server live on port ${PORT}`);

  // Verify DB
  try {
    await pool.query('SELECT 1');
    console.log('📦 Database connected.');
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    return;
  }

  // Auto-seed real jobs if DB is empty
  await seedJobsIfEmpty();

  // Start scheduled job ingestion crons
  startRadarCron();

  // ── Keep-Alive Self-Ping ──────────────────────────────
  // Prevents free-tier hosts (Render, Railway) from spinning down the server.
  // Pings /health every 14 minutes.
  if (process.env.NODE_ENV === 'production') {
    cron.schedule('*/14 * * * *', async () => {
      try {
        const res = await fetch(`${BASE_URL}/health`);
        console.log(`🏓 Keep-alive ping → ${res.status}`);
      } catch (err: any) {
        console.warn(`⚠️ Keep-alive ping failed: ${err.message}`);
      }
    });
    console.log(`🏓 Keep-alive cron active (pings ${BASE_URL}/health every 14 min)`);
  }
});