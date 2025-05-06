#!/usr/bin/env node

import { createCodebaseSnapshot } from './core/snapshot';
import type { SnapshotOptions } from './cli/options';
import { checkLatestVersion } from './utils/version-checker';
import { DEFAULT_IGNORED_DIRS, DEFAULT_IGNORED_FILES } from './cli/constants';
import { parseCommandLineArgs } from './cli/options';
import { compareSnapshots } from './core/compare';

// Re-export the function so it can be imported from index
export { createCodebaseSnapshot, SnapshotOptions };

// Run the version check before starting the main program
(async (): Promise<void> => {
  await checkLatestVersion();

  // Parse command line arguments
  const args = process.argv.slice(2);
  const options = parseCommandLineArgs(args);

  // If comparison mode is enabled
  if (options.compare) {
    try {
      compareSnapshots(
        options.compare.oldSnapshot,
        options.compare.newSnapshot,
        options.compare.output
      );
    } catch (error) {
      process.exit(1);
    }
    return;
  }

  console.log('Processing...');

  // Pass as a single options object
  createCodebaseSnapshot({
    root: options.root as string,
    output: options.output as string,
    ignoreDirs: (options.ignoreDirs as string[]) || DEFAULT_IGNORED_DIRS,
    ignoreFiles: (options.ignoreFiles as string[]) || DEFAULT_IGNORED_FILES,
    excludeBinary: options.excludeBinary as boolean,
    maxFileCount: options.maxFileCount as number,
    maxFileSizeKB: options.maxFileSizeKB as number
  });

  console.log('Snapshot complete!');
})();
