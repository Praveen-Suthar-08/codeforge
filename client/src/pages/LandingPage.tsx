import React, { useState } from 'react';
import { 
  Code2, 
  Terminal, 
  Trophy, 
  ShieldCheck, 
  Cpu, 
  ArrowRight, 
  Zap, 
  CheckCircle2, 
  Flame,
  Layers,
  Sparkles,
  Play,
  TrendingUp,
  Award
} from 'lucide-react';

interface LandingProps {
  onStart: () => void;
  onExploreProblems: () => void;
}

export const LandingPage: React.FC<LandingProps> = ({ onStart, onExploreProblems }) => {
  const [activeLangTab, setActiveLangTab] = useState<'python' | 'javascript' | 'cpp'>('python');

  const codeSnippets = {
    python: `def twoSum(nums, target):
    lookup = {}
    for i, num in enumerate(nums):
        complement = target - num
        if complement in lookup:
            return [lookup[complement], i]
        lookup[num] = i
    return []

# ⚡ Sandbox: Execution time: 0.8ms`,
    javascript: `function twoSum(nums, target) {
  const map = new Map();
  for (let i = 0; i < nums.length; i++) {
    const diff = target - nums[i];
    if (map.has(diff)) return [map.get(diff), i];
    map.set(nums[i], i);
  }
  return [];
}
// ⚡ V8 VM: JIT Compiled & Verified`,
    cpp: `vector<int> twoSum(vector<int>& nums, int target) {
    unordered_map<int, int> seen;
    for (int i = 0; i < nums.size(); i++) {
        int complement = target - nums[i];
        if (seen.count(complement)) return {seen[complement], i};
        seen[nums[i]] = i;
    }
    return {};
}
// ⚡ GCC 13: O3 Optimized`
  };

  return (
    <div className="flex-1 overflow-y-auto px-4 py-8 sm:px-8 sm:py-12 max-w-7xl mx-auto w-full select-none space-y-16">
      {/* 3D Dynamic Hero Header */}
      <section className="relative text-center py-10 sm:py-16 space-y-8 max-w-4xl mx-auto">
        {/* Multilayer 3D Ambient Orbs */}
        <div className="absolute top-10 left-1/4 w-72 h-72 bg-gradient-to-tr from-indigo-500/25 to-purple-600/20 rounded-full blur-[90px] pointer-events-none -z-10 animate-pulse" />
        <div className="absolute top-20 right-1/4 w-80 h-80 bg-gradient-to-tr from-emerald-500/25 to-teal-400/20 rounded-full blur-[100px] pointer-events-none -z-10" />

        <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full border border-indigo-500/30 dark:border-emerald-500/30 bg-gradient-to-r from-indigo-50/80 via-purple-50/50 to-indigo-50/80 dark:from-emerald-950/50 dark:via-teal-950/40 dark:to-emerald-950/50 text-indigo-700 dark:text-emerald-300 text-xs font-semibold font-mono shadow-lg backdrop-blur-xl hover:scale-105 transition-transform duration-300">
          <Sparkles size={14} className="text-amber-500 animate-spin" />
          <span>CodeForge v2.0 · Python 3, Node.js & C++ Sandbox</span>
        </div>

        <div className="space-y-4">
          <h1 className="text-4xl sm:text-7xl font-black tracking-tight text-[var(--text-main)] leading-[1.08]">
            Master Coding Interviews <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 dark:from-emerald-400 dark:via-teal-300 dark:to-cyan-400 bg-clip-text text-transparent drop-shadow-sm">
              At High Velocity
            </span>
          </h1>

          <p className="text-sm sm:text-lg text-[var(--text-muted)] leading-relaxed max-w-2xl mx-auto font-normal">
            A state-of-the-art interactive coding platform with 45+ curated algorithmic interview challenges, full Monaco Editor integration, multi-language sandbox runtimes, and real-time test execution.
          </p>
        </div>

        {/* 3D Floating Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
          <button
            onClick={onExploreProblems}
            className="group flex items-center gap-2.5 px-7 py-3.5 rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-600 dark:from-emerald-500 dark:via-teal-600 dark:to-cyan-600 text-white font-bold text-sm shadow-xl shadow-indigo-500/25 dark:shadow-emerald-500/25 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:-translate-y-0.5 active:scale-95 cursor-pointer"
          >
            <span>Explore 45+ Problems</span>
            <ArrowRight size={17} className="transition-transform group-hover:translate-x-1" />
          </button>
          
          <button
            onClick={onStart}
            className="flex items-center gap-2 px-7 py-3.5 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)]/80 hover:bg-[var(--bg-subtle)] font-bold text-sm text-[var(--text-main)] shadow-md backdrop-blur-md transition-all duration-300 hover:scale-105 hover:-translate-y-0.5 active:scale-95 cursor-pointer"
          >
            <span>Create Developer Account</span>
          </button>
        </div>

        {/* 3D Code Preview Window with Interactive Language Switcher */}
        <div className="relative pt-6 max-w-2xl mx-auto [perspective:1000px]">
          <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] shadow-2xl backdrop-blur-xl overflow-hidden transition-all duration-500 hover:rotate-x-1 hover:shadow-indigo-500/10 dark:hover:shadow-emerald-500/10">
            {/* Window Titlebar */}
            <div className="h-11 border-b border-[var(--border-color)] bg-[var(--bg-subtle)]/70 px-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-rose-500 shadow-sm" />
                <div className="w-3 h-3 rounded-full bg-amber-500 shadow-sm" />
                <div className="w-3 h-3 rounded-full bg-emerald-500 shadow-sm" />
                <span className="ml-3 font-mono text-[11px] font-semibold text-[var(--text-muted)]">
                  solution.{activeLangTab === 'python' ? 'py' : activeLangTab === 'javascript' ? 'js' : 'cpp'}
                </span>
              </div>

              {/* Language Selector Tabs */}
              <div className="flex items-center gap-1 bg-[var(--bg-card)] p-0.5 rounded-lg border border-[var(--border-color)] text-[11px] font-mono">
                {(['python', 'javascript', 'cpp'] as const).map(lang => (
                  <button
                    key={lang}
                    onClick={() => setActiveLangTab(lang)}
                    className={`px-2.5 py-1 rounded-md transition-all cursor-pointer font-semibold ${
                      activeLangTab === lang
                        ? 'bg-indigo-600 dark:bg-emerald-500 text-white shadow-xs'
                        : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
                    }`}
                  >
                    {lang.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            {/* Code Body */}
            <div className="p-4 text-left font-mono text-xs overflow-x-auto bg-[#0a0d14] text-slate-200 leading-relaxed">
              <pre className="selection:bg-indigo-500/30 selection:text-white">
                <code>{codeSnippets[activeLangTab]}</code>
              </pre>
            </div>

            {/* Live Verdict Bar */}
            <div className="px-4 py-2.5 border-t border-[var(--border-color)] bg-[var(--bg-subtle)]/50 flex items-center justify-between text-xs font-mono">
              <div className="flex items-center gap-2 text-emerald-500 font-bold">
                <CheckCircle2 size={15} />
                <span>Verdict: Accepted · 4/4 Passed (0.8ms)</span>
              </div>
              <span className="text-[10px] text-[var(--text-muted)]">Python 3.13 Runtime</span>
            </div>
          </div>
        </div>
      </section>

      {/* 3D Interactive Feature Cards */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
        <div className="group relative p-6 rounded-3xl border border-[var(--border-color)] bg-gradient-to-b from-[var(--bg-card)] to-[var(--bg-subtle)]/50 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 hover:border-indigo-500/40 dark:hover:border-emerald-500/40">
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-emerald-400 flex items-center justify-center font-bold mb-4 group-hover:scale-110 transition-transform">
            <Code2 size={24} />
          </div>
          <h3 className="text-base font-bold text-[var(--text-main)] mb-2">45+ Curated Interview Challenges</h3>
          <p className="text-xs text-[var(--text-muted)] leading-relaxed">
            Covers Two Pointers, Sliding Window, Matrix, Dynamic Programming, Graphs, and Heaps with hints and company tags (Google, Meta, Amazon).
          </p>
        </div>

        <div className="group relative p-6 rounded-3xl border border-[var(--border-color)] bg-gradient-to-b from-[var(--bg-card)] to-[var(--bg-subtle)]/50 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 hover:border-indigo-500/40 dark:hover:border-emerald-500/40">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center font-bold mb-4 group-hover:scale-110 transition-transform">
            <Cpu size={24} />
          </div>
          <h3 className="text-base font-bold text-[var(--text-main)]">Sandboxed Isolated Execution</h3>
          <p className="text-xs text-[var(--text-muted)] leading-relaxed">
            Zero-delay execution in Python 3, Node.js V8, and Web Worker sandboxes. Infinite loops are intercepted with strict resource guardrails.
          </p>
        </div>

        <div className="group relative p-6 rounded-3xl border border-[var(--border-color)] bg-gradient-to-b from-[var(--bg-card)] to-[var(--bg-subtle)]/50 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 hover:border-indigo-500/40 dark:hover:border-emerald-500/40">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center font-bold mb-4 group-hover:scale-110 transition-transform">
            <Trophy size={24} />
          </div>
          <h3 className="text-base font-bold text-[var(--text-main)]">Live Contests & Mini-Projects</h3>
          <p className="text-xs text-[var(--text-muted)] leading-relaxed">
            Compete on global leaderboards with automated ratings and build real engineering systems like in-memory LRU caches and Git step-by-step.
          </p>
        </div>
      </section>

      {/* Live Benchmark Stats */}
      <section className="p-8 rounded-3xl border border-[var(--border-color)] bg-[var(--bg-card)] shadow-xl flex flex-wrap items-center justify-around gap-6 text-center backdrop-blur-md">
        <div className="space-y-1">
          <p className="text-4xl font-black bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-emerald-400 dark:to-teal-300 bg-clip-text text-transparent">
            45+
          </p>
          <p className="text-xs text-[var(--text-muted)] font-bold uppercase tracking-wider">Curated Problems</p>
        </div>
        <div className="space-y-1">
          <p className="text-4xl font-black text-amber-500">4 Languages</p>
          <p className="text-xs text-[var(--text-muted)] font-bold uppercase tracking-wider">Python, JS, C++, Java</p>
        </div>
        <div className="space-y-1">
          <p className="text-4xl font-black text-emerald-500">&lt; 15ms</p>
          <p className="text-xs text-[var(--text-muted)] font-bold uppercase tracking-wider">Sandbox Latency</p>
        </div>
        <div className="space-y-1">
          <p className="text-4xl font-black text-purple-500">100% Free</p>
          <p className="text-xs text-[var(--text-muted)] font-bold uppercase tracking-wider">Zero Paywalls</p>
        </div>
      </section>
    </div>
  );
};

