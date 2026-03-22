/** @type {import('jest').Config} */
const config = {
  testEnvironment: 'jest-environment-jsdom',
  roots: ['<rootDir>/src'],
  testMatch: ['**/*.test.ts', '**/*.test.tsx'],
  transform: {
    '^.+\\.(ts|tsx|js|jsx)$': [
      '@swc/jest',
      {
        jsc: {
          parser: {
            syntax: 'typescript',
            tsx: true,
          },
          transform: {
            react: {
              runtime: 'automatic',
            },
          },
        },
      },
    ],
  },
  transformIgnorePatterns: [
    '/node_modules/(?!(nanoid|uuid)/)',
  ],
  moduleNameMapper: {
    '^@moondreamsdev/dreamer-ui/components$': '<rootDir>/src/__tests__/mocks/dreamer-ui-components.tsx',
    '^@moondreamsdev/dreamer-ui/utils$': '<rootDir>/src/__tests__/mocks/dreamer-ui-utils.ts',
    '^@moondreamsdev/dreamer-ui/hooks$': '<rootDir>/src/__tests__/mocks/dreamer-ui-hooks.ts',
    '^@moondreamsdev/dreamer-ui/providers$': '<rootDir>/src/__tests__/mocks/dreamer-ui-providers.ts',
    '^@moondreamsdev/dreamer-ui/symbols$': '<rootDir>/src/__tests__/mocks/dreamer-ui-symbols.tsx',
    '^@lib/firebase/firebase\\.config$': '<rootDir>/src/__tests__/mocks/firebase.config.ts',
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@components/(.*)$': '<rootDir>/src/components/$1',
    '^@contexts/(.*)$': '<rootDir>/src/contexts/$1',
    '^@hooks/(.*)$': '<rootDir>/src/hooks/$1',
    '^@lib/(.*)$': '<rootDir>/src/lib/$1',
    '^@routes/(.*)$': '<rootDir>/src/routes/$1',
    '^@screens/(.*)$': '<rootDir>/src/screens/$1',
    '^@store/(.*)$': '<rootDir>/src/store/$1',
    '^@styles/(.*)$': '<rootDir>/src/styles/$1',
    '^@ui/(.*)$': '<rootDir>/src/ui/$1',
    '^@utils/(.*)$': '<rootDir>/src/utils/$1',
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    '\\.(jpg|jpeg|png|gif|webp|svg|ico)$': '<rootDir>/src/__tests__/fileMock.ts',
  },
  setupFiles: ['<rootDir>/src/__tests__/setupGlobals.ts'],
  setupFilesAfterEnv: ['<rootDir>/src/__tests__/setup.ts'],
};

module.exports = config;
