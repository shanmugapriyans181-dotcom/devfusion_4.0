import { prisma } from '../config/prisma.config';
import { mockStore } from '../config/mockStore';
import { ApiError } from '../utils/apiError.util';

export class AssessmentService {
  static async getAssessments() {
    return await prisma.codingAssessment.findMany({
      include: {
        questions: true,
        job: { select: { title: true } },
        _count: { select: { attempts: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  static async getAssessmentById(id: string) {
    const assessment = await prisma.codingAssessment.findUnique({
      where: { id },
      include: {
        questions: true,
        job: true,
      },
    });

    if (!assessment) {
      throw ApiError.notFound('Coding assessment not found');
    }

    return assessment;
  }

  static async submitAssessmentAttempt(candidateUserId: string, assessmentId: string, answers: any[]) {
    const candidate = await prisma.candidate.findUnique({ where: { userId: candidateUserId } });
    if (!candidate) {
      throw ApiError.badRequest('Candidate profile required');
    }

    const assessment = await this.getAssessmentById(assessmentId);

    let totalScore = 0;
    const answerRecords = [];

    for (const ans of answers) {
      const q = assessment.questions.find((question: any) => question.id === ans.questionId);
      if (!q) continue;

      let isCorrect = false;
      let scoreObtained = 0;

      if (q.questionType === 'MCQ') {
        isCorrect = ans.selectedOption === (q.options as any)?.[1];
        scoreObtained = isCorrect ? q.points : 0;
      } else {
        isCorrect = ans.submittedCode && ans.submittedCode.length > 10;
        scoreObtained = isCorrect ? q.points : q.points * 0.5;
      }

      totalScore += scoreObtained;

      answerRecords.push({
        questionId: q.id,
        submittedCode: ans.submittedCode || null,
        selectedOption: ans.selectedOption || null,
        isCorrect,
        scoreObtained,
      });
    }

    const attempt = await prisma.assessmentAttempt.create({
      data: {
        assessmentId,
        candidateId: candidate.id,
        score: totalScore,
        status: totalScore >= assessment.passingScore ? 'PASSED' : 'FAILED',
        completedAt: new Date(),
        answers: {
          create: answerRecords,
        },
      },
      include: {
        answers: true,
      },
    });

    return attempt;
  }
}

