import React, { useContext, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { AppContext } from '@helpers/AppContext';
import { API_BASE_URL } from '@config';

// Importaciones de imágenes para banderas
import espanishFlag from '@images/lang/es-flag.png';
import englishFlag from '@images/lang/en-flag.png';

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
import Divider from '@mui/material/Divider';
import ListSubheader from '@mui/material/ListSubheader';

// MUI Icons
import MenuIcon from '@mui/icons-material/Menu';
import AccountCircle from '@mui/icons-material/AccountCircle';
import LogoutIcon from '@mui/icons-material/Logout';
import BusinessIcon from '@mui/icons-material/Business';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import CheckIcon from '@mui/icons-material/Check';
import WbSunnyIcon from '@mui/icons-material/WbSunny';
import DarkModeIcon from '@mui/icons-material/DarkMode';


const NavbarComponent = ({ handleLogout, toggleSidebar }) => {
    const { t, i18n } = useTranslation();
    const { themeMode, setThemeMode, userName = 'Usuario', userRoles, companySelected, setCompanySelected, canSelectCompany } = useContext(AppContext);

    const [isCompanyModalOpen, setIsCompanyModalOpen] = useState(false);

    const langFlags = {
        'es': espanishFlag,
        'en': englishFlag
    };

    const changeLanguage = (lng) => {
        i18n.changeLanguage(lng);
    };

    const isNoCompany = !companySelected || (typeof companySelected === 'object' && Object.keys(companySelected).length === 0);

    useEffect(() => {
        if (isNoCompany && canSelectCompany) {
            setIsCompanyModalOpen(true);
        }
    }, [isNoCompany]);

    const handleOpenCompanyModal = () => {
        setIsCompanyModalOpen(true);
    };

    const handleCloseCompanyModal = () => {
        if (!isNoCompany) {
            setIsCompanyModalOpen(false);
        }
    };

    const handleSelectCompany = (companyFullData) => {
        setCompanySelected(companyFullData);
        setIsCompanyModalOpen(false);
    };

    const toggleTheme = () => {
        setThemeMode(themeMode === 'light' ? 'dark' : 'light');
    };

    const [userAnchorEl, setUserAnchorEl] = useState(null);
    const userMenuOpen = Boolean(userAnchorEl);
    const handleUserMenuClick = (event) => setUserAnchorEl(event.currentTarget);
    const handleUserMenuClose = () => setUserAnchorEl(null);

    const UserMenu = (
        <Menu
            anchorEl={userAnchorEl}
            open={userMenuOpen}
            onClose={handleUserMenuClose}
            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
            PaperProps={{ sx: { minWidth: 300, '& .MuiList-root': { pt: 0 } } }}
        >
            <Box
                sx={(theme) => ({
                    background: `linear-gradient(135deg, ${theme.palette.secondary.main} 0%, ${theme.palette.secondary.light ?? theme.palette.secondary.main} 100%)`,
                    px: 2.5,
                    pt: 2.5,
                    pb: 2.5,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2,
                    position: 'relative',
                })}
            >
                <Avatar
                    sx={{
                        width: 64,
                        height: 64,
                        fontSize: 30,
                        fontWeight: 700,
                        bgcolor: 'rgba(255,255,255,0.25)',
                        color: '#fff',
                        border: '2px solid rgba(255,255,255,0.6)',
                    }}
                >
                    {userName ? userName.charAt(0).toUpperCase() : <AccountCircle />}
                </Avatar>
                <Box sx={{ overflow: 'hidden' }}>
                    <Typography variant="h6" noWrap sx={{ fontWeight: 700, color: '#fff', lineHeight: 1.2 }}>
                        {userName}
                    </Typography>
                    {userRoles && (
                        <Typography variant="body2" noWrap sx={{ color: 'rgba(255,255,255,0.85)', display: 'block', mt: 0.3 }}>
                            {userRoles.split(',')[0].trim()}
                        </Typography>
                    )}
                </Box>
            </Box>
            <Divider />
            <ListSubheader sx={{ lineHeight: '32px', bgcolor: 'transparent' }}>
                {t('select_language')}
            </ListSubheader>
            <MenuItem
                onClick={() => { changeLanguage('es'); handleUserMenuClose(); }}
                sx={{
                    py: 1.2, gap: 1.5,
                    backgroundColor: i18n.language === 'es' ? 'primary.main' : 'transparent',
                    color: i18n.language === 'es' ? '#fff' : 'inherit',
                    '&:hover': { backgroundColor: i18n.language === 'es' ? 'primary.dark' : 'action.hover' },
                    '&.Mui-selected': { backgroundColor: 'primary.main' },
                    '&.Mui-selected:hover': { backgroundColor: 'primary.dark' },
                }}
            >
                <Avatar src={espanishFlag} sx={{ width: 26, height: 26 }} />
                <Typography variant="body2" sx={{ flexGrow: 1, fontWeight: i18n.language === 'es' ? 700 : 400 }}>{t('language_spanish')}</Typography>
                {i18n.language === 'es' && <CheckIcon fontSize="small" sx={{ color: '#fff' }} />}
            </MenuItem>
            <MenuItem
                onClick={() => { changeLanguage('en'); handleUserMenuClose(); }}
                sx={{
                    py: 1.2, gap: 1.5,
                    backgroundColor: i18n.language === 'en' ? 'primary.main' : 'transparent',
                    color: i18n.language === 'en' ? '#fff' : 'inherit',
                    '&:hover': { backgroundColor: i18n.language === 'en' ? 'primary.dark' : 'action.hover' },
                    '&.Mui-selected': { backgroundColor: 'primary.main' },
                    '&.Mui-selected:hover': { backgroundColor: 'primary.dark' },
                }}
            >
                <Avatar src={englishFlag} sx={{ width: 26, height: 26 }} />
                <Typography variant="body2" sx={{ flexGrow: 1, fontWeight: i18n.language === 'en' ? 700 : 400 }}>{t('language_english')}</Typography>
                {i18n.language === 'en' && <CheckIcon fontSize="small" sx={{ color: '#fff' }} />}
            </MenuItem>
            <Divider />
            <ListSubheader sx={{ lineHeight: '32px', bgcolor: 'transparent' }}>
                {t('configuration')}
            </ListSubheader>
            <Box sx={{ display: 'flex', gap: 1, px: 1.5, pb: 1.5 }}>
                <Box
                    onClick={() => { setThemeMode('light'); handleUserMenuClose(); }}
                    sx={{
                        flex: 1,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: 0.5,
                        py: 1.2,
                        borderRadius: 2,
                        cursor: 'pointer',
                        border: '2px solid',
                        borderColor: themeMode === 'light' ? 'primary.main' : 'divider',
                        bgcolor: themeMode === 'light' ? 'primary.main' : 'transparent',
                        color: themeMode === 'light' ? '#fff' : 'text.secondary',
                        transition: 'all 0.2s',
                        '&:hover': {
                            borderColor: 'primary.main',
                            bgcolor: themeMode === 'light' ? 'primary.dark' : 'action.hover',
                        },
                    }}
                >
                    <WbSunnyIcon fontSize="small" />
                    <Typography variant="caption" sx={{ fontWeight: themeMode === 'light' ? 700 : 400 }}>
                        {t('select_theme_light')}
                    </Typography>
                </Box>
                <Box
                    onClick={() => { setThemeMode('dark'); handleUserMenuClose(); }}
                    sx={{
                        flex: 1,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: 0.5,
                        py: 1.2,
                        borderRadius: 2,
                        cursor: 'pointer',
                        border: '2px solid',
                        borderColor: themeMode === 'dark' ? 'primary.main' : 'divider',
                        bgcolor: themeMode === 'dark' ? 'primary.main' : 'transparent',
                        color: themeMode === 'dark' ? '#fff' : 'text.secondary',
                        transition: 'all 0.2s',
                        '&:hover': {
                            borderColor: 'primary.main',
                            bgcolor: themeMode === 'dark' ? 'primary.dark' : 'action.hover',
                        },
                    }}
                >
                    <DarkModeIcon fontSize="small" />
                    <Typography variant="caption" sx={{ fontWeight: themeMode === 'dark' ? 700 : 400 }}>
                        {t('select_theme_dark')}
                    </Typography>
                </Box>
            </Box>
            <Divider />
            <MenuItem onClick={() => { handleUserMenuClose(); handleLogout(); }} sx={{ mt: 1 }} >
                <LogoutIcon sx={{ mr: 1 }} />
                {t('logout')}
            </MenuItem>
        </Menu>
    );

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
                            <>
                                <Tooltip title={companySelected ? companySelected.name : t('selectCompany')}>
                                    <IconButton onClick={handleOpenCompanyModal} sx={{ mr: 1 }} color="inherit">
                                        <Avatar
                                            src={API_BASE_URL + "/img/logos/" + companySelected?.logoName}
                                            alt={companySelected?.name}
                                            sx={{ width: 40, height: 40 }}
                                        >
                                            <BusinessIcon />
                                        </Avatar>
                                    </IconButton>
                                </Tooltip>
                                <Divider orientation="vertical" flexItem sx={{ borderColor: 'rgba(255,255,255,0.3)', mx: 1 }} />
                            </>
                        )}

                        {/* Menú Usuario Desktop */}
                        <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center' }}>
                            <Tooltip title={t('more_options')}>
                                <IconButton color="inherit" onClick={handleUserMenuClick} sx={{ display: 'flex', alignItems: 'center', gap: 1, borderRadius: 2, px: 1.5 }}>
                                    <Avatar sx={{ width: 40, height: 40, bgcolor: 'secondary.light', fontSize: 20, fontWeight: 700 }}>
                                        {userName ? userName.charAt(0).toUpperCase() : <AccountCircle />}
                                    </Avatar>
                                    <Box sx={{ textAlign: 'left', lineHeight: 1 }}>
                                        <Typography variant="body2" sx={{ fontWeight: 600, display: 'block' }}>{userName}</Typography>
                                        {userRoles && (
                                            <Typography variant="caption" sx={{ opacity: 0.8, display: 'block', mt: '-1px' }}>
                                                {userRoles.split(',')[0].trim()}
                                            </Typography>
                                        )}
                                    </Box>
                                    <KeyboardArrowDownIcon sx={{ fontSize: 18, opacity: 0.8 }} />
                                </IconButton>
                            </Tooltip>
                        </Box>

                        {/* Menú Usuario Mobile */}
                        <Box sx={{ display: { xs: 'flex', md: 'none' } }}>
                            <IconButton color="inherit" onClick={handleUserMenuClick}>
                                <Avatar sx={{ width: 40, height: 40, bgcolor: 'secondary.light', fontSize: 20, fontWeight: 700 }}>
                                    {userName ? userName.charAt(0).toUpperCase() : <AccountCircle />}
                                </Avatar>
                            </IconButton>
                        </Box>

                        {UserMenu}
                    </Box>
                </Toolbar>
            </AppBar>

            <CompanySelectionModal
                open={isCompanyModalOpen}
                onClose={handleCloseCompanyModal}
                onSelectCompany={handleSelectCompany}
                selectedCompanyId={companySelected?.idCompany}
                forceSelection={isNoCompany}
            />
        </>
    );
};

export default NavbarComponent;