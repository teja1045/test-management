import request from 'supertest';
import app from '../src/app';

jest.mock('../src/config/prisma', () => ({
  prisma: {
    user: {
      findFirst: jest.fn(),
      create: jest.fn(),
      findUnique: jest.fn()
    }
  }
}));

import { prisma } from '../src/config/prisma';

const mockedPrisma = prisma as jest.Mocked<typeof prisma>;

describe('Auth API', () => {
  beforeEach(() => jest.clearAllMocks());

  it('registers user and returns token', async () => {
    mockedPrisma.user.findFirst.mockResolvedValue(null as never);
    mockedPrisma.user.create.mockResolvedValue({
      id: 1,
      username: 'tester1',
      email: 'tester@example.com',
      hashedPassword: 'hashed',
      role: 'tester',
      createdAt: new Date()
    } as never);

    const res = await request(app).post('/auth/register').send({
      username: 'tester1',
      email: 'tester@example.com',
      password: 'secret123',
      role: 'tester'
    });

    expect(res.status).toBe(201);
    expect(res.body.token).toBeDefined();
    expect(res.body.user.email).toBe('tester@example.com');
  });
});
