/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */

module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['../../../script/test/jest-setup.ts'],
  testPathIgnorePatterns: ['__stories__', '.storybook', 'node_modules', 'dist', 'lib', 'build'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'json', 'node'],

  moduleNameMapper: {
    // In this case <rootDir> will correspond to package/zapp/console (and so) locations
    '^(\\.{1,2}/.*)\\.js$': '$1',
    '@flyteconsole/(.*)': [
      '<rootDir>/../../approot/$1/src',
      '<rootDir>/../../basics/$1/src',
      '<rootDir>/../../composites/$1/src',
      '<rootDir>/../../plugins/$1/src',
      '<rootDir>/../../zapp/$1/src',
    ],
  },

  coveragePathIgnorePatterns: ['mocks', '.mock', 'src/index'],
};
