// Listing Controller - Handles HTTP requests for listings
import { Request, Response, NextFunction } from 'express';
import { ListingService, DraftService } from '../services/listing.service';
import {
  CreateListingDTO,
  UpdateListingDTO,
  ListingFilters,
  CancellationReason,
} from '../types/listing.types';
import logger from '../utils/logger';

export class ListingController {
  /**
   * Create a new listing
   * POST /api/v1/listings
   */
  static async createListing(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const donorId = (req as any).user.userId;
      const data: CreateListingDTO = req.body;

      const listing = await ListingService.createListing(donorId, data);

      // Delete draft if exists
      await DraftService.deleteDraftByDonor(donorId);

      res.status(201).json({
        success: true,
        data: listing,
      });
    } catch (error) {
      logger.error('Error creating listing:', error);
      next(error);
    }
  }

  /**
   * Update an existing listing
   * PUT /api/v1/listings/:id
   */
  static async updateListing(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const donorId = (req as any).user.userId;
      const listingId = req.params.id;
      const data: UpdateListingDTO = req.body;

      const listing = await ListingService.updateListing(listingId, donorId, data);

      res.json({
        success: true,
        data: listing,
      });
    } catch (error) {
      logger.error('Error updating listing:', error);
      next(error);
    }
  }

  /**
   * Cancel a listing
   * DELETE /api/v1/listings/:id
   */
  static async cancelListing(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const donorId = (req as any).user.userId;
      const listingId = req.params.id;
      const reason: CancellationReason = req.body;

      const listing = await ListingService.cancelListing(listingId, donorId, reason);

      res.json({
        success: true,
        data: listing,
        message: 'Listing cancelled successfully',
      });
    } catch (error) {
      logger.error('Error cancelling listing:', error);
      next(error);
    }
  }

  /**
   * Get a single listing
   * GET /api/v1/listings/:id
   */
  static async getListing(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const listingId = req.params.id;

      const listing = await ListingService.getListing(listingId);

      if (!listing) {
        res.status(404).json({
          success: false,
          error: 'Listing not found',
        });
        return;
      }

      res.json({
        success: true,
        data: listing,
      });
    } catch (error) {
      logger.error('Error getting listing:', error);
      next(error);
    }
  }

  /**
   * Get listings with filters
   * GET /api/v1/listings
   */
  static async getListings(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const filters: ListingFilters = {
        donorId: req.query.donorId as string,
        status: req.query.status ? (req.query.status as string).split(',') as any : undefined,
        sortBy: req.query.sortBy as any,
        page: parseInt(req.query.page as string) || 1,
        limit: parseInt(req.query.limit as string) || 20,
        search: req.query.search as string,
      };

      const result = await ListingService.getListings(filters);

      res.json({
        success: true,
        data: result.listings,
        pagination: {
          page: result.page,
          limit: result.limit,
          total: result.total,
          totalPages: result.totalPages,
        },
      });
    } catch (error) {
      logger.error('Error getting listings:', error);
      next(error);
    }
  }

  /**
   * Get donor's own listings
   * GET /api/v1/listings/me
   */
  static async getMyListings(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const donorId = (req as any).user.userId;

      const filters: ListingFilters = {
        donorId,
        status: req.query.status ? (req.query.status as string).split(',') as any : undefined,
        sortBy: req.query.sortBy as any,
        page: parseInt(req.query.page as string) || 1,
        limit: parseInt(req.query.limit as string) || 20,
        search: req.query.search as string,
      };

      const result = await ListingService.getListings(filters);

      res.json({
        success: true,
        data: result.listings,
        pagination: {
          page: result.page,
          limit: result.limit,
          total: result.total,
          totalPages: result.totalPages,
        },
      });
    } catch (error) {
      logger.error('Error getting my listings:', error);
      next(error);
    }
  }

  /**
   * Save draft
   * POST /api/v1/listings/drafts
   */
  static async saveDraft(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const donorId = (req as any).user.userId;
      const { data, currentStep } = req.body;

      const draft = await DraftService.saveDraft(donorId, data, currentStep);

      res.json({
        success: true,
        data: draft,
        message: 'Draft saved successfully',
      });
    } catch (error) {
      logger.error('Error saving draft:', error);
      next(error);
    }
  }

  /**
   * Get draft
   * GET /api/v1/listings/drafts/me
   */
  static async getMyDraft(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const donorId = (req as any).user.userId;

      const draft = await DraftService.getDraftByDonor(donorId);

      if (!draft) {
        res.status(404).json({
          success: false,
          error: 'No draft found',
        });
        return;
      }

      res.json({
        success: true,
        data: draft,
      });
    } catch (error) {
      logger.error('Error getting draft:', error);
      next(error);
    }
  }

  /**
   * Delete draft
   * DELETE /api/v1/listings/drafts/:id
   */
  static async deleteDraft(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const draftId = req.params.id;

      await DraftService.deleteDraft(draftId);

      res.json({
        success: true,
        message: 'Draft deleted successfully',
      });
    } catch (error) {
      logger.error('Error deleting draft:', error);
      next(error);
    }
  }
}

