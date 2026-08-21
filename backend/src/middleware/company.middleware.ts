import { Response, NextFunction } from 'express';
import { AuthRequest } from './auth.middleware';
import { ApiError } from '../utils/apiError.util';
import { prisma } from '../config/prisma.config';

export const requireCompany = async (req: AuthRequest, res: Response, next: NextFunction) => {
  if (!req.user) {
    return next(ApiError.unauthorized('User context missing'));
  }

  // Admins bypass company requirement
  if (req.user.role === 'ADMIN') {
    return next();
  }

  // If user already has companyId in token
  if (req.user.companyId) {
    return next();
  }

  try {
    // Check DB for companyId
    const dbUser = await prisma.user.findUnique({ where: { id: req.user.id } });
    if (dbUser?.companyId) {
      req.user.companyId = dbUser.companyId;
      return next();
    }

    // Auto-assign to default company so operations never fail
    let defaultCompany = await prisma.company.findFirst();
    if (!defaultCompany) {
      defaultCompany = await prisma.company.create({
        data: {
          name: 'HireAI Platform',
          industry: 'Software & Technology',
          description: 'Enterprise AI Recruitment & ATS Platform',
          locations: ['San Francisco, CA', 'Remote'],
        },
      });
    }

    await prisma.user.update({
      where: { id: req.user.id },
      data: { companyId: defaultCompany.id },
    });

    req.user.companyId = defaultCompany.id;
    return next();
  } catch (err) {
    return next(err);
  }
};

export const isolateCompanyData = (resourceCompanyId: string) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(ApiError.unauthorized('User context missing'));
    }

    const user = req.user as any;

    if (user.role === 'ADMIN') {
      return next(); // Admins can access all company data
    }

    if (!user.companyId || user.companyId !== resourceCompanyId) {
      return next(
        ApiError.forbidden('Access forbidden: Cross-company data leakage prevented')
      );
    }

    next();
  };
};
