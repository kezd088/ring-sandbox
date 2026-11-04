import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
import { setImmediate as tick } from 'node:timers/promises';

const read = (f) => JSON.parse(readFileSync(new URL('../' + f, import.meta.url), 'utf8'));

const runHomeScript = async (fetch) => {
  const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
  const script = html.match(/<script>([\s\S]*?)<\/script>/)[1];
  const version = { textContent: html.match(/<span id="version">([^<]*)<\/span>/)[1] };
  const document = { getElementById: (id) => (id === 'version' ? version : null) };
  runInNewContext(script, { fetch, document });
  await tick();
  return version.textContent;
};

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

test('index.html title and heading both read Ring sandbox', () => {
  const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
  assert.match(html, /<title>Ring sandbox<\/title>/);
  assert.match(html, /<h1 id="title">Ring sandbox<\/h1>/);
});

test('index.html version label reads Version:', () => {
  const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
  assert.match(html, />Version: <span id="version">/);
  assert.doesNotMatch(html, /Verison/);
});

test('index.html version shows unknown while version.json is still loading', async () => {
  const text = await runHomeScript(() => new Promise(() => {}));
  assert.equal(text, 'unknown');
});

test('index.html version shows the first 12 sha chars when version.json loads', async () => {
  const sha = '0123456789abcdef0123456789abcdef01234567';
  const text = await runHomeScript(async () => ({ ok: true, json: async () => ({ sha }) }));
  assert.equal(text, sha.slice(0, 12));
});

test('index.html version shows 读取失败 when version.json cannot be fetched', async () => {
  const text = await runHomeScript(async () => { throw new TypeError('Failed to fetch'); });
  assert.equal(text, '读取失败');
});

test('index.html version shows 读取失败 when version.json returns 404', async () => {
  const text = await runHomeScript(async () => ({
    ok: false,
    status: 404,
    json: async () => { throw new SyntaxError('Unexpected token <'); },
  }));
  assert.equal(text, '读取失败');
});

test('index.html version shows 读取失败 when version.json sha is missing or all zeros', async () => {
  const missing = await runHomeScript(async () => ({ ok: true, json: async () => ({ build: 'dev' }) }));
  assert.equal(missing, '读取失败');
  const zeros = await runHomeScript(async () => ({ ok: true, json: async () => ({ sha: '0'.repeat(40), build: 'dev' }) }));
  assert.equal(zeros, '读取失败');
});
