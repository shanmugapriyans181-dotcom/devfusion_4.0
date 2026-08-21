import React, { useEffect, useState } from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { useAuth } from '../contexts/AuthContext';
import { jobApi } from '../services/job.api';
import {
  Briefcase,
  Plus,
  Copy,
  XCircle,
  Trash2,
  MapPin,
  DollarSign,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Building
} from 'lucide-react';
import { Job } from '../types';

export const JobManagementPage: React.FC = () => {
  const { user } = useAuth();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [activeTab, setActiveTab] = useState<'ALL' | 'ACTIVE' | 'PENDING' | 'CLOSED'>('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [department, setDepartment] = useState('Engineering');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('San Francisco, CA');
  const [skillsStr, setSkillsStr] = useState('React, TypeScript, Node.js');
  const [salaryMin, setSalaryMin] = useState('140000');
  const [salaryMax, setSalaryMax] = useState('180000');
  const [employmentType, setEmploymentType] = useState('FULL_TIME');
  const [workMode, setWorkMode] = useState('HYBRID');
  const [isLoading, setIsLoading] = useState(false);
  const [approvingId, setApprovingId] = useState<string | null>(null);

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      const res = await jobApi.getJobs({ status: 'ALL' });
      setJobs(res.data || []);
    } catch (e) {
      console.error(e);
    }
  };

  const handleCreateJob = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const skills = skillsStr.split(',').map((s) => s.trim()).filter(Boolean);
      await jobApi.createJob({
        title,
        department,
        description,
        location,
        skills,
        salaryMin: Number(salaryMin),
        salaryMax: Number(salaryMax),
        employmentType: employmentType as any,
        workMode: workMode as any,
      } as any);
      setIsModalOpen(false);
      setTitle('');
      setDescription('');
      await fetchJobs();
    } catch (e: any) {
      alert(e.message || 'Failed to create job posting');
    } finally {
      setIsLoading(false);
    }
  };

  const handleApproveJob = async (id: string) => {
    setApprovingId(id);
    try {
      await jobApi.approveJob(id);
      await fetchJobs();
    } catch (e: any) {
      alert(e.message || 'Failed to approve job');
    } finally {
      setApprovingId(null);
    }
  };

  const handleDuplicate = async (id: string) => {
    try {
      await jobApi.duplicateJob(id);
      await fetchJobs();
    } catch (e) {
      console.error(e);
    }
  };

  const handleClose = async (id: string) => {
    try {
      await jobApi.closeJob(id);
      await fetchJobs();
    } catch (e) {
      console.error(e);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this job posting?')) return;
    try {
      await jobApi.deleteJob(id);
      await fetchJobs();
    } catch (e) {
      console.error(e);
    }
  };

  // Tab Filtering
  const filteredJobs = jobs.filter((job) => {
    if (activeTab === 'ACTIVE') return job.status === 'ACTIVE';
    if (activeTab === 'PENDING') return job.status === 'PENDING_RECRUITER_APPROVAL';
    if (activeTab === 'CLOSED') return job.status === 'CLOSED';
    return true;
  });

  const pendingCount = jobs.filter((j) => j.status === 'PENDING_RECRUITER_APPROVAL').length;
  const activeCount = jobs.filter((j) => j.status === 'ACTIVE').length;

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Job Postings Management</h1>
          <p className="text-sm text-slate-400 mt-1">
            {user?.role === 'HIRING_MANAGER'
              ? 'Create requisitions and submit them for Recruiter approval.'
              : 'Review manager submissions, approve & publish live job postings.'}
          </p>
        </div>
        <Button variant="primary" onClick={() => setIsModalOpen(true)} className="shadow-lg shadow-purple-500/20">
          <Plus className="w-4 h-4 mr-1.5" />
          {user?.role === 'HIRING_MANAGER' ? 'Create Job for Approval' : 'Post New Job'}
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
        <button
          onClick={() => setActiveTab('ALL')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            activeTab === 'ALL'
              ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/20'
              : 'bg-slate-900 text-slate-400 hover:text-white'
          }`}
        >
          All Jobs ({jobs.length})
        </button>
        <button
          onClick={() => setActiveTab('ACTIVE')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            activeTab === 'ACTIVE'
              ? 'bg-green-600 text-white shadow-lg shadow-green-500/20'
              : 'bg-slate-900 text-slate-400 hover:text-white'
          }`}
        >
          Active / Live ({activeCount})
        </button>
        <button
          onClick={() => setActiveTab('PENDING')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
            activeTab === 'PENDING'
              ? 'bg-amber-600 text-white shadow-lg shadow-amber-500/20'
              : 'bg-slate-900 text-slate-400 hover:text-white'
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          Pending Approvals {pendingCount > 0 && <span className="bg-amber-500 text-slate-950 font-bold px-1.5 py-0.2 rounded-full text-[10px] ml-1">{pendingCount}</span>}
        </button>
        <button
          onClick={() => setActiveTab('CLOSED')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            activeTab === 'CLOSED'
              ? 'bg-slate-700 text-white'
              : 'bg-slate-900 text-slate-400 hover:text-white'
          }`}
        >
          Closed
        </button>
      </div>

      {/* Jobs List */}
      <div className="grid grid-cols-1 gap-4">
        {filteredJobs.length === 0 ? (
          <Card className="glass-card p-12 text-center text-slate-400">
            <Building className="w-12 h-12 mx-auto mb-3 opacity-30 text-purple-400" />
            <p className="text-lg font-semibold text-white">No jobs found</p>
            <p className="text-xs text-slate-500 mt-1">
              {activeTab === 'PENDING'
                ? 'No pending job requisitions awaiting recruiter approval.'
                : 'Click "Post New Job" to create a new job opening.'}
            </p>
          </Card>
        ) : (
          filteredJobs.map((job) => {
            const isPending = job.status === 'PENDING_RECRUITER_APPROVAL';
            const canApprove = (user?.role === 'RECRUITER' || user?.role === 'ADMIN') && isPending;

            return (
              <Card
                key={job.id}
                className={`glass-card p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 transition-all ${
                  isPending ? 'border-amber-500/30 bg-amber-500/5' : ''
                }`}
              >
                <div className="space-y-2.5">
                  <div className="flex flex-wrap items-center gap-3">
                    <h3 className="text-lg font-bold text-white">{job.title}</h3>
                    <Badge
                      variant={
                        job.status === 'ACTIVE'
                          ? 'success'
                          : isPending
                          ? 'warning'
                          : 'neutral'
                      }
                    >
                      {isPending ? 'PENDING RECRUITER APPROVAL' : job.status}
                    </Badge>
                  </div>

                  {isPending && (
                    <div className="flex items-center gap-1.5 text-xs text-amber-400 bg-amber-500/10 px-3 py-1 rounded-lg border border-amber-500/20">
                      <Clock className="w-3.5 h-3.5" />
                      <span>
                        Created by <strong>{job.createdBy?.name || 'Hiring Manager'}</strong>. Requires Recruiter approval to publish live for candidates.
                      </span>
                    </div>
                  )}

                  <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400">
                    <span className="flex items-center gap-1">
                      <Briefcase className="w-3.5 h-3.5 text-purple-400" /> {job.department}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-indigo-400" /> {job.location} ({job.workMode})
                    </span>
                    <span className="flex items-center gap-1">
                      <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
                      {job.salaryMin ? `$${(job.salaryMin / 1000).toFixed(0)}k - $${(job.salaryMax! / 1000).toFixed(0)}k` : 'Competitive'}
                    </span>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {/* Recruiter 1-Click Approve Button */}
                  {canApprove && (
                    <Button
                      variant="primary"
                      size="sm"
                      isLoading={approvingId === job.id}
                      onClick={() => handleApproveJob(job.id)}
                      className="bg-green-600 hover:bg-green-500 text-white font-bold shadow-lg shadow-green-500/20"
                    >
                      <CheckCircle2 className="w-4 h-4 mr-1" /> Approve & Post Job
                    </Button>
                  )}

                  <Button variant="outline" size="sm" onClick={() => handleDuplicate(job.id)} title="Duplicate Job">
                    <Copy className="w-4 h-4 mr-1" /> Duplicate
                  </Button>

                  {job.status === 'ACTIVE' && (
                    <Button variant="secondary" size="sm" onClick={() => handleClose(job.id)} title="Close Job">
                      <XCircle className="w-4 h-4 mr-1" /> Close
                    </Button>
                  )}

                  <Button variant="danger" size="sm" onClick={() => handleDelete(job.id)} title="Delete Job">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </Card>
            );
          })
        )}
      </div>

      {/* Create Job Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={user?.role === 'HIRING_MANAGER' ? 'Create Job for Recruiter Approval' : 'Create & Post New Job'}
      >
        <form onSubmit={handleCreateJob} className="space-y-4 text-left">
          {user?.role === 'HIRING_MANAGER' && (
            <div className="p-3 bg-purple-500/10 border border-purple-500/20 rounded-xl text-xs text-purple-300 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-purple-400" />
              <span>
                As a <strong>Hiring Manager</strong>, your job posting will be sent to the Recruiter team for review and approval before going live to candidates.
              </span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider mb-1 text-slate-300">Job Title</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Senior AI Engineer"
              className="w-full p-2.5 rounded-xl border border-slate-800 bg-slate-900 text-sm text-white focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider mb-1 text-slate-300">Department</label>
              <input
                type="text"
                required
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-800 bg-slate-900 text-sm text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider mb-1 text-slate-300">Location</label>
              <input
                type="text"
                required
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-800 bg-slate-900 text-sm text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider mb-1 text-slate-300">Job Description</label>
            <textarea
              rows={3}
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Detailed description of responsibilities and core tech stack..."
              className="w-full p-2.5 rounded-xl border border-slate-800 bg-slate-900 text-sm text-white focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider mb-1 text-slate-300">
              Required Skills (Comma Separated)
            </label>
            <input
              type="text"
              value={skillsStr}
              onChange={(e) => setSkillsStr(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-800 bg-slate-900 text-sm text-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider mb-1 text-slate-300">Min Salary ($)</label>
              <input
                type="number"
                value={salaryMin}
                onChange={(e) => setSalaryMin(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-800 bg-slate-900 text-sm text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider mb-1 text-slate-300">Max Salary ($)</label>
              <input
                type="number"
                value={salaryMax}
                onChange={(e) => setSalaryMax(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-800 bg-slate-900 text-sm text-white"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <Button variant="ghost" type="button" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" isLoading={isLoading}>
              {user?.role === 'HIRING_MANAGER' ? 'Submit Job for Recruiter Approval' : 'Publish Job Posting'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
