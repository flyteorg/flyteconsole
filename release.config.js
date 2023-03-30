const { execSync } = require('child_process');

/**
 *
 * @returns Production release configuration
 */
function getProdConfiguration() {
  return {
    plugins: [
      '@semantic-release/commit-analyzer',
      '@semantic-release/release-notes-generator',
      [
        '@semantic-release/changelog',
        {
          changelogTitle:
            '# Changelog\n\nAll notable changes to this project will be documented in this file. See\n[Conventional Commits](https://conventionalcommits.org) for commit guidelines.',
        },
      ],
      ['@semantic-release/npm', { npmPublish: false }],
      '@semantic-release/github',
    ],
  };
}

/**
 *
 * ################################################################
 * ################################################################
 * ################      FOR TESTING     ##########################
 * ################################################################
 * ################################################################
 */
function isTestRun() {
  return (
    process.argv.includes('--dry-run') || process.argv.includes('--test-run')
  );
}

function getTestConfiguration() {
  const localGitRepoPath = `file://${process.cwd()}/.git`;
  const localBranchName = execSync('git branch --show-current')
    .toString()
    .trim();

  return {
    repositoryUrl: localGitRepoPath,
    branches: localBranchName,
    plugins: [
      '@semantic-release/commit-analyzer',
      '@semantic-release/release-notes-generator',
      [
        '@semantic-release/changelog',
        {
          changelogTitle:
            '# Changelog\n\nAll notable changes to this project will be documented in this file. See\n[Conventional Commits](https://conventionalcommits.org) for commit guidelines.',
        },
      ],
      ['@semantic-release/npm', { npmPublish: false }],
      // ["@semantic-release/github", {
      //   "verifyConditions": false,
      //   "publish": false,
      //   'addReleases': false
      // }],
    ],
  };
}

module.exports = isTestRun() ? getTestConfiguration() : getProdConfiguration();
