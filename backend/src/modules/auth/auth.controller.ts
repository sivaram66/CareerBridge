import type { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import * as jwtPkg from 'jsonwebtoken';
const { sign } = jwtPkg;
import { db } from '../../config/db.js';
import { users, userProfiles } from '../../shared/schema.js';
import { eq } from 'drizzle-orm';
import { sendOTP } from '../../utils/email.js'; // Import our new utility

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key';

// Helper to generate 6 digit code
const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

// ==========================================
// 1. REGISTER (Now sends OTP, does NOT log in)
// ==========================================
export const register = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    const existingUser = await db.select().from(users).where(eq(users.email, email));
    if (existingUser.length > 0) {
      return res.status(409).json({ error: 'Email already in use' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const otpCode = generateOTP();
    
    // Set expiry to 10 minutes from now
    const otpExpiry = new Date();
    otpExpiry.setMinutes(otpExpiry.getMinutes() + 10);

    const [newUser] = await db.insert(users).values({
      email,
      passwordHash,
      otp: otpCode,
      otpExpiry: otpExpiry,
      isVerified: false // Explicitly unverified
    }).returning();

    await db.insert(userProfiles).values({ userId: newUser.id });

    // Send the email!
    await sendOTP(email, otpCode);

    // Notice: We do NOT send a token back yet. 
    res.status(201).json({ 
      message: 'Account created. Please verify your email.',
      requireOtp: true,
      email: newUser.email 
    });

  } catch (error: any) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

// ==========================================
// 2. VERIFY OTP (Issues the JWT)
// ==========================================
export const verifyOtp = async (req: Request, res: Response) => {
  try {
    const { email, otp } = req.body;

    const [user] = await db.select().from(users).where(eq(users.email, email));
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (user.isVerified) {
      return res.status(400).json({ error: 'User is already verified' });
    }

    if (user.otp !== otp) {
      return res.status(400).json({ error: 'Invalid OTP' });
    }

    // Check if time is past the expiry
    if (!user.otpExpiry || new Date() > user.otpExpiry) {
      return res.status(400).json({ error: 'OTP has expired. Please request a new one.' });
    }

    // Success! Clear the OTP and verify them
    await db.update(users)
      .set({ isVerified: true, otp: null, otpExpiry: null })
      .where(eq(users.id, user.id));

    // NOW we issue the token
    const token = sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });

    res.json({ message: 'Email verified successfully', token });

  } catch (error: any) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

// ==========================================
// 3. LOGIN (Updated to check isVerified)
// ==========================================
export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    const [user] = await db.select().from(users).where(eq(users.email, email));
    if (!user) return res.status(401).json({ error: 'Invalid email or password' });

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) return res.status(401).json({ error: 'Invalid email or password' });

    // THE GUARD RAIL
    if (!user.isVerified) {
      return res.status(403).json({ error: 'Please verify your email before logging in.', requireOtp: true });
    }

    const token = sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });

    res.json({ message: 'Login successful', token, user: { id: user.id, email: user.email } });

  } catch (error: any) {
    res.status(500).json({ error: 'Internal server error' });
  }
};