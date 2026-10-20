import { db } from './connection.js';

export function seedExtraProblems() {
  const extraProblems = [
    {
      id: 'rotate-image',
      title: 'Rotate Image (90 Degrees)',
      slug: 'rotate-image',
      difficulty: 'Medium',
      points: 20,
      category: 'Arrays & Hashing',
      tags: ['array', 'math', 'matrix'],
      companies: ['Amazon', 'Microsoft', 'Apple'],
      function_name: 'rotate',
      description: 'You are given an <code>n x n</code> 2D <code>matrix</code> representing an image, rotate the image by 90 degrees (clockwise) in-place.',
      examples: [{ input: 'matrix = [[1,2,3],[4,5,6],[7,8,9]]', output: '[[7,4,1],[8,5,2],[9,6,3]]' }],
      starter_code: {
        javascript: 'function rotate(matrix) {\n  const n = matrix.length;\n  for (let i = 0; i < n; i++) {\n    for (let j = i + 1; j < n; j++) {\n      [matrix[i][j], matrix[j][i]] = [matrix[j][i], matrix[i][j]];\n    }\n  }\n  for (let i = 0; i < n; i++) {\n    matrix[i].reverse();\n  }\n  return matrix;\n}',
        python: 'def rotate(matrix):\n    n = len(matrix)\n    for i in range(n):\n        for j in range(i + 1, n):\n            matrix[i][j], matrix[j][i] = matrix[j][i], matrix[i][j]\n    for row in matrix:\n        row.reverse()\n    return matrix'
      },
      hints: ['Transpose the matrix (swap row and col), then reverse each row horizontally.'],
      editorial: 'Transposing mirrors elements across the main diagonal. Reversing rows afterwards yields the exact clockwise 90 degree rotation.',
      test_cases: [
        { args: [[[1,2,3],[4,5,6],[7,8,9]]], expected: [[7,4,1],[8,5,2],[9,6,3]], is_hidden: false },
        { args: [[[5,1,9,11],[2,4,8,10],[13,3,6,7],[15,14,12,16]]], expected: [[15,13,2,5],[14,3,4,1],[12,6,8,9],[16,7,10,11]], is_hidden: false },
        { args: [[[1]]], expected: [[1]], is_hidden: true }
      ]
    },
    {
      id: 'spiral-matrix',
      title: 'Spiral Matrix',
      slug: 'spiral-matrix',
      difficulty: 'Medium',
      points: 20,
      category: 'Arrays & Hashing',
      tags: ['array', 'matrix', 'simulation'],
      companies: ['Microsoft', 'Google', 'Uber'],
      function_name: 'spiralOrder',
      description: 'Given an <code>m x n</code> <code>matrix</code>, return all elements of the matrix in spiral order.',
      examples: [{ input: 'matrix = [[1,2,3],[4,5,6],[7,8,9]]', output: '[1,2,3,6,9,8,7,4,5]' }],
      starter_code: {
        javascript: 'function spiralOrder(matrix) {\n  const res = [];\n  if (!matrix.length) return res;\n  let top = 0, bottom = matrix.length - 1, left = 0, right = matrix[0].length - 1;\n  while (top <= bottom && left <= right) {\n    for (let j = left; j <= right; j++) res.push(matrix[top][j]);\n    top++;\n    for (let i = top; i <= bottom; i++) res.push(matrix[i][right]);\n    right--;\n    if (top <= bottom) {\n      for (let j = right; j >= left; j--) res.push(matrix[bottom][j]);\n      bottom--;\n    }\n    if (left <= right) {\n      for (let i = bottom; i >= top; i--) res.push(matrix[i][left]);\n      left++;\n    }\n  }\n  return res;\n}',
        python: 'def spiralOrder(matrix):\n    res = []\n    if not matrix: return res\n    top, bottom, left, right = 0, len(matrix) - 1, 0, len(matrix[0]) - 1\n    while top <= bottom and left <= right:\n        for j in range(left, right + 1): res.append(matrix[top][j])\n        top += 1\n        for i in range(top, bottom + 1): res.append(matrix[i][right])\n        right -= 1\n        if top <= bottom:\n            for j in range(right, left - 1, -1): res.append(matrix[bottom][j])\n            bottom -= 1\n        if left <= right:\n            for i in range(bottom, top - 1, -1): res.append(matrix[i][left])\n            left += 1\n    return res'
      },
      hints: ['Maintain four boundary boundaries: top, bottom, left, right and shrink inward.'],
      editorial: 'Traverse right along the top boundary, down along the right, left along the bottom, and up along the left, decrementing/incrementing boundaries after each pass.',
      test_cases: [
        { args: [[[1,2,3],[4,5,6],[7,8,9]]], expected: [1,2,3,6,9,8,7,4,5], is_hidden: false },
        { args: [[[1,2,3,4],[5,6,7,8],[9,10,11,12]]], expected: [1,2,3,4,8,12,11,10,9,5,6,7], is_hidden: false },
        { args: [[[1]]], expected: [1], is_hidden: true }
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
      companies: ['Google', 'Spotify', 'Amazon'],
      function_name: 'longestConsecutive',
      description: 'Given an unsorted array of integers <code>nums</code>, return the length of the longest consecutive elements sequence. You must write an algorithm that runs in <code>O(n)</code> time.',
      examples: [{ input: 'nums = [100,4,200,1,3,2]', output: '4', explanation: 'The longest consecutive elements sequence is [1, 2, 3, 4]. Therefore its length is 4.' }],
      starter_code: {
        javascript: 'function longestConsecutive(nums) {\n  const set = new Set(nums);\n  let maxLen = 0;\n  for (const num of set) {\n    if (!set.has(num - 1)) {\n      let curr = num;\n      let streak = 1;\n      while (set.has(curr + 1)) {\n        curr++;\n        streak++;\n      }\n      maxLen = Math.max(maxLen, streak);\n    }\n  }\n  return maxLen;\n}',
        python: 'def longestConsecutive(nums):\n    num_set = set(nums)\n    max_len = 0\n    for num in num_set:\n        if num - 1 not in num_set:\n            curr = num\n            streak = 1\n            while curr + 1 in num_set:\n                curr += 1\n                streak += 1\n            max_len = max(max_len, streak)\n    return max_len'
      },
      hints: ['Insert numbers into a Set. Only start counting a streak if num - 1 is not in the set.'],
      editorial: 'By verifying (num - 1) is not present, we only initiate counts at the bottom of each sequence, ensuring each number is checked at most twice for O(N) complexity.',
      test_cases: [
        { args: [[100, 4, 200, 1, 3, 2]], expected: 4, is_hidden: false },
        { args: [[0, 3, 7, 2, 5, 8, 4, 6, 0, 1]], expected: 9, is_hidden: false },
        { args: [[]], expected: 0, is_hidden: true },
        { args: [[9, 1, 4, 7, 3, -1, 0, 5, 8, -1, 6]], expected: 7, is_hidden: true }
      ]
    },
    {
      id: 'kth-largest-element-in-an-array',
      title: 'Kth Largest Element in an Array',
      slug: 'kth-largest-element-in-an-array',
      difficulty: 'Medium',
      points: 20,
      category: 'Heap / Priority Queue',
      tags: ['array', 'divide-and-conquer', 'sorting', 'heap'],
      companies: ['Meta', 'Amazon', 'LinkedIn'],
      function_name: 'findKthLargest',
      description: 'Given an integer array <code>nums</code> and an integer <code>k</code>, return the <code>kth</code> largest element in the array. Can you solve it without sorting in O(N log k) time?',
      examples: [{ input: 'nums = [3,2,1,5,6,4], k = 2', output: '5' }],
      starter_code: {
        javascript: 'function findKthLargest(nums, k) {\n  nums.sort((a, b) => b - a);\n  return nums[k - 1];\n}',
        python: 'def findKthLargest(nums, k):\n    nums.sort(reverse=True)\n    return nums[k - 1]'
      },
      hints: ['Sort descending or maintain a min-heap of size k.'],
      editorial: 'A min-heap of capacity k keeps the k largest elements seen; the root will always hold the kth largest.',
      test_cases: [
        { args: [[3, 2, 1, 5, 6, 4], 2], expected: 5, is_hidden: false },
        { args: [[3, 2, 3, 1, 2, 4, 5, 5, 6], 4], expected: 4, is_hidden: false },
        { args: [[1], 1], expected: 1, is_hidden: true }
      ]
    },
    {
      id: 'subsets',
      title: 'Subsets (Power Set)',
      slug: 'subsets',
      difficulty: 'Medium',
      points: 20,
      category: 'Backtracking',
      tags: ['array', 'backtracking', 'bit-manipulation'],
      companies: ['Amazon', 'Microsoft', 'Bloomberg'],
      function_name: 'subsets',
      description: 'Given an integer array <code>nums</code> of unique elements, return all possible subsets (the power set). The solution set must not contain duplicate subsets. Return the solution in any order.',
      examples: [{ input: 'nums = [1,2,3]', output: '[[],[1],[2],[1,2],[3],[1,3],[2,3],[1,2,3]]' }],
      starter_code: {
        javascript: 'function subsets(nums) {\n  const res = [];\n  function backtrack(start, path) {\n    res.push([...path]);\n    for (let i = start; i < nums.length; i++) {\n      path.push(nums[i]);\n      backtrack(i + 1, path);\n      path.pop();\n    }\n  }\n  backtrack(0, []);\n  return res;\n}',
        python: 'def subsets(nums):\n    res = []\n    def backtrack(start, path):\n        res.append(list(path))\n        for i in range(start, len(nums)):\n            path.append(nums[i])\n            backtrack(i + 1, path)\n            path.pop()\n    backtrack(0, [])\n    return res'
      },
      hints: ['Backtracking: at each number, either include it in current subset or exclude it.'],
      editorial: 'Depth-first search with backtracking generates all 2^N subsets recursively by choosing to include or exclude elements.',
      test_cases: [
        { args: [[1, 2, 3]], expected: [[],[1],[1,2],[1,2,3],[1,3],[2],[2,3],[3]], is_hidden: false },
        { args: [[0]], expected: [[],[0]], is_hidden: false }
      ]
    },
    {
      id: 'number-of-islands',
      title: 'Number of Islands',
      slug: 'number-of-islands',
      difficulty: 'Medium',
      points: 20,
      category: 'Graphs',
      tags: ['array', 'depth-first-search', 'breadth-first-search', 'matrix'],
      companies: ['Amazon', 'Google', 'Microsoft', 'Bloomberg'],
      function_name: 'numIslands',
      description: 'Given an <code>m x n</code> 2D binary grid <code>grid</code> which represents a map of <code>"1"</code>s (land) and <code>"0"</code>s (water), return the number of islands. An island is surrounded by water and is formed by connecting adjacent lands horizontally or vertically.',
      examples: [{ input: 'grid = [["1","1","0","0","0"],["1","1","0","0","0"],["0","0","1","0","0"],["0","0","0","1","1"]]', output: '3' }],
      starter_code: {
        javascript: 'function numIslands(grid) {\n  if (!grid || !grid.length) return 0;\n  let count = 0;\n  const rows = grid.length, cols = grid[0].length;\n  function dfs(r, c) {\n    if (r < 0 || c < 0 || r >= rows || c >= cols || grid[r][c] === "0") return;\n    grid[r][c] = "0";\n    dfs(r + 1, c);\n    dfs(r - 1, c);\n    dfs(r, c + 1);\n    dfs(r, c - 1);\n  }\n  for (let r = 0; r < rows; r++) {\n    for (let c = 0; c < cols; c++) {\n      if (grid[r][c] === "1") {\n        count++;\n        dfs(r, c);\n      }\n    }\n  }\n  return count;\n}',
        python: 'def numIslands(grid):\n    if not grid: return 0\n    rows, cols = len(grid), len(grid[0])\n    count = 0\n    def dfs(r, c):\n        if r < 0 or c < 0 or r >= rows or c >= cols or grid[r][c] == "0": return\n        grid[r][c] = "0"\n        dfs(r + 1, c)\n        dfs(r - 1, c)\n        dfs(r, c + 1)\n        dfs(r, c - 1)\n    for r in range(rows):\n        for c in range(cols):\n            if grid[r][c] == "1":\n                count += 1\n                dfs(r, c)\n    return count'
      },
      hints: ['Whenever you find a "1", increment island count and DFS/sink all connected "1"s to "0".'],
      editorial: 'Standard flood fill algorithm. Sinking land avoids using an extra visited 2D array.',
      test_cases: [
        { args: [[["1","1","0","0","0"],["1","1","0","0","0"],["0","0","1","0","0"],["0","0","0","1","1"]]], expected: 3, is_hidden: false },
        { args: [[["1","1","1"],["0","1","0"],["1","1","1"]]], expected: 1, is_hidden: false }
      ]
    },
    {
      id: 'merge-k-sorted-lists',
      title: 'Merge k Sorted Lists',
      slug: 'merge-k-sorted-lists',
      difficulty: 'Hard',
      points: 30,
      category: 'Linked List',
      tags: ['linked-list', 'divide-and-conquer', 'heap', 'merge-sort'],
      companies: ['Amazon', 'Facebook', 'Google', 'Apple'],
      function_name: 'mergeKLists',
      description: 'You are given an array of <code>k</code> linked-lists, each list is sorted in ascending order. Merge all the linked-lists into one sorted flat array and return it.',
      examples: [{ input: 'lists = [[1,4,5],[1,3,4],[2,6]]', output: '[1,1,2,3,4,4,5,6]' }],
      starter_code: {
        javascript: 'function mergeKLists(lists) {\n  const flat = [];\n  for (const list of lists) {\n    flat.push(...list);\n  }\n  return flat.sort((a, b) => a - b);\n}',
        python: 'def mergeKLists(lists):\n    res = []\n    for lst in lists:\n        res.extend(lst)\n    return sorted(res)'
      },
      hints: ['Collect all elements and sort, or use a min-heap across k pointer heads.'],
      editorial: 'Flattening and sorting or pairwise divide-and-conquer merges k lists in O(N log k) time.',
      test_cases: [
        { args: [[[1,4,5],[1,3,4],[2,6]]], expected: [1,1,2,3,4,4,5,6], is_hidden: false },
        { args: [[]], expected: [], is_hidden: false },
        { args: [[[]]], expected: [], is_hidden: true }
      ]
    },
    {
      id: 'median-of-two-sorted-arrays',
      title: 'Median of Two Sorted Arrays',
      slug: 'median-of-two-sorted-arrays',
      difficulty: 'Hard',
      points: 30,
      category: 'Binary Search',
      tags: ['array', 'binary-search', 'divide-and-conquer'],
      companies: ['Google', 'Amazon', 'Microsoft', 'Goldman Sachs'],
      function_name: 'findMedianSortedArrays',
      description: 'Given two sorted arrays <code>nums1</code> and <code>nums2</code> of size <code>m</code> and <code>n</code> respectively, return the median of the two sorted arrays. The overall run time complexity should be <code>O(log (m+n))</code>.',
      examples: [{ input: 'nums1 = [1,3], nums2 = [2]', output: '2' }],
      starter_code: {
        javascript: 'function findMedianSortedArrays(nums1, nums2) {\n  const merged = [...nums1, ...nums2].sort((a, b) => a - b);\n  const mid = Math.floor(merged.length / 2);\n  return merged.length % 2 === 0 ? (merged[mid - 1] + merged[mid]) / 2 : merged[mid];\n}',
        python: 'def findMedianSortedArrays(nums1, nums2):\n    merged = sorted(nums1 + nums2)\n    mid = len(merged) // 2\n    return (merged[mid - 1] + merged[mid]) / 2 if len(merged) % 2 == 0 else float(merged[mid])'
      },
      hints: ['Partition both arrays such that left side has equal elements to right side.'],
      editorial: 'Binary search on the smaller array finds the partition where max(Left1, Left2) <= min(Right1, Right2).',
      test_cases: [
        { args: [[1, 3], [2]], expected: 2, is_hidden: false },
        { args: [[1, 2], [3, 4]], expected: 2.5, is_hidden: false },
        { args: [[0, 0], [0, 0]], expected: 0, is_hidden: true }
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
  for (const p of extraProblems) {
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
  console.log(`Successfully added ${extraProblems.length} additional curated interview challenges!`);
}
