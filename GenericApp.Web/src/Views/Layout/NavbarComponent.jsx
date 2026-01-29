import React from 'react';
import { useTranslation } from 'react-i18next';
import {
    AppBar,
    Toolbar,
    Button,
    Box,
    Container,
    Typography
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';

// Importa tu logo
import Logo from '@images/logo.png';

const NavbarComponent = () => {
    const { t } = useTranslation();

    const navLinks = [
        //{ title: 'Home', path: '/' },
        //{ title: 'About', path: '/about' },
        //{ title: 'Services', path: '/services' },
        //{ title: 'Contact', path: '/contact' }
    ];

    return (
        <AppBar
            position="static"
            elevation={0}
            sx={{
                backgroundColor: '#101828',
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
                            style={{
                                height: '40px',
                                width: 'auto',
                                marginRight: '12px'
                            }}
                        />
                        <Typography
                            variant="h6"
                            noWrap
                            sx={{
                                fontWeight: 700,
                                color: '#FCD462',
                                fontSize: '1.5rem',
                                letterSpacing: '.1rem',
                                // CAMBIO: Oculto en móviles (xs), visible en escritorio (md)
                                display: { xs: 'none', md: 'block' }
                            }}
                        >
                            Magnolia's
                        </Typography>
                    </Box>

                    {/* Links de Navegación (Escritorio) */}
                    <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 3 }}>
                        {navLinks.map((link) => (
                            <Button
                                key={link.title}
                                component={RouterLink}
                                to={link.path}
                                sx={{
                                    color: 'white',
                                    textTransform: 'none',
                                    fontSize: '1rem',
                                    '&:hover': { color: '#FCD462' }
                                }}
                            >
                                {link.title}
                            </Button>
                        ))}
                    </Box>

                    {/* Botones de Acción */}
                    <Box sx={{ display: 'flex', gap: 2 }}>
                        <Button
                            variant="outlined"
                            color="inherit"
                            sx={{
                                borderColor: '#FCD462',
                                color: '#FCD462',
                                borderRadius: '20px',
                                textTransform: 'none',
                                px: 3,
                                '&:hover': {
                                    borderColor: '#e0bd55',
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
                                '&:hover': { color: '#FCD462' }
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