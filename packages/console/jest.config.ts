/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */

const sharedConfig = require('../../script/test/jest.base.js');

const jestConfig = {
  ...sharedConfig,
  setupFilesAfterEnv: ['<rootDir>/src/test/setupTests.ts'],
  rootDir: './',
  transform: {
    '^.+\\.(j|t)sx?$': [
      'ts-jest',
      {
        useESM: true,
      },
    ],
  },
  extensionsToTreatAsEsm: ['.ts'],

  modulePaths: ['<rootDir>/src'],
  roots: ['<rootDir>/src'],
  transformIgnorePatterns: [
    '../../node_modules/(?!@flyteorg/flyteidl/)',
    '../../node_modules/(?!@rjsf)(.*)',
  ],

  coveragePathIgnorePatterns: [
    ...sharedConfig.coveragePathIgnorePatterns,
    '__stories__',
    'src/components/App.tsx',
    'src/tsd',
    'src/client.tsx',
    'src/protobuf.ts',
    'src/server.ts',
  ],
};

export default jestConfig;
