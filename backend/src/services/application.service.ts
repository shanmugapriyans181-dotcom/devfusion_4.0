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

    const application = await prisma.application.update({
      where: { id },
      data: { stage },
      include: {
        job: true,
        candidate: { include: { user: true } },
        interviews: true,
        offerLetters: true,
      },
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
        message: `Your application for ${existing.job.title} is now in stage: ${stage.replace(/_/g, ' ')}.`,
        type: 'STAGE_UPDATE',
      },
    });

    return application;
  }

  static async assignScreening(id: string, data: { testTitle: string; testUrl: string; duration?: number; instructions?: string }, userId: string) {
    const existing = await prisma.application.findUnique({
      where: { id },
      include: { job: true, candidate: { include: { user: true } } },
    });

    if (!existing) throw ApiError.notFound('Application not found');

    const notePayload = {
      testTitle: data.testTitle || 'Technical Coding Assessment',
      testUrl: data.testUrl || 'https://www.hackerrank.com/test/mock-screening',
      duration: data.duration || 60,
      instructions: data.instructions || 'Please complete this test to qualify for the live technical interview round.',
      assignedAt: new Date().toISOString(),
    };

    const application = await prisma.application.update({
      where: { id },
      data: {
        stage: ApplicationStage.SCREENING,
        notes: JSON.stringify(notePayload),
      },
      include: { job: true, candidate: { include: { user: true } } },
    });

    await prisma.notification.create({
      data: {
        userId: existing.candidate.userId,
        title: 'Screening Test Assigned',
        message: `You have been assigned a screening assessment for ${existing.job.title}: ${notePayload.testTitle}. Link: ${notePayload.testUrl}`,
        type: 'SCREENING',
      },
    });

    return application;
  }

  static async submitScreeningScore(id: string, data: { score: number; submissionNotes?: string }, userId: string) {
    const existing = await prisma.application.findUnique({
      where: { id },
      include: { job: true, candidate: { include: { user: true } } },
    });

    if (!existing) throw ApiError.notFound('Application not found');

    let currentNotes: any = {};
    try {
      if (existing.notes) currentNotes = JSON.parse(existing.notes);
    } catch (e) {}

    currentNotes.screeningScore = data.score;
    currentNotes.submittedAt = new Date().toISOString();
    currentNotes.candidateNotes = data.submissionNotes || '';

    const newStage = data.score >= 60 ? ApplicationStage.SHORTLISTED : ApplicationStage.REJECTED;

    const application = await prisma.application.update({
      where: { id },
      data: {
        stage: newStage,
        notes: JSON.stringify(currentNotes),
      },
      include: { job: true, candidate: { include: { user: true } } },
    });

    // Notify Recruiters
    const recruiters = await prisma.user.findMany({
      where: { role: { in: ['RECRUITER', 'ADMIN'] } },
    });

    for (const rec of recruiters) {
      await prisma.notification.create({
        data: {
          userId: rec.id,
          title: 'Candidate Screening Test Submitted',
          message: `${existing.candidate.user.name} scored ${data.score}% on the screening round for ${existing.job.title}.`,
          type: 'SCREENING',
        },
      });
    }

    return application;
  }

  static async requestInterviewer(id: string, data: { interviewerId: string; meetingUrl?: string; scheduledAt?: string; duration?: number }, userId: string) {
    const existing = await prisma.application.findUnique({
      where: { id },
      include: { job: true, candidate: { include: { user: true } } },
    });

    if (!existing) throw ApiError.notFound('Application not found');

    // Create interview record
    const interview = await prisma.interview.create({
      data: {
        applicationId: id,
        title: `Technical Video Interview with ${existing.candidate.user.name}`,
        type: 'Online Video Interview',
        scheduledAt: data.scheduledAt ? new Date(data.scheduledAt) : new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
        duration: data.duration || 45,
        meetingUrl: data.meetingUrl || 'https://meet.google.com/devfusion-live',
        participants: {
          create: {
            userId: data.interviewerId,
          },
        },
      },
    });

    const application = await prisma.application.update({
      where: { id },
      data: { stage: ApplicationStage.TECHNICAL_INTERVIEW },
      include: { job: true, candidate: { include: { user: true } }, interviews: true },
    });

    // Notify Interviewer
    await prisma.notification.create({
      data: {
        userId: data.interviewerId,
        title: 'New Interview Session Assigned',
        message: `You have been requested to conduct an online technical interview for candidate ${existing.candidate.user.name} (${existing.job.title}).`,
        type: 'INTERVIEW',
      },
    });

    // Notify Candidate
    await prisma.notification.create({
      data: {
        userId: existing.candidate.userId,
        title: 'Interview Scheduled!',
        message: `Your technical interview for ${existing.job.title} has been arranged. Please check your interview schedule.`,
        type: 'INTERVIEW',
      },
    });

    return { application, interview };
  }

  static async sendReportToManager(id: string, data: { reportSummary?: string }, userId: string) {
    const existing = await prisma.application.findUnique({
      where: { id },
      include: { job: true, candidate: { include: { user: true } }, interviews: { include: { feedbacks: true } } },
    });

    if (!existing) throw ApiError.notFound('Application not found');

    const application = await prisma.application.update({
      where: { id },
      data: { stage: ApplicationStage.OFFER },
      include: { job: true, candidate: { include: { user: true } }, interviews: true },
    });

    // Notify Hiring Managers
    const managers = await prisma.user.findMany({
      where: { role: { in: ['HIRING_MANAGER', 'ADMIN'] } },
    });

    for (const mgr of managers) {
      await prisma.notification.create({
        data: {
          userId: mgr.id,
          title: 'Candidate Interview Report Ready for Decision',
          message: `Recruiter submitted interview report for ${existing.candidate.user.name} (${existing.job.title}). Please review and issue offer.`,
          type: 'OFFER',
        },
      });
    }

    return application;
  }
}

