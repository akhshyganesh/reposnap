#!/usr/bin/env node

import * as path from 'path';
import { createCodebaseSnapshot } from './core/snapshot';
import type { SnapshotOptions } from './core/snapshot';
import { checkLatestVersion } from './utils/version-checker';
import { DEFAULT_IGNORED_DIRS, DEFAULT_IGNORED_FILES } from './cli/constants';

// Re-export the function so it can be imported from index
export { createCodebaseSnapshot, SnapshotOptions };

// Run the version check before starting the main program
(async (): Promise<void> => {
  await checkLatestVersion();

  // Parse command line arguments
  const args = process.argv.slice(2);
  const options: Record<string, string | string[] | boolean | number> = {
    root: process.cwd(),
    output: '',
    ignoreDirs: [...DEFAULT_IGNORED_DIRS],
    ignoreFiles: [...DEFAULT_IGNORED_FILES],
    excludeBinary: false,
    maxFileCount: 1000,
    maxFileSizeKB: 5000
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
    } else if (args[i] === '--exclude-binary' || args[i] === '--xb') {
      options.excludeBinary = true;
    } else if (args[i] === '--max-files' || args[i] === '--mf') {
      options.maxFileCount = parseInt(args[i + 1], 10);
      i++;
    } else if (args[i] === '--max-size' || args[i] === '--ms') {
      options.maxFileSizeKB = parseInt(args[i + 1], 10);
      i++;
    } else if (args[i] === '--ai-prep' || args[i] === '--ai') {
      // Shortcut option for AI preparation - exclude binary files, set reasonable limits
      options.excludeBinary = true;
      options.maxFileCount = 300; // Conservative limit for most AI models
      options.maxFileSizeKB = 500; // Smaller size limit to focus on code
    }
  }

  // Set default output filename if not provided
  if (!options.output) {
    const folderName = path.basename(options.root as string);
    options.output = `${folderName}_snapshot.txt`;
  }

  console.log(`Generating snapshot of ${options.root}`);
  console.log(`Output will be saved to ${options.output}`);
  if (options.excludeBinary) {
    console.log('Binary files will be excluded');
  }
  console.log('Processing...');

  // Pass as a single options object
  createCodebaseSnapshot({
    root: options.root as string,
    output: options.output as string,
    ignoreDirs: options.ignoreDirs as string[],
    ignoreFiles: options.ignoreFiles as string[],
    excludeBinary: options.excludeBinary as boolean,
    maxFileCount: options.maxFileCount as number,
    maxFileSizeKB: options.maxFileSizeKB as number
  });

  console.log('Snapshot complete!');
})();
