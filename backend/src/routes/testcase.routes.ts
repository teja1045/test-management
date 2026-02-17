import { Router } from 'express';
import { UserRole } from '@prisma/client';
import { authRequired, authorize } from '../middleware/auth';
import {
  createTestCase,
  deleteTestCase,
  getTestCase,
  listTestCases,
  updateTestCase
} from '../controllers/testcase.controller';

const router = Router();

router.get('/', authRequired, listTestCases);
router.post('/', authRequired, createTestCase);
router.get('/:id', authRequired, getTestCase);
router.put('/:id', authRequired, updateTestCase);
router.delete('/:id', authRequired, authorize(UserRole.admin), deleteTestCase);

export default router;
