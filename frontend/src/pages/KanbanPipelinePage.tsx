import React, { useEffect, useState } from 'react';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { applicationApi } from '../services/application.api';
import { ApiClient } from '../services/api.client';
import { ApplicationStage } from '../types';
import {
  Sparkles,
  User,
  ArrowRight,
  ExternalLink,
  Code,
  Calendar,
  Send,
  XCircle,
  Award,
  CheckCircle2,
  Clock,
  Briefcase,
  Building,
  Filter,
  Check,
  Search,
  FileText
} from 'lucide-react';

const STAGE_CONFIG: { key: string; label: string; bg: string; border: string; text: string }[] = [
  { key: 'ALL', label: 'All Candidates', bg: 'bg-purple-500/10', border: 'border-purple-500/30', text: 'text-purple-400' },
  { key: 'APPLIED', label: '1. Applied', bg: 'bg-slate-500/10', border: 'border-slate-500/30', text: 'text-slate-300' },
  { key: 'SCREENING', label: '2. Screening Round', bg: 'bg-sky-500/10', border: 'border-sky-500/30', text: 'text-sky-400' },
  { key: 'SHORTLISTED', label: '3. Screening Passed', bg: 'bg-indigo-500/10', border: 'border-indigo-500/30', text: 'text-indigo-400' },
  { key: 'TECHNICAL_INTERVIEW', label: '4. Tech Interview', bg: 'bg-purple-500/10', border: 'border-purple-500/30', text: 'text-purple-400' },
  { key: 'OFFER', label: '5. Manager / HR Review', bg: 'bg-amber-500/10', border: 'border-amber-500/30', text: 'text-amber-400' },
  { key: 'HIRED', label: '6. Hired 🎉', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', text: 'text-emerald-400' },
  { key: 'REJECTED', label: 'Rejected ❌', bg: 'bg-rose-500/10', border: 'border-rose-500/30', text: 'text-rose-400' },
];

export const KanbanPipelinePage: React.FC = () => {
  const [applications, setApplications] = useState<any[]>([]);
  const [interviewers, setInterviewers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<string>('ALL');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  // Screening Assignment Modal
  const [selectedAppForScreening, setSelectedAppForScreening] = useState<any | null>(null);
  const [screeningForm, setScreeningForm] = useState({
    testTitle: 'HackerRank / HackerEarth Technical Screening',
    testUrl: 'https://www.hackerrank.com/tests/devfusion-frontend-backend',
    duration: 60,
    instructions: 'Complete coding challenges within 60 minutes. Minimum passing score is 60%.',
  });
  const [assigningScreening, setAssigningScreening] = useState(false);

  // Interviewer Request Modal
  const [selectedAppForInterview, setSelectedAppForInterview] = useState<any | null>(null);
  const [interviewForm, setInterviewForm] = useState({
    interviewerId: '',
    meetingUrl: 'https://meet.google.com/devfusion-live',
    scheduledAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16),
    duration: 45,
  });
  const [requestingInterviewer, setRequestingInterviewer] = useState(false);

  // Send Report to Manager Modal
  const [selectedAppForReport, setSelectedAppForReport] = useState<any | null>(null);
  const [reportSummary, setReportSummary] = useState('');
  const [sendingReport, setSendingReport] = useState(false);

  useEffect(() => {
    fetchApplications();
    fetchInterviewers();
  }, []);

  const fetchApplications = async () => {
    try {
      const res = await applicationApi.getApplications();
      setApplications(res.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const fetchInterviewers = async () => {
    try {
      const res = await ApiClient.get<{ data: any[] }>('/interviews/interviewers').catch(() => ({ data: [] }));
      let allUsers = res.data || [];
      if (allUsers.length === 0) {
        allUsers = [
          { id: 'usr_interviewer_1', name: 'Alex Rivera (Staff Tech Lead)', email: 'alex.rivera@techcorp.io', role: 'INTERVIEWER' },
          { id: 'usr_interviewer_2', name: 'Dr. Sarah Chen (Principal Architect)', email: 'sarah.chen@techcorp.io', role: 'INTERVIEWER' },
          { id: 'usr_interviewer_3', name: 'Vikram Mehta (Engineering Manager)', email: 'vikram@techcorp.io', role: 'HIRING_MANAGER' },
        ];
      }
      setInterviewers(allUsers);
      if (allUsers.length > 0) {
        setInterviewForm((prev) => ({ ...prev, interviewerId: allUsers[0].id }));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleStageChange = async (appId: string, newStage: ApplicationStage) => {
    setUpdatingId(appId);
    try {
      await applicationApi.updateStage(appId, newStage);
      await fetchApplications();
    } catch (e: any) {
      alert(e.message || 'Failed to update stage');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleAssignScreening = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAppForScreening) return;
    setAssigningScreening(true);
    try {
      await applicationApi.assignScreening(selectedAppForScreening.id, screeningForm);
      alert(`Screening test link dispatched to ${selectedAppForScreening.candidate?.user?.name || 'candidate'}!`);
      setSelectedAppForScreening(null);
      await fetchApplications();
    } catch (e: any) {
      alert(e.message || 'Failed to assign screening');
    } finally {
      setAssigningScreening(false);
    }
  };

  const handleRequestInterviewer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAppForInterview) return;
    setRequestingInterviewer(true);
    try {
      await applicationApi.requestInterviewer(selectedAppForInterview.id, interviewForm);
      alert(`Interview session scheduled with ${selectedAppForInterview.candidate?.user?.name || 'candidate'}!`);
      setSelectedAppForInterview(null);
      await fetchApplications();
    } catch (e: any) {
      alert(e.message || 'Failed to schedule interview');
    } finally {
      setRequestingInterviewer(false);
    }
  };

  const handleSendReportToManager = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAppForReport) return;
    setSendingReport(true);
    try {
      await applicationApi.sendReportToManager(selectedAppForReport.id, { reportSummary });
      alert(`Total evaluation report submitted to Hiring Manager for final offer letter approval!`);
      setSelectedAppForReport(null);
      await fetchApplications();
    } catch (e: any) {
      alert(e.message || 'Failed to submit report');
    } finally {
      setSendingReport(false);
    }
  };

  // Filter applications
  const filteredApplications = applications.filter((app) => {
    const candidateName = app.candidate?.user?.name || app.candidateName || '';
    const email = app.candidate?.user?.email || app.email || '';
    const jobTitle = app.job?.title || '';

    const matchesSearch =
      candidateName.toLowerCase().includes(searchKeyword.toLowerCase()) ||
      email.toLowerCase().includes(searchKeyword.toLowerCase()) ||
      jobTitle.toLowerCase().includes(searchKeyword.toLowerCase());

    if (!matchesSearch) return false;

    if (activeFilter === 'ALL') return true;
    if (activeFilter === 'APPLIED') return app.stage === 'APPLIED';
    if (activeFilter === 'SCREENING') return app.stage === 'SCREENING' || app.stage === 'SCREENING_TEST_ASSIGNED' || app.stage === 'SCREENING_TEST_SUBMITTED';
    if (activeFilter === 'SHORTLISTED') return app.stage === 'SHORTLISTED' || app.stage === 'SCREENING_PASSED';
    if (activeFilter === 'TECHNICAL_INTERVIEW') return app.stage === 'TECHNICAL_INTERVIEW' || app.stage === 'INTERVIEW_PENDING' || app.stage === 'INTERVIEW_SCHEDULED' || app.stage === 'HR_INTERVIEW' || app.stage === 'INTERVIEW_COMPLETED';
    if (activeFilter === 'OFFER') return app.stage === 'OFFER' || app.stage === 'MANAGER_REVIEW' || app.stage === 'OFFER_PENDING' || app.stage === 'OFFER_SENT';
    if (activeFilter === 'HIRED') return app.stage === 'HIRED' || app.stage === 'OFFER_ACCEPTED';
    if (activeFilter === 'REJECTED') return app.stage === 'REJECTED' || app.stage === 'SCREENING_FAILED' || app.stage === 'INTERVIEW_FAILED' || app.stage === 'OFFER_REJECTED';
    return true;
  });

  const getStageCounts = (stageKey: string) => {
    if (stageKey === 'ALL') return applications.length;
    if (stageKey === 'APPLIED') return applications.filter((a) => a.stage === 'APPLIED').length;
    if (stageKey === 'SCREENING') return applications.filter((a) => a.stage === 'SCREENING' || a.stage === 'SCREENING_TEST_ASSIGNED' || a.stage === 'SCREENING_TEST_SUBMITTED').length;
    if (stageKey === 'SHORTLISTED') return applications.filter((a) => a.stage === 'SHORTLISTED' || a.stage === 'SCREENING_PASSED').length;
    if (stageKey === 'TECHNICAL_INTERVIEW') return applications.filter((a) => a.stage === 'TECHNICAL_INTERVIEW' || a.stage === 'INTERVIEW_PENDING' || a.stage === 'INTERVIEW_SCHEDULED' || a.stage === 'HR_INTERVIEW' || a.stage === 'INTERVIEW_COMPLETED').length;
    if (stageKey === 'OFFER') return applications.filter((a) => a.stage === 'OFFER' || a.stage === 'MANAGER_REVIEW' || a.stage === 'OFFER_PENDING' || a.stage === 'OFFER_SENT').length;
    if (stageKey === 'HIRED') return applications.filter((a) => a.stage === 'HIRED' || a.stage === 'OFFER_ACCEPTED').length;
    if (stageKey === 'REJECTED') return applications.filter((a) => a.stage === 'REJECTED' || a.stage === 'SCREENING_FAILED' || a.stage === 'INTERVIEW_FAILED' || a.stage === 'OFFER_REJECTED').length;
    return 0;
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Recruitment Pipeline & Candidate Workflow</h1>
          <p className="text-sm text-slate-400 mt-1">
            Recruiter Action Board: Screening Round ➡️ Interview Request ➡️ Total Report to HR / Hiring Manager.
          </p>
        </div>
        <Badge variant="primary" className="py-1 px-3">
          <Sparkles className="w-3.5 h-3.5 mr-1 inline" /> Real-Time MySQL Sync Enabled
        </Badge>
      </div>

      {/* Horizontal Stage Navigation Tabs (Stacked Rows Selector) */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-800 scrollbar-thin">
        {STAGE_CONFIG.map((cfg) => {
          const count = getStageCounts(cfg.key);
          const isActive = activeFilter === cfg.key;

          return (
            <button
              key={cfg.key}
              onClick={() => setActiveFilter(cfg.key)}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-2 ${
                isActive
                  ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/20'
                  : 'bg-slate-900/80 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800'
              }`}
            >
              <span>{cfg.label}</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${isActive ? 'bg-white text-slate-950' : 'bg-slate-800 text-slate-300'}`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Search Filter Bar */}
      <div className="relative">
        <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
        <input
          type="text"
          value={searchKeyword}
          onChange={(e) => setSearchKeyword(e.target.value)}
          placeholder="Search by candidate name, email, or job title..."
          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-800 bg-slate-900 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
        />
      </div>

      {/* Stacked Horizontal Candidate Rows Layout (________ \n ________ \n ________) */}
      <div className="space-y-4">
        {filteredApplications.length === 0 ? (
          <Card className="glass-card p-12 text-center text-slate-400">
            <User className="w-12 h-12 mx-auto mb-3 opacity-30 text-purple-400" />
            <p className="text-lg font-semibold text-white">No candidates found in this stage</p>
            <p className="text-xs text-slate-500 mt-1">
              Select another stage tab or wait for candidates to apply from the Job Search page.
            </p>
          </Card>
        ) : (
          filteredApplications.map((app) => {
            const candidateName = app.candidate?.user?.name || app.candidateName || 'Candidate';
            const email = app.candidate?.user?.email || app.email || 'candidate@example.com';
            const jobTitle = app.job?.title || 'Software Engineer';
            const matchScore = app.matchScore || 88;

            let notesObj: any = {};
            try {
              if (app.notes) notesObj = JSON.parse(app.notes);
            } catch (e) {}

            return (
              <Card
                key={app.id}
                className="glass-card p-5 bg-slate-900 border-slate-800 hover:border-purple-500/40 transition-all flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6"
              >
                {/* Left Section: Candidate & Job Details */}
                <div className="flex items-start gap-4 flex-1">
                  <div className="w-12 h-12 rounded-2xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-purple-300 font-bold text-lg shrink-0">
                    {candidateName[0]}
                  </div>

                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2.5">
                      <h3 className="text-base font-bold text-white">{candidateName}</h3>
                      <span className="text-xs text-slate-400">{email}</span>
                      <Badge
                        variant={
                          app.stage === 'HIRED' || app.stage === 'OFFER_ACCEPTED'
                            ? 'success'
                            : app.stage === 'REJECTED' || app.stage === 'SCREENING_FAILED' || app.stage === 'INTERVIEW_FAILED'
                            ? 'danger'
                            : 'primary'
                        }
                      >
                        {app.stage.replace(/_/g, ' ')}
                      </Badge>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 pt-0.5">
                      <span className="flex items-center gap-1 text-purple-300 font-medium">
                        <Briefcase className="w-3.5 h-3.5" /> {jobTitle}
                      </span>
                      <span className="flex items-center gap-1">
                        <Building className="w-3.5 h-3.5 text-indigo-400" /> {app.job?.department || 'Engineering'}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-slate-500" /> Applied: {new Date(app.createdAt).toLocaleDateString()}
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-purple-500/10 text-purple-400 border border-purple-500/20 flex items-center gap-1">
                        <Sparkles className="w-3 h-3" /> AI Match: {matchScore}%
                      </span>
                    </div>

                    {/* Screening Details Pill */}
                    {notesObj.testUrl && (
                      <div className="flex flex-wrap items-center gap-3 pt-1 text-xs">
                        <span className="text-sky-400 bg-sky-500/10 border border-sky-500/20 px-2.5 py-1 rounded-lg flex items-center gap-1.5">
                          <Code className="w-3.5 h-3.5" />
                          <span>Screening Test:</span>
                          <a href={notesObj.testUrl} target="_blank" rel="noreferrer" className="underline font-semibold text-sky-300">
                            {notesObj.testTitle || 'Test Link'} <ExternalLink className="w-3 h-3 inline" />
                          </a>
                        </span>
                        {notesObj.screeningScore !== undefined && (
                          <span className="text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-lg font-bold">
                            Screening Score: {notesObj.screeningScore}%
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Right Section: Stage Action Buttons */}
                <div className="flex flex-wrap items-center gap-2 shrink-0">
                  {/* 1. If in APPLIED: Proceed to Screening Round */}
                  {app.stage === 'APPLIED' && (
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => setSelectedAppForScreening(app)}
                      className="bg-sky-600 hover:bg-sky-500 text-white font-semibold text-xs flex items-center gap-1.5 shadow-lg shadow-sky-500/20"
                    >
                      <Code className="w-3.5 h-3.5" /> Proceed to Screening Round
                    </Button>
                  )}

                  {/* 2. If in SCREENING / SHORTLISTED: Proceed to Interview */}
                  {(app.stage === 'SCREENING' || app.stage === 'SCREENING_TEST_ASSIGNED' || app.stage === 'SCREENING_TEST_SUBMITTED' || app.stage === 'SHORTLISTED') && (
                    <>
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => setSelectedAppForInterview(app)}
                        className="bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs flex items-center gap-1.5 shadow-lg shadow-purple-500/20"
                      >
                        <Calendar className="w-3.5 h-3.5" /> Proceed to Interview
                      </Button>

                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => handleStageChange(app.id, 'REJECTED')}
                        title="Reject Candidate"
                      >
                        <XCircle className="w-3.5 h-3.5 mr-1" /> Reject
                      </Button>
                    </>
                  )}

                  {/* 3. If in TECHNICAL_INTERVIEW: Send Total Report to HR / Manager */}
                  {(app.stage === 'TECHNICAL_INTERVIEW' || app.stage === 'INTERVIEW_SCHEDULED' || app.stage === 'INTERVIEW_COMPLETED') && (
                    <>
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => setSelectedAppForReport(app)}
                        className="bg-amber-600 hover:bg-amber-500 text-white font-semibold text-xs flex items-center gap-1.5 shadow-lg shadow-amber-500/20"
                      >
                        <Send className="w-3.5 h-3.5" /> Send Total Report to HR/Manager
                      </Button>

                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => handleStageChange(app.id, 'REJECTED')}
                      >
                        <XCircle className="w-3.5 h-3.5 mr-1" /> Reject
                      </Button>
                    </>
                  )}

                  {/* 4. If in OFFER: Final Manager Decision State */}
                  {app.stage === 'OFFER' && (
                    <span className="px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5" /> Awaiting Manager Final Decision
                    </span>
                  )}

                  {/* 5. If in HIRED */}
                  {(app.stage === 'HIRED' || app.stage === 'OFFER_ACCEPTED') && (
                    <span className="px-3 py-1.5 rounded-xl bg-green-500/10 border border-green-500/20 text-green-400 text-xs font-bold flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4" /> Candidate Hired
                    </span>
                  )}

                  {/* 6. If in REJECTED */}
                  {(app.stage === 'REJECTED' || app.stage === 'SCREENING_FAILED' || app.stage === 'INTERVIEW_FAILED') && (
                    <span className="px-3 py-1.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-bold flex items-center gap-1.5">
                      <XCircle className="w-4 h-4" /> Application Rejected
                    </span>
                  )}
                </div>
              </Card>
            );
          })
        )}
      </div>

      {/* 1. Screening Test Assignment Modal */}
      <Modal
        isOpen={!!selectedAppForScreening}
        onClose={() => setSelectedAppForScreening(null)}
        title={`Assign Screening Test to ${selectedAppForScreening?.candidate?.user?.name || 'Candidate'}`}
      >
        <form onSubmit={handleAssignScreening} className="space-y-4 text-left">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider mb-1 text-slate-300">
              Screening Test Title / Platform
            </label>
            <input
              type="text"
              required
              value={screeningForm.testTitle}
              onChange={(e) => setScreeningForm({ ...screeningForm, testTitle: e.target.value })}
              placeholder="e.g. HackerRank / HackerEarth Assessment"
              className="w-full p-2.5 rounded-xl border border-slate-800 bg-slate-900 text-sm text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider mb-1 text-slate-300">
              External Assessment URL (HackerRank, HackerEarth, or Mock Test Link)
            </label>
            <input
              type="url"
              required
              value={screeningForm.testUrl}
              onChange={(e) => setScreeningForm({ ...screeningForm, testUrl: e.target.value })}
              placeholder="https://www.hackerrank.com/tests/..."
              className="w-full p-2.5 rounded-xl border border-slate-800 bg-slate-900 text-sm text-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider mb-1 text-slate-300">Duration (Minutes)</label>
              <input
                type="number"
                value={screeningForm.duration}
                onChange={(e) => setScreeningForm({ ...screeningForm, duration: Number(e.target.value) })}
                className="w-full p-2.5 rounded-xl border border-slate-800 bg-slate-900 text-sm text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider mb-1 text-slate-300">Min Passing Score</label>
              <input
                type="text"
                disabled
                value="60% Threshold"
                className="w-full p-2.5 rounded-xl border border-slate-800 bg-slate-950 text-sm text-slate-400"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider mb-1 text-slate-300">Candidate Instructions</label>
            <textarea
              rows={2}
              value={screeningForm.instructions}
              onChange={(e) => setScreeningForm({ ...screeningForm, instructions: e.target.value })}
              className="w-full p-2.5 rounded-xl border border-slate-800 bg-slate-900 text-sm text-white"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
            <Button variant="ghost" type="button" onClick={() => setSelectedAppForScreening(null)}>Cancel</Button>
            <Button variant="primary" type="submit" isLoading={assigningScreening} className="bg-sky-600 hover:bg-sky-500">
              <Code className="w-4 h-4 mr-1.5" /> Assign Screening Test
            </Button>
          </div>
        </form>
      </Modal>

      {/* 2. Interviewer Request & Schedule Modal */}
      <Modal
        isOpen={!!selectedAppForInterview}
        onClose={() => setSelectedAppForInterview(null)}
        title={`Arrange Interview for ${selectedAppForInterview?.candidate?.user?.name || 'Candidate'}`}
      >
        <form onSubmit={handleRequestInterviewer} className="space-y-4 text-left">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider mb-1 text-slate-300">
              Select Registered Interviewer
            </label>
            <select
              value={interviewForm.interviewerId}
              onChange={(e) => setInterviewForm({ ...interviewForm, interviewerId: e.target.value })}
              className="w-full p-2.5 rounded-xl border border-slate-800 bg-slate-900 text-sm text-white focus:ring-2 focus:ring-purple-500"
            >
              {interviewers.map((iv) => (
                <option key={iv.id} value={iv.id}>
                  {iv.name} ({iv.email}) • {iv.role}
                </option>
              ))}
            </select>

            {/* Selected Interviewer Preview Badge */}
            {interviewers.find((iv) => iv.id === interviewForm.interviewerId) && (
              <div className="mt-2 p-2.5 rounded-xl bg-purple-500/10 border border-purple-500/20 text-xs text-purple-300 flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-purple-600/30 flex items-center justify-center font-bold text-xs text-purple-200">
                  {interviewers.find((iv) => iv.id === interviewForm.interviewerId)?.name?.[0] || 'I'}
                </div>
                <div>
                  <span className="font-bold block text-white">
                    Assigned: {interviewers.find((iv) => iv.id === interviewForm.interviewerId)?.name}
                  </span>
                  <span className="text-[11px] text-slate-400">
                    {interviewers.find((iv) => iv.id === interviewForm.interviewerId)?.email} • Role: {interviewers.find((iv) => iv.id === interviewForm.interviewerId)?.role}
                  </span>
                </div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider mb-1 text-slate-300">Date & Time</label>
              <input
                type="datetime-local"
                required
                value={interviewForm.scheduledAt}
                onChange={(e) => setInterviewForm({ ...interviewForm, scheduledAt: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-slate-800 bg-slate-900 text-sm text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider mb-1 text-slate-300">Duration (Mins)</label>
              <input
                type="number"
                value={interviewForm.duration}
                onChange={(e) => setInterviewForm({ ...interviewForm, duration: Number(e.target.value) })}
                className="w-full p-2.5 rounded-xl border border-slate-800 bg-slate-900 text-sm text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider mb-1 text-slate-300">Virtual Meeting Link (Google Meet / Zoom / Portal Room)</label>
            <input
              type="url"
              required
              value={interviewForm.meetingUrl}
              onChange={(e) => setInterviewForm({ ...interviewForm, meetingUrl: e.target.value })}
              className="w-full p-2.5 rounded-xl border border-slate-800 bg-slate-900 text-sm text-white"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
            <Button variant="ghost" type="button" onClick={() => setSelectedAppForInterview(null)}>Cancel</Button>
            <Button variant="primary" type="submit" isLoading={requestingInterviewer} className="bg-purple-600 hover:bg-purple-500">
              <Calendar className="w-4 h-4 mr-1.5" /> Schedule & Send Request
            </Button>
          </div>
        </form>
      </Modal>

      {/* 3. Send Total Report to Manager Modal */}
      <Modal
        isOpen={!!selectedAppForReport}
        onClose={() => setSelectedAppForReport(null)}
        title={`Send Total Evaluation Report to HR / Hiring Manager`}
      >
        <form onSubmit={handleSendReportToManager} className="space-y-4 text-left">
          <div className="p-3.5 rounded-xl bg-purple-500/10 border border-purple-500/20 text-xs text-purple-300 space-y-1">
            <span className="font-bold block">Candidate: {selectedAppForReport?.candidate?.user?.name} ({selectedAppForReport?.job?.title})</span>
            <span>Compiles Resume Match Score + Screening Assessment + Interview Scorecard to HR / Hiring Manager for official offer decision.</span>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider mb-1 text-slate-300">Recruiter Evaluation Summary & Recommendation</label>
            <textarea
              rows={4}
              required
              value={reportSummary}
              onChange={(e) => setReportSummary(e.target.value)}
              placeholder="Candidate demonstrated exceptional coding proficiency in screening round and received strong recommendations from technical interviewers. Recommend proceeding with offer..."
              className="w-full p-3 rounded-xl border border-slate-800 bg-slate-900 text-sm text-white focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
            <Button variant="ghost" type="button" onClick={() => setSelectedAppForReport(null)}>Cancel</Button>
            <Button variant="primary" type="submit" isLoading={sendingReport} className="bg-amber-600 hover:bg-amber-500">
              <Send className="w-4 h-4 mr-1.5" /> Submit to Hiring Manager for Offer Approval
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
