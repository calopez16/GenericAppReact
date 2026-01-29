import React from 'react';
import { Outlet } from 'react-router-dom';
import NavbarComponent from './NavbarComponent';
import FooterComponent from './FooterComponent';
import { Box, CssBaseline } from '@mui/material';

const Layout = () => {
    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            <CssBaseline />

            {/* Navbar superior fija o estática */}
            <NavbarComponent />

            {/* Contenido Principal sin márgenes de sidebar */}
            <Box
                component="main"
                sx={{
                    flexGrow: 1,
                    width: '100%',
                    p: 0, // Sin padding para permitir que el Hero toque los bordes
                    mt: 0
                }}
            >
                <Outlet />
            </Box>

            {/*<FooterComponent />*/}
        </Box>
    );
};

export default Layout;