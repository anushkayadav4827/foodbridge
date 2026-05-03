import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

// All routes require authentication
router.use(authenticate);

// TODO: Implement user routes
// GET /api/v1/users/:id - Get user profile
// PUT /api/v1/users/:id - Update user profile
// GET /api/v1/users/:id/stats - Get user statistics
// POST /api/v1/users/:id/upload-document - Upload verification document
// etc.

router.get('/:id', (_req, res) => {
  res.status(501).json({ error: 'Not implemented yet' });
});

export default router;
