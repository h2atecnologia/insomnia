// @flow

import type { GlobalOptions } from '../util';
import { runTests, generate } from 'insomnia-testing';
import path from 'path';
import os from 'os';
import fs from 'fs';

export const TestReporterEnum = {
  dot: 'dot',
  list: 'list',
  spec: 'spec',
  min: 'min',
  progress: 'progress',
};

export type RunTestsOptions = GlobalOptions<{|
  reporter: $Keys<typeof TestReporterEnum>,
  bail?: boolean,
  keepFile?: boolean,
|}>;

function validateOptions({ reporter }: RunTestsOptions): boolean {
  if (reporter && !TestReporterEnum[reporter]) {
    const reporterTypes = Object.keys(TestReporterEnum).join(', ');
    console.log(`Reporter "${reporter}" not unrecognized. Options are [${reporterTypes}].`);
    return false;
  }

  return true;
}

function deleteTestFile(filePath: string, { keepFile }: RunTestsOptions) {
  if (!filePath) {
    return;
  }

  if (!keepFile) {
    fs.unlinkSync(filePath);
    return;
  }

  console.log(`Test file at ${path.normalize(filePath)}`);
}

function generateTestFile(_: RunTestsOptions): string {
  // TODO: Read from database
  const suites = [
    {
      name: 'Parent Suite',
      suites: [
        {
          name: 'Nested Suite',
          tests: [
            {
              name: 'should return -1 when the value is not present',
              code: 'expect([1, 2, 3].indexOf(4)).toBe(-1);\nexpect(true).toBe(true);',
            },
          ],
        },
      ],
      tests: [
        {
          name: 'should return index when value is present',
          code: 'expect([1, 2, 3].indexOf(3)).toBe(2);\nexpect(true).toBe(true);',
        },
      ],
    },
  ];

  const testFileContents = generate(suites);

  // TODO: Should this generate the test file at the working-dir? I think not
  const tmpPath = path.join(os.tmpdir(), 'insomnia-cli', `${Math.random()}.test.js`);
  fs.mkdirSync(path.dirname(tmpPath), { recursive: true });
  fs.writeFileSync(tmpPath, testFileContents);

  return tmpPath;
}

export async function runInsomniaTests(options: RunTestsOptions): Promise<boolean> {
  if (!validateOptions(options)) {
    return true;
  }

  const { reporter, bail } = options;

  let tmpPath = '';

  try {
    tmpPath = generateTestFile(options);

    const results = await runTests(tmpPath, { reporter, bail });

    if (!results || results.stats.failures) {
      return false;
    }
  } finally {
    deleteTestFile(tmpPath, options);
  }

  return true;
}
