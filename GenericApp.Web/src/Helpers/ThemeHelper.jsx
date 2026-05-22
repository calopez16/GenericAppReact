import { createTheme } from '@mui/material/styles';

// Define el tema claro
export const lightTheme = createTheme({
    palette: {
        mode: 'light',
        background: {
            default: '#f0f2f5', // Gris neutro corporativo
            paper: '#ffffff',
        },
        text: {
            primary: '#212121',   // Casi negro, máxima legibilidad
            secondary: '#616161',
        },
        primary: {
            main: '#37474f',      // Gris azulado oscuro (pizarra) — neutro y elegante
            light: '#62727b',
            dark: '#102027',
            contrastText: '#ffffff',
        },
        secondary: {
            main: '#b71c1c',      // Rojo vino — acento de autoridad y firma
        },
        divider: '#e0e0e0',
    },
    components: {
        MuiCard: {
            styleOverrides: {
                root: {
                    backgroundColor: '#ffffff',
                    color: '#212121',
                    borderRadius: 4,
                    border: '1px solid #e0e0e0',
                    boxShadow: '0px 1px 4px rgba(0, 0, 0, 0.10)',
                },
            },
        },
        MuiButton: {
            styleOverrides: {
                root: {
                    borderRadius: 4,
                    textTransform: 'none',
                    fontWeight: 600,
                },
            },
        },
        MuiAppBar: {
            styleOverrides: {
                root: {
                    backgroundColor: '#37474f',
                },
            },
        },
    },
});
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
            main: '#0d6efd',
            light: '#3d8bfd',
            dark: '#0a58ca',
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