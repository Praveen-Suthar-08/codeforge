export interface User {
  id: string;
  username: string;
  email: string;
  role: 'user' | 'admin';
  twoFactorEnabled?: boolean;
  createdAt?: number;
}

export interface Problem {
  id: string;
  title: string;
  slug: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  points: number;
  category: string;
  tags: string[];
  companies: string[];
  function_name?: string;
  description?: string;
  examples?: Array<{ input: string; output: string; explanation?: string }>;
  starter_code?: Record<string, string>;
  hints?: string[];
  editorial?: string;
  test_cases?: Array<{ id: number; args: any; expected: any; isHidden: boolean }>;
  isSolved?: boolean;
  isBookmarked?: boolean;
}

export interface TestCaseResult {
  testIndex: number;
  args?: any;
  expected?: any;
  got?: any;
  error?: string;
  ok: boolean;
  runtimeMs?: number;
  isHidden?: boolean;
}

export interface ExecutionResult {
  verdict: string;
  runtimeMs: number;
  memoryKb: number;
  passedTestCases: number;
  totalTestCases: number;
  details?: TestCaseResult[];
  isSampleRun?: boolean;
  queuePosition?: number;
}

export interface Contest {
  id: string;
  title: string;
  description: string;
  start_time: number;
  end_time: number;
  problemIds: string[];
}

export interface MiniProject {
  id: string;
  title: string;
  description: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  steps: Array<{ id: string; title: string; desc: string }>;
  starterFiles: Record<string, string>;
}

export interface LeaderboardEntry {
  rank: number;
  id: string;
  username: string;
  score: number;
  solvedCount: number;
  totalSubs: number;
}
