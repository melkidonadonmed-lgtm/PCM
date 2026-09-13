import test from 'node:test';
import assert from 'node:assert/strict';

test('smoke test: ambiente de execução e contratos básicos ativos', () => {
  assert.equal(typeof process, 'object');
  assert.ok(process.version.startsWith('v2') || process.version.startsWith('v18') || process.version.startsWith('v22'));
});
