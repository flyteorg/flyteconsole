/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */

module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['../../script/test/jest-setup.ts'],
  testPathIgnorePatterns: ['__stories__', '.storybook', 'node_modules', 'dist', 'lib', 'build'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'json', 'node'],
  transform: {
    '^.+\\.(j|t)sx?$': 'ts-jest',
  },

  moduleNameMapper: {
    // In this case <rootDir> will correspond to package/zapp/union-hub (and so) locations
    '^(\\.{1,2}/.*)\\.js$': '$1',
    '@flyteoss/(.*)': ['<rootDir>/../../packages/$1/src'],
    // 'react': '<rootDir>/../../node_modules/react',
    // 'react-dom': '<rootDir>/../../node_modules/react-dom',
    '\\.(css|less)$': 'identity-obj-proxy',
  },

  globals: {
    'ts-jest': {
      isolatedModules: true,
      tsconfig: '<rootDir>/tsconfig.json',
    },
  },

  coveragePathIgnorePatterns: ['mocks', '.mock', 'src/index'],
};
