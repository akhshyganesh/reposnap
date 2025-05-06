import * as path from 'path';
import {
  DEFAULT_IGNORED_DIRS,
  DEFAULT_IGNORED_FILES,
  DEFAULT_CONFIG,
  AI_PREP_CONFIG
} from './constants';

export interface SnapshotOptions {
  root: string;
  output: string;
  ignoreDirs: string[];
  ignoreFiles: string[];
  maxFileSizeKB: number;
  excludeBinary: boolean;
  maxFileCount: number;
}

export function parseCommandLineArgs(args: string[]): SnapshotOptions {
  const options: SnapshotOptions = {
    root: process.cwd(),
    output: '',
    ignoreDirs: [...DEFAULT_IGNORED_DIRS],
    ignoreFiles: [...DEFAULT_IGNORED_FILES],
    maxFileSizeKB: DEFAULT_CONFIG.maxFileSizeKB,
    excludeBinary: DEFAULT_CONFIG.excludeBinary,
    maxFileCount: DEFAULT_CONFIG.maxFileCount
  };

  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case '--root':
      case '--r':
        options.root = args[++i];
        break;
      case '--output':
      case '--o':
        options.output = args[++i];
        break;
      case '--ignore-dirs':
      case '--idir':
        options.ignoreDirs = [...DEFAULT_IGNORED_DIRS, ...args[++i].split(' ')];
        break;
      case '--ignore-files':
      case '--ifile':
        options.ignoreFiles = [...DEFAULT_IGNORED_FILES, ...args[++i].split(' ')];
        break;
      case '--exclude-binary':
      case '--xb':
        options.excludeBinary = true;
        break;
      case '--max-files':
      case '--mf':
        options.maxFileCount = parseInt(args[++i], 10);
        break;
      case '--max-size':
      case '--ms':
        options.maxFileSizeKB = parseInt(args[++i], 10);
        break;
      case '--ai-prep':
      case '--ai':
        Object.assign(options, AI_PREP_CONFIG);
        break;
    }
  }

  // Set default output filename if not provided
  if (!options.output) {
    const folderName = path.basename(options.root);
    options.output = `${folderName}_snapshot.txt`;
  }

  return options;
}
