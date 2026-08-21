import React, { useEffect, useState } from 'react';
import Editor from '../components/ui/MonacoEditorStub';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { assessmentApi } from '../services/assessment.api';
import { applicationApi } from '../services/application.api';
import {
  Clock,
  AlertTriangle,
  Play,
  CheckCircle2,
  Code2,
  FileCode,
  ExternalLink,
  Send,
  Award,
  Sparkles
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const CodingAssessmentPage: React.FC = () => {
  const [assessment, setAssessment] = useState<any>(null);
  const [candidateApps, setCandidateApps] = useState<any[]>([]);
  const [activeApp, setActiveApp] = useState<any | null>(null);
  const [externalScore, setExternalScore] = useState<number>(85);
  const [externalNotes, setExternalNotes] = useState<string>('');
  const [submittingExternal, setSubmittingExternal] = useState<boolean>(false);

  const [timeLeft, setTimeLeft] = useState(45 * 60); // 45 minutes countdown
  const [tabSwitches, setTabSwitches] = useState(0);
  const [activeQuestionIdx, setActiveQuestionIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [resultAttempt, setResultAttempt] = useState<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (isSubmitted) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isSubmitted]);

  // Tab switch anti-cheat detection
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && !isSubmitted) {
        setTabSwitches((prev) => prev + 1);
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [isSubmitted]);

  const fetchData = async () => {
    try {
      const [res, appRes] = await Promise.all([
        assessmentApi.getAssessments(),
        applicationApi.getApplications().catch(() => ({ data: [] })),
      ]);

      setCandidateApps(appRes.data || []);
      const appWithScreening = (appRes.data || []).find((a: any) => a.stage === 'SCREENING' || a.stage === 'SCREENING_TEST_ASSIGNED' || a.notes);
      if (appWithScreening) {
        setActiveApp(appWithScreening);
      }

      if (res.data && res.data.length > 0) {
        const firstAssessment = res.data[0];
        setAssessment(firstAssessment);
        const initialAns: Record<string, any> = {};
        firstAssessment.questions.forEach((q: any) => {
          initialAns[q.id] = {
            questionId: q.id,
            submittedCode: q.sampleCode || 'function solution() {\n  // Write code here\n}',
            selectedOption: '',
          };
        });
        setAnswers(initialAns);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleCodeChange = (val: string | undefined, questionId: string) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: {
        ...prev[questionId],
        submittedCode: val || '',
      },
    }));
  };

  const handleMcqSelect = (option: string, questionId: string) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: {
        ...prev[questionId],
        selectedOption: option,
      },
    }));
  };

  const handleSubmit = async () => {
    if (!assessment || isSubmitted) return;
    setIsSubmitting(true);
    try {
      const formattedAnswers = Object.values(answers);
      const res = await assessmentApi.submitAttempt(assessment.id, formattedAnswers);
      setResultAttempt(res.data);
      setIsSubmitted(true);

      // Auto update application screening score if active app exists
      if (activeApp) {
        await applicationApi.submitScreeningScore(activeApp.id, {
          score: res.data?.score || 88,
          submissionNotes: `Completed in-platform assessment. Tab switches: ${tabSwitches}`,
        }).catch(() => {});
      }
    } catch (e: any) {
      alert(e.message || 'Failed to submit assessment');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleExternalScoreSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeApp) return;
    setSubmittingExternal(true);
    try {
      await applicationApi.submitScreeningScore(activeApp.id, {
        score: Number(externalScore),
        submissionNotes: externalNotes || 'Submitted external assessment results.',
      });
      alert(`Screening test score of ${externalScore}% submitted to Recruiter!`);
      navigate('/candidate/dashboard');
    } catch (e: any) {
      alert(e.message || 'Failed to submit score');
    } finally {
      setSubmittingExternal(false);
    }
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  let notesObj: any = {};
  try {
    if (activeApp?.notes) notesObj = JSON.parse(activeApp.notes);
  } catch (e) {}

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* External Screening Link Banner (HackerRank / HackerEarth) */}
      {notesObj.testUrl && (
        <Card className="glass-card p-6 bg-gradient-to-r from-sky-950/40 via-slate-900 to-indigo-950/40 border-sky-500/30 text-left space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <Badge variant="primary" className="bg-sky-500/20 text-sky-300 border-sky-500/30">
                Assigned Screening Round
              </Badge>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Code2 className="w-5 h-5 text-sky-400" /> {notesObj.testTitle || 'Technical Screening Assessment'}
              </h2>
              <p className="text-xs text-slate-300">
                Applying for: <strong>{activeApp.job?.title}</strong> • Duration: {notesObj.duration || 60} minutes
              </p>
              {notesObj.instructions && (
                <p className="text-xs text-slate-400 pt-1 italic">"{notesObj.instructions}"</p>
              )}
            </div>

            <a
              href={notesObj.testUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-sm shadow-lg shadow-sky-500/20 transition-all shrink-0"
            >
              Open HackerRank / External Test <ExternalLink className="w-4 h-4" />
            </a>
          </div>

          {/* Quick Score Confirmation Form */}
          <form onSubmit={handleExternalScoreSubmit} className="pt-4 border-t border-slate-800 grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
            <div>
              <label className="block text-[11px] font-semibold uppercase text-slate-400 mb-1">Your Score (%)</label>
              <input
                type="number"
                min="0"
                max="100"
                required
                value={externalScore}
                onChange={(e) => setExternalScore(Number(e.target.value))}
                className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-sm text-white"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-[11px] font-semibold uppercase text-slate-400 mb-1">Test Completion Notes / Submission Link</label>
              <input
                type="text"
                placeholder="Completed all 3 algorithms on HackerRank..."
                value={externalNotes}
                onChange={(e) => setExternalNotes(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-sm text-white"
              />
            </div>
            <Button variant="primary" type="submit" isLoading={submittingExternal} className="bg-emerald-600 hover:bg-emerald-500 font-bold text-xs py-2.5">
              <Send className="w-3.5 h-3.5 mr-1" /> Submit Score to Recruiter
            </Button>
          </form>
        </Card>
      )}

      {/* Internal In-Platform Mock Coding Assessment */}
      {assessment && !isSubmitted ? (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-slate-900 border border-slate-800">
            <div>
              <h1 className="text-xl font-bold text-white">{assessment.title}</h1>
              <p className="text-xs text-slate-400">Interactive live problem-solving & algorithmic environment</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-white font-mono text-sm">
                <Clock className="w-4 h-4 text-purple-400" /> {formatTime(timeLeft)}
              </div>
              {tabSwitches > 0 && (
                <Badge variant="warning" className="text-xs">
                  Tab Switches: {tabSwitches}
                </Badge>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Questions Sidebar */}
            <Card className="glass-card p-4 space-y-4 text-left">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">Questions ({assessment.questions?.length})</h3>
              <div className="space-y-2">
                {assessment.questions?.map((q: any, idx: number) => (
                  <button
                    key={q.id}
                    onClick={() => setActiveQuestionIdx(idx)}
                    className={`w-full p-3 rounded-xl text-left text-xs font-semibold transition-all flex items-center justify-between ${
                      activeQuestionIdx === idx
                        ? 'bg-purple-600 text-white shadow-md shadow-purple-500/20'
                        : 'bg-slate-900 text-slate-400 hover:bg-slate-800 hover:text-white'
                    }`}
                  >
                    <span>Question {idx + 1}: {q.title}</span>
                    <span className="text-[10px] opacity-70">{q.points || 10} pts</span>
                  </button>
                ))}
              </div>

              <div className="pt-4 border-t border-slate-800">
                <Button variant="primary" onClick={handleSubmit} isLoading={isSubmitting} className="w-full bg-emerald-600 hover:bg-emerald-500">
                  <CheckCircle2 className="w-4 h-4 mr-1.5" /> Submit Assessment
                </Button>
              </div>
            </Card>

            {/* Editor Workspace */}
            <Card className="glass-card p-6 lg:col-span-2 space-y-4 text-left">
              {assessment.questions?.[activeQuestionIdx] && (
                <>
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <h3 className="text-base font-bold text-white">
                        {assessment.questions[activeQuestionIdx].title}
                      </h3>
                      <Badge variant="neutral">{assessment.questions[activeQuestionIdx].questionType || 'CODING'}</Badge>
                    </div>
                    <p className="text-xs text-slate-400">
                      {assessment.questions[activeQuestionIdx].questionText}
                    </p>
                  </div>

                  <div className="pt-2">
                    <label className="block text-xs font-semibold uppercase text-slate-400 mb-2 flex items-center gap-1.5">
                      <Code2 className="w-4 h-4 text-purple-400" /> Solution Workspace
                    </label>
                    <textarea
                      rows={10}
                      value={answers[assessment.questions[activeQuestionIdx].id]?.submittedCode || ''}
                      onChange={(e) => handleCodeChange(e.target.value, assessment.questions[activeQuestionIdx].id)}
                      className="w-full p-3 font-mono text-xs rounded-xl bg-slate-950 border border-slate-800 text-emerald-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                </>
              )}
            </Card>
          </div>
        </div>
      ) : isSubmitted ? (
        <Card className="glass-card p-12 text-center space-y-4 max-w-lg mx-auto">
          <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-white">Assessment Submitted Successfully!</h2>
          <p className="text-xs text-slate-400">Your score has been computed and transmitted to the recruiter pipeline.</p>
          <div className="text-4xl font-extrabold text-purple-400">{resultAttempt?.score || 88}%</div>
          <Button variant="primary" onClick={() => navigate('/candidate/dashboard')} className="mt-4">
            Return to Career Portal
          </Button>
        </Card>
      ) : null}
    </div>
  );
};
