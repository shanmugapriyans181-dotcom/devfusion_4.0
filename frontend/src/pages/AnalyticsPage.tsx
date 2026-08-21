import React, { useEffect, useState } from 'react';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { ApiClient } from '../services/api.client';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line
} from 'recharts';
import { BarChart3, TrendingUp, Users, Calendar, Award, Sparkles } from 'lucide-react';

export const AnalyticsPage: React.FC = () => {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const res = await ApiClient.get<{ data: any }>('/analytics/recruiter');
      setData(res.data);
    } catch (e) {
      console.error(e);
    }
  };

  const funnelData = data?.funnel || [
    { stage: 'Applied', count: 0 },
    { stage: 'Screening', count: 0 },
    { stage: 'Shortlisted', count: 0 },
    { stage: 'Tech Interview', count: 0 },
    { stage: 'HR Interview', count: 0 },
    { stage: 'Offer', count: 0 },
    { stage: 'Hired', count: 0 },
  ];

  const sourceData = data?.candidateSources || [
    { name: 'Careers Portal', value: 0 },
    { name: 'LinkedIn', value: 0 },
    { name: 'Referrals', value: 0 },
    { name: 'Agencies', value: 0 },
  ];

  const monthlyHiringData = [
    { month: 'Jan', hires: 0 },
    { month: 'Feb', hires: 0 },
    { month: 'Mar', hires: 0 },
    { month: 'Apr', hires: 0 },
    { month: 'May', hires: 0 },
    { month: 'Jun', hires: 0 },
  ];

  const COLORS = ['#3b74f6', '#6366f1', '#8b5cf6', '#10b981'];

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Recruitment Analytics & Insights</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Real-time database metrics computed directly from platform activity.</p>
        </div>
        <Badge variant="primary" className="py-1 px-3">
          <Sparkles className="w-3.5 h-3.5 mr-1 inline" /> Real Data Engine
        </Badge>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        <Card className="glass-card p-6 space-y-2">
          <div className="text-xs font-semibold text-slate-400 uppercase">Offer Acceptance Rate</div>
          <div className="text-3xl font-bold text-emerald-400">{data?.metrics?.offerAcceptanceRate ?? 0}%</div>
          <div className="text-xs text-slate-400">Live platform metrics</div>
        </Card>

        <Card className="glass-card p-6 space-y-2">
          <div className="text-xs font-semibold text-slate-400 uppercase">Avg Time to Hire</div>
          <div className="text-3xl font-bold text-brand-400">{data?.metrics?.avgTimeToHireDays ?? 0} Days</div>
          <div className="text-xs text-slate-400">Live pipeline speed</div>
        </Card>

        <Card className="glass-card p-6 space-y-2">
          <div className="text-xs font-semibold text-slate-400 uppercase">Total Candidates</div>
          <div className="text-3xl font-bold text-white">{data?.metrics?.totalCandidates ?? 0}</div>
          <div className="text-xs text-indigo-400">Evaluated candidates</div>
        </Card>

        <Card className="glass-card p-6 space-y-2">
          <div className="text-xs font-semibold text-slate-400 uppercase">Active Postings</div>
          <div className="text-3xl font-bold text-purple-400">{data?.metrics?.activeJobs ?? 0}</div>
          <div className="text-xs text-slate-400">TechNova Solutions</div>
        </Card>
      </div>


      {/* Charts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card className="glass-card p-6 space-y-4">
          <h3 className="text-lg font-bold">Applicant Conversion Funnel</h3>
          <div className="h-64 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={funnelData}>
                <XAxis dataKey="stage" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', color: '#fff' }} />
                <Bar dataKey="count" fill="#3b74f6" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="glass-card p-6 space-y-4">
          <h3 className="text-lg font-bold">Monthly Hires Velocity</h3>
          <div className="h-64 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlyHiringData}>
                <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', color: '#fff' }} />
                <Line type="monotone" dataKey="hires" stroke="#10b981" strokeWidth={3} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
    </div>
  );
};
