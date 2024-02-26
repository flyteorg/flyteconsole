import { JestConfigWithTsJest } from 'ts-jest';

const sharedConfig = require('../../scripts/jest.base.js');

const jestConfig: JestConfigWithTsJest = {
  ...sharedConfig,
  setupFilesAfterEnv: [...sharedConfig.setupFilesAfterEnv, '<rootDir>/src/test/setupTests.ts'],
};

export default jestConfig;
