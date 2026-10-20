import React, { useState } from 'react';
import { 
  Sun, 
  Moon, 
  Command, 
  Bell, 
  User as UserIcon, 
  LogOut, 
  Settings, 
  Shield, 
  Sparkles 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface TopbarProps {
  onOpenCommandPalette: () => void;
  onOpenAuthModal: (mode: 'login' | 'signup') => void;
  onSelectTab: (tab: string) => void;
}

export const Topbar: React.FC<TopbarProps> = ({
  onOpenCommandPalette,
  onOpenAuthModal,
  onSelectTab
}) => {
  const { user, theme, toggleTheme, logout } = useAuth();
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  return (
    <header className="h-14 border-b border-[var(--border-color)] bg-[var(--bg-card)] flex items-center justify-between px-4 z-10 shrink-0">
      {/* Quick Search / Command Palette Trigger */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenCommandPalette}
          className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg border border-[var(--border-color)] bg-[var(--bg-subtle)] text-xs text-[var(--text-muted)] hover:border-indigo-500/50 dark:hover:border-emerald-500/50 hover:text-[var(--text-main)] transition-colors w-48 sm:w-64"
        >
          <Command size={14} />
          <span className="flex-1 text-left">Search problems, tabs...</span>
          <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] bg-[var(--bg-card)] border border-[var(--border-color)] rounded shadow-xs font-mono">
            Ctrl+K
          </kbd>
        </button>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2">
        {/* Theme Toggle (icon-only, no flash) */}
        <button
          onClick={toggleTheme}
          aria-label="Toggle color theme"
          title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          className="p-2 rounded-lg border border-[var(--border-color)] bg-[var(--bg-subtle)] text-[var(--text-main)] hover:border-indigo-500/50 dark:hover:border-emerald-500/50 transition-colors"
        >
          {theme === 'dark' ? <Sun size={17} className="text-amber-400" /> : <Moon size={17} className="text-indigo-600" />}
        </button>

        {/* Notifications */}
        <button
          onClick={() => alert('No new notifications')}
          aria-label="Notifications"
          className="p-2 rounded-lg border border-[var(--border-color)] bg-[var(--bg-subtle)] text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors"
        >
          <Bell size={17} />
        </button>

        {/* User Profile or Sign In */}
        {user ? (
          <div className="relative">
            <button
              onClick={() => setShowProfileMenu(prev => !prev)}
              className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg border border-[var(--border-color)] bg-[var(--bg-subtle)] hover:border-indigo-500/50 dark:hover:border-emerald-500/50 transition-colors"
            >
              <div className="w-6 h-6 rounded-full bg-indigo-600 dark:bg-emerald-500 flex items-center justify-center text-white text-xs font-bold uppercase">
                {user.username.charAt(0)}
              </div>
              <span className="text-xs font-medium text-[var(--text-main)] hidden sm:inline-block">
                {user.username}
              </span>
            </button>

            {showProfileMenu && (
              <div 
                className="absolute right-0 mt-2 w-48 rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] shadow-lg py-1 z-50 text-xs font-medium"
                onMouseLeave={() => setShowProfileMenu(false)}
              >
                <div className="px-3 py-2 border-b border-[var(--border-color)]">
                  <p className="font-semibold text-[var(--text-main)] truncate">{user.username}</p>
                  <p className="text-[var(--text-muted)] truncate">{user.email}</p>
                  {user.role === 'admin' && (
                    <span className="inline-block mt-1 px-1.5 py-0.5 rounded text-[10px] bg-amber-500/10 text-amber-500 font-semibold uppercase">
                      Admin
                    </span>
                  )}
                </div>
                <button
                  onClick={() => { setShowProfileMenu(false); onSelectTab('settings'); }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-left text-[var(--text-main)] hover:bg-[var(--bg-subtle)]"
                >
                  <Settings size={14} /> Account Settings
                </button>
                {user.role === 'admin' && (
                  <button
                    onClick={() => { setShowProfileMenu(false); onSelectTab('admin'); }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-left text-amber-500 hover:bg-[var(--bg-subtle)]"
                  >
                    <Shield size={14} /> Admin Dashboard
                  </button>
                )}
                <button
                  onClick={() => { setShowProfileMenu(false); logout(); }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-left text-rose-500 hover:bg-[var(--bg-subtle)] border-t border-[var(--border-color)]"
                >
                  <LogOut size={14} /> Log Out
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <button
              onClick={() => onOpenAuthModal('login')}
              className="px-3 py-1.5 text-xs font-medium text-[var(--text-main)] hover:text-indigo-600 dark:hover:text-emerald-400 transition-colors"
            >
              Log In
            </button>
            <button
              onClick={() => onOpenAuthModal('signup')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 dark:bg-emerald-500 dark:hover:bg-emerald-600 text-white text-xs font-semibold shadow-xs transition-colors"
            >
              <Sparkles size={13} />
              Sign Up
            </button>
          </div>
        )}
      </div>
    </header>
  );
};
