import type { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { db } from '../../config/db.js';
import { users, userProfiles } from '../../shared/schema.js';np
import { eq } from 'drizzle-orm';
import { sendOTP } from '../../utils/email.js';



const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

// Register handles both new signups and re-verification of unverified ("ghost") accounts
export const register = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    const existingUser = await db.select().from(users).where(eq(users.email, email));
    
    const otpCode = generateOTP();
    const otpExpiry = new Date();
    otpExpiry.setMinutes(otpExpiry.getMinutes() + 10);
    const passwordHash = await bcrypt.hash(password, 10);

    if (existingUser.length > 0) {
      const user = existingUser[0]!;

      if (user.isVerified) {
        return res.status(409).json({ error: 'Email already in use. Please log in.' });
      }

      // Unverified ghost account — update credentials and resend OTP
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

    const [newUser] = await db.insert(users).values({
      email,
      passwordHash,
      otp: otpCode,
      otpExpiry: otpExpiry,
      isVerified: false
    }).returning();

    if (!newUser) throw new Error('Failed to create user');

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

    if (!user.otpExpiry || new Date() > user.otpExpiry) {
      return res.status(400).json({ error: 'OTP has expired. Please request a new one.' });
    }

    await db.update(users)
      .set({ isVerified: true, otp: null, otpExpiry: null })
      .where(eq(users.id, user.id));

    const jwtSecret = process.env.JWT_SECRET || 'super-secret-key';
    const token = jwt.sign({ userId: user.id }, jwtSecret, { expiresIn: '7d' });

    res.json({ message: 'Email verified successfully', token });

  } catch (error: any) {
    console.error("🔥 VERIFY OTP ERROR:", error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    const [user] = await db.select().from(users).where(eq(users.email, email));
    if (!user) return res.status(401).json({ error: 'Invalid email or password' });

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) return res.status(401).json({ error: 'Invalid email or password' });

    if (!user.isVerified) {
      return res.status(403).json({ error: 'Please verify your email before logging in.', requireOtp: true });
    }

    const jwtSecret = process.env.JWT_SECRET || 'super-secret-key';
    const token = jwt.sign({ userId: user.id }, jwtSecret, { expiresIn: '7d' });

    res.json({ message: 'Login successful', token, user: { id: user.id, email: user.email } });

  } catch (error: any) {
    res.status(500).json({ error: 'Internal server error' });
  }
};