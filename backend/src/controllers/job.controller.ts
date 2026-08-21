import { Request, Response, NextFunction } from 'express';
import { JobService } from '../services/job.service';
import { sendResponse } from '../utils/response.util';
import { AuthRequest } from '../middleware/auth.middleware';

export const getJobs = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const user = req.user;
    const companyId = user?.role !== 'ADMIN' && user?.role !== 'CANDIDATE' ? user?.companyId : undefined;
    const query = { ...req.query, companyId };
    
    const jobs = await JobService.getJobs(query);
    return sendResponse(res, 200, 'Jobs fetched successfully', jobs);
  } catch (error) {
    next(error);
  }
};

export const getJobById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const job = await JobService.getJobById(req.params.id);
    return sendResponse(res, 200, 'Job details fetched', job);
  } catch (error) {
    next(error);
  }
};

export const createJob = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const companyId = req.user!.role !== 'ADMIN' ? req.user!.companyId : undefined;
    const job = await JobService.createJob(req.body, req.user!.id, companyId);
    return sendResponse(res, 201, 'Job posting created successfully', job);
  } catch (error) {
    next(error);
  }
};

export const updateJob = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const job = await JobService.updateJob(req.params.id, req.body);
    return sendResponse(res, 200, 'Job posting updated', job);
  } catch (error) {
    next(error);
  }
};

export const closeJob = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const job = await JobService.closeJob(req.params.id);
    return sendResponse(res, 200, 'Job posting closed', job);
  } catch (error) {
    next(error);
  }
};

export const duplicateJob = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const job = await JobService.duplicateJob(req.params.id, req.user!.id);
    return sendResponse(res, 201, 'Job posting cloned', job);
  } catch (error) {
    next(error);
  }
};

export const approveJob = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const recruiterName = req.user?.name || 'Recruiter';
    const job = await JobService.approveJob(req.params.id, recruiterName);
    return sendResponse(res, 200, 'Job approved and published successfully', job);
  } catch (error) {
    next(error);
  }
};

export const deleteJob = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    await JobService.deleteJob(req.params.id);
    return sendResponse(res, 200, 'Job posting deleted');
  } catch (error) {
    next(error);
  }
};
