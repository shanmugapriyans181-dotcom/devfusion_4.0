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
  MoveRight,
  CheckCircle,
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
  Building
} from 'lucide-react';

const KANBAN_STAGES: { key: ApplicationStage; label: string; color: string }[] = [
  { key: 'APPLIED', label: '1. Applied', color: 'border-slate-500' },
  { key: 'SCREENING', label: '2. Screening Round', color: 'border-sky-500' },
  { key: 'SHORTLISTED', label: '3. Screening Passed', color: 'border-indigo-500' },
  { key: 'TECHNICAL_INTERVIEW', label: '4. Tech Interview', color: 'border-purple-500' },
  { key: 'OFFER', label: '5. Manager / HR Review', color: 'border-amber-500' },
  { key: 'HIRED', label: '6. Hired', color: 'border-emerald-500' },
  { key: 'REJECTED', label: 'Rejected', color: 'border-rose-500' },
];

export const KanbanPipelinePage: React.FC = () => {
  const [applications, setApplications] = useState<any[]>([]);
  const [interviewers, setInterviewers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
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
      const res = await ApiClient.get<{ data: any[] }>('/admin/users').catch(() => ({ data: [] }));
      const allUsers = res.data || [];
      const ivs = allUsers.filter((u: any) => u.role === 'INTERVIEWER' || u.role === 'ADMIN');
      setInterviewers(ivs);
      if (ivs.length > 0) {
        setInterviewForm((prev) => ({ ...prev, interviewerId: ivs[0].id }));
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Interactive Kanban Recruitment Pipeline</h1>
          <p className="text-sm text-slate-400 mt-1">
            Recruiter Candidate Workflow: Screening Round ➡️ Interview Request ➡️ Total Report to HR / Hiring Manager.
          </p>
        </div>
        <Badge variant="primary" className="py-1 px-3">
          <Sparkles className="w-3.5 h-3.5 mr-1 inline" /> Real-Time MySQL Sync Enabled
        </Badge>
      </div>

      {/* Kanban Board Layout */}
      <div className="flex gap-4 overflow-x-auto pb-6 min-h-[75vh]">
        {KANBAN_STAGES.map((stageObj) => {
          const stageApps = applications.filter((app) => {
            if (stageObj.key === 'SCREENING') return app.stage === 'SCREENING' || app.stage === 'SCREENING_TEST_ASSIGNED' || app.stage === 'SCREENING_TEST_SUBMITTED';
            if (stageObj.key === 'TECHNICAL_INTERVIEW') return app.stage === 'TECHNICAL_INTERVIEW' || app.stage === 'INTERVIEW_PENDING' || app.stage === 'INTERVIEW_SCHEDULED' || app.stage === 'HR_INTERVIEW' || app.stage === 'INTERVIEW_COMPLETED';
            if (stageObj.key === 'OFFER') return app.stage === 'OFFER' || app.stage === 'MANAGER_REVIEW' || app.stage === 'OFFER_PENDING' || app.stage === 'OFFER_SENT';
            if (stageObj.key === 'HIRED') return app.stage === 'HIRED' || app.stage === 'OFFER_ACCEPTED';
            if (stageObj.key === 'REJECTED') return app.stage === 'REJECTED' || app.stage === 'SCREENING_FAILED' || app.stage === 'INTERVIEW_FAILED' || app.stage === 'OFFER_REJECTED';
            return app.stage === stageObj.key;
          });

          return (
            <div
              key={stageObj.key}
              className={`w-80 shrink-0 bg-slate-900/60 border-t-4 ${stageObj.color} border-x border-b border-slate-800/80 rounded-2xl p-4 space-y-4 flex flex-col`}
            >
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <span className="font-bold text-sm text-white">{stageObj.label}</span>
                <span className="px-2 py-0.5 rounded-full bg-slate-800 text-xs font-semibold text-slate-400">
                  {stageApps.length}
                </span>
              </div>

              <div className="space-y-3 flex-1 overflow-y-auto">
                {stageApps.length === 0 ? (
                  <div className="p-4 text-center text-xs text-slate-500 border border-dashed border-slate-800 rounded-xl">
                    No candidates in {stageObj.label}
                  </div>
                ) : (
                  stageApps.map((app) => {
                    const candidateName = app.candidate?.user?.name || app.candidateName || 'Candidate';
                    const email = app.candidate?.user?.email || app.email;
                    const isUpdating = updatingId === app.id;

                    let notesObj: any = {};
                    try {
                      if (app.notes) notesObj = JSON.parse(app.notes);
                    } catch (e) {}

                    return (
                      <Card
                        key={app.id}
                        className="glass-card p-4 space-y-3 hover:border-purple-500/50 transition-all text-left bg-slate-900 border-slate-800"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2.5">
                            <div className="w-9 h-9 rounded-full bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-purple-300 font-bold text-sm">
                              {candidateName[0]}
                            </div>
                            <div>
                              <h4 className="text-sm font-bold text-white leading-tight">{candidateName}</h4>
                              <span className="text-[11px] text-slate-400 truncate block max-w-[140px]">{email}</span>
                            </div>
                          </div>

                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/10 text-purple-400 border border-purple-500/20">
                            {app.matchScore || 85}% Match
                          </span>
                        </div>

                        <div className="text-xs text-slate-400 space-y-1 pt-1 border-t border-slate-800/80">
                          <div className="font-medium text-slate-300 flex items-center gap-1">
                            <Briefcase className="w-3 h-3 text-purple-400" /> {app.job?.title}
                          </div>

                          {/* Screening Note Details */}
                          {notesObj.testUrl && (
                            <div className="p-2 rounded-lg bg-sky-500/10 border border-sky-500/20 text-[11px] text-sky-300">
                              <span className="font-semibold block">Screening Test:</span>
                              <a href={notesObj.testUrl} target="_blank" rel="noreferrer" className="underline truncate block text-sky-400">
                                {notesObj.testTitle || 'Test Link'} <ExternalLink className="w-2.5 h-2.5 inline ml-0.5" />
                              </a>
                              {notesObj.screeningScore !== undefined && (
                                <span className="font-bold text-emerald-400 block mt-0.5">
                                  Score: {notesObj.screeningScore}%
                                </span>
                              )}
                            </div>
                          )}
                        </div>

                        {/* Interactive Workflow Buttons */}
                        <div className="space-y-1.5 pt-2 border-t border-slate-800">
                          {/* 1. If in APPLIED: Proceed to Screening Round */}
                          {app.stage === 'APPLIED' && (
                            <Button
                              variant="primary"
                              size="sm"
                              onClick={() => setSelectedAppForScreening(app)}
                              className="w-full text-xs py-1.5 bg-sky-600 hover:bg-sky-500 text-white font-semibold flex items-center justify-center gap-1 shadow-lg shadow-sky-500/20"
                            >
                              <Code className="w-3.5 h-3.5" /> Proceed to Screening Round
                            </Button>
                          )}

                          {/* 2. If in SCREENING: Proceed to Interview Round or Reject */}
                          {(app.stage === 'SCREENING' || app.stage === 'SCREENING_TEST_ASSIGNED' || app.stage === 'SCREENING_TEST_SUBMITTED' || app.stage === 'SHORTLISTED') && (
                            <div className="flex items-center gap-1.5">
                              <Button
                                variant="primary"
                                size="sm"
                                onClick={() => setSelectedAppForInterview(app)}
                                className="flex-1 text-xs py-1.5 bg-purple-600 hover:bg-purple-500 text-white font-semibold flex items-center justify-center gap-1"
                              >
                                <Calendar className="w-3.5 h-3.5" /> Proceed to Interview
                              </Button>
                              <Button
                                variant="danger"
                                size="sm"
                                onClick={() => handleStageChange(app.id, 'REJECTED')}
                                title="Reject Candidate"
                                className="px-2"
                              >
                                <XCircle className="w-3.5 h-3.5" />
                              </Button>
                            </div>
                          )}

                          {/* 3. If in TECHNICAL_INTERVIEW: Send Report to Manager */}
                          {(app.stage === 'TECHNICAL_INTERVIEW' || app.stage === 'INTERVIEW_SCHEDULED' || app.stage === 'INTERVIEW_COMPLETED') && (
                            <div className="space-y-1.5">
                              <Button
                                variant="primary"
                                size="sm"
                                onClick={() => setSelectedAppForReport(app)}
                                className="w-full text-xs py-1.5 bg-amber-600 hover:bg-amber-500 text-white font-semibold flex items-center justify-center gap-1 shadow-lg shadow-amber-500/20"
                              >
                                <Send className="w-3.5 h-3.5" /> Send Total Report to HR/Manager
                              </Button>
                              <Button
                                variant="danger"
                                size="sm"
                                onClick={() => handleStageChange(app.id, 'REJECTED')}
                                className="w-full text-xs py-1"
                              >
                                Reject Candidate
                              </Button>
                            </div>
                          )}

                          {/* 4. If in OFFER: Final Decision State */}
                          {app.stage === 'OFFER' && (
                            <div className="text-center p-2 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs font-semibold">
                              Under Hiring Manager Final Decision
                            </div>
                          )}

                          {/* 5. If in HIRED */}
                          {(app.stage === 'HIRED' || app.stage === 'OFFER_ACCEPTED') && (
                            <div className="text-center p-2 rounded-lg bg-green-500/10 border border-green-500/20 text-green-400 text-xs font-bold flex items-center justify-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5" /> Candidate Hired!
                            </div>
                          )}

                          {/* 6. If in REJECTED */}
                          {app.stage === 'REJECTED' && (
                            <div className="text-center p-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-bold flex items-center justify-center gap-1">
                              <XCircle className="w-3.5 h-3.5" /> Application Rejected
                            </div>
                          )}
                        </div>
                      </Card>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
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
              Select Interviewer
            </label>
            <select
              value={interviewForm.interviewerId}
              onChange={(e) => setInterviewForm({ ...interviewForm, interviewerId: e.target.value })}
              className="w-full p-2.5 rounded-xl border border-slate-800 bg-slate-900 text-sm text-white"
            >
              {interviewers.map((iv) => (
                <option key={iv.id} value={iv.id}>
                  {iv.name} ({iv.email}) - {iv.role}
                </option>
              ))}
            </select>
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
