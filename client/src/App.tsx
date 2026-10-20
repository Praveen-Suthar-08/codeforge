import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Sidebar } from './components/Sidebar';
import { Topbar } from './components/Topbar';
import { AuthModal } from './components/AuthModal';
import { CommandPalette } from './components/CommandPalette';
import { ProblemsView } from './pages/ProblemsView';
import { Workspace } from './pages/Workspace';
import { Playground } from './pages/Playground';
import { Dashboard } from './pages/Dashboard';
import { LeaderboardView } from './pages/LeaderboardView';
import { ContestsView } from './pages/ContestsView';
import { ProjectsView } from './pages/ProjectsView';
import { RoadmapsView } from './pages/RoadmapsView';
import { AdminPanel } from './pages/AdminPanel';
import { AccountSettings } from './pages/AccountSettings';
import { LandingPage } from './pages/LandingPage';

function AppContent() {
  const { user } = useAuth();
  const [currentTab, setCurrentTab] = useState<string>('problems');
  const [activeProblemSlug, setActiveProblemSlug] = useState<string | null>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(false);
  const [authModalOpen, setAuthModalOpen] = useState<boolean>(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'signup' | 'forgot'>('login');
  const [commandPaletteOpen, setCommandPaletteOpen] = useState<boolean>(false);

  const handleOpenAuth = (mode: 'login' | 'signup') => {
    setAuthModalMode(mode);
    setAuthModalOpen(true);
  };

  const handleSelectProblem = (slug: string) => {
    setActiveProblemSlug(slug);
    setCurrentTab('workspace');
  };

  const handleBackToProblems = () => {
    setActiveProblemSlug(null);
    setCurrentTab('problems');
  };

  const handleCommandAction = (actionId: string) => {
    if (actionId === 'open_palette') {
      setCommandPaletteOpen(true);
      return;
    }
    if (actionId.startsWith('problem:')) {
      const slug = actionId.replace('problem:', '');
      handleSelectProblem(slug);
      return;
    }
    if (actionId.startsWith('tab:')) {
      const targetTab = actionId.replace('tab:', '');
      setActiveProblemSlug(null);
      setCurrentTab(targetTab);
    } else if (actionId === 'action:random') {
      handleSelectProblem('two-sum');
    }
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[var(--bg-main)] text-[var(--text-main)]">
      {/* Collapsible Slim Sidebar */}
      <Sidebar
        currentTab={currentTab}
        onSelectTab={(tab) => {
          if (!user && ['leaderboard', 'contests', 'projects', 'roadmaps'].includes(tab)) {
            handleOpenAuth('login');
            return;
          }
          setActiveProblemSlug(null);
          setCurrentTab(tab);
        }}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        isAdmin={user?.role === 'admin'}
      />

      {/* Main Full-Size Shell */}
      <div className="flex-1 flex flex-col h-full overflow-hidden min-w-0">
        {/* Full-width Topbar */}
        <Topbar
          onOpenCommandPalette={() => setCommandPaletteOpen(true)}
          onOpenAuthModal={handleOpenAuth}
          onSelectTab={(tab) => {
            if (!user && ['leaderboard', 'contests', 'projects', 'roadmaps'].includes(tab)) {
              handleOpenAuth('login');
              return;
            }
            setActiveProblemSlug(null);
            setCurrentTab(tab);
          }}
        />

        {/* View Router */}
        <main className="flex-1 flex flex-col overflow-hidden relative">
          {currentTab === 'landing' && (
            <LandingPage
              onStart={() => handleOpenAuth('signup')}
              onExploreProblems={() => setCurrentTab('problems')}
            />
          )}

          {currentTab === 'problems' && (
            <ProblemsView onSelectProblem={handleSelectProblem} />
          )}

          {currentTab === 'workspace' && activeProblemSlug && (
            <Workspace slug={activeProblemSlug} onBack={handleBackToProblems} />
          )}

          {currentTab === 'compiler' && <Playground />}

          {currentTab === 'dashboard' && <Dashboard />}

          {currentTab === 'leaderboard' && (
            user ? (
              <LeaderboardView />
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center p-6 text-center select-none space-y-4">
                <div className="w-16 h-16 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center text-3xl shadow-lg border border-amber-500/20 animate-bounce">
                  🏆
                </div>
                <div className="space-y-1.5 max-w-md">
                  <h2 className="text-xl font-bold text-[var(--text-main)]">Global Leaderboard is Protected</h2>
                  <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                    Sign in to track live player ratings, global ranking tiers, solve milestones, and compare against competitive coders worldwide.
                  </p>
                </div>
                <div className="flex items-center gap-3 pt-2">
                  <button
                    onClick={() => handleOpenAuth('login')}
                    className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 dark:bg-emerald-500 dark:hover:bg-emerald-600 text-white text-xs font-semibold shadow-md transition-all cursor-pointer"
                  >
                    Log In to View Standings
                  </button>
                  <button
                    onClick={() => handleOpenAuth('signup')}
                    className="px-5 py-2.5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] hover:bg-[var(--bg-subtle)] text-xs font-semibold text-[var(--text-main)] transition-all cursor-pointer"
                  >
                    Create Account
                  </button>
                </div>
              </div>
            )
          )}

          {currentTab === 'contests' && (
            user ? (
              <ContestsView 
                onSelectProblem={handleSelectProblem} 
                onViewLeaderboard={() => setCurrentTab('leaderboard')} 
              />
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center p-6 text-center select-none space-y-4">
                <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-emerald-400 flex items-center justify-center text-3xl shadow-lg border border-indigo-500/20">
                  ⚔️
                </div>
                <div className="space-y-1.5 max-w-md">
                  <h2 className="text-xl font-bold text-[var(--text-main)]">Competitive Contests Require Login</h2>
                  <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                    Participate in timed weekly algorithmic battles, submit solutions under tournament conditions, and earn rating points on the leaderboard.
                  </p>
                </div>
                <div className="flex items-center gap-3 pt-2">
                  <button
                    onClick={() => handleOpenAuth('login')}
                    className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 dark:bg-emerald-500 dark:hover:bg-emerald-600 text-white text-xs font-semibold shadow-md transition-all cursor-pointer"
                  >
                    Log In to Enter Contests
                  </button>
                  <button
                    onClick={() => handleOpenAuth('signup')}
                    className="px-5 py-2.5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] hover:bg-[var(--bg-subtle)] text-xs font-semibold text-[var(--text-main)] transition-all cursor-pointer"
                  >
                    Create Account
                  </button>
                </div>
              </div>
            )
          )}

          {currentTab === 'projects' && (
            user ? (
              <ProjectsView />
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center p-6 text-center select-none space-y-4">
                <div className="w-16 h-16 rounded-2xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center text-3xl shadow-lg border border-purple-500/20">
                  🛠️
                </div>
                <div className="space-y-1.5 max-w-md">
                  <h2 className="text-xl font-bold text-[var(--text-main)]">Mini-Projects Engine is Member-Only</h2>
                  <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                    Build real-world systems like Git from scratch, Redis in-memory caches, and JSON parsers with interactive test validation.
                  </p>
                </div>
                <div className="flex items-center gap-3 pt-2">
                  <button
                    onClick={() => handleOpenAuth('login')}
                    className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 dark:bg-emerald-500 dark:hover:bg-emerald-600 text-white text-xs font-semibold shadow-md transition-all cursor-pointer"
                  >
                    Log In to Build Projects
                  </button>
                  <button
                    onClick={() => handleOpenAuth('signup')}
                    className="px-5 py-2.5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] hover:bg-[var(--bg-subtle)] text-xs font-semibold text-[var(--text-main)] transition-all cursor-pointer"
                  >
                    Create Account
                  </button>
                </div>
              </div>
            )
          )}

          {currentTab === 'roadmaps' && (
            user ? (
              <RoadmapsView onSelectProblem={handleSelectProblem} />
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center p-6 text-center select-none space-y-4">
                <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center text-3xl shadow-lg border border-emerald-500/20">
                  🗺️
                </div>
                <div className="space-y-1.5 max-w-md">
                  <h2 className="text-xl font-bold text-[var(--text-main)]">Curated Roadmaps & Study Plans</h2>
                  <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                    Track your learning path from Two Pointers to Dynamic Programming & Graph Theory with persistent progress sync.
                  </p>
                </div>
                <div className="flex items-center gap-3 pt-2">
                  <button
                    onClick={() => handleOpenAuth('login')}
                    className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 dark:bg-emerald-500 dark:hover:bg-emerald-600 text-white text-xs font-semibold shadow-md transition-all cursor-pointer"
                  >
                    Log In to View Roadmaps
                  </button>
                  <button
                    onClick={() => handleOpenAuth('signup')}
                    className="px-5 py-2.5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] hover:bg-[var(--bg-subtle)] text-xs font-semibold text-[var(--text-main)] transition-all cursor-pointer"
                  >
                    Create Account
                  </button>
                </div>
              </div>
            )
          )}

          {currentTab === 'admin' && <AdminPanel />}

          {currentTab === 'settings' && <AccountSettings />}
        </main>
      </div>

      {/* Auth Modal */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        initialMode={authModalMode}
      />

      {/* Command Palette (Ctrl+K) */}
      <CommandPalette
        isOpen={commandPaletteOpen}
        onClose={() => setCommandPaletteOpen(false)}
        onSelectAction={handleCommandAction}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
