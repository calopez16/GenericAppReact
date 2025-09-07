// Este helper centraliza el acceso al token en localStorage.
// As�, tanto el AppContext como el interceptor de API leen del mismo lugar.

export const AuthHelper = {
    getAccessToken: () => localStorage.getItem('accessToken'),

    setAccessToken: (token) => {
        if (token) {
            localStorage.setItem('accessToken', token);
        } else {
            localStorage.removeItem('accessToken');
        }
        // Disparamos un evento para que AppContext se actualice si est� escuchando.
        window.dispatchEvent(new Event('storage'));
    },

    logout: (redirectToLogin = true) => {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('userName');
        localStorage.removeItem('userRole');
        window.dispatchEvent(new Event('storage'));
        if (redirectToLogin)
            // Redirecci�n forzada al login.
            window.location.href = '/login';
    }
};