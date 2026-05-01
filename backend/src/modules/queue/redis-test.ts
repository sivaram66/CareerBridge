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
    // 1. Write a test message to the Redis database
    await redis.set('radar_status', 'Redis Queue is fully operational!');
    
    // 2. Read the message back
    const result = await redis.get('radar_status');
    
    console.log('✅ Connection Success!');
    console.log(`Message from Redis: ${result}`);
    
    // 3. Close the connection gracefully
    redis.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ Connection Failed. Check your URL:', error);
    process.exit(1);
  }
}

testConnection();