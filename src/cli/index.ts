#!/usr/bin/env node

import { parseCommandLineArgs } from './options';
import { createCodebaseSnapshot } from '../core/snapshot';
import { checkLatestVersion } from '../utils/version-checker';

// Run the CLI
async function runCLI(): Promise<void> {
  try {
    // Check for the latest version
    await checkLatestVersion();

    // Parse command line arguments
    const args = process.argv.slice(2);
    const options = parseCommandLineArgs(args);

    // Display info
    console.log(`Generating snapshot of ${options.root}`);
    console.log(`Output will be saved to ${options.output}`);
    if (options.excludeBinary) {
      console.log('Binary files will be excluded');
    }
    console.log('Processing...');

    // Generate the snapshot
    createCodebaseSnapshot(options);
  } catch (error) {
    console.error('Error:', (error as Error).message);
    process.exit(1);
  }
}

runCLI();
