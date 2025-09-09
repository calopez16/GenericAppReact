import { createTheme } from '@mui/material/styles';

// Define el tema claro
export const lightTheme = createTheme({
    palette: {
        mode: 'light',
        background: {
            default: '#f8f9fa',
            paper: '#ffffff',
        },
        text: {
            primary: '#212529',
            secondary: '#495057',
        },
        primary: {
            main: '#0d6efd',
        },
        secondary: {
            main: '#6c757d',
        },
    },
    // Define overrides para componentes específicos (ej. Card, Button)
    components: {
        MuiCard: {
            styleOverrides: {
                root: {
                    backgroundColor: '#ffffff',
                    color: '#212529',
                },
            },
        },
    },
});

// Define el tema oscuro
export const darkTheme = createTheme({
    palette: {
        mode: 'dark',
        background: {
            default: '#212529',
            paper: '#343a40',
        },
        text: {
            primary: '#f8f9fa',
            secondary: '#ced4da',
        },
        primary: {
            main: '#0d6efd', // Puedes cambiarlo si quieres
        },
        secondary: {
            main: '#6c757d', // Puedes cambiarlo si quieres
        },
    },
    // Define overrides para componentes específicos (ej. Card, Button)
    components: {
        MuiCard: {
            styleOverrides: {
                root: {
                    backgroundColor: '#343a40',
                    color: '#f8f9fa',
                    borderColor: '#495057',
                },
            },
        },
    },
});