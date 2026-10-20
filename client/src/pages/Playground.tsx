import React, { useState, useRef, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import { Play, RotateCcw, Copy, Download, Share2, Terminal as TermIcon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { apiRequest } from '../services/api';

const STARTER_CODES: Record<string, string> = {
  javascript: `// In-browser JavaScript Runner
function main() {
  console.log("Hello from CodeForge Playground!");
  const fib = [0, 1];
  for (let i = 2; i < 10; i++) {
    fib[i] = fib[i - 1] + fib[i - 2];
  }
  console.log("Fibonacci:", fib);
}
main();`,
  python: `# Multi-Language Playground
def solve():
    message = "Hello, Pythonista!"
    print(message)
    squares = [x**2 for x in range(1, 8)]
    print("Squares:", squares)

solve()`,
  cpp: `// C++ Playground
#include <iostream>
#include <vector>

using namespace std;

int main() {
    cout << "Hello from C++ Playground!" << endl;
    vector<int> nums = {1, 2, 3, 4, 5};
    for(int n : nums) cout << n * 2 << " ";
    cout << endl;
    return 0;
}`,
  java: `// Java Playground
import java.util.*;

public class Main {
    public static void main(String[] args) {
        System.out.println("Hello from Java Playground!");
        List<String> list = Arrays.asList("Code", "Forge", "Pro");
        for (String s : list) System.out.println(s);
    }
}`
};

export const Playground: React.FC = () => {
  const { theme } = useAuth();
  const [lang, setLang] = useState('javascript');
  const [code, setCode] = useState(STARTER_CODES.javascript);
  const [stdin, setStdin] = useState('');
  const [output, setOutput] = useState('Press "Run Code" to execute in a secure isolated Web Worker sandbox.');
  const [isRunning, setIsRunning] = useState(false);

  const editorRef = useRef<any>(null);

  // Restore editor focus and layout when user returns to this tab/window
  useEffect(() => {
    const handleWindowFocus = () => {
      if (editorRef.current) {
        editorRef.current.layout();
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

  const handleLangChange = (newLang: string) => {
    setLang(newLang);
    setCode(STARTER_CODES[newLang] || '// Write code');
    if (editorRef.current) {
      setTimeout(() => editorRef.current?.focus(), 50);
    }
  };

  const runCodeInWorker = async () => {
    setIsRunning(true);
    setOutput('Running code...');

    const currentCode = editorRef.current ? editorRef.current.getValue() : code;
    setCode(currentCode);

    if (lang === 'javascript') {
      // Execute in Web Worker with execution timeout
      const workerCode = `
        self.onmessage = function(e) {
          const logs = [];
          const customConsole = {
            log: (...args) => logs.push(args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' ')),
            error: (...args) => logs.push('[ERROR] ' + args.join(' ')),
            warn: (...args) => logs.push('[WARN] ' + args.join(' '))
          };
          try {
            const fn = new Function('console', e.data.code);
            fn(customConsole);
            self.postMessage({ success: true, output: logs.join('\\n') });
          } catch(err) {
            self.postMessage({ success: false, output: err.message });
          }
        };
      `;

      const blob = new Blob([workerCode], { type: 'application/javascript' });
      const worker = new Worker(URL.createObjectURL(blob));

      const timeout = setTimeout(() => {
        worker.terminate();
        setOutput('Error: Execution Timed Out (> 3000ms). Infinite loop prevented.');
        setIsRunning(false);
        if (editorRef.current) editorRef.current.focus();
      }, 3000);

      worker.onmessage = (e) => {
        clearTimeout(timeout);
        setOutput(e.data.output || '(No output returned)');
        setIsRunning(false);
        worker.terminate();
        if (editorRef.current) editorRef.current.focus();
      };

      worker.onerror = (e) => {
        clearTimeout(timeout);
        setOutput('Worker Error: ' + e.message);
        setIsRunning(false);
        worker.terminate();
        if (editorRef.current) editorRef.current.focus();
      };

      worker.postMessage({ code: currentCode });
    } else {
      // Python, C++, Java executed via backend sandbox
      try {
        const res = await apiRequest<{ output: string; verdict: string; runtimeMs: number }>('/submissions/playground', {
          method: 'POST',
          body: JSON.stringify({ code: currentCode, language: lang, stdin })
        });
        setOutput(res.output || `Execution verdict: ${res.verdict}`);
      } catch (err: any) {
        setOutput(`Execution Error: ${err.message || 'Failed to execute script'}`);
      } finally {
        setIsRunning(false);
        if (editorRef.current) editorRef.current.focus();
      }
    }
  };

  const copyOutput = () => {
    navigator.clipboard.writeText(output);
    alert('Output copied to clipboard');
  };

  const downloadCode = () => {
    const ext = lang === 'javascript' ? 'js' : lang === 'python' ? 'py' : lang === 'cpp' ? 'cpp' : 'java';
    const blob = new Blob([code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `codeforge-snippet.${ext}`;
    a.click();
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden p-4 sm:p-6 max-w-7xl mx-auto w-full">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 shrink-0 select-none">
        <div>
          <h1 className="text-xl font-bold text-[var(--text-main)] flex items-center gap-2">
            <TermIcon size={20} className="text-indigo-600 dark:text-emerald-400" />
            Online Multi-Language Compiler & Playground
          </h1>
          <p className="text-xs text-[var(--text-muted)]">
            Run untrusted code safely inside a Web Worker sandbox with automatic loop timeout detection.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={lang}
            onChange={e => handleLangChange(e.target.value)}
            className="px-3 py-1.5 rounded-lg border border-[var(--border-color)] bg-[var(--bg-card)] text-xs text-[var(--text-main)] font-medium focus:outline-hidden"
          >
            <option value="javascript">JavaScript (Web Worker Sandbox)</option>
            <option value="python">Python 3</option>
            <option value="cpp">C++ (GCC 13)</option>
            <option value="java">Java (OpenJDK 17)</option>
          </select>

          <button
            onClick={() => handleLangChange(lang)}
            className="p-2 rounded-lg border border-[var(--border-color)] bg-[var(--bg-card)] text-[var(--text-muted)] hover:text-[var(--text-main)]"
            title="Reset code"
          >
            <RotateCcw size={14} />
          </button>
          <button
            onClick={downloadCode}
            className="p-2 rounded-lg border border-[var(--border-color)] bg-[var(--bg-card)] text-[var(--text-muted)] hover:text-[var(--text-main)]"
            title="Download snippet"
          >
            <Download size={14} />
          </button>
          <button
            disabled={isRunning}
            onClick={runCodeInWorker}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 dark:bg-emerald-500 dark:hover:bg-emerald-600 text-white text-xs font-semibold disabled:opacity-50 transition-colors shadow-xs"
          >
            <Play size={13} className="fill-white" />
            <span>{isRunning ? 'Running...' : 'Run Code'}</span>
          </button>
        </div>
      </div>

      {/* Editor & Console Split */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-4 overflow-hidden">
        {/* Editor Pane */}
        <div className="col-span-12 lg:col-span-7 rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] overflow-hidden flex flex-col shadow-xs">
          <div className="px-3 py-2 border-b border-[var(--border-color)] bg-[var(--bg-subtle)] text-xs font-semibold text-[var(--text-muted)] flex items-center justify-between">
            <span>Source Code ({lang})</span>
          </div>
          <div 
            onClick={() => {
              if (editorRef.current) {
                editorRef.current.focus();
              }
            }}
            className="flex-1 min-h-[300px]"
          >
            <Editor
              height="100%"
              language={lang === 'cpp' ? 'cpp' : lang}
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
                cursorBlinking: 'smooth',
                cursorSmoothCaretAnimation: 'on',
                formatOnPaste: true,
                suggestOnTriggerCharacters: true
              }}
            />
          </div>
        </div>

        {/* Output & Stdin Pane */}
        <div className="col-span-12 lg:col-span-5 flex flex-col gap-4 overflow-hidden">
          {/* Stdin */}
          <div className="h-32 rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] overflow-hidden flex flex-col shadow-xs shrink-0">
            <div className="px-3 py-1.5 border-b border-[var(--border-color)] bg-[var(--bg-subtle)] text-xs font-semibold text-[var(--text-muted)]">
              Input (stdin)
            </div>
            <textarea
              value={stdin}
              onChange={e => setStdin(e.target.value)}
              placeholder="Provide standard input here..."
              className="flex-1 p-3 bg-transparent text-xs font-mono outline-hidden resize-none text-[var(--text-main)]"
            />
          </div>

          {/* Console Output */}
          <div className="flex-1 rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] overflow-hidden flex flex-col shadow-xs">
            <div className="px-3 py-2 border-b border-[var(--border-color)] bg-[var(--bg-subtle)] text-xs font-semibold text-[var(--text-muted)] flex items-center justify-between">
              <span>Standard Output (stdout)</span>
              <button onClick={copyOutput} className="hover:text-[var(--text-main)] flex items-center gap-1 text-[11px]">
                <Copy size={12} /> Copy
              </button>
            </div>
            <pre className="flex-1 p-3 bg-[var(--bg-subtle)] text-xs font-mono overflow-auto whitespace-pre-wrap text-[var(--text-main)] leading-relaxed">
              {output}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};
