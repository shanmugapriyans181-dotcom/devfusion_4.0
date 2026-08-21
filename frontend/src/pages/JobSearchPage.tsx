import React, { useEffect, useState } from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { jobApi, JobFilterParams } from '../services/job.api';
import { applicationApi } from '../services/application.api';
import { useAuth } from '../contexts/AuthContext';
import {
  Search,
  MapPin,
  Briefcase,
  DollarSign,
  Sparkles,
  Filter,
  CheckCircle2,
  Building,
  Clock
} from 'lucide-react';
import { Job } from '../types';

export const JobSearchPage: React.FC = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [keyword, setKeyword] = useState('');
  const [location, setLocation] = useState('');
  const [employmentType, setEmploymentType] = useState('');
  const [workMode, setWorkMode] = useState('');
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [coverLetter, setCoverLetter] = useState('');
  const [isApplying, setIsApplying] = useState(false);
  const [appliedJobs, setAppliedJobs] = useState<string[]>([]);
  const { user } = useAuth();

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      const params: JobFilterParams = { status: 'ACTIVE' };
      if (keyword) params.keyword = keyword;
      if (location) params.location = location;
      if (employmentType) params.employmentType = employmentType;
      if (workMode) params.workMode = workMode;

      const res = await jobApi.getJobs(params);
      setJobs(res.data || []);
    } catch (e) {
      console.error(e);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchJobs();
  };

  const handleApply = async () => {
    if (!selectedJob) return;
    setIsApplying(true);
    try {
      await applicationApi.apply({
        jobId: selectedJob.id,
        coverLetter,
      });
      setAppliedJobs((prev) => [...prev, selectedJob.id]);
      setSelectedJob(null);
      setCoverLetter('');
    } catch (e: any) {
      alert(e.message || 'Failed to submit application');
    } finally {
      setIsApplying(false);
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Search Header */}
      <div className="space-y-4 text-center max-w-3xl mx-auto pt-4">
        <Badge variant="primary">Intelligent Discovery Engine</Badge>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">Explore Open Positions</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">Discover engineering and AI opportunities with real-time AI resume match scores.</p>
      </div>

      {/* Filter Bar */}
      <Card className="glass-card p-6 border-brand-500/20">
        <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="relative md:col-span-2">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="Job title, skills (e.g. React, Node.js)"
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <div className="relative">
            <MapPin className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Location (e.g. Remote, SF)"
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <select
            value={workMode}
            onChange={(e) => setWorkMode(e.target.value)}
            className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 text-sm text-slate-900 dark:text-slate-100"
          >
            <option value="">All Work Modes</option>
            <option value="REMOTE">Remote</option>
            <option value="HYBRID">Hybrid</option>
            <option value="ON_SITE">On-site</option>
          </select>

          <Button type="submit" variant="primary">
            Search Jobs
          </Button>
        </form>
      </Card>

      {/* Jobs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {jobs.map((job: any, index) => {
          const isApplied = appliedJobs.includes(job.id);
          // AI Match calculation mock for demo feel (85% to 96%)
          const matchPercentage = 85 + (index * 3) % 12;

          return (
            <Card key={job.id} className="glass-card p-6 space-y-6 flex flex-col justify-between hover:border-brand-500/40 transition-colors">
              <div className="space-y-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-600 flex items-center justify-center text-white font-bold text-lg">
                      {job.company?.name ? job.company.name.charAt(0) : 'T'}
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-slate-900 dark:text-white">{job.title}</h3>
                      <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{job.company?.name || 'Company Name'} • {job.department}</div>
                    </div>
                  </div>
                  <Badge variant="success" className="text-xs font-bold px-3 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    <Sparkles className="w-3 h-3 mr-1 inline" />
                    {matchPercentage}% AI Match
                  </Badge>
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-3 leading-relaxed">
                  {job.description}
                </p>

                <div className="flex flex-wrap gap-2">
                  {job.skills?.map((sk: string) => (
                    <Badge key={sk} variant="neutral" className="text-[11px]">{sk}</Badge>
                  ))}
                </div>

                <div className="grid grid-cols-3 gap-2 text-[11px] text-slate-500 dark:text-slate-400 border-t border-slate-200 dark:border-slate-800 pt-3">
                  <div className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-brand-500" /> {job.location}
                  </div>
                  <div className="flex items-center gap-1">
                    <Briefcase className="w-3.5 h-3.5 text-indigo-500" /> {job.employmentType}
                  </div>
                  <div className="flex items-center gap-1">
                    <DollarSign className="w-3.5 h-3.5 text-emerald-500" /> ${job.salaryMin ? `${(job.salaryMin/1000).toFixed(0)}k - ${(job.salaryMax/1000).toFixed(0)}k` : 'Competitive'}
                  </div>
                </div>
              </div>

              <div className="pt-4 flex items-center justify-between border-t border-slate-200 dark:border-slate-800">
                <span className="text-[11px] text-slate-400">Posted {new Date(job.createdAt).toLocaleDateString()}</span>

                {user?.role === 'CANDIDATE' ? (
                  isApplied ? (
                    <Badge variant="success" className="py-1.5 px-3">
                      <CheckCircle2 className="w-3.5 h-3.5 mr-1 inline" /> Applied
                    </Badge>
                  ) : (
                    <Button variant="primary" size="sm" onClick={() => setSelectedJob(job)}>
                      Apply Now
                    </Button>
                  )
                ) : (
                  <Button variant="outline" size="sm" onClick={() => setSelectedJob(job)}>
                    View Job Details
                  </Button>
                )}
              </div>
            </Card>
          );
        })}
      </div>

      {/* Application Modal */}
      {selectedJob && (
        <Modal
          isOpen={!!selectedJob}
          onClose={() => setSelectedJob(null)}
          title={`Apply for ${selectedJob.title}`}
        >
          <div className="space-y-4 text-left">
            <div className="p-3 rounded-xl bg-brand-500/10 border border-brand-500/20 text-xs text-brand-400 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-brand-400 shrink-0" />
              <span>Your primary resume will be attached automatically.</span>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider mb-1 text-slate-400">Cover Letter (Optional)</label>
              <textarea
                rows={4}
                value={coverLetter}
                onChange={(e) => setCoverLetter(e.target.value)}
                placeholder="Explain why your technical background makes you a strong fit for this role..."
                className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-900/50 text-sm focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
              <Button variant="ghost" onClick={() => setSelectedJob(null)}>Cancel</Button>
              <Button variant="primary" onClick={handleApply} isLoading={isApplying}>Submit Application</Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
