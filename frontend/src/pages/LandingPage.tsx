import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import {
  Sparkles,
  Zap,
  ShieldCheck,
  Brain,
  Kanban,
  Code2,
  FileCheck,
  BarChart3,
  Users,
  CheckCircle2,
  ArrowRight,
  HelpCircle,
  Mail
} from 'lucide-react';

import { useAuth } from '../contexts/AuthContext';

export const LandingPage: React.FC = () => {
  const { user, isAuthenticated } = useAuth();

  const getDashboardPath = (role?: string) => {
    switch (role) {
      case 'ADMIN':
        return '/admin/dashboard';
      case 'RECRUITER':
        return '/recruiter/dashboard';
      case 'HIRING_MANAGER':
        return '/manager/dashboard';
      case 'INTERVIEWER':
        return '/interviewer/dashboard';
      case 'CANDIDATE':
      default:
        return '/candidate/dashboard';
    }
  };

  const dashboardPath = getDashboardPath(user?.role);

  return (
    <div className="min-h-screen flex flex-col">
      {/* 1. Hero Section */}
      <section className="relative pt-24 pb-20 md:pt-32 md:pb-28 overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-brand-600/15 via-transparent to-transparent"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">
          <Badge variant="primary" className="py-1 px-4 text-xs font-semibold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 mr-1.5 inline" />
            DevFusion 4.0 Hackathon Submission
          </Badge>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight max-w-4xl mx-auto leading-tight">
            AI-Powered Recruitment. <br />
            <span className="gradient-text">Smarter Hiring.</span>
          </h1>

          <p className="text-lg sm:text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto font-normal">
            Manage jobs, candidates, resumes, interviews, assessments and hiring decisions from one intelligent recruitment platform.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            {isAuthenticated ? (
              <Link to={dashboardPath}>
                <Button size="lg" className="shadow-brand-500/30 bg-purple-600 hover:bg-purple-700">
                  Open {user?.role} Dashboard
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            ) : (
              <>
                <Link to="/register">
                  <Button size="lg" className="shadow-brand-500/30">
                    Start Hiring Now
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
                <Link to="/login">
                  <Button variant="outline" size="lg">
                    View Interactive Demo
                  </Button>
                </Link>
              </>
            )}
          </div>


          {/* Quick Metrics Badge Banner */}
          <div className="pt-12 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto text-left">
            <Card className="glass-card border-brand-500/20">
              <div className="text-3xl font-bold text-brand-600 dark:text-brand-400">10x</div>
              <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">Faster Resume Screening</div>
            </Card>
            <Card className="glass-card border-brand-500/20">
              <div className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">94%</div>
              <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">AI Matching Accuracy</div>
            </Card>
            <Card className="glass-card border-brand-500/20">
              <div className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">0%</div>
              <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">Algorithmic Bias Shield</div>
            </Card>
            <Card className="glass-card border-brand-500/20">
              <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">5 Roles</div>
              <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">Role-Based Access Control</div>
            </Card>
          </div>
        </div>
      </section>

      {/* 2. Key Features */}
      <section id="features" className="py-20 bg-slate-100/50 dark:bg-slate-900/50 border-y border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center space-y-4 max-w-3xl mx-auto">
            <Badge variant="info">End-to-End Capabilities</Badge>
            <h2 className="text-3xl sm:text-4xl font-bold">Built for Modern Talent Acquisition</h2>
            <p className="text-slate-600 dark:text-slate-400">Everything recruiters, hiring managers, and candidates need in one unified space.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="glass-card space-y-4 hover:border-brand-500/40 transition-colors">
              <div className="w-12 h-12 rounded-xl bg-brand-500/10 text-brand-500 flex items-center justify-center">
                <Brain className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold">AI Resume Parser</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">Extracts candidate skills, work history, education, and projects into structured JSON format automatically.</p>
            </Card>

            <Card className="glass-card space-y-4 hover:border-indigo-500/40 transition-colors">
              <div className="w-12 h-12 rounded-xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center">
                <Kanban className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold">Drag-and-Drop Pipeline</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">Interactive Kanban board with automated stage progression from Applied to Offer and Hired.</p>
            </Card>

            <Card className="glass-card space-y-4 hover:border-emerald-500/40 transition-colors">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                <Code2 className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold">Monaco Code Assessments</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">Built-in coding assessments with timer countdown, auto-submission, test cases, and tab-switch detection.</p>
            </Card>
          </div>
        </div>
      </section>

      {/* 3. AI Recruitment Engine */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <Badge variant="primary">Server-Side OpenAI Integration</Badge>
            <h2 className="text-3xl sm:text-4xl font-bold leading-tight">
              Intelligent Resume & Job Match Scoring
            </h2>
            <p className="text-slate-600 dark:text-slate-400">
              Our AI evaluates candidate resumes against job descriptions in real-time, calculating overall fit score, identifying matching and missing skills, and generating bias-free recommendations.
            </p>
            <ul className="space-y-3 text-sm font-medium">
              <li className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                <CheckCircle2 className="w-5 h-5 text-emerald-500" /> Dynamic match score percentage calculation
              </li>
              <li className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                <CheckCircle2 className="w-5 h-5 text-emerald-500" /> Explicit skill gap analysis & strength indicators
              </li>
              <li className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                <CheckCircle2 className="w-5 h-5 text-emerald-500" /> Strict bias elimination shield enforcing objective metrics
              </li>
            </ul>
          </div>
          <Card className="glass-card border-brand-500/30 p-8 space-y-6 bg-gradient-to-b from-slate-900 to-slate-950 text-white">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-brand-600 flex items-center justify-center font-bold text-white">JD</div>
                <div>
                  <div className="font-semibold text-sm">John Doe (Senior React Engineer)</div>
                  <div className="text-xs text-slate-400">Matched with Lead Frontend Developer</div>
                </div>
              </div>
              <Badge variant="success" className="text-sm px-3 py-1">87% Match</Badge>
            </div>
            <div className="space-y-4 text-xs">
              <div>
                <span className="text-slate-400 font-semibold block mb-1">STRONG MATCHING SKILLS:</span>
                <div className="flex flex-wrap gap-1.5">
                  <Badge variant="success">React</Badge>
                  <Badge variant="success">TypeScript</Badge>
                  <Badge variant="success">Node.js</Badge>
                  <Badge variant="success">GraphQL</Badge>
                </div>
              </div>
              <div>
                <span className="text-slate-400 font-semibold block mb-1">MISSING SKILLS:</span>
                <div className="flex flex-wrap gap-1.5">
                  <Badge variant="danger">AWS CDK</Badge>
                  <Badge variant="danger">Docker</Badge>
                </div>
              </div>
              <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-700">
                <span className="text-slate-400 font-semibold block mb-1">AI RECOMMENDATION:</span>
                <p className="text-slate-200">Strong candidate with deep frontend engineering experience. Highly recommended for Technical Interview phase.</p>
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* 4. Pricing */}
      <section id="pricing" className="py-20 bg-slate-100/50 dark:bg-slate-900/50 border-t border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 text-center">
          <div className="space-y-4 max-w-3xl mx-auto">
            <Badge variant="warning">Transparent Pricing</Badge>
            <h2 className="text-3xl sm:text-4xl font-bold">Scalable Plans for Any Hiring Speed</h2>
            <p className="text-slate-600 dark:text-slate-400">Start free for small teams or deploy enterprise features at scale.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 text-left">
            <Card className="glass-card p-8 space-y-6">
              <h3 className="text-xl font-bold">Starter</h3>
              <div className="text-4xl font-extrabold">$0 <span className="text-sm font-normal text-slate-500">/mo</span></div>
              <p className="text-xs text-slate-500">Perfect for startups posting 1-3 active jobs.</p>
              <Button variant="outline" className="w-full">Get Started</Button>
            </Card>
            <Card className="glass-card p-8 space-y-6 border-brand-500 shadow-2xl relative">
              <div className="absolute -top-3 right-6 bg-brand-500 text-white text-xs px-3 py-1 rounded-full font-bold">MOST POPULAR</div>
              <h3 className="text-xl font-bold">Growth Pro</h3>
              <div className="text-4xl font-extrabold">$149 <span className="text-sm font-normal text-slate-500">/mo</span></div>
              <p className="text-xs text-slate-500">Full AI matching, unlimited jobs & coding tests.</p>
              <Button variant="primary" className="w-full">Upgrade to Pro</Button>
            </Card>
            <Card className="glass-card p-8 space-y-6">
              <h3 className="text-xl font-bold">Enterprise</h3>
              <div className="text-4xl font-extrabold">Custom</div>
              <p className="text-xs text-slate-500">Custom OAuth, dedicated SLA & RBAC audit logs.</p>
              <Button variant="outline" className="w-full">Contact Sales</Button>
            </Card>
          </div>
        </div>
      </section>

      {/* 5. FAQ */}
      <section id="faq" className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="text-center space-y-4">
            <Badge variant="neutral">Got Questions?</Badge>
            <h2 className="text-3xl font-bold">Frequently Asked Questions</h2>
          </div>
          <div className="space-y-4">
            <Card className="glass-card p-6">
              <h4 className="font-bold text-base mb-2">How does the AI match score work?</h4>
              <p className="text-sm text-slate-600 dark:text-slate-400">Our backend AI service analyzes candidate resume skills, work duration, and project relevance against the specific requirements of the job description to produce a dynamic match percentage and skill gap breakdown.</p>
            </Card>
            <Card className="glass-card p-6">
              <h4 className="font-bold text-base mb-2">Is user authentication role-restricted?</h4>
              <p className="text-sm text-slate-600 dark:text-slate-400">Yes! The platform supports Candidate, Recruiter, Hiring Manager, Interviewer, and Admin roles with strict backend RBAC middleware ensuring interviewers cannot access salary data or unauthorized admin tools.</p>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
};
