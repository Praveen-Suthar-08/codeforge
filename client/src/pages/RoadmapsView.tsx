import React, { useState } from 'react';
import { BookOpen, CheckCircle, ArrowRight } from 'lucide-react';

export const RoadmapsView: React.FC<{ onSelectProblem: (slug: string) => void }> = ({ onSelectProblem }) => {
  const roadmaps = [
    {
      id: 'arrays-hashing',
      title: 'Arrays & Hashing Master Roadmap',
      desc: 'The essential foundation for technical interviews. Learn hash maps, frequency tables, prefix sums, and sliding windows.',
      problems: [
        { slug: 'contains-duplicate', title: 'Contains Duplicate', difficulty: 'Easy' },
        { slug: 'valid-anagram', title: 'Valid Anagram', difficulty: 'Easy' },
        { slug: 'two-sum', title: 'Two Sum', difficulty: 'Easy' },
        { slug: 'group-anagrams', title: 'Group Anagrams', difficulty: 'Medium' },
        { slug: 'product-of-array-except-self', title: 'Product of Array Except Self', difficulty: 'Medium' },
        { slug: 'longest-consecutive-sequence', title: 'Longest Consecutive Sequence', difficulty: 'Medium' }
      ]
    },
    {
      id: 'two-pointers',
      title: 'Two Pointers & Sliding Window',
      desc: 'Linear patterns to optimize O(n^2) nested loops into O(n) single passes.',
      problems: [
        { slug: 'valid-palindrome', title: 'Valid Palindrome', difficulty: 'Easy' },
        { slug: '3sum', title: '3Sum', difficulty: 'Medium' },
        { slug: 'container-with-most-water', title: 'Container With Most Water', difficulty: 'Medium' },
        { slug: 'longest-substring-without-repeating', title: 'Longest Unique Substring', difficulty: 'Medium' },
        { slug: 'trapping-rain-water', title: 'Trapping Rain Water', difficulty: 'Hard' }
      ]
    },
    {
      id: 'dynamic-programming',
      title: 'Dynamic Programming From Scratch',
      desc: 'Deconstruct complex optimization problems into overlapping subproblems and optimal substructure.',
      problems: [
        { slug: 'climbing-stairs', title: 'Climbing Stairs', difficulty: 'Easy' },
        { slug: 'maximum-subarray', title: 'Maximum Subarray', difficulty: 'Medium' },
        { slug: 'house-robber', title: 'House Robber', difficulty: 'Medium' },
        { slug: 'coin-change', title: 'Coin Change', difficulty: 'Medium' },
        { slug: 'word-break', title: 'Word Break', difficulty: 'Medium' }
      ]
    }
  ];

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-6 max-w-6xl mx-auto w-full select-none space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[var(--text-main)] flex items-center gap-2">
          <BookOpen size={24} className="text-indigo-600 dark:text-emerald-400" />
          Structured Topic Roadmaps & Study Plans
        </h1>
        <p className="text-xs text-[var(--text-muted)] mt-1">
          Follow ordered learning paths specifically designed to build conceptual muscle memory from scratch.
        </p>
      </div>

      <div className="space-y-6">
        {roadmaps.map(roadmap => (
          <div
            key={roadmap.id}
            className="p-6 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] shadow-xs space-y-4"
          >
            <div>
              <h2 className="text-base font-bold text-[var(--text-main)]">{roadmap.title}</h2>
              <p className="text-xs text-[var(--text-muted)] mt-0.5">{roadmap.desc}</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {roadmap.problems.map((p, idx) => (
                <div
                  key={p.slug}
                  onClick={() => onSelectProblem(p.slug)}
                  className="p-3.5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-subtle)] hover:border-indigo-500/50 dark:hover:border-emerald-500/50 cursor-pointer transition-colors flex items-center justify-between group"
                >
                  <div>
                    <span className="text-[10px] font-mono text-[var(--text-muted)] block mb-1">
                      Step #{idx + 1}
                    </span>
                    <p className="text-xs font-semibold text-[var(--text-main)] group-hover:text-indigo-600 dark:group-hover:text-emerald-400">
                      {p.title}
                    </p>
                  </div>
                  <span
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                      p.difficulty === 'Easy'
                        ? 'text-emerald-500 bg-emerald-500/10'
                        : p.difficulty === 'Medium'
                        ? 'text-amber-500 bg-amber-500/10'
                        : 'text-rose-500 bg-rose-500/10'
                    }`}
                  >
                    {p.difficulty}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
