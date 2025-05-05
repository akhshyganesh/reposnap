import { createCodebaseSnapshot } from '../index';
import * as path from 'path';
import fs from 'fs';

const testOutputFile = 'test_snapshot.txt';

// Update to pass a single options object
createCodebaseSnapshot({
  root: path.join(__dirname, '../..'),
  output: testOutputFile,
  ignoreDirs: ['node_modules'],
  ignoreFiles: ['*.log']
});

if (fs.existsSync(testOutputFile)) {
  console.log('Test Passed: Snapshot file created successfully.');
  fs.unlinkSync(testOutputFile); // Clean up after test
} else {
  console.error('Test Failed: Snapshot file not created.');
}
