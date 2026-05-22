import { GoogleGenerativeAI, SchemaType } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string);

export const analyzeJobMatch = async (jobTitle: string, jobCompany: string, jobDescription: string, userProfile: string) => {
  const schema = {
    type: SchemaType.OBJECT as const,
    properties: {
      summary: {
        type: SchemaType.STRING as const,
        description: "A 2-3 sentence summary explaining exactly what the candidate will work on."
      },
      techStack: {
        type: SchemaType.ARRAY as const,
        items: { type: SchemaType.STRING as const },
        description: "List of exactly which technologies are required."
      },
      experience: {
        type: SchemaType.STRING as const,
        description: "Years of experience required. e.g. 'Fresher', '0-1 Years', '3+ Years', or 'Not specified'"
      },
      salary: {
        type: SchemaType.STRING as const,
        description: "Salary range if explicitly mentioned, otherwise 'Not Disclosed'"
      },
      matchScore: {
        type: SchemaType.INTEGER as const,
        description: "A score from 0-100 calculating how well the candidate's profile matches this specific job."
      },
      matchReason: {
        type: SchemaType.STRING as const,
        description: "A short, encouraging 1-sentence explanation of why they got this score."
      }
    },
    required: ["summary", "techStack", "experience", "salary", "matchScore", "matchReason"]
  };

  const model = genAI.getGenerativeModel({ 
    model: 'gemini-2.5-flash',
    generationConfig: { 
      responseMimeType: 'application/json',
      responseSchema: schema 
    }
  });

  const prompt = `
    You are an expert technical recruiter. Analyze this job description:
    Title: ${jobTitle}
    Company: ${jobCompany}
    Description: ${jobDescription}
    
    The candidate applying has the following profile/skills: 
    "${userProfile}"
    
    Extract the job details and calculate an honest Match Score (0-100) based on how their profile aligns with the job requirements.
  `;

  try {
    const result = await model.generateContent(prompt);
    return JSON.parse(result.response.text());
  } catch (error) {
    console.error('AI Match Error:', error);
    throw new Error('Failed to calculate match score');
  }
};