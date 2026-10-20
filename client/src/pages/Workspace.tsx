import React, { useEffect, useState, useRef } from 'react';
import Editor from '@monaco-editor/react';
import { 
  Play, 
  Send, 
  RotateCcw, 
  Bookmark, 
  Clock, 
  CheckCircle, 
  XCircle, 
  ChevronLeft, 
  Eye, 
  EyeOff, 
  Lightbulb, 
  FileText, 
  Terminal,
  Columns,
  MessageSquare,
  Sparkles
} from 'lucide-react';
import { Problem, ExecutionResult } from '../types';
import { apiRequest } from '../services/api';
import { useAuth } from '../context/AuthContext';

interface WorkspaceProps {
  slug: string;
  onBack: () => void;
}

export const Workspace: React.FC<WorkspaceProps> = ({ slug, onBack }) => {
  const { user, theme } = useAuth();
  const [problem, setProblem] = useState<Problem | null>(null);
  const [loading, setLoading] = useState(true);
  const [language, setLanguage] = useState<'javascript' | 'python' | 'cpp' | 'java'>('javascript');
  const [code, setCode] = useState('');
  const [customInput, setCustomInput] = useState('');
  const [activeTab, setActiveTab] = useState<'description' | 'editorial' | 'solutions' | 'submissions'>('description');
  const [bottomTab, setBottomTab] = useState<'tests' | 'output' | 'custom'>('output');
  const [executionResult, setExecutionResult] = useState<ExecutionResult | null>(null);
  const [executing, setExecuting] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const [notes, setNotes] = useState('');
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [timerActive, setTimerActive] = useState(true);
  const [submissionsList, setSubmissionsList] = useState<any[]>([]);

  const [codesByLang, setCodesByLang] = useState<Record<string, string>>({});
  const editorRef = useRef<any>(null);

  // Re-focus and re-enable Monaco whenever user returns to the tab/window
  useEffect(() => {
    const handleWindowFocus = () => {
      if (editorRef.current) {
        // Trigger Monaco layout and focus
        editorRef.current.layout();
        // Give time for any active browser selection to clear
        setTimeout(() => {
          if (editorRef.current) {
            editorRef.current.focus();
          }
        }, 50);
      }
    };

    window.addEventListener('focus', handleWindowFocus);
    return () => window.removeEventListener('focus', handleWindowFocus);
  }, []);

  // Panes collapse toggles
  const [hideDescription, setHideDescription] = useState(false);
  const [hideOutput, setHideOutput] = useState(false);

  // Timer counter
  useEffect(() => {
    let interval: any;
    if (timerActive) {
      interval = setInterval(() => setTimerSeconds(s => s + 1), 1000);
    }
    return () => clearInterval(interval);
  }, [timerActive]);

  const formatTimer = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const s = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const loadProblemData = async () => {
    setLoading(true);
    try {
      const data = await apiRequest<{ problem: Problem; draft?: { code: string; language: string }; userMeta?: { is_bookmarked: number; notes: string } }>(`/problems/${slug}`);
      setProblem(data.problem);
      setBookmarked(Boolean(data.userMeta?.is_bookmarked));
      setNotes(data.userMeta?.notes || '');

      const initialLang = (data.draft?.language as any) || language || 'javascript';
      setLanguage(initialLang);

      const starterMap: Record<string, string> = { ...(data.problem.starter_code || {}) };
      if (data.draft?.code && data.draft?.language) {
        starterMap[data.draft.language] = data.draft.code;
      }
      setCodesByLang(starterMap);

      const currentLangCode = starterMap[initialLang] || data.problem.starter_code?.[initialLang] || '// Write your code here';
      setCode(currentLangCode);
    } catch (err) {
      console.error('Failed to load problem:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProblemData();
  }, [slug]);

  // Handle language switch
  const handleLanguageChange = (newLang: 'javascript' | 'python' | 'cpp' | 'java') => {
    // Preserve current code in map before switching
    setCodesByLang(prev => ({ ...prev, [language]: code }));
    setLanguage(newLang);
    const newCode = codesByLang[newLang] || problem?.starter_code?.[newLang] || '// Write your code here';
    setCode(newCode);
    if (editorRef.current) {
      setTimeout(() => editorRef.current?.focus(), 50);
    }
  };

  // Autosave draft debounce
  useEffect(() => {
    if (!problem || !user || !code) return;
    const timer = setTimeout(() => {
      apiRequest('/problems/drafts', {
        method: 'POST',
        body: JSON.stringify({ problemId: problem.id, language, code })
      }).catch(() => {});
    }, 1500);
    return () => clearTimeout(timer);
  }, [code, language, problem, user]);

  const handleRun = async () => {
    if (!problem) return;
    const currentCode = editorRef.current ? editorRef.current.getValue() : code;
    // Keep local state in sync
    setCode(currentCode);
    setExecuting(true);
    setBottomTab('output');
    try {
      const res = await apiRequest<ExecutionResult>('/submissions/run', {
        method: 'POST',
        body: JSON.stringify({
          problemId: problem.id,
          code: currentCode,
          language,
          customInput: bottomTab === 'custom' ? customInput : undefined
        })
      });
      setExecutionResult(res);
    } catch (err: any) {
      setExecutionResult({
        verdict: 'Execution Error',
        runtimeMs: 0,
        memoryKb: 0,
        passedTestCases: 0,
        totalTestCases: 0,
        details: [{ testIndex: 1, ok: false, error: err.message }]
      });
    } finally {
      setExecuting(false);
      if (editorRef.current) editorRef.current.focus();
    }
  };

  const handleSubmit = async () => {
    if (!problem) return;
    if (!user) {
      alert('Please sign in or create an account to record your submissions and earn rating points.');
      return;
    }
    const currentCode = editorRef.current ? editorRef.current.getValue() : code;
    setCode(currentCode);
    setExecuting(true);
    setBottomTab('output');
    try {
      const res = await apiRequest<ExecutionResult>('/submissions/submit', {
        method: 'POST',
        body: JSON.stringify({
          problemId: problem.id,
          code: currentCode,
          language
        })
      });
      setExecutionResult(res);
      // Reload submissions
      fetchSubmissions();
    } catch (err: any) {
      setExecutionResult({
        verdict: 'Submission Failed',
        runtimeMs: 0,
        memoryKb: 0,
        passedTestCases: 0,
        totalTestCases: 0,
        details: [{ testIndex: 1, ok: false, error: err.message }]
      });
    } finally {
      setExecuting(false);
    }
  };

  const fetchSubmissions = async () => {
    if (!problem || !user) return;
    try {
      const data = await apiRequest<{ submissions: any[] }>(`/submissions/history?problemId=${problem.id}`);
      setSubmissionsList(data.submissions || []);
    } catch (e) {}
  };

  const toggleBookmark = async () => {
    if (!problem || !user) return;
    try {
      const res = await apiRequest<{ is_bookmarked: number }>(`/problems/${problem.id}/bookmark`, { method: 'POST' });
      setBookmarked(Boolean(res.is_bookmarked));
    } catch (e) {}
  };

  const handleResetCode = () => {
    if (problem?.starter_code?.[language]) {
      setCode(problem.starter_code[language]);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-2 border-indigo-600 dark:border-emerald-400 border-t-transparent" />
          <p className="mt-3 text-xs text-[var(--text-muted)]">Loading workspace...</p>
        </div>
      </div>
    );
  }

  if (!problem) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center">
        <p className="text-sm font-semibold text-[var(--text-main)]">Problem not found</p>
        <button onClick={onBack} className="mt-2 text-xs text-indigo-600 dark:text-emerald-400">
          ← Back to problem list
        </button>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-[calc(100vh-3.5rem)] overflow-hidden w-full">
      {/* Workspace Top Toolbar */}
      <div className="h-11 border-b border-[var(--border-color)] bg-[var(--bg-card)] px-3 flex items-center justify-between gap-2 shrink-0 select-none">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="flex items-center gap-1 text-xs font-semibold text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors"
          >
            <ChevronLeft size={16} /> Problems
          </button>
          <span className="text-[var(--border-color)]">|</span>
          <span className="text-xs font-bold text-[var(--text-main)] truncate max-w-[200px] sm:max-w-none">
            {problem.title}
          </span>
          <span
            className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
              problem.difficulty === 'Easy'
                ? 'text-emerald-500 bg-emerald-500/10'
                : problem.difficulty === 'Medium'
                ? 'text-amber-500 bg-amber-500/10'
                : 'text-rose-500 bg-rose-500/10'
            }`}
          >
            {problem.difficulty}
          </span>
        </div>

        {/* Center / Right controls */}
        <div className="flex items-center gap-2">
          {/* Timer */}
          <div 
            onClick={() => setTimerActive(a => !a)}
            className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded bg-[var(--bg-subtle)] border border-[var(--border-color)] text-xs font-mono text-[var(--text-muted)] cursor-pointer"
            title="Click to pause/resume timer"
          >
            <Clock size={13} className={timerActive ? 'text-emerald-500' : 'text-[var(--text-muted)]'} />
            <span>{formatTimer(timerSeconds)}</span>
          </div>

          {/* Pane View Toggles */}
          <div className="flex items-center rounded-lg border border-[var(--border-color)] p-0.5 bg-[var(--bg-subtle)]">
            <button
              onClick={() => setHideDescription(h => !h)}
              className={`px-2 py-1 rounded text-[10px] font-medium transition-colors ${
                !hideDescription ? 'bg-[var(--bg-card)] text-[var(--text-main)] shadow-xs' : 'text-[var(--text-muted)]'
              }`}
              title="Toggle Description Pane"
            >
              Description
            </button>
            <button
              onClick={() => setHideOutput(h => !h)}
              className={`px-2 py-1 rounded text-[10px] font-medium transition-colors ${
                !hideOutput ? 'bg-[var(--bg-card)] text-[var(--text-main)] shadow-xs' : 'text-[var(--text-muted)]'
              }`}
              title="Toggle Output/Console Pane"
            >
              Output
            </button>
          </div>

          {/* Bookmark */}
          {user && (
            <button
              onClick={toggleBookmark}
              className={`p-1.5 rounded-lg border border-[var(--border-color)] ${
                bookmarked ? 'text-amber-500 bg-amber-500/10' : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
              }`}
              title="Bookmark problem"
            >
              <Bookmark size={15} />
            </button>
          )}

          {/* Run & Submit */}
          <button
            disabled={executing}
            onClick={handleRun}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[var(--border-color)] bg-[var(--bg-subtle)] hover:bg-[var(--bg-card)] text-xs font-semibold text-[var(--text-main)] disabled:opacity-50 transition-colors shadow-xs"
          >
            <Play size={13} className="text-emerald-500 fill-emerald-500" />
            <span>Run</span>
          </button>
          <button
            disabled={executing}
            onClick={handleSubmit}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 dark:bg-emerald-500 dark:hover:bg-emerald-600 text-white text-xs font-semibold disabled:opacity-50 transition-colors shadow-xs"
          >
            <Send size={13} />
            <span>{executing ? 'Evaluating...' : 'Submit'}</span>
          </button>
        </div>
      </div>

      {/* Main 3-Pane Resizable Layout */}
      <div className="flex-1 grid grid-cols-1 md:grid-cols-12 overflow-hidden bg-[var(--bg-main)]">
        {/* Left Pane: Description & Editorial (Collapsible) */}
        {!hideDescription && (
          <div className="col-span-12 md:col-span-4 border-r border-[var(--border-color)] bg-[var(--bg-card)] flex flex-col overflow-hidden h-full">
            {/* Tabs */}
            <div className="h-10 border-b border-[var(--border-color)] flex items-center px-2 gap-1 bg-[var(--bg-subtle)] shrink-0">
              <button
                onClick={() => setActiveTab('description')}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                  activeTab === 'description' ? 'bg-[var(--bg-card)] text-[var(--text-main)] shadow-xs' : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
                }`}
              >
                Description
              </button>
              <button
                onClick={() => setActiveTab('editorial')}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                  activeTab === 'editorial' ? 'bg-[var(--bg-card)] text-[var(--text-main)] shadow-xs' : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
                }`}
              >
                Editorial
              </button>
              <button
                onClick={() => { setActiveTab('submissions'); fetchSubmissions(); }}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                  activeTab === 'submissions' ? 'bg-[var(--bg-card)] text-[var(--text-main)] shadow-xs' : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
                }`}
              >
                Submissions
              </button>
            </div>

            {/* Pane Content */}
            <div className="flex-1 overflow-y-auto p-4 text-xs space-y-4 select-text">
              {activeTab === 'description' && (
                <>
                  <div className="space-y-2 select-text">
                    <h2 className="text-base font-bold text-[var(--text-main)] select-text">{problem.title}</h2>
                    <div className="flex flex-wrap gap-1.5 items-center select-text">
                      <span className="font-semibold text-indigo-600 dark:text-emerald-400 font-mono">
                        {problem.points} Points
                      </span>
                      {problem.tags.map((t, idx) => (
                        <span key={idx} className="px-2 py-0.5 rounded bg-[var(--bg-subtle)] border border-[var(--border-color)] text-[10px] text-[var(--text-muted)] font-mono">
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Problem Statement */}
                  <div 
                    className="text-[var(--text-main)] leading-relaxed space-y-2 select-text"
                    dangerouslySetInnerHTML={{ __html: problem.description || '' }}
                  />

                  {/* Examples */}
                  <div className="space-y-3 pt-2 select-text">
                    <h3 className="font-bold text-[var(--text-main)] text-xs">Examples:</h3>
                    {problem.examples?.map((ex, i) => (
                      <div key={i} className="p-3 rounded-lg bg-[var(--bg-subtle)] border border-[var(--border-color)] font-mono text-[11px] space-y-1 select-text">
                        <div><span className="text-[var(--text-muted)] font-semibold">Input:</span> {ex.input}</div>
                        <div><span className="text-[var(--text-muted)] font-semibold">Output:</span> {ex.output}</div>
                        {ex.explanation && (
                          <div className="text-[var(--text-muted)] font-sans text-[11px] pt-1">
                            {ex.explanation}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Hints Accordion */}
                  {problem.hints && problem.hints.length > 0 && (
                    <div className="pt-2">
                      <div className="p-3 rounded-lg bg-indigo-50/50 dark:bg-emerald-950/20 border border-indigo-200 dark:border-emerald-800/50 space-y-2">
                        <div className="flex items-center gap-1.5 font-bold text-indigo-700 dark:text-emerald-400">
                          <Lightbulb size={14} /> Hints & Approach
                        </div>
                        {problem.hints.map((hint, i) => (
                          <p key={i} className="text-[11px] text-[var(--text-muted)]">
                            • {hint}
                          </p>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}

              {activeTab === 'editorial' && (
                <div className="space-y-3">
                  <h3 className="font-bold text-[var(--text-main)]">Official Editorial & Solution Walkthrough</h3>
                  <div className="p-3.5 rounded-lg bg-[var(--bg-subtle)] border border-[var(--border-color)] leading-relaxed text-[var(--text-main)]">
                    {problem.editorial || 'No official editorial published for this problem yet.'}
                  </div>
                </div>
              )}

              {activeTab === 'submissions' && (
                <div className="space-y-2">
                  <h3 className="font-bold text-[var(--text-main)]">Your Past Submissions</h3>
                  {submissionsList.length === 0 ? (
                    <p className="text-[var(--text-muted)]">No submissions recorded yet for this problem.</p>
                  ) : (
                    submissionsList.map((sub, i) => (
                      <div key={i} className="p-2.5 rounded-lg border border-[var(--border-color)] bg-[var(--bg-subtle)] flex items-center justify-between text-[11px]">
                        <div>
                          <span className={`font-semibold ${sub.verdict === 'Accepted' ? 'text-emerald-500' : 'text-rose-500'}`}>
                            {sub.verdict}
                          </span>
                          <span className="text-[var(--text-muted)] ml-2">({sub.language})</span>
                        </div>
                        <div className="text-[var(--text-muted)] font-mono">
                          {sub.runtime_ms}ms · {new Date(sub.created_at).toLocaleTimeString()}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Center / Right Split: Code Editor and Test Results */}
        <div
          className={`${
            hideDescription ? 'col-span-12' : 'col-span-12 md:col-span-8'
          } flex flex-col h-full overflow-hidden`}
        >
          {/* Editor Top Bar */}
          <div className="h-10 border-b border-[var(--border-color)] bg-[var(--bg-card)] px-3 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2">
              <select
                value={language}
                onChange={e => handleLanguageChange(e.target.value as any)}
                className="px-2.5 py-1 rounded-md border border-[var(--border-color)] bg-[var(--bg-subtle)] text-xs text-[var(--text-main)] font-medium focus:outline-hidden"
              >
                <option value="javascript">JavaScript (Node.js)</option>
                <option value="python">Python 3</option>
                <option value="cpp">C++ (GCC)</option>
                <option value="java">Java 17</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleResetCode}
                className="flex items-center gap-1 text-[11px] text-[var(--text-muted)] hover:text-[var(--text-main)]"
                title="Reset to starter template"
              >
                <RotateCcw size={12} /> Reset
              </button>
            </div>
          </div>

          {/* Monaco Editor Canvas */}
          <div 
            onClick={() => {
              if (editorRef.current) {
                editorRef.current.focus();
              }
            }}
            className={`flex-1 min-h-[300px] overflow-hidden ${hideOutput ? 'h-full' : 'h-[60%]'}`}
          >
            <Editor
              height="100%"
              language={language === 'cpp' ? 'cpp' : language}
              value={code}
              onChange={val => setCode(val || '')}
              theme={theme === 'dark' ? 'vs-dark' : 'light'}
              onMount={(editor, monaco) => {
                editorRef.current = editor;
                editor.focus();
                // Add keybinding so Ctrl+A only selects editor contents
                editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyA, () => {
                  const model = editor.getModel();
                  if (model) {
                    editor.setSelection(model.getFullModelRange());
                  }
                });
              }}
              options={{
                readOnly: false,
                domReadOnly: false,
                editContext: false,
                fontSize: 13.5,
                fontFamily: "'JetBrains Mono', Consolas, monospace",
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                tabSize: 2,
                automaticLayout: true,
                padding: { top: 10 },
                cursorBlinking: 'smooth',
                cursorSmoothCaretAnimation: 'on',
                formatOnPaste: true,
                suggestOnTriggerCharacters: true
              }}
            />
          </div>

          {/* Bottom Pane: Test Cases & Terminal Output */}
          {!hideOutput && (
            <div className="h-[40%] border-t border-[var(--border-color)] bg-[var(--bg-card)] flex flex-col overflow-hidden">
              {/* Output Tabs */}
              <div className="h-9 border-b border-[var(--border-color)] bg-[var(--bg-subtle)] px-3 flex items-center gap-2 shrink-0">
                <button
                  onClick={() => setBottomTab('output')}
                  className={`px-3 py-1 rounded text-xs font-semibold transition-colors ${
                    bottomTab === 'output' ? 'bg-[var(--bg-card)] text-[var(--text-main)] shadow-xs' : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
                  }`}
                >
                  Test Results
                </button>
                <button
                  onClick={() => setBottomTab('custom')}
                  className={`px-3 py-1 rounded text-xs font-semibold transition-colors ${
                    bottomTab === 'custom' ? 'bg-[var(--bg-card)] text-[var(--text-main)] shadow-xs' : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
                  }`}
                >
                  Custom Testcase
                </button>
              </div>

              {/* Console & Verdict Body */}
              <div className="flex-1 overflow-y-auto p-3 text-xs font-mono">
                {bottomTab === 'output' && (
                  <div>
                    {!executionResult && !executing && (
                      <p className="text-[var(--text-muted)] italic">
                        Click 'Run' to evaluate sample test cases or 'Submit' to judge all test cases against the sandbox.
                      </p>
                    )}

                    {executing && (
                      <div className="flex items-center gap-2 text-indigo-600 dark:text-emerald-400">
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent" />
                        <span>Running sandboxed test evaluation...</span>
                      </div>
                    )}

                    {executionResult && !executing && (
                      <div className="space-y-3">
                        <div className="flex items-center justify-between pb-2 border-b border-[var(--border-color)]">
                          <div className="flex items-center gap-2">
                            <span
                              className={`text-sm font-bold ${
                                executionResult.verdict === 'Accepted'
                                  ? 'text-emerald-500'
                                  : 'text-rose-500'
                              }`}
                            >
                              {executionResult.verdict}
                            </span>
                            {executionResult.isSampleRun && (
                              <span className="text-[10px] uppercase px-1.5 py-0.5 rounded bg-[var(--bg-subtle)] text-[var(--text-muted)]">
                                Sample Run
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-[var(--text-muted)]">
                            Runtime: <span className="font-semibold text-[var(--text-main)]">{executionResult.runtimeMs}ms</span> · 
                            Passed: <span className="font-semibold text-[var(--text-main)]">{executionResult.passedTestCases}/{executionResult.totalTestCases}</span>
                          </div>
                        </div>

                        {/* Test details list */}
                        <div className="space-y-2">
                          {executionResult.details?.map((tc, idx) => (
                            <div
                              key={idx}
                              className={`p-2.5 rounded-lg border text-[11px] ${
                                tc.ok
                                  ? 'border-emerald-500/30 bg-emerald-500/5 text-emerald-600 dark:text-emerald-400'
                                  : 'border-rose-500/30 bg-rose-500/5 text-rose-600 dark:text-rose-400'
                              }`}
                            >
                              <div className="flex items-center justify-between font-semibold">
                                <span>Case #{tc.testIndex} {tc.isHidden ? '(Hidden Test)' : ''}</span>
                                <span>{tc.ok ? '✔ Passed' : '✘ Failed'}</span>
                              </div>
                              {tc.args && !tc.isHidden && (
                                <div className="mt-1 text-[var(--text-muted)]">
                                  Input: <span className="text-[var(--text-main)]">{JSON.stringify(tc.args)}</span>
                                </div>
                              )}
                              {tc.expected === null || tc.expected === undefined ? (
                                <div className="text-[var(--text-muted)] mt-1">
                                  Your Output: <span className="text-emerald-500 font-semibold">{JSON.stringify(tc.got)}</span>
                                </div>
                              ) : (
                                !tc.ok && (
                                  <div className="text-[var(--text-muted)] mt-1">
                                    Expected: <span className="text-emerald-500">{JSON.stringify(tc.expected)}</span> | Got: <span className="text-rose-500">{JSON.stringify(tc.got)}</span>
                                  </div>
                                )
                              )}
                              {tc.error && (
                                <div className="mt-1 p-1.5 rounded bg-rose-500/10 text-rose-500 text-[10px]">
                                  {tc.error}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {bottomTab === 'custom' && (
                  <div className="space-y-3">
                    {/* Input Suggestions & One-Click Presets */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-semibold text-[var(--text-muted)]">
                          Quick Input Suggestions (1-Click Fill & Run):
                        </span>
                        <span className="text-[10px] text-indigo-600 dark:text-emerald-400 font-mono">
                          Format: JSON / Comma-separated
                        </span>
                      </div>
                      
                      <div className="flex flex-wrap gap-1.5">
                        {problem?.examples?.map((ex, idx) => {
                          const cleanVal = ex.input.includes('=') ? ex.input.replace(/^[a-zA-Z0-9_\s]+=\s*/, '') : ex.input;
                          return (
                            <button
                              key={idx}
                              onClick={() => {
                                setCustomInput(cleanVal);
                              }}
                              className="px-2.5 py-1 rounded-md text-[11px] font-mono border border-[var(--border-color)] bg-[var(--bg-subtle)] hover:border-indigo-500 dark:hover:border-emerald-500 hover:text-indigo-600 dark:hover:text-emerald-400 transition-colors cursor-pointer text-left truncate max-w-[200px]"
                              title={`Load Example #${idx + 1}: ${ex.input}`}
                            >
                              Example #{idx + 1}
                            </button>
                          );
                        })}

                        {/* Numbers Only Quick Option */}
                        <button
                          onClick={() => {
                            setCustomInput('[1, 2, 3, 4, 5, 10], 15');
                          }}
                          className="px-2.5 py-1 rounded-md text-[11px] font-mono border border-indigo-500/30 bg-indigo-50/50 dark:bg-emerald-950/30 text-indigo-700 dark:text-emerald-400 font-semibold hover:scale-105 transition-all cursor-pointer"
                          title="Generate numbers-only array input"
                        >
                          🔢 Numbers Only Preset
                        </button>

                        <button
                          onClick={() => {
                            setCustomInput('[100, 250, 300, 450, 600], 700');
                          }}
                          className="px-2.5 py-1 rounded-md text-[11px] font-mono border border-indigo-500/30 bg-indigo-50/50 dark:bg-emerald-950/30 text-indigo-700 dark:text-emerald-400 font-semibold hover:scale-105 transition-all cursor-pointer"
                          title="Generate large numbers preset"
                        >
                          🔢 Large Numbers Preset
                        </button>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <label className="block text-[var(--text-muted)] font-sans text-xs">
                          Input Arguments (e.g. <code>[2, 7, 11, 15], 9</code>):
                        </label>
                        {customInput && (
                          <button
                            onClick={() => setCustomInput('')}
                            className="text-[10px] text-rose-500 hover:underline cursor-pointer"
                          >
                            Clear
                          </button>
                        )}
                      </div>
                      <textarea
                        value={customInput}
                        onChange={e => setCustomInput(e.target.value)}
                        placeholder="[2, 7, 11, 15], 9"
                        className="w-full h-20 p-2.5 rounded-lg border border-[var(--border-color)] bg-[var(--bg-subtle)] text-[var(--text-main)] outline-hidden font-mono text-xs focus:border-indigo-500 dark:focus:border-emerald-500 transition-colors"
                      />
                    </div>

                    <div className="flex items-center gap-2 pt-1">
                      <button
                        onClick={handleRun}
                        disabled={executing}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 dark:bg-emerald-500 dark:hover:bg-emerald-600 text-white font-sans text-xs font-semibold cursor-pointer shadow-xs transition-colors disabled:opacity-50"
                      >
                        <Play size={13} className="fill-white" />
                        <span>{executing ? 'Evaluating...' : 'Run with Custom Input'}</span>
                      </button>

                      <span className="text-[11px] text-[var(--text-muted)]">
                        Output will appear instantly in Test Results tab.
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
