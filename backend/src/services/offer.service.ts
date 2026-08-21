import { prisma } from '../config/prisma.config';
import { mockStore } from '../config/mockStore';
import { ApiError } from '../utils/apiError.util';
import { OfferStatus, UserRole } from '@prisma/client';
import { EmailService } from './email.service';

export class OfferService {
  static async createOffer(data: {
    applicationId: string;
    candidateName: string;
    position: string;
    salary: number;
    joiningDate: string;
    location: string;
    benefits?: string[];
    creatorRole?: string;
  }) {
    // If created by HIRING_MANAGER, initial status is PENDING_RECRUITER_APPROVAL
    // If created by RECRUITER or ADMIN, status can be SENT or PENDING_RECRUITER_APPROVAL
    const initialStatus = data.creatorRole === UserRole.RECRUITER 
      ? OfferStatus.SENT 
      : ('PENDING_RECRUITER_APPROVAL' as OfferStatus);

    const offer = await prisma.offerLetter.create({
      data: {
        applicationId: data.applicationId,
        candidateName: data.candidateName,
        position: data.position,
        salary: Number(data.salary),
        joiningDate: new Date(data.joiningDate),
        location: data.location,
        benefits: data.benefits || [
          'Comprehensive Health & Dental Coverage',
          '401(k) Matching up to 5%',
          'Unlimited Paid Time Off',
        ],
        status: initialStatus,
        pdfUrl: 'https://hireai-storage.example.com/offers/offer_letter.pdf',
      },
    });

    await prisma.auditLog.create({
      data: {
        userId: data.creatorRole || 'SYSTEM',
        action: 'OFFER_CREATED',
        entity: 'OFFER',
        entityId: offer.id,
        metadata: { candidateName: data.candidateName, position: data.position },
      },
    });

    return offer;
  }

  static async getOffers(user: { id: string; role: string; companyId?: string }) {
    if (user.role === UserRole.CANDIDATE) {
      const candidate = await prisma.candidate.findUnique({ where: { userId: user.id } });
      if (!candidate) return [];

      return await prisma.offerLetter.findMany({
        where: {
          application: { candidateId: candidate.id },
          // Candidates should only see SENT, ACCEPTED, or REJECTED offers
          status: { in: [OfferStatus.SENT, OfferStatus.ACCEPTED, OfferStatus.REJECTED] },
        },
        include: {
          application: { include: { job: true } },
        },
        orderBy: { createdAt: 'desc' },
      });
    }

    const whereClause = user.role !== 'ADMIN' && user.companyId ? {
      application: {
        job: { companyId: user.companyId }
      }
    } : {};

    return await prisma.offerLetter.findMany({
      where: whereClause,
      include: {
        application: {
          include: { job: true, candidate: { include: { user: true } } },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  static async approveAndSendOffer(id: string, recruiterName: string = 'Recruiter') {
    const updatedOffer = await this.updateOfferStatus(id, OfferStatus.SENT);

    const offerDetails = await prisma.offerLetter.findUnique({
      where: { id },
      include: {
        application: {
          include: {
            candidate: { include: { user: true } },
            job: { include: { company: true } },
          },
        },
      },
    });

    const toEmail = offerDetails?.application.candidate.user.email || 'candidate@example.com';
    const companyName = offerDetails?.application.job.company.name || 'Company Name';
    const candName = offerDetails?.application.candidate.user.name || updatedOffer.candidateName;

    // Send email notification to candidate
    await EmailService.sendEmail({
      to: toEmail,
      subject: `Official Job Offer Letter - ${updatedOffer.position || companyName}`,
      template: 'OFFER_LETTER_SENT',
      data: {
        candidateName: candName,
        position: updatedOffer.position,
        salary: updatedOffer.salary,
        joiningDate: updatedOffer.joiningDate,
        location: updatedOffer.location,
        recruiterName,
      },
    });

    return updatedOffer;
  }

  static async updateOfferStatus(id: string, status: OfferStatus) {
    const offer = await prisma.offerLetter.update({
      where: { id },
      data: { status },
    });

    return offer;
  }
}
