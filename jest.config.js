// Docs: https://jestjs.io/docs/en/configuration.html
/** @type {import('ts-jest').JestConfigWithTsJest} */
const sharedConfig = require('./scripts/jest.base.js');

module.exports = {
  ...sharedConfig,
  verbose: false,
  rootDir: './',

  setupFilesAfterEnv: ['./scripts/jest-setup.ts'],
  resolver: './scripts/jest-resolver.js',
  moduleNameMapper: {
    ...sharedConfig.moduleNameMapper,
    '\\.(jpg|jpeg|png|gif|eot|otf|webp|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$':
      '<rootDir>/script/test/assetsTransformer.js',
    '^@clients/common(.*)$': '<rootDir>/packages/common/src$1',
    '^@clients/db(.*)$': '<rootDir>/packages/db/src$1',
    '^@clients/flyte-api(.*)$': '<rootDir>/packages/flyte-api/src$1',
    '^@clients/locale(.*)$': '<rootDir>/packages/locale/src$1',
    '^@clients/oss-console(.*)$': '<rootDir>/packages/oss-console/src$1',
    '^@clients/primitives(.*)$': '<rootDir>/packages/primitives/src$1',
    '^@clients/theme(.*)$': '<rootDir>/packages/theme/src$1',
    '^@clients/ui-atoms(.*)$': '<rootDir>/packages/ui-atoms/src$1',
  },

  roots: [
    '<rootDir>/packages/common/src',
    '<rootDir>/packages/flyte-api/src',
    '<rootDir>/packages/locale/src',
    '<rootDir>/packages/oss-console/src',
    '<rootDir>/packages/primitives/src',
    '<rootDir>/packages/theme/src',
    '<rootDir>/packages/ui-atoms/src',
  ],
  projects: ['<rootDir>/packages/*'],

  /**
   * COVERAGE
   */
  coverageDirectory: '<rootDir>/.coverage',
  collectCoverageFrom: ['**/*.ts', '**/*.tsx'],
  coveragePathIgnorePatterns: [...sharedConfig.coveragePathIgnorePatterns],
  // 'buildkite-test-collector/jest/reporter': https://buildkite.com/docs/test-analytics/javascript-collectors#configure-the-test-framework-jest
  // reporters: ['default'],
  coverageReporters: ['text', 'text-summary', 'json', 'html', 'clover', 'lcov'],
};
