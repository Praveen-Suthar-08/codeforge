import React, { useEffect, useState } from 'react';
import { 
  ShieldAlert, 
  Activity, 
  Users, 
  FileDown, 
  FileUp, 
  Database, 
  CheckCircle2 
} from 'lucide-react';
import { apiRequest } from '../services/api';

export const AdminPanel: React.FC = () => {
  const [health, setHealth] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeSubTab, setActiveSubTab] = useState<'health' | 'users' | 'logs' | 'data'>('health');

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        const [healthRes, usersRes, logsRes] = await Promise.all([
          apiRequest('/admin/health'),
          apiRequest('/admin/users'),
          apiRequest('/admin/audit-logs')
        ]);
        setHealth(healthRes);
        setUsers(usersRes.users || []);
        setLogs(logsRes.logs || []);
      } catch (err) {
        console.error('Failed to load admin data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAdminData();
  }, []);

  const handleExportProblems = () => {
    window.open('/api/admin/export-problems', '_blank');
  };

  const handleUpdateRole = async (userId: string, newRole: string) => {
    try {
      await apiRequest(`/admin/users/${userId}/role`, {
        method: 'PUT',
        body: JSON.stringify({ role: newRole })
      });
      setUsers(prev => prev.map(u => (u.id === userId ? { ...u, role: newRole } : u)));
      alert('Role updated successfully');
    } catch (e: any) {
      alert(e.message);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-indigo-600 dark:border-emerald-400 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-6 max-w-6xl mx-auto w-full select-none space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-main)] flex items-center gap-2">
            <ShieldAlert size={24} className="text-amber-500" />
            System Administration & Control Center
          </h1>
          <p className="text-xs text-[var(--text-muted)] mt-1">
            Monitor system health, manage role privileges, inspect security audit logs, and backup JSON problem databases.
          </p>
        </div>
      </div>

      {/* Admin Subtabs */}
      <div className="flex gap-2 border-b border-[var(--border-color)] pb-3">
        <button
          onClick={() => setActiveSubTab('health')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
            activeSubTab === 'health' ? 'bg-indigo-600 dark:bg-emerald-500 text-white shadow-xs' : 'text-[var(--text-muted)] hover:bg-[var(--bg-subtle)]'
          }`}
        >
          Health & Diagnostics
        </button>
        <button
          onClick={() => setActiveSubTab('users')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
            activeSubTab === 'users' ? 'bg-indigo-600 dark:bg-emerald-500 text-white shadow-xs' : 'text-[var(--text-muted)] hover:bg-[var(--bg-subtle)]'
          }`}
        >
          User Management ({users.length})
        </button>
        <button
          onClick={() => setActiveSubTab('logs')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
            activeSubTab === 'logs' ? 'bg-indigo-600 dark:bg-emerald-500 text-white shadow-xs' : 'text-[var(--text-muted)] hover:bg-[var(--bg-subtle)]'
          }`}
        >
          Audit & Security Logs
        </button>
        <button
          onClick={() => setActiveSubTab('data')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
            activeSubTab === 'data' ? 'bg-indigo-600 dark:bg-emerald-500 text-white shadow-xs' : 'text-[var(--text-muted)] hover:bg-[var(--bg-subtle)]'
          }`}
        >
          Import / Export Data
        </button>
      </div>

      {/* Subtab Contents */}
      {activeSubTab === 'health' && health && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-5 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)]">
            <p className="text-xs text-[var(--text-muted)] font-semibold uppercase">Server Uptime</p>
            <p className="text-2xl font-bold text-emerald-500 mt-2">{Math.floor(health.uptime / 60)} Minutes</p>
            <p className="text-[11px] text-[var(--text-muted)] mt-1">Status: Healthy (WAL Mode)</p>
          </div>
          <div className="p-5 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)]">
            <p className="text-xs text-[var(--text-muted)] font-semibold uppercase">Total Database Problems</p>
            <p className="text-2xl font-bold text-indigo-600 dark:text-emerald-400 mt-2">{health.dbStats?.problems}</p>
            <p className="text-[11px] text-[var(--text-muted)] mt-1">With full test case fixtures</p>
          </div>
          <div className="p-5 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)]">
            <p className="text-xs text-[var(--text-muted)] font-semibold uppercase">Submissions Evaluated</p>
            <p className="text-2xl font-bold text-amber-500 mt-2">{health.dbStats?.submissions}</p>
            <p className="text-[11px] text-[var(--text-muted)] mt-1">Sandboxed in Node.js VM queue</p>
          </div>
        </div>
      )}

      {activeSubTab === 'users' && (
        <div className="rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] overflow-hidden shadow-xs">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-[var(--bg-subtle)] border-b border-[var(--border-color)]">
              <tr>
                <th className="p-3">User</th>
                <th className="p-3">Email</th>
                <th className="p-3">Role</th>
                <th className="p-3">Registered</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-color)]">
              {users.map(u => (
                <tr key={u.id} className="hover:bg-[var(--bg-subtle)]">
                  <td className="p-3 font-semibold text-[var(--text-main)]">{u.username}</td>
                  <td className="p-3 text-[var(--text-muted)]">{u.email}</td>
                  <td className="p-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      u.role === 'admin' ? 'bg-amber-500/10 text-amber-500' : 'bg-gray-500/10 text-gray-400'
                    }`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="p-3 text-[var(--text-muted)] font-mono text-[11px]">
                    {new Date(u.created_at).toLocaleDateString()}
                  </td>
                  <td className="p-3 text-right">
                    <button
                      onClick={() => handleUpdateRole(u.id, u.role === 'admin' ? 'user' : 'admin')}
                      className="px-2.5 py-1 rounded border border-[var(--border-color)] hover:bg-[var(--bg-subtle)] text-[11px] font-medium"
                    >
                      Toggle {u.role === 'admin' ? 'User' : 'Admin'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeSubTab === 'logs' && (
        <div className="rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] overflow-hidden shadow-xs">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-[var(--bg-subtle)] border-b border-[var(--border-color)]">
              <tr>
                <th className="p-3">Event Type</th>
                <th className="p-3">User</th>
                <th className="p-3">IP Address</th>
                <th className="p-3">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-color)] font-mono text-[11px]">
              {logs.map(log => (
                <tr key={log.id} className="hover:bg-[var(--bg-subtle)]">
                  <td className="p-3 font-semibold text-indigo-600 dark:text-emerald-400">{log.event_type}</td>
                  <td className="p-3 text-[var(--text-main)] font-sans">{log.username || 'Anonymous'}</td>
                  <td className="p-3 text-[var(--text-muted)]">{log.ip_address}</td>
                  <td className="p-3 text-[var(--text-muted)]">{new Date(log.created_at).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeSubTab === 'data' && (
        <div className="p-6 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] space-y-4">
          <h3 className="text-base font-bold text-[var(--text-main)]">Problem Import & Export Tool</h3>
          <p className="text-xs text-[var(--text-muted)]">
            Export the complete set of problems, test fixtures, metadata, and editorial solutions as formatted JSON, or import updates.
          </p>
          <div className="flex gap-3 pt-2">
            <button
              onClick={handleExportProblems}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 dark:bg-emerald-500 dark:hover:bg-emerald-600 text-white text-xs font-semibold shadow-xs"
            >
              <FileDown size={14} /> Export Problems as JSON
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
