import bcrypt from 'bcryptjs';
import { UserRole } from '@prisma/client';
import fs from 'fs';
import path from 'path';

class MockStore {
  public company: any;
  public users: any[] = [];
  public candidates: any[] = [];
  public jobs: any[] = [];
  public resumes: any[] = [];
  public analyses: any[] = [];
  public applications: any[] = [];
  public interviews: any[] = [];
  public feedbacks: any[] = [];
  public codingAssessments: any[] = [];
  public offerLetters: any[] = [];
  public notifications: any[] = [];
  public activityLogs: any[] = [];
  public sessions: any[] = [];

  private dataDir = path.join(__dirname, '../../data');
  private dataFilePath = path.join(this.dataDir, 'mock-db.json');

  constructor() {
    this.init();
  }

  public save() {
    try {
      if (!fs.existsSync(this.dataDir)) {
        fs.mkdirSync(this.dataDir, { recursive: true });
      }
      const data = {
        company: this.company,
        users: this.users,
        candidates: this.candidates,
        jobs: this.jobs,
        resumes: this.resumes,
        analyses: this.analyses,
        applications: this.applications,
        interviews: this.interviews,
        feedbacks: this.feedbacks,
        codingAssessments: this.codingAssessments,
        offerLetters: this.offerLetters,
        notifications: this.notifications,
        activityLogs: this.activityLogs,
        sessions: this.sessions,
      };
      fs.writeFileSync(this.dataFilePath, JSON.stringify(data, null, 2), 'utf-8');
    } catch (e) {
      console.error('Failed to save persistent mock data file:', e);
    }
  }

  private async init() {
    // 1. Try loading from persistent disk storage if exists
    if (fs.existsSync(this.dataFilePath)) {
      try {
        const raw = fs.readFileSync(this.dataFilePath, 'utf-8');
        const data = JSON.parse(raw);
        this.company = data.company;
        this.users = data.users || [];
        this.candidates = data.candidates || [];
        this.jobs = data.jobs || [];
        this.resumes = data.resumes || [];
        this.analyses = data.analyses || [];
        this.applications = data.applications || [];
        this.interviews = data.interviews || [];
        this.feedbacks = data.feedbacks || [];
        this.codingAssessments = data.codingAssessments || [];
        this.offerLetters = data.offerLetters || [];
        this.notifications = data.notifications || [];
        this.activityLogs = data.activityLogs || [];
        this.sessions = data.sessions || [];
        return;
      } catch (e) {
        console.error('Failed to load existing mock-db.json, reinitializing default seed state.', e);
      }
    }

    // 2. Otherwise initialize default demo seed data
    // 2. Otherwise initialize minimal foundational state
    const passwordHash = await bcrypt.hash('AdminPassword123!', 10);

    this.company = {
      id: 'comp-101',
      name: 'ATS Platform',
      logo: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150',
      website: 'https://atsplatform.example.com',
      industry: 'Software & Technology',
      size: '1-50 employees',
      description: 'Central Recruitment Platform.',
      locations: ['Remote'],
      socialLinks: {},
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const adminUser = {
      id: 'usr-admin-demo-1',
      name: 'System Admin',
      email: 'admin@company.com',
      passwordHash,
      role: UserRole.ADMIN,
      emailVerified: true,
      companyId: this.company.id,
      location: 'Remote',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.users = [
      adminUser,
    ];

    this.candidates = [];
    this.jobs = [];
    this.applications = [];
    this.resumes = [];
    this.analyses = [];
    this.interviews = [];
    this.feedbacks = [];
    this.codingAssessments = [];
    this.offerLetters = [];
    this.notifications = [];
    this.activityLogs = [];

    // Save initial state to disk file
    this.save();

    // Save initial state to disk file
    this.save();
  }

  public clearAll() {
    this.candidates = [];
    this.jobs = [];
    this.resumes = [];
    this.analyses = [];
    this.applications = [];
    this.interviews = [];
    this.feedbacks = [];
    this.codingAssessments = [];
    this.offerLetters = [];
    this.notifications = [];
    this.activityLogs = [];
    this.users = [];
    this.save();
  }
}

export const mockStore = new MockStore();
