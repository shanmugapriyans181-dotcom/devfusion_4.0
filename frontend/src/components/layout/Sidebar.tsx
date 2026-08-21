import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
  LayoutDashboard,
  Briefcase,
  Users,
  Kanban,
  FileText,
  Calendar,
  Code2,
  Award,
  LogOut,
  Sparkles,
  Search,
  CheckSquare,
  Shield,
  BarChart3
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const role = user?.role;

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col justify-between h-screen sticky top-0 text-slate-300">
      <div className="p-4 space-y-6">
        <div className="flex items-center gap-2.5 px-2 py-3 border-b border-slate-800">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-600 flex items-center justify-center text-white font-bold shadow-lg shadow-brand-500/30">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="font-bold text-white text-base leading-none">HireAI ATS</div>
            <div className="text-[10px] text-slate-400 font-medium uppercase tracking-wider mt-1">{role} Portal</div>
          </div>
        </div>

        <nav className="space-y-1 text-sm font-medium">
          {/* CANDIDATE LINKS */}
          {role === 'CANDIDATE' && (
            <>
              <NavLink
                to="/candidate/dashboard"
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors ${
                    isActive ? 'bg-brand-600 text-white font-semibold' : 'hover:bg-slate-800 text-slate-400 hover:text-white'
                  }`
                }
              >
                <LayoutDashboard className="w-4 h-4" />
                Candidate Dashboard
              </NavLink>
              <NavLink
                to="/jobs"
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors ${
                    isActive ? 'bg-brand-600 text-white font-semibold' : 'hover:bg-slate-800 text-slate-400 hover:text-white'
                  }`
                }
              >
                <Search className="w-4 h-4" />
                Find Jobs
              </NavLink>
              <NavLink
                to="/candidate/profile"
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors ${
                    isActive ? 'bg-brand-600 text-white font-semibold' : 'hover:bg-slate-800 text-slate-400 hover:text-white'
                  }`
                }
              >
                <FileText className="w-4 h-4" />
                My Profile & Resume
              </NavLink>
              <NavLink
                to="/candidate/assessment"
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors ${
                    isActive ? 'bg-brand-600 text-white font-semibold' : 'hover:bg-slate-800 text-slate-400 hover:text-white'
                  }`
                }
              >
                <Code2 className="w-4 h-4" />
                Monaco Coding Test
              </NavLink>
              <NavLink
                to="/offers"
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors ${
                    isActive ? 'bg-brand-600 text-white font-semibold' : 'hover:bg-slate-800 text-slate-400 hover:text-white'
                  }`
                }
              >
                <Award className="w-4 h-4" />
                My Offer Letters
              </NavLink>
            </>
          )}

          {/* RECRUITER & ADMIN LINKS */}
          {(role === 'RECRUITER' || role === 'ADMIN') && (
            <>
              <NavLink
                to="/recruiter/dashboard"
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors ${
                    isActive ? 'bg-brand-600 text-white font-semibold' : 'hover:bg-slate-800 text-slate-400 hover:text-white'
                  }`
                }
              >
                <LayoutDashboard className="w-4 h-4" />
                Recruiter Hub
              </NavLink>
              <NavLink
                to="/recruiter/jobs"
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors ${
                    isActive ? 'bg-brand-600 text-white font-semibold' : 'hover:bg-slate-800 text-slate-400 hover:text-white'
                  }`
                }
              >
                <Briefcase className="w-4 h-4" />
                Job Postings
              </NavLink>
              <NavLink
                to="/recruiter/pipeline"
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors ${
                    isActive ? 'bg-brand-600 text-white font-semibold' : 'hover:bg-slate-800 text-slate-400 hover:text-white'
                  }`
                }
              >
                <Kanban className="w-4 h-4" />
                Kanban Pipeline
              </NavLink>
              <NavLink
                to="/analytics"
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors ${
                    isActive ? 'bg-brand-600 text-white font-semibold' : 'hover:bg-slate-800 text-slate-400 hover:text-white'
                  }`
                }
              >
                <BarChart3 className="w-4 h-4" />
                Analytics Engine
              </NavLink>
              <NavLink
                to="/offers"
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors ${
                    isActive ? 'bg-brand-600 text-white font-semibold' : 'hover:bg-slate-800 text-slate-400 hover:text-white'
                  }`
                }
              >
                <Award className="w-4 h-4" />
                Offer Letters
              </NavLink>
            </>
          )}

          {/* INTERVIEWER LINK */}
          {(role === 'INTERVIEWER' || role === 'ADMIN') && (
            <NavLink
              to="/interviewer/dashboard"
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors ${
                  isActive ? 'bg-brand-600 text-white font-semibold' : 'hover:bg-slate-800 text-slate-400 hover:text-white'
                }`
              }
            >
              <CheckSquare className="w-4 h-4" />
              Interviewer Hub
            </NavLink>
          )}

          {/* HIRING MANAGER LINK */}
          {(role === 'HIRING_MANAGER' || role === 'ADMIN') && (
            <NavLink
              to="/manager/dashboard"
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors ${
                  isActive ? 'bg-brand-600 text-white font-semibold' : 'hover:bg-slate-800 text-slate-400 hover:text-white'
                }`
              }
            >
              <Users className="w-4 h-4" />
              Manager Decision Hub
            </NavLink>
          )}

          {/* ADMIN LINK */}
          {role === 'ADMIN' && (
            <NavLink
              to="/admin/dashboard"
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors ${
                  isActive ? 'bg-brand-600 text-white font-semibold' : 'hover:bg-slate-800 text-slate-400 hover:text-white'
                }`
              }
            >
              <Shield className="w-4 h-4" />
              Admin Control Panel
            </NavLink>
          )}
        </nav>
      </div>

      <div className="p-4 border-t border-slate-800 space-y-3">
        <div className="flex items-center gap-3 px-2">
          <img
            src={user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
            alt="Avatar"
            className="w-9 h-9 rounded-full border border-slate-700 object-cover"
          />
          <div className="overflow-hidden">
            <div className="font-semibold text-xs text-white truncate">{user?.name}</div>
            <div className="text-[11px] text-slate-400 truncate">{user?.email}</div>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-rose-600/20 hover:text-rose-400 text-slate-300 transition-colors"
        >
          <LogOut className="w-3.5 h-3.5" />
          Sign Out
        </button>
      </div>
    </aside>
  );
};
