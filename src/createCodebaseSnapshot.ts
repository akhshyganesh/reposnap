import * as fs from 'fs';
import * as path from 'path';

interface SnapshotOptions {
  root: string;
  output: string;
  ignoreDirs: string[];
  ignoreFiles: string[];
  maxFileSizeKB?: number;
}

export function createCodebaseSnapshot(options: SnapshotOptions): void {
  const { root, output } = options;

  // Set default max file size to 500KB if not specified
  options.maxFileSizeKB = options.maxFileSizeKB || 500;

  // Get the file structure and content
  const snapshot = generateSnapshot(root, options);

  // Write to output file
  fs.writeFileSync(output, snapshot);

  console.log(`Snapshot saved to ${output}`);
}

function generateSnapshot(rootDir: string, options: SnapshotOptions): string {
  let result = `# Codebase Snapshot: ${path.basename(rootDir)}\n`;
  result += `Generated: ${new Date().toISOString()}\n\n`;

  const visitedPaths = new Set<string>(); // Track visited paths to prevent recursion
  const maxSizeBytes = (options.maxFileSizeKB || 500) * 1024;

  // Process directory recursively
  function processDirectory(dir: string, indent: string = ''): void {
    // Resolve real path to handle symlinks
    const realDirPath = fs.realpathSync(dir);
    if (visitedPaths.has(realDirPath)) {
      result += `${indent}🔄 [Symlink loop detected: ${path.relative(rootDir, dir)}]\n`;
      return;
    }
    visitedPaths.add(realDirPath);

    let items: string[];
    try {
      items = fs.readdirSync(dir).sort();
    } catch (err) {
      result += `${indent}⚠️ [Error reading directory: ${(err as Error).message}]\n`;
      return;
    }

    for (const item of items) {
      const itemPath = path.join(dir, item);
      const relativePath = path.relative(rootDir, itemPath);

      try {
        const stat = fs.statSync(itemPath);

        // Handle directories
        if (stat.isDirectory()) {
          // Check if directory should be ignored
          if (shouldIgnorePath(item, relativePath, options.ignoreDirs)) continue;

          result += `${indent}📁 ${item}/\n`;
          processDirectory(itemPath, indent + '  ');
        }
        // Handle files
        else if (stat.isFile()) {
          // Check if file should be ignored
          if (shouldIgnorePath(item, relativePath, options.ignoreFiles)) continue;

          result += `${indent}📄 ${item}\n`;

          // Skip large files
          if (stat.size > maxSizeBytes) {
            result += `${indent}  [File too large: ${(stat.size / 1024).toFixed(1)}KB > ${options.maxFileSizeKB}KB limit]\n\n`;
            continue;
          }

          // Add file content for text files (avoid binary files)
          try {
            // Read first few bytes to check if it's likely binary
            const fd = fs.openSync(itemPath, 'r');
            const buffer = Buffer.alloc(4096);
            fs.readSync(fd, buffer, 0, 4096, 0);
            fs.closeSync(fd);

            if (isBinaryContent(buffer)) {
              result += `${indent}  [Binary file]\n\n`;
              continue;
            }

            const content = fs.readFileSync(itemPath, 'utf8');
            result += `${indent}  ---\n`;
            result += content
              .split('\n')
              .map((line) => `${indent}  ${line}`)
              .join('\n');
            result += `\n${indent}  ---\n\n`;
          } catch (e) {
            result += `${indent}  [Error reading file: ${(e as Error).message}]\n\n`;
          }
        }
        // Handle symlinks separately
        else if (stat.isSymbolicLink()) {
          const target = fs.readlinkSync(itemPath);
          result += `${indent}🔗 ${item} -> ${target}\n`;
        }
      } catch (err) {
        result += `${indent}⚠️ ${item} [Error: ${(err as Error).message}]\n`;
      }
    }
  }

  processDirectory(rootDir);
  return result;
}

function shouldIgnorePath(name: string, relativePath: string, patterns: string[]): boolean {
  return patterns.some((pattern) => {
    // Handle extension patterns (*.js, *.ts, etc)
    if (pattern.startsWith('*')) {
      const ext = pattern.substring(1);
      return name.endsWith(ext);
    }

    // Handle exact name matches
    if (!pattern.includes('/')) {
      return pattern === name;
    }

    // Handle path patterns (src/config/*, etc)
    if (pattern.endsWith('/*')) {
      const dirPattern = pattern.slice(0, -2);
      return relativePath.startsWith(dirPattern);
    }

    // Exact path match
    return pattern === relativePath;
  });
}

function isBinaryContent(buffer: Buffer): boolean {
  // Check for null bytes and high concentration of non-printable characters
  let suspiciousBytes = 0;
  const sampleSize = Math.min(buffer.length, 512);

  for (let i = 0; i < sampleSize; i++) {
    const byte = buffer[i];
    // null bytes or control characters except common ones
    if (byte === 0 || (byte < 32 && ![9, 10, 13].includes(byte))) {
      suspiciousBytes++;
      if (suspiciousBytes > 5) return true; // Threshold for binary detection
    }
  }

  return false;
}
