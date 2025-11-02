import React, { useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { AppContext } from '@helpers/AppContext';
import espanishFlag from '@images/lang/es-flag.png';
import englishFlag from '@images/lang/en-flag.png';

// MUI Imports
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Box from '@mui/material/Box';
import Avatar from '@mui/material/Avatar';
import Tooltip from '@mui/material/Tooltip';

// MUI Icon Imports
import MenuIcon from '@mui/icons-material/Menu';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import AccountCircle from '@mui/icons-material/AccountCircle';
import LogoutIcon from '@mui/icons-material/Logout';

const NavbarComponent = ({ handleLogout, toggleSidebar }) => {
    const { t, i18n } = useTranslation();
    const { themeMode, setThemeMode, userName = 'Usuario' } = useContext(AppContext);

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

    // Estado para el menú de idioma
    const [anchorEl, setAnchorEl] = React.useState(null);
    const open = Boolean(anchorEl);
    const handleClick = (event) => {
        setAnchorEl(event.currentTarget);
    };
    const handleClose = () => {
        setAnchorEl(null);
    };

    // Estado para el menú del usuario
    const [userAnchorEl, setUserAnchorEl] = React.useState(null);
    const userMenuOpen = Boolean(userAnchorEl);
    const handleUserMenuClick = (event) => {
        setUserAnchorEl(event.currentTarget);
    };
    const handleUserMenuClose = () => {
        setUserAnchorEl(null);
    };

    return (
        <AppBar position="static" color="primary">
            <Toolbar sx={{ justifyContent: 'space-between' }}>
                {/* Botón para mostrar el sidebar en móviles */}
                <IconButton
                    color="inherit"
                    aria-label="open drawer"
                    onClick={toggleSidebar}
                    sx={{ mr: 2, display: { md: 'none' } }}
                >
                    <MenuIcon />
                </IconButton>

                 {/*Logo y título */}
                {/*<Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center' }}>*/}
                {/*    <Avatar*/}
                {/*        src="https://via.placeholder.com/40"*/}
                {/*        alt="Logo"*/}
                {/*        sx={{ mr: 2, width: 40, height: 40 }}*/}
                {/*    />*/}
                {/*    <Typography*/}
                {/*        variant="h6"*/}
                {/*        component="div"*/}
                {/*        sx={{ flexGrow: 1 }}*/}
                {/*    >*/}
                {/*        {t('app_name')}*/}
                {/*    </Typography>*/}
                {/*</Box>*/}

                {/* Contenedor de elementos de la derecha */}
                <Box sx={{ flexGrow: 1 }} />
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    {/* Botón de tema */}
                    <Tooltip title={themeMode === 'light' ? t('select_theme_dark') : t('select_theme_light')}>
                        <IconButton color="inherit" onClick={toggleTheme} sx={{ mr: 1 }}>
                            {themeMode === 'light' ? <Brightness4Icon /> : <Brightness7Icon />}
                        </IconButton>
                    </Tooltip>
                    {/* Menú de idioma */}
                    {/*<Tooltip title={t('select_language')}>*/}
                    {/*    <IconButton*/}
                    {/*        aria-label="language selector"*/}
                    {/*        aria-controls={open ? 'language-menu' : undefined}*/}
                    {/*        aria-haspopup="true"*/}
                    {/*        aria-expanded={open ? 'true' : undefined}*/}
                    {/*        onClick={handleClick}*/}
                    {/*        sx={{ mr: 1 }}*/}
                    {/*    >*/}
                    {/*        <Avatar*/}
                    {/*            src={langFlags[i18n.language]}*/}
                    {/*            alt={t('current_language')}*/}
                    {/*            sx={{ width: 30, height: 30 }}*/}
                    {/*        />*/}
                    {/*    </IconButton>*/}
                    {/*</Tooltip>*/}
                    <Menu
                        id="language-menu"
                        anchorEl={anchorEl}
                        open={open}
                        onClose={handleClose}
                        MenuListProps={{
                            'aria-labelledby': 'language-selector',
                        }}
                    >
                        <MenuItem onClick={() => { changeLanguage('es'); handleClose(); }}>
                            <Avatar src={espanishFlag} sx={{ width: 20, height: 20, mr: 1 }} />
                            {t('language_spanish')}
                        </MenuItem>
                        <MenuItem onClick={() => { changeLanguage('en'); handleClose(); }}>
                            <Avatar src={englishFlag} sx={{ width: 20, height: 20, mr: 1 }} />
                            {t('language_english')}
                        </MenuItem>
                    </Menu>

                    {/* Separador */}
                    <Box sx={{ height: 28, borderLeft: 1, borderColor: 'divider', mx: 2, display: { xs: 'none', md: 'block' } }} />

                    {/* Menú de usuario para pantallas pequeñas */}
                    <Box sx={{ display: { xs: 'flex', md: 'none' } }}>
                        <Tooltip title={t('user_profile')}>
                            <IconButton
                                color="inherit"
                                onClick={handleUserMenuClick}
                                aria-controls={userMenuOpen ? 'user-menu' : undefined}
                                aria-haspopup="true"
                                aria-expanded={userMenuOpen ? 'true' : undefined}
                            >
                                <AccountCircle sx={{ fontSize: 30 }} />
                            </IconButton>
                        </Tooltip>
                        <Menu
                            id="user-menu"
                            anchorEl={userAnchorEl}
                            open={userMenuOpen}
                            onClose={handleUserMenuClose}
                            anchorOrigin={{
                                vertical: 'bottom',
                                horizontal: 'right',
                            }}
                            transformOrigin={{
                                vertical: 'top',
                                horizontal: 'right',
                            }}
                        >
                            <MenuItem disabled>
                                <Typography variant="inherit" noWrap>
                                    {userName}
                                </Typography>
                            </MenuItem>
                            <MenuItem onClick={handleLogout}>
                                <LogoutIcon sx={{ mr: 1 }} />
                                {t('logout')}
                            </MenuItem>
                        </Menu>
                    </Box>

                    {/* Información y botón de cerrar sesión para pantallas grandes */}
                    <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center' }}>
                        <AccountCircle sx={{ mr: 1, fontSize: 30 }} />
                        <Typography variant="body1" sx={{ mr: 2 }}>
                            {userName}
                        </Typography>
                        <Box sx={{ height: 28, borderLeft: 1, borderColor: 'divider', mx: 2, display: { xs: 'none', md: 'block' } }} />
                        <Tooltip title={t('logout')}>
                            <IconButton
                                color="inherit"
                                onClick={handleLogout}
                            >
                                <LogoutIcon />
                            </IconButton>
                        </Tooltip>
                    </Box>
                </Box>
            </Toolbar>
        </AppBar>
    );
};
export default NavbarComponent;
