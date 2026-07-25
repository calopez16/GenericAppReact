// Este helper centraliza el acceso al token en localStorage.
// Así, tanto el AppContext como el interceptor de API leen del mismo lugar.
import { APP_BASE_URL } from '@config';
import { StorageHelper } from '@helpers/StorageHelper';

export const AuthHelper = {
    getAccessToken: () => StorageHelper.getString('accessToken'),

    setAccessToken: (token) => {
        if (token) {
            StorageHelper.setItem('accessToken', token);
        } else {
            StorageHelper.removeItem('accessToken');
        }
        // Disparamos un evento para que AppContext se actualice si está escuchando.
        window.dispatchEvent(new Event('storage'));
    },

    logout: (redirectToLogin = true) => {
        StorageHelper.removeItem('accessToken');
        // Limpiar campos de usuario dentro de appConfig, conservando la config de la app
        const cfg = StorageHelper.getObject('appConfig') || {};
        delete cfg.userName;
        delete cfg.userRoles;
        delete cfg.company;
        StorageHelper.setItem('appConfig', cfg);
        window.dispatchEvent(new Event('storage'));
        if (redirectToLogin)
            // Redirección forzada al login.
            window.location.href = `#/login`;
    }
};