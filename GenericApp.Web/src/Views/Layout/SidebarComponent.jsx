import React, { useState, useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { AppContext } from '@helpers/AppContext';
import routes from '@views/routes.json';
import AppLogoImage from '@images/logo.png';
import { Link as RouterLink } from 'react-router-dom';

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
        const isItemSelected = item.path === currentPath;

        if (item.submenu) {
            const isAnySubItemSelected = item.submenu.some(subItem => subItem.path === currentPath);

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
                                const isSubItemSelected = subItem.path === currentPath;

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
    const currentPath = typeof window !== 'undefined' ? window.location.pathname : '/';

    const findParentId = (routes, path) => {
        for (const item of routes) {
            if (item.submenu) {
                const isSubItemActive = item.submenu.some(subItem => subItem.path === path);
                if (isSubItemActive) {
                    return item.id;
                }
            }
        }
        return null;
    };

    const initialOpenSubmenu = findParentId(routes, currentPath);
    const [openSubmenu, setOpenSubmenu] = useState(initialOpenSubmenu);

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