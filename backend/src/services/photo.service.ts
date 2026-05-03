import sharp from 'sharp';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import fs from 'fs/promises';
import logger from '../utils/logger';

// ============================================================================
// Types
// ============================================================================

export interface PhotoUploadResult {
  url: string;
  thumbnailUrl: string;
  width: number;
  height: number;
  size: number;
}

export interface ValidationResult {
  valid: boolean;
  error?: string;
}

// ============================================================================
// Configuration
// ============================================================================

const MAX_FILE_SIZE = parseInt(process.env.MAX_FILE_SIZE_MB || '10') * 1024 * 1024; // 10MB
const MAX_PHOTOS_PER_LISTING = parseInt(process.env.MAX_PHOTOS_PER_LISTING || '6');
const MAX_WIDTH = 1920;
const THUMBNAIL_SIZE = 300;
const COMPRESSION_QUALITY = 85;

const ALLOWED_FORMATS = ['jpg', 'jpeg', 'png', 'heic', 'webp'];
const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/heic',
  'image/webp',
];

// Storage configuration
const USE_S3 = process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY;
const LOCAL_UPLOAD_DIR = path.join(__dirname, '../../uploads/photos');
const CDN_BASE_URL = process.env.AWS_CLOUDFRONT_URL || 'http://localhost:3005/uploads/photos';

// ============================================================================
// Photo Service
// ============================================================================

class PhotoService {
  /**
   * Validate photo file
   */
  async validatePhoto(file: Express.Multer.File): Promise<ValidationResult> {
    // Check file size
    if (file.size > MAX_FILE_SIZE) {
      return {
        valid: false,
        error: `File size exceeds maximum allowed size of ${MAX_FILE_SIZE / 1024 / 1024}MB`,
      };
    }

    // Check mime type
    if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      return {
        valid: false,
        error: `Invalid file type. Allowed types: ${ALLOWED_FORMATS.join(', ')}`,
      };
    }

    // Check file extension
    const ext = path.extname(file.originalname).toLowerCase().replace('.', '');
    if (!ALLOWED_FORMATS.includes(ext)) {
      return {
        valid: false,
        error: `Invalid file extension. Allowed extensions: ${ALLOWED_FORMATS.join(', ')}`,
      };
    }

    // Verify it's actually an image using sharp
    try {
      const metadata = await sharp(file.buffer).metadata();
      if (!metadata.format) {
        return {
          valid: false,
          error: 'File is not a valid image',
        };
      }
    } catch (error) {
      return {
        valid: false,
        error: 'File is corrupted or not a valid image',
      };
    }

