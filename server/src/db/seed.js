import { db } from './connection.js';
import { runMigrations } from './migrate.js';
import argon2 from 'argon2';
import crypto from 'crypto';

export async function seedDatabase() {
  runMigrations();
  console.log('Seeding database with demo users, 30+ problems, roadmaps, and contests...');

  // 1. Seed Users (admin and standard user)
  const existingUser = db.prepare('SELECT id FROM users WHERE username = ?').get('admin');
  if (!existingUser) {
    const adminPasswordHash = await argon2.hash('Admin@CodeForge123!');
    const demoPasswordHash = await argon2.hash('User@CodeForge123!');
    const now = Date.now();

    const insertUser = db.prepare(`
      INSERT INTO users (id, username, email, password_hash, role, is_verified, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    insertUser.run(crypto.randomUUID(), 'admin', 'admin@codeforge.local', adminPasswordHash, 'admin', 1, now, now);
    insertUser.run(crypto.randomUUID(), 'demo', 'demo@codeforge.local', demoPasswordHash, 'user', 1, now, now);
    insertUser.run(crypto.randomUUID(), 'ada', 'ada@codeforge.local', demoPasswordHash, 'user', 1, now, now);
    insertUser.run(crypto.randomUUID(), 'linus', 'linus@codeforge.local', demoPasswordHash, 'user', 1, now, now);
    insertUser.run(crypto.randomUUID(), 'grace', 'grace@codeforge.local', demoPasswordHash, 'user', 1, now, now);
    console.log('Admin & Demo users seeded successfully.');
  }

  // 2. Seed 30+ Curated Problems
  const problemCount = db.prepare('SELECT COUNT(*) as count FROM problems').get().count;
  if (problemCount < 30) {
    const problems = [
      {
        id: 'two-sum',
        title: 'Two Sum',
        slug: 'two-sum',
        difficulty: 'Easy',
        points: 10,
        category: 'Arrays & Hashing',
        tags: ['array', 'hash-table'],
        companies: ['Google', 'Amazon', 'Meta'],
        function_name: 'twoSum',
        description: 'Given an array of integers <code>nums</code> and an integer <code>target</code>, return indices of the two numbers such that they add up to <code>target</code>. You may assume that each input would have exactly one solution, and you may not use the same element twice. Return indices sorted ascending.',
        examples: [{ input: 'nums = [2,7,11,15], target = 9', output: '[0,1]', explanation: 'Because nums[0] + nums[1] == 9, we return [0, 1].' }],
        starter_code: {
          javascript: 'function twoSum(nums, target) {\n  // Write your code here\n}',
          python: 'def twoSum(nums, target):\n    # Write your code here\n    pass',
          cpp: '#include <vector>\nusing namespace std;\n\nclass Solution {\npublic:\n    vector<int> twoSum(vector<int>& nums, int target) {\n        \n    }\n};',
          java: 'class Solution {\n    public int[] twoSum(int[] nums, int target) {\n        \n    }\n}'
        },
        hints: ['Try using a hash map to look up complements in O(1) time.'],
        editorial: 'A hash map stores elements visited so far mapped to their index. For each number x, check if (target - x) exists in the map.',
        test_cases: [
          { args: [[2, 7, 11, 15], 9], expected: [0, 1], is_hidden: false },
          { args: [[3, 2, 4], 6], expected: [1, 2], is_hidden: false },
          { args: [[3, 3], 6], expected: [0, 1], is_hidden: true },
          { args: [[1, 5, 8, 12, 3], 15], expected: [3, 4], is_hidden: true }
        ]
      },
      {
        id: 'valid-palindrome',
        title: 'Valid Palindrome',
        slug: 'valid-palindrome',
        difficulty: 'Easy',
        points: 10,
        category: 'Two Pointers',
        tags: ['string', 'two-pointers'],
        companies: ['Meta', 'Microsoft'],
        function_name: 'isPalindrome',
        description: 'A phrase is a palindrome if, after converting all uppercase letters into lowercase letters and removing all non-alphanumeric characters, it reads the same forward and backward. Alphanumeric characters include letters and numbers.',
        examples: [{ input: 's = "A man, a plan, a canal: Panama"', output: 'true', explanation: '"amanaplanacanalpanama" is a palindrome.' }],
        starter_code: {
          javascript: 'function isPalindrome(s) {\n  // Write your code here\n}',
          python: 'def isPalindrome(s):\n    pass',
          cpp: 'bool isPalindrome(string s) {\n    \n}',
          java: 'class Solution {\n    public boolean isPalindrome(String s) {\n        \n    }\n}'
        },
        hints: ['Two pointers from both ends moving inward.'],
        editorial: 'Clean the string or use two pointers with isalnum checks.',
        test_cases: [
          { args: ['A man, a plan, a canal: Panama'], expected: true, is_hidden: false },
          { args: ['race a car'], expected: false, is_hidden: false },
          { args: [' '], expected: true, is_hidden: true },
          { args: ['0P'], expected: false, is_hidden: true }
        ]
      },
      {
        id: 'valid-parentheses',
        title: 'Valid Parentheses',
        slug: 'valid-parentheses',
        difficulty: 'Easy',
        points: 10,
        category: 'Stack',
        tags: ['stack', 'string'],
        companies: ['Amazon', 'Bloomberg', 'Google'],
        function_name: 'isValid',
        description: 'Given a string <code>s</code> containing just the characters <code>(</code>, <code>)</code>, <code>{</code>, <code>}</code>, <code>[</code> and <code>]</code>, determine if the input string is valid.',
        examples: [{ input: 's = "()[]{}"', output: 'true', explanation: 'All brackets are properly matched and closed in order.' }],
        starter_code: {
          javascript: 'function isValid(s) {\n  // Write your code here\n}',
          python: 'def isValid(s):\n    pass',
          cpp: 'bool isValid(string s) {\n    \n}',
          java: 'class Solution {\n    public boolean isValid(String s) {\n        \n    }\n}'
        },
        hints: ['Use a stack. Push expected closers or match opening tags.'],
        editorial: 'A stack guarantees last-in-first-out pairing.',
        test_cases: [
          { args: ['()[]{}'], expected: true, is_hidden: false },
          { args: ['(]'], expected: false, is_hidden: false },
          { args: ['([)]'], expected: false, is_hidden: true },
          { args: ['{[]}'], expected: true, is_hidden: true }
        ]
      },
      {
        id: 'maximum-subarray',
        title: 'Maximum Subarray',
        slug: 'maximum-subarray',
        difficulty: 'Medium',
        points: 20,
        category: 'Dynamic Programming',
        tags: ['array', 'dp'],
        companies: ['Amazon', 'Apple', 'Microsoft'],
        function_name: 'maxSubArray',
        description: 'Given an integer array <code>nums</code>, find the subarray with the largest sum, and return its sum.',
        examples: [{ input: 'nums = [-2,1,-3,4,-1,2,1,-5,4]', output: '6', explanation: 'The subarray [4,-1,2,1] has the largest sum 6.' }],
        starter_code: {
          javascript: 'function maxSubArray(nums) {\n  // Kadane\'s algorithm\n}',
          python: 'def maxSubArray(nums):\n    pass',
          cpp: 'int maxSubArray(vector<int>& nums) {\n    \n}',
          java: 'class Solution {\n    public int maxSubArray(int[] nums) {\n        \n    }\n}'
        },
        hints: ['Look into Kadane’s algorithm.'],
        editorial: 'Maintain current running sum reset to 0 whenever it drops below 0.',
        test_cases: [
          { args: [[-2, 1, -3, 4, -1, 2, 1, -5, 4]], expected: 6, is_hidden: false },
          { args: [[1]], expected: 1, is_hidden: false },
          { args: [[5, 4, -1, 7, 8]], expected: 23, is_hidden: true },
          { args: [[-1]], expected: -1, is_hidden: true }
        ]
      },
      {
        id: 'longest-substring-without-repeating',
        title: 'Longest Substring Without Repeating Characters',
        slug: 'longest-substring-without-repeating',
        difficulty: 'Medium',
        points: 20,
        category: 'Sliding Window',
        tags: ['string', 'sliding-window'],
        companies: ['Amazon', 'Bloomberg', 'Meta'],
        function_name: 'lengthOfLongest',
        description: 'Given a string <code>s</code>, find the length of the longest substring without repeating characters.',
        examples: [{ input: 's = "abcabcbb"', output: '3', explanation: 'The answer is "abc", with the length of 3.' }],
        starter_code: {
          javascript: 'function lengthOfLongest(s) {\n  // Sliding window\n}',
          python: 'def lengthOfLongest(s):\n    pass',
          cpp: 'int lengthOfLongest(string s) {\n    \n}',
          java: 'class Solution {\n    public int lengthOfLongest(String s) {\n        \n    }\n}'
        },
        hints: ['Use a sliding window with a set or last-seen index map.'],
        editorial: 'Advance right pointer; if char is in set, contract left pointer.',
        test_cases: [
          { args: ['abcabcbb'], expected: 3, is_hidden: false },
          { args: ['bbbbb'], expected: 1, is_hidden: false },
          { args: ['pwwkew'], expected: 3, is_hidden: true },
          { args: [''], expected: 0, is_hidden: true }
        ]
      },
      {
        id: 'trapping-rain-water',
        title: 'Trapping Rain Water',
        slug: 'trapping-rain-water',
        difficulty: 'Hard',
        points: 40,
        category: 'Two Pointers',
        tags: ['array', 'two-pointers', 'dynamic-programming'],
        companies: ['Amazon', 'Goldman Sachs', 'Google'],
        function_name: 'trap',
        description: 'Given <code>n</code> non-negative integers representing an elevation map where the width of each bar is 1, compute how much water it can trap after raining.',
        examples: [{ input: 'height = [0,1,0,2,1,0,1,3,2,1,2,1]', output: '6', explanation: 'The elevation map traps 6 units of rain water.' }],
        starter_code: {
          javascript: 'function trap(height) {\n  // Two pointers or precomputed left/right max\n}',
          python: 'def trap(height):\n    pass',
          cpp: 'int trap(vector<int>& height) {\n    \n}',
          java: 'class Solution {\n    public int trap(int[] height) {\n        \n    }\n}'
        },
        hints: ['At each bar, trapped water is min(maxLeft, maxRight) - height.'],
        editorial: 'Keep track of leftMax and rightMax with two pointers moving inwards.',
        test_cases: [
          { args: [[0, 1, 0, 2, 1, 0, 1, 3, 2, 1, 2, 1]], expected: 6, is_hidden: false },
          { args: [[4, 2, 0, 3, 2, 5]], expected: 9, is_hidden: false },
          { args: [[1, 2, 3]], expected: 0, is_hidden: true },
          { args: [[]], expected: 0, is_hidden: true }
        ]
      },
      {
        id: 'reverse-linked-list',
        title: 'Reverse Linked List',
        slug: 'reverse-linked-list',
        difficulty: 'Easy',
        points: 10,
        category: 'Linked List',
        tags: ['linked-list', 'recursion'],
        companies: ['Amazon', 'Apple', 'Microsoft'],
        function_name: 'reverseList',
        description: 'Given an array representation of a linked list, return the reversed list.',
        examples: [{ input: 'head = [1,2,3,4,5]', output: '[5,4,3,2,1]', explanation: 'Reversed order of elements.' }],
        starter_code: {
          javascript: 'function reverseList(head) {\n  return head.reverse();\n}',
          python: 'def reverseList(head):\n    return head[::-1]',
          cpp: 'vector<int> reverseList(vector<int> head) {\n    \n}',
          java: 'class Solution {\n    public int[] reverseList(int[] head) {\n        \n    }\n}'
        },
        hints: ['Iterate through while tracking prev and next pointers.'],
        editorial: 'Standard 3-pointer reversal algorithm.',
        test_cases: [
          { args: [[1, 2, 3, 4, 5]], expected: [5, 4, 3, 2, 1], is_hidden: false },
          { args: [[1, 2]], expected: [2, 1], is_hidden: false },
          { args: [[]], expected: [], is_hidden: true }
        ]
      },
      {
        id: 'merge-two-sorted-lists',
        title: 'Merge Two Sorted Lists',
        slug: 'merge-two-sorted-lists',
        difficulty: 'Easy',
        points: 10,
        category: 'Linked List',
        tags: ['linked-list', 'sorting'],
        companies: ['Amazon', 'Meta', 'Google'],
        function_name: 'mergeTwoLists',
        description: 'Merge two sorted arrays <code>l1</code> and <code>l2</code> and return it as a single sorted array.',
        examples: [{ input: 'l1 = [1,2,4], l2 = [1,3,4]', output: '[1,1,2,3,4,4]', explanation: 'Merged sorted result.' }],
        starter_code: {
          javascript: 'function mergeTwoLists(l1, l2) {\n  // Two pointers merge\n}',
          python: 'def mergeTwoLists(l1, l2):\n    pass',
          cpp: 'vector<int> mergeTwoLists(vector<int> l1, vector<int> l2) {\n    \n}',
          java: 'class Solution {\n    public int[] mergeTwoLists(int[] l1, int[] l2) {\n        \n    }\n}'
        },
        hints: ['Compare heads of both arrays and push the smaller element.'],
        editorial: 'Standard linear merge step of mergesort.',
        test_cases: [
          { args: [[1, 2, 4], [1, 3, 4]], expected: [1, 1, 2, 3, 4, 4], is_hidden: false },
          { args: [[], []], expected: [], is_hidden: false },
          { args: [[], [0]], expected: [0], is_hidden: true }
        ]
      },
      {
        id: 'best-time-to-buy-and-sell-stock',
        title: 'Best Time to Buy and Sell Stock',
        slug: 'best-time-to-buy-and-sell-stock',
        difficulty: 'Easy',
        points: 10,
        category: 'Arrays & Hashing',
        tags: ['array', 'dynamic-programming'],
        companies: ['Amazon', 'Apple', 'Google'],
        function_name: 'maxProfit',
        description: 'You want to maximize your profit by choosing a single day to buy one stock and choosing a different day in the future to sell that stock. Return the maximum profit you can achieve.',
        examples: [{ input: 'prices = [7,1,5,3,6,4]', output: '5', explanation: 'Buy on day 2 (price = 1) and sell on day 5 (price = 6), profit = 6-1 = 5.' }],
        starter_code: {
          javascript: 'function maxProfit(prices) {\n  // Track minPrice and maxProfit\n}',
          python: 'def maxProfit(prices):\n    pass',
          cpp: 'int maxProfit(vector<int>& prices) {\n    \n}',
          java: 'class Solution {\n    public int maxProfit(int[] prices) {\n        \n    }\n}'
        },
        hints: ['Keep running track of minimum price encountered so far.'],
        editorial: 'Single pass tracking minimum buy price and maximum difference.',
        test_cases: [
          { args: [[7, 1, 5, 3, 6, 4]], expected: 5, is_hidden: false },
          { args: [[7, 6, 4, 3, 1]], expected: 0, is_hidden: false },
          { args: [[2, 4, 1]], expected: 2, is_hidden: true }
        ]
      },
      {
        id: 'contains-duplicate',
        title: 'Contains Duplicate',
        slug: 'contains-duplicate',
        difficulty: 'Easy',
        points: 10,
        category: 'Arrays & Hashing',
        tags: ['array', 'hash-table'],
        companies: ['Apple', 'Microsoft'],
        function_name: 'containsDuplicate',
        description: 'Given an integer array <code>nums</code>, return <code>true</code> if any value appears at least twice in the array, and return <code>false</code> if every element is distinct.',
        examples: [{ input: 'nums = [1,2,3,1]', output: 'true', explanation: '1 appears multiple times.' }],
        starter_code: {
          javascript: 'function containsDuplicate(nums) {\n  return new Set(nums).size !== nums.length;\n}',
          python: 'def containsDuplicate(nums):\n    return len(set(nums)) != len(nums)',
          cpp: 'bool containsDuplicate(vector<int>& nums) {\n    \n}',
          java: 'class Solution {\n    public boolean containsDuplicate(int[] nums) {\n        \n    }\n}'
        },
        hints: ['Use a HashSet to find duplicates in O(n) time.'],
        editorial: 'Set comparison yields O(n) time complexity and O(n) space.',
        test_cases: [
          { args: [[1, 2, 3, 1]], expected: true, is_hidden: false },
          { args: [[1, 2, 3, 4]], expected: false, is_hidden: false },
          { args: [[1, 1, 1, 3, 3, 4, 3, 2, 4, 2]], expected: true, is_hidden: true }
        ]
      },
      {
        id: 'valid-anagram',
        title: 'Valid Anagram',
        slug: 'valid-anagram',
        difficulty: 'Easy',
        points: 10,
        category: 'Arrays & Hashing',
        tags: ['string', 'hash-table'],
        companies: ['Google', 'Uber'],
        function_name: 'isAnagram',
        description: 'Given two strings <code>s</code> and <code>t</code>, return <code>true</code> if <code>t</code> is an anagram of <code>s</code>, and <code>false</code> otherwise.',
        examples: [{ input: 's = "anagram", t = "nagaram"', output: 'true', explanation: 'Both contain the exact same frequency of characters.' }],
        starter_code: {
          javascript: 'function isAnagram(s, t) {\n  // Count frequency or sort\n}',
          python: 'def isAnagram(s, t):\n    pass',
          cpp: 'bool isAnagram(string s, string t) {\n    \n}',
          java: 'class Solution {\n    public boolean isAnagram(String s, String t) {\n        \n    }\n}'
        },
        hints: ['Check lengths first, then count characters.'],
        editorial: 'Count frequency of characters in 26-size array or hash map.',
        test_cases: [
          { args: ['anagram', 'nagaram'], expected: true, is_hidden: false },
          { args: ['rat', 'car'], expected: false, is_hidden: false },
          { args: ['a', 'ab'], expected: false, is_hidden: true }
        ]
      },
      {
        id: 'binary-search',
        title: 'Binary Search',
        slug: 'binary-search',
        difficulty: 'Easy',
        points: 10,
        category: 'Binary Search',
        tags: ['binary-search', 'array'],
        companies: ['Google', 'Meta'],
        function_name: 'search',
        description: 'Given an array of integers <code>nums</code> which is sorted in ascending order, and an integer <code>target</code>, write a function to search target in <code>nums</code>. If target exists, then return its index. Otherwise, return -1.',
        examples: [{ input: 'nums = [-1,0,3,5,9,12], target = 9', output: '4', explanation: '9 exists in nums and its index is 4.' }],
        starter_code: {
          javascript: 'function search(nums, target) {\n  let l = 0, r = nums.length - 1;\n  while (l <= r) {\n    let m = Math.floor((l + r) / 2);\n    if (nums[m] === target) return m;\n    if (nums[m] < target) l = m + 1;\n    else r = m - 1;\n  }\n  return -1;\n}',
          python: 'def search(nums, target):\n    pass',
          cpp: 'int search(vector<int>& nums, int target) {\n    \n}',
          java: 'class Solution {\n    public int search(int[] nums, int target) {\n        \n    }\n}'
        },
        hints: ['Divide search space in half with low and high pointers.'],
        editorial: 'Standard O(log n) binary search.',
        test_cases: [
          { args: [[-1, 0, 3, 5, 9, 12], 9], expected: 4, is_hidden: false },
          { args: [[-1, 0, 3, 5, 9, 12], 2], expected: -1, is_hidden: false },
          { args: [[5], 5], expected: 0, is_hidden: true }
        ]
      },
      {
        id: 'climbing-stairs',
        title: 'Climbing Stairs',
        slug: 'climbing-stairs',
        difficulty: 'Easy',
        points: 10,
        category: 'Dynamic Programming',
        tags: ['dp', 'math'],
        companies: ['Amazon', 'Google'],
        function_name: 'climbStairs',
        description: 'You are climbing a staircase. It takes <code>n</code> steps to reach the top. Each time you can either climb 1 or 2 steps. In how many distinct ways can you climb to the top?',
        examples: [{ input: 'n = 3', output: '3', explanation: '1+1+1, 1+2, 2+1' }],
        starter_code: {
          javascript: 'function climbStairs(n) {\n  // Fibonacci progression\n}',
          python: 'def climbStairs(n):\n    pass',
          cpp: 'int climbStairs(int n) {\n    \n}',
          java: 'class Solution {\n    public int climbStairs(int n) {\n        \n    }\n}'
        },
        hints: ['ways(n) = ways(n-1) + ways(n-2).'],
        editorial: 'This is the Fibonacci sequence starting at fib(1)=1, fib(2)=2.',
        test_cases: [
          { args: [2], expected: 2, is_hidden: false },
          { args: [3], expected: 3, is_hidden: false },
          { args: [5], expected: 8, is_hidden: true },
          { args: [1], expected: 1, is_hidden: true }
        ]
      },
      {
        id: 'group-anagrams',
        title: 'Group Anagrams',
        slug: 'group-anagrams',
        difficulty: 'Medium',
        points: 20,
        category: 'Arrays & Hashing',
        tags: ['array', 'hash-table', 'string'],
        companies: ['Amazon', 'Meta'],
        function_name: 'groupAnagrams',
        description: 'Given an array of strings <code>strs</code>, group the anagrams together. You can return the answer in any order. For evaluation, outer and inner arrays are sorted.',
        examples: [{ input: 'strs = ["eat","tea","tan","ate","nat","bat"]', output: '[["bat"],["nat","tan"],["ate","eat","tea"]]', explanation: 'Grouped by anagram signature.' }],
        starter_code: {
          javascript: 'function groupAnagrams(strs) {\n  // Sort string as key or character count\n}',
          python: 'def groupAnagrams(strs):\n    pass',
          cpp: 'vector<vector<string>> groupAnagrams(vector<string>& strs) {\n    \n}',
          java: 'class Solution {\n    public List<List<String>> groupAnagrams(String[] strs) {\n        \n    }\n}'
        },
        hints: ['Use the sorted characters of each word as map key.'],
        editorial: 'Map with sorted key collects all matching anagram permutations.',
        test_cases: [
          { args: [['eat', 'tea', 'tan', 'ate', 'nat', 'bat']], expected: [['bat'], ['ate', 'eat', 'tea'], ['nat', 'tan']], is_hidden: false },
          { args: [['']], expected: [['']], is_hidden: false },
          { args: [['a']], expected: [['a']], is_hidden: true }
        ]
      },
      {
        id: 'product-of-array-except-self',
        title: 'Product of Array Except Self',
        slug: 'product-of-array-except-self',
        difficulty: 'Medium',
        points: 20,
        category: 'Arrays & Hashing',
        tags: ['array', 'prefix-sum'],
        companies: ['Amazon', 'Apple', 'Meta'],
        function_name: 'productExceptSelf',
        description: 'Given an integer array <code>nums</code>, return an array <code>answer</code> such that <code>answer[i]</code> is equal to the product of all the elements of <code>nums</code> except <code>nums[i]</code>. You must write an algorithm that runs in O(n) time and without using the division operation.',
        examples: [{ input: 'nums = [1,2,3,4]', output: '[24,12,8,6]', explanation: 'Result at each index is product of all other elements.' }],
        starter_code: {
          javascript: 'function productExceptSelf(nums) {\n  // Prefix and suffix products\n}',
          python: 'def productExceptSelf(nums):\n    pass',
          cpp: 'vector<int> productExceptSelf(vector<int>& nums) {\n    \n}',
          java: 'class Solution {\n    public int[] productExceptSelf(int[] nums) {\n        \n    }\n}'
        },
        hints: ['Compute prefix product array and suffix product array.'],
        editorial: 'Pass 1 builds prefix product; pass 2 accumulates postfix product directly into output.',
        test_cases: [
          { args: [[1, 2, 3, 4]], expected: [24, 12, 8, 6], is_hidden: false },
          { args: [[-1, 1, 0, -3, 3]], expected: [0, 0, 9, 0, 0], is_hidden: false },
          { args: [[4, 5]], expected: [5, 4], is_hidden: true }
        ]
      },
      {
        id: '3sum',
        title: '3Sum',
        slug: '3sum',
        difficulty: 'Medium',
        points: 20,
        category: 'Two Pointers',
        tags: ['array', 'two-pointers', 'sorting'],
        companies: ['Meta', 'Amazon', 'Google'],
        function_name: 'threeSum',
        description: 'Given an integer array nums, return all the triplets <code>[nums[i], nums[j], nums[k]]</code> such that <code>i != j</code>, <code>i != k</code>, and <code>j != k</code>, and <code>nums[i] + nums[j] + nums[k] == 0</code>. The solution set must not contain duplicate triplets.',
        examples: [{ input: 'nums = [-1,0,1,2,-1,-4]', output: '[[-1,-1,2],[-1,0,1]]', explanation: 'Two distinct triplets sum to 0.' }],
        starter_code: {
          javascript: 'function threeSum(nums) {\n  // Sort first, then two pointers\n}',
          python: 'def threeSum(nums):\n    pass',
          cpp: 'vector<vector<int>> threeSum(vector<int>& nums) {\n    \n}',
          java: 'class Solution {\n    public List<List<Int>> threeSum(int[] nums) {\n        \n    }\n}'
        },
        hints: ['Sort the array. Fix one element and run two-pointer Two Sum on remainder.'],
        editorial: 'O(n^2) complexity with duplicate skipping logic.',
        test_cases: [
          { args: [[-1, 0, 1, 2, -1, -4]], expected: [[-1, -1, 2], [-1, 0, 1]], is_hidden: false },
          { args: [[0, 1, 1]], expected: [], is_hidden: false },
          { args: [[0, 0, 0]], expected: [[0, 0, 0]], is_hidden: true }
        ]
      },
      {
        id: 'container-with-most-water',
        title: 'Container With Most Water',
        slug: 'container-with-most-water',
        difficulty: 'Medium',
        points: 20,
        category: 'Two Pointers',
        tags: ['array', 'two-pointers', 'greedy'],
        companies: ['Google', 'Amazon'],
        function_name: 'maxArea',
        description: 'You are given an integer array <code>height</code> of length <code>n</code>. Find two lines that together with the x-axis form a container, such that the container contains the most water. Return the maximum amount of water a container can store.',
        examples: [{ input: 'height = [1,8,6,2,5,4,8,3,7]', output: '49', explanation: 'Max water between indices 1 and 8: min(8,7) * 7 = 49.' }],
        starter_code: {
          javascript: 'function maxArea(height) {\n  // Two pointers from outer edges\n}',
          python: 'def maxArea(height):\n    pass',
          cpp: 'int maxArea(vector<int>& height) {\n    \n}',
          java: 'class Solution {\n    public int maxArea(int[] height) {\n        \n    }\n}'
        },
        hints: ['Start pointers at both ends. Move the pointer with the smaller height.'],
        editorial: 'Greedy approach ensures we only explore potentially larger areas.',
        test_cases: [
          { args: [[1, 8, 6, 2, 5, 4, 8, 3, 7]], expected: 49, is_hidden: false },
          { args: [[1, 1]], expected: 1, is_hidden: false },
          { args: [[4, 3, 2, 1, 4]], expected: 16, is_hidden: true }
        ]
      },
      {
        id: 'longest-consecutive-sequence',
        title: 'Longest Consecutive Sequence',
        slug: 'longest-consecutive-sequence',
        difficulty: 'Medium',
        points: 20,
        category: 'Arrays & Hashing',
        tags: ['array', 'hash-table', 'union-find'],
        companies: ['Google', 'Microsoft'],
        function_name: 'longestConsecutive',
        description: 'Given an unsorted array of integers <code>nums</code>, return the length of the longest consecutive elements sequence. You must write an algorithm that runs in O(n) time.',
        examples: [{ input: 'nums = [100,4,200,1,3,2]', output: '4', explanation: 'The longest consecutive elements sequence is [1, 2, 3, 4].' }],
        starter_code: {
          javascript: 'function longestConsecutive(nums) {\n  // Hash set start of streak check\n}',
          python: 'def longestConsecutive(nums):\n    pass',
          cpp: 'int longestConsecutive(vector<int>& nums) {\n    \n}',
          java: 'class Solution {\n    public int longestConsecutive(int[] nums) {\n        \n    }\n}'
        },
        hints: ['Only begin counting streak if num - 1 is not in the set.'],
        editorial: 'Checking set contains for start of sequence guarantees O(n) total work.',
        test_cases: [
          { args: [[100, 4, 200, 1, 3, 2]], expected: 4, is_hidden: false },
          { args: [[0, 3, 7, 2, 5, 8, 4, 6, 0, 1]], expected: 9, is_hidden: false },
          { args: [[]], expected: 0, is_hidden: true }
        ]
      },
      {
        id: 'search-in-rotated-sorted-array',
        title: 'Search in Rotated Sorted Array',
        slug: 'search-in-rotated-sorted-array',
        difficulty: 'Medium',
        points: 20,
        category: 'Binary Search',
        tags: ['binary-search', 'array'],
        companies: ['Amazon', 'Bloomberg', 'Google'],
        function_name: 'searchRotated',
        description: 'Given the array <code>nums</code> after the possible rotation and an integer <code>target</code>, return the index of <code>target</code> if it is in <code>nums</code>, or -1 if it is not.',
        examples: [{ input: 'nums = [4,5,6,7,0,1,2], target = 0', output: '4', explanation: '0 is found at index 4.' }],
        starter_code: {
          javascript: 'function searchRotated(nums, target) {\n  // Modified binary search\n}',
          python: 'def searchRotated(nums, target):\n    pass',
          cpp: 'int searchRotated(vector<int>& nums, int target) {\n    \n}',
          java: 'class Solution {\n    public int searchRotated(int[] nums, int target) {\n        \n    }\n}'
        },
        hints: ['One half of the rotated array is always strictly sorted.'],
        editorial: 'Find which half is sorted, check if target lies in that range.',
        test_cases: [
          { args: [[4, 5, 6, 7, 0, 1, 2], 0], expected: 4, is_hidden: false },
          { args: [[4, 5, 6, 7, 0, 1, 2], 3], expected: -1, is_hidden: false },
          { args: [[1], 0], expected: -1, is_hidden: true }
        ]
      },
      {
        id: 'find-minimum-in-rotated-sorted-array',
        title: 'Find Minimum in Rotated Sorted Array',
        slug: 'find-minimum-in-rotated-sorted-array',
        difficulty: 'Medium',
        points: 20,
        category: 'Binary Search',
        tags: ['binary-search', 'array'],
        companies: ['Amazon', 'Microsoft'],
        function_name: 'findMin',
        description: 'Given the sorted rotated array <code>nums</code> of unique elements, return the minimum element of this array. You must write an algorithm that runs in O(log n) time.',
        examples: [{ input: 'nums = [3,4,5,1,2]', output: '1', explanation: 'Original sorted array was [1,2,3,4,5] rotated 3 times.' }],
        starter_code: {
          javascript: 'function findMin(nums) {\n  // Binary search comparison against right\n}',
          python: 'def findMin(nums):\n    pass',
          cpp: 'int findMin(vector<int>& nums) {\n    \n}',
          java: 'class Solution {\n    public int findMin(int[] nums) {\n        \n    }\n}'
        },
        hints: ['Compare mid against right boundary.'],
        editorial: 'If nums[mid] > nums[right], pivot is to the right.',
        test_cases: [
          { args: [[3, 4, 5, 1, 2]], expected: 1, is_hidden: false },
          { args: [[4, 5, 6, 7, 0, 1, 2]], expected: 0, is_hidden: false },
          { args: [[11, 13, 15, 17]], expected: 11, is_hidden: true }
        ]
      },
      {
        id: 'invert-binary-tree',
        title: 'Invert Binary Tree',
        slug: 'invert-binary-tree',
        difficulty: 'Easy',
        points: 10,
        category: 'Trees',
        tags: ['tree', 'recursion', 'bfs'],
        companies: ['Google', 'Amazon'],
        function_name: 'invertTree',
        description: 'Given the root array representation of a binary tree, invert the tree and return its array representation.',
        examples: [{ input: 'root = [4,2,7,1,3,6,9]', output: '[4,7,2,9,6,3,1]', explanation: 'Left and right children recursively swapped.' }],
        starter_code: {
          javascript: 'function invertTree(tree) {\n  // Invert left and right subtrees\n}',
          python: 'def invertTree(tree):\n    pass',
          cpp: 'vector<int> invertTree(vector<int> tree) {\n    \n}',
          java: 'class Solution {\n    public int[] invertTree(int[] tree) {\n        \n    }\n}'
        },
        hints: ['Swap left and right children recursively.'],
        editorial: 'Post-order or pre-order traversal swapping children.',
        test_cases: [
          { args: [[4, 2, 7, 1, 3, 6, 9]], expected: [4, 7, 2, 9, 6, 3, 1], is_hidden: false },
          { args: [[2, 1, 3]], expected: [2, 3, 1], is_hidden: false },
          { args: [[]], expected: [], is_hidden: true }
        ]
      },
      {
        id: 'maximum-depth-of-binary-tree',
        title: 'Maximum Depth of Binary Tree',
        slug: 'maximum-depth-of-binary-tree',
        difficulty: 'Easy',
        points: 10,
        category: 'Trees',
        tags: ['tree', 'dfs', 'bfs'],
        companies: ['Amazon', 'Meta'],
        function_name: 'maxDepth',
        description: 'Given the binary tree represented by node count or height, return its maximum depth. Depth of an array heap representation is Math.floor(Math.log2(n)) + 1.',
        examples: [{ input: 'tree = [3,9,20,null,null,15,7]', output: '3', explanation: '3 levels from root to deepest leaf.' }],
        starter_code: {
          javascript: 'function maxDepth(tree) {\n  if (!tree || !tree.length) return 0;\n  return Math.floor(Math.log2(tree.length)) + 1;\n}',
          python: 'def maxDepth(tree):\n    pass',
          cpp: 'int maxDepth(vector<int> tree) {\n    \n}',
          java: 'class Solution {\n    public int maxDepth(int[] tree) {\n        \n    }\n}'
        },
        hints: ['Depth = 1 + max(depth(left), depth(right)).'],
        editorial: 'DFS depth traversal on binary tree.',
        test_cases: [
          { args: [[3, 9, 20, 15, 7]], expected: 3, is_hidden: false },
          { args: [[1]], expected: 1, is_hidden: false },
          { args: [[]], expected: 0, is_hidden: true }
        ]
      },
      {
        id: 'coin-change',
        title: 'Coin Change',
        slug: 'coin-change',
        difficulty: 'Medium',
        points: 20,
        category: 'Dynamic Programming',
        tags: ['dp', 'breadth-first-search'],
        companies: ['Amazon', 'Apple', 'Meta'],
        function_name: 'coinChange',
        description: 'You are given an integer array <code>coins</code> representing coins of different denominations and an integer <code>amount</code>. Return the fewest number of coins that you need to make up that amount. If that amount of money cannot be made up by any combination of the coins, return -1.',
        examples: [{ input: 'coins = [1,2,5], amount = 11', output: '3', explanation: '11 = 5 + 5 + 1 (3 coins)' }],
        starter_code: {
          javascript: 'function coinChange(coins, amount) {\n  // Bottom-up DP\n}',
          python: 'def coinChange(coins, amount):\n    pass',
          cpp: 'int coinChange(vector<int>& coins, int amount) {\n    \n}',
          java: 'class Solution {\n    public int coinChange(int[] coins, int amount) {\n        \n    }\n}'
        },
        hints: ['dp[i] represents fewest coins to make amount i.'],
        editorial: 'Iterate from 1 to amount, taking min(dp[i], dp[i - coin] + 1).',
        test_cases: [
          { args: [[1, 2, 5], 11], expected: 3, is_hidden: false },
          { args: [[2], 3], expected: -1, is_hidden: false },
          { args: [[1], 0], expected: 0, is_hidden: true }
        ]
      },
      {
        id: 'number-of-islands',
        title: 'Number of Islands',
        slug: 'number-of-islands',
        difficulty: 'Medium',
        points: 20,
        category: 'Graphs',
        tags: ['dfs', 'bfs', 'union-find'],
        companies: ['Amazon', 'Google', 'Meta'],
        function_name: 'numIslands',
        description: 'Given an <code>m x n</code> 2D binary grid grid which represents a map of 1s (land) and 0s (water), return the number of islands. An island is surrounded by water and is formed by connecting adjacent lands horizontally or vertically.',
        examples: [{ input: 'grid = [["1","1","0"],["1","1","0"],["0","0","1"]]', output: '2', explanation: 'Two distinct connected components.' }],
        starter_code: {
          javascript: 'function numIslands(grid) {\n  // BFS / DFS flood fill\n}',
          python: 'def numIslands(grid):\n    pass',
          cpp: 'int numIslands(vector<vector<char>>& grid) {\n    \n}',
          java: 'class Solution {\n    public int numIslands(char[][] grid) {\n        \n    }\n}'
        },
        hints: ['Whenever you hit a 1, increment count and DFS flood-fill all adjacent 1s to 0s.'],
        editorial: 'Graph connected components using standard DFS or BFS queue.',
        test_cases: [
          { args: [[['1', '1', '0'], ['1', '1', '0'], ['0', '0', '1']]], expected: 2, is_hidden: false },
          { args: [[['1', '1', '1'], ['0', '1', '0'], ['1', '1', '1']]], expected: 1, is_hidden: false },
          { args: [[['0', '0'], ['0', '0']]], expected: 0, is_hidden: true }
        ]
      },
      {
        id: 'clone-graph',
        title: 'Clone Graph',
        slug: 'clone-graph',
        difficulty: 'Medium',
        points: 20,
        category: 'Graphs',
        tags: ['graph', 'hash-table', 'dfs'],
        companies: ['Meta', 'Amazon'],
        function_name: 'cloneGraph',
        description: 'Given a adjacency list representing an undirected graph, return a deep copy of the adjacency list.',
        examples: [{ input: 'adjList = [[2,4],[1,3],[2,4],[1,3]]', output: '[[2,4],[1,3],[2,4],[1,3]]', explanation: 'Graph is deep cloned with identical topology.' }],
        starter_code: {
          javascript: 'function cloneGraph(adjList) {\n  return JSON.parse(JSON.stringify(adjList));\n}',
          python: 'def cloneGraph(adjList):\n    pass',
          cpp: 'vector<vector<int>> cloneGraph(vector<vector<int>>& adjList) {\n    \n}',
          java: 'class Solution {\n    public int[][] cloneGraph(int[][] adjList) {\n        \n    }\n}'
        },
        hints: ['Use a hash map to map original node -> cloned node.'],
        editorial: 'Map each visited node to its new copy to handle cycles.',
        test_cases: [
          { args: [[[2, 4], [1, 3], [2, 4], [1, 3]]], expected: [[2, 4], [1, 3], [2, 4], [1, 3]], is_hidden: false },
          { args: [[]], expected: [], is_hidden: false },
          { args: [[[]]], expected: [[]], is_hidden: true }
        ]
      },
      {
        id: 'course-schedule',
        title: 'Course Schedule',
        slug: 'course-schedule',
        difficulty: 'Medium',
        points: 20,
        category: 'Graphs',
        tags: ['dfs', 'bfs', 'graph', 'topological-sort'],
        companies: ['Amazon', 'Google', 'Robinhood'],
        function_name: 'canFinish',
        description: 'There are a total of <code>numCourses</code> courses you have to take, labeled from 0 to numCourses - 1. You are given an array <code>prerequisites</code> where prerequisites[i] = [a, b] indicates that you must take course b first if you want to take course a. Return true if you can finish all courses.',
        examples: [{ input: 'numCourses = 2, prerequisites = [[1,0]]', output: 'true', explanation: 'Take course 0 then course 1.' }],
        starter_code: {
          javascript: 'function canFinish(numCourses, prerequisites) {\n  // Cycle detection / Kahn\'s algorithm\n}',
          python: 'def canFinish(numCourses, prerequisites):\n    pass',
          cpp: 'bool canFinish(int numCourses, vector<vector<int>>& prerequisites) {\n    \n}',
          java: 'class Solution {\n    public boolean canFinish(int numCourses, int[][] prerequisites) {\n        \n    }\n}'
        },
        hints: ['This is cycle detection in a directed graph using topological sort.'],
        editorial: 'Kahn algorithm with in-degrees or 3-state DFS cycle detection.',
        test_cases: [
          { args: [2, [[1, 0]]], expected: true, is_hidden: false },
          { args: [2, [[1, 0], [0, 1]]], expected: false, is_hidden: false },
          { args: [3, [[0, 1], [0, 2], [1, 2]]], expected: true, is_hidden: true }
        ]
      },
      {
        id: 'word-search',
        title: 'Word Search',
        slug: 'word-search',
        difficulty: 'Medium',
        points: 20,
        category: 'Backtracking',
        tags: ['backtracking', 'matrix'],
        companies: ['Amazon', 'Bloomberg', 'Google'],
        function_name: 'exist',
        description: 'Given an <code>m x n</code> grid of characters board and a string word, return true if word exists in the grid.',
        examples: [{ input: 'board = [["A","B","C","E"],["S","F","C","S"],["A","D","E","E"]], word = "ABCCED"', output: 'true', explanation: 'Word traced along adjacent cells.' }],
        starter_code: {
          javascript: 'function exist(board, word) {\n  // Backtracking DFS\n}',
          python: 'def exist(board, word):\n    pass',
          cpp: 'bool exist(vector<vector<char>>& board, string word) {\n    \n}',
          java: 'class Solution {\n    public boolean exist(char[][] board, String word) {\n        \n    }\n}'
        },
        hints: ['Backtracking: mark visited cell temporarily, backtrack if no match.'],
        editorial: 'Standard 4-directional DFS with cell masking.',
        test_cases: [
          { args: [[['A', 'B', 'C', 'E'], ['S', 'F', 'C', 'S'], ['A', 'D', 'E', 'E']], 'ABCCED'], expected: true, is_hidden: false },
          { args: [[['A', 'B', 'C', 'E'], ['S', 'F', 'C', 'S'], ['A', 'D', 'E', 'E']], 'SEE'], expected: true, is_hidden: false },
          { args: [[['A', 'B', 'C', 'E'], ['S', 'F', 'C', 'S'], ['A', 'D', 'E', 'E']], 'ABCB'], expected: false, is_hidden: true }
        ]
      },
      {
        id: 'merge-intervals',
        title: 'Merge Intervals',
        slug: 'merge-intervals',
        difficulty: 'Medium',
        points: 20,
        category: 'Intervals',
        tags: ['array', 'sorting'],
        companies: ['Meta', 'Amazon', 'Google'],
        function_name: 'merge',
        description: 'Given an array of intervals where intervals[i] = [starti, endi], merge all overlapping intervals, and return an array of the non-overlapping intervals.',
        examples: [{ input: 'intervals = [[1,3],[2,6],[8,10],[15,18]]', output: '[[1,6],[8,10],[15,18]]', explanation: 'Intervals [1,3] and [2,6] overlap, merging into [1,6].' }],
        starter_code: {
          javascript: 'function merge(intervals) {\n  // Sort by start time, then merge\n}',
          python: 'def merge(intervals):\n    pass',
          cpp: 'vector<vector<int>> merge(vector<vector<int>>& intervals) {\n    \n}',
          java: 'class Solution {\n    public int[][] merge(int[][] intervals) {\n        \n    }\n}'
        },
        hints: ['Sort intervals by start value. If current.start <= prev.end, merge them.'],
        editorial: 'Sorting by start point turns interval overlaps into a single linear sweep.',
        test_cases: [
          { args: [[[1, 3], [2, 6], [8, 10], [15, 18]]], expected: [[1, 6], [8, 10], [15, 18]], is_hidden: false },
          { args: [[[1, 4], [4, 5]]], expected: [[1, 5]], is_hidden: false },
          { args: [[[1, 4], [2, 3]]], expected: [[1, 4]], is_hidden: true }
        ]
      },
      {
        id: 'insert-interval',
        title: 'Insert Interval',
        slug: 'insert-interval',
        difficulty: 'Medium',
        points: 20,
        category: 'Intervals',
        tags: ['array'],
        companies: ['Google', 'Meta'],
        function_name: 'insert',
        description: 'You are given an array of non-overlapping intervals intervals where intervals[i] = [starti, endi] sorted in ascending order by starti. You are also given an interval newInterval = [start, end]. Insert newInterval into intervals such that intervals is still sorted and without overlaps.',
        examples: [{ input: 'intervals = [[1,3],[6,9]], newInterval = [2,5]', output: '[[1,5],[6,9]]', explanation: '[1,3] merges with [2,5] to become [1,5].' }],
        starter_code: {
          javascript: 'function insert(intervals, newInterval) {\n  // Linear pass or binary search\n}',
          python: 'def insert(intervals, newInterval):\n    pass',
          cpp: 'vector<vector<int>> insert(vector<vector<int>>& intervals, vector<int>& newInterval) {\n    \n}',
          java: 'class Solution {\n    public int[][] insert(int[][] intervals, int[] newInterval) {\n        \n    }\n}'
        },
        hints: ['Append intervals ending before newInterval, merge overlapping, append remainder.'],
        editorial: 'Three-stage single linear pass.',
        test_cases: [
          { args: [[[1, 3], [6, 9]], [2, 5]], expected: [[1, 5], [6, 9]], is_hidden: false },
          { args: [[[1, 2], [3, 5], [6, 7], [8, 10], [12, 16]], [4, 8]], expected: [[1, 2], [3, 10], [12, 16]], is_hidden: false },
          { args: [[], [5, 7]], expected: [[5, 7]], is_hidden: true }
        ]
      },
      {
        id: 'non-overlapping-intervals',
        title: 'Non-overlapping Intervals',
        slug: 'non-overlapping-intervals',
        difficulty: 'Medium',
        points: 20,
        category: 'Intervals',
        tags: ['greedy', 'sorting'],
        companies: ['Meta', 'Amazon'],
        function_name: 'eraseOverlapIntervals',
        description: 'Given an array of intervals intervals where intervals[i] = [starti, endi], return the minimum number of intervals you need to remove to make the rest of the intervals non-overlapping.',
        examples: [{ input: 'intervals = [[1,2],[2,3],[3,4],[1,3]]', output: '1', explanation: '[1,3] can be removed and the rest of the intervals are non-overlapping.' }],
        starter_code: {
          javascript: 'function eraseOverlapIntervals(intervals) {\n  // Greedy interval scheduling\n}',
          python: 'def eraseOverlapIntervals(intervals):\n    pass',
          cpp: 'int eraseOverlapIntervals(vector<vector<int>>& intervals) {\n    \n}',
          java: 'class Solution {\n    public int eraseOverlapIntervals(int[][] intervals) {\n        \n    }\n}'
        },
        hints: ['Sort by end time. Always keep the interval that ends earliest.'],
        editorial: 'Classic greedy activity selection algorithm.',
        test_cases: [
          { args: [[[1, 2], [2, 3], [3, 4], [1, 3]]], expected: 1, is_hidden: false },
          { args: [[[1, 2], [1, 2], [1, 2]]], expected: 2, is_hidden: false },
          { args: [[[1, 2], [2, 3]]], expected: 0, is_hidden: true }
        ]
      },
      {
        id: 'rotate-image',
        title: 'Rotate Image',
        slug: 'rotate-image',
        difficulty: 'Medium',
        points: 20,
        category: 'Math & Geometry',
        tags: ['array', 'matrix'],
        companies: ['Amazon', 'Microsoft'],
        function_name: 'rotate',
        description: 'You are given an n x n 2D matrix representing an image, rotate the image by 90 degrees (clockwise) in-place and return the rotated matrix.',
        examples: [{ input: 'matrix = [[1,2,3],[4,5,6],[7,8,9]]', output: '[[7,4,1],[8,5,2],[9,6,3]]', explanation: 'Rotated 90 degrees clockwise.' }],
        starter_code: {
          javascript: 'function rotate(matrix) {\n  // Transpose and reverse rows\n  const n = matrix.length;\n  for (let i = 0; i < n; i++) {\n    for (let j = i + 1; j < n; j++) {\n      [matrix[i][j], matrix[j][i]] = [matrix[j][i], matrix[i][j]];\n    }\n    matrix[i].reverse();\n  }\n  return matrix;\n}',
          python: 'def rotate(matrix):\n    pass',
          cpp: 'vector<vector<int>> rotate(vector<vector<int>>& matrix) {\n    \n}',
          java: 'class Solution {\n    public int[][] rotate(int[][] matrix) {\n        \n    }\n}'
        },
        hints: ['Transpose the matrix along main diagonal, then reverse each row.'],
        editorial: 'A 90 degree clockwise rotation is equivalent to transpose + reflect.',
        test_cases: [
          { args: [[[1, 2, 3], [4, 5, 6], [7, 8, 9]]], expected: [[7, 4, 1], [8, 5, 2], [9, 6, 3]], is_hidden: false },
          { args: [[[5, 1, 9, 11], [2, 4, 8, 10], [13, 3, 6, 7], [15, 14, 12, 16]]], expected: [[15, 13, 2, 5], [14, 3, 4, 1], [12, 6, 8, 9], [16, 7, 10, 11]], is_hidden: false }
        ]
      },
      {
        id: 'spiral-matrix',
        title: 'Spiral Matrix',
        slug: 'spiral-matrix',
        difficulty: 'Medium',
        points: 20,
        category: 'Math & Geometry',
        tags: ['matrix', 'simulation'],
        companies: ['Apple', 'Microsoft'],
        function_name: 'spiralOrder',
        description: 'Given an m x n matrix, return all elements of the matrix in spiral order.',
        examples: [{ input: 'matrix = [[1,2,3],[4,5,6],[7,8,9]]', output: '[1,2,3,6,9,8,7,4,5]', explanation: 'Traverse right, down, left, up.' }],
        starter_code: {
          javascript: 'function spiralOrder(matrix) {\n  // 4 boundaries top, bottom, left, right\n}',
          python: 'def spiralOrder(matrix):\n    pass',
          cpp: 'vector<int> spiralOrder(vector<vector<int>>& matrix) {\n    \n}',
          java: 'class Solution {\n    public List<Integer> spiralOrder(int[][] matrix) {\n        \n    }\n}'
        },
        hints: ['Maintain four boundary indices: top, bottom, left, right.'],
        editorial: 'Direct simulation shrinking boundaries inwards.',
        test_cases: [
          { args: [[[1, 2, 3], [4, 5, 6], [7, 8, 9]]], expected: [1, 2, 3, 6, 9, 8, 7, 4, 5], is_hidden: false },
          { args: [[[1, 2, 3, 4], [5, 6, 7, 8], [9, 10, 11, 12]]], expected: [1, 2, 3, 4, 8, 12, 11, 10, 9, 5, 6, 7], is_hidden: false },
          { args: [[[1]]], expected: [1], is_hidden: true }
        ]
      },
      {
        id: 'set-matrix-zeroes',
        title: 'Set Matrix Zeroes',
        slug: 'set-matrix-zeroes',
        difficulty: 'Medium',
        points: 20,
        category: 'Math & Geometry',
        tags: ['matrix', 'hash-table'],
        companies: ['Meta', 'Amazon'],
        function_name: 'setZeroes',
        description: 'Given an m x n integer matrix matrix, if an element is 0, set its entire row and column to 0s in place and return the matrix.',
        examples: [{ input: 'matrix = [[1,1,1],[1,0,1],[1,1,1]]', output: '[[1,0,1],[0,0,0],[1,0,1]]', explanation: 'Row 1 and Column 1 are filled with 0s.' }],
        starter_code: {
          javascript: 'function setZeroes(matrix) {\n  // Track rows and cols to zero\n}',
          python: 'def setZeroes(matrix):\n    pass',
          cpp: 'vector<vector<int>> setZeroes(vector<vector<int>>& matrix) {\n    \n}',
          java: 'class Solution {\n    public int[][] setZeroes(int[][] matrix) {\n        \n    }\n}'
        },
        hints: ['Use the first row and first column as markers for O(1) space.'],
        editorial: 'First row and col track whether that column or row needs zeroing.',
        test_cases: [
          { args: [[[1, 1, 1], [1, 0, 1], [1, 1, 1]]], expected: [[1, 0, 1], [0, 0, 0], [1, 0, 1]], is_hidden: false },
          { args: [[[0, 1, 2, 0], [3, 4, 5, 2], [1, 3, 1, 5]]], expected: [[0, 0, 0, 0], [0, 4, 5, 0], [0, 3, 1, 0]], is_hidden: false }
        ]
      },
      {
        id: 'median-of-two-sorted-arrays',
        title: 'Median of Two Sorted Arrays',
        slug: 'median-of-two-sorted-arrays',
        difficulty: 'Hard',
        points: 40,
        category: 'Binary Search',
        tags: ['array', 'binary-search', 'divide-and-conquer'],
        companies: ['Google', 'Amazon', 'Apple'],
        function_name: 'findMedianSortedArrays',
        description: 'Given two sorted arrays nums1 and nums2 of size m and n respectively, return the median of the two sorted arrays. The overall run time complexity should be O(log (m+n)).',
        examples: [{ input: 'nums1 = [1,3], nums2 = [2]', output: '2', explanation: 'Merged array is [1,2,3] and median is 2.' }],
        starter_code: {
          javascript: 'function findMedianSortedArrays(nums1, nums2) {\n  const arr = [...nums1, ...nums2].sort((a,b) => a - b);\n  const mid = Math.floor(arr.length / 2);\n  return arr.length % 2 !== 0 ? arr[mid] : (arr[mid - 1] + arr[mid]) / 2;\n}',
          python: 'def findMedianSortedArrays(nums1, nums2):\n    pass',
          cpp: 'double findMedianSortedArrays(vector<int>& nums1, vector<int>& nums2) {\n    \n}',
          java: 'class Solution {\n    public double findMedianSortedArrays(int[] nums1, int[] nums2) {\n        \n    }\n}'
        },
        hints: ['Binary search on the smaller array for partition point.'],
        editorial: 'Partitioning both arrays such that left parts contain half the elements and max(left) <= min(right).',
        test_cases: [
          { args: [[1, 3], [2]], expected: 2, is_hidden: false },
          { args: [[1, 2], [3, 4]], expected: 2.5, is_hidden: false },
          { args: [[0, 0], [0, 0]], expected: 0, is_hidden: true }
        ]
      },
      {
        id: 'word-break',
        title: 'Word Break',
        slug: 'word-break',
        difficulty: 'Medium',
        points: 20,
        category: 'Dynamic Programming',
        tags: ['dp', 'hash-table', 'string'],
        companies: ['Amazon', 'Meta', 'Google'],
        function_name: 'wordBreak',
        description: 'Given a string s and a dictionary of strings wordDict, return true if s can be segmented into a space-separated sequence of one or more dictionary words.',
        examples: [{ input: 's = "leetcode", wordDict = ["leet","code"]', output: 'true', explanation: 'Segmented as "leet code".' }],
        starter_code: {
          javascript: 'function wordBreak(s, wordDict) {\n  // DP array dp[i] indicates whether s[0..i] can be segmented\n}',
          python: 'def wordBreak(s, wordDict):\n    pass',
          cpp: 'bool wordBreak(string s, vector<string>& wordDict) {\n    \n}',
          java: 'class Solution {\n    public boolean wordBreak(String s, List<String> wordDict) {\n        \n    }\n}'
        },
        hints: ['dp[i] is true if any dp[j] is true AND s.slice(j, i) is in wordDict.'],
        editorial: 'O(n^2) DP bottom-up formulation.',
        test_cases: [
          { args: ['leetcode', ['leet', 'code']], expected: true, is_hidden: false },
          { args: ['applepenapple', ['apple', 'pen']], expected: true, is_hidden: false },
          { args: ['catsandog', ['cats', 'dog', 'sand', 'and', 'cat']], expected: false, is_hidden: true }
        ]
      },
      {
        id: 'longest-palindromic-substring',
        title: 'Longest Palindromic Substring',
        slug: 'longest-palindromic-substring',
        difficulty: 'Medium',
        points: 20,
        category: 'Two Pointers',
        tags: ['string', 'dp'],
        companies: ['Amazon', 'Microsoft'],
        function_name: 'longestPalindrome',
        description: 'Given a string s, return the longest palindromic substring in s.',
        examples: [{ input: 's = "babad"', output: '"bab"', explanation: '"aba" is also a valid answer.' }],
        starter_code: {
          javascript: 'function longestPalindrome(s) {\n  // Expand around centers\n}',
          python: 'def longestPalindrome(s):\n    pass',
          cpp: 'string longestPalindrome(string s) {\n    \n}',
          java: 'class Solution {\n    public String longestPalindrome(String s) {\n        \n    }\n}'
        },
        hints: ['Expand around every character (odd) and between every pair (even).'],
        editorial: 'O(n^2) expand around centers method is concise and O(1) extra space.',
        test_cases: [
          { args: ['cbbd'], expected: 'bb', is_hidden: false },
          { args: ['a'], expected: 'a', is_hidden: false },
          { args: ['racecar'], expected: 'racecar', is_hidden: true }
        ]
      },
      {
        id: 'palindromic-substrings',
        title: 'Palindromic Substrings',
        slug: 'palindromic-substrings',
        difficulty: 'Medium',
        points: 20,
        category: 'Two Pointers',
        tags: ['string', 'dp'],
        companies: ['Meta', 'Amazon'],
        function_name: 'countSubstrings',
        description: 'Given a string s, return the number of palindromic substrings in it.',
        examples: [{ input: 's = "abc"', output: '3', explanation: 'Three palindromic strings: "a", "b", "c".' }],
        starter_code: {
          javascript: 'function countSubstrings(s) {\n  // Count expansions from each center\n}',
          python: 'def countSubstrings(s):\n    pass',
          cpp: 'int countSubstrings(string s) {\n    \n}',
          java: 'class Solution {\n    public int countSubstrings(String s) {\n        \n    }\n}'
        },
        hints: ['Each center expansion gives +1 whenever characters match.'],
        editorial: 'Expand from 2n - 1 possible centers.',
        test_cases: [
          { args: ['abc'], expected: 3, is_hidden: false },
          { args: ['aaa'], expected: 6, is_hidden: false },
          { args: ['a'], expected: 1, is_hidden: true }
        ]
      },
      {
        id: 'house-robber',
        title: 'House Robber',
        slug: 'house-robber',
        difficulty: 'Medium',
        points: 20,
        category: 'Dynamic Programming',
        tags: ['dp', 'array'],
        companies: ['Google', 'Amazon'],
        function_name: 'rob',
        description: 'You are a professional robber planning to rob houses along a street. Each house has a certain amount of money stashed, the only constraint stopping you from robbing each of them is that adjacent houses have security systems connected and it will automatically contact the police if two adjacent houses were broken into on the same night. Return the maximum amount of money you can rob tonight without alerting the police.',
        examples: [{ input: 'nums = [1,2,3,1]', output: '4', explanation: 'Rob house 1 (money = 1) and then rob house 3 (money = 3). Total = 4.' }],
        starter_code: {
          javascript: 'function rob(nums) {\n  // dp[i] = max(dp[i-1], dp[i-2] + nums[i])\n}',
          python: 'def rob(nums):\n    pass',
          cpp: 'int rob(vector<int>& nums) {\n    \n}',
          java: 'class Solution {\n    public int rob(int[] nums) {\n        \n    }\n}'
        },
        hints: ['Maintain two variables: rob1 and rob2.'],
        editorial: 'Space optimized dynamic programming in O(n) time and O(1) space.',
        test_cases: [
          { args: [[1, 2, 3, 1]], expected: 4, is_hidden: false },
          { args: [[2, 7, 9, 3, 1]], expected: 12, is_hidden: false },
          { args: [[0]], expected: 0, is_hidden: true }
        ]
      },
      {
        id: 'house-robber-ii',
        title: 'House Robber II',
        slug: 'house-robber-ii',
        difficulty: 'Medium',
        points: 20,
        category: 'Dynamic Programming',
        tags: ['dp', 'array'],
        companies: ['Google', 'Microsoft'],
        function_name: 'rob2',
        description: 'All houses at this place are arranged in a circle. That means the first house is the neighbor of the last one. Return the maximum amount of money you can rob without alerting the police.',
        examples: [{ input: 'nums = [2,3,2]', output: '3', explanation: 'You cannot rob house 1 (money = 2) and then rob house 3 (money = 2), because they are adjacent houses.' }],
        starter_code: {
          javascript: 'function rob2(nums) {\n  // max(rob(nums[1..]), rob(nums[..n-1]))\n}',
          python: 'def rob2(nums):\n    pass',
          cpp: 'int rob2(vector<int>& nums) {\n    \n}',
          java: 'class Solution {\n    public int rob2(int[] nums) {\n        \n    }\n}'
        },
        hints: ['Solve House Robber I twice: once without first house, once without last house.'],
        editorial: 'Decompose circular problem into two linear subproblems.',
        test_cases: [
          { args: [[2, 3, 2]], expected: 3, is_hidden: false },
          { args: [[1, 2, 3, 1]], expected: 4, is_hidden: false },
          { args: [[1, 2, 3]], expected: 3, is_hidden: true }
        ]
      },
      {
        id: 'decode-ways',
        title: 'Decode Ways',
        slug: 'decode-ways',
        difficulty: 'Medium',
        points: 20,
        category: 'Dynamic Programming',
        tags: ['string', 'dp'],
        companies: ['Amazon', 'Meta'],
        function_name: 'numDecodings',
        description: 'A message containing letters from A-Z can be encoded into numbers using the mapping "A" -> "1" ... "Z" -> "26". Given a string s containing only digits, return the number of ways to decode it.',
        examples: [{ input: 's = "12"', output: '2', explanation: '"12" could be decoded as "AB" (1 2) or "L" (12).' }],
        starter_code: {
          javascript: 'function numDecodings(s) {\n  // dp counting single and two digit valid decodings\n}',
          python: 'def numDecodings(s):\n    pass',
          cpp: 'int numDecodings(string s) {\n    \n}',
          java: 'class Solution {\n    public int numDecodings(String s) {\n        \n    }\n}'
        },
        hints: ['Handle "0" carefully. Valid single digits: 1-9; valid double digits: 10-26.'],
        editorial: 'DP where ways[i] = ways[i+1] + ways[i+2] depending on validity.',
        test_cases: [
          { args: ['12'], expected: 2, is_hidden: false },
          { args: ['226'], expected: 3, is_hidden: false },
          { args: ['06'], expected: 0, is_hidden: true }
        ]
      }
    ];

    const insertProblem = db.prepare(`
      INSERT OR REPLACE INTO problems (
        id, title, slug, difficulty, points, category, tags, companies,
        function_name, description, examples, starter_code, hints, editorial,
        test_cases, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const now = Date.now();
    for (const p of problems) {
      insertProblem.run(
        p.id,
        p.title,
        p.slug,
        p.difficulty,
        p.points,
        p.category,
        JSON.stringify(p.tags),
        JSON.stringify(p.companies),
        p.function_name,
        p.description,
        JSON.stringify(p.examples),
        JSON.stringify(p.starter_code),
        JSON.stringify(p.hints),
        p.editorial,
        JSON.stringify(p.test_cases),
        now,
        now
      );
    }
    console.log(`Seeded ${problems.length} coding problems.`);
  }

  // 3. Seed Guided Mini-Projects
  const projectCount = db.prepare('SELECT COUNT(*) as count FROM projects').get().count;
  if (projectCount === 0) {
    const insertProject = db.prepare(`
      INSERT INTO projects (id, title, description, difficulty, steps, starter_files, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    insertProject.run(
      'mini-git',
      'Build Your Own Mini Git',
      'Implement an in-memory content-addressable storage system that simulates `init`, `hash-object`, `cat-file`, and `commit`.',
      'Medium',
      JSON.stringify([
        { id: 'step-1', title: 'Initialize Repository', desc: 'Create .git folder structure and HEAD reference.' },
        { id: 'step-2', title: 'SHA-1 Blob Storage', desc: 'Hash file contents, compress with zlib, and write to objects/ folder.' },
        { id: 'step-3', title: 'Tree and Commit Objects', desc: 'Point tree nodes to blobs and write commit metadata with author and timestamp.' }
      ]),
      JSON.stringify({
        'index.js': '// Mini Git implementation\nclass MiniGit {\n  constructor() {}\n}'
      }),
      Date.now()
    );

    insertProject.run(
      'in-memory-lru-cache',
      'Build an In-Memory LRU Cache',
      'Create an O(1) Get and Put Least Recently Used Cache using a doubly linked list and hash map.',
      'Easy',
      JSON.stringify([
        { id: 'step-1', title: 'Doubly Linked List Node', desc: 'Implement prev/next pointers for key-value nodes.' },
        { id: 'step-2', title: 'Eviction Policy', desc: 'Move accessed nodes to head and evict from tail when capacity exceeded.' },
        { id: 'step-3', title: 'TTL Expiration', desc: 'Add optional timestamp expiry checks to cached entries.' }
      ]),
      JSON.stringify({
        'lru.js': 'class LRUCache {\n  constructor(capacity) {\n    this.capacity = capacity;\n  }\n}'
      }),
      Date.now()
    );
    console.log('Seeded mini-projects module.');
  }

  // 4. Seed Contests
  const contestCount = db.prepare('SELECT COUNT(*) as count FROM contests').get().count;
  if (contestCount === 0) {
    const insertContest = db.prepare(`
      INSERT INTO contests (id, title, description, start_time, end_time, problem_ids, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    const now = Date.now();
    insertContest.run(
      'weekly-contest-1',
      'CodeForge Weekly Contest 1',
      'Test your algorithmic agility across 4 problems with global live rating standings.',
      now - 86400000,
      now + 86400000 * 2,
      JSON.stringify(['two-sum', 'valid-parentheses', 'maximum-subarray', 'trapping-rain-water']),
      now
    );
    console.log('Seeded active weekly contest.');
  }

  console.log('Database seeding finished.');
}

if (process.argv[1]?.endsWith('seed.js')) {
  seedDatabase();
}
