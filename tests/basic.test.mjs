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

test('index.html title reads Ring sandbox, heading reads Ring sandbox ready', () => {
  const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
  assert.match(html, /<title>Ring sandbox<\/title>/);
  assert.match(html, /<h1 id="title">Ring sandbox ready<\/h1>/);
});

test('index.html version label reads Version:', () => {
  const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
  assert.match(html, />Version: <span id="version">/);
  assert.doesNotMatch(html, /Verison/);
});

test('index.html version is empty until version.json loads the first 12 sha chars', () => {
  const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
  assert.match(html, /<span id="version"><\/span>/);
  assert.match(html, /getElementById\('version'\)\.textContent = v\.sha\.slice\(0, 12\)/);
});
