import test from 'node:test';
import assert from 'node:assert/strict';
import { executeCodeInSandbox } from '../../judge/src/executor.js';

test('Judge Sandbox - Correct Solution passes with Accepted', async () => {
  const code = `
    function twoSum(nums, target) {
      const map = new Map();
      for (let i = 0; i < nums.length; i++) {
        const comp = target - nums[i];
        if (map.has(comp)) return [map.get(comp), i];
        map.set(nums[i], i);
      }
      return [];
    }
  `;

  const testCases = [
    { args: [[2, 7, 11, 15], 9], expected: [0, 1], is_hidden: false },
    { args: [[3, 2, 4], 6], expected: [1, 2], is_hidden: false }
  ];

  const result = await executeCodeInSandbox({
    code,
    functionName: 'twoSum',
    testCases,
    timeoutMs: 1500
  });

  assert.equal(result.verdict, 'Accepted');
  assert.equal(result.passedTestCases, 2);
  assert.equal(result.totalTestCases, 2);
});

test('Judge Sandbox - Wrong Answer detected correctly', async () => {
  const code = `
    function twoSum(nums, target) {
      return [99, 99];
    }
  `;

  const testCases = [
    { args: [[2, 7, 11, 15], 9], expected: [0, 1], is_hidden: false }
  ];

  const result = await executeCodeInSandbox({
    code,
    functionName: 'twoSum',
    testCases,
    timeoutMs: 1500
  });

  assert.equal(result.verdict, 'Wrong Answer');
  assert.equal(result.passedTestCases, 0);
});

test('Judge Sandbox - Infinite Loop terminated with Time Limit Exceeded', async () => {
  const code = `
    function twoSum(nums, target) {
      while(true) {}
    }
  `;

  const testCases = [
    { args: [[2, 7, 11, 15], 9], expected: [0, 1], is_hidden: false }
  ];

  const result = await executeCodeInSandbox({
    code,
    functionName: 'twoSum',
    testCases,
    timeoutMs: 500
  });

  assert.equal(result.verdict, 'Time Limit Exceeded');
});
