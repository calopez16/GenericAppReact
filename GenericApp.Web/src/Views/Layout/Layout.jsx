import React, { useContext, useState, useEffect } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { AppContext } from '@helpers/AppContext';
import NavbarComponent from './NavbarComponent';
import SidebarComponent from './SidebarComponent';
import FooterComponent from './FooterComponent';
import { AuthHelper } from '@helpers/AuthHelper'; 
import LoaderComponent from '@views/Layout/LoaderComponent'; // Asegúrate de tener la ruta correcta

const Layout = () => {
  const { accessToken, themeMode, loading, setLoading } = useContext(AppContext);
    const [showSidebar, setShowSidebar] = useState(false);

    if (!accessToken) {
        return <Navigate to="/login" replace />;
    }

    const toggleSidebar = () => setShowSidebar(!showSidebar);

    // Lógica para la carga inicial de la página
    useEffect(() => {
        setLoading(true); // Activa el loader al inicio de la carga del Layout
        const timer = setTimeout(() => {
            setLoading(false); // Desactiva el loader después de un tiempo
        }, 1500);

        const handleResize = () => {
            if (window.innerWidth >= 992) {
                setShowSidebar(false);
            }
        };
        window.addEventListener('resize', handleResize);

        return () => {
            clearTimeout(timer);
            window.removeEventListener('resize', handleResize);
        };
    }, [setLoading]);

    const handleLogout = () => {
        AuthHelper.logout();
    };

    return (
        <div className={`d-flex flex-column min-vh-100 ${themeMode}`}>
            {loading ? (
                <LoaderComponent />
            ) : (
                <>
                    <NavbarComponent handleLogout={handleLogout} toggleSidebar={toggleSidebar} />
                    <div className="d-flex flex-grow-1">
                        <SidebarComponent showSidebar={showSidebar} toggleSidebar={toggleSidebar} />
                        {showSidebar && <div className="overlay d-lg-none" onClick={toggleSidebar}></div>}
                        <main className={`p-4 flex-grow-1 main-content ${showSidebar ? 'sidebar-open' : ''}`}>
                            <Outlet />
                        </main>
                    </div>
                    <FooterComponent />
                </>
            )}
        </div>
    );
};

export default Layout;