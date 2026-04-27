import type { Response } from 'express';
import type { AuthRequest } from '../../shared/middleware/auth.middleware.js';
import * as profileService from './profile.service.js';

export const updateProfileHandler = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    // req.user exists because our auth middleware checked the token first!
    const userId = req.user?.userId;

    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    // Pass the userId and the body payload to the service
    const updatedProfile = await profileService.updateProfile(userId, req.body);
    
    res.status(200).json({ message: 'Profile updated successfully', profile: updatedProfile });
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
};