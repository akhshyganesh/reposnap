import * as fs from 'fs';
import * as path from 'path';
import chalk from 'chalk';

// Represents a file entry in the snapshot
interface FileEntry {
  path: string;
  content?: string;
}

// Simple function to extract file entries from a snapshot
function extractFileEntries(snapshotContent: string): Map<string, FileEntry> {
  const entries = new Map<string, FileEntry>();
  const lines = snapshotContent.split('\n');

  let currentPath: string | null = null;
  let currentContent: string[] = [];
  let inContent = false;

  for (const line of lines) {
    // Check for file marker (📄)
    const fileMatch = line.match(/^\s*📄\s+(.+)$/);
    if (fileMatch) {
      // If we were processing a previous file, save it
      if (currentPath) {
        entries.set(currentPath, {
          path: currentPath,
          content: currentContent.join('\n')
        });
        currentContent = [];
      }

      // Extract relative path from line and indent
      const indent = line.match(/^(\s*)/)?.[1]?.length || 0;
      const depth = indent / 2;
      let relativePath = fileMatch[1];

      // Build path based on depth
      if (depth > 0) {
        const dirs = [];
        for (let i = 0; i < depth; i++) {
          dirs.push('dir' + i);
        }
        relativePath = path.join(...dirs, relativePath);
      }

      currentPath = relativePath;
      inContent = false;
      continue;
    }

    // Check for content section markers
    if (line.match(/^\s*---$/) && currentPath) {
      inContent = !inContent;
      continue;
    }

    // Collect content if we're in a content section
    if (inContent && currentPath) {
      // Remove the indentation from content lines
      const contentLine = line.replace(/^\s{2,}/, '');
      currentContent.push(contentLine);
    }
  }

  // Save the last file if any
  if (currentPath) {
    entries.set(currentPath, {
      path: currentPath,
      content: currentContent.join('\n')
    });
  }

  return entries;
}

// Compare two snapshot files
export function compareSnapshots(
  oldSnapshotPath: string,
  newSnapshotPath: string,
  outputPath?: string
): void {
  try {
    console.log(chalk.blue('Reading snapshots...'));

    const oldContent = fs.readFileSync(oldSnapshotPath, 'utf8');
    const newContent = fs.readFileSync(newSnapshotPath, 'utf8');

    console.log(chalk.blue('Extracting file entries...'));

    const oldEntries = extractFileEntries(oldContent);
    const newEntries = extractFileEntries(newContent);

    // Find added, removed, and modified files
    const added: string[] = [];
    const removed: string[] = [];
    const modified: string[] = [];

    // Check for removed and modified files
    for (const [path, entry] of oldEntries.entries()) {
      if (!newEntries.has(path)) {
        removed.push(path);
      } else if (newEntries.get(path)?.content !== entry.content) {
        modified.push(path);
      }
    }

    // Check for added files
    for (const path of newEntries.keys()) {
      if (!oldEntries.has(path)) {
        added.push(path);
      }
    }

    // Generate report
    let report = `# Snapshot Comparison\n\n`;
    report += `Old snapshot: ${path.basename(oldSnapshotPath)}\n`;
    report += `New snapshot: ${path.basename(newSnapshotPath)}\n`;
    report += `Comparison date: ${new Date().toISOString()}\n\n`;

    report += `## Summary\n\n`;
    report += `- Files added: ${added.length}\n`;
    report += `- Files removed: ${removed.length}\n`;
    report += `- Files modified: ${modified.length}\n\n`;

    if (added.length > 0) {
      report += `## Added Files\n\n`;
      added.sort().forEach((file) => {
        report += `- ${file}\n`;
      });
      report += '\n';
    }

    if (removed.length > 0) {
      report += `## Removed Files\n\n`;
      removed.sort().forEach((file) => {
        report += `- ${file}\n`;
      });
      report += '\n';
    }

    if (modified.length > 0) {
      report += `## Modified Files\n\n`;
      modified.sort().forEach((file) => {
        report += `- ${file}\n`;
      });
      report += '\n';
    }

    if (outputPath) {
      fs.writeFileSync(outputPath, report);
      console.log(chalk.green(`Comparison report saved to: ${outputPath}`));
    } else {
      console.log('\n' + report);
    }

    console.log(
      chalk.green(`
Summary of changes:
${chalk.white('→')} Added:    ${chalk.green(added.length)}
${chalk.white('→')} Removed:  ${chalk.red(removed.length)}
${chalk.white('→')} Modified: ${chalk.yellow(modified.length)}
`)
    );
  } catch (error) {
    console.error(chalk.red(`Error comparing snapshots: ${(error as Error).message}`));
    throw error;
  }
}
