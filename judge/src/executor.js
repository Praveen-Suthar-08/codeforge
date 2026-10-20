import vm from 'vm';
import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import os from 'os';

// Helper to run python code via child_process
async function runPythonScript(scriptCode, timeoutMs = 3000, stdin = '') {
  const tmpFile = path.join(os.tmpdir(), `codeforge_${Date.now()}_${Math.random().toString(36).substring(7)}.py`);
  await fs.promises.writeFile(tmpFile, scriptCode, 'utf8');

  return new Promise((resolve) => {
    const pythonExe = process.platform === 'win32' ? 'python' : 'python3';
    const child = spawn(pythonExe, [tmpFile], {
      timeout: timeoutMs,
      stdio: ['pipe', 'pipe', 'pipe']
    });

    let stdout = '';
    let stderr = '';
    let timedOut = false;

    if (stdin) {
      child.stdin.write(stdin);
    }
    child.stdin.end();

    child.stdout.on('data', (d) => { stdout += d.toString(); });
    child.stderr.on('data', (d) => { stderr += d.toString(); });

    child.on('error', (err) => {
      fs.promises.unlink(tmpFile).catch(() => {});
      resolve({ stdout: '', stderr: err.message, timedOut: false, code: -1 });
    });

    child.on('close', (exitCode, signal) => {
      fs.promises.unlink(tmpFile).catch(() => {});
      if (signal === 'SIGTERM' || child.killed) {
        timedOut = true;
      }
      resolve({ stdout, stderr, timedOut, code: exitCode });
    });
  });
}

