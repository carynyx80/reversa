import assert from 'node:assert/strict';
import {Readable} from 'node:stream';
import handler from '../api/index.js';

async function invoke(url, {method = 'GET', body = '', headers = {}} = {}) {
  const req = Readable.from(body ? [Buffer.from(body)] : []);
  Object.assign(req, {url, method, headers: {host: 'reversa.example', ...headers}, socket: {remoteAddress: '127.0.0.1'}});
  const result = {};
  await handler(req, {writeHead(status, responseHeaders) {Object.assign(result, {status, headers: responseHeaders});}, end(data) {result.body = String(data);}});
  return result;
}
const page = await invoke('/api/index?__reversa_path=/&network=mainnet');
assert.equal(page.status, 200);
assert.match(page.body, /REVERSA/);
assert.ok(page.headers['content-security-policy']);
const method = await invoke('/api/index?__reversa_path=/api/analyze');
assert.equal(method.status, 405);
const invalid = await invoke('/api/index?__reversa_path=/api/analyze', {method: 'POST', body: JSON.stringify({query: 'bad', network: 'mainnet'}), headers: {'content-type': 'application/json'}});
assert.equal(invalid.status, 400);
const crossSite = await invoke('/api/index?__reversa_path=/api/health', {headers: {origin: 'https://other.example'}});
assert.equal(crossSite.status, 403);
const oversized = await invoke('/api/index?__reversa_path=/api/analyze', {method: 'POST', body: 'a'.repeat(2049)});
assert.equal(oversized.status, 413);
const originalFetch = globalThis.fetch;
globalThis.fetch = async (_url, options) => {
  const {method} = JSON.parse(options.body);
  return Response.json({result: method === 'eth_chainId' ? '0x1237' : {number: '0x10', timestamp: '0x1'}});
};
try {
  const health = await invoke('/api/index?__reversa_path=/api/health&network=mainnet');
  assert.equal(health.status, 200);
  assert.equal(JSON.parse(health.body).chainId, 4663);
} finally {globalThis.fetch = originalFetch;}
console.log('Passed: Vercel adapter UI, route/query forwarding, security headers, method, input, origin, body limit and RPC health.');
