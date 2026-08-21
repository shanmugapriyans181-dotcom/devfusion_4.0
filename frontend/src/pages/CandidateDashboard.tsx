import React, { useEffect, useState } from 'react';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { applicationApi } from '../services/application.api';
import { candidateApi } from '../services/candidate.api';
import { offerApi } from '../services/offer.api';
import {
  FileText,
  Briefcase,
  Calendar,
  CheckCircle2,
  Clock,
  Sparkles,
  TrendingUp,
  ArrowRight,
  Activity,
  Award,
  XCircle,
  Building,
  MapPin,
  Check,
  HelpCircle,
  ExternalLink
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const CandidateDashboard: React.FC = () => {
  const [applications, setApplications] = useState<any[]>([]);
  const [offers, setOffers] = useState<any[]>([]);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [appRes, profileRes, offerRes] = await Promise.all([
        applicationApi.getApplications(),
        candidateApi.getProfile().catch(() => ({ data: null })),
        offerApi.getOffers().catch(() => ({ data: [] })),
      ]);
      setApplications(appRes.data || []);
      setProfile(profileRes.data || null);
      setOffers(offerRes.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const calculateProfileCompletion = () => {
    if (!profile) return 0;
    let score = 25;
    if (profile.user?.name) score += 25;
    if (profile.skills?.length > 0) score += 25;
    if (profile.totalExperience > 0 || profile.experience?.length > 0) score += 25;
    return score;
  };

  const completion = calculateProfileCompletion();
  const activeOffers = offers.filter((o) => o.status === 'SENT' || o.status === 'ACCEPTED');

  const getWorkflowStep = (stage: string) => {
    if (stage === 'APPLIED') return 1;
    if (stage.includes('SCREENING')) return 2;
    if (stage.includes('INTERVIEW') || stage === 'SHORTLISTED') return 3;
    if (stage.includes('MANAGER')) return 4;
    if (stage.includes('OFFER')) return 5;
    if (stage === 'HIRED') return 6;
    if (stage === 'REJECTED') return -1;
    return 1;
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-purple-700 via-indigo-600 to-violet-700 p-8 rounded-3xl text-white shadow-xl shadow-purple-500/20">
        <div className="space-y-2">
          <Badge variant="primary" className="bg-white/20 text-white border-white/30">
            Candidate Career Portal
          </Badge>
          <h1 className="text-3xl font-extrabold tracking-tight">Welcome back, {profile?.user?.name || 'Candidate'}!</h1>
          <p className="text-purple-100 text-sm max-w-xl">
            Track real-time progress through screening, online video interviews, and review official offer letters.
          </p>
        </div>
        <Link to="/jobs">
          <Button variant="secondary" className="bg-white text-slate-950 font-bold hover:bg-slate-100 shadow-md">
            Explore Open Jobs <ArrowRight className="w-4 h-4 ml-1.5" />
          </Button>
        </Link>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="glass-card p-6 space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase tracking-wider">
            <span>Profile Completion</span>
            <FileText className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-3xl font-bold text-white">{completion}%</div>
          <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
            <div className="bg-purple-500 h-full rounded-full" style={{ width: `${completion}%` }}></div>
          </div>
        </Card>

        <Card className="glass-card p-6 space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase tracking-wider">
            <span>Active Applications</span>
            <Briefcase className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-3xl font-bold text-white">{applications.length}</div>
          <div className="text-xs text-indigo-400 font-medium flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" /> Active in Recruitment Funnel
          </div>
        </Card>

        <Card className="glass-card p-6 space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase tracking-wider">
            <span>Official Offers</span>
            <Award className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-3xl font-bold text-emerald-400">{activeOffers.length}</div>
          <div className="text-xs text-emerald-500/80">Available for Review</div>
        </Card>

        <Card className="glass-card p-6 space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase tracking-wider">
            <span>AI Resume Match</span>
            <Sparkles className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-3xl font-bold text-purple-400">
            {profile?.resumes?.length > 0 ? 'Verified' : 'Upload Resume'}
          </div>
          <div className="text-xs text-slate-400">
            {profile?.resumes?.length > 0 ? 'AI Profile Active' : 'Attach resume on apply'}
          </div>
        </Card>
      </div>

      {/* Applications List & Real-time Timeline */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div>
            <h2 className="text-xl font-bold text-white">Your Applications & Recruitment Timeline</h2>
            <p className="text-xs text-slate-400">Follow every phase of your application from screening test to final hire.</p>
          </div>
          <Badge variant="primary">{applications.length} Active</Badge>
        </div>

        {applications.length === 0 ? (
          <Card className="glass-card p-12 text-center space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-slate-800 text-purple-400 flex items-center justify-center mx-auto">
              <Briefcase className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">No Active Applications Yet</h3>
            <p className="text-sm text-slate-400 max-w-md mx-auto">Browse published jobs from verified companies and submit your application.</p>
            <Link to="/jobs">
              <Button variant="primary">Browse Open Jobs</Button>
            </Link>
          </Card>
        ) : (
          applications.map((app) => {
            const step = getWorkflowStep(app.stage);
            const isRejected = app.stage === 'REJECTED' || app.stage === 'SCREENING_FAILED' || app.stage === 'INTERVIEW_FAILED';
            const isHired = app.stage === 'HIRED' || app.stage === 'OFFER_ACCEPTED';
            const appOffer = offers.find((o) => o.applicationId === app.id);

            return (
              <Card key={app.id} className={`glass-card p-6 space-y-6 ${isRejected ? 'border-red-500/30 bg-red-950/5' : isHired ? 'border-green-500/30 bg-green-950/5' : ''}`}>
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-bold text-white">{app.job?.title}</h3>
                      <Badge variant={isHired ? 'success' : isRejected ? 'danger' : 'primary'}>
                        {app.stage.replace(/_/g, ' ')}
                      </Badge>
                    </div>
                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400">
                      <span className="flex items-center gap-1 text-purple-300">
                        <Building className="w-3.5 h-3.5" /> {app.job?.company?.name || 'HireAI Platform'}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-indigo-400" /> {app.job?.location}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" /> Applied on {new Date(app.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  {/* Context Action Button */}
                  <div className="flex items-center gap-3">
                    {app.stage === 'SCREENING_TEST_ASSIGNED' && (
                      <Link to="/candidate/assessment">
                        <Button variant="primary" size="sm" className="bg-amber-600 hover:bg-amber-500 shadow-lg shadow-amber-500/20">
                          Start Screening Test <ArrowRight className="w-4 h-4 ml-1" />
                        </Button>
                      </Link>
                    )}

                    {(app.stage === 'INTERVIEW_SCHEDULED' || app.stage === 'TECHNICAL_INTERVIEW') && (
                      <Link to="/candidate/dashboard">
                        <Button variant="primary" size="sm" className="bg-indigo-600 hover:bg-indigo-500 shadow-lg shadow-indigo-500/20">
                          <Activity className="w-4 h-4 mr-1" /> Join Online Video Call
                        </Button>
                      </Link>
                    )}

                    {appOffer && (
                      <Link to="/candidate/offers">
                        <Button variant="primary" size="sm" className="bg-green-600 hover:bg-green-500 shadow-lg shadow-green-500/20">
                          <Award className="w-4 h-4 mr-1" /> Review Offer Letter
                        </Button>
                      </Link>
                    )}
                  </div>
                </div>

                {/* 6-Stage Timeline Stepper */}
                <div className="space-y-3">
                  <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center justify-between">
                    <span>Recruitment Timeline Progression</span>
                    <span className="text-[11px] text-purple-400 font-bold">
                      {isHired ? '🎉 Final Stage: HIRED' : isRejected ? 'Status: REJECTED' : `Current: Stage ${step} of 6`}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 text-xs">
                    {/* Stage 1 */}
                    <div className={`p-3 rounded-xl border text-center transition-all ${step >= 1 ? 'bg-green-500/10 border-green-500/30 text-green-400' : 'bg-slate-900 border-slate-800 text-slate-500'}`}>
                      <div className="font-bold flex items-center justify-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> 1. Applied
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5">Resume Received</div>
                    </div>

                    {/* Stage 2 */}
                    <div className={`p-3 rounded-xl border text-center transition-all ${step >= 2 ? 'bg-green-500/10 border-green-500/30 text-green-400' : step === 1 ? 'bg-purple-500/20 border-purple-500 text-white font-bold' : 'bg-slate-900 border-slate-800 text-slate-500'}`}>
                      <div className="font-bold">2. Screening</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">
                        {app.stage === 'SCREENING_PASSED' ? 'Passed ✅' : app.stage === 'SCREENING_FAILED' ? 'Failed ❌' : 'Test / Review'}
                      </div>
                    </div>

                    {/* Stage 3 */}
                    <div className={`p-3 rounded-xl border text-center transition-all ${step >= 3 ? 'bg-green-500/10 border-green-500/30 text-green-400' : step === 2 ? 'bg-purple-500/20 border-purple-500 text-white font-bold' : 'bg-slate-900 border-slate-800 text-slate-500'}`}>
                      <div className="font-bold">3. Interview</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">
                        {app.stage === 'INTERVIEW_PASSED' ? 'Passed ✅' : app.stage === 'INTERVIEW_FAILED' ? 'Failed ❌' : 'Online Video Call'}
                      </div>
                    </div>

                    {/* Stage 4 */}
                    <div className={`p-3 rounded-xl border text-center transition-all ${step >= 4 ? 'bg-green-500/10 border-green-500/30 text-green-400' : step === 3 ? 'bg-purple-500/20 border-purple-500 text-white font-bold' : 'bg-slate-900 border-slate-800 text-slate-500'}`}>
                      <div className="font-bold">4. Manager Review</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">Decision Board</div>
                    </div>

                    {/* Stage 5 */}
                    <div className={`p-3 rounded-xl border text-center transition-all ${step >= 5 ? 'bg-green-500/10 border-green-500/30 text-green-400' : step === 4 ? 'bg-purple-500/20 border-purple-500 text-white font-bold' : 'bg-slate-900 border-slate-800 text-slate-500'}`}>
                      <div className="font-bold">5. Offer Letter</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">Salary & Terms</div>
                    </div>

                    {/* Stage 6 */}
                    <div className={`p-3 rounded-xl border text-center transition-all ${isHired ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300 font-bold' : isRejected ? 'bg-red-500/10 border-red-500/30 text-red-400' : 'bg-slate-900 border-slate-800 text-slate-500'}`}>
                      <div className="font-bold">{isHired ? '🏆 HIRED' : isRejected ? '❌ REJECTED' : '6. Final Result'}</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">{isHired ? 'Welcome Aboard!' : isRejected ? 'Application Closed' : 'Pending'}</div>
                    </div>
                  </div>
                </div>

                {/* Status Guidance Card */}
                {isRejected && (
                  <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-xs text-red-300 space-y-1">
                    <div className="font-bold flex items-center gap-1.5">
                      <XCircle className="w-4 h-4 text-red-400" /> Application Status: REJECTED
                    </div>
                    <p className="text-slate-400">
                      Thank you for taking the time to interview and explore opportunities with us. After careful evaluation, we will not be moving forward with your application for this specific position. We encourage you to apply for future openings that match your skills.
                    </p>
                  </div>
                )}

                {isHired && (
                  <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/20 text-xs text-green-300 space-y-1">
                    <div className="font-bold flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-green-400" /> Congratulations! You have been officially hired!
                    </div>
                    <p className="text-slate-400">
                      Your offer acceptance has been confirmed. The onboarding team will reach out to you with joining instructions and paperwork.
                    </p>
                  </div>
                )}
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
};
