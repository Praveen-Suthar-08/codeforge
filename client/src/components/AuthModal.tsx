import React, { useState } from 'react';
import { X, Lock, Mail, User, ShieldCheck, Eye, EyeOff } from 'lucide-react';
import { apiRequest } from '../services/api';
import { useAuth } from '../context/AuthContext';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'signup' | 'forgot';
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  initialMode = 'login'
}) => {
  const { loginSuccess } = useAuth();
  const [mode, setMode] = useState<'login' | 'signup' | 'forgot'>(initialMode);

  React.useEffect(() => {
    setMode(initialMode);
  }, [initialMode]);
  const [identifier, setIdentifier] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [twoFactorCode, setTwoFactorCode] = useState('');
  const [require2FA, setRequire2FA] = useState(false);
  const [terms, setTerms] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  // Password strength check
  const hasMinLen = password.length >= 8;
  const hasUpper = /[A-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[^a-zA-Z0-9]/.test(password);
  const strengthScore = [hasMinLen, hasUpper, hasNumber, hasSpecial].filter(Boolean).length;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    setLoading(true);

    try {
      if (mode === 'login') {
        const res = await apiRequest<{ user?: any; require2FA?: boolean }>('/auth/login', {
          method: 'POST',
          body: JSON.stringify({ identifier, password, twoFactorCode: twoFactorCode || undefined })
        });

        if (res.require2FA) {
          setRequire2FA(true);
          setLoading(false);
          return;
        }

        if (res.user) {
          loginSuccess(res.user);
          onClose();
        }
      } else if (mode === 'signup') {
        if (password !== confirmPassword) {
          setError('Passwords do not match');
          setLoading(false);
          return;
        }
        if (!terms) {
          setError('Please accept terms and conditions');
          setLoading(false);
          return;
        }

        const res = await apiRequest<{ user: any }>('/auth/signup', {
          method: 'POST',
          body: JSON.stringify({ username, email, password, terms: true })
        });

        loginSuccess(res.user);
        onClose();
      } else if (mode === 'forgot') {
        const res = await apiRequest<{ message: string }>('/auth/forgot-password', {
          method: 'POST',
          body: JSON.stringify({ email })
        });
        setSuccessMsg(res.message);
      }
    } catch (err: any) {
      setError(err.message || 'Operation failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
      <div className="relative w-full max-w-md rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] shadow-2xl p-6 sm:p-8">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-[var(--text-muted)] hover:text-[var(--text-main)] p-1 rounded-lg"
          aria-label="Close modal"
        >
          <X size={18} />
        </button>

        <div className="mb-6">
          <h2 className="text-xl font-bold text-[var(--text-main)]">
            {mode === 'login' ? 'Welcome Back' : mode === 'signup' ? 'Create Account' : 'Reset Password'}
          </h2>
          <p className="text-xs text-[var(--text-muted)] mt-1">
            {mode === 'login'
              ? 'Sign in to access your saved drafts, submissions and rating'
              : mode === 'signup'
              ? 'Join CodeForge to master algorithms and compete globally'
              : 'Enter your registered email to receive a password reset token'}
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs font-medium">
            {error}
          </div>
        )}

        {successMsg && (
          <div className="mb-4 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-xs font-medium">
            {successMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {mode === 'signup' && (
            <div>
              <label className="block text-[var(--text-muted)] font-medium mb-1">Username</label>
              <div className="relative">
                <User size={15} className="absolute left-3 top-3 text-[var(--text-muted)]" />
                <input
                  type="text"
                  required
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  placeholder="johndoe"
                  className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-[var(--border-color)] bg-[var(--bg-subtle)] text-[var(--text-main)] focus:outline-hidden focus:border-indigo-500 dark:focus:border-emerald-500"
                />
              </div>
            </div>
          )}

          {(mode === 'signup' || mode === 'forgot') && (
            <div>
              <label className="block text-[var(--text-muted)] font-medium mb-1">Email Address</label>
              <div className="relative">
                <Mail size={15} className="absolute left-3 top-3 text-[var(--text-muted)]" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="you@domain.com"
                  className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-[var(--border-color)] bg-[var(--bg-subtle)] text-[var(--text-main)] focus:outline-hidden focus:border-indigo-500 dark:focus:border-emerald-500"
                />
              </div>
            </div>
          )}

          {mode === 'login' && !require2FA && (
            <div>
              <label className="block text-[var(--text-muted)] font-medium mb-1">Username or Email</label>
              <div className="relative">
                <User size={15} className="absolute left-3 top-3 text-[var(--text-muted)]" />
                <input
                  type="text"
                  required
                  value={identifier}
                  onChange={e => setIdentifier(e.target.value)}
                  placeholder="admin or user@domain.com"
                  className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-[var(--border-color)] bg-[var(--bg-subtle)] text-[var(--text-main)] focus:outline-hidden focus:border-indigo-500 dark:focus:border-emerald-500"
                />
              </div>
            </div>
          )}

          {mode !== 'forgot' && !require2FA && (
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[var(--text-muted)] font-medium">Password</label>
                {mode === 'login' && (
                  <button
                    type="button"
                    onClick={() => setMode('forgot')}
                    className="text-indigo-600 dark:text-emerald-400 hover:underline"
                  >
                    Forgot password?
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock size={15} className="absolute left-3 top-3 text-[var(--text-muted)]" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-10 py-2.5 rounded-lg border border-[var(--border-color)] bg-[var(--bg-subtle)] text-[var(--text-main)] focus:outline-hidden focus:border-indigo-500 dark:focus:border-emerald-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(prev => !prev)}
                  className="absolute right-3 top-3 text-[var(--text-muted)] hover:text-[var(--text-main)]"
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>

              {/* Password Strength Meter for Signup */}
              {mode === 'signup' && (
                <div className="mt-2 space-y-1.5">
                  <div className="flex gap-1 h-1">
                    {[1, 2, 3, 4].map(step => (
                      <div
                        key={step}
                        className={`flex-1 rounded-full transition-all ${
                          strengthScore >= step
                            ? strengthScore <= 2
                              ? 'bg-amber-500'
                              : 'bg-emerald-500'
                            : 'bg-gray-200 dark:bg-gray-700'
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-[10px] text-[var(--text-muted)]">
                    Requires 8+ chars, uppercase, number, & symbol
                  </p>
                </div>
              )}
            </div>
          )}

          {mode === 'signup' && (
            <div>
              <label className="block text-[var(--text-muted)] font-medium mb-1">Confirm Password</label>
              <div className="relative">
                <Lock size={15} className="absolute left-3 top-3 text-[var(--text-muted)]" />
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-[var(--border-color)] bg-[var(--bg-subtle)] text-[var(--text-main)] focus:outline-hidden focus:border-indigo-500 dark:focus:border-emerald-500"
                />
              </div>
            </div>
          )}

          {/* 2FA Challenge */}
          {require2FA && (
            <div>
              <label className="block text-[var(--text-muted)] font-medium mb-1">Two-Factor Code (TOTP)</label>
              <div className="relative">
                <ShieldCheck size={15} className="absolute left-3 top-3 text-[var(--text-muted)]" />
                <input
                  type="text"
                  required
                  maxLength={8}
                  value={twoFactorCode}
                  onChange={e => setTwoFactorCode(e.target.value)}
                  placeholder="6-digit authenticator or backup code"
                  className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-[var(--border-color)] bg-[var(--bg-subtle)] text-[var(--text-main)] font-mono text-center tracking-widest focus:outline-hidden focus:border-indigo-500"
                />
              </div>
            </div>
          )}

          {mode === 'signup' && (
            <label className="flex items-center gap-2 text-[var(--text-muted)] cursor-pointer pt-1">
              <input
                type="checkbox"
                required
                checked={terms}
                onChange={e => setTerms(e.target.checked)}
                className="rounded border-[var(--border-color)]"
              />
              <span>I agree to the Terms of Service & Privacy Policy</span>
            </label>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 px-4 rounded-lg bg-indigo-600 hover:bg-indigo-700 dark:bg-emerald-500 dark:hover:bg-emerald-600 text-white font-semibold text-xs tracking-wide transition-colors disabled:opacity-50 mt-2 cursor-pointer shadow-sm"
          >
            {loading ? 'Please wait...' : mode === 'login' ? 'Sign In' : mode === 'signup' ? 'Create Account' : 'Send Reset Link'}
          </button>
        </form>

        <div className="mt-5 pt-4 border-t border-[var(--border-color)] text-center text-xs text-[var(--text-muted)]">
          {mode === 'login' ? (
            <p>
              Don't have an account?{' '}
              <button
                onClick={() => { setMode('signup'); setError(null); }}
                className="text-indigo-600 dark:text-emerald-400 font-semibold hover:underline"
              >
                Sign up
              </button>
            </p>
          ) : (
            <p>
              Already have an account?{' '}
              <button
                onClick={() => { setMode('login'); setError(null); }}
                className="text-indigo-600 dark:text-emerald-400 font-semibold hover:underline"
              >
                Log in
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
