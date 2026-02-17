import { Router } from 'express';
import { authRequired } from '../middleware/auth';
import { addResultToRun, createTestRun, getRunResults, listTestRuns } from '../controllers/testrun.controller';

const router = Router();

router.get('/', authRequired, listTestRuns);
router.post('/', authRequired, createTestRun);
router.post('/:id/results', authRequired, addResultToRun);
router.get('/:id/results', authRequired, getRunResults);

export default router;