    return { valid: true };
  }

  /**
   * Compress photo to max width with quality optimization
   */
  async compressPhoto(buffer: Buffer): Promise<Buffer> {
    try {
      const image = sharp(buffer);
      const metadata = await image.metadata();

      // Resize if width exceeds max
      let pipeline = image;
      if (metadata.width && metadata.width > MAX_WIDTH) {
        pipeline = pipeline.resize(MAX_WIDTH, null, {
          fit: 'inside',
          withoutEnlargement: true,
        });
      }

      // Convert to JPEG with quality optimization
      const compressed = await pipeline
        .jpeg({
          quality: COMPRESSION_QUALITY,
          progressive: true,
          mozjpeg: true,
        })
        .toBuffer();

      logger.info('Photo compressed', {
        originalSize: buffer.length,
        compressedSize: compressed.length,
        reduction: `${(((buffer.length - compressed.length) / buffer.length) * 100).toFixed(1)}%`,
      });

      return compressed;
    } catch (error) {
      logger.error('Photo compression failed:', error);
      throw new Error('Failed to compress photo');
    }
  }

  /**
   * Generate thumbnail
   */
  async generateThumbnail(buffer: Buffer): Promise<Buffer> {
    try {
      const thumbnail = await sharp(buffer)
        .resize(THUMBNAIL_SIZE, THUMBNAIL_SIZE, {
          fit: 'cover',
          position: 'center',
        })
        .jpeg({
          quality: 80,
          progressive: true,
        })
        .toBuffer();

      return thumbnail;
    } catch (error) {
      logger.error('Thumbnail generation failed:', error);
      throw new Error('Failed to generate thumbnail');
    }
  }

  /**
   * Upload photo to storage (S3 or local)
   */
  async uploadToStorage(
    buffer: Buffer,
    listingId: string,
    filename: string
  ): Promise<string> {
    if (USE_S3) {
      return await this.uploadToS3(buffer, listingId, filename);
    } else {
      return await this.uploadToLocal(buffer, listingId, filename);
    }
  }

  /**
   * Upload to S3
   */
  private async uploadToS3(
    buffer: Buffer,
    listingId: string,
    filename: string
  ): Promise<string> {
    // S3 upload implementation
    // This is a placeholder - actual S3 implementation would use aws-sdk
    const AWS = require('aws-sdk');
    const s3 = new AWS.S3({
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      region: process.env.AWS_REGION || 'ap-south-1',
    });

    const key = `listings/${listingId}/${filename}`;
    const params = {
      Bucket: process.env.AWS_S3_BUCKET || 'foodbridge-uploads',
      Key: key,
      Body: buffer,
      ContentType: 'image/jpeg',
      ACL: 'public-read',
    };

    try {
      const result = await s3.upload(params).promise();
      logger.info('Photo uploaded to S3', { key, location: result.Location });
      
      // Return CloudFront URL if available, otherwise S3 URL
      if (process.env.AWS_CLOUDFRONT_URL) {
        return `${process.env.AWS_CLOUDFRONT_URL}/${key}`;
      }
      return result.Location;
    } catch (error) {
      logger.error('S3 upload failed:', error);
      throw new Error('Failed to upload photo to S3');
    }
  }

  /**
   * Upload to local filesystem
   */
  private async uploadToLocal(
    buffer: Buffer,
    listingId: string,
    filename: string
  ): Promise<string> {
    try {
      // Ensure upload directory exists
      const listingDir = path.join(LOCAL_UPLOAD_DIR, listingId);
      await fs.mkdir(listingDir, { recursive: true });

      // Write file
      const filePath = path.join(listingDir, filename);
      await fs.writeFile(filePath, buffer);

      logger.info('Photo uploaded to local storage', { filePath });

      // Return URL
      return `${CDN_BASE_URL}/${listingId}/${filename}`;
    } catch (error) {
      logger.error('Local upload failed:', error);
      throw new Error('Failed to upload photo to local storage');
    }
  }

  /**
   * Upload multiple photos for a listing
   */
  async uploadPhotos(
    files: Express.Multer.File[],
    listingId: string
  ): Promise<PhotoUploadResult[]> {
    // Validate photo count
    if (files.length > MAX_PHOTOS_PER_LISTING) {
      throw new Error(`Maximum ${MAX_PHOTOS_PER_LISTING} photos allowed per listing`);
    }

    const results: PhotoUploadResult[] = [];

    for (const file of files) {
      try {
        // Validate photo
        const validation = await this.validatePhoto(file);
        if (!validation.valid) {
          throw new Error(validation.error);
        }

        // Get original metadata
        await sharp(file.buffer).metadata();

        // Compress photo
        const compressedBuffer = await this.compressPhoto(file.buffer);
        const compressedMetadata = await sharp(compressedBuffer).metadata();

        // Generate thumbnail
        const thumbnailBuffer = await this.generateThumbnail(compressedBuffer);

        // Generate unique filenames
        const photoId = uuidv4();
        const photoFilename = `${photoId}-compressed.jpg`;
        const thumbnailFilename = `${photoId}-thumbnail.jpg`;

        // Upload both
        const [photoUrl, thumbnailUrl] = await Promise.all([
          this.uploadToStorage(compressedBuffer, listingId, photoFilename),
          this.uploadToStorage(thumbnailBuffer, listingId, thumbnailFilename),
        ]);

        results.push({
          url: photoUrl,
          thumbnailUrl: thumbnailUrl,
          width: compressedMetadata.width || 0,
          height: compressedMetadata.height || 0,
          size: compressedBuffer.length,
        });

        logger.info('Photo processed successfully', {
          listingId,
          photoId,
          originalSize: file.size,
          compressedSize: compressedBuffer.length,
        });
      } catch (error) {
        logger.error('Photo upload failed:', { file: file.originalname, error });
        throw error;
      }
    }

    return results;
  }

  /**
   * Delete photo from storage
   */
  async deletePhoto(photoUrl: string, listingId: string): Promise<void> {
    try {
      if (USE_S3) {
        await this.deleteFromS3(photoUrl);
      } else {
        await this.deleteFromLocal(photoUrl, listingId);
      }

      logger.info('Photo deleted', { photoUrl, listingId });
    } catch (error) {
      logger.error('Photo deletion failed:', { photoUrl, error });
      throw new Error('Failed to delete photo');
    }
  }

  /**
   * Delete from S3
   */
  private async deleteFromS3(photoUrl: string): Promise<void> {
    const AWS = require('aws-sdk');
    const s3 = new AWS.S3({
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      region: process.env.AWS_REGION || 'ap-south-1',
    });

    // Extract key from URL
    const urlParts = photoUrl.split('/');
    const key = urlParts.slice(-3).join('/'); // listings/{listingId}/{filename}

    const params = {
      Bucket: process.env.AWS_S3_BUCKET || 'foodbridge-uploads',
      Key: key,
    };

    await s3.deleteObject(params).promise();
  }

  /**
   * Delete from local filesystem
   */
  private async deleteFromLocal(photoUrl: string, listingId: string): Promise<void> {
    // Extract filename from URL
    const filename = path.basename(photoUrl);
    const filePath = path.join(LOCAL_UPLOAD_DIR, listingId, filename);

    try {
      await fs.unlink(filePath);
    } catch (error: any) {
      if (error.code !== 'ENOENT') {
        throw error;
      }
      // File doesn't exist, ignore
    }
  }

  /**
   * Reorder photos (just returns the new order, actual update happens in listing service)
   */
  reorderPhotos(photoUrls: string[]): string[] {
    if (photoUrls.length > MAX_PHOTOS_PER_LISTING) {
      throw new Error(`Maximum ${MAX_PHOTOS_PER_LISTING} photos allowed per listing`);
    }
    return photoUrls;
  }

  /**
   * Set cover photo (returns the URL, actual update happens in listing service)
   */
  setCoverPhoto(photoUrls: string[], coverPhotoUrl: string): string {
    if (!photoUrls.includes(coverPhotoUrl)) {
      throw new Error('Cover photo must be one of the listing photos');
    }
    return coverPhotoUrl;
  }

  /**
   * Get photo metadata
   */
  async getPhotoMetadata(buffer: Buffer): Promise<sharp.Metadata> {
    return await sharp(buffer).metadata();
  }
}

// Export singleton instance
export default new PhotoService();
