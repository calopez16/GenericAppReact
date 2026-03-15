import { createTheme } from '@mui/material/styles';

export const lightTheme = createTheme({
    palette: {
        mode: 'light',
        background: {
            default: '#f0f6fb',
            paper: '#ffffff',
        },
        text: {
            primary: '#0d2137',
            secondary: '#4a6080',
        },
        primary: {
            main: '#1565c0',
            light: '#5e92f3',
            dark: '#003c8f',
            contrastText: '#ffffff',
        },
        secondary: {
            main: '#00acc1',
        },
        divider: '#d0e4f5',
    },
    components: {
        MuiCard: {
            styleOverrides: {
                root: {
                    backgroundColor: '#ffffff',
                    color: '#0d2137',
                    borderRadius: 12,
                    border: '1px solid #d0e4f5',
                    boxShadow: '0px 4px 12px rgba(21, 101, 192, 0.08)',
                },
            },
        },
        MuiButton: {
            styleOverrides: {
                root: {
                    borderRadius: 20,
                    textTransform: 'none',
                    fontWeight: 600,
                },
            },
        },
        MuiAppBar: {
            styleOverrides: {
                root: {
                    backgroundColor: '#1565c0',
                },
            },
        },
    },
});
export const darkTheme = createTheme({
    palette: {
        mode: 'dark',
        background: {
            default: '#0d1b2a',
            paper: '#132338',
        },
        text: {
            primary: '#e8f1fa',
            secondary: '#90afc8',
        },
        primary: {
            main: '#5e92f3',
            light: '#90bbff',
            dark: '#1565c0',
        },
        secondary: {
            main: '#26c6da',
        },
        divider: '#1e3a5f',
    },
    components: {
        MuiCard: {
            styleOverrides: {
                root: {
                    backgroundColor: '#132338',
                    color: '#e8f1fa',
                    borderRadius: 12,
                    border: '1px solid #1e3a5f',
                    boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.4)',
                },
            },
        },
        MuiButton: {
            styleOverrides: {
                root: {
                    borderRadius: 20,
                    textTransform: 'none',
                    fontWeight: 600,
                },
            },
        },
        MuiAppBar: {
            styleOverrides: {
                root: {
                    backgroundColor: '#0d1b2a',
                },
            },
        },
    },
});