import { Request, Response } from 'express';
import { prisma } from '../config/prisma';

export const summary = async (_req: Request, res: Response) => {
  const [testCases, testRuns, results] = await Promise.all([
    prisma.testCase.count(),
    prisma.testRun.count(),
    prisma.testResult.groupBy({ by: ['status'], _count: { status: true } })
  ]);

  const byStatus = results.reduce<Record<string, number>>((acc, curr) => {
    acc[curr.status] = curr._count.status;
    return acc;
  }, {});

  return res.json({
    testCases,
    testRuns,
    resultsByStatus: {
      passed: byStatus.passed || 0,
      failed: byStatus.failed || 0,
      blocked: byStatus.blocked || 0
    }
  });
};
