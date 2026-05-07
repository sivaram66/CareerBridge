import { pgTable, serial, varchar, text, boolean, timestamp, integer } from 'drizzle-orm/pg-core';

export const jobs = pgTable('jobs', {
  id: serial('id').primaryKey(),
  
  // The unique ID from Greenhouse/Lever to prevent duplicate inserts
  externalJobId: varchar('external_job_id', { length: 255 }).unique().notNull(), 
  
  companyName: varchar('company_name', { length: 255 }).notNull(),
  title: varchar('title', { length: 255 }).notNull(),
  department: varchar('department', { length: 255 }), 
  location: varchar('location', { length: 255 }),     
  
  isRemote: boolean('is_remote').default(false).notNull(),
  country: varchar('country', { length: 100 }),
  city: varchar('city', { length: 100 }),
  description: text('description'),
  applyUrl: text('apply_url').notNull(),
  
  // --- NEW: PREMIUM UI FIELDS ---
  salaryRange: varchar('salary_range', { length: 100 }),
  logoUrl: text('logo_url'),
  fresherOk: boolean('fresher_ok').default(false).notNull(),
  isFeatured: boolean('is_featured').default(false).notNull(),
  
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
});

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  passwordHash: varchar('password_hash', { length: 255 }).notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

export const userProfiles = pgTable('user_profiles', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id).notNull(),
  fullName: varchar('full_name', { length: 255 }),
  headline: varchar('headline', { length: 255 }),
  experienceYears: integer('experience_years'),
  techStack: varchar('tech_stack', { length: 255 }).array(), 
  githubUrl: text('github_url'),  
  linkedinUrl: text('linkedin_url'),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const jobApplications = pgTable('job_applications', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id).notNull(),
  jobId: integer('job_id').references(() => jobs.id).notNull(),
  status: varchar('status', { length: 50 }).default('saved').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const targetCompanies = pgTable('target_companies', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  atsProvider: varchar('ats_provider', { length: 50 }).notNull(),
  boardToken: varchar('board_token', { length: 255 }).notNull().unique(),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
});