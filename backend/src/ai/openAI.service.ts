import OpenAI from './openAIStub';
import { z } from 'zod';
import { config } from '../config/env.config';
import { generateDemoResumeParse, generateDemoMatch } from './demo.ai';
import { logger } from '../utils/logger.util';

export const parsedResumeSchema = z.object({
  name: z.string(),
  email: z.string(),
  phone: z.string(),
  skills: z.array(z.string()),
  education: z.array(z.any()),
  experience: z.array(z.any()),
  projects: z.array(z.any()),
  certifications: z.array(z.string()),
  languages: z.array(z.string()),
  totalExperience: z.number(),
});

export const matchScoreSchema = z.object({
  overallScore: z.number(),
  matchingSkills: z.array(z.string()),
  missingSkills: z.array(z.string()),
  strengths: z.array(z.string()),
  weaknesses: z.array(z.string()),
  recommendation: z.string(),
});

export class AIService {
  private static openai = config.openaiApiKey
    ? new OpenAI({ apiKey: config.openaiApiKey })
    : null;

  static async parseResume(rawText: string) {
    if (config.demoMode || !this.openai) {
      logger.info('🤖 AI Service running in DEMO_MODE for resume parsing');
      return generateDemoResumeParse(rawText);
    }

    try {
      const prompt = `You are an expert HRTech AI Resume Parser. 
Extract structured information from the provided raw resume text into valid JSON matching this schema:
{
  "name": string,
  "email": string,
  "phone": string,
  "skills": string[],
  "education": Array<{ degree: string, institution: string, graduationYear: number }>,
  "experience": Array<{ title: string, company: string, duration: string, description: string }>,
  "projects": Array<{ name: string, description: string, techStack: string[] }>,
  "certifications": string[],
  "languages": string[],
  "totalExperience": number
}

IMPORTANT: Strictly output JSON only. Do not include markdown codeblocks or conversational text.

Resume Text:
${rawText}`;

      const response = await this.openai.chat.completions.create({
        model: 'gpt-4-turbo-preview',
        messages: [{ role: 'user', content: prompt }],
        response_format: { type: 'json_object' },
      });

      const content = response.choices[0].message.content || '{}';
      const parsed = JSON.parse(content);
      return parsedResumeSchema.parse(parsed);
    } catch (e) {
      logger.warn('AI Parsing failed or rate limited, falling back to realistic demo parsing:', e);
      return generateDemoResumeParse(rawText);
    }
  }

  static async matchResumeToJob(resumeText: string, jobTitle: string, jobRequirements: string[], jobSkills: string[]) {
    if (config.demoMode || !this.openai) {
      logger.info('🤖 AI Service running in DEMO_MODE for candidate job matching');
      return generateDemoMatch(jobTitle, jobSkills);
    }

    try {
      const prompt = `You are a fair, objective enterprise AI Talent Matcher.
EVALUATION RULES:
1. NEVER evaluate or consider protected characteristics (race, gender, age, religion, sexual orientation, disability).
2. Evaluate SOLELY based on technical skills, work experience, project relevance, and education.
3. Compute an objective match percentage score (0-100).

Compare the candidate resume against the job description below:

Job Title: ${jobTitle}
Job Skills Required: ${jobSkills.join(', ')}
Requirements: ${jobRequirements.join('; ')}

Candidate Resume Text:
${resumeText}

Output valid JSON matching:
{
  "overallScore": number (e.g. 88.5),
  "matchingSkills": string[],
  "missingSkills": string[],
  "strengths": string[],
  "weaknesses": string[],
  "recommendation": string
}`;

      const response = await this.openai.chat.completions.create({
        model: 'gpt-4-turbo-preview',
        messages: [{ role: 'user', content: prompt }],
        response_format: { type: 'json_object' },
      });

      const content = response.choices[0].message.content || '{}';
      const parsed = JSON.parse(content);
      return matchScoreSchema.parse(parsed);
    } catch (e) {
      logger.warn('AI Match calculation fallback to demo mode:', e);
      return generateDemoMatch(jobTitle, jobSkills);
    }
  }
}
