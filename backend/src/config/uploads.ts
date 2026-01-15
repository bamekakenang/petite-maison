import fs from 'fs';
import path from 'path';

export const UPLOADS_ROOT_DIR = process.env.UPLOAD_DIR
  ? path.resolve(process.env.UPLOAD_DIR)
  : path.resolve(process.cwd(), 'uploads');

export const PRODUCT_IMAGE_DIR = path.join(UPLOADS_ROOT_DIR, 'products');

export const UPLOAD_MAX_FILE_SIZE_MB = Number.parseInt(process.env.UPLOAD_MAX_FILE_SIZE_MB || '5', 10);
export const UPLOAD_MAX_FILE_SIZE_BYTES = UPLOAD_MAX_FILE_SIZE_MB * 1024 * 1024;

export function ensureUploadDirs(): void {
  fs.mkdirSync(PRODUCT_IMAGE_DIR, { recursive: true });
}

export function productImagePublicUrl(filename: string): string {
  return `/uploads/products/${filename}`;
}
