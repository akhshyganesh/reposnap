import * as fs from 'fs';
import * as path from 'path';
import { isBinaryContent, shouldIgnorePath } from './filters';
import { progressTracker } from '../utils/progress-tracker';
import { INCLUDE_FILE_EXTENSIONS } from '../cli/constants';

export interface FileStats {
  totalFiles: number;
  processedFiles: number;
  skippedBinaryCount: number;
  skippedSizeCount: number;
}

/**
 * Counts the total number of files in directory that match the filters
 */
export function countFilesInDirectory(
  dir: string,
  rootDir: string,
  ignoreDirs: string[],
  ignoreFiles: string[]
): number {
  let count = 0;

  try {
    const items = fs.readdirSync(dir);
    for (const item of items) {
      const itemPath = path.join(dir, item);
      const relativePath = path.relative(rootDir, itemPath);

      try {
        const stat = fs.statSync(itemPath);

        if (stat.isDirectory()) {
          if (!shouldIgnorePath(item, relativePath, ignoreDirs)) {
            count += countFilesInDirectory(itemPath, rootDir, ignoreDirs, ignoreFiles);
          }
        } else if (stat.isFile()) {
          if (!shouldIgnorePath(item, relativePath, ignoreFiles)) {
            count++;
          }
        }
      } catch (err) {
        // Skip if we can't access file stats
      }
    }
  } catch (err) {
    // Skip if we can't read directory
  }

  return count;
}

/**
 * Represents a single file or directory in the snapshot
 */
export interface SnapshotEntry {
  type: 'file' | 'directory' | 'symlink' | 'error';
  name: string;
  path: string;
  relativePath: string;
  content?: string;
  error?: string;
  target?: string; // For symlinks
  size?: number;
  skipped?: {
    reason: 'binary' | 'size' | 'count';
    details?: string;
  };
}

/**
 * Processes a directory for the snapshot
 */
export function processDirectory(
  dir: string,
  rootDir: string,
  options: {
    ignoreDirs: string[];
    ignoreFiles: string[];
    maxFileSizeKB: number;
    excludeBinary: boolean;
    maxFileCount: number;
  },
  stats: FileStats,
  visitedPaths: Set<string> = new Set()
): SnapshotEntry[] {
  const entries: SnapshotEntry[] = [];

  // Check if we've hit the file count limit
  if (stats.processedFiles >= options.maxFileCount) {
    return entries;
  }

  // Resolve real path to handle symlinks
  let realDirPath;
  try {
    realDirPath = fs.realpathSync(dir);
    if (visitedPaths.has(realDirPath)) {
      return [
        {
          type: 'error',
          name: path.basename(dir),
          path: dir,
          relativePath: path.relative(rootDir, dir),
          error: 'Symlink loop detected'
        }
      ];
    }
    visitedPaths.add(realDirPath);
  } catch (err) {
    return [
      {
        type: 'error',
        name: path.basename(dir),
        path: dir,
        relativePath: path.relative(rootDir, dir),
        error: (err as Error).message
      }
    ];
  }

  let items: string[];
  try {
    items = fs.readdirSync(dir).sort();
  } catch (err) {
    return [
      {
        type: 'error',
        name: path.basename(dir),
        path: dir,
        relativePath: path.relative(rootDir, dir),
        error: (err as Error).message
      }
    ];
  }

  // Process each item in the directory
  for (const item of items) {
    // Check file count limit
    if (stats.processedFiles >= options.maxFileCount) {
      break;
    }

    const itemPath = path.join(dir, item);
    const relativePath = path.relative(rootDir, itemPath);

    try {
      const stat = fs.statSync(itemPath);

      // Handle directories
      if (stat.isDirectory()) {
        if (shouldIgnorePath(item, relativePath, options.ignoreDirs)) continue;

        entries.push({
          type: 'directory',
          name: item,
          path: itemPath,
          relativePath
        });

        const subEntries = processDirectory(itemPath, rootDir, options, stats, visitedPaths);

        entries.push(...subEntries);
      }
      // Handle files
      else if (stat.isFile()) {
        if (shouldIgnorePath(item, relativePath, options.ignoreFiles)) continue;

        stats.processedFiles++;
        progressTracker.processFile(relativePath);

        const entry: SnapshotEntry = {
          type: 'file',
          name: item,
          path: itemPath,
          relativePath,
          size: stat.size
        };

        // Skip large files
        const maxSizeBytes = options.maxFileSizeKB * 1024;
        if (stat.size > maxSizeBytes) {
          entry.skipped = {
            reason: 'size',
            details: `${(stat.size / 1024).toFixed(1)}KB > ${options.maxFileSizeKB}KB limit`
          };
          stats.skippedSizeCount++;
          progressTracker.fileProcessed();
          entries.push(entry);
          continue;
        }

        // Check if binary
        try {
          const fd = fs.openSync(itemPath, 'r');
          const buffer = Buffer.alloc(4096);
          fs.readSync(fd, buffer, 0, 4096, 0);
          fs.closeSync(fd);

          // Use constant for known text file types
          const fileExt = path.extname(itemPath).toLowerCase();
          const isKnownTextFile = INCLUDE_FILE_EXTENSIONS.includes(fileExt);

          if (!isKnownTextFile && isBinaryContent(buffer)) {
            if (options.excludeBinary) {
              // Skip binary files entirely if the option is set
              stats.skippedBinaryCount++;
              progressTracker.fileProcessed();
              continue;
            }

            entry.skipped = { reason: 'binary' };
            progressTracker.fileProcessed();
            entries.push(entry);
            continue;
          }

          // Read file content
          entry.content = fs.readFileSync(itemPath, 'utf8');
          progressTracker.fileProcessed();
          entries.push(entry);
        } catch (e) {
          entry.error = (e as Error).message;
          progressTracker.fileProcessed();
          entries.push(entry);
        }
      }
      // Handle symlinks
      else if (stat.isSymbolicLink()) {
        try {
          const target = fs.readlinkSync(itemPath);
          entries.push({
            type: 'symlink',
            name: item,
            path: itemPath,
            relativePath,
            target
          });
        } catch (e) {
          entries.push({
            type: 'error',
            name: item,
            path: itemPath,
            relativePath,
            error: (e as Error).message
          });
        }
      }
    } catch (err) {
      entries.push({
        type: 'error',
        name: item,
        path: itemPath,
        relativePath,
        error: (err as Error).message
      });
    }
  }

  return entries;
}
