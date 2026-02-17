import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { env } from './config/env';
import authRoutes from './routes/auth.routes';
import testcaseRoutes from './routes/testcase.routes';
import testrunRoutes from './routes/testrun.routes';
import dashboardRoutes from './routes/dashboard.routes';

const app = express();

app.use(helmet());
app.use(cors({ origin: env.corsOrigin }));
app.use(express.json());

app.get('/health', (_req, res) => res.json({ status: 'ok' }));
app.use('/auth', authRoutes);
app.use('/testcases', testcaseRoutes);
app.use('/testruns', testrunRoutes);
app.use('/dashboard', dashboardRoutes);

app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  return res.status(500).json({ error: err.message || 'Unexpected error' });
});

export default app;
