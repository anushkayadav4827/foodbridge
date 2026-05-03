import { Request, Response } from 'express';
import photoService from '../services/photo.service';
import logger from '../utils/logger';

// ============================================================================
// Photo Controller
// ============================================================================

class PhotoController {
  /**
   * Upload photos for a listing
   * POST /api/v1/listings/:id/photos
   */
  async uploadPhotos(req: Request, res: Response): Promise<void> {
    try {
      const { id: listingId } = req.params;
      const files = req.files as Express.Multer.File[];

      if (!files || files.length === 0) {
        res.status(400).json({
          error: 'NO_FILES',
          message: 'No photos provided',
        });
        return;
      }

      // Upload and process photos
      const results = await photoService.uploadPhotos(files, listingId);

      logger.info('Photos uploaded successfully', {
        listingId,
        count: results.length,
        userId: (req as any).user?.id,
      });

      res.status(200).json({
        message: 'Photos uploaded successfully',
        photos: results,
      });
    } catch (error: any) {
      logger.error('Photo upload failed:', error);
      res.status(500).json({
        error: 'UPLOAD_FAILED',
        message: error.message || 'Failed to upload photos',
      });
    }
  }

  /**
   * Delete a photo from a listing
   * DELETE /api/v1/listings/:id/photos/:photoId
   */
  async deletePhoto(req: Request, res: Response): Promise<void> {
    try {
      const { id: listingId, photoId } = req.params;
      const { photoUrl } = req.body;

      if (!photoUrl) {
        res.status(400).json({
          error: 'MISSING_PHOTO_URL',
          message: 'Photo URL is required',
        });
        return;
      }

      // Delete photo from storage
      await photoService.deletePhoto(photoUrl, listingId);

      // Note: Actual removal from listing.photoUrls array happens in listing service

      logger.info('Photo deleted successfully', {
        listingId,
        photoId,
        userId: (req as any).user?.id,
      });

      res.status(200).json({
        message: 'Photo deleted successfully',
      });
    } catch (error: any) {
      logger.error('Photo deletion failed:', error);
      res.status(500).json({
        error: 'DELETE_FAILED',
        message: error.message || 'Failed to delete photo',
      });
    }
  }

  /**
   * Reorder photos in a listing
   * PUT /api/v1/listings/:id/photos/reorder
   */
  async reorderPhotos(req: Request, res: Response): Promise<void> {
    try {
      const { id: listingId } = req.params;
      const { photoUrls } = req.body;

      if (!photoUrls || !Array.isArray(photoUrls)) {
        res.status(400).json({
          error: 'INVALID_PHOTO_URLS',
          message: 'Photo URLs array is required',
        });
        return;
      }

      // Validate and reorder
      const reorderedUrls = photoService.reorderPhotos(photoUrls);

      // Note: Actual update of listing.photoUrls happens in listing service

      logger.info('Photos reordered successfully', {
        listingId,
        count: reorderedUrls.length,
        userId: (req as any).user?.id,
      });

      res.status(200).json({
        message: 'Photos reordered successfully',
        photoUrls: reorderedUrls,
      });
    } catch (error: any) {
      logger.error('Photo reordering failed:', error);
      res.status(400).json({
        error: 'REORDER_FAILED',
        message: error.message || 'Failed to reorder photos',
      });
    }
  }

  /**
   * Set cover photo for a listing
   * PUT /api/v1/listings/:id/photos/cover
   */
  async setCoverPhoto(req: Request, res: Response): Promise<void> {
    try {
      const { id: listingId } = req.params;
      const { photoUrls, coverPhotoUrl } = req.body;

      if (!photoUrls || !Array.isArray(photoUrls)) {
        res.status(400).json({
          error: 'INVALID_PHOTO_URLS',
          message: 'Photo URLs array is required',
        });
        return;
      }

      if (!coverPhotoUrl) {
        res.status(400).json({
          error: 'MISSING_COVER_PHOTO',
          message: 'Cover photo URL is required',
        });
        return;
      }

      // Validate and set cover photo
      const validatedCoverUrl = photoService.setCoverPhoto(photoUrls, coverPhotoUrl);

      // Note: Actual update of listing.coverPhotoUrl happens in listing service

      logger.info('Cover photo set successfully', {
        listingId,
        coverPhotoUrl: validatedCoverUrl,
        userId: (req as any).user?.id,
      });

      res.status(200).json({
        message: 'Cover photo set successfully',
        coverPhotoUrl: validatedCoverUrl,
      });
    } catch (error: any) {
      logger.error('Setting cover photo failed:', error);
      res.status(400).json({
        error: 'SET_COVER_FAILED',
        message: error.message || 'Failed to set cover photo',
      });
    }
  }
}

export default new PhotoController();
