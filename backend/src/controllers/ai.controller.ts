import { Request, Response, NextFunction } from 'express';
import { AIService } from '../ai/openAI.service';
import { sendResponse } from '../utils/response.util';

export const parseResume = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { rawText } = req.body;
    const result = await AIService.parseResume(rawText || 'Michael Vance Senior Full Stack Engineer React Node TypeScript');
    return sendResponse(res, 200, 'Resume parsed successfully', result);
  } catch (error) {
    next(error);
  }
};

export const matchCandidateToJob = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { resumeText, jobTitle, jobRequirements, jobSkills } = req.body;
    const result = await AIService.matchResumeToJob(
      resumeText || 'Senior Full Stack Engineer React Node',
      jobTitle || 'Senior Full Stack Engineer',
      jobRequirements || ['5+ years React', 'Node.js'],
      jobSkills || ['React', 'Node.js', 'TypeScript']
    );
    return sendResponse(res, 200, 'AI Match score calculated', result);
  } catch (error) {
    next(error);
  }
};
