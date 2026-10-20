import React, { useEffect, useState } from 'react';
import { Swords, Clock, Trophy, Users, CheckCircle2, Play, Sparkles, X } from 'lucide-react';
import { Contest } from '../types';
import { apiRequest } from '../services/api';

interface ContestsViewProps {
  onSelectProblem?: (slug: string) => void;
  onViewLeaderboard?: () => void;
}

export const ContestsView: React.FC<ContestsViewProps> = ({ onSelectProblem, onViewLeaderboard }) => {
  const [contests, setContests] = useState<Contest[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeContestModal, setActiveContestModal] = useState<Contest | null>(null);
  const [registeredContests, setRegisteredContests] = useState<string[]>([]);

  useEffect(() => {
    const fetchContests = async () => {
      try {
        const data = await apiRequest<{ contests: Contest[] }>('/community/contests');
        setContests(data.contests || []);
      } catch (err) {
        console.error('Failed to load contests:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchContests();
  }, []);

  const handleRegister = (contestId: string) => {
    setRegisteredContests(prev => [...prev, contestId]);
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-6 max-w-6xl mx-auto w-full select-none space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-main)] flex items-center gap-2">
            <Swords size={24} className="text-indigo-600 dark:text-emerald-400" />
            Competitive Contests & Tournaments
          </h1>
          <p className="text-xs text-[var(--text-muted)] mt-1">
            Compete in timed rounds, tackle novel algorithmic problems, and climb the international rating leaderboards.
          </p>
        </div>
        {onViewLeaderboard && (
          <button
            onClick={onViewLeaderboard}
            className="flex items-center gap-2 px-3 py-2 rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] hover:bg-[var(--bg-subtle)] text-xs font-semibold text-[var(--text-main)] transition-colors shadow-xs"
          >
            <Trophy size={14} className="text-amber-500" />
            <span>Global Standings</span>
          </button>
        )}
      </div>

      {loading ? (
        <div className="p-12 text-center text-[var(--text-muted)]">Loading contests...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {contests.map(c => {
            const isOngoing = Date.now() >= c.start_time && Date.now() <= c.end_time;
            const isPast = Date.now() > c.end_time;
            const isRegistered = registeredContests.includes(c.id);

            return (
              <div
                key={c.id}
                className="p-5 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4 glow-subtle"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider ${
                        isOngoing
                          ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                          : isPast
                          ? 'bg-gray-500/10 text-gray-400'
                          : 'bg-indigo-500/10 text-indigo-500 border border-indigo-500/20'
                      }`}
                    >
                      {isOngoing ? '● Live Now' : isPast ? 'Completed' : 'Upcoming'}
                    </span>
                    <span className="text-xs font-mono text-[var(--text-muted)]">
                      {c.problemIds?.length || 4} Problems
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-[var(--text-main)]">{c.title}</h3>
                  <p className="text-xs text-[var(--text-muted)] mt-1 leading-relaxed">{c.description}</p>
                </div>

                <div className="pt-3 border-t border-[var(--border-color)] flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 text-[var(--text-muted)] font-mono text-[11px]">
                    <Clock size={13} />
                    <span>Duration: 90 Minutes</span>
                  </div>

                  <div className="flex items-center gap-2">
                    {isOngoing ? (
                      <button
                        onClick={() => setActiveContestModal(c)}
                        className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs transition-colors shadow-xs flex items-center gap-1.5 cursor-pointer"
                      >
                        <Play size={12} />
                        <span>Enter Arena</span>
                      </button>
                    ) : isPast ? (
                      <button
                        onClick={onViewLeaderboard}
                        className="px-3 py-1.5 rounded-lg border border-[var(--border-color)] bg-[var(--bg-subtle)] text-[var(--text-main)] font-semibold text-xs transition-colors"
                      >
                        View Standings
                      </button>
                    ) : isRegistered ? (
                      <span className="flex items-center gap-1 text-emerald-500 font-semibold text-xs">
                        <CheckCircle2 size={13} /> Registered
                      </span>
                    ) : (
                      <button
                        onClick={() => handleRegister(c.id)}
                        className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 dark:bg-emerald-500 dark:hover:bg-emerald-600 text-white font-semibold text-xs transition-colors shadow-xs cursor-pointer"
                      >
                        Register
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Contest Arena Modal */}
      {activeContestModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="w-full max-w-lg rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-3">
              <div>
                <span className="text-[10px] uppercase font-mono font-bold text-emerald-500">Live Arena</span>
                <h2 className="text-base font-bold text-[var(--text-main)]">{activeContestModal.title}</h2>
              </div>
              <button
                onClick={() => setActiveContestModal(null)}
                className="p-1 rounded-md text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-subtle)]"
              >
                <X size={18} />
              </button>
            </div>

            <p className="text-xs text-[var(--text-muted)] leading-relaxed">
              Select a challenge to solve within the remaining contest window. Your code executions and submissions are timed and rated.
            </p>

            <div className="space-y-2">
              {(activeContestModal.problemIds || ['two-sum', 'valid-palindrome', 'maximum-subarray', 'trapping-rain-water']).map((pId, idx) => (
                <div
                  key={pId}
                  onClick={() => {
                    setActiveContestModal(null);
                    onSelectProblem?.(pId);
                  }}
                  className="flex items-center justify-between p-3 rounded-xl border border-[var(--border-color)] bg-[var(--bg-subtle)] hover:border-emerald-500/50 cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-emerald-500/10 text-emerald-500 font-mono text-[10px] flex items-center justify-center font-bold">
                      {idx + 1}
                    </span>
                    <span className="text-xs font-semibold text-[var(--text-main)] capitalize">
                      {pId.replace(/-/g, ' ')}
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-emerald-500 font-semibold flex items-center gap-1">
                    Solve <Play size={10} />
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
