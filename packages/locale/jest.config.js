/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
const sharedConfig = require('../../script/test/jest.base.js');

module.exports = {
  ...sharedConfig,
  setupFilesAfterEnv: ['<rootDir>/../../script/test/jest-setup.ts'],
};
