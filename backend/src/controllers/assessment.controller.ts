import { Request, Response, NextFunction } from 'express';
import { AssessmentService } from '../services/assessment.service';
import { sendResponse } from '../utils/response.util';
import { AuthRequest } from '../middleware/auth.middleware';

export const getAssessments = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const assessments = await AssessmentService.getAssessments();
    return sendResponse(res, 200, 'Coding assessments fetched', assessments);
  } catch (error) {
    next(error);
  }
};

export const getAssessmentById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const assessment = await AssessmentService.getAssessmentById(req.params.id);
    return sendResponse(res, 200, 'Assessment details fetched', assessment);
  } catch (error) {
    next(error);
  }
};

export const submitAssessment = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const attempt = await AssessmentService.submitAssessmentAttempt(
      req.user!.id,
      req.params.id,
      req.body.answers || []
    );
    return sendResponse(res, 201, 'Assessment submitted successfully', attempt);
  } catch (error) {
    next(error);
  }
};
