import { Request, Response } from 'express';
import { sendResponse } from '../utils/response.util';

export const checkHealth = async (req: Request, res: Response) => {
  return sendResponse(res, 200, 'HireAI ATS API Service is healthy', {
    status: 'UP',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    version: '1.0.0',
  });
};
