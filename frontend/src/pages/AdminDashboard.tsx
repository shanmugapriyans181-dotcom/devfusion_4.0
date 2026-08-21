import React, { useEffect, useState } from 'react';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { ApiClient } from '../services/api.client';
import { Role } from '../types';
import { Shield, Users, Briefcase, FileText, Activity, Settings, Key, AlertCircle } from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [overview, setOverview] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [updatingUserId, setUpdatingUserId] = useState<string | null>(null);

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    try {
      const [usersRes, logsRes, overviewRes] = await Promise.all([
        ApiClient.get<{ data: any[] }>('/admin/users'),
        ApiClient.get<{ data: any[] }>('/admin/audit-logs'),
        ApiClient.get<{ data: any }>('/admin/overview'),
      ]);
      setUsers(usersRes.data || []);
      setAuditLogs(logsRes.data || []);
      setOverview(overviewRes.data || null);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId: string, newRole: Role) => {
    setUpdatingUserId(userId);
    try {
      await ApiClient.put(`/admin/users/${userId}/role`, { role: newRole });
      await fetchAdminData();
    } catch (e: any) {
      alert(e.message || 'Failed to update user role');
    } finally {
      setUpdatingUserId(null);
    }
  };

  const handleClearAllData = async () => {
    if (window.confirm('Are you sure you want to clear all demo data? This will reset jobs, applications, candidates, interviews, and assessments.')) {
      try {
        await ApiClient.post('/admin/clear-data');
        alert('All demo data cleared successfully!');
        await fetchAdminData();
      } catch (e: any) {
        alert(e.message || 'Failed to clear demo data');
      }
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Admin Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-purple-950 via-slate-900 to-purple-900 p-8 rounded-3xl text-white border border-purple-500/20 shadow-2xl">
        <div className="space-y-2">
          <Badge variant="danger" className="bg-purple-500/20 text-purple-300 border-purple-500/30">System Administration</Badge>
          <h1 className="text-3xl font-extrabold tracking-tight">Enterprise Control & Governance</h1>
          <p className="text-purple-200 text-sm max-w-xl">
            Full system control: User role management, platform configurations, security audit trails, and global entity controls.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="danger" size="sm" onClick={handleClearAllData}>
            Clear All Demo Data
          </Button>
          <Button variant="secondary" size="sm">System Reports</Button>
        </div>
      </div>


      {/* System Overview Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card className="glass-card p-5 space-y-1">
          <div className="text-xs font-semibold text-slate-400 uppercase">Total Users</div>
          <div className="text-2xl font-bold text-white">{overview?.usersCount ?? users.length}</div>
        </Card>

        <Card className="glass-card p-5 space-y-1">
          <div className="text-xs font-semibold text-slate-400 uppercase">Jobs Posted</div>
          <div className="text-2xl font-bold text-white">{overview?.jobsCount ?? 0}</div>
        </Card>

        <Card className="glass-card p-5 space-y-1">
          <div className="text-xs font-semibold text-slate-400 uppercase">Applications</div>
          <div className="text-2xl font-bold text-white">{overview?.appsCount ?? 0}</div>
        </Card>

        <Card className="glass-card p-5 space-y-1">
          <div className="text-xs font-semibold text-slate-400 uppercase">Interviews</div>
          <div className="text-2xl font-bold text-white">{overview?.interviewsCount ?? 0}</div>
        </Card>

        <Card className="glass-card p-5 space-y-1">
          <div className="text-xs font-semibold text-slate-400 uppercase">Offers Issued</div>
          <div className="text-2xl font-bold text-white">{overview?.offersCount ?? 0}</div>
        </Card>
      </div>


      {/* User Management Table */}
      <Card className="glass-card p-6 space-y-6">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div>
            <h3 className="text-lg font-bold text-white">System User Management & Role-Based Access</h3>
            <p className="text-xs text-slate-400">Change account permissions and roles across the platform</p>
          </div>
          <Badge variant="primary">5 Active Roles Supported</Badge>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-900 uppercase text-slate-400 font-semibold border-b border-slate-800">
              <tr>
                <th className="p-3">User</th>
                <th className="p-3">Email Address</th>
                <th className="p-3">Current Role</th>
                <th className="p-3">Status</th>
                <th className="p-3 text-right">Role Control</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 font-medium">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-slate-900/50 transition-colors">
                  <td className="p-3 flex items-center gap-3">
                    <img
                      src={u.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                      alt="Avatar"
                      className="w-8 h-8 rounded-full object-cover border border-slate-700"
                    />
                    <span className="font-bold text-white text-sm">{u.name}</span>
                  </td>
                  <td className="p-3">{u.email}</td>
                  <td className="p-3">
                    <Badge variant={u.role === 'ADMIN' ? 'danger' : u.role === 'RECRUITER' ? 'primary' : 'neutral'}>
                      {u.role}
                    </Badge>
                  </td>
                  <td className="p-3">
                    <Badge variant="success">Active</Badge>
                  </td>
                  <td className="p-3 text-right">
                    {u.role === 'ADMIN' ? (
                      <span className="text-[11px] font-semibold text-slate-500 italic px-3 py-1.5 uppercase tracking-wider">System Protected</span>
                    ) : (
                      <select
                        disabled={updatingUserId === u.id}
                        value={u.role}
                        onChange={(e) => handleRoleChange(u.id, e.target.value as Role)}
                        className="px-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white focus:ring-2 focus:ring-purple-500 cursor-pointer"
                      >
                        <option value="CANDIDATE">Candidate</option>
                        <option value="RECRUITER">Recruiter</option>
                        <option value="HIRING_MANAGER">Hiring Manager</option>
                        <option value="INTERVIEWER">Interviewer</option>
                        <option value="ADMIN">Admin</option>
                      </select>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* System Audit Logs */}
      <Card className="glass-card p-6 space-y-6">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div>
            <h3 className="text-lg font-bold text-white">Security & Operations Audit Trail</h3>
            <p className="text-xs text-slate-400">Immutable record of logins, stage changes, role updates, and system events</p>
          </div>
          <Badge variant="neutral">Compliance Enabled</Badge>
        </div>

        <div className="divide-y divide-slate-800 text-xs">
          {auditLogs.length === 0 ? (
            <div className="p-6 text-center text-slate-500">No audit log records found</div>
          ) : (
            auditLogs.map((log) => (
              <div key={log.id} className="py-3 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center font-bold">
                    <Activity className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-bold text-slate-200">{log.action} ({log.entity})</div>
                    <div className="text-[11px] text-slate-400">By {log.userEmail || log.user?.email || 'System'} • IP: {log.ipAddress || '127.0.0.1'}</div>
                  </div>
                </div>
                <div className="text-slate-400 font-mono text-[11px]">
                  {new Date(log.createdAt).toLocaleString()}
                </div>
              </div>
            ))
          )}
        </div>
      </Card>
    </div>
  );
};
