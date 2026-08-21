import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Role } from '../types';
import { ApiClient } from '../services/api.client';
import { Sparkles, Mail, Lock, User as UserIcon, CheckCircle2, ShieldCheck, RefreshCw, Key } from 'lucide-react';

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();

  // Form Fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<Role>('CANDIDATE');

  // Inline Email Verification State
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [showOtpBox, setShowOtpBox] = useState(false);
  const [otp, setOtp] = useState('');
  const [sendingOtp, setSendingOtp] = useState(false);
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  // General State
  const [error, setError] = useState<string | null>(null);
  const [otpError, setOtpError] = useState<string | null>(null);
  const [isRegistering, setIsRegistering] = useState(false);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);

  // 1. Send OTP to Email
  const handleSendOtp = async () => {
    if (!email || !email.includes('@')) {
      setError('Please enter a valid email address first.');
      return;
    }

    setError(null);
    setOtpError(null);
    setSendingOtp(true);

    try {
      await ApiClient.post('/auth/send-verification-otp', { email });
      setShowOtpBox(true);
      startCooldown();
    } catch (err: any) {
      setError(err.message || 'Failed to send verification code. Please check your email.');
    } finally {
      setSendingOtp(false);
    }
  };

  // 2. Submit & Verify OTP
  const handleVerifyOtp = async () => {
    if (!otp || otp.length < 6) {
      setOtpError('Please enter the 6-digit OTP code.');
      return;
    }

    setOtpError(null);
    setVerifyingOtp(true);

    try {
      await ApiClient.post('/auth/verify-email', { otp, email });
      setIsEmailVerified(true);
      setShowOtpBox(false);
      setError(null);
    } catch (err: any) {
      setOtpError(err.message || 'Invalid or expired OTP code.');
    } finally {
      setVerifyingOtp(false);
    }
  };

  // 3. Final Account Creation
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isEmailVerified) {
      setError('Please verify your email address before creating an account.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    setError(null);
    setIsRegistering(true);

    try {
      await ApiClient.post('/auth/register', {
        name,
        email,
        password,
        role,
        isVerified: true,
      });
      setRegistrationSuccess(true);
      setTimeout(() => {
        navigate('/login');
      }, 2500);
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setIsRegistering(false);
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
    <div className="min-h-[85vh] flex items-center justify-center p-4">
      <Card className="glass-card w-full max-w-md p-8 space-y-6 relative overflow-hidden">
        {registrationSuccess ? (
          <div className="text-center space-y-6 py-6 animate-fade-in">
            <div className="w-16 h-16 bg-green-500/10 text-green-400 rounded-full flex items-center justify-center mx-auto animate-bounce">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Account Created Successfully!</h2>
              <p className="text-sm text-slate-400 mt-2">
                Your email <strong className="text-green-400">{email}</strong> has been verified. Redirecting to login...
              </p>
            </div>
            <Link to="/login" className="block mt-4">
              <Button className="w-full py-3" variant="primary">
                Proceed to Login
              </Button>
            </Link>
          </div>
        ) : (
          <>
            <div className="text-center space-y-2">
              <div className="inline-flex w-12 h-12 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-600 items-center justify-center text-white shadow-lg shadow-brand-500/30">
                <Sparkles className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-bold text-white">Create Account</h2>
              <p className="text-sm text-slate-400">Join HireAI ATS to start hiring or applying</p>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-medium text-center animate-fade-in">
                {error}
              </div>
            )}

            <form onSubmit={handleRegister} className="space-y-4">
              {/* 1. Full Name */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider mb-1 text-slate-300">
                  Full Name
                </label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Jane Smith"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-800 bg-slate-950 focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm text-white placeholder-slate-500"
                  />
                </div>
              </div>

              {/* 2. Email Address with Inline Verify Button / Green Tick */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
                    Email Address
                  </label>
                  {isEmailVerified && (
                    <span className="flex items-center gap-1 text-xs font-semibold text-green-400 bg-green-500/10 px-2 py-0.5 rounded-full border border-green-500/20">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Email Verified
                    </span>
                  )}
                </div>

                <div className="relative flex items-center">
                  <Mail className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
                  <input
                    type="email"
                    required
                    disabled={isEmailVerified}
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setIsEmailVerified(false);
                      setShowOtpBox(false);
                    }}
                    placeholder="jane@company.com"
                    autoComplete="off"
                    className={`w-full pl-10 ${
                      isEmailVerified ? 'pr-10 border-green-500/50 bg-green-950/20 text-green-200' : 'pr-24 border-slate-800 bg-slate-950 text-white'
                    } py-2.5 rounded-xl border focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm placeholder-slate-500 transition-all`}
                  />

                  {/* Verify Email Button inside Input */}
                  {!isEmailVerified ? (
                    <button
                      type="button"
                      disabled={sendingOtp || !email}
                      onClick={handleSendOtp}
                      className="absolute right-2 px-3 py-1 bg-purple-600 hover:bg-purple-500 disabled:bg-slate-800 text-white rounded-lg text-xs font-semibold transition-colors flex items-center gap-1"
                    >
                      {sendingOtp ? (
                        <>
                          <RefreshCw className="w-3 h-3 animate-spin" /> Sending
                        </>
                      ) : (
                        'Verify Email'
                      )}
                    </button>
                  ) : (
                    <CheckCircle2 className="w-5 h-5 text-green-400 absolute right-3" />
                  )}
                </div>
              </div>

              {/* 3. Dropdown OTP Verification Box (Appears directly below email) */}
              {showOtpBox && !isEmailVerified && (
                <div className="p-3.5 rounded-2xl bg-purple-500/5 border border-purple-500/30 space-y-3 animate-fade-in">
                  <div className="flex items-center justify-between text-xs text-purple-300">
                    <span className="flex items-center gap-1.5 font-medium">
                      <Key className="w-3.5 h-3.5 text-purple-400" /> Enter 6-Digit OTP sent to your mail
                    </span>
                    <button
                      type="button"
                      disabled={resendCooldown > 0 || sendingOtp}
                      onClick={handleSendOtp}
                      className={`text-[11px] font-semibold hover:underline ${
                        resendCooldown > 0 ? 'text-slate-500' : 'text-purple-400'
                      }`}
                    >
                      {resendCooldown > 0 ? `Resend (${resendCooldown}s)` : 'Resend'}
                    </button>
                  </div>

                  {otpError && (
                    <div className="text-[11px] text-red-400 bg-red-500/10 p-1.5 rounded-lg text-center">
                      {otpError}
                    </div>
                  )}

                  <div className="flex gap-2">
                    <input
                      type="text"
                      maxLength={6}
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                      placeholder="••••••"
                      className="flex-1 text-center font-mono tracking-widest text-lg py-1.5 rounded-xl border border-slate-700 bg-slate-900 text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-purple-500"
                      autoFocus
                    />
                    <button
                      type="button"
                      disabled={verifyingOtp || otp.length < 6}
                      onClick={handleVerifyOtp}
                      className="px-4 py-1.5 bg-green-600 hover:bg-green-500 disabled:bg-slate-800 text-white rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5"
                    >
                      {verifyingOtp ? <RefreshCw className="w-3 h-3 animate-spin" /> : 'Submit OTP'}
                    </button>
                  </div>
                </div>
              )}

              {/* 4. Password */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider mb-1 text-slate-300">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="•••••••• (Min 6 chars)"
                    autoComplete="new-password"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-800 bg-slate-950 focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm text-white placeholder-slate-500"
                  />
                </div>
              </div>

              {/* 5. Role Selection */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider mb-1 text-slate-300">
                  Select Role
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as Role)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-800 bg-slate-950 focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm text-white"
                >
                  <option value="CANDIDATE">Candidate (Job Seeker)</option>
                  <option value="RECRUITER">Recruiter (Post & Manage Jobs)</option>
                  <option value="HIRING_MANAGER">Hiring Manager (Review & Decide)</option>
                  <option value="INTERVIEWER">Interviewer (Conduct & Score)</option>
                </select>
              </div>

              {/* 6. Submit Button */}
              <Button
                type="submit"
                variant="primary"
                className="w-full py-3 mt-2 font-semibold shadow-lg shadow-purple-500/20"
                isLoading={isRegistering}
                disabled={!isEmailVerified}
              >
                {isEmailVerified ? 'Create Account' : 'Verify Email First to Create Account'}
              </Button>
            </form>

            <div className="text-center text-xs text-slate-400 pt-2">
              Already have an account?{' '}
              <Link to="/login" className="text-purple-400 font-semibold hover:underline">
                Sign In
              </Link>
            </div>
          </>
        )}
      </Card>
    </div>
  );
};
