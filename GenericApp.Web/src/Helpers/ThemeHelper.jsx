import { createTheme } from '@mui/material/styles';

// Colores Core de Magnolia's
const BRAND_DARK = '#101828';
const BRAND_GOLD = '#FCD462';
const BRAND_GOLD_HOVER = '#e0bd55';

export const lightTheme = createTheme({
    palette: {
        mode: 'light',
        background: {
            default: '#fdfbf7',
            paper: '#ffffff',
        },
        text: {
            primary: BRAND_DARK,
            secondary: '#475467',
        },
        primary: {
            main: BRAND_DARK,
            light: '#1d2939',
            dark: '#0b1220',
            contrastText: '#ffffff',
        },
        secondary: {
            main: BRAND_GOLD,
            contrastText: BRAND_DARK,
        },
        divider: '#e8e2d9',
    },
    components: {
        MuiCard: {
            styleOverrides: {
                root: {
                    borderRadius: 16,
                    border: '1px solid #eaecf0',
                    boxShadow: '0px 4px 20px rgba(16, 24, 40, 0.08)',
                },
            },
        },
        MuiButton: {
            styleOverrides: {
                root: {
                    borderRadius: 8,
                    textTransform: 'none',
                    fontWeight: 600,
                    padding: '8px 20px',
                },
                containedPrimary: {
                    backgroundColor: BRAND_DARK,
                    '&:hover': {
                        backgroundColor: '#1d2939',
                    },
                },
                containedSecondary: {
                    backgroundColor: BRAND_GOLD,
                    color: BRAND_DARK,
                    '&:hover': {
                        backgroundColor: BRAND_GOLD_HOVER,
                    },
                },
            },
        },
        MuiAppBar: {
            styleOverrides: {
                root: {
                    backgroundColor: BRAND_DARK,
                },
            },
        },
        MuiTextField: {
            styleOverrides: {
                root: {
                    '& .MuiOutlinedInput-root': {
                        borderRadius: 8,
                    },
                },
            },
        },
    },
});

export const darkTheme = createTheme({
    palette: {
        mode: 'dark',
        background: {
            default: '#0b1220',
            paper: BRAND_DARK,
        },
        text: {
            primary: '#ffffff',
            secondary: '#98a2b3',
        },
        primary: {
            main: BRAND_GOLD,
            contrastText: BRAND_DARK,
        },
        secondary: {
            main: '#ffffff',
        },
    },
    components: {
        MuiCard: {
            styleOverrides: {
                root: {
                    backgroundColor: BRAND_DARK,
                    backgroundImage: 'none',
                    borderRadius: 16,
                    border: '1px solid #1f2937',
                },
            },
        },
        MuiButton: {
            styleOverrides: {
                root: {
                    borderRadius: 8,
                    textTransform: 'none',
                    fontWeight: 600,
                },
            },
        },
    },
});