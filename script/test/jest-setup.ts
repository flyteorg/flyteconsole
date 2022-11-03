import '@testing-library/jest-dom';

export default async function (globalConfig: any, projectConfig: any) {
  console.log(globalConfig.testPathPattern);
  console.log(projectConfig.cache);

  // Set reference to mongod in order to close the server during teardown.
  // (globalThis as any).__MONGOD__ = mongod;
}
