import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const read = (f) => JSON.parse(readFileSync(new URL('../' + f, import.meta.url), 'utf8'));

test('version.json has a 40-char sha and a build', () => {
  const v = read('version.json');
  assert.match(v.sha, /^[0-9a-f]{40}$/);
  assert.equal(typeof v.build, 'string');
});

test('health.json reports ok and database_connected', () => {
  const h = read('api/health.json');
  assert.equal(h.ok, true);
  assert.equal(h.database_connected, true);
});

test('index.html title reads Ring sandbox', () => {
  const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
  assert.match(html, /<title>Ring sandbox<\/title>/);
  assert.match(html, /<h1 id="title">Ring sandbox<\/h1>/);
});
