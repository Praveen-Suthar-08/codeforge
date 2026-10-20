import React, { useEffect, useState } from 'react';
import { 
  Search, 
  CheckCircle2, 
  Circle, 
  Bookmark, 
  Shuffle, 
  Flame, 
  Filter, 
  ChevronLeft, 
  ChevronRight,
  Building2,
  Sparkles
} from 'lucide-react';
import { Problem } from '../types';
import { apiRequest } from '../services/api';

interface ProblemsViewProps {
  onSelectProblem: (slug: string) => void;
}

export const ProblemsView: React.FC<ProblemsViewProps> = ({ onSelectProblem }) => {
  const [problems, setProblems] = useState<Problem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [difficulty, setDifficulty] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const fetchProblems = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '15',
        ...(search ? { q: search } : {}),
        ...(difficulty ? { difficulty } : {}),
        ...(status ? { status } : {})
      });
      const data = await apiRequest<{ problems: Problem[]; total: number; totalPages: number }>(`/problems?${params.toString()}`);
      setProblems(data.problems || []);
      setTotal(data.total || 0);
      setTotalPages(data.totalPages || 1);
    } catch (err) {
      console.error('Failed to load problems:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProblems();
  }, [page, difficulty, status]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1);
      fetchProblems();
    }, 250);
    return () => clearTimeout(timer);
  }, [search]);

  const handleRandomProblem = () => {
    if (problems.length > 0) {
      const randomIdx = Math.floor(Math.random() * problems.length);
      onSelectProblem(problems[randomIdx].slug);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden p-4 sm:p-6 max-w-7xl mx-auto w-full">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-main)] flex items-center gap-2">
            Curated Problem Catalog
            <span className="text-xs px-2 py-0.5 rounded-full font-mono font-medium bg-indigo-50 dark:bg-emerald-950/40 text-indigo-600 dark:text-emerald-400 border border-indigo-200 dark:border-emerald-800">
              {total} Available
            </span>
          </h1>
          <p className="text-xs text-[var(--text-muted)] mt-1">
            Industry standard coding interview questions with full test suite verification and real-time execution.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleRandomProblem}
            className="flex items-center gap-2 px-3 py-2 rounded-lg border border-[var(--border-color)] bg-[var(--bg-card)] text-xs font-semibold text-[var(--text-main)] hover:border-indigo-500/50 dark:hover:border-emerald-500/50 hover:bg-[var(--bg-subtle)] transition-colors shadow-xs"
          >
            <Shuffle size={14} className="text-indigo-600 dark:text-emerald-400" />
            Random Problem
          </button>
          <button
            onClick={() => onSelectProblem('two-sum')}
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-semibold hover:opacity-90 transition-opacity shadow-xs"
          >
            <Flame size={14} />
            Daily Challenge
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-wrap items-center gap-2.5 mb-4">
        <div className="relative flex-1 min-w-[220px]">
          <Search size={15} className="absolute left-3 top-3 text-[var(--text-muted)]" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by title, tag (e.g. array, dp)..."
            className="w-full pl-9 pr-3 py-2 rounded-lg border border-[var(--border-color)] bg-[var(--bg-card)] text-xs text-[var(--text-main)] focus:outline-hidden focus:border-indigo-500 dark:focus:border-emerald-500"
          />
        </div>

        <select
          value={difficulty}
          onChange={e => { setDifficulty(e.target.value); setPage(1); }}
          className="px-3 py-2 rounded-lg border border-[var(--border-color)] bg-[var(--bg-card)] text-xs text-[var(--text-main)] focus:outline-hidden"
        >
          <option value="">All Difficulties</option>
          <option value="Easy">Easy</option>
          <option value="Medium">Medium</option>
          <option value="Hard">Hard</option>
        </select>

        <select
          value={status}
          onChange={e => { setStatus(e.target.value); setPage(1); }}
          className="px-3 py-2 rounded-lg border border-[var(--border-color)] bg-[var(--bg-card)] text-xs text-[var(--text-main)] focus:outline-hidden"
        >
          <option value="">All Statuses</option>
          <option value="solved">Solved</option>
          <option value="todo">Unsolved</option>
        </select>
      </div>

      {/* Problems Table View */}
      <div className="flex-1 rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] overflow-hidden flex flex-col shadow-xs">
        <div className="overflow-x-auto flex-1">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-[var(--bg-subtle)] border-b border-[var(--border-color)] sticky top-0 z-10 select-none">
              <tr>
                <th className="py-3 px-4 font-semibold text-[var(--text-muted)] w-12 text-center">Status</th>
                <th className="py-3 px-4 font-semibold text-[var(--text-muted)]">Title</th>
                <th className="py-3 px-4 font-semibold text-[var(--text-muted)] w-28">Difficulty</th>
                <th className="py-3 px-4 font-semibold text-[var(--text-muted)] hidden md:table-cell">Category & Tags</th>
                <th className="py-3 px-4 font-semibold text-[var(--text-muted)] hidden lg:table-cell">Companies</th>
                <th className="py-3 px-4 font-semibold text-[var(--text-muted)] w-20 text-right">Points</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-color)]">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-[var(--text-muted)]">
                    <div className="inline-block animate-spin rounded-full h-6 w-6 border-2 border-indigo-600 dark:border-emerald-400 border-t-transparent" />
                    <p className="mt-2 text-xs">Loading problem set...</p>
                  </td>
                </tr>
              ) : problems.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-[var(--text-muted)]">
                    No problems match your current filter criteria.
                  </td>
                </tr>
              ) : (
                problems.map((problem) => (
                  <tr
                    key={problem.id}
                    onClick={() => onSelectProblem(problem.slug)}
                    className="hover:bg-[var(--bg-subtle)] transition-colors cursor-pointer group"
                  >
                    <td className="py-3 px-4 text-center">
                      {problem.isSolved ? (
                        <CheckCircle2 size={16} className="text-emerald-500 mx-auto" />
                      ) : (
                        <Circle size={16} className="text-[var(--text-muted)]/40 mx-auto group-hover:text-[var(--text-muted)]" />
                      )}
                    </td>
                    <td className="py-3 px-4 font-medium text-[var(--text-main)] group-hover:text-indigo-600 dark:group-hover:text-emerald-400">
                      {problem.title}
                    </td>
                    <td className="py-3 px-4 font-semibold">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[11px] ${
                          problem.difficulty === 'Easy'
                            ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-500/10'
                            : problem.difficulty === 'Medium'
                            ? 'text-amber-600 dark:text-amber-400 bg-amber-500/10'
                            : 'text-rose-600 dark:text-rose-400 bg-rose-500/10'
                        }`}
                      >
                        {problem.difficulty}
                      </span>
                    </td>
                    <td className="py-3 px-4 hidden md:table-cell">
                      <div className="flex flex-wrap gap-1 items-center">
                        <span className="font-semibold text-[var(--text-main)] mr-1">{problem.category}</span>
                        {problem.tags.slice(0, 3).map((tag, i) => (
                          <span
                            key={i}
                            className="px-1.5 py-0.5 rounded text-[10px] bg-[var(--bg-subtle)] text-[var(--text-muted)] border border-[var(--border-color)] font-mono"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="py-3 px-4 hidden lg:table-cell">
                      <div className="flex items-center gap-1 text-[11px] text-[var(--text-muted)]">
                        <Building2 size={12} className="shrink-0" />
                        <span>{problem.companies.slice(0, 2).join(', ') || 'General'}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-semibold text-[var(--text-main)]">
                      {problem.points} pts
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="p-3 border-t border-[var(--border-color)] bg-[var(--bg-subtle)] flex items-center justify-between text-xs text-[var(--text-muted)]">
          <span>
            Showing page <span className="font-semibold text-[var(--text-main)]">{page}</span> of{' '}
            <span className="font-semibold text-[var(--text-main)]">{totalPages}</span> ({total} problems)
          </span>

          <div className="flex items-center gap-1.5">
            <button
              disabled={page <= 1}
              onClick={() => setPage(p => Math.max(1, p - 1))}
              className="p-1.5 rounded border border-[var(--border-color)] bg-[var(--bg-card)] disabled:opacity-40 hover:bg-[var(--bg-subtle)] transition-colors"
            >
              <ChevronLeft size={15} />
            </button>
            <button
              disabled={page >= totalPages}
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              className="p-1.5 rounded border border-[var(--border-color)] bg-[var(--bg-card)] disabled:opacity-40 hover:bg-[var(--bg-subtle)] transition-colors"
            >
              <ChevronRight size={15} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
