import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { ApiClient } from '../services/api.client';
import { Sparkles, ArrowLeft, Mail, Key, Lock, CheckCircle2, RefreshCw, Send } from 'lucide-react';

type Step = 'EMAIL' | 'OTP' | 'PASSWORD' | 'SUCCESS';

export const ForgotPasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>('EMAIL');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [devOtp, setDevOtp] = useState<string | null>(null);
  const [resendCooldown, setResendCooldown] = useState(0);

  const maskEmail = (em: string) => {
    if (!em || !em.includes('@')) return em;
    const [user, domain] = em.split('@');
    if (user.length <= 2) return `${user}***@${domain}`;
    return `${user.slice(0, 2)}${'*'.repeat(Math.min(user.length - 2, 5))}@${domain}`;
  };

  // Step 1: Send OTP to Email
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    setError('');

    try {
      const res: any = await ApiClient.post('/auth/forgot-password', { email });
      if (res.data?.devOtp) {
        setDevOtp(res.data.devOtp);
      }
      setStep('OTP');
      startCooldown();
    } catch (err: any) {
      setError(err.message || 'Failed to send OTP. Please check the email address.');
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify OTP
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp || otp.length < 6) {
      setError('Please enter the valid 6-digit OTP code.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await ApiClient.post('/auth/verify-reset-otp', { email, otp });
      setStep('PASSWORD');
    } catch (err: any) {
      setError(err.message || 'Invalid or expired OTP code.');
    } finally {
      setLoading(false);
    }
  };

  // Step 3: Set New Password
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await ApiClient.post('/auth/reset-password', {
        email,
        otp,
        newPassword,
      });
      setStep('SUCCESS');
    } catch (err: any) {
      setError(err.message || 'Failed to update password.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (resendCooldown > 0 || loading) return;
    setLoading(true);
    setError('');
    try {
      const res: any = await ApiClient.post('/auth/forgot-password', { email });
      if (res.data?.devOtp) {
        setDevOtp(res.data.devOtp);
      }
      startCooldown();
    } catch (err: any) {
      setError(err.message || 'Failed to resend OTP.');
    } finally {
      setLoading(false);
    }
  };

  const startCooldown = () => {
    setResendCooldown(30);
    const timer = setInterval(() => {
      setResendCooldown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
      {/* Brand Header */}
      <Link to="/" className="flex items-center gap-2 mb-8 group">
        <div className="w-10 h-10 bg-purple-600 rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform shadow-lg shadow-purple-500/20">
          <Sparkles className="text-white w-5 h-5" />
        </div>
        <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
          HireAI <span className="text-purple-500 text-sm font-semibold px-2 py-0.5 bg-purple-500/10 rounded-full ml-1">ATS</span>
        </span>
      </Link>

      {/* Main Card */}
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
        {/* Progress Tracker */}
        <div className="flex items-center justify-between mb-8 px-4">
          <div className="flex flex-col items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
              step === 'EMAIL' ? 'bg-purple-600 text-white ring-4 ring-purple-500/20' : 'bg-green-500/20 text-green-400'
            }`}>
              1
            </div>
            <span className="text-[10px] text-slate-400 mt-1">Email</span>
          </div>
          <div className={`flex-1 h-0.5 mx-2 ${step !== 'EMAIL' ? 'bg-purple-600' : 'bg-slate-800'}`} />
          <div className="flex flex-col items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
              step === 'OTP' ? 'bg-purple-600 text-white ring-4 ring-purple-500/20' : step === 'PASSWORD' || step === 'SUCCESS' ? 'bg-green-500/20 text-green-400' : 'bg-slate-800 text-slate-500'
            }`}>
              2
            </div>
            <span className="text-[10px] text-slate-400 mt-1">OTP</span>
          </div>
          <div className={`flex-1 h-0.5 mx-2 ${step === 'PASSWORD' || step === 'SUCCESS' ? 'bg-purple-600' : 'bg-slate-800'}`} />
          <div className="flex flex-col items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
              step === 'PASSWORD' ? 'bg-purple-600 text-white ring-4 ring-purple-500/20' : step === 'SUCCESS' ? 'bg-green-500/20 text-green-400' : 'bg-slate-800 text-slate-500'
            }`}>
              3
            </div>
            <span className="text-[10px] text-slate-400 mt-1">Password</span>
          </div>
        </div>

        {/* Error Notification */}
        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm text-center animate-fade-in">
            {error}
          </div>
        )}

        {/* STEP 1: Enter Email */}
        {step === 'EMAIL' && (
          <div>
            <div className="text-center mb-6">
              <h1 className="text-2xl font-bold text-white mb-2">Forgot Password</h1>
              <p className="text-slate-400 text-sm">
                Enter your registered email address. We will send a 6-digit OTP code to verify your identity.
              </p>
            </div>

            <form onSubmit={handleSendOtp} className="space-y-5">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Mail className="h-4 w-4 text-slate-500" />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="block w-full pl-10 pr-3 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-sm"
                    placeholder="user@example.com"
                    autoFocus
                  />
                </div>
              </div>

              <Button type="submit" className="w-full py-3 flex items-center justify-center gap-2" disabled={loading || !email}>
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" /> Sending OTP...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" /> Send 6-Digit OTP
                  </>
                )}
              </Button>

              <div className="text-center pt-4">
                <Link to="/login" className="inline-flex items-center text-sm font-medium text-slate-400 hover:text-white transition-colors">
                  <ArrowLeft className="w-4 h-4 mr-2" /> Back to Login
                </Link>
              </div>
            </form>
          </div>
        )}

        {/* STEP 2: Enter 6-Digit OTP */}
        {step === 'OTP' && (
          <div>
            <div className="text-center mb-6">
              <div className="w-12 h-12 bg-purple-500/10 text-purple-400 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <Key className="w-6 h-6" />
              </div>
              <h1 className="text-2xl font-bold text-white mb-1">Verify OTP Code</h1>
              <p className="text-slate-400 text-sm">
                OTP sent to your email: <br />
                <span className="text-purple-400 font-semibold text-base tracking-wide">{maskEmail(email)}</span>
              </p>
            </div>



            <form onSubmit={handleVerifyOtp} className="space-y-5">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider text-center block">
                  6-Digit OTP Code
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                    className="block w-full text-center tracking-[0.6em] font-mono text-2xl py-3 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                    placeholder="••••••"
                    autoFocus
                  />
                </div>
              </div>

              <Button type="submit" className="w-full py-3" disabled={loading || otp.length < 6}>
                {loading ? 'Verifying OTP...' : 'Verify OTP & Continue'}
              </Button>

              <div className="flex items-center justify-between text-xs text-slate-400 pt-2">
                <button
                  type="button"
                  onClick={() => setStep('EMAIL')}
                  className="hover:text-white transition-colors"
                >
                  Change Email
                </button>
                <button
                  type="button"
                  disabled={resendCooldown > 0 || loading}
                  onClick={handleResendOtp}
                  className={`hover:text-purple-400 transition-colors font-medium ${
                    resendCooldown > 0 ? 'text-slate-600 cursor-not-allowed' : 'text-purple-500'
                  }`}
                >
                  {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend OTP'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* STEP 3: Enter New Password & Confirm Password */}
        {step === 'PASSWORD' && (
          <div>
            <div className="text-center mb-6">
              <div className="w-12 h-12 bg-green-500/10 text-green-400 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <Lock className="w-6 h-6" />
              </div>
              <h1 className="text-2xl font-bold text-white mb-1">Create New Password</h1>
              <p className="text-slate-400 text-sm">
                OTP verified for <span className="text-green-400 font-semibold">{maskEmail(email)}</span>. Set your new password below.
              </p>
            </div>

            <form onSubmit={handleResetPassword} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  New Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Lock className="h-4 w-4 text-slate-500" />
                  </div>
                  <input
                    type="password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                    placeholder="Enter new password (min 6 chars)"
                    autoFocus
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  Confirm Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Lock className="h-4 w-4 text-slate-500" />
                  </div>
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                    placeholder="Confirm new password"
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full py-3 mt-2"
                disabled={loading || !newPassword || !confirmPassword || newPassword !== confirmPassword}
              >
                {loading ? 'Updating Password...' : 'Change Password & Submit'}
              </Button>
            </form>
          </div>
        )}

        {/* STEP 4: Success State */}
        {step === 'SUCCESS' && (
          <div className="text-center space-y-6 py-4">
            <div className="w-16 h-16 bg-green-500/10 text-green-400 rounded-full flex items-center justify-center mx-auto mb-2 animate-bounce">
              <CheckCircle2 className="w-9 h-9" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white mb-2">Password Updated!</h1>
              <p className="text-slate-400 text-sm">
                Your password for <strong>{maskEmail(email)}</strong> has been successfully updated.
              </p>
            </div>
            <Link to="/login" className="block">
              <Button className="w-full py-3">
                Log In with New Password
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};
