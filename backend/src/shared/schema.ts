import { pgTable, serial, varchar, text, boolean, integer, timestamp, decimal } from 'drizzle-orm/pg-core';

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
  experience: varchar('experience', { length: 100 }),
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

  // --- NEW OTP FIELDS ---
  isVerified: boolean('is_verified').default(false),
  otp: varchar('otp', { length: 6 }),
  otpExpiry: timestamp('otp_expiry'),
});

export const userProfiles = pgTable('user_profiles', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id).notNull(),
  
  // --- EXISTING FIELDS (Untouched to prevent breaking changes) ---
  fullName: varchar('full_name', { length: 255 }),
  headline: varchar('headline', { length: 255 }),
  experienceYears: integer('experience_years'),
  techStack: varchar('tech_stack', { length: 255 }).array(), 
  githubUrl: text('github_url'),  
  linkedinUrl: text('linkedin_url'),
  
  // --- NEW: LOCATION & CONTACT ---
  phone: varchar('phone', { length: 20 }),
  location: varchar('location', { length: 255 }), // e.g., "Bangalore, India"

  // --- NEW: EDUCATION ---
  college: varchar('college', { length: 255 }),
  degree: varchar('degree', { length: 255 }), // e.g., "B.Tech Computer Science"
  graduationYear: varchar('graduation_year', { length: 4 }),
  cgpa: decimal('cgpa', { precision: 4, scale: 2 }), // Supports values like 8.50
  
  // --- NEW: PROFESSIONAL INFO ---
  currentCompany: varchar('current_company', { length: 255 }),
  currentRole: varchar('current_role', { length: 255 }),
  
  // --- NEW: PREFERENCES (Using Postgres Arrays) ---
  preferredRoles: varchar('preferred_roles', { length: 255 }).array(), // e.g., ["Backend", "Fullstack"]
  preferredLocations: varchar('preferred_locations', { length: 255 }).array(), // e.g., ["Remote", "Pune"]
  
  // --- NEW: ADDITIONAL ASSETS ---
  resumeUrl: text('resume_url'), // Link to AWS S3, Supabase storage, or local upload
  portfolioUrl: text('portfolio_url'), 

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