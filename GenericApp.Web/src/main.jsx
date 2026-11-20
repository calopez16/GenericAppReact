import { StrictMode, useContext, Suspense } from 'react'; // <--- Agregado Suspense
import { createRoot } from 'react-dom/client';
import { HashRouter } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import { CircularProgress, Box } from '@mui/material'; // Ejemplo de Loader
import '@styles/App.css';
import App from '@views/Index';
import { AppContextProvider, AppContext } from '@helpers/AppContext';
import { NotificationContext } from '@helpers/NotificationContext';
import { lightTheme, darkTheme } from '@helpers/ThemeHelper';
import { loadRuntimeConfig } from '@/runtimeConfig';
import '@locales/i18n';

const PageLoader = () => (
    <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
        <CircularProgress />
    </Box>
);

const AppWithThemeWrapper = () => {
    const { themeMode } = useContext(AppContext);
    const theme = themeMode === 'light' ? lightTheme : darkTheme;

    return (
        <ThemeProvider theme={theme}>
            <Suspense fallback={<PageLoader />}>
                <App />
            </Suspense>
        </ThemeProvider>
    );
};

const root = createRoot(document.getElementById('root'));
root.render(<PageLoader />);

loadRuntimeConfig().then(() => {
    root.render(
        <AppContextProvider>
            <NotificationContext>
                <HashRouter>
                    <AppWithThemeWrapper />
                </HashRouter>
            </NotificationContext>
        </AppContextProvider>
    );
}).catch((error) => {
    console.error('Error al cargar la configuración de la aplicación:', error);
    root.render(
        <Box role="alert" sx={{ p: 4 }}>
            No se pudo cargar la configuración de la aplicación. Revise config.json y la consola del navegador.
        </Box>
    );
});