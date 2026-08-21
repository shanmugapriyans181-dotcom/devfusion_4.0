import React, { useEffect, useState } from 'react';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { applicationApi } from '../services/application.api';
import { jobApi } from '../services/job.api';
import { offerApi } from '../services/offer.api';
import {
  Briefcase,
  Users,
  Calendar,
  CheckCircle2,
  TrendingUp,
  Award,
  Sparkles,
  ArrowRight,
  Plus,
  Clock,
  Check,
  Send,
  Mail
} from 'lucide-react';
import { Link } from 'react-router-dom';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';

export const RecruiterDashboard: React.FC = () => {
  const [applications, setApplications] = useState<any[]>([]);
  const [allJobs, setAllJobs] = useState<any[]>([]);
  const [allOffers, setAllOffers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRecruiterData();
  }, []);

  const fetchRecruiterData = async () => {
    try {
      const [appRes, jobRes, offerRes] = await Promise.all([
        applicationApi.getApplications(),
        jobApi.getJobs({ status: 'ALL' }),
        offerApi.getOffers(),
      ]);
      setApplications(appRes.data || []);
      setAllJobs(jobRes.data || []);
      setAllOffers(offerRes.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveJob = async (jobId: string) => {
    try {
      await jobApi.approveJob(jobId);
      alert('Job approved and published successfully! Candidates can now view and apply.');
      await fetchRecruiterData();
    } catch (e: any) {
      alert(e.message || 'Failed to approve job');
    }
  };

  const handleApproveOffer = async (offerId: string, candidateName: string) => {
    try {
      await offerApi.approveOffer(offerId);
      alert(`Offer letter for ${candidateName} approved! Status updated to SENT and automated email notification dispatched to candidate@demo.com.`);
      await fetchRecruiterData();
    } catch (e: any) {
      alert(e.message || 'Failed to approve offer letter');
    }
  };

  const activeJobs = allJobs.filter(j => j.status === 'ACTIVE');
  const pendingJobs = allJobs.filter(j => j.status === 'PENDING_RECRUITER_APPROVAL' || (j.status !== 'ACTIVE' && j.status !== 'CLOSED'));
  const pendingOffers = allOffers.filter(o => o.status === 'PENDING_RECRUITER_APPROVAL');

  // Recharts Funnel Data
  const funnelData = [
    { stage: 'Applied', count: applications.length },
    { stage: 'Screening', count: applications.filter(a => a.stage === 'SCREENING').length },
    { stage: 'Shortlisted', count: applications.filter(a => a.stage === 'SHORTLISTED').length },
    { stage: 'Tech Interview', count: applications.filter(a => a.stage === 'TECHNICAL_INTERVIEW').length },
    { stage: 'HR Interview', count: applications.filter(a => a.stage === 'HR_INTERVIEW').length },
    { stage: 'Offer', count: applications.filter(a => a.stage === 'OFFER').length },
    { stage: 'Hired', count: applications.filter(a => a.stage === 'HIRED').length },
  ];

  const conversionData = [
    { name: 'Shortlisted', value: applications.filter(a => a.stage === 'SHORTLISTED').length },
    { name: 'Interviewed', value: applications.filter(a => a.stage.includes('INTERVIEW')).length },
    { name: 'Offered', value: applications.filter(a => a.stage === 'OFFER').length },
    { name: 'Hired', value: applications.filter(a => a.stage === 'HIRED').length },
  ];

  const COLORS = ['#3b74f6', '#6366f1', '#8b5cf6', '#10b981'];

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-8 rounded-3xl text-white border border-slate-800 shadow-2xl">
        <div className="space-y-2">
          <Badge variant="primary">Talent Acquisition Suite</Badge>
          <h1 className="text-3xl font-extrabold tracking-tight">Recruiter Command Hub</h1>
          <p className="text-slate-400 text-sm max-w-xl">
            Review job postings submitted by Hiring Managers, approve positions, approve & dispatch offer letters to candidates, and manage pipeline.
          </p>
        </div>
        <Link to="/recruiter/jobs">
          <Button variant="primary">
            <Plus className="w-4 h-4 mr-1.5" /> Post New Position
          </Button>
        </Link>
      </div>

      {/* 4 Key Metrics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        <Card className="glass-card p-6 space-y-2">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex justify-between">
            <span>Total Active Jobs</span>
            <Briefcase className="w-4 h-4 text-brand-500" />
          </div>
          <div className="text-3xl font-bold">{activeJobs.length}</div>
          <div className="text-xs text-brand-400">Published & Live</div>
        </Card>

        <Card className="glass-card p-6 space-y-2">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex justify-between">
            <span>Pending Job Approvals</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-3xl font-bold text-amber-400">{pendingJobs.length}</div>
          <div className="text-xs text-amber-500 font-medium">From Hiring Managers</div>
        </Card>

        <Card className="glass-card p-6 space-y-2">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex justify-between">
            <span>Pending Offer Approvals</span>
            <Send className="w-4 h-4 text-purple-500" />
          </div>
          <div className="text-3xl font-bold text-purple-400">{pendingOffers.length}</div>
          <div className="text-xs text-purple-400 font-medium">Ready for Dispatch</div>
        </Card>

        <Card className="glass-card p-6 space-y-2">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex justify-between">
            <span>Total Applicants</span>
            <Users className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="text-3xl font-bold">{applications.length}</div>
          <div className="text-xs text-emerald-400 font-medium flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" /> Total Active Applications
          </div>
        </Card>
      </div>

      {/* Pending Job Approvals Section (From Hiring Managers) */}
      {pendingJobs.length > 0 && (
        <Card className="glass-card p-6 space-y-4 border-amber-500/30 bg-amber-950/10">
          <div className="flex items-center justify-between border-b border-amber-500/20 pb-3">
            <div>
              <h3 className="text-lg font-bold text-amber-400 flex items-center gap-2">
                <Clock className="w-5 h-5" />
                <span>Pending Job Requisitions (Submitted by Hiring Managers)</span>
              </h3>
              <p className="text-xs text-slate-400">Review job requisitions submitted by Hiring Managers and click Approve & Publish to make them visible to candidates.</p>
            </div>
            <Badge variant="warning">{pendingJobs.length} Pending</Badge>
          </div>

          <div className="divide-y divide-slate-800">
            {pendingJobs.map((job) => (
              <div key={job.id} className="py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="font-bold text-white text-base">{job.title}</div>
                  <div className="text-xs text-slate-400">{job.department} • {job.location} • {job.employmentType}</div>
                  <p className="text-xs text-slate-300 line-clamp-1">{job.description || 'No description provided.'}</p>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant="warning">PENDING APPROVAL</Badge>
                  <Button variant="primary" size="sm" onClick={() => handleApproveJob(job.id)}>
                    <Check className="w-4 h-4 mr-1" /> Approve & Publish Job
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Pending Offer Letter Approvals Section (From Hiring Managers) */}
      {pendingOffers.length > 0 && (
        <Card className="glass-card p-6 space-y-4 border-purple-500/30 bg-purple-950/10">
          <div className="flex items-center justify-between border-b border-purple-500/20 pb-3">
            <div>
              <h3 className="text-lg font-bold text-purple-400 flex items-center gap-2">
                <Mail className="w-5 h-5" />
                <span>Pending Offer Letter Approvals & Email Dispatch</span>
              </h3>
              <p className="text-xs text-slate-400">Hiring Managers generated these offer letters. Review compensation and click Approve & Send to dispatch in-app notice and email.</p>
            </div>
            <Badge variant="primary">{pendingOffers.length} Pending Approval</Badge>
          </div>

          <div className="divide-y divide-slate-800">
            {pendingOffers.map((offer) => (
              <div key={offer.id} className="py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="font-bold text-white text-base">{offer.position}</div>
                  <div className="text-xs text-slate-300">Prepared for: <strong>{offer.candidateName}</strong></div>
                  <div className="text-xs text-emerald-400 font-semibold">${offer.salary?.toLocaleString()} / year • Location: {offer.location}</div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant="warning">PENDING RECRUITER</Badge>
                  <Button
                    variant="primary"
                    size="sm"
                    className="bg-purple-600 hover:bg-purple-500"
                    onClick={() => handleApproveOffer(offer.id, offer.candidateName)}
                  >
                    <Send className="w-4 h-4 mr-1.5" /> Approve & Dispatch Offer (+ Email)
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Analytics Charts Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <Card className="glass-card p-6 space-y-4 md:col-span-2">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold">Hiring Funnel Progression</h3>
              <p className="text-xs text-slate-400">Candidates moving across pipeline stages</p>
            </div>
            <Badge variant="neutral">Real Time Metrics</Badge>
          </div>
          <div className="h-64 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={funnelData}>
                <XAxis dataKey="stage" stroke="#94a3b8" fontSize={12} />
                <YAxis stroke="#94a3b8" fontSize={12} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', color: '#fff' }}
                />
                <Bar dataKey="count" fill="#3b74f6" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="glass-card p-6 space-y-4">
          <h3 className="text-lg font-bold">Candidate Conversion</h3>
          <p className="text-xs text-slate-400">Distribution of evaluated applicants</p>
          <div className="h-64 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={conversionData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {conversionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', color: '#fff' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Recent Applications & Kanban Redirect */}
      <Card className="glass-card p-6 space-y-6">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div>
            <h3 className="text-lg font-bold">Recent Applicants</h3>
            <p className="text-xs text-slate-400">Review scores and move candidates across Kanban stages</p>
          </div>
          <Link to="/recruiter/pipeline">
            <Button variant="outline" size="sm">
              Open Kanban Board <ArrowRight className="w-4 h-4 ml-1.5" />
            </Button>
          </Link>
        </div>

        <div className="divide-y divide-slate-800">
          {applications.length === 0 ? (
            <div className="text-center py-8 text-xs text-slate-400">
              No candidate applications submitted yet.
            </div>
          ) : (
            applications.slice(0, 5).map((app: any) => (
              <div key={app.id} className="py-4 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <img
                    src={app.candidate?.user?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'}
                    alt="Avatar"
                    className="w-10 h-10 rounded-full border border-slate-700 object-cover"
                  />
                  <div>
                    <div className="font-semibold text-sm text-white">{app.candidate?.user?.name || 'Candidate'}</div>
                    <div className="text-xs text-slate-400">{app.job?.title} • {app.candidate?.user?.email}</div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <Badge variant="success" className="text-xs font-bold px-3 py-1">
                    <Sparkles className="w-3 h-3 mr-1 inline" />
                    {app.matchScore || 85}% Match
                  </Badge>
                  <Badge variant="primary">{app.stage?.replace('_', ' ')}</Badge>
                </div>
              </div>
            ))
          )}
        </div>
      </Card>
    </div>
  );
};
