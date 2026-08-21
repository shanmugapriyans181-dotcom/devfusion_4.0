import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { useAuth } from '../contexts/AuthContext';
import { Shield, Mail, Lock } from 'lucide-react';

export const AdminLoginPage: React.FC = () => {
  // Pre-filled permanent admin credentials
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { user, login } = useAuth();
  const navigate = useNavigate();

  React.useEffect(() => {
    if (user && user.role === 'ADMIN') {
      navigate('/admin/dashboard', { replace: true });
    } else if (user) {
      navigate('/login', { replace: true });
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const loggedUser = await login({ email, password });
      if (loggedUser.role === 'ADMIN') {
        navigate('/admin/dashboard');
      } else {
        setError('Unauthorized: You are not an admin.');
      }
    } catch (err: any) {
      setError(err.message || 'Admin login failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center p-4">
      <Card className="glass-card w-full max-w-md p-8 space-y-6 relative overflow-hidden">
        {/* Decorative background element */}
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-32 h-32 rounded-full bg-purple-500/20 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-32 h-32 rounded-full bg-brand-500/20 blur-3xl"></div>

        <div className="text-center space-y-2 relative z-10">
          <div className="inline-flex w-14 h-14 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 items-center justify-center text-white shadow-xl shadow-purple-500/30 mb-2">
            <Shield className="w-7 h-7" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight">Admin Portal</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">Secure system administrator access</p>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-500 text-sm font-medium relative z-10 text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5 relative z-10">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5 text-slate-600 dark:text-slate-400">Admin Email</label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@gmail.com"
                autoComplete="off"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-purple-200 dark:border-purple-900/50 bg-white/50 dark:bg-purple-900/10 focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm font-medium text-slate-700 dark:text-slate-300"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5 text-slate-600 dark:text-slate-400">Admin Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete="new-password"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-purple-200 dark:border-purple-900/50 bg-white/50 dark:bg-purple-900/10 focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm font-medium text-slate-700 dark:text-slate-300"
              />
            </div>
          </div>

          <Button type="submit" variant="primary" className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 shadow-lg shadow-purple-500/25 border-none" isLoading={isLoading}>
            Login to Admin Dashboard
          </Button>
        </form>
        
        <div className="text-center text-xs text-slate-500 relative z-10 pt-4 border-t border-slate-200 dark:border-slate-800">
          <Link to="/login" className="hover:text-purple-500 transition-colors">
            &larr; Back to standard login
          </Link>
        </div>
      </Card>
    </div>
  );
};
