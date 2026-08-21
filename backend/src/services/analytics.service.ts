import { prisma } from '../config/prisma.config';
import { mockStore } from '../config/mockStore';

export class AnalyticsService {
  static async getRecruiterAnalytics(companyId?: string) {
    const jobWhere = companyId ? { companyId } : {};
    const appWhere = companyId ? { job: { companyId } } : {};
    
    const [
      totalJobs,
      activeJobs,
      totalCandidates, // Keeping totalCandidates system-wide or we could filter by applications to company
      totalApplications,
      totalInterviews,
      totalOffers,
      acceptedOffers,
    ] = await Promise.all([
      prisma.job.count({ where: jobWhere }),
      prisma.job.count({ where: { status: 'ACTIVE', ...jobWhere } }),
      prisma.candidate.count(), // Depending on requirements, we can leave this as global
      prisma.application.count({ where: appWhere }),
      prisma.interview.count({ where: { application: { job: { ...jobWhere } } } }),
      prisma.offerLetter.count({ where: { application: { job: { ...jobWhere } } } }),
      prisma.offerLetter.count({ where: { status: 'ACCEPTED', application: { job: { ...jobWhere } } } }),
    ]);

    const stageCounts = await prisma.application.groupBy({
      by: ['stage'],
      where: appWhere,
      _count: { stage: true },
    });

    const funnel = stageCounts.map((item) => ({
      stage: item.stage.replace('_', ' '),
      count: item._count.stage,
    }));

    const offerAcceptanceRate = totalOffers > 0 ? Number(((acceptedOffers / totalOffers) * 100).toFixed(1)) : 0;

    return {
      metrics: {
        totalJobs,
        activeJobs,
        totalCandidates,
        totalApplications,
        totalInterviews,
        totalOffers,
        acceptedOffers,
        offerAcceptanceRate,
        avgTimeToHireDays: 18, // Could be calculated dynamically from application history
      },
      funnel,
      candidateSources: [
        { name: 'Direct Careers Portal', value: 55 },
        { name: 'LinkedIn Sourced', value: 25 },
        { name: 'Employee Referrals', value: 12 },
        { name: 'Agency / Other', value: 8 },
      ],
    };
  }
}

