import { createContext, useState, useEffect } from "react";
import { AuthHelper } from '@helpers/AuthHelper'; // Aseg�rate de que la ruta sea correcta

export const AppContext = createContext(null);

export const AppContextProvider = ({ children }) => {
    // El estado inicial se lee directamente del helper.
    const [userName, setUserName] = useState(() => localStorage.getItem("userName"));
    const [accessToken, setAccessToken] = useState(() => AuthHelper.getAccessToken());
    const [userRole, setUserRole] = useState(() => localStorage.getItem("userRole"));

    // useEffect para guardar userName y userRole. El token ya se maneja con el helper.
    useEffect(() => {
        if (userName) localStorage.setItem("userName", userName);
        if (userRole) localStorage.setItem("userRole", userRole);
    }, [userName, userRole]);

    // Este efecto escucha cambios en el storage para actualizar el estado del contexto.
    useEffect(() => {
        const handleStorageChange = () => {
            setAccessToken(AuthHelper.getAccessToken());
            setUserName(localStorage.getItem("userName"));
            setUserRole(localStorage.getItem("userRole"));
        };

        window.addEventListener('storage', handleStorageChange);

        return () => {
            window.removeEventListener('storage', handleStorageChange);
        };
    }, []);

    const contextValue = {
        userName,
        setUserName,
        accessToken,
        // setAccessToken ahora usa el helper para que el cambio sea global.
        setAccessToken: (token) => {
            AuthHelper.setAccessToken(token);
            setAccessToken(token); // Actualiza tambi�n el estado local del contexto.
        },
        userRole,
        setUserRole,
        // Agregamos una funci�n de logout al contexto.
        logout: AuthHelper.logout
    };

    return (
        <AppContext.Provider value={contextValue}>
            {children}
        </AppContext.Provider>
    );
};