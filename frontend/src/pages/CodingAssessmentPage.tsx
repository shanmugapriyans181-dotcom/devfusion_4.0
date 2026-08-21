import React, { useEffect, useState } from 'react';
import Editor from '../components/ui/MonacoEditorStub';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { assessmentApi } from '../services/assessment.api';
import { Clock, AlertTriangle, Play, CheckCircle2, Code2, FileCode } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const CodingAssessmentPage: React.FC = () => {
  const [assessment, setAssessment] = useState<any>(null);
  const [timeLeft, setTimeLeft] = useState(45 * 60); // 45 minutes countdown
  const [tabSwitches, setTabSwitches] = useState(0);
  const [activeQuestionIdx, setActiveQuestionIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [resultAttempt, setResultAttempt] = useState<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchAssessment();
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

  const fetchAssessment = async () => {
    try {
      const res = await assessmentApi.getAssessments();
      if (res.data && res.data.length > 0) {
        const firstAssessment = res.data[0];
        setAssessment(firstAssessment);
        // Initialize sample answer code
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
    } catch (e: any) {
      alert(e.message || 'Failed to submit assessment');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  if (!assessment) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500"></div>
      </div>
    );
  }

  if (isSubmitted) {
    return (
      <div className="max-w-2xl mx-auto py-12 space-y-6 text-center">
        <Card className="glass-card p-8 space-y-6">
          <div className="w-16 h-16 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center mx-auto border border-emerald-500/20">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold">Assessment Completed</h2>
          <p className="text-sm text-slate-400">Your test submission has been recorded and auto-scored.</p>

          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
            <div className="text-xs font-semibold uppercase text-slate-400">Your Final Score</div>
            <div className="text-5xl font-extrabold text-brand-400">{resultAttempt?.score || 90} / 100</div>
            <Badge variant={resultAttempt?.status === 'PASSED' ? 'success' : 'danger'} className="text-sm px-4 py-1">
              Status: {resultAttempt?.status || 'PASSED'}
            </Badge>
          </div>

          <Button variant="primary" onClick={() => navigate('/candidate/dashboard')}>
            Return to Candidate Dashboard
          </Button>
        </Card>
      </div>
    );
  }

  const currentQ = assessment.questions[activeQuestionIdx];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Assessment Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-2xl bg-slate-900 border border-slate-800">
        <div>
          <h2 className="text-lg font-bold text-white">{assessment.title}</h2>
          <div className="text-xs text-slate-400">Question {activeQuestionIdx + 1} of {assessment.questions.length}</div>
        </div>

        <div className="flex items-center gap-4">
          {tabSwitches > 0 && (
            <Badge variant="warning" className="animate-pulse">
              <AlertTriangle className="w-3.5 h-3.5 mr-1 inline" /> {tabSwitches} Tab Switch Warnings
            </Badge>
          )}

          <div className="flex items-center gap-2 font-mono font-bold text-base px-4 py-2 rounded-xl bg-slate-800 text-brand-400 border border-slate-700">
            <Clock className="w-4 h-4 text-brand-500" />
            <span>{formatTime(timeLeft)}</span>
          </div>

          <Button variant="primary" size="sm" onClick={handleSubmit} isLoading={isSubmitting}>
            Submit Test
          </Button>
        </div>
      </div>

      {/* Monaco & Question Layout */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 min-h-[600px]">
        {/* Question Panel */}
        <Card className="glass-card p-6 md:col-span-5 space-y-6 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <Badge variant="info">{currentQ?.questionType}</Badge>
              <span className="text-xs font-semibold text-slate-400">{currentQ?.points} Points</span>
            </div>

            <h3 className="text-base font-bold text-white">{currentQ?.title}</h3>
            <p className="text-sm text-slate-300 whitespace-pre-line leading-relaxed">{currentQ?.questionText}</p>

            {currentQ?.questionType === 'MCQ' && currentQ?.options && (
              <div className="space-y-2 pt-2">
                {(currentQ.options as string[]).map((opt) => (
                  <button
                    key={opt}
                    onClick={() => handleMcqSelect(opt, currentQ.id)}
                    className={`w-full p-3 rounded-xl border text-left text-xs font-medium transition-colors ${
                      answers[currentQ.id]?.selectedOption === opt
                        ? 'bg-brand-500/20 border-brand-500 text-brand-400'
                        : 'bg-slate-900 border-slate-800 hover:border-slate-700 text-slate-300'
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Question Navigation */}
          <div className="flex items-center justify-between border-t border-slate-800 pt-4">
            <Button
              variant="outline"
              size="sm"
              disabled={activeQuestionIdx === 0}
              onClick={() => setActiveQuestionIdx((prev) => prev - 1)}
            >
              Previous
            </Button>
            <Button
              variant="secondary"
              size="sm"
              disabled={activeQuestionIdx === assessment.questions.length - 1}
              onClick={() => setActiveQuestionIdx((prev) => prev + 1)}
            >
              Next Question
            </Button>
          </div>
        </Card>

        {/* Monaco Editor Panel */}
        <Card className="glass-card p-0 md:col-span-7 flex flex-col overflow-hidden border-slate-800 bg-slate-950">
          <div className="p-3 bg-slate-900 border-b border-slate-800 flex items-center justify-between text-xs text-slate-400 font-mono">
            <div className="flex items-center gap-2">
              <Code2 className="w-4 h-4 text-brand-500" />
              <span>solution.{currentQ?.questionType === 'SQL' ? 'sql' : 'ts'}</span>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" className="h-7 text-xs">
                <Play className="w-3 h-3 mr-1 text-emerald-400" /> Run Sandbox
              </Button>
            </div>
          </div>

          <div className="flex-1 min-h-[480px]">
            <Editor
              height="100%"
              theme="vs-dark"
              defaultLanguage={currentQ?.questionType === 'SQL' ? 'sql' : 'typescript'}
              value={answers[currentQ?.id]?.submittedCode || currentQ?.sampleCode || ''}
              onChange={(val: any) => handleCodeChange(val, currentQ?.id)}
              options={{
                fontSize: 13,
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                automaticLayout: true,
              }}
            />
          </div>
        </Card>
      </div>
    </div>
  );
};
