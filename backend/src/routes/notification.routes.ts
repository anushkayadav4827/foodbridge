import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticate);

router.get('/', (_req, res) => {
  res.status(501).json({ error: 'Not implemented yet - Get notifications' });
});

router.put('/:id/read', (_req, res) => {
  res.status(501).json({ error: 'Not implemented yet - Mark as read' });
});

export default router;
