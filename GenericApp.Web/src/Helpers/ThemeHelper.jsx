import { createTheme } from '@mui/material/styles';

// Define el tema claro
export const lightTheme = createTheme({
    palette: {
        mode: 'light',
        background: {
            default: '#fdfbf7', // Un tono "hueso/arena" muy suave, más natural que el blanco
            paper: '#ffffff',
        },
        text: {
            primary: '#1a2e1a',   // Verde muy oscuro, casi negro, para el texto
            secondary: '#5c635c',
        },
        primary: {
            main: '#2d5a27',      // Verde Espárrago (Fuerte y orgánico)
            light: '#568351',
            dark: '#1b3a18',
            contrastText: '#ffffff',
        },
        secondary: {
            main: '#a67c52',      // Color tierra/madera para acentos
        },
        divider: '#e8e2d9',
    },
    components: {
        MuiCard: {
            styleOverrides: {
                root: {
                    backgroundColor: '#ffffff',
                    color: '#1a2e1a',
                    borderRadius: 12,
                    border: '1px solid #e8e2d9', // Borde sutil color arena
                    boxShadow: '0px 4px 12px rgba(27, 58, 24, 0.04)', // Sombra con tinte verde
                },
            },
        },
        MuiButton: {
            styleOverrides: {
                root: {
                    borderRadius: 20, // Bordes más redondeados (más orgánico)
                    textTransform: 'none',
                    fontWeight: 600,
                },
            },
        },
        MuiAppBar: {
            styleOverrides: {
                root: {
                    backgroundColor: '#2d5a27', // El encabezado llevará el verde fuerte
                },
            },
        },
    },
});// Define el tema oscuro
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