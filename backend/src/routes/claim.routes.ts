import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import {
  acceptClaim,
  rejectClaim,
  getPendingClaims,
  getClaimDetails,
} from '../controllers/claim.controller';

// Claim routes
const router = Router();

router.use(authenticate);

// Get pending claims for donor
router.get('/pending', getPendingClaims);

// Get claim details
router.get('/:id', getClaimDetails);

// Accept claim
router.put('/:id/accept', acceptClaim);

// Reject claim
router.put('/:id/reject', rejectClaim);

// Get claims for a listing (moved to listing routes)
// router.get('/listings/:listingId/claims', getClaimsForListing);

// TODO: Implement pickup and delivery confirmation
router.put('/:id/pickup', (_req, res) => {
  res.status(501).json({ error: 'Not implemented yet - Confirm pickup' });
});

router.put('/:id/deliver', (_req, res) => {
  res.status(501).json({ error: 'Not implemented yet - Confirm delivery' });
});

export default router;
