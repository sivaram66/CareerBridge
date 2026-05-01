import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
dotenv.config();

// 1. Initialize the Gemini Client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

// 2. The Sanitizer
const cleanJsonString = (rawString: string) => {
  return rawString
    .replace(new RegExp('```json', 'gi'), '')
    .replace(new RegExp('```', 'g'), '')
    .trim();
};

// 3. Helper: The Pause Button
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// 4. The Main Extractor Function with Exponential Backoff
export const extractJobDataWithAI = async (rawText: string) => {
  console.log('🧠 Booting up Gemini AI to parse raw text...');

  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

  const prompt = `
    You are an expert technical recruiter and data-extraction machine. 
    Analyze the following raw job description text and extract the key details.
    
    Return ONLY a valid JSON object with the following exact keys:
    - title (string: The job title)
    - company (string: The hiring company, if mentioned)
    - remote (boolean: true if it mentions remote, anywhere, or telecommute)
    - techStack (array of strings: List the programming languages, frameworks, or databases mentioned)
    - salary (string: The salary range if mentioned, otherwise return "Not Disclosed")

    Do not include any conversational text. Only return the JSON.

    RAW TEXT:
    "${rawText}"
  `;

  let attempts = 0;
  const maxRetries = 3;

  // 5. The Retry Loop
  while (attempts < maxRetries) {
    try {
      // Send it to Gemini
      const result = await model.generateContent(prompt);
      const responseText = result.response.text();
      
      // Clean and parse the JSON
      const cleanText = cleanJsonString(responseText);
      const parsedData = JSON.parse(cleanText);

      console.log('✨ Gemini Successfully Extracted Structured Data!');
      return parsedData;

    } catch (error: any) {
      attempts++;
      
      // If it is a 503 (Overloaded) and we still have retries left, wait and try again
      if (error.status === 503 && attempts < maxRetries) {
        const waitTime = attempts * 2000; // Wait 2s, then 4s...
        console.log(`⚠️ Google API overloaded (503). Retrying in ${waitTime / 1000} seconds... (Attempt ${attempts} of ${maxRetries})`);
        await sleep(waitTime);
      } else {
        // If it's a different error, or we ran out of retries, fail gracefully
        console.error('❌ Gemini Parser Failed permanently:', error.message || error);
        return null;
      }
    }
  }
};