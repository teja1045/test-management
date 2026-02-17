export type Role = 'admin' | 'tester';

export type User = {
  id: number;
  username: string;
  email: string;
  role: Role;
};

export type TestCase = {
  id: number;
  title: string;
  description: string;
  status: string;
  createdAt: string;
};

export type TestRun = {
  id: number;
  name: string;
  createdAt: string;
  _count?: { results: number };
};

export type TestResult = {
  id: number;
  status: 'passed' | 'failed' | 'blocked';
  executedAt: string;
  testCase: { id: number; title: string };
  user: { id: number; username: string };
};
