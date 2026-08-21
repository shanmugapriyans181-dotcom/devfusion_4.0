import { Response, NextFunction } from 'express';
import { OfferService } from '../services/offer.service';
import { sendResponse } from '../utils/response.util';
import { AuthRequest } from '../middleware/auth.middleware';
import { OfferStatus } from '@prisma/client';

export const createOffer = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const offer = await OfferService.createOffer({
      ...req.body,
      creatorRole: req.user?.role,
    });
    return sendResponse(res, 201, 'Offer letter created successfully', offer);
  } catch (error) {
    next(error);
  }
};

export const getOffers = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const offers = await OfferService.getOffers(req.user!);
    return sendResponse(res, 200, 'Offer letters fetched', offers);
  } catch (error) {
    next(error);
  }
};

export const approveOffer = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const recruiterName = req.user?.name || 'Recruiter';
    const offer = await OfferService.approveAndSendOffer(req.params.id, recruiterName);
    return sendResponse(res, 200, 'Offer letter approved and dispatched to candidate', offer);
  } catch (error) {
    next(error);
  }
};

export const updateOfferStatus = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { status } = req.body;
    const offer = await OfferService.updateOfferStatus(req.params.id, status as OfferStatus);
    return sendResponse(res, 200, `Offer status updated to ${status}`, offer);
  } catch (error) {
    next(error);
  }
};
