import React, { useState, useContext, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { AppContext } from '@helpers/AppContext';
import routes from '@views/routes.json';
import AppLogoImage from '@images/logo.png';
// IMPORTAR HOOK useLocation
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

        // CORRECCIÓN CLAVE: Usamos 'startsWith' para manejar rutas más largas (ej: /drivers/edit/123)
        const isItemSelected = currentPath.startsWith(item.path) && item.path !== '/';

        if (item.submenu) {
            // Un elemento padre se considera activo si su path coincide o si *cualquiera* de sus submenús coincide.
            const isAnySubItemSelected = item.submenu.some(subItem => currentPath.startsWith(subItem.path));

            return (
                <React.Fragment key={item.id}>
                    <ListItemButton
                        onClick={() => toggleSubmenu(item.id)}
                        // El padre se selecciona si alguna sub-ruta está activa.
                        selected={isAnySubItemSelected}
                    >
                        {IconComponent && <ListItemIcon><IconComponent /></ListItemIcon>}
                        <ListItemText primary={t(item.i18nKey)} />
                        {isSubmenuOpen ? <ExpandLess /> : <ExpandMore />}
                    </ListItemButton>
                    <Collapse in={isSubmenuOpen || isAnySubItemSelected} timeout="auto" unmountOnExit>
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
                    // CORRECCIÓN: Usar 'startsWith' para rutas simples
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

    // CAMBIO CLAVE: Usar useLocation para obtener la ruta y forzar re-renderizado
    const location = useLocation();
    const currentPath = location.pathname;

    const findParentId = (routes, path) => {
        for (const item of routes) {
            if (item.submenu) {
                // Verificar si alguna sub-ruta comienza con el path actual
                const isSubItemActive = item.submenu.some(subItem => path.startsWith(subItem.path));
                if (isSubItemActive) {
                    return item.id;
                }
            }
        }
        return null;
    };

    // Esto se recalcula en cada cambio de ruta gracias a useLocation
    const initialOpenSubmenu = findParentId(routes, currentPath);
    const [openSubmenu, setOpenSubmenu] = useState(null);

    // Efecto para abrir automáticamente el submenú si la ruta activa está dentro
    useEffect(() => {
        const parentId = findParentId(routes, currentPath);
        if (parentId && openSubmenu !== parentId) {
            setOpenSubmenu(parentId);
        }
    }, [currentPath]); // Depende de la ruta actual

    const toggleSubmenu = (submenuName) => {
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