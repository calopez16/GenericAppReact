import React, { useContext } from 'react';
import { useTranslation } from 'react-i18next';
import {
    AppBar,
    Toolbar,
    Button,
    Box,
    Container,
    Typography,
    IconButton,
    useTheme
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { AppContext } from '@helpers/AppContext';

// Íconos
import DarkModeIcon from '@mui/icons-material/Brightness4';
import LightModeIcon from '@mui/icons-material/Brightness7';
import Logo from '@images/logo.png';

const NavbarComponent = () => {
    const { t } = useTranslation();
    const { themeMode, setThemeMode } = useContext(AppContext);
    const theme = useTheme();

    const navLinks = [];

    return (
        <AppBar
            position="static"
            elevation={0}
            sx={{
                backgroundColor: 'primary.main',
                borderBottom: '1px solid rgba(255,255,255,0.05)'
            }}
        >
            <Container maxWidth="lg">
                <Toolbar disableGutters sx={{ justifyContent: 'space-between' }}>

                    {/* Logo + Nombre */}
                    <Box
                        component={RouterLink}
                        to="/"
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            mr: 2,
                            textDecoration: 'none'
                        }}
                    >
                        <img
                            src={Logo}
                            alt="Logo Empresa"
                            style={{ height: '40px', width: 'auto', marginRight: '12px' }}
                        />
                        <Typography
                            variant="h6"
                            noWrap
                            sx={{
                                fontWeight: 700,
                                color: 'secondary.main',
                                fontSize: '1.5rem',
                                letterSpacing: '.1rem',
                                display: { xs: 'none', md: 'block' }
                            }}
                        >
                            Magnolia's
                        </Typography>
                    </Box>

                    {/* Botones de Acción */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>

                        {/* BOTÓN TOGGLE THEME */}
                        {/*<IconButton*/}
                        {/*    onClick={() => setThemeMode(themeMode === 'light' ? 'dark' : 'light')}*/}
                        {/*    sx={{ color: 'secondary.main' }}*/}
                        {/*>*/}
                        {/*    {themeMode === 'dark' ? <LightModeIcon /> : <DarkModeIcon />}*/}
                        {/*</IconButton>*/}

                        <Button
                            variant="outlined"
                            component={RouterLink}
                            to="/login"
                            sx={{
                                borderColor: 'secondary.main',
                                color: 'secondary.main',
                                borderRadius: '20px',
                                textTransform: 'none',
                                px: 3,
                                '&:hover': {
                                    borderColor: 'secondary.dark',
                                    backgroundColor: 'rgba(252, 212, 98, 0.04)'
                                }
                            }}
                        >
                            Login
                        </Button>
                        <Button
                            variant="text"
                            sx={{
                                color: 'white',
                                textTransform: 'none',
                                '&:hover': { color: 'secondary.main' }
                            }}
                        >
                            Sign Up
                        </Button>
                    </Box>
                </Toolbar>
            </Container>
        </AppBar>
    );
};

export default NavbarComponent;