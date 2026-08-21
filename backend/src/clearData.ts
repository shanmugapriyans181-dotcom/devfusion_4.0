import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function clearData() {
  console.log('🧹 Clearing all data from the database...');
  try {
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
    await prisma.session.deleteMany({});
    await prisma.user.deleteMany({});
    await prisma.company.deleteMany({});
    console.log('✅ All data cleared successfully!');
  } catch (error) {
    console.log('⚠️ Database connection warning/fallback mode active:', (error as Error).message);
  } finally {
    await prisma.$disconnect();
  }
}

clearData();
