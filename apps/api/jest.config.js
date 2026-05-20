module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  testMatch: ['**/__tests__/**/*.ts', '**/*.test.ts'],
  transform: {
    '^.+\\.ts$': ['ts-jest', { tsconfig: { strict: false, types: ['jest', 'node'] } }],
  },
  moduleNameMapper: {
    '^@veltrix/shared$': '<rootDir>/../../packages/shared/src/index.ts',
  },
}
