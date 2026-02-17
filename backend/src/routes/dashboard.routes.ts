import { Router } from 'express';
import { authRequired } from '../middleware/auth';
import { summary } from '../controllers/dashboard.controller';

const router = Router();
router.get('/summary', authRequired, summary);

export default router;
