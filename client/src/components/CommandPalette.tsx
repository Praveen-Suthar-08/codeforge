import React, { useEffect, useState } from 'react';
import { Search, Code2, Terminal, Trophy, BookOpen, Layers, X, Sparkles } from 'lucide-react';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectAction: (actionId: string, payload?: any) => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  onSelectAction
}) => {
  const [query, setQuery] = useState('');
  const [problemResults, setProblemResults] = useState<any[]>([]);

  useEffect(() => {
    if (!query.trim()) {
      setProblemResults([]);
      return;
    }

    // Debounced quick fetch to backend problems search
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/problems?q=${encodeURIComponent(query.trim())}&limit=5`);
        if (res.ok) {
          const data = await res.json();
          setProblemResults(data.problems || []);
        }
      } catch {}
    }, 150);

    return () => clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
        else onSelectAction('open_palette');
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, onSelectAction]);

  if (!isOpen) return null;

  const commands = [
    { id: 'tab:problems', label: 'Explore Problems (100+ Catalog)', icon: Code2, category: 'Navigation' },
    { id: 'tab:compiler', label: 'Open Multi-Language Playground', icon: Terminal, category: 'Navigation' },
    { id: 'tab:dashboard', label: 'View Performance Dashboard & Heatmap', icon: Sparkles, category: 'Navigation' },
    { id: 'tab:leaderboard', label: 'View Global & Weekly Standings', icon: Trophy, category: 'Navigation' },
    { id: 'tab:contests', label: 'Live Competitive Contests', icon: Trophy, category: 'Navigation' },
    { id: 'tab:projects', label: 'Guided Mini-Projects Module', icon: Layers, category: 'Navigation' },
    { id: 'tab:roadmaps', label: 'Topic Roadmaps & Study Plans', icon: BookOpen, category: 'Learning' },
    { id: 'action:random', label: 'Pick a Random Challenge Problem', icon: Sparkles, category: 'Actions' }
  ];

  const filteredCommands = query.trim()
    ? commands.filter(c =>
        c.label.toLowerCase().includes(query.toLowerCase()) ||
        c.category.toLowerCase().includes(query.toLowerCase())
      )
    : commands;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-24 p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
      <div className="w-full max-w-lg rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] shadow-2xl overflow-hidden">
        <div className="flex items-center px-4 py-3 border-b border-[var(--border-color)] gap-3">
          <Search size={18} className="text-[var(--text-muted)]" />
          <input
            autoFocus
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Type a command or search..."
            className="flex-1 bg-transparent text-sm text-[var(--text-main)] placeholder-[var(--text-muted)] outline-hidden"
          />
          <button onClick={onClose} className="text-[var(--text-muted)] hover:text-[var(--text-main)]">
            <X size={16} />
          </button>
        </div>

        <div className="max-h-80 overflow-y-auto p-2 space-y-1">
          {problemResults.length > 0 && (
            <div className="mb-2">
              <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-emerald-400 font-mono">
                Matching Problems ({problemResults.length})
              </div>
              {problemResults.map((p: any) => (
                <button
                  key={p.slug}
                  onClick={() => {
                    onSelectAction(`problem:${p.slug}`);
                    onClose();
                  }}
                  className="w-full flex items-center justify-between p-2.5 rounded-lg hover:bg-[var(--bg-subtle)] text-left text-xs transition-colors group cursor-pointer"
                >
                  <div className="flex items-center gap-2.5">
                    <Code2 size={15} className="text-indigo-600 dark:text-emerald-400" />
                    <span className="font-semibold text-[var(--text-main)]">{p.title}</span>
                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                      p.difficulty === 'Easy' ? 'text-emerald-500 bg-emerald-500/10' :
                      p.difficulty === 'Medium' ? 'text-amber-500 bg-amber-500/10' : 'text-rose-500 bg-rose-500/10'
                    }`}>
                      {p.difficulty}
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-[var(--text-muted)]">
                    {p.points} pts
                  </span>
                </button>
              ))}
            </div>
          )}

          {filteredCommands.length > 0 && (
            <div>
              {problemResults.length > 0 && (
                <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)] font-mono border-t border-[var(--border-color)] mt-1 pt-1.5">
                  App Actions
                </div>
              )}
              {filteredCommands.map(cmd => {
                const Icon = cmd.icon;
                return (
                  <button
                    key={cmd.id}
                    onClick={() => {
                      onSelectAction(cmd.id);
                      onClose();
                    }}
                    className="w-full flex items-center justify-between p-2.5 rounded-lg hover:bg-[var(--bg-subtle)] text-left text-xs transition-colors group cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <Icon size={16} className="text-[var(--text-muted)] group-hover:text-indigo-600 dark:group-hover:text-emerald-400" />
                      <span className="font-medium text-[var(--text-main)]">{cmd.label}</span>
                    </div>
                    <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-[var(--bg-subtle)] border border-[var(--border-color)] text-[var(--text-muted)]">
                      {cmd.category}
                    </span>
                  </button>
                );
              })}
            </div>
          )}

          {problemResults.length === 0 && filteredCommands.length === 0 && (
            <div className="p-6 text-center text-xs text-[var(--text-muted)]">
              No matching problems or commands found.
            </div>
          )}
        </div>

        <div className="px-4 py-2 border-t border-[var(--border-color)] bg-[var(--bg-subtle)] flex items-center justify-between text-[11px] text-[var(--text-muted)] font-mono">
          <span>Navigate with mouse or arrow keys</span>
          <span>ESC to close</span>
        </div>
      </div>
    </div>
  );
};
