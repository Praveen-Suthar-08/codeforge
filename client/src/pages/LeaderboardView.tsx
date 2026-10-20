import React, { useEffect, useState } from 'react';
import { Trophy, Medal, Flame, Search } from 'lucide-react';
import { LeaderboardEntry } from '../types';
import { apiRequest } from '../services/api';
import { useAuth } from '../context/AuthContext';

export const LeaderboardView: React.FC = () => {
  const { user } = useAuth();
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const data = await apiRequest<{ leaderboard: LeaderboardEntry[] }>('/community/leaderboard');
        setEntries(data.leaderboard || []);
      } catch (err) {
        console.error('Failed to load leaderboard:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchLeaderboard();
  }, []);

  const filtered = entries.filter(e =>
    e.username.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden p-4 sm:p-6 max-w-5xl mx-auto w-full select-none">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-main)] flex items-center gap-2">
            <Trophy size={24} className="text-amber-500" /> Global Leaderboard
          </h1>
          <p className="text-xs text-[var(--text-muted)] mt-1">
            Real-time rankings based on algorithmic points earned, verified solutions, and contest performance.
          </p>
        </div>

        <div className="relative w-full sm:w-64">
          <Search size={14} className="absolute left-3 top-3 text-[var(--text-muted)]" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search competitor..."
            className="w-full pl-9 pr-3 py-2 rounded-lg border border-[var(--border-color)] bg-[var(--bg-card)] text-xs text-[var(--text-main)] focus:outline-hidden"
          />
        </div>
      </div>

      {/* Top 3 Podium Highlights */}
      {entries.length >= 3 && !search && (
        <div className="grid grid-cols-3 gap-3 mb-6 shrink-0">
          {/* #2 Silver */}
          <div className="p-4 rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] text-center flex flex-col items-center justify-center">
            <span className="text-2xl mb-1">🥈</span>
            <p className="font-bold text-xs text-[var(--text-main)]">{entries[1].username}</p>
            <p className="text-[11px] font-mono text-indigo-600 dark:text-emerald-400 font-semibold">{entries[1].score} pts</p>
            <p className="text-[10px] text-[var(--text-muted)] mt-1">{entries[1].solvedCount} solved</p>
          </div>

          {/* #1 Gold */}
          <div className="p-4 rounded-xl border-2 border-amber-500/50 bg-gradient-to-b from-amber-500/10 to-transparent text-center flex flex-col items-center justify-center shadow-sm">
            <span className="text-3xl mb-1">👑</span>
            <p className="font-bold text-sm text-[var(--text-main)]">{entries[0].username}</p>
            <p className="text-xs font-mono text-amber-500 font-bold">{entries[0].score} pts</p>
            <p className="text-[10px] text-[var(--text-muted)] mt-1">{entries[0].solvedCount} solved</p>
          </div>

          {/* #3 Bronze */}
          <div className="p-4 rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] text-center flex flex-col items-center justify-center">
            <span className="text-2xl mb-1">🥉</span>
            <p className="font-bold text-xs text-[var(--text-main)]">{entries[2].username}</p>
            <p className="text-[11px] font-mono text-indigo-600 dark:text-emerald-400 font-semibold">{entries[2].score} pts</p>
            <p className="text-[10px] text-[var(--text-muted)] mt-1">{entries[2].solvedCount} solved</p>
          </div>
        </div>
      )}

      {/* Leaderboard Table */}
      <div className="flex-1 rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] overflow-hidden flex flex-col shadow-xs">
        <div className="overflow-x-auto flex-1">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-[var(--bg-subtle)] border-b border-[var(--border-color)] sticky top-0 z-10">
              <tr>
                <th className="py-3 px-4 font-semibold text-[var(--text-muted)] w-16 text-center">Rank</th>
                <th className="py-3 px-4 font-semibold text-[var(--text-muted)]">User</th>
                <th className="py-3 px-4 font-semibold text-[var(--text-muted)] text-center">Solved</th>
                <th className="py-3 px-4 font-semibold text-[var(--text-muted)] text-center">Submissions</th>
                <th className="py-3 px-4 font-semibold text-[var(--text-muted)] text-right">Points</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-color)]">
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-[var(--text-muted)]">
                    Loading leaderboard rankings...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-[var(--text-muted)]">
                    No users found matching query.
                  </td>
                </tr>
              ) : (
                filtered.map(entry => {
                  const isCurrent = user?.username === entry.username;
                  return (
                    <tr
                      key={entry.id}
                      className={`hover:bg-[var(--bg-subtle)] transition-colors ${
                        isCurrent ? 'bg-indigo-50/50 dark:bg-emerald-950/30 font-semibold' : ''
                      }`}
                    >
                      <td className="py-3 px-4 text-center font-mono font-bold">
                        {entry.rank === 1 ? '🥇' : entry.rank === 2 ? '🥈' : entry.rank === 3 ? '🥉' : `#${entry.rank}`}
                      </td>
                      <td className="py-3 px-4 flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-indigo-600 dark:bg-emerald-500 text-white flex items-center justify-center font-bold text-[10px] uppercase">
                          {entry.username.charAt(0)}
                        </div>
                        <span className="text-[var(--text-main)] font-medium">
                          {entry.username} {isCurrent && <span className="text-xs text-indigo-600 dark:text-emerald-400 font-bold">(You)</span>}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center font-mono text-[var(--text-muted)]">
                        {entry.solvedCount}
                      </td>
                      <td className="py-3 px-4 text-center font-mono text-[var(--text-muted)]">
                        {entry.totalSubs}
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-indigo-600 dark:text-emerald-400">
                        {entry.score} pts
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
