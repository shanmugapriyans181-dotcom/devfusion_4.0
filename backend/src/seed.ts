import { 
  PrismaClient, 
  UserRole, 
  JobStatus, 
  EmploymentType, 
  WorkMode, 
  ApplicationStage, 
  InterviewStatus, 
  QuestionType, 
  OfferStatus 
} from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting Comprehensive Enterprise Database Seeding for DevFusion 4.O...');

  // 1. Clean existing records safely
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

  console.log('🧹 Cleaned existing tables.');

  // 2. Create Companies
  const companyA = await prisma.company.create({
    data: {
      name: 'TechNova Solutions',
      industry: 'Artificial Intelligence & SaaS',
      description: 'Leading enterprise cloud and generative AI workforce platform.',
      website: 'https://technova.io',
      locations: ['San Francisco, CA', 'New York, NY', 'Remote'],
      size: '250-500',
    },
  });

  const companyB = await prisma.company.create({
    data: {
      name: 'Apex Cloud Systems',
      industry: 'FinTech & Distributed Systems',
      description: 'High-throughput financial infrastructure and security software.',
      website: 'https://apexcloud.com',
      locations: ['New York, NY', 'London, UK'],
      size: '500-1000',
    },
  });

  console.log(`🏢 Created Companies: ${companyA.name}, ${companyB.name}`);

  // Shared Passwords
  const adminPass = await bcrypt.hash('admin123', 10);
  const recruiterPass = await bcrypt.hash('recruiter123', 10);
  const managerPass = await bcrypt.hash('manager123', 10);
  const interviewerPass = await bcrypt.hash('interviewer123', 10);
  const candidatePass = await bcrypt.hash('candidate123', 10);

  // 3. Create Admin
  const admin = await prisma.user.create({
    data: {
      name: 'System Admin',
      email: 'admin@gmail.com',
      passwordHash: adminPass,
      role: UserRole.ADMIN,
      emailVerified: true,
      companyId: companyA.id,
    },
  });

  // 4. Create Recruiters
  const recruiter1 = await prisma.user.create({
    data: {
      name: 'Sarah Jenkins',
      email: 'recruiter@gmail.com',
      passwordHash: recruiterPass,
      role: UserRole.RECRUITER,
      emailVerified: true,
      companyId: companyA.id,
    },
  });

  const recruiter2 = await prisma.user.create({
    data: {
      name: 'Marcus Vance',
      email: 'recruiter2@gmail.com',
      passwordHash: recruiterPass,
      role: UserRole.RECRUITER,
      emailVerified: true,
      companyId: companyB.id,
    },
  });

  // 5. Create Hiring Managers
  const manager1 = await prisma.user.create({
    data: {
      name: 'David Sterling (VP Eng)',
      email: 'manager@gmail.com',
      passwordHash: managerPass,
      role: UserRole.HIRING_MANAGER,
      emailVerified: true,
      companyId: companyA.id,
    },
  });

  const manager2 = await prisma.user.create({
    data: {
      name: 'Elena Rostova (Director of AI)',
      email: 'manager2@gmail.com',
      passwordHash: managerPass,
      role: UserRole.HIRING_MANAGER,
      emailVerified: true,
      companyId: companyB.id,
    },
  });

  // 6. Create Interviewers
  const interviewer1 = await prisma.user.create({
    data: {
      name: 'Alex Rivera (Staff Architect)',
      email: 'interviewer@gmail.com',
      passwordHash: interviewerPass,
      role: UserRole.INTERVIEWER,
      emailVerified: true,
      companyId: companyA.id,
    },
  });

  const interviewer2 = await prisma.user.create({
    data: {
      name: 'Priya Sharma (Principal Engineer)',
      email: 'interviewer2@gmail.com',
      passwordHash: interviewerPass,
      role: UserRole.INTERVIEWER,
      emailVerified: true,
      companyId: companyA.id,
    },
  });

  const interviewer3 = await prisma.user.create({
    data: {
      name: 'James Wilson (Lead DevOps)',
      email: 'interviewer3@gmail.com',
      passwordHash: interviewerPass,
      role: UserRole.INTERVIEWER,
      emailVerified: true,
      companyId: companyB.id,
    },
  });

  console.log('👥 Created Admin, Recruiters, Hiring Managers, and Interviewers');

  // 7. Create 10 Candidates
  const candidateUsersData = [
    {
      name: 'Shanmugapriyan S',
      email: 'shanmugapriyans0418@gmail.com',
      skills: ['React', 'TypeScript', 'Node.js', 'MySQL', 'Prisma', 'Next.js', 'TailwindCSS'],
      experience: 3,
      location: 'Coimbatore, India',
      bio: 'Full Stack & AI Engineer specializing in high-performance web applications and ATS platforms.',
      github: 'https://github.com/shanmugapriyan',
      linkedin: 'https://linkedin.com/in/shanmugapriyan',
    },
    {
      name: 'Ananya Ramesh',
      email: 'ananya.ramesh@gmail.com',
      skills: ['Python', 'PyTorch', 'FastAPI', 'OpenAI', 'LangChain', 'Docker', 'PostgreSQL'],
      experience: 4,
      location: 'Bangalore, India',
      bio: 'Senior Machine Learning Engineer with deep expertise in LLMs, RAG pipelines, and embeddings.',
      github: 'https://github.com/ananya-ai',
      linkedin: 'https://linkedin.com/in/ananyaramesh',
    },
    {
      name: 'Karthik Raja',
      email: 'karthik.raja@gmail.com',
      skills: ['Go', 'Kubernetes', 'AWS', 'Terraform', 'CI/CD', 'Docker', 'Prometheus'],
      experience: 5,
      location: 'Chennai, India',
      bio: 'DevOps & Site Reliability Engineer building resilient microservices and cloud automation.',
      github: 'https://github.com/karthik-cloud',
      linkedin: 'https://linkedin.com/in/karthikraja',
    },
    {
      name: 'Divya Krishnan',
      email: 'divya.krishnan@gmail.com',
      skills: ['React', 'Vue.js', 'UI/UX Design', 'Figma', 'TailwindCSS', 'CSS3', 'TypeScript'],
      experience: 3,
      location: 'Hyderabad, India',
      bio: 'Frontend Specialist and Design Technologist focused on accessible, modern user interfaces.',
      github: 'https://github.com/divyakrish',
      linkedin: 'https://linkedin.com/in/divyakrishnan',
    },
    {
      name: 'Dharun Kumar',
      email: 'dharun.kumar@gmail.com',
      skills: ['Node.js', 'Express', 'MySQL', 'Redis', 'GraphQL', 'AWS', 'Microservices'],
      experience: 4,
      location: 'Coimbatore, India',
      bio: 'Backend Engineer building high-throughput APIs and event-driven architectures.',
      github: 'https://github.com/dharun',
      linkedin: 'https://linkedin.com/in/dharunkumar',
    },
    {
      name: 'Michael Chen',
      email: 'michael.chen@gmail.com',
      skills: ['Java', 'Spring Boot', 'Kafka', 'PostgreSQL', 'Docker', 'Kubernetes'],
      experience: 6,
      location: 'Austin, TX',
      bio: 'Enterprise Backend Architect with 6+ years building financial ledger services.',
      github: 'https://github.com/mchen',
      linkedin: 'https://linkedin.com/in/michaelchen',
    },
    {
      name: 'Sophia Martinez',
      email: 'sophia.martinez@gmail.com',
      skills: ['Python', 'TensorFlow', 'Data Science', 'SQL', 'Scikit-Learn', 'Pandas'],
      experience: 2,
      location: 'Remote',
      bio: 'Data Scientist passionate about predictive modeling, feature engineering, and analytics.',
      github: 'https://github.com/sophiam',
      linkedin: 'https://linkedin.com/in/sophiamartinez',
    },
    {
      name: 'Rahul Varma',
      email: 'rahul.varma@gmail.com',
      skills: ['React Native', 'Flutter', 'iOS', 'Android', 'Mobile UX', 'TypeScript'],
      experience: 4,
      location: 'Bangalore, India',
      bio: 'Mobile App Lead with experience delivering cross-platform iOS and Android apps to 1M+ users.',
      github: 'https://github.com/rahulvarma',
      linkedin: 'https://linkedin.com/in/rahulvarma',
    },
    {
      name: 'Jessica Taylor',
      email: 'jessica.taylor@gmail.com',
      skills: ['Product Design', 'Figma', 'User Research', 'Design Systems', 'Prototyping'],
      experience: 5,
      location: 'Seattle, WA',
      bio: 'Lead Product Designer creating intuitive enterprise SaaS experiences and design systems.',
      github: 'https://github.com/jtaylor-design',
      linkedin: 'https://linkedin.com/in/jessicataylor',
    },
    {
      name: 'Arun Balaji',
      email: 'arun.balaji@gmail.com',
      skills: ['C++', 'Rust', 'Systems Programming', 'Linux', 'WebAssembly', 'Multi-threading'],
      experience: 3,
      location: 'Coimbatore, India',
      bio: 'Systems Software Engineer interested in performance optimization and low-latency code.',
      github: 'https://github.com/arunbalaji',
      linkedin: 'https://linkedin.com/in/arunbalaji',
    },
  ];

  const candidateEntities: any[] = [];

  for (const cData of candidateUsersData) {
    const user = await prisma.user.create({
      data: {
        name: cData.name,
        email: cData.email,
        passwordHash: candidatePass,
        role: UserRole.CANDIDATE,
        emailVerified: true,
        location: cData.location,
      },
    });

    const candidate = await prisma.candidate.create({
      data: {
        userId: user.id,
        phone: '+91 98765 43210',
        location: cData.location,
        bio: cData.bio,
        github: cData.github,
        linkedin: cData.linkedin,
        skills: cData.skills,
        languages: ['English', 'Tamil'],
        totalExperience: cData.experience,
      },
    });

    candidateEntities.push({ user, candidate, skills: cData.skills });
  }

  console.log(`🎓 Created 10 Candidates with full profiles and skills.`);

  // 8. Create 5 Production Jobs
  const job1 = await prisma.job.create({
    data: {
      title: 'Senior Full Stack Engineer',
      description: 'We are seeking an experienced Full Stack Engineer to architect and scale our core AI recruitment platform. You will build cutting-edge React interfaces, robust Node.js microservices, and integrate intelligent resume parsing pipelines.',
      requirements: ['3+ years in React & Node.js', 'Experience with SQL databases & Prisma ORM', 'Proficiency in TypeScript & REST APIs', 'Familiarity with cloud deployments & Docker'],
      department: 'Engineering',
      location: 'Remote / Hybrid (San Francisco, CA)',
      employmentType: EmploymentType.FULL_TIME,
      workMode: WorkMode.HYBRID,
      salaryMin: 90000,
      salaryMax: 130000,
      status: JobStatus.ACTIVE,
      companyId: companyA.id,
      createdById: recruiter1.id,
      skills: ['React', 'TypeScript', 'Node.js', 'MySQL', 'Prisma', 'TailwindCSS'],
      experience: 3,
    },
  });

  const job2 = await prisma.job.create({
    data: {
      title: 'Generative AI & LLM Engineer',
      description: 'Join our Applied AI team to design automated resume analysis, candidate-to-job match scoring algorithms, and intelligent interview question generators using modern LLMs and vector search.',
      requirements: ['Strong Python & machine learning foundations', 'Experience with OpenAI API, LangChain, or HuggingFace', 'Knowledge of vector databases and embedding search', 'FastAPI or Flask API experience'],
      department: 'Artificial Intelligence',
      location: 'San Francisco, CA (Remote)',
      employmentType: EmploymentType.FULL_TIME,
      workMode: WorkMode.REMOTE,
      salaryMin: 120000,
      salaryMax: 165000,
      status: JobStatus.ACTIVE,
      companyId: companyA.id,
      createdById: recruiter1.id,
      skills: ['Python', 'OpenAI', 'LangChain', 'FastAPI', 'PyTorch', 'Docker'],
      experience: 2,
    },
  });

  const job3 = await prisma.job.create({
    data: {
      title: 'Cloud DevOps & SRE Lead',
      description: 'Lead our cloud infrastructure automation, CI/CD pipelines, container orchestration on Kubernetes, and telemetry monitoring across global production clusters.',
      requirements: ['Hands-on AWS, Terraform, and Kubernetes', 'Proficiency in Docker and Linux shell scripting', 'Strong understanding of observability (Prometheus/Grafana)'],
      department: 'Infrastructure',
      location: 'New York, NY',
      employmentType: EmploymentType.FULL_TIME,
      workMode: WorkMode.HYBRID,
      salaryMin: 110000,
      salaryMax: 150000,
      status: JobStatus.ACTIVE,
      companyId: companyB.id,
      createdById: recruiter2.id,
      skills: ['AWS', 'Kubernetes', 'Terraform', 'CI/CD', 'Docker', 'Go'],
      experience: 4,
    },
  });

  const job4 = await prisma.job.create({
    data: {
      title: 'Lead Frontend & UI/UX Architect',
      description: 'Design and implement our design system, responsive dashboards, interactive Kanban boards, and data visualization charts using React and modern CSS.',
      requirements: ['Mastery of React, TypeScript, and modern CSS/Tailwind', 'Experience with component libraries and responsive layout design', 'Strong eye for micro-animations and typography'],
      department: 'Product & Design',
      location: 'Remote',
      employmentType: EmploymentType.FULL_TIME,
      workMode: WorkMode.REMOTE,
      salaryMin: 85000,
      salaryMax: 125000,
      status: JobStatus.ACTIVE,
      companyId: companyA.id,
      createdById: recruiter1.id,
      skills: ['React', 'TypeScript', 'TailwindCSS', 'Figma', 'CSS3'],
      experience: 3,
    },
  });

  const job5 = await prisma.job.create({
    data: {
      title: 'Backend Systems Engineer',
      description: 'Develop high-throughput transaction processing, database indexing, caching strategies with Redis, and enterprise-grade authentication/authorization mechanisms.',
      requirements: ['Solid Node.js or Go backend engineering', 'Advanced SQL querying, indexing, and transactions', 'Knowledge of JWT, RBAC, and API security'],
      department: 'Engineering',
      location: 'San Francisco, CA',
      employmentType: EmploymentType.FULL_TIME,
      workMode: WorkMode.HYBRID,
      salaryMin: 95000,
      salaryMax: 140000,
      status: JobStatus.ACTIVE,
      companyId: companyA.id,
      createdById: recruiter1.id,
      skills: ['Node.js', 'MySQL', 'Redis', 'Express', 'GraphQL', 'AWS'],
      experience: 3,
    },
  });

  console.log(`📋 Created 5 Published Jobs across multiple departments.`);

  // 9. Create Applications across all Kanban Stages
  // Candidate 1 (Shanmugapriyan) -> Job 1 (Full Stack) -> Stage: OFFER
  const app1 = await prisma.application.create({
    data: {
      jobId: job1.id,
      candidateId: candidateEntities[0].candidate.id,
      stage: ApplicationStage.OFFER,
      matchScore: 94,
      coverLetter: 'I am excited to apply for the Senior Full Stack Engineer role. My experience building TypeScript web applications with MySQL and real-time AI pipelines aligns perfectly with your mission.',
      notes: 'Exceptional candidate. Clean code submissions and strong communication skills. Highly recommended for offer.',
    },
  });

  // Candidate 2 (Ananya) -> Job 2 (AI Engineer) -> Stage: TECHNICAL_INTERVIEW
  const app2 = await prisma.application.create({
    data: {
      jobId: job2.id,
      candidateId: candidateEntities[1].candidate.id,
      stage: ApplicationStage.TECHNICAL_INTERVIEW,
      matchScore: 96,
      coverLetter: 'With 4+ years researching and deploying LLMs, I would love to enhance your candidate parsing and matching algorithms.',
      notes: 'Strong machine learning portfolio. Scheduled for deep technical interview with Elena.',
    },
  });

  // Candidate 3 (Karthik) -> Job 3 (DevOps Lead) -> Stage: HR_INTERVIEW
  const app3 = await prisma.application.create({
    data: {
      jobId: job3.id,
      candidateId: candidateEntities[2].candidate.id,
      stage: ApplicationStage.HR_INTERVIEW,
      matchScore: 91,
      coverLetter: 'Experienced in Terraform and Kubernetes multi-region clustering.',
      notes: 'Technical round passed with 5/5 score. Progressed to HR & compensation discussion.',
    },
  });

  // Candidate 4 (Divya) -> Job 4 (Frontend Lead) -> Stage: SHORTLISTED
  const app4 = await prisma.application.create({
    data: {
      jobId: job4.id,
      candidateId: candidateEntities[3].candidate.id,
      stage: ApplicationStage.SHORTLISTED,
      matchScore: 89,
      coverLetter: 'Passionate about building responsive, accessible UI and design systems.',
      notes: 'Portfolio reviewed by Sarah. Ready for initial interview scheduling.',
    },
  });

  // Candidate 5 (Dharun) -> Job 5 (Backend Engineer) -> Stage: SCREENING
  const app5 = await prisma.application.create({
    data: {
      jobId: job5.id,
      candidateId: candidateEntities[4].candidate.id,
      stage: ApplicationStage.SCREENING,
      matchScore: 87,
      coverLetter: 'Excited about backend scalability and distributed microservices.',
      notes: 'AI match score indicates solid Node.js and SQL proficiency.',
    },
  });

  // Candidate 6 (Michael) -> Job 1 (Full Stack) -> Stage: HIRED
  const app6 = await prisma.application.create({
    data: {
      jobId: job1.id,
      candidateId: candidateEntities[5].candidate.id,
      stage: ApplicationStage.HIRED,
      matchScore: 92,
      coverLetter: 'Applying with 6 years of enterprise full-stack development experience.',
      notes: 'Offer officially accepted! Onboarding packet dispatched.',
    },
  });

  // Candidate 7 (Sophia) -> Job 2 (AI Engineer) -> Stage: APPLIED
  const app7 = await prisma.application.create({
    data: {
      jobId: job2.id,
      candidateId: candidateEntities[6].candidate.id,
      stage: ApplicationStage.APPLIED,
      matchScore: 84,
      coverLetter: 'Excited to apply my data science and Python skills.',
      notes: 'New application received today.',
    },
  });

  // Candidate 8 (Rahul) -> Job 4 (Frontend Lead) -> Stage: APPLIED
  const app8 = await prisma.application.create({
    data: {
      jobId: job4.id,
      candidateId: candidateEntities[7].candidate.id,
      stage: ApplicationStage.APPLIED,
      matchScore: 78,
      coverLetter: 'Looking to transition my mobile experience into enterprise web applications.',
    },
  });

  // Candidate 9 (Jessica) -> Job 4 (Frontend Lead) -> Stage: SHORTLISTED
  const app9 = await prisma.application.create({
    data: {
      jobId: job4.id,
      candidateId: candidateEntities[8].candidate.id,
      stage: ApplicationStage.SHORTLISTED,
      matchScore: 93,
      coverLetter: 'Award-winning product designer eager to shape the UI of HireAI.',
      notes: 'Top tier Figma prototypes and design system portfolio.',
    },
  });

  // Candidate 10 (Arun) -> Job 5 (Backend) -> Stage: REJECTED
  const app10 = await prisma.application.create({
    data: {
      jobId: job5.id,
      candidateId: candidateEntities[9].candidate.id,
      stage: ApplicationStage.REJECTED,
      matchScore: 65,
      coverLetter: 'C++ programmer interested in backend role.',
      notes: 'Looking for deeper Node.js & TypeScript experience for this position.',
    },
  });

  console.log(`📊 Created 10 Applications spanning all Kanban workflow stages.`);

  // 10. Create Interviews & Feedback
  const interview1 = await prisma.interview.create({
    data: {
      applicationId: app2.id,
      title: 'Technical System Design & LLM Architecture',
      type: 'TECHNICAL',
      scheduledAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
      duration: 60,
      meetingUrl: 'https://meet.google.com/abc-hire-ats',
      status: InterviewStatus.SCHEDULED,
      participants: {
        create: [{ userId: interviewer1.id }],
      },
    },
  });

  const interview2 = await prisma.interview.create({
    data: {
      applicationId: app1.id,
      title: 'Full Stack & Architecture Review',
      type: 'TECHNICAL',
      scheduledAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
      duration: 45,
      meetingUrl: 'https://meet.google.com/xyz-tech-eval',
      status: InterviewStatus.COMPLETED,
      participants: {
        create: [{ userId: interviewer2.id }],
      },
    },
  });

  // Feedback for Candidate 1
  await prisma.feedback.create({
    data: {
      interviewId: interview2.id,
      interviewerId: interviewer2.id,
      technicalRating: 5,
      communicationRating: 5,
      problemSolvingRating: 5,
      teamworkRating: 5,
      leadershipRating: 5,
      overallRating: 4.9,
      comments: 'Exceptional TypeScript, SQL schema modeling, and full-stack architecture depth. One of the strongest technical candidates evaluated this quarter. Strongly endorse moving to offer.',
    },
  });

  console.log('🗓️ Created Interviews and Completed Interview Feedback.');

  // 11. Create Offer Letters
  // Offer Letter for Shanmugapriyan
  await prisma.offerLetter.create({
    data: {
      applicationId: app1.id,
      candidateName: 'Shanmugapriyan S',
      position: 'Senior Full Stack Engineer',
      salary: 115000,
      joiningDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 2 weeks from now
      location: 'Remote / San Francisco',
      benefits: ['Health Insurance', '401(k) Match', '$3,000 Remote Home Office Stipend', 'Unlimited PTO', 'Annual AI Learning Budget'],
      status: OfferStatus.SENT,
    },
  });

  // Offer Letter for Michael (Accepted)
  await prisma.offerLetter.create({
    data: {
      applicationId: app6.id,
      candidateName: 'Michael Chen',
      position: 'Senior Full Stack Engineer',
      salary: 120000,
      joiningDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      location: 'Austin, TX',
      benefits: ['Comprehensive Medical', 'Equity Package (0.25%)', 'Flexible Working Hours', '401k'],
      status: OfferStatus.ACCEPTED,
    },
  });

  console.log('📜 Created Official Offer Letters.');

  // 12. Create Coding Assessment & Questions
  const assessment = await prisma.codingAssessment.create({
    data: {
      jobId: job1.id,
      title: 'Full Stack JavaScript & Database Challenge',
      description: 'Comprehensive 45-minute technical assessment covering TypeScript, async operations, SQL indexing, and algorithm design.',
      durationMinutes: 45,
      passingScore: 75,
      createdById: recruiter1.id,
    },
  });

  await prisma.assessmentQuestion.create({
    data: {
      assessmentId: assessment.id,
      title: 'MySQL Foreign Key Indexing',
      questionText: 'What is the primary advantage of database indexing in MySQL for frequently queried foreign keys?',
      questionType: QuestionType.MCQ,
      options: [
        'Reduces disk space usage',
        'Improves SELECT query lookup speed from O(N) to O(log N)',
        'Automatically encrypts table data',
        'Prevents SQL injection vulnerabilities',
      ],
      points: 25,
    },
  });

  await prisma.assessmentQuestion.create({
    data: {
      assessmentId: assessment.id,
      title: 'React Performance Optimization',
      questionText: 'Which React hook should be used to avoid unnecessary recalculations of expensive computed values across re-renders?',
      questionType: QuestionType.MCQ,
      options: ['useEffect', 'useMemo', 'useRef', 'useLayoutEffect'],
      points: 25,
    },
  });

  await prisma.assessmentQuestion.create({
    data: {
      assessmentId: assessment.id,
      title: 'Two Sum Algorithm Challenge',
      questionText: 'Write a TypeScript function findTwoSum(nums: number[], target: number): [number, number] | null that finds indices of two numbers that add up to target in O(N) time complexity using a HashMap.',
      questionType: QuestionType.CODING,
      points: 50,
    },
  });

  console.log('💻 Created Coding Assessment with MCQ & Coding Problems.');

  // 13. Create System Notifications
  await prisma.notification.create({
    data: {
      userId: candidateEntities[0].user.id,
      title: '🎉 Formal Offer of Employment Received!',
      message: 'TechNova Solutions has extended an official offer for Senior Full Stack Engineer ($115,000 / yr). Review your offer in the portal.',
      type: 'OFFER_LETTER_SENT',
      isRead: false,
    },
  });

  await prisma.notification.create({
    data: {
      userId: manager1.id,
      title: '📋 New Interview Feedback Ready for Decision',
      message: 'Interviewer Priya Sharma submitted 4.9/5.0 Strong Hire recommendation for Shanmugapriyan S.',
      type: 'FEEDBACK_SUBMITTED',
      isRead: false,
    },
  });

  // 14. Audit Logs
  await prisma.auditLog.create({
    data: {
      userId: admin.id,
      userEmail: admin.email,
      action: 'SYSTEM_SEED',
      entity: 'DATABASE',
      metadata: { message: 'Enterprise production dataset successfully populated for DevFusion 4.O presentation.' },
      ipAddress: '127.0.0.1',
    },
  });

  console.log('--------------------------------------------------');
  console.log('🎉 SEEDING COMPLETE! ALL 5 ROLES AND WORKFLOWS READY:');
  console.log('--------------------------------------------------');
  console.log('🔑 DEMO LOGINS:');
  console.log('   👑 ADMIN:          admin@gmail.com          / admin123');
  console.log('   👔 RECRUITER:      recruiter@gmail.com      / recruiter123');
  console.log('   🏢 HIRING MANAGER: manager@gmail.com        / manager123');
  console.log('   🎯 INTERVIEWER:    interviewer@gmail.com    / interviewer123');
  console.log('   🎓 CANDIDATE:      shanmugapriyans0418@gmail.com / candidate123');
  console.log('--------------------------------------------------');
}

main()
  .catch((e) => {
    console.error('❌ Error during database seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
