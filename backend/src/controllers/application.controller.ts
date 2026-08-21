import { Response, NextFunction } from 'express';
import { ApplicationService } from '../services/application.service';
import { sendResponse } from '../utils/response.util';
import { AuthRequest } from '../middleware/auth.middleware';
import { ApplicationStage } from '@prisma/client';

export const applyForJob = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const app = await ApplicationService.applyForJob(req.user!.id, req.body);
    return sendResponse(res, 201, 'Application submitted successfully', app);
  } catch (error) {
    next(error);
  }
};

export const getApplications = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const apps = await ApplicationService.getApplications(req.user!);
    return sendResponse(res, 200, 'Applications fetched', apps);
  } catch (error) {
    next(error);
  }
};

export const updateStage = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { stage } = req.body;
    const app = await ApplicationService.updateStage(
      req.params.id, 
      stage as ApplicationStage, 
      req.user!.id,
      req.user!.role !== 'ADMIN' ? req.user!.companyId : undefined
    );
    return sendResponse(res, 200, 'Application stage updated', app);
  } catch (error) {
    next(error);
  }
};
