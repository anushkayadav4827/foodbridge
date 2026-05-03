import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticate);

router.post('/', (_req, res) => {
  res.status(501).json({ error: 'Not implemented yet - Create rating' });
});

export default router;
