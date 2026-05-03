import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { claimService } from '../services/claim.service';
import logger from '../utils/logger';

/**
 * Accept a claim
 * POST /api/v1/claims/:id/accept
 */
export async function acceptClaim(req: AuthRequest, res: Response): Promise<void> {
  try {
    const claimId = req.params.id;
    const donorId = req.user!.id; // From auth middleware

    const result = await claimService.acceptClaim(claimId, donorId);

    res.status(200).json({
      success: true,
      message: 'Claim accepted successfully',
      data: {
        claim: result.claim,
        pickupCode: result.pickupCode,
        rejectedClaimIds: result.rejectedClaimIds,
      },
    });
  } catch (error: any) {
    logger.error('Error in acceptClaim controller:', error);
    
    if (error.message.includes('not found')) {
      res.status(404).json({
        success: false,
        error: error.message,
      });
    } else if (error.message.includes('Unauthorized')) {
      res.status(403).json({
        success: false,
        error: error.message,
      });
    } else if (error.message.includes('Cannot accept')) {
      res.status(400).json({
        success: false,
        error: error.message,
      });
    } else {
      res.status(500).json({
        success: false,
        error: 'Failed to accept claim',
      });
    }
  }
}

/**
 * Reject a claim
 * POST /api/v1/claims/:id/reject
 */
export async function rejectClaim(req: AuthRequest, res: Response): Promise<void> {
  try {
    const claimId = req.params.id;
    const donorId = req.user!.id; // From auth middleware
    const { reason } = req.body;

    if (!reason || reason.trim().length === 0) {
      res.status(400).json({
        success: false,
        error: 'Rejection reason is required',
      });
      return;
    }

    const claim = await claimService.rejectClaim(claimId, donorId, reason);

    res.status(200).json({
      success: true,
      message: 'Claim rejected successfully',
      data: claim,
    });
  } catch (error: any) {
    logger.error('Error in rejectClaim controller:', error);
    
    if (error.message.includes('not found')) {
      res.status(404).json({
        success: false,
        error: error.message,
      });
    } else if (error.message.includes('Unauthorized')) {
      res.status(403).json({
        success: false,
        error: error.message,
      });
    } else if (error.message.includes('Cannot reject')) {
      res.status(400).json({
        success: false,
        error: error.message,
      });
    } else {
      res.status(500).json({
        success: false,
        error: 'Failed to reject claim',
      });
    }
  }
}

/**
 * Get pending claims for donor
 * GET /api/v1/claims/pending
 */
export async function getPendingClaims(req: AuthRequest, res: Response): Promise<void> {
  try {
    const donorId = req.user!.id; // From auth middleware

    const claims = await claimService.getPendingClaims(donorId);

    res.status(200).json({
      success: true,
      data: claims,
      count: claims.length,
    });
  } catch (error: any) {
    logger.error('Error in getPendingClaims controller:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get pending claims',
    });
  }
}

/**
 * Get claim details
 * GET /api/v1/claims/:id
 */
export async function getClaimDetails(req: AuthRequest, res: Response): Promise<void> {
  try {
    const claimId = req.params.id;

    const claim = await claimService.getClaimDetails(claimId);

    res.status(200).json({
      success: true,
      data: claim,
    });
  } catch (error: any) {
    logger.error('Error in getClaimDetails controller:', error);
    
    if (error.message.includes('not found')) {
      res.status(404).json({
        success: false,
        error: error.message,
      });
    } else {
      res.status(500).json({
        success: false,
        error: 'Failed to get claim details',
      });
    }
  }
}

/**
 * Get claims for a listing
 * GET /api/v1/listings/:listingId/claims
 */
export async function getClaimsForListing(req: AuthRequest, res: Response): Promise<void> {
  try {
    const listingId = req.params.listingId;

    const claims = await claimService.getClaimsForListing(listingId);

    res.status(200).json({
      success: true,
      data: claims,
      count: claims.length,
    });
  } catch (error: any) {
    logger.error('Error in getClaimsForListing controller:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get claims for listing',
    });
  }
}
