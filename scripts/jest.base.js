// Docs: https://jestjs.io/docs/en/configuration.html
/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  clearMocks: true,

  maxWorkers: '90%',
  rootDir: './',
  cache: true,
  cacheDirectory: '<rootDir>/../../.jest-cache',
  transform: {
    '^.+\\.(j|t)sx?$': [
      'ts-jest',
      {
        // prevents ts errors when running tests
        diagnostics: false,
      },
    ],
  },
  extensionsToTreatAsEsm: ['.ts'],
  transformIgnorePatterns: ['^.+\\.js$', '^.+\\.css$', '/[\\/]node_modules[\\/]/'],
  setupFilesAfterEnv: ['<rootDir>/../../scripts/jest-setup.ts'],
  resolver: '<rootDir>/../../scripts/jest-resolver.js',
  testMatch: ['**/*.test.{ts,tsx}'],

  moduleFileExtensions: ['ts', 'tsx', 'js', 'json', 'node'],

  moduleNameMapper: {
    // In this case <rootDir> will correspond to website/console (and so on) locations
    '^(\\.{1,2}/.*)\\.js$': '$1',
    '\\.(css|less)$': 'identity-obj-proxy',
    '\\.svg': 'jest-transformer-svg',
    '\\.(jpg|jpeg|png|gif|eot|otf|webp|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$':
      '<rootDir>/../../script/test/assetsTransformer.js',
    '^@clients/common(.*)$': '<rootDir>/../../packages/common/src$1',
    '^@clients/db(.*)$': '<rootDir>/../../packages/db/src$1',
    '^@clients/flyte-api(.*)$': '<rootDir>/../../packages/flyte-api/src$1',
    '^@clients/locale(.*)$': '<rootDir>/../../packages/locale/src$1',
    '^@clients/oss-console(.*)$': '<rootDir>/../../packages/oss-console/src$1',
    '^@clients/primitives(.*)$': '<rootDir>/../../packages/primitives/src$1',
    '^@clients/theme(.*)$': '<rootDir>/../../packages/theme/src$1',
    '^@clients/ui-atoms(.*)$': '<rootDir>/../../packages/ui-atoms/src$1',
  },

  /**
   * COVERAGE
   */
  coverageDirectory: '<rootDir>/../../.coverage',
  collectCoverageFrom: ['**/*.ts', '**/*.tsx'],
  coveragePathIgnorePatterns: [
    '__stories__',
    '.storybook',
    'node_modules',
    'dist',
    'lib',
    'protobuf.ts',
    'server',
    'scripts',
    'generated',
    'tsd',
    'jest.config.js',
  ],
};
