import { prisma } from '../config/prisma.config';
import { mockStore } from '../config/mockStore';
import { ApiError } from '../utils/apiError.util';
import { ApplicationStage, UserRole } from '@prisma/client';

export class ApplicationService {
  static async applyForJob(candidateUserId: string, data: { jobId: string; coverLetter?: string; resumeId?: string }) {
    const candidate = await prisma.candidate.findUnique({
      where: { userId: candidateUserId },
      include: { resumes: true },
    });

    if (!candidate) {
      throw ApiError.badRequest('Candidate profile not found');
    }

    const existingApp = await prisma.application.findUnique({
      where: {
        jobId_candidateId: {
          jobId: data.jobId,
          candidateId: candidate.id,
        },
      },
    });

    if (existingApp) {
      throw ApiError.badRequest('You have already applied for this job');
    }

    let resumeId = data.resumeId;
    if (!resumeId && candidate.resumes.length > 0) {
      resumeId = candidate.resumes[0].id;
    }

    const application = await prisma.application.create({
      data: {
        jobId: data.jobId,
        candidateId: candidate.id,
        resumeId,
        coverLetter: data.coverLetter,
        stage: ApplicationStage.APPLIED,
        matchScore: Math.floor(Math.random() * 20) + 75,
      },
      include: {
        job: true,
        candidate: {
          include: { user: true },
        },
      },
    });

    await prisma.notification.create({
      data: {
        userId: candidateUserId,
        title: 'Application Submitted',
        message: `Your application for ${application.job.title} was received successfully.`,
        type: 'APPLICATION',
      },
    });

    return application;
  }

  static async getApplications(user: { id: string; role: string; companyId?: string }) {
    if (user.role === UserRole.CANDIDATE) {
      const candidate = await prisma.candidate.findUnique({ where: { userId: user.id } });
      if (!candidate) return [];

      return await prisma.application.findMany({
        where: { candidateId: candidate.id },
        include: {
          job: {
            include: { company: true },
          },
          interviews: true,
          offerLetters: true,
        },
        orderBy: { updatedAt: 'desc' },
      });
    }

    const whereClause = user.role !== 'ADMIN' && user.companyId ? {
      job: {
        companyId: user.companyId
      }
    } : {};

    return await prisma.application.findMany({
      where: whereClause,
      include: {
        job: true,
        candidate: {
          include: {
            user: { select: { name: true, email: true, avatar: true } },
            resumes: true,
          },
        },
        interviews: true,
        analyses: true,
      },
      orderBy: { updatedAt: 'desc' },
    });
  }

  static async updateStage(id: string, stage: ApplicationStage, updatedByUserId: string, companyId?: string) {
    const existing = await prisma.application.findUnique({
      where: { id },
      include: {
        job: true,
        candidate: { include: { user: true } },
      },
    });

    if (!existing) {
      throw ApiError.notFound('Application not found');
    }

    if (companyId && existing.job.companyId !== companyId) {
      throw ApiError.forbidden('Cannot update applications for jobs in other companies');
    }

    // Phase 8: State Machine Enforcement
    const validTransitions: Record<ApplicationStage, ApplicationStage[]> = {
      APPLIED: ['SCREENING', 'REJECTED'],
      SCREENING: ['SHORTLISTED', 'REJECTED'],
      SHORTLISTED: ['TECHNICAL_INTERVIEW', 'REJECTED'],
      TECHNICAL_INTERVIEW: ['HR_INTERVIEW', 'REJECTED'],
      HR_INTERVIEW: ['OFFER', 'REJECTED'],
      OFFER: ['HIRED', 'REJECTED'],
      HIRED: [],
      REJECTED: [],
    };

    const allowedNextStages = validTransitions[existing.stage] || [];
    
    if (!allowedNextStages.includes(stage) && existing.stage !== stage) {
      throw ApiError.badRequest(`Invalid state transition from ${existing.stage} to ${stage}`);
    }

    const application = await prisma.application.update({
      where: { id },
      data: { stage },
    });

    await prisma.activityLog.create({
      data: {
        userId: updatedByUserId,
        action: 'STAGE_CHANGE',
        entity: 'APPLICATION',
        entityId: id,
        metadata: { oldStage: existing.stage, newStage: stage },
      },
    });

    await prisma.notification.create({
      data: {
        userId: existing.candidate.userId,
        title: 'Application Status Updated',
        message: `Your application for ${existing.job.title} moved to ${stage.replace('_', ' ')}.`,
        type: 'STAGE_UPDATE',
      },
    });

    return application;
  }
}

