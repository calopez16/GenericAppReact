import {React ,useContext } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { AppContext } from '@helpers/AppContext';

const Layout = ({ children }) => {
    const { userName, setUserName, accessToken } = useContext(AppContext);
    if (!accessToken) {
        // Si no hay token, redirige a la p�gina de login
        return <Navigate to="/login" replace />;
    }

    // Si el usuario est� autenticado, renderiza el Outlet.
    // Aqu� tambi�n podr�as poner un layout com�n (Navbar, Sidebar, etc.)
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