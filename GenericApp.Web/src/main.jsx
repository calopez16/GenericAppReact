import { StrictMode, useContext } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import '@styles/App.css';
import App from '@views/Index';
import { AppContextProvider, AppContext } from '@helpers/AppContext';
import { NotificationContext } from '@helpers/NotificationContext';
import { lightTheme, darkTheme } from '@helpers/ThemeHelper';
import '@locales/i18n';

const AppWithThemeWrapper = () => {
    const { themeMode } = useContext(AppContext);
    const theme = themeMode === 'light' ? lightTheme : darkTheme;

    return (
        <ThemeProvider theme={theme}>
            <App />
        </ThemeProvider>
    );
};

createRoot(document.getElementById('root')).render(
    <AppContextProvider>
        <NotificationContext>
            <BrowserRouter>
                <AppWithThemeWrapper />
            </BrowserRouter>
        </NotificationContext>
    </AppContextProvider>
);