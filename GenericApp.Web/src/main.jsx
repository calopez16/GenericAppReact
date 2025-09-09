import { StrictMode, useContext } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import '@styles/App.css';
import App from '@views/Index';
import { AppContextProvider, AppContext } from '@helpers/AppContext';
import { AlertProvider } from '@helpers/AlertContext';
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
    <StrictMode>
        <AppContextProvider>
            <AlertProvider>
                <BrowserRouter>
                    <AppWithThemeWrapper />
                </BrowserRouter>
            </AlertProvider>
        </AppContextProvider>
    </StrictMode>
);