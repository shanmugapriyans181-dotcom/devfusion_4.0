import { prisma } from '../config/prisma.config';
import { mockStore } from '../config/mockStore';
import { ApiError } from '../utils/apiError.util';

export class CandidateService {
  static async getCandidates(companyId?: string) {
    const whereClause = companyId ? {
      applications: {
        some: {
          job: {
            companyId: companyId
          }
        }
      }
    } : {};

    return await prisma.candidate.findMany({
      where: whereClause,
      include: {
        user: {
          select: { id: true, name: true, email: true, avatar: true },
        },
        resumes: true,
        applications: {
          include: { job: { select: { title: true } } },
        },
      },
      orderBy: { updatedAt: 'desc' },
    });
  }

  static async getCandidateByUserId(userId: string) {
    const candidate = await prisma.candidate.findUnique({
      where: { userId },
      include: {
        user: { select: { name: true, email: true, avatar: true, phone: true, location: true } },
        resumes: true,
        applications: { include: { job: true } },
        analyses: true,
      },
    });

    if (!candidate) {
      throw ApiError.notFound('Candidate profile not found');
    }

    return candidate;
  }

  static async updateCandidateProfile(userId: string, data: any) {
    const candidate = await prisma.candidate.findUnique({ where: { userId } });
    if (!candidate) {
      throw ApiError.notFound('Candidate not found');
    }

    if (data.name || data.phone || data.location || data.avatar) {
      await prisma.user.update({
        where: { id: userId },
        data: {
          name: data.name ?? undefined,
          phone: data.phone ?? undefined,
          location: data.location ?? undefined,
          avatar: data.avatar ?? undefined,
        },
      });
    }

    const updated = await prisma.candidate.update({
      where: { userId },
      data: {
        phone: data.phone ?? candidate.phone,
        location: data.location ?? candidate.location,
        bio: data.bio ?? candidate.bio,
        github: data.github ?? candidate.github,
        linkedin: data.linkedin ?? candidate.linkedin,
        portfolio: data.portfolio ?? candidate.portfolio,
        skills: data.skills ?? candidate.skills,
        education: data.education ?? candidate.education,
        experience: data.experience ?? candidate.experience,
        projects: data.projects ?? candidate.projects,
        certifications: data.certifications ?? candidate.certifications,
        languages: data.languages ?? candidate.languages,
        totalExperience: data.totalExperience ? Number(data.totalExperience) : candidate.totalExperience,
      },
    });

    if (data.resumeName) {
      const existingResume = await prisma.resume.findFirst({
        where: { candidateId: candidate.id },
      });

      if (existingResume) {
        await prisma.resume.update({
          where: { id: existingResume.id },
          data: { fileName: data.resumeName },
        });
      } else {
        await prisma.resume.create({
          data: {
            candidateId: candidate.id,
            fileName: data.resumeName,
            fileUrl: `https://hireai-storage.example.com/resumes/${data.resumeName}`,
            fileType: 'application/pdf',
            fileSize: 1024000,
          },
        });
      }
    }

    return updated;
  }
}
