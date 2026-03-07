// Este helper centraliza el acceso al token en localStorage.
// Así, tanto el AppContext como el interceptor de API leen del mismo lugar.
import { APP_BASE_URL } from '@config';

export const AuthHelper = {
    getAccessToken: () => localStorage.getItem('accessToken'),

    setAccessToken: (token) => {
        if (token) {
            localStorage.setItem('accessToken', token);
        } else {
            localStorage.removeItem('accessToken');
        }
        // Disparamos un evento para que AppContext se actualice si está escuchando.
        window.dispatchEvent(new Event('storage'));
    },

    logout: (redirectToLogin = true) => {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('userName');
        localStorage.removeItem('userRoles');
        localStorage.removeItem('company');
        localStorage.removeItem('appConfig');
        localStorage.removeItem('themeMode');
        window.dispatchEvent(new Event('storage'));
        if (redirectToLogin)
            // Redirección forzada al login.
            window.location.href = `${APP_BASE_URL}/login`;
    }
};