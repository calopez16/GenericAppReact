import { React, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '@helpers/AppContext';

function LoginPage() {
    // 2. Obtén las funciones que necesitas del contexto
    const { userName, setUserName, accessToken, setAccessToken, setUserRole } = useContext(AppContext);
    const navigate = useNavigate(); // Hook para redirigir al usuario

    const handleLogin = () => {
        // 3. Simula la obtención de datos de un inicio de sesión
        const fakeToken = 'secret-jwt-token-12345';
        const userRole = 'admin';

        // 4. Asigna los valores al estado global usando el contexto
        setAccessToken(fakeToken);
        setUserRole(userRole);

        // 5. Redirige al usuario a la página principal
        navigate('/');
    };

    return (
        <div>
            <h1>Página de Login</h1>
            <p>Presiona el botón para simular un inicio de sesión.</p>
            <button onClick={handleLogin}>
                Iniciar Sesión
            </button>
        </div>
    );
}

export default LoginPage;