import { prisma } from '../config/prisma.config';
import { mockStore } from '../config/mockStore';
import { ApiError } from '../utils/apiError.util';
import { UserRole, InterviewStatus } from '@prisma/client';
import { EmailService } from './email.service';

export class InterviewService {
  static async scheduleInterview(data: {
    applicationId: string;
    title: string;
    type: string;
    scheduledAt: string;
    duration?: number;
    meetingUrl?: string;
    interviewerId: string;
  }) {
    const interview = await prisma.interview.create({
      data: {
        applicationId: data.applicationId,
        title: data.title,
        type: data.type,
        scheduledAt: new Date(data.scheduledAt),
        duration: data.duration || 45,
        meetingUrl: data.meetingUrl || 'https://meet.google.com/abc-defg-hij',
        status: InterviewStatus.SCHEDULED,
      },
    });

    await prisma.interviewParticipant.create({
      data: {
        interviewId: interview.id,
        userId: data.interviewerId,
      },
    });

    return interview;
  }

  static async getInterviews(user: { id: string; role: string; companyId?: string }) {
    let where: any = {};

    if (user.role === UserRole.INTERVIEWER) {
      where.participants = {
        some: { userId: user.id },
      };
    } else if (user.role === UserRole.CANDIDATE) {
      const candidate = await prisma.candidate.findUnique({ where: { userId: user.id } });
      if (!candidate) return [];
      where.application = { candidateId: candidate.id };
    } else if (user.role !== 'ADMIN' && user.companyId) {
      where.application = {
        job: { companyId: user.companyId }
      };
    }

    const interviews = await prisma.interview.findMany({
      where,
      include: {
        application: {
          include: {
            candidate: {
              include: {
                user: { select: { id: true, name: true, email: true, avatar: true } },
                resumes: true,
              },
            },
            job: true,
          },
        },
        participants: {
          include: { user: { select: { name: true, email: true } } },
        },
        feedbacks: true,
      },
      orderBy: { scheduledAt: 'asc' },
    });

    if (user.role === UserRole.INTERVIEWER) {
      return interviews.map((item) => {
        if (item.application?.job) {
          delete (item.application.job as any).salaryMin;
          delete (item.application.job as any).salaryMax;
        }
        return item;
      });
    }

    return interviews;
  }

  static async submitFeedback(data: {
    interviewId: string;
    interviewerId: string;
    technicalRating: number;
    communicationRating: number;
    problemSolvingRating: number;
    teamworkRating: number;
    leadershipRating: number;
    comments: string;
  }) {
    const overallRating = Number(
      (
        (data.technicalRating +
          data.communicationRating +
          data.problemSolvingRating +
          data.teamworkRating +
          data.leadershipRating) /
        5
      ).toFixed(1)
    );

    const feedback = await prisma.feedback.create({
      data: {
        interviewId: data.interviewId,
        interviewerId: data.interviewerId,
        technicalRating: Number(data.technicalRating),
        communicationRating: Number(data.communicationRating),
        problemSolvingRating: Number(data.problemSolvingRating),
        teamworkRating: Number(data.teamworkRating),
        leadershipRating: Number(data.leadershipRating),
        overallRating,
        comments: data.comments,
      },
    });

    await prisma.interview.update({
      where: { id: data.interviewId },
      data: { status: InterviewStatus.COMPLETED },
    });

    const recommendationText = feedback.overallRating >= 3.5 ? 'RECOMMENDED FOR HIRE' : 'NOT RECOMMENDED';
    const user = await prisma.user.findUnique({ where: { id: data.interviewerId } });
    
    await EmailService.sendEmail({
      to: 'manager@demo.com',
      subject: `Interview Evaluation Received: ${recommendationText}`,
      template: 'FEEDBACK_SUBMITTED',
      data: {
        interviewerName: user?.name || 'Technical Interviewer',
        candidateName: 'Candidate',
        overallRating: feedback.overallRating,
        recommendation: recommendationText,
      },
    });

    return feedback;
  }
}

