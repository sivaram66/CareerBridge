import { db } from '../../config/db.js';
import { userProfiles } from '../../shared/schema.js';
import { eq } from 'drizzle-orm';

export const updateProfile = async (
  userId: number, 
  profileData: {
    fullName?: string;
    headline?: string;
    experienceYears?: number;
    techStack?: string[];
    githubUrl?: string;
    linkedinUrl?: string;
  }
) => {
  // Update the row where the userId matches the token's ID
  const updatedProfile = await db.update(userProfiles)
    .set({
      ...profileData,
      updatedAt: new Date()
    })
    .where(eq(userProfiles.userId, userId))
    .returning();

  if (!updatedProfile[0]) {
    throw new Error('Profile not found');
  }

  return updatedProfile[0];
};