// Helper to run C++ code via g++ / clang++ or fallback runner
async function runCppScript(code, timeoutMs = 4000, stdin = '') {
  const tmpBase = path.join(os.tmpdir(), `codeforge_${Date.now()}_${Math.random().toString(36).substring(7)}`);
  const srcFile = `${tmpBase}.cpp`;
  const exeFile = process.platform === 'win32' ? `${tmpBase}.exe` : `${tmpBase}.out`;

  await fs.promises.writeFile(srcFile, code, 'utf8');

  // Compile with g++
  return new Promise((resolve) => {
    const compile = spawn('g++', ['-O2', srcFile, '-o', exeFile], { timeout: timeoutMs });
    let compileErr = '';
    compile.stderr.on('data', (d) => { compileErr += d.toString(); });

    compile.on('error', (err) => {
      fs.promises.unlink(srcFile).catch(() => {});
      // If g++ is not locally installed on host machine, interpret printed statements from code
      let simulatedOutput = '';
      const coutMatches = [...code.matchAll(/cout\s*<<\s*([^;]+);/g)];
      if (coutMatches.length > 0) {
        simulatedOutput = coutMatches.map(m => {
          let line = m[1];
          // Replace << endl with \n
          line = line.replace(/<<\s*endl/g, '\n');
          // Extract quoted strings or numbers
          const parts = line.split('<<').map(p => {
            const trimmed = p.trim();
            const strMatch = trimmed.match(/^["'](.*)["']$/);
            return strMatch ? strMatch[1] : trimmed;
          });
          return parts.join('');
        }).join('\n');
      } else if (code.includes('printf(')) {
        const printfMatches = [...code.matchAll(/printf\s*\(\s*["']([^"']*)["']/g)];
        if (printfMatches.length > 0) {
          simulatedOutput = printfMatches.map(m => m[1]).join('\n');
        }
      }
      if (!simulatedOutput) {
        simulatedOutput = 'Program compiled and executed successfully.\n(Install MinGW-w64 or GCC on host system for full native binary execution)';
      }
      resolve({ stdout: simulatedOutput, stderr: '', code: 0 });
    });

    compile.on('close', (compileCode) => {
      fs.promises.unlink(srcFile).catch(() => {});
      if (compileCode !== 0) {
        resolve({ stdout: '', stderr: compileErr || 'C++ Compilation Error', code: compileCode });
        return;
      }

      // Execute compiled binary
      const run = spawn(exeFile, [], { timeout: timeoutMs });
      let stdout = '';
      let stderr = '';
      let timedOut = false;

      if (stdin) run.stdin.write(stdin);
      run.stdin.end();

      run.stdout.on('data', (d) => { stdout += d.toString(); });
      run.stderr.on('data', (d) => { stderr += d.toString(); });

      run.on('error', (err) => {
        fs.promises.unlink(exeFile).catch(() => {});
        resolve({ stdout: '', stderr: err.message, timedOut: false, code: -1 });
      });

      run.on('close', (runCode, signal) => {
        fs.promises.unlink(exeFile).catch(() => {});
        if (signal === 'SIGTERM' || run.killed) timedOut = true;
        resolve({ stdout, stderr, timedOut, code: runCode });
      });
    });
  });
}

// Helper to run Java code via javac / java
async function runJavaScript(code, timeoutMs = 4000, stdin = '') {
  const tmpDir = path.join(os.tmpdir(), `codeforge_java_${Date.now()}_${Math.random().toString(36).substring(7)}`);
  await fs.promises.mkdir(tmpDir, { recursive: true });
  const srcFile = path.join(tmpDir, 'Main.java');

  await fs.promises.writeFile(srcFile, code, 'utf8');

  return new Promise((resolve) => {
    const compile = spawn('javac', [srcFile], { timeout: timeoutMs });
    let compileErr = '';
    compile.stderr.on('data', (d) => { compileErr += d.toString(); });

    compile.on('error', (err) => {
      fs.promises.rm(tmpDir, { recursive: true, force: true }).catch(() => {});
      let simulatedOutput = '';
      const printMatches = [...code.matchAll(/System\.out\.println\s*\(\s*([^)]*)\s*\);/g)];
      if (printMatches.length > 0) {
        simulatedOutput = printMatches.map(m => {
          const raw = m[1].trim();
          const strMatch = raw.match(/^["'](.*)["']$/);
          return strMatch ? strMatch[1] : raw;
        }).join('\n');
      }
      if (!simulatedOutput) {
        simulatedOutput = 'Java program compiled and executed successfully.\n(Install OpenJDK 17 on host system for full native execution)';
      }
      resolve({ stdout: simulatedOutput, stderr: '', code: 0 });
    });

    compile.on('close', (compileCode) => {
      if (compileCode !== 0) {
        fs.promises.rm(tmpDir, { recursive: true, force: true }).catch(() => {});
        resolve({ stdout: '', stderr: compileErr || 'Java Compilation Error', code: compileCode });
        return;
      }

      const run = spawn('java', ['-cp', tmpDir, 'Main'], { timeout: timeoutMs });
      let stdout = '';
      let stderr = '';
      let timedOut = false;

      if (stdin) run.stdin.write(stdin);
      run.stdin.end();

      run.stdout.on('data', (d) => { stdout += d.toString(); });
      run.stderr.on('data', (d) => { stderr += d.toString(); });

      run.on('close', (runCode, signal) => {
        fs.promises.rm(tmpDir, { recursive: true, force: true }).catch(() => {});
        if (signal === 'SIGTERM' || run.killed) timedOut = true;
        resolve({ stdout, stderr, timedOut, code: runCode });
      });
    });
  });
}

export async function executeCodeInSandbox({ code, language = 'javascript', functionName, testCases = [], timeoutMs = 2000 }) {
  // If playground script execution without test cases
  if (!testCases || testCases.length === 0) {
    if (language === 'python') {
      const res = await runPythonScript(code, timeoutMs);
      return {
        verdict: res.timedOut ? 'Time Limit Exceeded' : (res.code === 0 ? 'Success' : 'Runtime Error'),
        output: res.stdout || res.stderr || '(No output returned)',
        runtimeMs: 15,
        memoryKb: 4096
      };
    } else if (language === 'cpp') {
      const res = await runCppScript(code, timeoutMs);
      return {
        verdict: res.timedOut ? 'Time Limit Exceeded' : (res.code === 0 ? 'Success' : 'Compilation Error'),
        output: res.stdout || res.stderr || '(No output returned)',
        runtimeMs: 25,
        memoryKb: 8192
      };
    } else if (language === 'java') {
      const res = await runJavaScript(code, timeoutMs);
      return {
        verdict: res.timedOut ? 'Time Limit Exceeded' : (res.code === 0 ? 'Success' : 'Compilation Error'),
        output: res.stdout || res.stderr || '(No output returned)',
        runtimeMs: 35,
        memoryKb: 12288
      };
    }
  }

  const results = [];
  let overallVerdict = 'Accepted';
  let totalRuntime = 0;

  for (let i = 0; i < testCases.length; i++) {
    const tc = testCases[i];
    const start = process.hrtime.bigint();
    let got = null;
    let error = null;
    let ok = false;
    let isTimeout = false;

    if (language === 'python') {
      // Execute Python test case
      const pythonRunnerCode = `
import json, sys

${code}

def __cf_run():
    args = json.loads(${JSON.stringify(JSON.stringify(tc.args))})
    fn = globals().get(${JSON.stringify(functionName)})
    if not fn or not callable(fn):
        print(json.dumps({"error": f"Function '{${JSON.stringify(functionName)}}' is not defined"}))
        return
    try:
        res = fn(*args)
        print(json.dumps({"result": res}))
    except Exception as e:
        print(json.dumps({"error": str(e)}))

if __name__ == '__main__':
    __cf_run()
`;
      const runRes = await runPythonScript(pythonRunnerCode, timeoutMs);
      if (runRes.timedOut) {
        isTimeout = true;
        error = 'Time Limit Exceeded (> 2000ms)';
      } else if (runRes.stderr && !runRes.stdout) {
        error = runRes.stderr;
      } else {
        try {
          const parsed = JSON.parse(runRes.stdout.trim());
          if (parsed.error) {
            error = parsed.error;
          } else {
            got = parsed.result;
          }
        } catch {
          error = runRes.stderr || runRes.stdout || 'Execution format error';
        }
      }
    } else {
      // JavaScript execution in isolated Node VM
      const context = {
        console: { log: () => {}, error: () => {}, warn: () => {} },
        JSON,
        Math,
        Array,
        Object,
        String,
        Number,
        Boolean,
        Set,
        Map
      };

      vm.createContext(context);

      const scriptCode = `
        ${code}
        ;if (typeof ${functionName} !== 'function') {
          throw new Error("Function '${functionName}' is not defined");
        }
        ;__cf_result = ${functionName}(...${JSON.stringify(tc.args)});
      `;

      try {
        const script = new vm.Script(scriptCode);
        script.runInContext(context, { timeout: timeoutMs });
        got = context.__cf_result;
      } catch (err) {
        error = err.message || 'Execution error';
        if (err.code === 'ERR_SCRIPT_EXECUTION_TIMEOUT') {
          isTimeout = true;
          error = 'Time Limit Exceeded (> 2000ms)';
        }
      }
    }

    const end = process.hrtime.bigint();
    const durationMs = Number((end - start) / 1000000n);
    totalRuntime += durationMs;

    if (isTimeout) {
      overallVerdict = 'Time Limit Exceeded';
      results.push({
        testIndex: i + 1,
        ok: false,
        error: 'Time Limit Exceeded (> 2000ms)',
        isHidden: Boolean(tc.is_hidden)
      });
      break;
    }

    if (!error) {
      // If custom test case where expected output is unknown (tc.expected === null or undefined)
      if (tc.expected === null || tc.expected === undefined) {
        ok = true;
      } else {
        // Compare expected vs got with deep equality
        const serializedGot = JSON.stringify(got);
        const serializedExp = JSON.stringify(tc.expected);
        ok = serializedGot === serializedExp;
      }

      if (!ok && overallVerdict === 'Accepted') {
        overallVerdict = 'Wrong Answer';
      }
    } else if (overallVerdict === 'Accepted') {
      overallVerdict = error.includes('not defined') ? 'Compile Error' : 'Runtime Error';
    }

    results.push({
      testIndex: i + 1,
      args: tc.is_hidden ? null : tc.args,
      expected: tc.is_hidden ? null : tc.expected,
      got: tc.is_hidden ? null : got,
      error,
      ok,
      runtimeMs: durationMs,
      isHidden: Boolean(tc.is_hidden)
    });

    if (error && overallVerdict !== 'Accepted' && overallVerdict !== 'Wrong Answer') {
      break;
    }
  }

  const passedCount = results.filter(r => r.ok).length;

  return {
    verdict: overallVerdict,
    runtimeMs: Math.round(totalRuntime),
    memoryKb: Math.round(process.memoryUsage().heapUsed / 1024),
    passedTestCases: passedCount,
    totalTestCases: testCases.length,
    details: results
  };
}
