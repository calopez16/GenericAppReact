import { createContext, useState, useEffect, useCallback } from "react";
import { AuthHelper } from '@helpers/AuthHelper';
import { DataAPIConfigurationService } from '@data/Configuration/Data';

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
    const [userRoles, setUserRoles] = useState(() => {
        try {
            const stored = localStorage.getItem("userRoles");
            return stored ? JSON.parse(stored) : [];
        } catch {
            return [];
        }
    });
    const [themeMode, setThemeMode] = useState(() => localStorage.getItem("themeMode") || "dark");
    const [loading, setLoading] = useState(false);
    const [appConfig, setAppConfig] = useState(() => {
        try {
            const stored = localStorage.getItem("appConfig");
            return stored ? JSON.parse(stored) : null;
        } catch {
            return null;
        }
    });

    const canSelectCompany = userRoles?.includes('MultiEmpresa') || userRoles?.includes('Administrator');
    const configService = DataAPIConfigurationService();

    const loadAppConfig = useCallback(async (i18nInstance) => {
        try {
            const response = await configService.getData();
            if (response?.success && response?.data) {
                const config = response.data;
                setAppConfig(config);
                localStorage.setItem("appConfig", JSON.stringify(config));

                if (i18nInstance && config.defaultLanguage) {
                    i18nInstance.changeLanguage(config.defaultLanguage);
                }
                if (config.defaultTheme) {
                    setThemeMode(config.defaultTheme);
                }
            }
        } catch {
            // Si falla, se mantiene la configuración previa
        }
    }, []);

    // useEffect para guardar userName y userRole. El token ya se maneja con el helper.
    useEffect(() => {
        if (userName) localStorage.setItem("userName", userName);
        if (userRoles) localStorage.setItem("userRoles", JSON.stringify(userRoles));
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
            try {
                const storedRoles = localStorage.getItem("userRoles");
                setUserRoles(storedRoles ? JSON.parse(storedRoles) : []);
            } catch {
                setUserRoles([]);
            }
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
        document.body.classList.toggle('dark-mode', themeMode === 'dark');
    }, [themeMode]);

    const isMultiCompanyEnable = appConfig?.isMultiCompanyEnable !== false;

    const contextValue = {
        userName,
        setUserName,
        accessToken,
        companySelected,
        setCompanySelected,
        canSelectCompany,
        setAccessToken: (token) => {
            AuthHelper.setAccessToken(token);
            setAccessToken(token);
        },
        userRoles,
        setUserRoles,
        logout: AuthHelper.logout,
        themeMode,
        setThemeMode,
        loading,
        setLoading,
        appConfig,
        setAppConfig,
        loadAppConfig,
        isMultiCompanyEnable,
    };

    return (
        <AppContext.Provider value={contextValue}>
            {children}
        </AppContext.Provider>
    );
};