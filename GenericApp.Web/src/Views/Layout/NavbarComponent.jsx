import React, { useContext, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { AppContext } from '@helpers/AppContext';
import { API_BASE_URL } from '@config';

// Componente del Modal
import CompanySelectionModal from './CompanySelectionModal';

// MUI Imports
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Avatar from '@mui/material/Avatar';
import Tooltip from '@mui/material/Tooltip';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';

// MUI Icons
import MenuIcon from '@mui/icons-material/Menu';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import AccountCircle from '@mui/icons-material/AccountCircle';
import LogoutIcon from '@mui/icons-material/Logout';
import BusinessIcon from '@mui/icons-material/Business';


const NavbarComponent = ({ handleLogout, toggleSidebar }) => {
    const { t } = useTranslation();
    const { themeMode, setThemeMode, userName = 'Usuario', companySelected, setCompanySelected, canSelectCompany } = useContext(AppContext);

    const [isCompanyModalOpen, setIsCompanyModalOpen] = useState(false);

    // Variable derivada para saber si NO hay compañía seleccionada
    const isNoCompany = !companySelected || (typeof companySelected === 'object' && Object.keys(companySelected).length === 0);
    // --- EFECTO: ABRIR SI NO HAY COMPAÑÍA ---
    useEffect(() => {
        if (isNoCompany && canSelectCompany) {
            setIsCompanyModalOpen(true);
        }
    }, [isNoCompany]);

    // --- HANDLERS ---
    const handleOpenCompanyModal = () => {
        setIsCompanyModalOpen(true);
    };

    const handleCloseCompanyModal = () => {
        // Solo permitimos cerrar si YA hay una compañía seleccionada
        // (Aunque el modal bloqueará la UI, esta es una seguridad extra)
        if (!isNoCompany) {
            setIsCompanyModalOpen(false);
        }
    };

    const handleSelectCompany = (companyFullData) => {
        const streamlinedCompany = {
            idCompany: companyFullData.idCompany,
            name: companyFullData.name,
            logoName: companyFullData.logoName
        };

        setCompanySelected(streamlinedCompany);

        setIsCompanyModalOpen(false);
    };

    const toggleTheme = () => {
        setThemeMode(themeMode === 'light' ? 'dark' : 'light');
    };

    // User Menu States...
    const [userAnchorEl, setUserAnchorEl] = useState(null);
    const userMenuOpen = Boolean(userAnchorEl);
    const handleUserMenuClick = (event) => setUserAnchorEl(event.currentTarget);
    const handleUserMenuClose = () => setUserAnchorEl(null);

    return (
        <>
            <AppBar position="static" color="primary">
                <Toolbar sx={{ justifyContent: 'space-between' }}>
                    <IconButton
                        color="inherit"
                        aria-label="open drawer"
                        onClick={toggleSidebar}
                        sx={{ mr: 2, display: { md: 'none' } }}
                    >
                        <MenuIcon />
                    </IconButton>

                    <Box sx={{ flexGrow: 1 }} />

                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        {canSelectCompany && (
                            <Tooltip title={companySelected ? companySelected.name : t('selectCompany')}>
                                <IconButton onClick={handleOpenCompanyModal} sx={{ mr: 1 }} color="inherit">
                                    <Avatar
                                        src={API_BASE_URL + "/img/logos/" + companySelected?.logoName}
                                        alt={companySelected?.name}
                                        sx={{ width: 30, height: 30 }}
                                    >
                                        <BusinessIcon fontSize="small" />
                                    </Avatar>
                                </IconButton>
                            </Tooltip>
                        )}

                        <Tooltip title={themeMode === 'light' ? t('select_theme_dark') : t('select_theme_light')}>
                            <IconButton color="inherit" onClick={toggleTheme} sx={{ mr: 1 }}>
                                {themeMode === 'light' ? <Brightness4Icon /> : <Brightness7Icon />}
                            </IconButton>
                        </Tooltip>

                        <Box sx={{ height: 28, borderLeft: 1, borderColor: 'divider', mx: 2, display: { xs: 'none', md: 'block' } }} />

                        {/* Menú Usuario Desktop */}
                        <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center' }}>
                            <AccountCircle sx={{ mr: 1, fontSize: 30 }} />
                            <Typography variant="body1" sx={{ mr: 2 }}>{userName}</Typography>
                            <Box sx={{ height: 28, borderLeft: 1, borderColor: 'divider', mx: 2 }} />
                            <Tooltip title={t('logout')}>
                                <IconButton color="inherit" onClick={handleLogout}><LogoutIcon /></IconButton>
                            </Tooltip>
                        </Box>

                        {/* Menú Usuario Mobile (Simplificado para el ejemplo) */}
                        <Box sx={{ display: { xs: 'flex', md: 'none' } }}>
                            <IconButton color="inherit" onClick={handleUserMenuClick}>
                                <AccountCircle sx={{ fontSize: 30 }} />
                            </IconButton>
                            <Menu anchorEl={userAnchorEl} open={userMenuOpen} onClose={handleUserMenuClose}>
                                <MenuItem disabled><Typography variant="inherit" noWrap>{userName}</Typography></MenuItem>
                                <MenuItem onClick={handleLogout}><LogoutIcon sx={{ mr: 1 }} />{t('logout')}</MenuItem>
                            </Menu>
                        </Box>
                    </Box>
                </Toolbar>
            </AppBar>

            {/* --- PASAMOS LA PROP forceSelection --- */}
            <CompanySelectionModal
                open={isCompanyModalOpen}
                onClose={handleCloseCompanyModal}
                onSelectCompany={handleSelectCompany}
                selectedCompanyId={companySelected?.idCompany}
                forceSelection={isNoCompany} // <--- NUEVA PROP: True si no hay compañia
            />
        </>
    );
};

export default NavbarComponent;