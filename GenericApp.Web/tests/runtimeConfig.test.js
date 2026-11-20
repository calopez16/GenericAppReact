import assert from 'node:assert/strict';
import process from 'node:process';
import { after, before, test } from 'node:test';
import { createServer } from 'vite';

let server;
let runtimeConfig;
const originalFetch = globalThis.fetch;
const originalDocument = globalThis.document;
const originalWindow = globalThis.window;
const originalEnvUrl = process.env.VITE_API_BASE_URL;

before(async () => {
    process.env.VITE_API_BASE_URL = 'https://fallback.example.com/api';
    server = await createServer({ server: { middlewareMode: true }, appType: 'custom' });
    runtimeConfig = await server.ssrLoadModule('/src/runtimeConfig.js');
    globalThis.document = { baseURI: 'https://example.com/Contratos/' };
    globalThis.window = { location: { origin: 'https://example.com' } };
});

after(async () => {
    globalThis.fetch = originalFetch;
    globalThis.document = originalDocument;
    globalThis.window = originalWindow;
    if (originalEnvUrl === undefined) delete process.env.VITE_API_BASE_URL;
    else process.env.VITE_API_BASE_URL = originalEnvUrl;
    if (server) await server.close();
});

function respondWith(config) {
    globalThis.fetch = async (url, options) => {
        assert.equal(url.href, 'https://example.com/Contratos/config.json');
        assert.equal(options.cache, 'no-store');
        return { ok: true, json: async () => config };
    };
}

test('loads the configured API URL and removes trailing slashes', async () => {
    respondWith({ apiBaseUrl: ' https://api.example.com/contratos/api/ ' });
    await runtimeConfig.loadRuntimeConfig();
    assert.equal(runtimeConfig.apiBaseUrl, 'https://api.example.com/contratos/api');
});

test('supports root-relative API URLs', async () => {
    respondWith({ apiBaseUrl: '/contratos/api/' });
    await runtimeConfig.loadRuntimeConfig();
    assert.equal(runtimeConfig.apiBaseUrl, '/contratos/api');
});

test('uses the environment URL when the configured URL is empty', async () => {
    respondWith({ apiBaseUrl: '' });
    await runtimeConfig.loadRuntimeConfig();
    assert.equal(runtimeConfig.apiBaseUrl, 'https://fallback.example.com/api');
});

test('rejects inaccessible and invalid configuration', async () => {
    globalThis.fetch = async () => ({ ok: false, status: 404 });
    await assert.rejects(runtimeConfig.loadRuntimeConfig(), /HTTP 404/);
    respondWith({});
    await assert.rejects(runtimeConfig.loadRuntimeConfig(), /apiBaseUrl como texto/);
    for (const apiBaseUrl of ['not-a-url', '//example.com/api', '/\\example.com/api', 'ftp://example.com', 'https://example.com/api?key=1']) {
        respondWith({ apiBaseUrl });
        await assert.rejects(runtimeConfig.loadRuntimeConfig(), /apiBaseUrl/);
    }
    globalThis.fetch = async () => ({ ok: true, json: async () => { throw new SyntaxError('Invalid JSON'); } });
    await assert.rejects(runtimeConfig.loadRuntimeConfig(), /Invalid JSON/);
});
