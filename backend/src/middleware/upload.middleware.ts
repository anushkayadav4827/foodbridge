import multer from 'multer';
import { Request } from 'express';

// ============================================================================
// Configuration
// ============================================================================

const MAX_FILE_SIZE = parseInt(process.env.MAX_FILE_SIZE_MB || '10') * 1024 * 1024; // 10MB
const MAX_PHOTOS_PER_LISTING = parseInt(process.env.MAX_PHOTOS_PER_LISTING || '6');

// ============================================================================
// Multer Configuration
// ============================================================================

// Use memory storage (files stored in buffer)
const storage = multer.memoryStorage();

// File filter
const fileFilter = (
  req: Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  // Allowed mime types
  const allowedMimeTypes = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/heic',
    'image/webp',
  ];

  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPG, PNG, HEIC, and WebP images are allowed.'));
  }
};

// ============================================================================
// Multer Instances
// ============================================================================

// Single photo upload
export const uploadSinglePhoto = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: MAX_FILE_SIZE,
    files: 1,
  },
}).single('photo');

// Multiple photos upload
export const uploadMultiplePhotos = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: MAX_FILE_SIZE,
    files: MAX_PHOTOS_PER_LISTING,
  },
}).array('photos', MAX_PHOTOS_PER_LISTING);

// ============================================================================
// Error Handler Middleware
// ============================================================================

export function handleUploadError(
  error: any,
  req: Request,
  res: any,
  next: any
) {
  if (error instanceof multer.MulterError) {
    // Multer-specific errors
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        error: 'FILE_TOO_LARGE',
        message: `File size exceeds maximum allowed size of ${MAX_FILE_SIZE / 1024 / 1024}MB`,
      });
    }

    if (error.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        error: 'TOO_MANY_FILES',
        message: `Maximum ${MAX_PHOTOS_PER_LISTING} photos allowed per listing`,
      });
    }

    if (error.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({
        error: 'UNEXPECTED_FIELD',
        message: 'Unexpected file field in request',
      });
    }

    return res.status(400).json({
      error: 'UPLOAD_ERROR',
      message: error.message,
    });
  }

  if (error) {
    // Other errors (e.g., from fileFilter)
    return res.status(400).json({
      error: 'UPLOAD_ERROR',
      message: error.message,
    });
  }

  next();
}
