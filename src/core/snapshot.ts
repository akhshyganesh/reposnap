import * as path from 'path';
import * as fs from 'fs';
import { SnapshotEntry, FileStats, countFilesInDirectory, processDirectory } from './filesystem';
import { progressTracker } from '../utils/progress-tracker';
import { author, version, homepage } from '../../package.json';

export interface SnapshotOptions {
  root: string;
  output: string;
  ignoreDirs: string[];
  ignoreFiles: string[];
  maxFileSizeKB: number;
  excludeBinary: boolean;
  maxFileCount: number;
}

/**
 * Formats a snapshot entry into a string representation
 */
function formatSnapshotEntry(entry: SnapshotEntry, indent: string = ''): string {
  let result = '';

  switch (entry.type) {
    case 'directory':
      result += `${indent}📁 ${entry.name}/\n`;
      break;
    case 'file':
      result += `${indent}📄 ${entry.name}\n`;

      if (entry.skipped) {
        if (entry.skipped.reason === 'binary') {
          result += `${indent}  [Binary file]\n\n`;
        } else if (entry.skipped.reason === 'size') {
          result += `${indent}  [File too large: ${entry.skipped.details}]\n\n`;
        }
      } else if (entry.error) {
        result += `${indent}  [Error reading file: ${entry.error}]\n\n`;
      } else if (entry.content !== undefined) {
        result += `${indent}  ---\n`;
        result += entry.content
          .split('\n')
          .map((line) => `${indent}  ${line}`)
          .join('\n');
        result += `\n${indent}  ---\n\n`;
      }
      break;
    case 'symlink':
      result += `${indent}🔗 ${entry.name} -> ${entry.target}\n`;
      break;
    case 'error':
      result += `${indent}⚠️ ${entry.name} [Error: ${entry.error}]\n`;
      break;
  }

  return result;
}

/**
 * Creates a formatted snapshot from the list of entries
 */
function formatSnapshot(
  entries: SnapshotEntry[],
  rootDirName: string,
  stats: FileStats,
  options: SnapshotOptions
): string {
  let result = `# Code Repository Snapshot: ${path.basename(rootDirName)}\n\n`;
  result += `--------------------------------------------\n`;
  result += `Generated with reposnap v${version}\n`;
  result += `Project: ${homepage}\n`;
  result += `Author: ${author}\n`;
  result += `Generated on: ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}\n`;
  result += `--------------------------------------------\n\n\n`;

  // Special function to format entries with proper indentation
  const formatEntries = (items: SnapshotEntry[]): void => {
    items.forEach((entry) => {
      // Calculate directory depth to handle indentation
      const entryDirPath = path.dirname(entry.relativePath);
      const dirDepth = entryDirPath === '.' ? 0 : entryDirPath.split(path.sep).length;

      // Update the indent level based on depth
      const indent = '  '.repeat(dirDepth);

      result += formatSnapshotEntry(entry, indent);
    });
  };

  formatEntries(entries);

  // Add summary at the end
  result += '\n# Snapshot Summary\n';
  result += `Total files processed: ${stats.processedFiles > options.maxFileCount ? options.maxFileCount : stats.processedFiles}\n`;
  if (stats.totalFiles > options.maxFileCount) {
    result += `Files omitted due to count limit: ${stats.totalFiles - options.maxFileCount}\n`;
  }
  if (stats.skippedBinaryCount > 0) {
    result += `Binary files excluded: ${stats.skippedBinaryCount}\n`;
  }
  if (stats.skippedSizeCount > 0) {
    result += `Files excluded due to size: ${stats.skippedSizeCount}\n`;
  }

  return result;
}

/**
 * Creates a codebase snapshot with the given options
 */
export function createCodebaseSnapshot(options: SnapshotOptions): void {
  const { root, output } = options;

  // Start progress tracking
  progressTracker.start();
  progressTracker.discoveringFiles();

  // Track processed files and their status
  const processedFiles: { path: string; success: boolean }[] = [];

  try {
    // Count the total files to process
    const totalFiles = countFilesInDirectory(root, root, options.ignoreDirs, options.ignoreFiles);
    progressTracker.setTotalFiles(Math.min(totalFiles, options.maxFileCount));

    // Track statistics
    const stats: FileStats = {
      totalFiles,
      processedFiles: 0,
      skippedBinaryCount: 0,
      skippedSizeCount: 0
    };

    // Process the directory structure
    const entries = processDirectory(root, root, options, stats);

    // Record processed file statuses from entries
    entries.forEach((entry) => {
      if (entry.type === 'file') {
        processedFiles.push({
          path: entry.relativePath,
          success: !entry.error && !entry.skipped
        });
      }
    });

    // Format the snapshot
    const snapshot = formatSnapshot(entries, path.basename(root), stats, options);

    // Write to output file
    fs.writeFileSync(output, snapshot);

    // First complete the progress tracker
    progressTracker.complete();

    console.log('\nFile processing details:');

    // Now display all processed files with their status
    entries.forEach((entry) => {
      if (entry.type === 'file') {
        const isSuccess = !entry.error && !entry.skipped;
        console.log(`${isSuccess ? '✓' : '✗'} ${entry.relativePath}`);
      }
    });

    console.log(`\nSnapshot saved to ${output}`);
  } catch (error) {
    progressTracker.error((error as Error).message);
    throw error;
  }
}
