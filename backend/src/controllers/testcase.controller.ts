import { Request, Response } from 'express';
import { prisma } from '../config/prisma';
import { z } from 'zod';
import { AuthenticatedRequest } from '../types';

const createSchema = z.object({
  title: z.string().min(3),
  description: z.string().min(5),
  status: z.string().default('active')
});

export const listTestCases = async (req: Request, res: Response) => {
  const status = req.query.status as string | undefined;
  const items = await prisma.testCase.findMany({
    where: status ? { status } : undefined,
    include: { createdBy: { select: { id: true, username: true, role: true } } },
    orderBy: { createdAt: 'desc' }
  });
  return res.json(items);
};

export const getTestCase = async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const item = await prisma.testCase.findUnique({ where: { id } });
  if (!item) return res.status(404).json({ error: 'Test case not found' });
  return res.json(item);
};

export const createTestCase = async (req: AuthenticatedRequest, res: Response) => {
  const parsed = createSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const item = await prisma.testCase.create({
    data: { ...parsed.data, createdById: req.user!.userId }
  });
  return res.status(201).json(item);
};

export const updateTestCase = async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const parsed = createSchema.partial().safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const item = await prisma.testCase.update({ where: { id }, data: parsed.data }).catch(() => null);
  if (!item) return res.status(404).json({ error: 'Test case not found' });
  return res.json(item);
};

export const deleteTestCase = async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const item = await prisma.testCase.delete({ where: { id } }).catch(() => null);
  if (!item) return res.status(404).json({ error: 'Test case not found' });
  return res.json({ message: 'Deleted successfully' });
};
