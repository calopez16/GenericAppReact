import { AuthHelper } from '@helpers/AuthHelper';
import { API_BASE_URL } from '@config';

const API_ENDPOINT_REFRESH_TOKEN = "Auth/refresh-token";
const API_ENDPOINT_LOGIN = "Auth/login";

// --- Lógica para manejar el Refresh Token ---
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
    failedQueue.forEach(prom => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token);
        }
    });
    failedQueue = [];
};

// MODIFICADO: Agregamos el parámetro responseType = 'json' por defecto
const handleResponse = async (response, isReturnData, responseType = 'json') => {
    if (!response.ok && response.status !== 409) {
        if (response.status === 401) {
            throw new Error("Su sesión ha expirado. Por favor, inicie sesión de nuevo.");
        }
        // Intentamos leer el error como JSON, si falla (porque es blob u otro), devolvemos objeto vacío
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! Status: ${response.status}`);
    }

    // NUEVO: Manejo específico para BLOB (Archivos PDF, Excel, Imagenes)
    if (responseType === 'blob') {
        const blobData = await response.blob();
        return {
            success: response.ok,
            data: blobData, // Devolvemos el Blob directamente en 'data'
            conflict: null,
            message: null,
            responseCode: response.status
        };
    }

    // Lógica original para JSON
    var dataResponse = isReturnData ? await response.json() : response.ok;

    return {
        success: response.ok,
        data: dataResponse?.data,
        conflict: dataResponse?.conflict,
        message: dataResponse?.message,
        responseCode: response.status
    };
};

// MODIFICADO: El último parámetro ahora se llama 'config' y soporta booleano u objeto
const sendRequest = async (endPoint, method, data = null, config = false) => {
    const url = `${API_BASE_URL}/${endPoint}`;
    const token = AuthHelper.getAccessToken();

    // LÓGICA DE COMPATIBILIDAD:
    // 1. Si config es booleano, actúa como el antiguo 'isReturnData'.
    // 2. Si es objeto, extraemos las opciones nuevas (responseType).
    let isReturnData = false;
    let responseType = 'json';

    if (typeof config === 'boolean') {
        isReturnData = config;
    } else if (typeof config === 'object') {
        isReturnData = config.isReturnData !== undefined ? config.isReturnData : true;
        responseType = config.responseType || 'json';
    }

    const isFormData = data instanceof FormData;

    const options = {
        method: method,
        headers: {
            ...(!isFormData && { 'Content-Type': 'application/json' }),
            ...(token && { 'Authorization': `Bearer ${token}` })
        },
    };

    if (data && ['POST', 'PUT', 'DELETE'].includes(method)) {
        options.body = isFormData ? data : JSON.stringify(data);
    }

    try {
        let response = await fetch(url, options);

        if (response.status === 403) {
            window.location.href = '/unauthorized';
            return false;
        }

        if (response.status === 401) {
            if (endPoint.includes(API_ENDPOINT_REFRESH_TOKEN)) {
                AuthHelper.logout();
                return Promise.reject(new Error("Refresh token failed"));
            } else if (endPoint.includes(API_ENDPOINT_LOGIN)) {
                AuthHelper.logout(false);
                return false;
            }

            if (isRefreshing) {
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                })
                    .then(newToken => {
                        options.headers['Authorization'] = `Bearer ${newToken}`;
                        return fetch(url, options);
                    })
                    // MODIFICADO: Pasamos el responseType al reintento
                    .then(newResponse => handleResponse(newResponse, isReturnData, responseType));
            }

            isRefreshing = true;

            try {
                const refreshTokenResponse = await fetch(`${API_BASE_URL}/${API_ENDPOINT_REFRESH_TOKEN}`, {
                    method: 'GET',
                    headers: { ...(token && { 'Authorization': `Bearer ${token}` }) },
                });

                if (!refreshTokenResponse.ok) {
                    throw new Error("Failed refresh token");
                }

                const authLogin = await refreshTokenResponse.json();
                AuthHelper.setAccessToken(authLogin.data.token);
                processQueue(null, authLogin.data.token);

                options.headers['Authorization'] = `Bearer ${authLogin.data.token}`;
                response = await fetch(url, options);

            } catch (refreshError) {
                processQueue(refreshError, null);
                AuthHelper.logout();
                return Promise.reject(refreshError);
            } finally {
                isRefreshing = false;
            }
        }

        // MODIFICADO: Pasamos el responseType a handleResponse
        return await handleResponse(response, isReturnData, responseType);

    } catch (err) {
        console.error(`API Error (${method} ${url}): ${err.message}`);
        throw err;
    }
};

// EXPORTACIONES ACTUALIZADAS
// GET ahora acepta options (que puede ser { responseType: 'blob' } o el booleano true/false)
export const GET = (endPoint, options = true) => sendRequest(endPoint, 'GET', null, options);
export const POST = (endPoint, data, isReturnData = false) => sendRequest(endPoint, 'POST', data, isReturnData);
export const PUT = (endPoint, data, isReturnData = false) => sendRequest(endPoint, 'PUT', data, isReturnData);
export const DELETE = (endPoint, data = null, isReturnData = false) => sendRequest(endPoint, 'DELETE', data, isReturnData);