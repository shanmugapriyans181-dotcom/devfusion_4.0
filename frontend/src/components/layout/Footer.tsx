import React from 'react';
import { Sparkles, Github, Twitter, Linkedin } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-900 text-slate-400 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 grid grid-cols-1 md:grid-cols-4 gap-8">
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-xl font-bold text-white">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-brand-600 to-indigo-600 flex items-center justify-center text-white">
              <Sparkles className="w-4 h-4" />
            </div>
            <span>HireAI ATS</span>
          </div>
          <p className="text-sm text-slate-400">
            AI-Powered Recruitment. Smarter Hiring. Streamlining the full hiring lifecycle from candidate sourcing to offer letter.
          </p>
          <div className="flex items-center gap-4 text-slate-400">
            <a href="#" className="hover:text-white transition-colors"><Twitter className="w-4 h-4" /></a>
            <a href="#" className="hover:text-white transition-colors"><Github className="w-4 h-4" /></a>
            <a href="#" className="hover:text-white transition-colors"><Linkedin className="w-4 h-4" /></a>
          </div>
        </div>

        <div>
          <h4 className="text-sm font-semibold text-slate-200 uppercase tracking-wider mb-4">Product</h4>
          <ul className="space-y-2 text-sm">
            <li><a href="#features" className="hover:text-white transition-colors">AI Resume Parser</a></li>
            <li><a href="#features" className="hover:text-white transition-colors">AI Candidate Match</a></li>
            <li><a href="#features" className="hover:text-white transition-colors">Kanban Pipeline</a></li>
            <li><a href="#features" className="hover:text-white transition-colors">Coding Assessments</a></li>
            <li><a href="#features" className="hover:text-white transition-colors">Offer Management</a></li>
          </ul>
        </div>

        <div>
          <h4 className="text-sm font-semibold text-slate-200 uppercase tracking-wider mb-4">Roles</h4>
          <ul className="space-y-2 text-sm">
            <li><a href="#" className="hover:text-white transition-colors">Candidate Portal</a></li>
            <li><a href="#" className="hover:text-white transition-colors">Recruiter Hub</a></li>
            <li><a href="#" className="hover:text-white transition-colors">Hiring Manager Suite</a></li>
            <li><a href="#" className="hover:text-white transition-colors">Interviewer Portal</a></li>
            <li><a href="#" className="hover:text-white transition-colors">Admin Control</a></li>
          </ul>
        </div>

        <div>
          <h4 className="text-sm font-semibold text-slate-200 uppercase tracking-wider mb-4">Enterprise</h4>
          <ul className="space-y-2 text-sm">
            <li><a href="#" className="hover:text-white transition-colors">Security & RBAC</a></li>
            <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
            <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
            <li><a href="#" className="hover:text-white transition-colors">Contact Sales</a></li>
          </ul>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 border-t border-slate-800 text-xs text-center text-slate-500">
        &copy; {new Date().getFullYear()} HireAI ATS. All rights reserved. Built for Hackathon Excellence.
      </div>
    </footer>
  );
};
