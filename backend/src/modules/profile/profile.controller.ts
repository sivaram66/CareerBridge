import express, {type Response } from 'express';
import { db } from '../../config/db.js';
import { userProfiles, users } from '../../shared/schema.js';
import { eq } from 'drizzle-orm';
import type { AuthRequest } from '../../middleware/auth.middleware.js';

// ==========================================
// 1. GET CURRENT USER'S PROFILE
// ==========================================
export const getMyProfile = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    // Fetch the profile
    const [profile] = await db.select().from(userProfiles).where(eq(userProfiles.userId, userId));
    
    // Fetch the email from the users table to bundle it together
    const [userRecord] = await db.select({ email: users.email }).from(users).where(eq(users.id, userId));

    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    // Bundle them securely (never send back the password hash!)
    res.json({
      ...profile,
      email: userRecord?.email
    });

  } catch (error: any) {
    console.error("Get Profile Error:", error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// ==========================================
// 2. UPDATE CURRENT USER'S PROFILE
// ==========================================
export const updateMyProfile = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    // Destructure the massive payload we expect from the React Onboarding form
    const {
      fullName, headline, experienceYears, techStack, githubUrl, linkedinUrl,
      phone, location, college, degree, graduationYear, cgpa,
      currentCompany, currentRole, preferredRoles, preferredLocations,
      resumeUrl, portfolioUrl
    } = req.body;

    // Execute the update in Drizzle
    const [updatedProfile] = await db.update(userProfiles)
      .set({
        fullName, headline, experienceYears, techStack, githubUrl, linkedinUrl,
        phone, location, college, degree, graduationYear, cgpa,
        currentCompany, currentRole, preferredRoles, preferredLocations,
        resumeUrl, portfolioUrl,
        updatedAt: new Date(), 
      })
      .where(eq(userProfiles.userId, userId))
      .returning();

    res.json({ 
      message: 'Profile updated successfully', 
      profile: updatedProfile 
    });

  } catch (error: any) {
    console.error("Update Profile Error:", error);
    res.status(500).json({ error: 'Internal server error' });
  }
};