/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
const sharedConfig = require('./script/test/jest.base.js');

module.exports = {
  ...sharedConfig,
  clearMocks: true,
  verbose: false,

  setupFilesAfterEnv: ['./script/test/jest-setup.ts'],
  projects: [
    '<rootDir>/packages/basics/*',
    '<rootDir>/packages/composites/*',
    '<rootDir>/packages/plugins/*',
    '<rootDir>/packages/zapp/*',
  ],

  coverageDirectory: '<rootDir>/.coverage',
  collectCoverageFrom: ['**/*.{ts,tsx}', '!**/*/*.stories.{ts,tsx}', '!**/*/*.mocks.{ts,tsx}'],
  coveragePathIgnorePatterns: [...sharedConfig.coveragePathIgnorePatterns],
  coverageReporters: ['text', 'json', 'html'],
};
