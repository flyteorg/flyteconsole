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

  moduleNameMapper: {
    ...sharedConfig.moduleNameMapper,
    '\\.(jpg|jpeg|png|gif|eot|otf|webp|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$':
      '<rootDir>/assetsTransformer.js',
    '\\.svg': 'jest-transformer-svg',
  },

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
