import React, { useState, useContext } from 'react';
import { Nav, Button, Collapse } from 'react-bootstrap';
import { FaTachometerAlt, FaUsers, FaCog, FaChartLine, FaTimes, FaChevronDown, FaChevronUp } from 'react-icons/fa';
import { AppContext } from '@helpers/AppContext';

const SidebarComponent = ({ showSidebar, toggleSidebar }) => {
    const { themeMode } = useContext(AppContext);
    const [openSubmenu, setOpenSubmenu] = useState(null);

    const toggleSubmenu = (submenuName) => {
        setOpenSubmenu(openSubmenu === submenuName ? null : submenuName);
    };

    const linkClass = themeMode === 'light' ? 'text-dark' : 'text-light';

    return (
        <div className={`sidebar shadow-sm p-3 ${showSidebar ? 'show' : ''} ${themeMode === 'light' ? 'bg-light' : 'bg-secondary'}`}>
            <div className="d-flex justify-content-between align-items-center sidebar-header mb-4">
                {/* Logo y nombre del sistema en el Sidebar (visible solo en pantallas pequeñas) */}
                <div className="d-flex align-items-center d-lg-none">
                    <img src="https://via.placeholder.com/40" alt="Logo" className="me-2 rounded" />
                    <h4 className={`m-0 ${linkClass}`}>Sistema</h4>
                </div>

                {/* Botón para cerrar el menú lateral */}
                <Button variant="outline-light" onClick={toggleSidebar} className="d-lg-none">
                    <FaTimes className={linkClass} />
                </Button>
            </div>
            <Nav className="flex-column">
                {/* Opciones del menú */}
                <Nav.Link href="#dashboard" className={`${linkClass} sidebar-link`}>
                    <FaTachometerAlt className="me-2" /> Dashboard
                </Nav.Link>
                <Nav.Item>
                    <Nav.Link
                        onClick={() => toggleSubmenu('users')}
                        aria-controls="users-submenu"
                        aria-expanded={openSubmenu === 'users'}
                        className={`${linkClass} sidebar-link d-flex justify-content-between align-items-center`}
                    >
                        <div>
                            <FaUsers className="me-2" /> Usuarios
                        </div>
                        <span>
                            {openSubmenu === 'users' ? <FaChevronUp /> : <FaChevronDown />}
                        </span>
                    </Nav.Link>
                    <Collapse in={openSubmenu === 'users'}>
                        <div id="users-submenu">
                            <Nav className="flex-column ps-4">
                                <Nav.Link href="#users/list" className={`${linkClass} sidebar-link`}>Ver todos</Nav.Link>
                                <Nav.Link href="#users/add" className={`${linkClass} sidebar-link`}>Añadir usuario</Nav.Link>
                            </Nav>
                        </div>
                    </Collapse>
                </Nav.Item>
                <Nav.Link href="#reports" className={`${linkClass} sidebar-link`}>
                    <FaChartLine className="me-2" /> Reportes
                </Nav.Link>
                <Nav.Link href="#settings" className={`${linkClass} sidebar-link`}>
                    <FaCog className="me-2" /> Configuración
                </Nav.Link>
            </Nav>
        </div>
    );
};

export default SidebarComponent;