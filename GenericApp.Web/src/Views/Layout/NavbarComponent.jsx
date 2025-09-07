import React, { useContext } from 'react';
import { useTranslation } from 'react-i18next'; // Importa el hook
import { Navbar, Container, Nav, Dropdown, Button } from 'react-bootstrap';
import { FaUserCircle, FaSignOutAlt, FaGlobe, FaBars, FaSun, FaMoon } from 'react-icons/fa';
import { AppContext } from '@helpers/AppContext';
import espanishFlag from '@images/lang/es-flag.png';
import englishFlag from '@images/lang/en-flag.png';

const NavbarComponent = ({ handleLogout, toggleSidebar }) => {
    const { t, i18n } = useTranslation(); // Usa el hook
    const { themeMode, setThemeMode } = useContext(AppContext);
    const userName = "Nombre de Usuario";

    const langFlags = {
        'es': espanishFlag,
        'en': englishFlag
    };

    const changeLanguage = (lng) => {
        i18n.changeLanguage(lng);
    };

    const toggleTheme = () => {
        setThemeMode(themeMode === 'light' ? 'dark' : 'light');
    };

    return (
        <Navbar bg="dark" variant="dark" className="p-3">
            <Container fluid>
                <Button variant="outline-light" onClick={toggleSidebar} className="d-lg-none me-2">
                    <FaBars />
                </Button>
                <Navbar.Brand href="#" className="d-none d-lg-block">
                    <img src="https://via.placeholder.com/40" alt="Logo" className="me-2 rounded" />
                    {t('mi_sistema')}
                </Navbar.Brand>

                <Nav className="ms-auto align-items-center">
                    <Button variant="outline-light" onClick={toggleTheme} className="me-3">
                        {themeMode === 'light' ? <FaMoon /> : <FaSun />}
                    </Button>
                    <Dropdown as={Nav.Item} className="me-3">
                        <Dropdown.Toggle as={Nav.Link} className="p-0 border-0">
                            <img
                                src={langFlags[i18n.language]}
                                alt="Current Language"
                                className="rounded-circle"
                                style={{ width: '30px', height: '30px', objectFit: 'cover' }}
                            />
                        </Dropdown.Toggle>
                        <Dropdown.Menu align="end">
                            <Dropdown.Item onClick={() => changeLanguage('es')}>
                                <img src={espanishFlag} alt="Español" className="me-2 rounded-circle" style={{ width: '20px', height: '20px' }} />
                                {t('espanol')}
                            </Dropdown.Item>
                            <Dropdown.Item onClick={() => changeLanguage('en')}>
                                <img src={englishFlag} alt="English" className="me-2 rounded-circle" style={{ width: '20px', height: '20px' }} />
                                {t('ingles')}
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
                        <span className="d-none d-md-inline">{t('cerrar_sesion')}</span>
                    </Button>
                </Nav>
            </Container>
        </Navbar>
    );
};

export default NavbarComponent;