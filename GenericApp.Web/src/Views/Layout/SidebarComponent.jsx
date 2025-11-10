import React, { useState, useContext, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { AppContext } from '@helpers/AppContext';
import routes from '@views/routes.json';
import AppLogoImage from '@images/logo.png';
import { Link as RouterLink, useLocation } from 'react-router-dom';

import {
    Drawer,
    Box,
    List,
    ListItem,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Typography,
    Collapse,
    IconButton,
    Avatar
} from '@mui/material';

import DashboardIcon from '@mui/icons-material/Dashboard';
import HomeIcon from '@mui/icons-material/Home';
import PeopleIcon from '@mui/icons-material/People';
import SettingsIcon from '@mui/icons-material/Settings';
import BarChartIcon from '@mui/icons-material/BarChart';
import CloseIcon from '@mui/icons-material/Close';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import TruckIcon from '@mui/icons-material/FireTruck';

const drawerWidth = 240;

const iconMap = {
    DashboardIcon: DashboardIcon,
    PeopleIcon: PeopleIcon,
    SettingsIcon: SettingsIcon,
    BarChartIcon: BarChartIcon,
    HomeIcon: HomeIcon,
    TruckIcon: TruckIcon
};

const renderMenuItems = (items, t, toggleSubmenu, openSubmenu, currentPath, closeSidebarOnMobile) => {

    return items.map((item) => {
        const IconComponent = iconMap[item.icon];
        const isSubmenuOpen = openSubmenu === item.id;

        const isItemSelected = currentPath.startsWith(item.path) && item.path !== '/';

        if (item.submenu) {
            const isAnySubItemSelected = item.submenu.some(subItem => currentPath.startsWith(subItem.path));

            return (
                <React.Fragment key={item.id}>
                    <ListItemButton
                        onClick={() => toggleSubmenu(item.id)}
                        selected={isAnySubItemSelected}
                    >
                        {IconComponent && <ListItemIcon><IconComponent /></ListItemIcon>}
                        <ListItemText primary={t(item.i18nKey)} />
                        {/* El icono de expansión debe basarse en el estado actual del submenú */}
                        {isSubmenuOpen ? <ExpandLess /> : <ExpandMore />}
                    </ListItemButton>
                    {/* CRUCIAL: El colapso se mantiene abierto si fue abierto manualmente O si la ruta está activa */}
                    <Collapse in={isSubmenuOpen} timeout="auto" unmountOnExit>
                        <List component="div" disablePadding>
                            {item.submenu.map((subItem) => {
                                // Sub-elemento se selecciona si su path coincide
                                const isSubItemSelected = currentPath.startsWith(subItem.path);

                                return (
                                    <ListItemButton
                                        key={subItem.id}
                                        sx={{ pl: 4 }}
                                        to={subItem.path}
                                        component={RouterLink}
                                        selected={isSubItemSelected}
                                        onClick={closeSidebarOnMobile}
                                    >
                                        <ListItemText primary={t(subItem.i18nKey)} />
                                    </ListItemButton>
                                );
                            })}
                        </List>
                    </Collapse>
                </React.Fragment>
            );
        }

        return (
            <ListItem key={item.id} disablePadding>
                <ListItemButton
                    to={item.path}
                    component={RouterLink}
                    selected={isItemSelected}
                    onClick={closeSidebarOnMobile}
                >
                    {IconComponent && <ListItemIcon><IconComponent /></ListItemIcon>}
                    <ListItemText primary={t(item.i18nKey)} />
                </ListItemButton>
            </ListItem>
        );
    });
};

const SidebarComponent = ({ showSidebar, toggleSidebar, isMobile }) => {
    const { t } = useTranslation();
    const { themeMode } = useContext(AppContext);

    const location = useLocation();
    const currentPath = location.pathname;

    // Usamos un ref para saber si es la primera carga y si el usuario ya interactuó
    const isFirstRender = useRef(true);

    const findParentId = (routes, path) => {
        for (const item of routes) {
            if (item.submenu) {
                const isSubItemActive = item.submenu.some(subItem => path.startsWith(subItem.path));
                if (isSubItemActive) {
                    return item.id;
                }
            }
        }
        return null;
    };

    // Inicializamos openSubmenu a null (estado cerrado)
    const [openSubmenu, setOpenSubmenu] = useState(null);

    // useEffect para manejar la apertura automática basada en la ruta
    useEffect(() => {
        const activeParentId = findParentId(routes, currentPath);

        if (isFirstRender.current) {
            // En la primera carga, forzar la apertura del submenú activo
            if (activeParentId) {
                setOpenSubmenu(activeParentId);
            }
            isFirstRender.current = false;
            return;
        }

        // Si la ruta activa (activeParentId) es diferente al submenú actualmente abierto,
        // lo abrimos, respetando el cierre manual si se está en la misma ruta.
        if (activeParentId && openSubmenu !== activeParentId) {
            setOpenSubmenu(activeParentId);
        }

        // Si no hay un padre activo, forzamos el cierre si algo está abierto.
        if (!activeParentId && openSubmenu) {
            setOpenSubmenu(null);
        }

    }, [currentPath]); // Se ejecuta al cambiar de ruta

    const toggleSubmenu = (submenuName) => {
        // La interacción del usuario SIEMPRE debe sobrescribir el estado
        setOpenSubmenu(openSubmenu === submenuName ? null : submenuName);
    };

    const closeSidebarOnMobile = () => {
        if (isMobile) {
            toggleSidebar();
        }
    };

    const menuContent = renderMenuItems(
        routes,
        t,
        toggleSubmenu,
        openSubmenu,
        currentPath,
        closeSidebarOnMobile
    );

    return (
        <Box
            component="nav"
            sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}
        >
            <Drawer
                variant="temporary"
                open={showSidebar}
                onClose={toggleSidebar}
                ModalProps={{ keepMounted: true }}
                sx={{
                    display: { xs: 'block', md: 'none' },
                    '& .MuiDrawer-paper': {
                        width: drawerWidth,
                        boxSizing: 'border-box',
                        backgroundColor: themeMode === 'light' ? 'background.paper' : 'background.default',
                        color: themeMode === 'light' ? 'text.primary' : 'text.secondary',
                    }
                }}
            >
                <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Avatar src={AppLogoImage} alt="Logo" sx={{ mr: 2, width: 40, height: 40 }} />
                        <Typography variant="h6" component="div">{t('app_name')}</Typography>
                    </Box>
                    <IconButton onClick={toggleSidebar}>
                        <CloseIcon />
                    </IconButton>
                </Box>
                <List>
                    {menuContent}
                </List>
            </Drawer>

            <Drawer
                variant="permanent"
                sx={{
                    display: { xs: 'none', md: 'block' },
                    '& .MuiDrawer-paper': {
                        width: drawerWidth,
                        boxSizing: 'border-box',
                        backgroundColor: themeMode === 'light' ? 'background.paper' : 'background.default',
                        color: themeMode === 'light' ? 'text.primary' : 'text.secondary',
                    }
                }}
                open
            >
                <Box sx={{ p: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <Avatar src={AppLogoImage} alt="Logo" sx={{ mr: 2, width: 40, height: 40 }} />
                        <Typography variant="h6" component="div">{t('app_name')}</Typography>
                    </Box>
                </Box>
                <List>
                    {menuContent}
                </List>
            </Drawer>
        </Box>
    );
};

export default SidebarComponent;