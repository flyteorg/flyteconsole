/* eslint-disable no-console */

/**
 * Approximating functionality from:
 * https://github.com/semantic-release/npm/blob/master/lib/prepare.js#L14
 *
 * This script will update the package.json version to the version.
 * To be used with @semantic-release/exec before @semantic-release/git
 */

const fs = require('fs');

// args, get version from semantic-release
const version = process.argv[2];

// load package.json
console.log('Updating package.json version to: ', version);
const packageJson = JSON.parse(fs.readFileSync('./package.json', 'utf8'));
packageJson.version = version;

console.log('Writing new package.json contents.');
fs.writeFileSync(
  './package.json',
  JSON.stringify(packageJson, null, 2),
  'utf8',
);
