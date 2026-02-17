import { Request, Response } from 'express';
import { TestResultStatus } from '@prisma/client';
import { prisma } from '../config/prisma';
import { z } from 'zod';
import { AuthenticatedRequest } from '../types';

const runSchema = z.object({ name: z.string().min(3) });
const resultSchema = z.object({
  testCaseId: z.number().int().positive(),
  status: z.nativeEnum(TestResultStatus)
});

export const listTestRuns = async (_req: Request, res: Response) => {
  const runs = await prisma.testRun.findMany({
    include: { _count: { select: { results: true } } },
    orderBy: { createdAt: 'desc' }
  });
  return res.json(runs);
};

export const createTestRun = async (req: Request, res: Response) => {
  const parsed = runSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const run = await prisma.testRun.create({ data: parsed.data });
  return res.status(201).json(run);
};

export const addResultToRun = async (req: AuthenticatedRequest, res: Response) => {
  const runId = Number(req.params.id);
  const parsed = resultSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const run = await prisma.testRun.findUnique({ where: { id: runId } });
  if (!run) return res.status(404).json({ error: 'Test run not found' });

  const tc = await prisma.testCase.findUnique({ where: { id: parsed.data.testCaseId } });
  if (!tc) return res.status(404).json({ error: 'Test case not found' });

  const result = await prisma.testResult.create({
    data: {
      testRunId: runId,
      testCaseId: parsed.data.testCaseId,
      status: parsed.data.status,
      executedBy: req.user!.userId
    }
  });
  return res.status(201).json(result);
};

export const getRunResults = async (req: Request, res: Response) => {
  const runId = Number(req.params.id);
  const results = await prisma.testResult.findMany({
    where: { testRunId: runId },
    include: {
      testCase: { select: { id: true, title: true } },
      user: { select: { id: true, username: true } }
    },
    orderBy: { executedAt: 'desc' }
  });
  return res.json(results);
};
