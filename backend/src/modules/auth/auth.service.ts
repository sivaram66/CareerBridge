import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { db } from '../../config/db.js';
import { users, userProfiles } from '../../shared/schema.js';
import { eq } from 'drizzle-orm';


export const registerUser = async (email: string, passwordRaw: string) => {
  const existingUser = await db.select().from(users).where(eq(users.email, email));
  if (existingUser.length > 0) {
    throw new Error('User already exists');
  }

  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(passwordRaw, salt);

  const newUser = await db.transaction(async (tx) => {
    const insertedUsers = await tx.insert(users).values({
      email,
      passwordHash,
    }).returning();

    const user = insertedUsers[0];
    
    if (!user) {
      throw new Error('Failed to insert user into database');
    }

    await tx.insert(userProfiles).values({
      userId: user.id,
    });

    return user;
  });

  const token = jwt.sign(
    { userId: newUser.id }, 
    process.env.JWT_SECRET as string, 
    { expiresIn: '7d' }
  );

  return { token, userId: newUser.id, email: newUser.email };
};


export const loginUser = async (email: string, passwordRaw: string) => {
  const existingUsers = await db.select().from(users).where(eq(users.email, email));
  const user = existingUsers[0];

  if (!user) {
    throw new Error('Invalid credentials');
  }

  const isMatch = await bcrypt.compare(passwordRaw, user.passwordHash);
  
  if (!isMatch) {
    throw new Error('Invalid credentials');
  }

  const token = jwt.sign(
    { userId: user.id }, 
    process.env.JWT_SECRET as string, 
    { expiresIn: '7d' }
  );

  return { token, userId: user.id, email: user.email };
};