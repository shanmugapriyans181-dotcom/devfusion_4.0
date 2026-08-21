import React, { useEffect, useState, useRef } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { ApiClient } from '../services/api.client';
import { Sparkles, CheckCircle2, XCircle, RefreshCw, Key, Mail, ShieldCheck } from 'lucide-react';

export const VerifyEmailPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const urlEmail = searchParams.get('email') || '';
  const navigate = useNavigate();
  const hasAttempted = useRef(false);

  const [email, setEmail] = useState(urlEmail);
  const [otp, setOtp] = useState(token || '');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (token && !hasAttempted.current) {
      hasAttempted.current = true;
      setLoading(true);
      ApiClient.post('/auth/verify-email', { token, otp: token, email: urlEmail })
        .then(() => {
          setSuccess(true);
        })
        .catch((err: any) => {
          setError(err.message || 'Verification failed. Please enter your 6-digit OTP code manually.');
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [token, urlEmail]);

  const handleManualVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp) {
      setError('Please enter the 6-digit OTP verification code.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await ApiClient.post('/auth/verify-email', { token: otp, otp, email });
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Verification failed. Invalid or expired OTP code.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
      <Link to="/" className="flex items-center gap-2 mb-8 group">
        <div className="w-10 h-10 bg-purple-600 rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform shadow-lg shadow-purple-500/20">
          <Sparkles className="text-white w-5 h-5" />
        </div>
        <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
          HireAI <span className="text-purple-500 text-sm font-semibold px-2 py-0.5 bg-purple-500/10 rounded-full ml-1">ATS</span>
        </span>
      </Link>

      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl">
        <div className="mb-6 p-2.5 rounded-xl bg-purple-500/5 border border-purple-500/20 flex items-center justify-between text-xs text-purple-300">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-purple-400" />
            <span>Sender: <strong>shanmugapriyans0418@gmail.com</strong></span>
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center space-y-4 py-8">
            <RefreshCw className="w-12 h-12 text-purple-500 animate-spin" />
            <p className="text-slate-400">Verifying your email address...</p>
          </div>
        ) : success ? (
          <div className="space-y-6 py-4 text-center">
            <div className="w-20 h-20 bg-green-500/10 text-green-400 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white mb-2">Email Verified!</h1>
              <p className="text-slate-400 text-sm">
                Your email has been confirmed. You now have full access to your HireAI ATS workspace.
              </p>
            </div>
            <Link to="/login" className="block mt-6">
              <Button className="w-full py-3">Continue to Login</Button>
            </Link>
          </div>
        ) : (
          <div>
            <div className="text-center mb-6">
              <div className="w-12 h-12 bg-purple-500/10 text-purple-400 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <Key className="w-6 h-6" />
              </div>
              <h1 className="text-2xl font-bold text-white mb-1">Verify Email Address</h1>
              <p className="text-slate-400 text-sm">
                Enter the 6-digit OTP verification code sent to your email from <strong>shanmugapriyans0418@gmail.com</strong>.
              </p>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm text-center">
                {error}
              </div>
            )}

            <form onSubmit={handleManualVerify} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="h-4 w-4 text-slate-500 absolute left-3.5 top-3" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                    placeholder="user@example.com"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  6-Digit OTP Code
                </label>
                <div className="relative">
                  <Key className="h-4 w-4 text-slate-500 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                    className="block w-full pl-10 pr-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono tracking-widest text-center text-lg placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="123456"
                  />
                </div>
              </div>

              <Button type="submit" className="w-full py-3 mt-2" disabled={loading || !otp}>
                Verify Email Code
              </Button>

              <div className="text-center pt-2">
                <Link to="/login" className="text-xs text-slate-400 hover:text-white">
                  Back to Login
                </Link>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
