import { Request, Response, NextFunction } from 'express';
import multer from 'multer';
import path from 'path';
import { ValidationError } from '../utils/errors';
import {
  ensureUploadDirs,
  PRODUCT_IMAGE_DIR,
  UPLOAD_MAX_FILE_SIZE_BYTES,
  UPLOAD_MAX_FILE_SIZE_MB,
} from '../config/uploads';

ensureUploadDirs();

const allowedMimeTypes = new Set<string>([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
]);

function safeBaseName(originalName: string): string {
  const ext = path.extname(originalName);
  const base = path.basename(originalName, ext);
  const normalized = base
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 50);

  return normalized || 'image';
}

function extensionForMimeType(mimeType: string): string {
  switch (mimeType) {
    case 'image/jpeg':
      return '.jpg';
    case 'image/png':
      return '.png';
    case 'image/webp':
      return '.webp';
    case 'image/gif':
      return '.gif';
    default:
      return '';
  }
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    // Ensure the directory exists at write-time (tests may clean it between runs)
    ensureUploadDirs();
    cb(null, PRODUCT_IMAGE_DIR);
  },
  filename: (_req, file, cb) => {
    const ext = extensionForMimeType(file.mimetype);
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const base = safeBaseName(file.originalname || 'image');
    cb(null, `${base}-${unique}${ext}`);
  },
});

const uploader = multer({
  storage,
  limits: {
    fileSize: UPLOAD_MAX_FILE_SIZE_BYTES,
  },
  fileFilter: (_req, file, cb) => {
    if (allowedMimeTypes.has(file.mimetype)) {
      return cb(null, true);
    }

    return cb(
      new ValidationError('Invalid file type. Only JPEG/PNG/WEBP/GIF images are allowed.') as any
    );
  },
});

/**
 * Uploads a single product image if request is multipart/form-data.
 * If the request is JSON, it is a no-op.
 */
export function maybeUploadProductImage(req: Request, res: Response, next: NextFunction): void {
  const contentType = req.headers['content-type'];
  const isMultipart = typeof contentType === 'string' && contentType.includes('multipart/form-data');

  if (!isMultipart) {
    next();
    return;
  }

  uploader.single('image')(req, res, (err: any) => {
    if (!err) {
      next();
      return;
    }

    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        next(new ValidationError(`File too large. Max ${UPLOAD_MAX_FILE_SIZE_MB}MB.`));
        return;
      }

      next(new ValidationError(err.message));
      return;
    }

    next(err);
  });
}
