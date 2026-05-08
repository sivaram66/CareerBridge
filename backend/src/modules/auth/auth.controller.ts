import type { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
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
// ==========================================
// 1. REGISTER (Upgraded to handle Ghost Accounts)
// ==========================================
export const register = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    const existingUser = await db.select().from(users).where(eq(users.email, email));
    
    const otpCode = generateOTP();
    const otpExpiry = new Date();
    otpExpiry.setMinutes(otpExpiry.getMinutes() + 10);
    const passwordHash = await bcrypt.hash(password, 10);

    // SCENARIO A: The email is already in the database
    if (existingUser.length > 0) {
      const user = existingUser[0];

      // If they are already verified, block them. They need to login.
      if (user.isVerified) {
        return res.status(409).json({ error: 'Email already in use. Please log in.' });
      }

      // If they are NOT verified (Ghost Account), just update their OTP and resend!
      await db.update(users)
        .set({ otp: otpCode, otpExpiry: otpExpiry, passwordHash: passwordHash })
        .where(eq(users.id, user.id));

      await sendOTP(email, otpCode);

      return res.status(200).json({ 
        message: 'New OTP sent to existing unverified account.',
        requireOtp: true,
        email: user.email 
      });
    }

    // SCENARIO B: Brand new user. Create the Ghost Account.
    const [newUser] = await db.insert(users).values({
      email,
      passwordHash,
      otp: otpCode,
      otpExpiry: otpExpiry,
      isVerified: false 
    }).returning();

    // Create their empty profile payload
    await db.insert(userProfiles).values({ userId: newUser.id });

    await sendOTP(email, otpCode);

    res.status(201).json({ 
      message: 'Account created. Please verify your email.',
      requireOtp: true,
      email: newUser.email 
    });

  } catch (error: any) {
    console.error("Register Error:", error);
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
    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });

    res.json({ message: 'Email verified successfully', token });

  } catch (error: any) {
    console.error("🔥 VERIFY OTP ERROR:", error);
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

    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });

    res.json({ message: 'Login successful', token, user: { id: user.id, email: user.email } });

  } catch (error: any) {
    res.status(500).json({ error: 'Internal server error' });
  }
};