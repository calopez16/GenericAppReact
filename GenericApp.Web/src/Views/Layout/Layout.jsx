import React, { useContext, useState, useEffect } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { AppContext } from '@helpers/AppContext';
import NavbarComponent from './NavbarComponent';
import SidebarComponent from './SidebarComponent';
import FooterComponent from './FooterComponent';

const Layout = () => {
    const { accessToken, themeMode } = useContext(AppContext);
    const [showSidebar, setShowSidebar] = useState(false);

    if (!accessToken) {
        return <Navigate to="/login" replace />;
    }

    const toggleSidebar = () => setShowSidebar(!showSidebar);

    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth >= 992) {
                setShowSidebar(false);
            }
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const handleLogout = () => {
        // Lógica para cerrar sesión
    };

    return (
        <div className={`d-flex flex-column min-vh-100 ${themeMode}`}>
            <NavbarComponent handleLogout={handleLogout} toggleSidebar={toggleSidebar} />
            <div className="d-flex flex-grow-1">
                <SidebarComponent showSidebar={showSidebar} toggleSidebar={toggleSidebar} />
                {showSidebar && <div className="overlay d-lg-none" onClick={toggleSidebar}></div>}
                <main className={`p-4 flex-grow-1 main-content ${showSidebar ? 'sidebar-open' : ''}`}>
                    <Outlet />
                </main>
            </div>
            <FooterComponent />
        </div>
    );
};

export default Layout;