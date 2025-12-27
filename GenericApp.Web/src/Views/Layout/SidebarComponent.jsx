import React, { useState, useContext, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { AppContext } from '@helpers/AppContext';
import routes from '@views/routes.json';
import AppLogoImage from '@images/logo.png';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import { API_BASE_URL } from '@config';

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
    Avatar,
    Divider 
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
import BusinessIcon from '@mui/icons-material/Business';

const drawerWidth = 240;

const iconMap = {
    DashboardIcon: DashboardIcon,
    PeopleIcon: PeopleIcon,
    SettingsIcon: SettingsIcon,
    BarChartIcon: BarChartIcon,
    HomeIcon: HomeIcon,
    TruckIcon: TruckIcon
};

const renderMenuItems = (items, t, toggleSubmenu, openSubmenu, currentPath, closeSidebarOnMobile, companySelected) => {
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
                        {isSubmenuOpen ? <ExpandLess /> : <ExpandMore />}
                    </ListItemButton>
                    <Collapse in={isSubmenuOpen} timeout="auto" unmountOnExit>
                        <List component="div" disablePadding>
                            {item.submenu.map((subItem) => {
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
    const { themeMode, companySelected } = useContext(AppContext);

    const location = useLocation();
    const currentPath = location.pathname;
    const isFirstRender = useRef(true);

    // --- LÓGICA PARA LOGO Y NOMBRE ---
    const hasCompany = companySelected && Object.keys(companySelected).length > 0;

    const displayLogo = hasCompany
        ? `${API_BASE_URL}/img/logos/${companySelected.logoName}`
        : AppLogoImage;

    const displayName = hasCompany
        ? companySelected.name
        : t('app_name');
    // ---------------------------------

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

    const [openSubmenu, setOpenSubmenu] = useState(null);

    useEffect(() => {
        const activeParentId = findParentId(routes, currentPath);

        if (isFirstRender.current) {
            if (activeParentId) {
                setOpenSubmenu(activeParentId);
            }
            isFirstRender.current = false;
            return;
        }

        if (activeParentId && openSubmenu !== activeParentId) {
            setOpenSubmenu(activeParentId);
        }

        if (!activeParentId && openSubmenu) {
            setOpenSubmenu(null);
        }

    }, [currentPath]);

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
        closeSidebarOnMobile,
        companySelected
    );

    // Header reutilizable
    const SidebarHeader = () => (
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Avatar
                src={displayLogo}
                alt={displayName}
                sx={{ mr: 2, width: 40, height: 40 }}
            >
                <BusinessIcon />
            </Avatar>
            <Typography variant="h6" component="div" noWrap sx={{ fontWeight: 'bold', fontSize: '1rem' }}>
                {displayName}
            </Typography>
        </Box>
    );

    return (
        <Box
            component="nav"
            sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}
        >
            {/* --- DRAWER MÓVIL --- */}
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
                    <SidebarHeader />
                    <IconButton onClick={toggleSidebar}>
                        <CloseIcon />
                    </IconButton>
                </Box>

                {/* SEPARADOR AGREGADO */}
                <Divider />

                <List>
                    {menuContent}
                </List>
            </Drawer>

            {/* --- DRAWER DESKTOP --- */}
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
                {/* Header del drawer */}
                <Box sx={{ p: 2, minHeight: 64, display: 'flex', alignItems: 'center' }}>
                    <SidebarHeader />
                </Box>

                {/* SEPARADOR AGREGADO */}
                <Divider />

                <List>
                    {menuContent}
                </List>
            </Drawer>
        </Box>
    );
};

export default SidebarComponent;