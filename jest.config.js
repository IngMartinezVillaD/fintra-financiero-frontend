module.exports = {
  preset: 'jest-preset-angular',
  setupFilesAfterFramework: ['<rootDir>/setup-jest.ts'],
  testEnvironment: 'jsdom',
  transform: { '^.+\\.(ts|mjs|js|html)$': ['jest-preset-angular', { tsconfig: '<rootDir>/tsconfig.spec.json', stringifyContentPathRegex: /\.html$/ }] },
  transformIgnorePatterns: ['node_modules/(?!.*\\.mjs$)'],
  moduleNameMapper: {
    '^@core/(.*)$': '<rootDir>/src/app/core/$1',
    '^@shared/(.*)$': '<rootDir>/src/app/shared/$1',
    '^@features/(.*)$': '<rootDir>/src/app/features/$1',
    '^@layout/(.*)$': '<rootDir>/src/app/layout/$1',
    '^@env/(.*)$': '<rootDir>/src/environments/$1',
  },
  collectCoverageFrom: ['src/app/core/**/*.ts', 'src/app/shared/**/*.ts', '!src/app/**/*.spec.ts'],
  coverageThreshold: { global: { lines: 70, branches: 70, functions: 70, statements: 70 } },
};
