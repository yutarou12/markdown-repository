import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createStore, nextId, type StoreData } from './store.js';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
test('IDは月ごとに採番し999件で停止する', () => {
  const data: StoreData = { documents: [], counters: {} };
  assert.equal(nextId(data, '2026-11-20T10:00'), '202611001');
  assert.equal(nextId(data, '2026-11-21T10:00'), '202611002');
  assert.equal(nextId(data, '2026-12-01T10:00'), '202612001');
  data.counters['202611'] = 999;
  assert.throws(() => nextId(data, '2026-11-20T10:00'));
});
test('保存データと採番情報は再起動後も保持する', () => {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'markshelf-'));
  try {
    const store = createStore(directory);
    nextId(store.data, '2026-11-20');
    store.save();
    assert.equal(nextId(createStore(directory).data, '2026-11-20'), '202611002');
  } finally {
    fs.rmSync(directory, { recursive: true });
  }
});
