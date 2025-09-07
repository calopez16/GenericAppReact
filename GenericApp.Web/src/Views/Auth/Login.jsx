import { React, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '@helpers/AppContext';

function LoginPage() {
    // 2. Obt�n las funciones que necesitas del contexto
    const { userName, setUserName, accessToken, setAccessToken, setUserRole } = useContext(AppContext);
    const navigate = useNavigate(); // Hook para redirigir al usuario

    const handleLogin = () => {
        // 3. Simula la obtenci�n de datos de un inicio de sesi�n
        const fakeToken = 'secret-jwt-token-12345';
        const userRole = 'admin';

        // 4. Asigna los valores al estado global usando el contexto
        setAccessToken(fakeToken);
        setUserRole(userRole);

        // 5. Redirige al usuario a la p�gina principal
        navigate('/');
    };

    return (
        <div>
            <h1>Página de Login</h1>
            <p>Presiona el bot�n para simular un inicio de sesi�n.</p>
            <button onClick={handleLogin}>
                Iniciar Sesiónáóúcí
            </button>
        </div>
    );
}

export default LoginPage;