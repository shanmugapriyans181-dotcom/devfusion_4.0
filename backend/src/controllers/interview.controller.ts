import { Response, NextFunction } from 'express';
import { InterviewService } from '../services/interview.service';
import { sendResponse } from '../utils/response.util';
import { AuthRequest } from '../middleware/auth.middleware';

export const scheduleInterview = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const interview = await InterviewService.scheduleInterview({
      ...req.body,
      interviewerId: req.body.interviewerId || req.user!.id,
    });
    return sendResponse(res, 201, 'Interview scheduled successfully', interview);
  } catch (error) {
    next(error);
  }
};

export const getInterviewers = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const interviewers = await InterviewService.getInterviewers(req.user!);
    return sendResponse(res, 200, 'Interviewers fetched successfully', interviewers);
  } catch (error) {
    next(error);
  }
};

export const getInterviews = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const interviews = await InterviewService.getInterviews(req.user!);
    return sendResponse(res, 200, 'Interviews fetched successfully', interviews);
  } catch (error) {
    next(error);
  }
};

export const submitFeedback = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const feedback = await InterviewService.submitFeedback({
      ...req.body,
      interviewId: req.params.id,
      interviewerId: req.user!.id,
    });
    return sendResponse(res, 201, 'Interview feedback submitted', feedback);
  } catch (error) {
    next(error);
  }
};
