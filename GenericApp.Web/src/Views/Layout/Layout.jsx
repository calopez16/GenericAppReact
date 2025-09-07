import {React ,useContext } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { AppContext } from '@helpers/AppContext';

const Layout = ({ children }) => {
    const { userName, setUserName, accessToken } = useContext(AppContext);
    if (!accessToken) {
        // Si no hay token, redirige a la página de login
        return <Navigate to="/login" replace />;
    }

    // Si el usuario está autenticado, renderiza el Outlet.
    // Aquí también podrías poner un layout común (Navbar, Sidebar, etc.)
    return (
        <div>
            {/* <Navbar /> */}
            <main>
                <Outlet />
            </main>
            {/* <Footer /> */}
        </div>
    );
};

export default Layout;