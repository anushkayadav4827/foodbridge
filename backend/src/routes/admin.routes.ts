import { Router } from 'express';
import { authenticate, requireRole } from '../middleware/auth.middleware';

const router = Router();

// All admin routes require authentication and admin role
router.use(authenticate);
router.use(requireRole('admin'));

router.get('/dashboard', (_req, res) => {
  res.status(501).json({ error: 'Not implemented yet - Admin dashboard' });
});

router.get('/users', (_req, res) => {
  res.status(501).json({ error: 'Not implemented yet - List users' });
});

router.get('/verifications', (_req, res) => {
  res.status(501).json({ error: 'Not implemented yet - Verification queue' });
});

router.get('/reports', (_req, res) => {
  res.status(501).json({ error: 'Not implemented yet - Reports queue' });
});

export default router;
