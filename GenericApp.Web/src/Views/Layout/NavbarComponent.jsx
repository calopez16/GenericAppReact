import React, { useState,useContext } from 'react';
import { Navbar, Container, Nav, Dropdown, Button } from 'react-bootstrap';
import { FaUserCircle, FaSignOutAlt, FaGlobe, FaBars, FaSun, FaMoon } from 'react-icons/fa';
import { AppContext } from '@helpers/AppContext';

// Importa las imágenes de las banderas
import spanishFlag from '@images/lang/es-flag.png';
import englishFlag from '@images/lang/en-flag.png';
import frenchFlag from '@images/lang/fr-flag.png';

const NavbarComponent = ({ handleLogout, toggleSidebar, changeLanguage }) => {
    const userName = "Nombre de Usuario"; // Reemplaza con el nombre de usuario real
    const [currentLanguage, setCurrentLanguage] = useState('es'); // Estado para el idioma actual
    const { themeMode, setThemeMode } = useContext(AppContext);

    // Mapeo de idiomas a imágenes
    const langFlags = {
        'es': spanishFlag,
        'en': englishFlag,
        'fr': frenchFlag,
    };

    const handleLanguageChange = (lang) => {
        setCurrentLanguage(lang);
        if (changeLanguage) {
            changeLanguage(lang);
        }
    };

    const toggleTheme = () => {
        setThemeMode(themeMode === 'light' ? 'dark' : 'light');
    };

    return (
        <Navbar bg="dark" variant="dark" className="p-3">
            <Container fluid>
                {/* Botón para alternar el menú lateral (visible solo en pantallas pequeñas) */}
                <Button variant="outline-light" onClick={toggleSidebar} className="d-lg-none me-2">
                    <FaBars />
                </Button>

                {/* Logo y nombre en el Navbar (visible solo en pantallas grandes) */}
                <Navbar.Brand href="#" className="d-none d-lg-block">
                    <img src="https://via.placeholder.com/40" alt="Logo" className="me-2 rounded" />
                    Mi Sistema
                </Navbar.Brand>

                <Nav className="ms-auto align-items-center">
                    <Button variant="outline-light" onClick={toggleTheme} className="me-3">
                        {themeMode === 'light' ? <FaMoon /> : <FaSun />}
                    </Button>
                    <Dropdown as={Nav.Item} className="me-3">
                        <Dropdown.Toggle as={Nav.Link} className="p-0 border-0">
                            <img
                                src={langFlags[currentLanguage]}
                                alt="Current Language"
                                className="rounded-circle"
                                style={{ width: '30px', height: '30px', objectFit: 'cover' }}
                            />
                        </Dropdown.Toggle>
                        <Dropdown.Menu align="end">
                            <Dropdown.Item onClick={() => handleLanguageChange('es')}>
                                <img src={spanishFlag} alt="Español" className="me-2 rounded-circle" style={{ width: '20px', height: '20px' }} />
                                Español
                            </Dropdown.Item>
                            <Dropdown.Item onClick={() => handleLanguageChange('en')}>
                                <img src={englishFlag} alt="English" className="me-2 rounded-circle" style={{ width: '20px', height: '20px' }} />
                                English
                            </Dropdown.Item>
                        </Dropdown.Menu>
                    </Dropdown>
                    <div className="vr me-3 d-none d-md-block text-light"></div>
                    <div className="d-flex align-items-center text-light me-3">
                        <FaUserCircle size={30} className="me-2" />
                        <span className="d-none d-md-inline">{userName}</span>
                    </div>
                    <Button variant="danger" onClick={handleLogout}>
                        <FaSignOutAlt className="me-1" />
                        <span className="d-none d-md-inline">Cerrar Sesión</span>
                    </Button>
                </Nav>
            </Container>
        </Navbar>
    );
};

export default NavbarComponent;