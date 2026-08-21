import React from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../ui/Button';
import { Sparkles, Sun, Moon, Briefcase, UserCheck, LogOut } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const { user, isAuthenticated, logout } = useAuth();

  const getDashboardPath = (role?: string) => {
    switch (role) {
      case 'ADMIN':
        return '/admin/dashboard';
      case 'RECRUITER':
        return '/recruiter/dashboard';
      case 'HIRING_MANAGER':
        return '/manager/dashboard';
      case 'INTERVIEWER':
        return '/interviewer/dashboard';
      case 'CANDIDATE':
      default:
        return '/candidate/dashboard';
    }
  };

  const dashboardPath = getDashboardPath(user?.role);

  return (
    <header className="sticky top-0 z-50 glass-nav transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 text-xl font-bold tracking-tight">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-brand-500/30">
            <Sparkles className="w-5 h-5" />
          </div>
          <span>
            Hire<span className="gradient-text">AI</span> <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-brand-500/10 text-brand-500 border border-brand-500/20">ATS</span>
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600 dark:text-slate-300">
          <Link to="/" className="hover:text-brand-500 transition-colors">Home</Link>
          {isAuthenticated && (
            <Link to={dashboardPath} className="text-brand-500 font-semibold hover:underline">
              Dashboard
            </Link>
          )}
          <a href="#features" className="hover:text-brand-500 transition-colors">Features</a>
          <a href="#how-it-works" className="hover:text-brand-500 transition-colors">How It Works</a>
          <a href="#pricing" className="hover:text-brand-500 transition-colors">Pricing</a>
          <a href="#faq" className="hover:text-brand-500 transition-colors">FAQ</a>
        </nav>

        <div className="flex items-center gap-3">
          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Toggle theme"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          {isAuthenticated ? (
            <div className="flex items-center gap-2">
              <Link to={dashboardPath}>
                <Button variant="primary" size="sm">
                  Go to Dashboard
                </Button>
              </Link>
              <Link to={dashboardPath}>
                <span className="text-xs font-semibold px-2.5 py-1.5 rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/20 hover:bg-purple-500/20 transition-colors cursor-pointer">
                  {user?.role}
                </span>
              </Link>
              <Button variant="outline" size="sm" onClick={logout}>
                <LogOut className="w-4 h-4 mr-1.5" />
                Logout
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link to="/login">
                <Button variant="ghost" size="sm">Log In</Button>
              </Link>
              <Link to="/register">
                <Button variant="primary" size="sm">
                  Get Started
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

