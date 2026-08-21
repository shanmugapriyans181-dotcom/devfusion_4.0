import { prisma } from '../config/prisma.config';
import { mockStore } from '../config/mockStore';
import { ApiError } from '../utils/apiError.util';
import { UserRole } from '@prisma/client';

export class AdminService {
  static async getUsers() {
    return await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        emailVerified: true,
        avatar: true,
        location: true,
        companyId: true,
        company: { select: { name: true } },
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  static async updateUserRole(userId: string, role: UserRole, adminUserId: string) {
    const user = await prisma.user.update({
      where: { id: userId },
      data: { role },
    });

    await prisma.auditLog.create({
      data: {
        userId: adminUserId,
        action: 'USER_ROLE_CHANGE',
        entity: 'USER',
        entityId: userId,
        metadata: { newRole: role, userEmail: user.email },
      },
    });

    return user;
  }

  static async getAuditLogs() {
    return await prisma.auditLog.findMany({
      include: {
        user: { select: { name: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
  }

  static async getSystemOverview() {
    const [usersCount, jobsCount, appsCount, interviewsCount, offersCount] = await Promise.all([
      prisma.user.count(),
      prisma.job.count(),
      prisma.application.count(),
      prisma.interview.count(),
      prisma.offerLetter.count(),
    ]);

    return {
      usersCount,
      jobsCount,
      appsCount,
      interviewsCount,
      offersCount,
    };
  }


  static async clearAllData() {
    await prisma.auditLog.deleteMany({});
    await prisma.activityLog.deleteMany({});
    await prisma.notification.deleteMany({});
    await prisma.offerLetter.deleteMany({});
    await prisma.assessmentAnswer.deleteMany({});
    await prisma.assessmentAttempt.deleteMany({});
    await prisma.assessmentQuestion.deleteMany({});
    await prisma.codingAssessment.deleteMany({});
    await prisma.feedback.deleteMany({});
    await prisma.interviewParticipant.deleteMany({});
    await prisma.interview.deleteMany({});
    await prisma.resumeAnalysis.deleteMany({});
    await prisma.application.deleteMany({});
    await prisma.resume.deleteMany({});
    await prisma.candidate.deleteMany({});
    await prisma.job.deleteMany({});
    return true;
  }
}


