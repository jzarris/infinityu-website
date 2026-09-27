/**
 * Static guard: no console call in the API or lib code may print the objects
 * that carry patient data. This is a backstop for the logging rules in log.ts.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

const ROOTS = ['src/app/api', 'src/lib'];
const FORBIDDEN = /console\.(log|warn|error|info)\([^;]*\b(contactInfo|healthInfo|noteContent|zohoContact|answers|body\.contactInfo|userEmail|data\.email|contactData\.email|recordData\.email)\b/;

function walk(dir: string, out: string[] = []): string[] {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p, out);
    else if (/\.(ts|tsx)$/.test(name) && !name.endsWith('.test.ts')) out.push(p);
  }
  return out;
}

test('no console call prints patient-bearing objects', () => {
  const offenders: string[] = [];
  for (const root of ROOTS) {
    for (const file of walk(root)) {
      const src = readFileSync(file, 'utf8');
      const lines = src.split('\n');
      lines.forEach((line, i) => {
        if (FORBIDDEN.test(line)) offenders.push(`${file}:${i + 1}: ${line.trim()}`);
      });
    }
  }
  assert.deepEqual(offenders, []);
});
