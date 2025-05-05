#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Get the current version from package.json
const packageJson = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../package.json'), 'utf8'));
const currentVersion = packageJson.version;

// Check if CHANGELOG.md already contains the current version
const changelogPath = path.resolve(__dirname, '../CHANGELOG.md');
const changelog = fs.existsSync(changelogPath) ? fs.readFileSync(changelogPath, 'utf8') : '';
const versionExists = changelog.includes(`## [${currentVersion}]`);

try {
  if (!versionExists) {
    console.log(`Generating changelog for version ${currentVersion}...`);
    execSync('npm run changelog', { stdio: 'inherit' });
    console.log('Changelog generated successfully!');
  } else {
    console.log(`Changelog entry for version ${currentVersion} already exists.`);
  }
} catch (error) {
  console.error('Error generating changelog:', error);
  process.exit(1);
}
