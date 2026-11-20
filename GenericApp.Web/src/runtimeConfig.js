export let apiBaseUrl;

export async function loadRuntimeConfig() {
    const response = await fetch(new URL('config.json', document.baseURI), { cache: 'no-store' });
    if (!response.ok) {
        throw new Error(`No se pudo cargar config.json (HTTP ${response.status}).`);
    }

    const config = await response.json();
    if (!config || typeof config.apiBaseUrl !== 'string') {
        throw new Error('config.json debe contener apiBaseUrl como texto.');
    }

    const value = config.apiBaseUrl.trim() || import.meta.env.VITE_API_BASE_URL?.trim();
    if (!value) {
        throw new Error('Configure apiBaseUrl en config.json o VITE_API_BASE_URL en el archivo .env.');
    }

    const isRootRelative = /^\/(?!\/)/.test(value);
    let url;
    try {
        if (value.includes('\\')) throw new Error('Invalid URL');
        url = isRootRelative ? new URL(value, window.location.origin) : new URL(value);
    } catch {
        throw new Error('apiBaseUrl debe ser una URL HTTP(S) absoluta o una ruta que empiece con /.');
    }
    if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password || url.search || url.hash) {
        throw new Error('apiBaseUrl no admite credenciales, parámetros ni fragmentos y debe usar HTTP(S).');
    }

    apiBaseUrl = value.replace(/\/+$/, '');
}
