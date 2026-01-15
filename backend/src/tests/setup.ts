import fs from 'fs';
import os from 'os';
import path from 'path';
import { execSync } from 'child_process';

jest.setTimeout(60_000);

// IMPORTANT: set env vars before importing any module that initializes Prisma/multer
const TEST_ROOT = fs.mkdtempSync(path.join(os.tmpdir(), 'petite-maison-test-'));

process.env.NODE_ENV = 'test';
process.env.API_VERSION = process.env.API_VERSION || 'v1';

process.env.JWT_SECRET = process.env.JWT_SECRET || 'test_jwt_secret';
process.env.JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'test_refresh_secret';

process.env.BCRYPT_ROUNDS = process.env.BCRYPT_ROUNDS || '4';
process.env.LOG_LEVEL = process.env.LOG_LEVEL || 'error';

process.env.RATE_LIMIT_MAX_REQUESTS = process.env.RATE_LIMIT_MAX_REQUESTS || '100000';
process.env.AUTH_RATE_LIMIT_MAX_REQUESTS = process.env.AUTH_RATE_LIMIT_MAX_REQUESTS || '100000';

process.env.UPLOAD_MAX_FILE_SIZE_MB = process.env.UPLOAD_MAX_FILE_SIZE_MB || '1';
process.env.UPLOAD_DIR = process.env.UPLOAD_DIR || path.join(TEST_ROOT, 'uploads');
process.env.LOG_FILE_PATH = process.env.LOG_FILE_PATH || path.join(TEST_ROOT, 'logs');

// Dedicated SQLite database file for tests
const DB_FILE = path.join(TEST_ROOT, 'test.db');
process.env.DATABASE_URL = process.env.DATABASE_URL || `file:${DB_FILE}`;

function getPrisma() {
  // Some unit tests mock the database module; always use the real Prisma client for setup/cleanup.
  const mod = jest.requireActual('../config/database') as typeof import('../config/database');
  return mod.prisma;
}

function runPrismaMigrations(): void {
  const backendRoot = path.resolve(__dirname, '..', '..');

  execSync('npx prisma migrate deploy', {
    cwd: backendRoot,
    stdio: 'inherit',
    env: {
      ...process.env,
      DATABASE_URL: process.env.DATABASE_URL as string,
    },
  });
}

beforeAll(async () => {
  runPrismaMigrations();
});

afterEach(async () => {
  const prisma = getPrisma();

  // Clean database between tests (order matters due to FK constraints)
  await prisma.orderItem.deleteMany();
  await prisma.cartItem.deleteMany();
  await prisma.refreshToken.deleteMany();
  await prisma.order.deleteMany();
  await prisma.cart.deleteMany();
  await prisma.product.deleteMany();
  await prisma.user.deleteMany();

  // Clean uploads between tests
  const uploadDir = process.env.UPLOAD_DIR;
  if (uploadDir && fs.existsSync(uploadDir)) {
    fs.rmSync(uploadDir, { recursive: true, force: true });
  }
});

afterAll(async () => {
  const prisma = getPrisma();
  await prisma.$disconnect();

  // Best-effort cleanup of temp dir
  try {
    fs.rmSync(TEST_ROOT, { recursive: true, force: true });
  } catch {
    // ignore
  }
});
