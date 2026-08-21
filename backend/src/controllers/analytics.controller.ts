import { Request, Response, NextFunction } from 'express';
import { AnalyticsService } from '../services/analytics.service';
import { sendResponse } from '../utils/response.util';
import { AuthRequest } from '../middleware/auth.middleware';

export const getRecruiterAnalytics = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const companyId = req.user?.role !== 'ADMIN' ? req.user?.companyId : undefined;
    const analytics = await AnalyticsService.getRecruiterAnalytics(companyId);
    return sendResponse(res, 200, 'Recruiter analytics metrics fetched', analytics);
  } catch (error) {
    next(error);
  }
};
