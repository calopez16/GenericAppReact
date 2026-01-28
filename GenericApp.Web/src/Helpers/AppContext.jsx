import { createContext, useState, useEffect } from "react";
import { AuthHelper } from '@helpers/AuthHelper'; 

export const AppContext = createContext(null);

export const AppContextProvider = ({ children }) => {
    // El estado inicial se lee directamente del helper.
    const [userName, setUserName] = useState(() => localStorage.getItem("userName"));
    const [accessToken, setAccessToken] = useState(() => AuthHelper.getAccessToken());
    const [companySelected, setCompanySelected] = useState(() => {
        try {
            const storedCompany = localStorage.getItem("company");
            // Si existe, lo convertimos de texto a Objeto JS. Si no, devolvemos null.
            return storedCompany ? JSON.parse(storedCompany) : null;
        } catch (error) {
            console.error("Error al leer la compañía del storage:", error);
            return null;
        }
    });
    const [userRoles, setUserRoles] = useState(() => localStorage.getItem("userRoles"));
    const [themeMode, setThemeMode] = useState(() => localStorage.getItem("themeMode") || "dark");
    const [loading, setLoading] = useState(false);

    const canSelectCompany = userRoles?.includes('MultiEmpresa') || userRoles?.includes('Administrator');;

    // useEffect para guardar userName y userRole. El token ya se maneja con el helper.
    useEffect(() => {
        if (userName) localStorage.setItem("userName", userName);
        if (userRoles) localStorage.setItem("userRoles", userRoles);
    }, [userName, userRoles]);

    useEffect(() => {
        if (companySelected) {
            // Convertimos el objeto a texto JSON antes de guardar
            localStorage.setItem("company", JSON.stringify(companySelected));
        } else {
            // Si es null o undefined, limpiamos la clave
            localStorage.removeItem("company");
        }
    }, [companySelected]);

    // Este efecto escucha cambios en el storage para actualizar el estado del contexto.
    useEffect(() => {
        const handleStorageChange = () => {
            setAccessToken(AuthHelper.getAccessToken());
            setUserName(localStorage.getItem("userName"));
            setUserRoles(localStorage.getItem("userRoles"));
            const companyData = localStorage.getItem("company");
            try {
                setCompanySelected(companyData ? JSON.parse(companyData) : null);
            } catch (e) {
                setCompanySelected(null);
            }
        };

        window.addEventListener('storage', handleStorageChange);

        return () => {
            window.removeEventListener('storage', handleStorageChange);
        };
    }, []);

    useEffect(() => {
        localStorage.setItem("themeMode", themeMode);
    }, [themeMode]);

    const contextValue = {
        userName,
        setUserName,
        accessToken,
        companySelected,
        setCompanySelected,
        canSelectCompany,
        // setAccessToken ahora usa el helper para que el cambio sea global.
        setAccessToken: (token) => {
            AuthHelper.setAccessToken(token);
            setAccessToken(token); // Actualiza también el estado local del contexto.
        },
        userRoles,
        setUserRoles,
        // Agregamos una función de logout al contexto.
        logout: AuthHelper.logout,
        themeMode,
        setThemeMode,
        loading,
        setLoading
    };

    return (
        <AppContext.Provider value={contextValue}>
            {children}
        </AppContext.Provider>
    );
};