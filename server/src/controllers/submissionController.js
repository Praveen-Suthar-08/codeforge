import crypto from 'crypto';
import { db } from '../db/connection.js';
import { judgeQueue } from '../services/judgeQueue.js';

export async function runCode(req, res) {
  const { problemId, code, language = 'javascript', customInput } = req.body;
  if (!problemId || !code) {
    return res.status(400).json({ error: 'problemId and code are required' });
  }

  const problem = db.prepare('SELECT function_name, test_cases FROM problems WHERE id = ?').get(problemId);
  if (!problem) {
    return res.status(404).json({ error: 'Problem not found' });
  }

  let testCases = JSON.parse(problem.test_cases || '[]');
  // For 'Run', evaluate against first 2 sample test cases or custom input
  if (customInput !== undefined && customInput !== null && customInput.trim() !== '') {
    const raw = customInput.trim();
    const expectedArgCount = testCases.length > 0 && Array.isArray(testCases[0].args) ? testCases[0].args.length : 1;
    let finalArgs;

    try {
      // 1. Try parsing directly
      const direct = JSON.parse(raw);
      if (Array.isArray(direct)) {
        if (direct.length === expectedArgCount) {
          finalArgs = direct;
        } else {
          finalArgs = [direct];
        }
      } else {
        finalArgs = [direct];
      }
    } catch {
      // 2. Try wrapping in array in case user entered comma-separated arguments: e.g. [2,7,11,15], 9
      try {
        const wrapped = JSON.parse(`[${raw}]`);
        finalArgs = wrapped;
      } catch {
        finalArgs = [raw];
      }
    }

    testCases = [{ args: finalArgs, expected: null, is_hidden: false }];
  } else {
    testCases = testCases.slice(0, 2);
  }

  try {
    const queuePosition = judgeQueue.getQueueLength();
    const result = await judgeQueue.enqueue({
      code,
      language,
      functionName: problem.function_name,
      testCases,
      timeoutMs: 3000
    });

    return res.json({
      ...result,
      isSampleRun: true,
      queuePosition
    });
  } catch (err) {
    return res.status(500).json({ error: 'Execution engine error', message: err.message });
  }
}

export async function runPlaygroundCode(req, res) {
  const { code, language = 'python', stdin = '' } = req.body;
  if (!code) {
    return res.status(400).json({ error: 'code is required' });
  }

  try {
    const result = await judgeQueue.enqueue({
      code,
      language,
      testCases: [],
      timeoutMs: 3500
    });

    return res.json(result);
  } catch (err) {
    return res.status(500).json({ error: 'Execution failed', message: err.message });
  }
}

export async function submitCode(req, res) {
  const { problemId, code, language = 'javascript' } = req.body;
  if (!problemId || !code) {
    return res.status(400).json({ error: 'problemId and code are required' });
  }

  const problem = db.prepare('SELECT function_name, test_cases FROM problems WHERE id = ?').get(problemId);
  if (!problem) {
    return res.status(404).json({ error: 'Problem not found' });
  }

  const testCases = JSON.parse(problem.test_cases || '[]');

  try {
    const result = await judgeQueue.enqueue({
      code,
      language,
      functionName: problem.function_name,
      testCases,
      timeoutMs: 3000
    });

    const submissionId = crypto.randomUUID();
    const now = Date.now();

    db.prepare(`
      INSERT INTO submissions (
        id, user_id, problem_id, language, code, verdict,
        runtime_ms, memory_kb, passed_test_cases, total_test_cases,
        details, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      submissionId,
      req.user.id,
      problemId,
      language,
      code,
      result.verdict,
      result.runtimeMs,
      result.memoryKb,
      result.passedTestCases,
      result.totalTestCases,
      JSON.stringify(result.details),
      now
    );

    return res.json({
      submissionId,
      ...result
    });
  } catch (err) {
    return res.status(500).json({ error: 'Submission failed', message: err.message });
  }
}

export async function getSubmissions(req, res) {
  const { problemId } = req.query;
  let query = 'SELECT id, user_id, problem_id, language, verdict, runtime_ms, memory_kb, passed_test_cases, total_test_cases, created_at FROM submissions WHERE user_id = ?';
  const params = [req.user.id];

  if (problemId) {
    query += ' AND problem_id = ?';
    params.push(problemId);
  }
  query += ' ORDER BY created_at DESC LIMIT 50';

  const submissions = db.prepare(query).all(...params);
  return res.json({ submissions });
}

export async function getSubmissionDetail(req, res) {
  const { id } = req.params;
  const submission = db.prepare('SELECT * FROM submissions WHERE id = ? AND user_id = ?').get(id, req.user.id);
  if (!submission) return res.status(404).json({ error: 'Submission not found' });

  return res.json({
    submission: {
      ...submission,
      details: JSON.parse(submission.details || '[]')
    }
  });
}
