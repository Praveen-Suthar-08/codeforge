import React, { useEffect, useState } from 'react';
import { 
  Trophy, 
  Flame, 
  CheckCircle2, 
  Calendar, 
  Award, 
  Sparkles, 
  PieChart as PieIcon, 
  TrendingUp,
  Code
} from 'lucide-react';
import { apiRequest } from '../services/api';
import { useAuth } from '../context/AuthContext';

export const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await apiRequest('/community/stats');
        setStats(data);
      } catch (e) {
        console.error('Failed to load stats:', e);
      } finally {
        setLoading(false);
      }
    };
    if (user) {
      fetchStats();
    } else {
      setLoading(false);
    }
  }, [user]);

  if (!user) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
        <Sparkles size={40} className="text-indigo-600 dark:text-emerald-400 mb-3" />
        <h2 className="text-lg font-bold text-[var(--text-main)]">Sign in to view your personalized Dashboard</h2>
        <p className="text-xs text-[var(--text-muted)] max-w-sm mt-1">
          Track problem-solving streaks, submission heatmaps, difficulty distribution charts, and unlock badges.
        </p>
      </div>
    );
  }

  if (loading || !stats) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-indigo-600 dark:border-emerald-400 border-t-transparent" />
      </div>
    );
  }

  // Generate 20-week heatmap cells (140 days)
  const heatmapDays = [];
  for (let i = -139; i <= 0; i++) {
    const count = stats.dayCounts?.[i] || 0;
    heatmapDays.push({ dayOffset: i, count });
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-6 max-w-7xl mx-auto w-full select-none space-y-6">
      {/* Top Profile & Rating Overview */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] shadow-xs">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 to-cyan-500 dark:from-emerald-600 dark:to-teal-400 flex items-center justify-center text-white font-bold text-xl shadow-md">
            {user.username.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold text-[var(--text-main)]">{user.username}</h1>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-500/10 text-indigo-600 dark:text-emerald-400 border border-indigo-500/20 font-mono">
                Level {stats.level} (XP {stats.xp})
              </span>
            </div>
            <p className="text-xs text-[var(--text-muted)] mt-0.5">
              Member since {new Date(user.createdAt || Date.now()).toLocaleDateString()} · {stats.totalSolved} solved
            </p>
          </div>
        </div>

        <div className="flex items-center gap-6 border-t sm:border-t-0 sm:border-l border-[var(--border-color)] pt-3 sm:pt-0 sm:pl-6">
          <div className="text-center">
            <p className="text-[11px] text-[var(--text-muted)] uppercase tracking-wider font-semibold">Streak</p>
            <p className="text-xl font-bold text-amber-500 flex items-center justify-center gap-1">
              <Flame size={18} /> {stats.currentStreak} Days
            </p>
          </div>
          <div className="text-center">
            <p className="text-[11px] text-[var(--text-muted)] uppercase tracking-wider font-semibold">Score</p>
            <p className="text-xl font-bold text-indigo-600 dark:text-emerald-400">
              {stats.totalScore} pts
            </p>
          </div>
          <div className="text-center">
            <p className="text-[11px] text-[var(--text-muted)] uppercase tracking-wider font-semibold">Submissions</p>
            <p className="text-xl font-bold text-[var(--text-main)]">
              {stats.totalSubmissions}
            </p>
          </div>
        </div>
      </div>

      {/* Grid: Difficulty Split & Language Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Difficulty Split */}
        <div className="p-5 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] shadow-xs space-y-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] flex items-center gap-2">
            <PieIcon size={15} /> Problems Solved by Difficulty
          </h2>

          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-emerald-500">Easy ({stats.difficultySplit.Easy})</span>
                <span className="text-[var(--text-muted)]">{Math.round((stats.difficultySplit.Easy / (stats.totalSolved || 1)) * 100)}%</span>
              </div>
              <div className="h-2 w-full rounded-full bg-[var(--bg-subtle)] overflow-hidden">
                <div
                  className="h-full bg-emerald-500 rounded-full"
                  style={{ width: `${(stats.difficultySplit.Easy / (stats.totalSolved || 1)) * 100}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-amber-500">Medium ({stats.difficultySplit.Medium})</span>
                <span className="text-[var(--text-muted)]">{Math.round((stats.difficultySplit.Medium / (stats.totalSolved || 1)) * 100)}%</span>
              </div>
              <div className="h-2 w-full rounded-full bg-[var(--bg-subtle)] overflow-hidden">
                <div
                  className="h-full bg-amber-500 rounded-full"
                  style={{ width: `${(stats.difficultySplit.Medium / (stats.totalSolved || 1)) * 100}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-rose-500">Hard ({stats.difficultySplit.Hard})</span>
                <span className="text-[var(--text-muted)]">{Math.round((stats.difficultySplit.Hard / (stats.totalSolved || 1)) * 100)}%</span>
              </div>
              <div className="h-2 w-full rounded-full bg-[var(--bg-subtle)] overflow-hidden">
                <div
                  className="h-full bg-rose-500 rounded-full"
                  style={{ width: `${(stats.difficultySplit.Hard / (stats.totalSolved || 1)) * 100}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Language Breakdown */}
        <div className="p-5 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] shadow-xs space-y-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] flex items-center gap-2">
            <Code size={15} /> Language Usage
          </h2>
          <div className="space-y-2">
            {Object.keys(stats.languageUsage).length === 0 ? (
              <p className="text-xs text-[var(--text-muted)] italic">No language data yet.</p>
            ) : (
              Object.entries(stats.languageUsage).map(([lang, count]: any) => (
                <div key={lang} className="flex items-center justify-between p-2 rounded-lg bg-[var(--bg-subtle)] text-xs font-mono">
                  <span className="font-semibold text-[var(--text-main)] capitalize">{lang}</span>
                  <span className="text-[var(--text-muted)]">{count} submissions</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Activity Heatmap (20 Weeks) */}
      <div className="p-5 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] shadow-xs space-y-3">
        <h2 className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] flex items-center gap-2">
          <Calendar size={15} /> Submission Activity (Last 20 Weeks)
        </h2>
        <div className="grid grid-cols-28 gap-1.5 pt-2 overflow-x-auto">
          {heatmapDays.map(item => (
            <div
              key={item.dayOffset}
              title={`${item.count} submissions`}
              className={`aspect-square rounded-xs border transition-colors ${
                item.count === 0
                  ? 'bg-[var(--bg-subtle)] border-[var(--border-color)]'
                  : item.count === 1
                  ? 'bg-emerald-300 dark:bg-emerald-800 border-emerald-400'
                  : item.count <= 3
                  ? 'bg-emerald-500 border-emerald-600'
                  : 'bg-emerald-600 dark:bg-emerald-400 border-emerald-500'
              }`}
            />
          ))}
        </div>
        <div className="flex items-center justify-end gap-2 text-[10px] text-[var(--text-muted)] pt-1">
          <span>Less</span>
          <div className="w-2.5 h-2.5 rounded-xs bg-[var(--bg-subtle)] border border-[var(--border-color)]" />
          <div className="w-2.5 h-2.5 rounded-xs bg-emerald-400" />
          <div className="w-2.5 h-2.5 rounded-xs bg-emerald-600" />
          <span>More</span>
        </div>
      </div>

      {/* Badges and Achievements */}
      <div className="p-5 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] shadow-xs space-y-3">
        <h2 className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] flex items-center gap-2">
          <Award size={15} /> Badges & Achievements
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {stats.badges?.map((badge: any) => (
            <div key={badge.id} className="p-3 rounded-xl border border-[var(--border-color)] bg-[var(--bg-subtle)] flex items-center gap-3">
              <span className="text-2xl">{badge.icon}</span>
              <div>
                <p className="font-bold text-xs text-[var(--text-main)]">{badge.name}</p>
                <p className="text-[10px] text-[var(--text-muted)]">{badge.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
