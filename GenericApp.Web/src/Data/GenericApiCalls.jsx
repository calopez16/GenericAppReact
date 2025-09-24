import { AuthHelper } from '@helpers/AuthHelper'; // Asegúrate de que la ruta sea correcta
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

const handleResponse = async (response, isReturnData) => {
    if (!response.ok && response.status !== 409) {
        // Si el error es 401, el interceptor ya lo habrá manejado.
        // Aquí manejamos otros errores.
        if (response.status === 401) {
            // Este error solo debería lanzarse si el refresh token falla.
            throw new Error("Su sesión ha expirado. Por favor, inicie sesión de nuevo.");
        }
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! Status: ${response.status}`);
    }
    var dataResponse = isReturnData ? await response.json() : response.ok;

    return {
        success: response.ok,
        data: dataResponse?.data,
        conflict: dataResponse?.conflict,
        message: dataResponse?.message,
        responseCode: response.status
    };
};

const sendRequest = async (endPoint, method, data = null, isReturnData = false) => {
    const url = `${API_BASE_URL}/${endPoint}`;
    const token = AuthHelper.getAccessToken(); // Obtenemos el token actual

    const options = {
        //credentials: 'include',
        method: method,
        headers: {
            'Content-Type': 'application/json',
            // Adjuntamos el token de autorización si existe
            ...(token && { 'Authorization': `Bearer ${token}` })
        },
    };

    if (data && ['POST', 'PUT', 'DELETE'].includes(method)) {
        options.body = JSON.stringify(data);
    }

    try {
        let response = await fetch(url, options);

        //Autorizacion por medio del token, cuando el token no tiene permisos para consultar lanza un 403
        if (response.status === 403) {
            AuthHelper.logout();
            return false;
        }

        // --- Interceptor de respuesta 401 ---
        if (response.status === 401) {
            // Si la llamada que falla es la de refresh-token, hacemos logout directamente para evitar un bucle infinito.
            if (endPoint.includes(API_ENDPOINT_REFRESH_TOKEN)) {
                AuthHelper.logout();
                return Promise.reject(new Error("Refresh token failed"));
            } else if (endPoint.includes(API_ENDPOINT_LOGIN)) {
                AuthHelper.logout(false);
                return false;
            }

            if (isRefreshing) {
                // Si ya se está refrescando el token, encolamos esta petición.
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                })
                    .then(newToken => {
                        // Reintentamos la petición con el nuevo token
                        options.headers['Authorization'] = `Bearer ${newToken}`;
                        return fetch(url, options);
                    })
                    .then(newResponse => handleResponse(newResponse, isReturnData));
            }

            isRefreshing = true;

            // Intentamos obtener un nuevo token
            try {
                const refreshTokenResponse = await fetch(`${API_BASE_URL}/${API_ENDPOINT_REFRESH_TOKEN}`, {
                    method: 'GET',
                    headers: {
                        ...(token && { 'Authorization': `Bearer ${token}` })
                    },
                });

                if (!refreshTokenResponse.ok) {
                    throw new Error("Failed refresh token");
                }

                const authLogin = await refreshTokenResponse.json();
                AuthHelper.setAccessToken(authLogin.token); // Guardamos el nuevo token
                processQueue(null, authLogin.token); // Procesamos la cola de peticiones fallidas

                // Reintentamos la petición original con el nuevo token
                options.headers['Authorization'] = `Bearer ${authLogin.token}`;
                response = await fetch(url, options);

            } catch (refreshError) {
                processQueue(refreshError, null);
                AuthHelper.logout(); // Si el refresh falla, cerramos la sesión
                return Promise.reject(refreshError);
            } finally {
                isRefreshing = false;
            }
        }

        return await handleResponse(response, isReturnData);

    } catch (err) {
        console.error(`API Error (${method} ${url}): ${err.message}`);
        throw err;
    }
};


// Las exportaciones no cambian
export const GET = (endPoint, isReturnData = true) => sendRequest(endPoint, 'GET', null, isReturnData);
export const POST = (endPoint, data, isReturnData = false) => sendRequest(endPoint, 'POST', data, isReturnData);
export const PUT = (endPoint, data, isReturnData = false) => sendRequest(endPoint, 'PUT', data, isReturnData);
export const DELETE = (endPoint, data = null, isReturnData = false) => sendRequest(endPoint, 'DELETE', data, isReturnData);