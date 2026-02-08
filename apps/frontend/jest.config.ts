import type { Config } from '@jest/types';

const config: Config.InitialOptions = {
  testEnvironment: 'jsdom',
  roots: ['<rootDir>/__tests__'],
  testMatch: ['**/__tests__/**/*.test.ts', '**/__tests__/**/*.test.tsx'],
  transform: {
    '^.+\\.tsx?$': ['ts-jest', {
      tsconfig: {
        jsx: 'react-jsx',
        module: 'commonjs',
        esModuleInterop: true,
        moduleResolution: 'node',
      },
    }],
  },
  moduleNameMapper: {
    // Handle CSS/image imports
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    '\\.(jpg|jpeg|png|gif|webp|svg)$': '<rootDir>/__tests__/__mocks__/fileMock.ts',
    // Handle @/ path alias
    '^@/(.*)$': '<rootDir>/$1',
    // Mock Next.js modules
    '^next/link$': '<rootDir>/__tests__/__mocks__/next-link.tsx',
    '^next-intl$': '<rootDir>/__tests__/__mocks__/next-intl.ts',
    '^next/navigation$': '<rootDir>/__tests__/__mocks__/next-navigation.ts',
  },
  setupFilesAfterEnv: ['<rootDir>/__tests__/setup.ts'],
  // Ignore Next.js build output
  testPathIgnorePatterns: ['<rootDir>/node_modules/', '<rootDir>/.next/'],
  modulePathIgnorePatterns: ['<rootDir>/.next/'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
};

export default config;
