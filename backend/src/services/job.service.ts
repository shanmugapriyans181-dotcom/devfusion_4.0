import { prisma } from '../config/prisma.config';
import { mockStore } from '../config/mockStore';
import { ApiError } from '../utils/apiError.util';
import { JobStatus, EmploymentType, WorkMode } from '@prisma/client';
import { EmailService } from './email.service';

export class JobService {
  static async getJobs(query: {
    keyword?: string;
    location?: string;
    employmentType?: string;
    workMode?: string;
    minSalary?: number;
    status?: string;
    companyId?: string;
  }) {
    const where: any = {};

    if (query.status === 'ALL') {
      // Do not restrict status - return all jobs for management view
    } else if (query.status) {
      where.status = query.status as JobStatus;
    } else {
      where.status = JobStatus.ACTIVE;
    }

    if (query.companyId) {
      where.companyId = query.companyId;
    }

    if (query.keyword) {
      where.OR = [
        { title: { contains: query.keyword, mode: 'insensitive' } },
        { department: { contains: query.keyword, mode: 'insensitive' } },
        { description: { contains: query.keyword, mode: 'insensitive' } },
        { skills: { hasSome: [query.keyword] } },
      ];
    }

    if (query.location) {
      where.location = { contains: query.location, mode: 'insensitive' };
    }

    if (query.employmentType) {
      where.employmentType = query.employmentType as EmploymentType;
    }

    if (query.workMode) {
      where.workMode = query.workMode as WorkMode;
    }

    if (query.minSalary) {
      where.salaryMax = { gte: Number(query.minSalary) };
    }

    const jobs = await prisma.job.findMany({
      where,
      include: {
        company: {
          select: { name: true, logo: true, website: true },
        },
        createdBy: {
          select: { id: true, name: true, email: true, role: true },
        },
        _count: {
          select: { applications: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return jobs;
  }

  static async getJobById(id: string) {
    const job = await prisma.job.findUnique({
      where: { id },
      include: {
        company: true,
        createdBy: {
          select: { id: true, name: true, email: true, role: true },
        },
        _count: {
          select: { applications: true },
        },
      },
    });

    if (!job) {
      throw ApiError.notFound('Job posting not found');
    }

    return job;
  }

  static async createJob(data: any, createdById: string, companyId?: string) {
    let resolvedCompanyId = companyId;

    const user = await prisma.user.findUnique({ where: { id: createdById } });
    if (!resolvedCompanyId) {
      resolvedCompanyId = user?.companyId || undefined;
    }

    if (!resolvedCompanyId) {
      const defaultCompany = await prisma.company.findFirst();
      resolvedCompanyId = defaultCompany?.id;
    }

    if (!resolvedCompanyId) {
      throw ApiError.badRequest('No company found to associate with job');
    }

    // If created by HIRING_MANAGER, route to Recruiter Approval pipeline
    const initialStatus =
      user?.role === 'HIRING_MANAGER'
        ? JobStatus.PENDING_RECRUITER_APPROVAL
        : data.status || JobStatus.ACTIVE;

    const job = await prisma.job.create({
      data: {
        companyId: resolvedCompanyId,
        createdById,
        title: data.title,
        department: data.department,
        description: data.description,
        requirements: data.requirements || [],
        skills: data.skills || [],
        location: data.location,
        salaryMin: data.salaryMin ? Number(data.salaryMin) : null,
        salaryMax: data.salaryMax ? Number(data.salaryMax) : null,
        experience: data.experience ? Number(data.experience) : 0,
        employmentType: data.employmentType || EmploymentType.FULL_TIME,
        workMode: data.workMode || WorkMode.HYBRID,
        status: initialStatus,
        deadline: data.deadline ? new Date(data.deadline) : null,
      },
    });

    await prisma.auditLog.create({
      data: {
        userId: createdById,
        action: 'JOB_CREATED',
        entity: 'JOB',
        entityId: job.id,
        metadata: { title: job.title, status: initialStatus },
      },
    });

    // Notify Recruiters when a Manager submits a job for approval
    if (initialStatus === JobStatus.PENDING_RECRUITER_APPROVAL) {
      const recruiters = await prisma.user.findMany({
        where: { role: { in: ['RECRUITER', 'ADMIN'] } },
      });

      for (const rec of recruiters) {
        await prisma.notification.create({
          data: {
            userId: rec.id,
            title: 'New Job Approval Request',
            message: `Hiring Manager ${user?.name || ''} requested approval to post "${job.title}".`,
            type: 'SYSTEM',
          },
        });
      }
    }

    return job;
  }

  static async updateJob(id: string, data: any) {
    const existing = await prisma.job.findUnique({ where: { id } });
    if (!existing) {
      throw ApiError.notFound('Job posting not found');
    }

    const job = await prisma.job.update({
      where: { id },
      data: {
        title: data.title ?? existing.title,
        department: data.department ?? existing.department,
        description: data.description ?? existing.description,
        requirements: data.requirements ?? existing.requirements,
        skills: data.skills ?? existing.skills,
        location: data.location ?? existing.location,
        salaryMin: data.salaryMin !== undefined ? Number(data.salaryMin) : existing.salaryMin,
        salaryMax: data.salaryMax !== undefined ? Number(data.salaryMax) : existing.salaryMax,
        experience: data.experience !== undefined ? Number(data.experience) : existing.experience,
        employmentType: data.employmentType ?? existing.employmentType,
        workMode: data.workMode ?? existing.workMode,
        status: data.status ?? existing.status,
      },
    });

    return job;
  }

  static async approveJob(id: string, recruiterName: string = 'Recruiter') {
    const job = await prisma.job.findUnique({ where: { id } });
    if (!job) {
      throw ApiError.notFound('Job posting not found');
    }

    const updatedJob = await prisma.job.update({
      where: { id },
      data: { status: JobStatus.ACTIVE },
    });

    // Notify the Hiring Manager who created the job
    await prisma.notification.create({
      data: {
        userId: job.createdById,
        title: 'Job Approved & Published!',
        message: `Your job requisition "${job.title}" has been approved by ${recruiterName} and is now live for candidate applications.`,
        type: 'SYSTEM',
      },
    });

    await prisma.auditLog.create({
      data: {
        userId: job.createdById,
        action: 'JOB_APPROVED',
        entity: 'JOB',
        entityId: job.id,
        metadata: { title: job.title, approvedBy: recruiterName },
      },
    });

    return updatedJob;
  }

  static async closeJob(id: string) {
    return this.updateJob(id, { status: JobStatus.CLOSED });
  }

  static async duplicateJob(id: string, createdById: string) {
    const original = await this.getJobById(id);
    return this.createJob({
      ...original,
      title: `${original.title} (Copy)`,
      status: JobStatus.DRAFT,
    }, createdById);
  }

  static async deleteJob(id: string) {
    return await prisma.job.delete({ where: { id } });
  }
}

