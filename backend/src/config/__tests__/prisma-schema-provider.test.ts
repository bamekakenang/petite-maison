import fs from 'node:fs';
import path from 'node:path';

const readTextFile = (filePath: string): string => {
  if (!fs.existsSync(filePath)) {
    throw new Error(`Expected file to exist: ${filePath}`);
  }

  return fs.readFileSync(filePath, 'utf8');
};

const getPrismaDatasourceProvider = (schema: string, datasourceName = 'db'): string | null => {
  const datasourceRegex = new RegExp(`datasource\\s+${datasourceName}\\s*\\{([\\s\\S]*?)\\}`, 'm');
  const datasourceMatch = schema.match(datasourceRegex);

  if (!datasourceMatch) return null;

  const body = datasourceMatch[1];
  const providerMatch = body.match(/provider\s*=\s*"([^"]+)"/);
  return providerMatch?.[1] ?? null;
};

describe('Prisma schema database provider configuration', () => {
  it('backend Prisma schema uses sqlite provider (not postgresql)', () => {
    const schemaPath = path.resolve(__dirname, '../../../prisma/schema.prisma');
    const schema = readTextFile(schemaPath);

    const provider = getPrismaDatasourceProvider(schema);
    expect(provider).toBe('sqlite');
    expect(provider).not.toBe('postgresql');
  });

  it('backend Prisma migrations lock uses sqlite provider', () => {
    const lockPath = path.resolve(__dirname, '../../../prisma/migrations/migration_lock.toml');
    const lock = readTextFile(lockPath);

    expect(lock).toMatch(/provider\s*=\s*"sqlite"/);
    expect(lock).not.toMatch(/provider\s*=\s*"postgresql"/);
  });

  it('frontend Prisma schema uses sqlite provider (not postgresql)', () => {
    const schemaPath = path.resolve(__dirname, '../../../../apps/frontend/prisma/schema.prisma');
    const schema = readTextFile(schemaPath);

    const provider = getPrismaDatasourceProvider(schema);
    expect(provider).toBe('sqlite');
    expect(provider).not.toBe('postgresql');
  });

  it('frontend Prisma migrations lock uses sqlite provider', () => {
    const lockPath = path.resolve(
      __dirname,
      '../../../../apps/frontend/prisma/migrations/migration_lock.toml'
    );
    const lock = readTextFile(lockPath);

    expect(lock).toMatch(/provider\s*=\s*"sqlite"/);
    expect(lock).not.toMatch(/provider\s*=\s*"postgresql"/);
  });
});
