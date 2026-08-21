import React, { useEffect, useState } from 'react';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { useAuth } from '../contexts/AuthContext';
import { applicationApi } from '../services/application.api';
import { offerApi } from '../services/offer.api';
import { jobApi } from '../services/job.api';
import { ApiClient } from '../services/api.client';
import {
  Users,
  CheckCircle2,
  XCircle,
  Sparkles,
  Award,
  Plus,
  Calendar,
  Clock,
  Send,
  Building,
  Edit,
  MapPin,
  Globe,
  Briefcase,
  DollarSign,
  FileText,
  Star,
  Check
} from 'lucide-react';

export const HiringManagerDashboard: React.FC = () => {
  const { user } = useAuth();
  const [applications, setApplications] = useState<any[]>([]);
  const [offers, setOffers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Profile & Company Edit Modal State
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [profileForm, setProfileForm] = useState({
    name: user?.name || '',
    roleTitle: 'Engineering Hiring Manager',
    location: user?.location || 'San Francisco, CA',
    companyName: 'HireAI Platform',
    companyDescription: 'Enterprise AI Recruitment & ATS Platform',
    companyIndustry: 'Software & Technology',
    companyWebsite: 'https://hireai.platform',
    companyLocation: 'San Francisco, CA (HQ)',
  });
  const [savingProfile, setSavingProfile] = useState(false);

  // Job creation modal state
  const [showJobModal, setShowJobModal] = useState(false);
  const [jobForm, setJobForm] = useState({
    title: '',
    companyName: 'HireAI Platform',
    location: 'San Francisco, CA (Hybrid)',
    department: 'Engineering',
    salaryMin: 140000,
    salaryMax: 190000,
    description: '',
    skills: 'React, Node.js, TypeScript, PostgreSQL, System Design',
    requirements: '3+ years experience, Strong analytical thinking, Team collaboration',
    workMode: 'HYBRID',
    employmentType: 'FULL_TIME',
  });
  const [creatingJob, setCreatingJob] = useState(false);

  // Offer Letter Generation Modal State
  const [showOfferModal, setShowOfferModal] = useState(false);
  const [selectedApp, setSelectedApp] = useState<any>(null);
  const [offerForm, setOfferForm] = useState({
    salary: 155000,
    position: '',
    location: 'San Francisco, CA',
    joiningDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
    benefits: 'Health Insurance, 401(k) Match, Unlimited PTO, Remote Stipend, Stock Options',
  });
  const [issuingOffer, setIssuingOffer] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [appRes, offerRes, profileRes] = await Promise.all([
        applicationApi.getApplications(),
        offerApi.getOffers(),
        ApiClient.get('/auth/me').catch(() => ({ data: null })),
      ]);

      setApplications(appRes.data || []);
      setOffers(offerRes.data || []);

      if (profileRes.data) {
        const u = profileRes.data;
        setProfileForm({
          name: u.name || '',
          roleTitle: u.role === 'HIRING_MANAGER' ? 'Hiring Manager / Director' : u.role,
          location: u.location || 'San Francisco, CA',
          companyName: u.company?.name || 'HireAI Platform',
          companyDescription: u.company?.description || 'Enterprise AI Recruitment & ATS Platform',
          companyIndustry: u.company?.industry || 'Software & Technology',
          companyWebsite: u.company?.website || 'https://hireai.platform',
          companyLocation: (u.company?.locations && u.company.locations[0]) || 'San Francisco, CA (HQ)',
        });
        setJobForm((prev) => ({
          ...prev,
          companyName: u.company?.name || 'HireAI Platform',
          location: (u.company?.locations && u.company.locations[0]) || 'San Francisco, CA (Hybrid)',
        }));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      await ApiClient.put('/auth/profile', profileForm);
      alert('Manager Profile & Company details updated successfully!');
      setShowProfileModal(false);
      await fetchData();
    } catch (err: any) {
      alert(err.message || 'Failed to update profile.');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleCreateJobRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreatingJob(true);
    try {
      await jobApi.createJob({
        title: jobForm.title,
        department: jobForm.department,
        location: jobForm.location,
        description: jobForm.description,
        requirements: jobForm.requirements.split(',').map((s) => s.trim()).filter(Boolean),
        skills: jobForm.skills.split(',').map((s) => s.trim()).filter(Boolean),
        salaryMin: Number(jobForm.salaryMin),
        salaryMax: Number(jobForm.salaryMax),
        employmentType: jobForm.employmentType as any,
        workMode: jobForm.workMode as any,
        status: 'PENDING_RECRUITER_APPROVAL' as any,
      });
      alert('Job requisition submitted! Recruiter will review and publish it for candidates.');
      setShowJobModal(false);
      setJobForm((prev) => ({ ...prev, title: '', description: '' }));
      await fetchData();
    } catch (err: any) {
      alert(err.message || 'Failed to create job.');
    } finally {
      setCreatingJob(false);
    }
  };

  const handleOpenOfferModal = (app: any) => {
    setSelectedApp(app);
    setOfferForm({
      salary: app.job?.salaryMin || 155000,
      position: app.job?.title || 'Software Engineer',
      location: app.job?.location || 'San Francisco, CA',
      joiningDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
      benefits: 'Health, Dental, Vision Insurance, 401(k) Match, Stock Equity, Remote Work Allowance',
    });
    setShowOfferModal(true);
  };

  const handleIssueOffer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedApp) return;

    setIssuingOffer(true);
    try {
      const candidateName = selectedApp.candidate?.user?.name || selectedApp.candidateName || 'Candidate';
      const benefitsArr = offerForm.benefits.split(',').map((b) => b.trim()).filter(Boolean);

      await offerApi.createOffer({
        applicationId: selectedApp.id,
        candidateName,
        position: offerForm.position,
        salary: Number(offerForm.salary),
        joiningDate: offerForm.joiningDate,
        location: offerForm.location,
        benefits: benefitsArr,
      });

      alert(`Official Offer Letter issued and sent to ${candidateName}! Candidate can now review and accept.`);
      setShowOfferModal(false);
      await fetchData();
    } catch (err: any) {
      alert(err.message || 'Failed to generate offer letter.');
    } finally {
      setIssuingOffer(false);
    }
  };

  const handleUpdateStage = async (appId: string, stage: string) => {
    try {
      await applicationApi.updateStage(appId, stage as any);
      await fetchData();
    } catch (e) {
      console.error(e);
    }
  };

  // Metrics
  const interviewApps = applications.filter(
    (a) => a.stage === 'TECHNICAL_INTERVIEW' || a.stage === 'HR_INTERVIEW' || a.stage === 'SHORTLISTED'
  );
  const decisionReady = applications.filter((a) => a.stage === 'OFFER' || a.stage === 'HR_INTERVIEW');

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-purple-500/10 text-purple-400">
              <Award className="w-5 h-5" />
            </span>
            <h1 className="text-3xl font-bold tracking-tight text-white">Hiring Manager Decision Board</h1>
          </div>
          <p className="text-sm text-slate-400 mt-1">
            Company: <strong className="text-purple-400">{profileForm.companyName}</strong> ({profileForm.companyLocation}) • Welcome, {user?.name}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={() => setShowProfileModal(true)} className="flex items-center gap-1.5">
            <Building className="w-4 h-4 text-purple-400" /> Edit Company & Profile
          </Button>

          <Button variant="primary" onClick={() => setShowJobModal(true)} className="shadow-lg shadow-purple-500/20 flex items-center gap-1.5">
            <Plus className="w-4 h-4" /> Create Job for Approval
          </Button>
        </div>
      </div>

      {/* Company & Role Overview Banner */}
      <Card className="glass-card p-6 bg-gradient-to-r from-slate-900 via-purple-950/20 to-slate-900 border-purple-500/20">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Building className="w-5 h-5 text-purple-400" />
              <h2 className="text-lg font-bold text-white">{profileForm.companyName}</h2>
              <Badge variant="neutral">{profileForm.companyIndustry}</Badge>
            </div>
            <p className="text-xs text-slate-400 max-w-2xl">{profileForm.companyDescription}</p>
            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 pt-1">
              <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5 text-indigo-400" /> {profileForm.companyLocation}</span>
              <span className="flex items-center gap-1"><Globe className="w-3.5 h-3.5 text-emerald-400" /> {profileForm.companyWebsite}</span>
              <span className="flex items-center gap-1"><Briefcase className="w-3.5 h-3.5 text-purple-400" /> Role: {profileForm.roleTitle}</span>
            </div>
          </div>

          <Button size="sm" variant="ghost" onClick={() => setShowProfileModal(true)} className="text-xs text-purple-400 hover:text-purple-300">
            <Edit className="w-3.5 h-3.5 mr-1" /> Update Information
          </Button>
        </div>
      </Card>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="glass-card p-6 space-y-2">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex justify-between">
            <span>Candidates in Pipeline</span>
            <Users className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-3xl font-bold text-white">{applications.length}</div>
          <div className="text-xs text-slate-500">Across all job openings</div>
        </Card>

        <Card className="glass-card p-6 space-y-2">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex justify-between">
            <span>Interview Stage</span>
            <Calendar className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-3xl font-bold text-indigo-400">{interviewApps.length}</div>
          <div className="text-xs text-slate-500">Technical & HR rounds</div>
        </Card>

        <Card className="glass-card p-6 space-y-2">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex justify-between">
            <span>Ready for Decision</span>
            <Award className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-3xl font-bold text-amber-400">{decisionReady.length}</div>
          <div className="text-xs text-amber-500/80">Pending Offer Decision</div>
        </Card>

        <Card className="glass-card p-6 space-y-2">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex justify-between">
            <span>Offers Issued</span>
            <Send className="w-4 h-4 text-green-400" />
          </div>
          <div className="text-3xl font-bold text-green-400">{offers.length}</div>
          <div className="text-xs text-emerald-500/80">Active Offer Letters</div>
        </Card>
      </div>

      {/* Candidate Evaluation & Offer Issuing Board */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div>
            <h2 className="text-xl font-bold text-white">Candidate Review & Final Hiring Board</h2>
            <p className="text-xs text-slate-400">Review candidate resume match scores, interview ratings, and issue official offer letters.</p>
          </div>
          <Badge variant="primary">{applications.length} Total Candidates</Badge>
        </div>

        {applications.length === 0 ? (
          <Card className="glass-card p-12 text-center text-slate-400">
            <Users className="w-12 h-12 mx-auto mb-3 opacity-30 text-purple-400" />
            <p className="text-lg font-semibold text-white">No candidates applied yet</p>
            <p className="text-xs text-slate-500 mt-1">Once candidates apply to published jobs, they will appear here for your review and offer decision.</p>
          </Card>
        ) : (
          <div className="space-y-4">
            {applications.map((app) => {
              const candidateName = app.candidate?.user?.name || app.candidateName || 'Applicant';
              const email = app.candidate?.user?.email || app.email || 'candidate@example.com';
              const matchScore = app.matchScore || app.aiScore || 88;
              const hasOffer = offers.some((o) => o.applicationId === app.id);

              return (
                <Card key={app.id} className="glass-card p-6 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
                  <div className="space-y-2 flex-1">
                    <div className="flex flex-wrap items-center gap-3">
                      <h3 className="text-lg font-bold text-white">{candidateName}</h3>
                      <span className="text-xs text-slate-400">{email}</span>
                      <Badge
                        variant={
                          app.stage === 'HIRED' || app.stage === 'OFFER'
                            ? 'success'
                            : app.stage === 'REJECTED'
                            ? 'danger'
                            : 'warning'
                        }
                      >
                        {app.stage}
                      </Badge>
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-500/10 text-purple-400 border border-purple-500/20 flex items-center gap-1">
                        <Sparkles className="w-3 h-3" /> AI Match: {matchScore}%
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400">
                      <span className="flex items-center gap-1">
                        <Briefcase className="w-3.5 h-3.5 text-purple-400" /> Applied for: <strong>{app.job?.title || 'Software Position'}</strong>
                      </span>
                      <span className="flex items-center gap-1">
                        <Building className="w-3.5 h-3.5 text-indigo-400" /> {app.job?.department || 'Engineering'}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-emerald-400" /> {app.job?.location || 'Remote'}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    {/* Promote Stage */}
                    {app.stage !== 'OFFER' && app.stage !== 'HIRED' && app.stage !== 'REJECTED' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleUpdateStage(app.id, 'OFFER')}
                        className="text-xs"
                      >
                        Move to Offer Stage
                      </Button>
                    )}

                    {/* Issue Offer Letter Button */}
                    {!hasOffer ? (
                      <Button
                        size="sm"
                        variant="primary"
                        onClick={() => handleOpenOfferModal(app)}
                        className="bg-gradient-to-r from-green-600 to-emerald-600 text-white font-bold shadow-lg shadow-green-500/20 flex items-center gap-1.5"
                      >
                        <Send className="w-4 h-4" /> Issue Offer Letter
                      </Button>
                    ) : (
                      <span className="px-3 py-1.5 rounded-xl bg-green-500/10 text-green-400 border border-green-500/20 text-xs font-bold flex items-center gap-1">
                        <Check className="w-4 h-4" /> Offer Dispatched
                      </span>
                    )}

                    {app.stage !== 'REJECTED' && app.stage !== 'HIRED' && (
                      <Button
                        size="sm"
                        variant="danger"
                        onClick={() => handleUpdateStage(app.id, 'REJECTED')}
                        title="Reject Candidate"
                      >
                        <XCircle className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Edit Company & Manager Profile Modal */}
      <Modal isOpen={showProfileModal} onClose={() => setShowProfileModal(false)} title="Edit Company & Manager Profile">
        <form onSubmit={handleUpdateProfile} className="space-y-4 text-left">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider mb-1 text-slate-300">Manager Full Name</label>
              <input
                type="text"
                required
                value={profileForm.name}
                onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-slate-800 bg-slate-900 text-sm text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider mb-1 text-slate-300">Designation / Role Title</label>
              <input
                type="text"
                required
                value={profileForm.roleTitle}
                onChange={(e) => setProfileForm({ ...profileForm, roleTitle: e.target.value })}
                placeholder="VP of Engineering / Hiring Manager"
                className="w-full p-2.5 rounded-xl border border-slate-800 bg-slate-900 text-sm text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider mb-1 text-slate-300">Company Name</label>
              <input
                type="text"
                required
                value={profileForm.companyName}
                onChange={(e) => setProfileForm({ ...profileForm, companyName: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-slate-800 bg-slate-900 text-sm text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider mb-1 text-slate-300">Industry</label>
              <input
                type="text"
                required
                value={profileForm.companyIndustry}
                onChange={(e) => setProfileForm({ ...profileForm, companyIndustry: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-slate-800 bg-slate-900 text-sm text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider mb-1 text-slate-300">Company Location & Address</label>
            <input
              type="text"
              required
              value={profileForm.companyLocation}
              onChange={(e) => setProfileForm({ ...profileForm, companyLocation: e.target.value })}
              placeholder="e.g. 500 Howard St, San Francisco, CA"
              className="w-full p-2.5 rounded-xl border border-slate-800 bg-slate-900 text-sm text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider mb-1 text-slate-300">Company Website</label>
            <input
              type="url"
              value={profileForm.companyWebsite}
              onChange={(e) => setProfileForm({ ...profileForm, companyWebsite: e.target.value })}
              className="w-full p-2.5 rounded-xl border border-slate-800 bg-slate-900 text-sm text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider mb-1 text-slate-300">Company Overview & Description</label>
            <textarea
              rows={3}
              value={profileForm.companyDescription}
              onChange={(e) => setProfileForm({ ...profileForm, companyDescription: e.target.value })}
              className="w-full p-2.5 rounded-xl border border-slate-800 bg-slate-900 text-sm text-white"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
            <Button variant="ghost" type="button" onClick={() => setShowProfileModal(false)}>Cancel</Button>
            <Button variant="primary" type="submit" isLoading={savingProfile}>Save Company & Profile</Button>
          </div>
        </form>
      </Modal>

      {/* Create Job Modal for Recruiter Approval */}
      <Modal isOpen={showJobModal} onClose={() => setShowJobModal(false)} title="Create Job Requisition for Recruiter Approval">
        <form onSubmit={handleCreateJobRequest} className="space-y-4 text-left">
          <div className="p-3 bg-purple-500/10 border border-purple-500/20 rounded-xl text-xs text-purple-300">
            Posting on behalf of: <strong>{profileForm.companyName}</strong> ({profileForm.companyLocation}). Recruiter will approve before publishing to candidates.
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider mb-1 text-slate-300">Job Title</label>
            <input
              type="text"
              required
              value={jobForm.title}
              onChange={(e) => setJobForm({ ...jobForm, title: e.target.value })}
              placeholder="Lead Full-Stack Engineer"
              className="w-full p-2.5 rounded-xl border border-slate-800 bg-slate-900 text-sm text-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider mb-1 text-slate-300">Company Name</label>
              <input
                type="text"
                required
                value={jobForm.companyName}
                onChange={(e) => setJobForm({ ...jobForm, companyName: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-slate-800 bg-slate-900 text-sm text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider mb-1 text-slate-300">Location / Address</label>
              <input
                type="text"
                required
                value={jobForm.location}
                onChange={(e) => setJobForm({ ...jobForm, location: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-slate-800 bg-slate-900 text-sm text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider mb-1 text-slate-300">Department</label>
              <input
                type="text"
                required
                value={jobForm.department}
                onChange={(e) => setJobForm({ ...jobForm, department: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-slate-800 bg-slate-900 text-sm text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider mb-1 text-slate-300">Work Mode</label>
              <select
                value={jobForm.workMode}
                onChange={(e) => setJobForm({ ...jobForm, workMode: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-slate-800 bg-slate-900 text-sm text-white"
              >
                <option value="REMOTE">Remote</option>
                <option value="HYBRID">Hybrid</option>
                <option value="ON_SITE">On-Site</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider mb-1 text-slate-300">Min Salary ($)</label>
              <input
                type="number"
                value={jobForm.salaryMin}
                onChange={(e) => setJobForm({ ...jobForm, salaryMin: Number(e.target.value) })}
                className="w-full p-2.5 rounded-xl border border-slate-800 bg-slate-900 text-sm text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider mb-1 text-slate-300">Max Salary ($)</label>
              <input
                type="number"
                value={jobForm.salaryMax}
                onChange={(e) => setJobForm({ ...jobForm, salaryMax: Number(e.target.value) })}
                className="w-full p-2.5 rounded-xl border border-slate-800 bg-slate-900 text-sm text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider mb-1 text-slate-300">Required Skills (Comma separated)</label>
            <input
              type="text"
              required
              value={jobForm.skills}
              onChange={(e) => setJobForm({ ...jobForm, skills: e.target.value })}
              className="w-full p-2.5 rounded-xl border border-slate-800 bg-slate-900 text-sm text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider mb-1 text-slate-300">Job Description & Responsibilities</label>
            <textarea
              rows={3}
              required
              value={jobForm.description}
              onChange={(e) => setJobForm({ ...jobForm, description: e.target.value })}
              placeholder="Describe role responsibilities, deliverables, team expectations..."
              className="w-full p-2.5 rounded-xl border border-slate-800 bg-slate-900 text-sm text-white"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
            <Button variant="ghost" type="button" onClick={() => setShowJobModal(false)}>Cancel</Button>
            <Button variant="primary" type="submit" isLoading={creatingJob}>Submit Job for Recruiter Approval</Button>
          </div>
        </form>
      </Modal>

      {/* Offer Letter Issuing Modal */}
      <Modal isOpen={showOfferModal} onClose={() => setShowOfferModal(false)} title="Issue Official Offer Letter">
        <form onSubmit={handleIssueOffer} className="space-y-4 text-left">
          <div className="p-3.5 bg-green-500/10 border border-green-500/20 rounded-xl text-xs text-green-300">
            Candidate: <strong>{selectedApp?.candidate?.user?.name || selectedApp?.candidateName}</strong> ({selectedApp?.candidate?.user?.email || selectedApp?.email})
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider mb-1 text-slate-300">Position Title</label>
              <input
                type="text"
                required
                value={offerForm.position}
                onChange={(e) => setOfferForm({ ...offerForm, position: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-slate-800 bg-slate-900 text-sm text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider mb-1 text-slate-300">Annual Base Salary ($)</label>
              <input
                type="number"
                required
                value={offerForm.salary}
                onChange={(e) => setOfferForm({ ...offerForm, salary: Number(e.target.value) })}
                className="w-full p-2.5 rounded-xl border border-slate-800 bg-slate-900 text-sm text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider mb-1 text-slate-300">Joining Date</label>
              <input
                type="date"
                required
                value={offerForm.joiningDate}
                onChange={(e) => setOfferForm({ ...offerForm, joiningDate: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-slate-800 bg-slate-900 text-sm text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider mb-1 text-slate-300">Work Location</label>
              <input
                type="text"
                required
                value={offerForm.location}
                onChange={(e) => setOfferForm({ ...offerForm, location: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-slate-800 bg-slate-900 text-sm text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider mb-1 text-slate-300">Benefits & Perks (Comma separated)</label>
            <textarea
              rows={2}
              required
              value={offerForm.benefits}
              onChange={(e) => setOfferForm({ ...offerForm, benefits: e.target.value })}
              className="w-full p-2.5 rounded-xl border border-slate-800 bg-slate-900 text-sm text-white"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
            <Button variant="ghost" type="button" onClick={() => setShowOfferModal(false)}>Cancel</Button>
            <Button variant="primary" type="submit" isLoading={issuingOffer} className="bg-green-600 hover:bg-green-500">
              <Send className="w-4 h-4 mr-1.5" /> Dispatch Official Offer
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
