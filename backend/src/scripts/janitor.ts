import { pool } from '../config/db.js';

export async function cleanVault() {
  console.log('\n[JANITOR] 🧹 Waking up Database Janitor...');

  try {
    // 30-day soft delete: hides stale jobs from the feed without losing data
    const softDeleteQuery = `
      UPDATE jobs 
      SET is_active = false, is_featured = false
      WHERE created_at < NOW() - INTERVAL '30 days'
      AND is_active = true;
    `;
    const softResult = await pool.query(softDeleteQuery);
    console.log(`[JANITOR] 📦 Soft Archived: ${softResult.rowCount} jobs older than 30 days.`);

    // 45-day hard delete: frees up Neon storage (500 MB free tier limit)
    const hardDeleteQuery = `
      DELETE FROM jobs 
      WHERE created_at < NOW() - INTERVAL '45 days';
    `;
    const hardResult = await pool.query(hardDeleteQuery);
    console.log(`[JANITOR] 🗑️ Hard Deleted: Destroyed ${hardResult.rowCount} jobs older than 45 days.`);

    console.log('[JANITOR] ✨ Vault is clean and optimized. Going back to sleep.\n');

  } catch (error: any) {
    console.error('[JANITOR] ❌ Failed to clean database:', error.message);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  cleanVault().then(() => process.exit(0));
}