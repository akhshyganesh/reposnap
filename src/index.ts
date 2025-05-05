#!/usr/bin/env node

import * as path from 'path';
import { createCodebaseSnapshot } from './createCodebaseSnapshot';

// Re-export the function so it can be imported from index
export { createCodebaseSnapshot };

// Default ignored directories and files
const DEFAULT_IGNORED_DIRS = ['.git', 'node_modules', 'dist', 'build', '.vscode', '__pycache__'];
const DEFAULT_IGNORED_FILES = [
  '.DS_Store',
  '.gitignore',
  '*.pyc',
  '*.log',
  '.env',
  '*.key',
  '*.crt',
  '*.pem',
  'package-lock.json',
  'yarn.lock',
  'pnpm-lock.yaml'
];

// Parse command line arguments
const args = process.argv.slice(2);
const options: Record<string, string | string[]> = {
  root: process.cwd(),
  output: '',
  ignoreDirs: [...DEFAULT_IGNORED_DIRS],
  ignoreFiles: [...DEFAULT_IGNORED_FILES]
};

// Parse arguments
for (let i = 0; i < args.length; i++) {
  if (args[i] === '--root' || args[i] === '--r') {
    options.root = args[i + 1];
    i++;
  } else if (args[i] === '--output' || args[i] === '--o') {
    options.output = args[i + 1];
    i++;
  } else if (args[i] === '--ignore-dirs' || args[i] === '--idir') {
    const dirs = args[i + 1].split(' ');
    options.ignoreDirs = [...DEFAULT_IGNORED_DIRS, ...dirs];
    i++;
  } else if (args[i] === '--ignore-files' || args[i] === '--ifile') {
    const files = args[i + 1].split(' ');
    options.ignoreFiles = [...DEFAULT_IGNORED_FILES, ...files];
    i++;
  }
}

// Set default output filename if not provided
if (!options.output) {
  const folderName = path.basename(options.root as string);
  options.output = `${folderName}_snapshot.txt`;
}

console.log(`Generating snapshot of ${options.root}`);
console.log(`Output will be saved to ${options.output}`);
console.log('Processing...');

// Pass as a single options object instead of separate parameters
createCodebaseSnapshot({
  root: options.root as string,
  output: options.output as string,
  ignoreDirs: options.ignoreDirs as string[],
  ignoreFiles: options.ignoreFiles as string[]
});

console.log('Snapshot complete!');
