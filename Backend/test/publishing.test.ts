import assert from 'node:assert/strict';
import { once } from 'node:events';
import type { AddressInfo } from 'node:net';
import { test } from 'node:test';
import express from 'express';
import { createPublishingLimit } from '../src/publishing.js';

test('publishing bursts are limited per account rather than shared IP', async () => {
  const app = express();
  app.use((req, res, next) => { res.locals.user = {id: req.get('X-Test-User')}; next(); });
  app.post('/publish', createPublishingLimit(), (_req, res) => { res.json({status:'ok'}); });
  const server = app.listen(0, '127.0.0.1');
  try {
    await once(server, 'listening');
    const url = `http://127.0.0.1:${(server.address() as AddressInfo).port}/publish`;
    for (let i = 0; i < 30; i++) {
      const response = await fetch(url, {method:'POST', headers:{'X-Test-User':'account-a'}});
      assert.equal(response.status, 200);
      await response.arrayBuffer();
    }
    const blocked = await fetch(url, {method:'POST', headers:{'X-Test-User':'account-a'}});
    assert.equal(blocked.status, 429);
    assert.match((await blocked.json()).error, /publishing/i);
    const independent = await fetch(url, {method:'POST', headers:{'X-Test-User':'account-b'}});
    assert.equal(independent.status, 200);
    await independent.arrayBuffer();
  } finally {
    server.closeIdleConnections();
    await new Promise<void>((resolve,reject) => server.close(error => error ? reject(error) : resolve()));
  }
});
