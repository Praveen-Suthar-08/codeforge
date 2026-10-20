import React, { useEffect, useState } from 'react';
import { Layers, CheckSquare, Square, FolderGit2, ArrowRight } from 'lucide-react';
import { MiniProject } from '../types';
import { apiRequest } from '../services/api';

export const ProjectsView: React.FC = () => {
  const [projects, setProjects] = useState<MiniProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [completedSteps, setCompletedSteps] = useState<Record<string, string[]>>({});

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const data = await apiRequest<{ projects: MiniProject[] }>('/community/projects');
        setProjects(data.projects || []);
      } catch (err) {
        console.error('Failed to load projects:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProjects();
  }, []);

  const toggleStep = (projectId: string, stepId: string) => {
    setCompletedSteps(prev => {
      const current = prev[projectId] || [];
      const updated = current.includes(stepId)
        ? current.filter(id => id !== stepId)
        : [...current, stepId];
      return { ...prev, [projectId]: updated };
    });
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-6 max-w-6xl mx-auto w-full select-none space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[var(--text-main)] flex items-center gap-2">
          <Layers size={24} className="text-indigo-600 dark:text-emerald-400" />
          Guided Engineering Mini-Projects
        </h1>
        <p className="text-xs text-[var(--text-muted)] mt-1">
          Apply data structures and system design fundamentals to build real software: Git internal storage, LRU caching, and parsers.
        </p>
      </div>

      {loading ? (
        <div className="p-12 text-center text-[var(--text-muted)]">Loading guided projects...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {projects.map(proj => {
            const completed = completedSteps[proj.id] || [];
            const progressPct = Math.round((completed.length / (proj.steps.length || 1)) * 100);

            return (
              <div
                key={proj.id}
                className="p-6 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] shadow-xs flex flex-col justify-between space-y-5"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-indigo-500/10 text-indigo-500 font-mono">
                      {proj.difficulty}
                    </span>
                    <span className="text-xs font-semibold text-[var(--text-muted)] font-mono">
                      {completed.length} / {proj.steps.length} Steps
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-[var(--text-main)]">{proj.title}</h3>
                  <p className="text-xs text-[var(--text-muted)] mt-1 leading-relaxed">{proj.description}</p>

                  {/* Progress bar */}
                  <div className="mt-4">
                    <div className="h-2 w-full rounded-full bg-[var(--bg-subtle)] overflow-hidden">
                      <div
                        className="h-full bg-emerald-500 rounded-full transition-all duration-300"
                        style={{ width: `${progressPct}%` }}
                      />
                    </div>
                  </div>

                  {/* Step Checklist */}
                  <div className="mt-4 space-y-2.5">
                    {proj.steps.map(step => {
                      const isDone = completed.includes(step.id);
                      return (
                        <div
                          key={step.id}
                          onClick={() => toggleStep(proj.id, step.id)}
                          className="flex items-start gap-2.5 p-2 rounded-lg hover:bg-[var(--bg-subtle)] cursor-pointer transition-colors"
                        >
                          {isDone ? (
                            <CheckSquare size={16} className="text-emerald-500 shrink-0 mt-0.5" />
                          ) : (
                            <Square size={16} className="text-[var(--text-muted)] shrink-0 mt-0.5" />
                          )}
                          <div>
                            <p className={`text-xs font-semibold ${isDone ? 'line-through text-[var(--text-muted)]' : 'text-[var(--text-main)]'}`}>
                              {step.title}
                            </p>
                            <p className="text-[11px] text-[var(--text-muted)]">{step.desc}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="pt-3 border-t border-[var(--border-color)] flex items-center justify-between">
                  <span className="text-[11px] font-mono text-[var(--text-muted)]">
                    Starter files included
                  </span>
                  <button
                    onClick={() => alert('Starter workspace initialized for ' + proj.title)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 dark:bg-emerald-500 dark:hover:bg-emerald-600 text-white font-semibold text-xs transition-colors shadow-xs"
                  >
                    <span>Launch Project</span>
                    <ArrowRight size={13} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
