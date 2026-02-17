import request from 'supertest';
import app from '../src/app';
import { signToken } from '../src/utils/jwt';

jest.mock('../src/config/prisma', () => ({
  prisma: {
    testCase: {
      findMany: jest.fn(),
      create: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn()
    }
  }
}));

import { prisma } from '../src/config/prisma';

const mockedPrisma = prisma as jest.Mocked<typeof prisma>;

describe('Test Cases API', () => {
  const token = signToken({ userId: 1, role: 'admin' });

  beforeEach(() => jest.clearAllMocks());

  it('lists test cases for authenticated users', async () => {
    mockedPrisma.testCase.findMany.mockResolvedValue([
      { id: 1, title: 'Login test', description: 'desc', status: 'active', createdById: 1, createdAt: new Date() }
    ] as never);

    const res = await request(app).get('/testcases').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
  });

  it('creates a test case', async () => {
    mockedPrisma.testCase.create.mockResolvedValue({
      id: 2,
      title: 'Checkout test',
      description: 'desc',
      status: 'active',
      createdById: 1,
      createdAt: new Date()
    } as never);

    const res = await request(app)
      .post('/testcases')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'Checkout test', description: 'desc detail', status: 'active' });

    expect(res.status).toBe(201);
    expect(res.body.title).toBe('Checkout test');
  });
});
