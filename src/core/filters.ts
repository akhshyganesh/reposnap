import { INCLUDE_FILE_EXTENSIONS } from '../cli/constants';

/**
 * Determines if a file or directory should be ignored based on the given patterns
 */
export function shouldIgnorePath(name: string, relativePath: string, patterns: string[]): boolean {
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

/**
 * Checks if the provided buffer contains binary content
 */
export function isBinaryContent(buffer: Buffer): boolean {
  // Use the shared text file extensions constant

  // Get the file path from the first line if it exists (for accurate extension detection)
  let filePath = '';
  try {
    const firstLine = buffer.toString('utf8', 0, Math.min(buffer.length, 200));
    const filePathMatch = firstLine.match(/filepath: ([^\n]+)/);
    if (filePathMatch) {
      filePath = filePathMatch[1];
      // If we can determine this is a known text file type from the path, don't mark it as binary
      if (filePath && INCLUDE_FILE_EXTENSIONS.some((ext) => filePath.toLowerCase().endsWith(ext))) {
        return false;
      }
    }
  } catch (e) {
    // Ignore errors reading the first line
  }

  // Known text file byte patterns
  const utf8BOM = [0xef, 0xbb, 0xbf];
  const utf16LEBOM = [0xff, 0xfe];
  const utf16BEBOM = [0xfe, 0xff];

  // Check for BOMs that would indicate text files
  if (
    (buffer.length >= 3 &&
      buffer[0] === utf8BOM[0] &&
      buffer[1] === utf8BOM[1] &&
      buffer[2] === utf8BOM[2]) ||
    (buffer.length >= 2 && buffer[0] === utf16LEBOM[0] && buffer[1] === utf16LEBOM[1]) ||
    (buffer.length >= 2 && buffer[0] === utf16BEBOM[0] && buffer[1] === utf16BEBOM[1])
  ) {
    return false;
  }

  // Sample size - examine a smaller portion to avoid false positives
  const sampleSize = Math.min(buffer.length, 256);

  // Check for NULL bytes which are strong binary indicators
  // Count null bytes and control characters
  let nullCount = 0;
  let controlCount = 0;
  let textCharCount = 0;

  for (let i = 0; i < sampleSize; i++) {
    const byte = buffer[i];

    // Count null bytes
    if (byte === 0) {
      nullCount++;
      // More than 3 null bytes is a good indicator of binary content
      if (nullCount >= 3) {
        return true;
      }
    }

    // Count control characters (except common whitespace chars)
    if ((byte < 32 && ![9, 10, 13].includes(byte)) || byte === 127) {
      controlCount++;
    } else if (byte >= 32 && byte <= 126) {
      // Count printable ASCII chars
      textCharCount++;
    }
  }

  // If we have a good ratio of text to control chars, consider it text
  if (textCharCount > 0 && textCharCount > controlCount * 2) {
    return false;
  }

  // If >30% of sampled content is control chars, likely binary
  return controlCount > sampleSize * 0.3;
}
