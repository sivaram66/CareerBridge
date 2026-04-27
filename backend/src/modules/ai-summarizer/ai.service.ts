import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string);

export const summarizeJobDescription = async (companyName: string, applyUrl: string, rawText: string) => {
  // We use the fast, cost-effective model for text processing
  const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

  const prompt = `
    You are a data extraction assistant for a tech job board. 
    Analyze the following raw text from a job posting. 
    Extract the core details and return them STRICTLY as a valid JSON object. Do not include markdown formatting like \`\`\`json.
    
    Required JSON structure:
    {
      "companyName": "${companyName}",
      "title": "The exact job title",
      "description": "A punchy, 3-bullet-point summary of the role and tech stack",
      "salaryRange": "The salary range if mentioned, otherwise 'Not Disclosed'",
      "applyUrl": "${applyUrl}"
    }

    Raw Job Text:
    ${rawText}
  `;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Clean the string in case the AI wraps it in markdown blocks
    const cleanedText = text.replace(/```json/g, '').replace(/```/g, '').trim();
    
    return JSON.parse(cleanedText);
  } catch (error) {
    console.error('AI Processing Error:', error);
    throw new Error('Failed to summarize job description');
  }
};


export const calculateMatchScore = async (userStack: string[], jobDescription: string) => {
  const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

  const prompt = `
    You are a senior technical recruiter. 
    Compare the candidate's exact tech stack against the requirements in the job description.
    Return STRICTLY a valid JSON object. Do not include markdown formatting like \`\`\`json.
    
    Required JSON structure:
    {
      "matchPercentage": Number (0 to 100),
      "reason": "A punchy, 1-sentence explanation of why it is or isn't a good match."
    }

    Candidate Stack: ${userStack.join(', ')}
    Job Description: ${jobDescription}
  `;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Clean markdown blocks just in case Gemini gets chatty
    const cleanedText = text.replace(/```json/g, '').replace(/```/g, '').trim();
    
    return JSON.parse(cleanedText);
  } catch (error) {
    console.error('AI Match Error:', error);
    throw new Error('Failed to calculate match score');
  }
};