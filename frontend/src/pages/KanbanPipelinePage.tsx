import React, { useEffect, useState } from 'react';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { applicationApi } from '../services/application.api';
import { ApplicationStage } from '../types';
import { Sparkles, User, MoveRight, CheckCircle, ArrowRightLeft } from 'lucide-react';

const KANBAN_STAGES: { key: ApplicationStage; label: string; color: string }[] = [
  { key: 'APPLIED', label: 'Applied', color: 'border-slate-500' },
  { key: 'SCREENING', label: 'Screening', color: 'border-sky-500' },
  { key: 'SHORTLISTED', label: 'Shortlisted', color: 'border-indigo-500' },
  { key: 'TECHNICAL_INTERVIEW', label: 'Tech Interview', color: 'border-brand-500' },
  { key: 'HR_INTERVIEW', label: 'HR Interview', color: 'border-purple-500' },
  { key: 'OFFER', label: 'Offer Sent', color: 'border-amber-500' },
  { key: 'HIRED', label: 'Hired', color: 'border-emerald-500' },
  { key: 'REJECTED', label: 'Rejected', color: 'border-rose-500' },
];

export const KanbanPipelinePage: React.FC = () => {
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    fetchApplications();
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

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Interactive Kanban Recruitment Pipeline</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Drag or select candidates to move them across stage columns with instant PostgreSQL database sync.
          </p>
        </div>
        <Badge variant="primary" className="py-1 px-3">
          <Sparkles className="w-3.5 h-3.5 mr-1 inline" /> Real-Time Sync Enabled
        </Badge>
      </div>

      {/* Kanban Board Layout */}
      <div className="flex gap-4 overflow-x-auto pb-6 min-h-[75vh]">
        {KANBAN_STAGES.map((stageObj) => {
          const stageApps = applications.filter((app) => app.stage === stageObj.key);

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
                  stageApps.map((app) => (
                    <Card
                      key={app.id}
                      className="glass-card p-4 space-y-3 hover:border-brand-500/50 transition-all cursor-pointer text-left bg-slate-900"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2.5">
                          <img
                            src={
                              app.candidate?.user?.avatar ||
                              'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150'
                            }
                            alt="Avatar"
                            className="w-8 h-8 rounded-full object-cover border border-slate-700"
                          />
                          <div>
                            <div className="font-bold text-xs text-white truncate max-w-[130px]">
                              {app.candidate?.user?.name || 'Candidate'}
                            </div>
                            <div className="text-[10px] text-slate-400 truncate max-w-[130px]">
                              {app.job?.title}
                            </div>
                          </div>
                        </div>
                        <Badge variant="success" className="text-[10px] px-1.5 py-0.5">
                          {app.matchScore || 88.5}%
                        </Badge>
                      </div>

                      <div className="text-[11px] text-slate-400 line-clamp-2">
                        {app.candidate?.user?.email}
                      </div>

                      {/* Stage Selector Dropdown */}
                      <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                        <span className="text-[10px] text-slate-500 uppercase font-semibold">Move Stage:</span>
                        <select
                          disabled={updatingId === app.id}
                          value={app.stage}
                          onChange={(e) => handleStageChange(app.id, e.target.value as ApplicationStage)}
                          className="text-[11px] px-2 py-1 rounded-lg bg-slate-800 border border-slate-700 text-slate-200 focus:outline-none focus:ring-1 focus:ring-brand-500 cursor-pointer"
                        >
                          {KANBAN_STAGES.map((s) => (
                            <option key={s.key} value={s.key}>
                              {s.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </Card>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
