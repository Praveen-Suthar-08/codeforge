import React, { useEffect, useState } from 'react';
import { 
  Shield, 
  Smartphone, 
  Key, 
  Trash2, 
  Download, 
  LogOut, 
  CheckCircle2, 
  AlertCircle 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { apiRequest } from '../services/api';

export const AccountSettings: React.FC = () => {
  const { user, logout } = useAuth();
  const [sessions, setSessions] = useState<any[]>([]);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [totpSecret, setTotpSecret] = useState<string | null>(null);
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [verificationCode, setVerificationCode] = useState('');
  const [twoFactorActive, setTwoFactorActive] = useState(Boolean(user?.twoFactorEnabled));
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        const data = await apiRequest('/auth/sessions');
        setSessions(data.sessions || []);
      } catch (e) {}
    };
    fetchSessions();
  }, []);

  const handleStart2FA = async () => {
    try {
      const data = await apiRequest('/auth/2fa/setup', { method: 'POST' });
      setQrCode(data.qrCode);
      setTotpSecret(data.secret);
      setBackupCodes(data.backupCodes || []);
    } catch (e: any) {
      setError(e.message);
    }
  };

  const handleVerify2FA = async () => {
    try {
      await apiRequest('/auth/2fa/verify', {
        method: 'POST',
        body: JSON.stringify({ code: verificationCode })
      });
      setTwoFactorActive(true);
      setQrCode(null);
      setSuccess('Two-factor authentication successfully enabled!');
    } catch (e: any) {
      setError(e.message);
    }
  };

  const handleDownloadData = async () => {
    try {
      const data = await apiRequest('/auth/export-data');
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `codeforge-user-data-${user?.username}.json`;
      a.click();
    } catch (e: any) {
      setError(e.message);
    }
  };

  const handleLogoutAll = async () => {
    if (confirm('Log out of all active sessions and devices?')) {
      await apiRequest('/auth/sessions/logout-all', { method: 'POST' });
      logout();
    }
  };

  const handleDeleteAccount = async () => {
    if (confirm('Are you absolutely sure you want to delete your account? This action is irreversible.')) {
      await apiRequest('/auth/account', { method: 'DELETE' });
      logout();
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-6 max-w-4xl mx-auto w-full select-none space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[var(--text-main)]">Account & Security Settings</h1>
        <p className="text-xs text-[var(--text-muted)] mt-1">
          Manage your credentials, TOTP two-factor authentication, active login sessions, and privacy data.
        </p>
      </div>

      {success && (
        <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-xs font-medium">
          {success}
        </div>
      )}
      {error && (
        <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs font-medium">
          {error}
        </div>
      )}

      {/* Two-Factor Authentication Card */}
      <div className="p-6 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Shield size={20} className="text-indigo-600 dark:text-emerald-400" />
            <div>
              <h2 className="text-sm font-bold text-[var(--text-main)]">Two-Factor Authentication (TOTP)</h2>
              <p className="text-xs text-[var(--text-muted)]">Secure your account with Google Authenticator or 1Password.</p>
            </div>
          </div>
          <span
            className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase ${
              twoFactorActive ? 'bg-emerald-500/10 text-emerald-500' : 'bg-gray-500/10 text-gray-400'
            }`}
          >
            {twoFactorActive ? 'Enabled' : 'Disabled'}
          </span>
        </div>

        {!twoFactorActive && !qrCode && (
          <button
            onClick={handleStart2FA}
            className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 dark:bg-emerald-500 dark:hover:bg-emerald-600 text-white text-xs font-semibold shadow-xs"
          >
            Setup Two-Factor Authenticator
          </button>
        )}

        {qrCode && (
          <div className="p-4 rounded-xl border border-[var(--border-color)] bg-[var(--bg-subtle)] space-y-3">
            <p className="text-xs font-semibold text-[var(--text-main)]">1. Scan QR Code in Authenticator App:</p>
            <img src={qrCode} alt="2FA QR Code" className="w-40 h-40 rounded-lg border border-[var(--border-color)]" />
            <p className="text-[11px] font-mono text-[var(--text-muted)]">Secret Key: {totpSecret}</p>

            {backupCodes.length > 0 && (
              <div className="pt-2">
                <p className="text-xs font-semibold text-[var(--text-main)] mb-1">Save these emergency backup codes:</p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 font-mono text-[11px] text-[var(--text-muted)]">
                  {backupCodes.map((code, idx) => (
                    <span key={idx} className="p-1 rounded bg-[var(--bg-card)] border border-[var(--border-color)] text-center">
                      {code}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="flex gap-2 pt-2">
              <input
                type="text"
                placeholder="6-digit code"
                value={verificationCode}
                onChange={e => setVerificationCode(e.target.value)}
                className="px-3 py-1.5 rounded-lg border border-[var(--border-color)] bg-[var(--bg-card)] text-xs text-[var(--text-main)] font-mono"
              />
              <button
                onClick={handleVerify2FA}
                className="px-3 py-1.5 rounded-lg bg-emerald-500 text-white text-xs font-semibold"
              >
                Verify & Enable
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Active Sessions */}
      <div className="p-6 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Smartphone size={20} className="text-indigo-600 dark:text-emerald-400" />
            <div>
              <h2 className="text-sm font-bold text-[var(--text-main)]">Active Login Sessions</h2>
              <p className="text-xs text-[var(--text-muted)]">Devices currently authenticated with rotating refresh tokens.</p>
            </div>
          </div>
          <button
            onClick={handleLogoutAll}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-rose-500/20 text-rose-500 hover:bg-rose-500/10 text-xs font-semibold"
          >
            <LogOut size={13} /> Log out all devices
          </button>
        </div>

        <div className="divide-y divide-[var(--border-color)]">
          {sessions.map(s => (
            <div key={s.id} className="py-2.5 flex items-center justify-between text-xs">
              <div>
                <p className="font-semibold text-[var(--text-main)]">{s.user_agent || 'Web Browser'}</p>
                <p className="text-[11px] text-[var(--text-muted)] font-mono">IP: {s.ip_address || '127.0.0.1'}</p>
              </div>
              <span className="text-[11px] text-[var(--text-muted)]">
                Logged in {new Date(s.created_at).toLocaleDateString()}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Data Export & Danger Zone */}
      <div className="p-6 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-[var(--text-main)]">Download Your Data (GDPR Compliant)</h2>
            <p className="text-xs text-[var(--text-muted)]">Export your complete profile, code submissions, drafts, and audit log history in JSON.</p>
          </div>
          <button
            onClick={handleDownloadData}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[var(--border-color)] bg-[var(--bg-subtle)] text-xs font-semibold text-[var(--text-main)] hover:bg-[var(--bg-card)]"
          >
            <Download size={13} /> Download JSON
          </button>
        </div>

        <div className="pt-4 border-t border-[var(--border-color)] flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-rose-500">Delete Account</h2>
            <p className="text-xs text-[var(--text-muted)]">Permanently erase your account, rating history, and all stored submissions.</p>
          </div>
          <button
            onClick={handleDeleteAccount}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-500 hover:bg-rose-600 text-white text-xs font-semibold shadow-xs"
          >
            <Trash2 size={13} /> Delete Account
          </button>
        </div>
      </div>
    </div>
  );
};
