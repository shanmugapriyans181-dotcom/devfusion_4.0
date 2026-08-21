import { PrismaClient, UserRole } from '@prisma/client';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config();
dotenv.config({ path: path.join(__dirname, '../../.env') });

const prisma = new PrismaClient();

async function resetToCleanState() {
  console.log('🧹 Clearing all dummy data for fresh user testing...');

  // Delete all relational records
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
  await prisma.passwordResetToken.deleteMany({});
  await prisma.emailVerificationToken.deleteMany({});
  await prisma.user.deleteMany({});
  await prisma.company.deleteMany({});

  console.log('✨ All demo accounts, jobs, and applications wiped.');

  // Create Foundation Company
  const company = await prisma.company.create({
    data: {
      name: 'HireAI Platform',
      industry: 'Software & Technology',
      description: 'Enterprise AI Recruitment & ATS Platform',
      locations: ['San Francisco, CA', 'Remote'],
    },
  });

  // Create Single Permanent System Admin
  const adminPasswordHash = await bcrypt.hash('admin123', 10);
  const adminUser = await prisma.user.create({
    data: {
      name: 'System Admin',
      email: 'admin@gmail.com',
      passwordHash: adminPasswordHash,
      role: UserRole.ADMIN,
      emailVerified: true,
      companyId: company.id,
    },
  });

  await prisma.auditLog.create({
    data: {
      userId: adminUser.id,
      userEmail: adminUser.email,
      action: 'FRESH_SYSTEM_RESET',
      entity: 'DATABASE',
      metadata: { message: 'Database reset to clean state. Ready for fresh user registrations and tests.' },
      ipAddress: '127.0.0.1',
    },
  });

  console.log('--------------------------------------------------');
  console.log('✅ DATABASE IS NOW 100% FRESH & CLEAN!');
  console.log('--------------------------------------------------');
  console.log('👑 Only Permanent Admin Retained:');
  console.log('   - Email:    admin@gmail.com');
  console.log('   - Password: admin123');
  console.log('--------------------------------------------------');
  console.log('🚀 You can now register fresh accounts on http://localhost:5173/register');
  console.log('--------------------------------------------------');
}

resetToCleanState()
  .catch((e) => {
    console.error('❌ Error during database clean reset:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
