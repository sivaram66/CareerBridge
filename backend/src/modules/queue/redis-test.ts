import { Redis } from 'ioredis';
import dotenv from 'dotenv';
dotenv.config();
const REDIS_URL = process.env.REDIS_URL as string;

if (!REDIS_URL) {
  throw new Error(' REDIS_URL not found in .env');
}

const redis = new Redis(REDIS_URL);

async function testConnection() {
  console.log('🔌 Attempting to connect to Redis...');
  
  try {
    await redis.set('radar_status', 'Redis Queue is fully operational!');
    const result = await redis.get('radar_status');
    
    console.log('✅ Connection Success!');
    console.log(`Message from Redis: ${result}`);
    
    redis.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ Connection Failed. Check your URL:', error);
    process.exit(1);
  }
}

testConnection();