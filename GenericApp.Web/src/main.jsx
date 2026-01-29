import { StrictMode, useContext, Suspense } from 'react'; // <--- Agregado Suspense
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import { CircularProgress, Box } from '@mui/material'; // Ejemplo de Loader
import '@styles/App.css';
import App from '@views/Index';
import { AppContextProvider, AppContext } from '@helpers/AppContext';
import { NotificationContext } from '@helpers/NotificationContext';
import { lightTheme, darkTheme } from '@helpers/ThemeHelper';
import '@locales/i18n';
import { APP_BASE_URL } from '@config';

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

createRoot(document.getElementById('root')).render(
    <AppContextProvider>
        <NotificationContext>
            <BrowserRouter basename={`${APP_BASE_URL}`}>
                <AppWithThemeWrapper />
            </BrowserRouter>
        </NotificationContext>
    </AppContextProvider>
);