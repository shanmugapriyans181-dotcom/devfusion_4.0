import { Response, NextFunction } from 'express';
import { NotificationService } from '../services/notification.service';
import { sendResponse } from '../utils/response.util';
import { AuthRequest } from '../middleware/auth.middleware';

export const getNotifications = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const notifications = await NotificationService.getUserNotifications(req.user!.id);
    return sendResponse(res, 200, 'Notifications fetched', notifications);
  } catch (error) {
    next(error);
  }
};

export const markRead = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    await NotificationService.markAsRead(req.params.id, req.user!.id);
    return sendResponse(res, 200, 'Notification marked as read');
  } catch (error) {
    next(error);
  }
};

export const markAllRead = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    await NotificationService.markAllAsRead(req.user!.id);
    return sendResponse(res, 200, 'All notifications marked as read');
  } catch (error) {
    next(error);
  }
};
