import { createContext, useState, useEffect, useCallback } from "react";
import { AuthHelper } from '@helpers/AuthHelper';
import { StorageHelper } from '@helpers/StorageHelper';
import { DataAPIConfigurationService } from '@data/Configuration/Data';

export const AppContext = createContext(null);

export const AppContextProvider = ({ children }) => {
    // El estado inicial se lee desde el objeto appConfig en localStorage.
    const [appConfig, setAppConfig] = useState(() => StorageHelper.getObject("appConfig") || {});
    const [userName, setUserName] = useState(() => (StorageHelper.getObject("appConfig") || {}).userName ?? null);
    const [accessToken, setAccessToken] = useState(() => AuthHelper.getAccessToken());
    const [companySelected, setCompanySelected] = useState(() => (StorageHelper.getObject("appConfig") || {}).company ?? null);
    const [userRoles, setUserRoles] = useState(() => (StorageHelper.getObject("appConfig") || {}).userRoles ?? []);
    const [themeMode, setThemeMode] = useState(() => (StorageHelper.getObject("appConfig") || {}).themeMode || "dark");
    const [loading, setLoading] = useState(false);

    const canSelectCompany = userRoles?.includes('MultiEmpresa') || userRoles?.includes('Administrator');
    const configService = DataAPIConfigurationService();

    const mergeAppConfig = useCallback((updates) => {
        const current = StorageHelper.getObject("appConfig") || {};
        const merged = { ...current, ...updates };
        StorageHelper.setItem("appConfig", merged);
        return merged;
    }, []);

    const loadAppConfig = useCallback(async (i18nInstance) => {
        try {
            const response = await configService.getData();
            if (response?.success && response?.data) {
                const config = response.data;
                setAppConfig(prev => ({ ...prev, ...config }));
                mergeAppConfig(config);

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
    }, [mergeAppConfig]);

    // useEffect para guardar userName, userRoles y company dentro de appConfig.
    useEffect(() => {
        mergeAppConfig({ userName: userName ?? null });
    }, [userName]);

    useEffect(() => {
        mergeAppConfig({ userRoles: userRoles ?? [] });
    }, [userRoles]);

    useEffect(() => {
        mergeAppConfig({ company: companySelected ?? null });
    }, [companySelected]);

    // Este efecto escucha cambios en el storage para actualizar el estado del contexto.
    useEffect(() => {
        const handleStorageChange = () => {
            const cfg = StorageHelper.getObject("appConfig") || {};
            setAccessToken(AuthHelper.getAccessToken());
            setUserName(cfg.userName ?? null);
            setUserRoles(cfg.userRoles ?? []);
            setCompanySelected(cfg.company ?? null);
        };

        window.addEventListener('storage', handleStorageChange);

        return () => {
            window.removeEventListener('storage', handleStorageChange);
        };
    }, []);

    useEffect(() => {
        mergeAppConfig({ themeMode });
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