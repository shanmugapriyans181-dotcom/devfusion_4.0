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

export const assignScreening = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const app = await ApplicationService.assignScreening(req.params.id, req.body, req.user!.id);
    return sendResponse(res, 200, 'Screening test assigned to candidate', app);
  } catch (error) {
    next(error);
  }
};

export const submitScreeningScore = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const app = await ApplicationService.submitScreeningScore(req.params.id, req.body, req.user!.id);
    return sendResponse(res, 200, 'Screening test score recorded', app);
  } catch (error) {
    next(error);
  }
};

export const requestInterviewer = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const result = await ApplicationService.requestInterviewer(req.params.id, req.body, req.user!.id);
    return sendResponse(res, 200, 'Interviewer request dispatched', result);
  } catch (error) {
    next(error);
  }
};

export const sendReportToManager = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const app = await ApplicationService.sendReportToManager(req.params.id, req.body, req.user!.id);
    return sendResponse(res, 200, 'Report submitted to Hiring Manager for final decision', app);
  } catch (error) {
    next(error);
  }
};
