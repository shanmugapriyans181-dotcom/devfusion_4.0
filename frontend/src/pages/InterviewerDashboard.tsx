import React, { useEffect, useState } from 'react';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { interviewApi } from '../services/interview.api';
import {
  Calendar,
  User,
  FileText,
  CheckCircle2,
  Star,
  Clock,
  ShieldAlert,
  Activity,
  Code,
  Sparkles,
  Award
} from 'lucide-react';

export const InterviewerDashboard: React.FC = () => {
  const [interviews, setInterviews] = useState<any[]>([]);
  const [selectedInterview, setSelectedInterview] = useState<any | null>(null);
  const [activeVideoInterview, setActiveVideoInterview] = useState<any | null>(null);

  // Video call controls
  const [isMicOn, setIsMicOn] = useState(true);
  const [isVideoOn, setIsVideoOn] = useState(true);

  // Feedback form
  const [techRating, setTechRating] = useState(4);
  const [commRating, setCommRating] = useState(4);
  const [probRating, setProbRating] = useState(4);
  const [teamRating, setTeamRating] = useState(4);
  const [leadRating, setLeadRating] = useState(4);
  const [comments, setComments] = useState('');
  const [recommendation, setRecommendation] = useState<'HIRE' | 'REJECT'>('HIRE');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchInterviews();
  }, []);

  const fetchInterviews = async () => {
    try {
      const res = await interviewApi.getInterviews();
      setInterviews(res.data || []);
    } catch (e) {
      console.error(e);
    }
  };

  const handleSubmitFeedback = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInterview) return;
    setIsSubmitting(true);
    try {
      await interviewApi.submitFeedback(selectedInterview.id, {
        technicalRating: techRating,
        communicationRating: commRating,
        problemSolvingRating: probRating,
        teamworkRating: teamRating,
        leadershipRating: leadRating,
        comments: `[Recommendation: ${recommendation}] ${comments}`,
      });
      alert('Feedback scorecard submitted successfully! Hiring Manager will review your evaluation.');
      setSelectedInterview(null);
      setActiveVideoInterview(null);
      setComments('');
      await fetchInterviews();
    } catch (e: any) {
      alert(e.message || 'Failed to submit feedback');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-purple-950 via-slate-900 to-slate-950 p-8 rounded-3xl text-white border border-purple-500/20">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-purple-500/20 text-purple-300">
              <Activity className="w-5 h-5" />
            </span>
            <Badge variant="primary">Interviewer Evaluation Hub</Badge>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight">Assigned Candidate Interviews</h1>
          <p className="text-slate-400 text-sm max-w-xl">
            Join live online video interview rooms, assess candidate problem-solving, and submit structured feedback scorecards.
          </p>
        </div>
        <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs font-medium flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0" />
          <span>Salary Privacy Guard Active: Compensation is masked for Interviewer role.</span>
        </div>
      </div>

      {/* Interview List */}
      <div className="grid grid-cols-1 gap-6">
        {interviews.length === 0 ? (
          <Card className="glass-card p-12 text-center text-slate-400">
            <Calendar className="w-12 h-12 mx-auto mb-3 opacity-30 text-purple-400" />
            <p className="text-lg font-semibold text-white">No interviews scheduled yet</p>
            <p className="text-xs text-slate-500 mt-1">When recruiters schedule candidate sessions with you, they will appear here.</p>
          </Card>
        ) : (
          interviews.map((item) => (
            <Card key={item.id} className="glass-card p-6 space-y-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-purple-600/20 border-2 border-purple-500/40 flex items-center justify-center text-purple-300 font-bold text-lg">
                    {(item.application?.candidate?.user?.name || 'C')[0]}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">{item.application?.candidate?.user?.name || 'Candidate'}</h3>
                    <div className="text-xs text-slate-400">{item.title} • Applying for: <strong>{item.application?.job?.title}</strong></div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Badge variant={item.status === 'COMPLETED' ? 'success' : 'warning'}>
                    {item.status}
                  </Badge>

                  {/* Join Video Call Button */}
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => setActiveVideoInterview(item)}
                    className="bg-indigo-600 hover:bg-indigo-500 text-white flex items-center gap-1.5 shadow-lg shadow-indigo-500/20"
                  >
                    <Activity className="w-4 h-4" /> Join Online Video Call
                  </Button>

                  {item.status !== 'COMPLETED' && (
                    <Button variant="outline" size="sm" onClick={() => setSelectedInterview(item)}>
                      Scorecard
                    </Button>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-slate-400 pt-1">
                <div>
                  <span className="font-semibold text-slate-300 block mb-1">Scheduled Date & Time</span>
                  <div className="flex items-center gap-1.5"><Calendar className="w-4 h-4 text-purple-400" /> {new Date(item.scheduledAt).toLocaleString()} ({item.duration} mins)</div>
                </div>
                <div>
                  <span className="font-semibold text-slate-300 block mb-1">Virtual Meeting Link</span>
                  <button
                    onClick={() => setActiveVideoInterview(item)}
                    className="text-purple-400 hover:underline font-mono text-xs truncate block"
                  >
                    {item.meetingUrl || 'https://meet.hireai.platform/room/' + item.id.slice(0, 8)}
                  </button>
                </div>
                <div>
                  <span className="font-semibold text-slate-300 block mb-1">Candidate Email</span>
                  <div>{item.application?.candidate?.user?.email || item.application?.email}</div>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Online Video Call Modal / Portal */}
      {activeVideoInterview && (
        <Modal
          isOpen={!!activeVideoInterview}
          onClose={() => setActiveVideoInterview(null)}
          title={`Online Video Interview: ${activeVideoInterview.application?.candidate?.user?.name || 'Candidate'}`}
        >
          <div className="space-y-4 text-left">
            {/* Simulated Video Screens */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Interviewer Screen */}
              <div className="relative aspect-video bg-slate-950 rounded-2xl border border-purple-500/30 overflow-hidden flex flex-col items-center justify-center p-4">
                {isVideoOn ? (
                  <div className="w-full h-full bg-gradient-to-tr from-purple-950/40 via-slate-900 to-indigo-950/40 flex flex-col items-center justify-center">
                    <div className="w-16 h-16 rounded-full bg-purple-600/30 border-2 border-purple-500 flex items-center justify-center text-purple-300 font-bold text-2xl mb-2 animate-pulse">
                      You
                    </div>
                    <span className="text-xs text-purple-300 font-semibold">Camera Active (Interviewer)</span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center text-slate-500">
                    <Activity className="w-8 h-8 mb-2 opacity-40" />
                    <span className="text-xs">Camera Turned Off</span>
                  </div>
                )}
                <span className="absolute bottom-2 left-2 bg-black/60 px-2 py-0.5 rounded text-[11px] text-white">
                  You (Interviewer) {!isMicOn && '🔇'}
                </span>
              </div>

              {/* Candidate Screen */}
              <div className="relative aspect-video bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden flex flex-col items-center justify-center p-4">
                <div className="w-full h-full bg-gradient-to-tr from-slate-900 to-indigo-950/30 flex flex-col items-center justify-center">
                  <div className="w-16 h-16 rounded-full bg-indigo-600/30 border-2 border-indigo-500 flex items-center justify-center text-indigo-300 font-bold text-2xl mb-2">
                    {(activeVideoInterview.application?.candidate?.user?.name || 'C')[0]}
                  </div>
                  <span className="text-xs text-indigo-300 font-semibold">
                    {activeVideoInterview.application?.candidate?.user?.name || 'Candidate'} (Connected)
                  </span>
                </div>
                <span className="absolute bottom-2 left-2 bg-black/60 px-2 py-0.5 rounded text-[11px] text-white">
                  {activeVideoInterview.application?.candidate?.user?.name || 'Candidate'} 🟢
                </span>
              </div>
            </div>

            {/* Video Controls Toolbar */}
            <div className="flex items-center justify-center gap-3 p-3 bg-slate-900 rounded-2xl border border-slate-800">
              <button
                type="button"
                onClick={() => setIsMicOn(!isMicOn)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                  isMicOn ? 'bg-slate-800 text-white hover:bg-slate-700' : 'bg-red-500/20 text-red-400'
                }`}
              >
                {isMicOn ? 'Mic: ON' : 'Mic: MUTED'}
              </button>
              <button
                type="button"
                onClick={() => setIsVideoOn(!isVideoOn)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                  isVideoOn ? 'bg-slate-800 text-white hover:bg-slate-700' : 'bg-red-500/20 text-red-400'
                }`}
              >
                <Activity className="w-4 h-4" /> {isVideoOn ? 'Camera: ON' : 'Camera: OFF'}
              </button>

              <Button
                variant="primary"
                onClick={() => {
                  setSelectedInterview(activeVideoInterview);
                }}
                className="bg-green-600 hover:bg-green-500 text-xs py-2 px-4"
              >
                <Award className="w-4 h-4 mr-1.5" /> Submit Scorecard
              </Button>

              <button
                type="button"
                onClick={() => setActiveVideoInterview(null)}
                className="p-2.5 bg-red-600 hover:bg-red-500 text-white rounded-xl transition-colors flex items-center gap-1 text-xs font-bold"
                title="End Call"
              >
                Leave Room
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Feedback Scorecard Modal */}
      {selectedInterview && (
        <Modal
          isOpen={!!selectedInterview}
          onClose={() => setSelectedInterview(null)}
          title={`Interviewer Scorecard: ${selectedInterview.application?.candidate?.user?.name || 'Candidate'}`}
        >
          <form onSubmit={handleSubmitFeedback} className="space-y-4 text-left">
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-semibold uppercase text-slate-400 mb-1">Technical Skills (1-5)</label>
                <select value={techRating} onChange={(e) => setTechRating(Number(e.target.value))} className="w-full p-2 rounded-xl bg-slate-900 border border-slate-800 text-white">
                  {[1, 2, 3, 4, 5].map((n) => <option key={n} value={n}>{n} - {n === 5 ? 'Exceptional' : n === 4 ? 'Strong' : n === 3 ? 'Average' : 'Below Standard'}</option>)}
                </select>
              </div>
              <div>
                <label className="block font-semibold uppercase text-slate-400 mb-1">Communication (1-5)</label>
                <select value={commRating} onChange={(e) => setCommRating(Number(e.target.value))} className="w-full p-2 rounded-xl bg-slate-900 border border-slate-800 text-white">
                  {[1, 2, 3, 4, 5].map((n) => <option key={n} value={n}>{n} - {n >= 4 ? 'Clear & Concise' : 'Basic'}</option>)}
                </select>
              </div>
              <div>
                <label className="block font-semibold uppercase text-slate-400 mb-1">Problem Solving (1-5)</label>
                <select value={probRating} onChange={(e) => setProbRating(Number(e.target.value))} className="w-full p-2 rounded-xl bg-slate-900 border border-slate-800 text-white">
                  {[1, 2, 3, 4, 5].map((n) => <option key={n} value={n}>{n}</option>)}
                </select>
              </div>
              <div>
                <label className="block font-semibold uppercase text-slate-400 mb-1">Recommendation</label>
                <select value={recommendation} onChange={(e) => setRecommendation(e.target.value as any)} className="w-full p-2 rounded-xl bg-slate-900 border border-slate-800 text-white font-bold">
                  <option value="HIRE">✅ Recommend for Hire</option>
                  <option value="REJECT">❌ Do Not Recommend</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider mb-1 text-slate-400">Detailed Feedback & Evaluation Notes</label>
              <textarea
                rows={4}
                required
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                placeholder="Demonstrated strong system architecture, clean algorithms, and proactive communication..."
                className="w-full p-3 rounded-xl border border-slate-800 bg-slate-900 text-sm text-white focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
              <Button variant="ghost" type="button" onClick={() => setSelectedInterview(null)}>Cancel</Button>
              <Button variant="primary" type="submit" isLoading={isSubmitting}>Submit Official Scorecard</Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
