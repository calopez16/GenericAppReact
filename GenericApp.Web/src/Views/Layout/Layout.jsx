import React, { useContext, useState, useEffect } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { AppContext } from '@helpers/AppContext';
import NavbarComponent from './NavbarComponent';
import SidebarComponent from './SidebarComponent';
import FooterComponent from './FooterComponent';
import { AuthHelper } from '@helpers/AuthHelper';
import LoaderComponent from '@views/Layout/LoaderComponent';

import { Box, CssBaseline, useMediaQuery, useTheme } from '@mui/material';

const Layout = () => {
const { accessToken, loading } = useContext(AppContext);
const [showSidebar, setShowSidebar] = useState(false);
const theme = useTheme();
const isMobile = useMediaQuery(theme.breakpoints.down('md'));

    if (!accessToken) {
        return <Navigate to="/login" replace />;
    }

    const toggleSidebar = () => setShowSidebar(!showSidebar);

    useEffect(() => {
        const handleResize = () => {
            if (!isMobile) {
                setShowSidebar(false);
            }
        };

        window.addEventListener('resize', handleResize);
        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, [isMobile]);

    const handleLogout = () => {
        AuthHelper.logout();
    };

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            <CssBaseline />
            {loading ? (
                <LoaderComponent />
            ) : (
                <>
                    <NavbarComponent handleLogout={handleLogout} toggleSidebar={toggleSidebar} />
                    <Box sx={{ display: 'flex', flexGrow: 1 }}>
                        <SidebarComponent
                            showSidebar={showSidebar}
                            toggleSidebar={toggleSidebar}
                            isMobile={isMobile}
                        />
                        {showSidebar && isMobile && (
                            <Box
                                onClick={toggleSidebar}
                                sx={{
                                    position: 'fixed',
                                    top: 0,
                                    left: 0,
                                    width: '100%',
                                    height: '100%',
                                    backgroundColor: 'rgba(0, 0, 0, 0.5)',
                                    zIndex: theme.zIndex.drawer - 1,
                                    display: 'block',
                                }}
                            />
                        )}
                        <Box
                            component="main"
                            sx={{
                                flexGrow: 1,
                                minWidth: 0,
                                p: { xs: 1, sm: 2, md: 3 },
                                overflow: 'hidden',
                            }}
                        >
                            <Outlet />
                        </Box>
                    </Box>
                    <FooterComponent />
                </>
            )}
        </Box>
    );
};

export default Layout;