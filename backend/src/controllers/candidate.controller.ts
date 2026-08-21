import { Request, Response, NextFunction } from 'express';
import { CandidateService } from '../services/candidate.service';
import { sendResponse } from '../utils/response.util';
import { AuthRequest } from '../middleware/auth.middleware';

export const getCandidates = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const user = req.user;
    const companyId = user?.role !== 'ADMIN' ? user?.companyId : undefined;
    const candidates = await CandidateService.getCandidates(companyId);
    return sendResponse(res, 200, 'Candidates fetched', candidates);
  } catch (error) {
    next(error);
  }
};

export const getMyProfile = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const candidate = await CandidateService.getCandidateByUserId(req.user!.id);
    return sendResponse(res, 200, 'Profile details fetched', candidate);
  } catch (error) {
    next(error);
  }
};

export const updateMyProfile = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const updated = await CandidateService.updateCandidateProfile(req.user!.id, req.body);
    return sendResponse(res, 200, 'Profile updated successfully', updated);
  } catch (error) {
    next(error);
  }
};
