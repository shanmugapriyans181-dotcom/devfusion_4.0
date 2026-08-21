import { Response, NextFunction } from 'express';
import { AdminService } from '../services/admin.service';
import { sendResponse } from '../utils/response.util';
import { AuthRequest } from '../middleware/auth.middleware';
import { UserRole } from '@prisma/client';

export const getUsers = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const users = await AdminService.getUsers();
    return sendResponse(res, 200, 'System users fetched', users);
  } catch (error) {
    next(error);
  }
};

export const updateUserRole = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { role } = req.body;
    const user = await AdminService.updateUserRole(req.params.id, role as UserRole, req.user!.id);
    return sendResponse(res, 200, `User role updated to ${role}`, user);
  } catch (error) {
    next(error);
  }
};

export const getAuditLogs = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const logs = await AdminService.getAuditLogs();
    return sendResponse(res, 200, 'Audit logs fetched', logs);
  } catch (error) {
    next(error);
  }
};

export const getSystemOverview = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const overview = await AdminService.getSystemOverview();
    return sendResponse(res, 200, 'System overview fetched', overview);
  } catch (error) {
    next(error);
  }
};

export const clearAllData = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    await AdminService.clearAllData();
    return sendResponse(res, 200, 'All demo data cleared successfully', null);
  } catch (error) {
    next(error);
  }
};

