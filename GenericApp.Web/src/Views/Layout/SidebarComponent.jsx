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
    Tooltip,
    alpha,
    useTheme
} from '@mui/material';

import HomeIcon from '@mui/icons-material/Home';
import PeopleIcon from '@mui/icons-material/People';
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import SettingsIcon from '@mui/icons-material/Settings';
import BarChartIcon from '@mui/icons-material/BarChart';
import DashboardIcon from '@mui/icons-material/Dashboard';
import CloseIcon from '@mui/icons-material/Close';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import TruckIcon from '@mui/icons-material/FireTruck';
import BusinessIcon from '@mui/icons-material/Business';
import LabelIcon from '@mui/icons-material/Label';
import ApartmentIcon from '@mui/icons-material/Apartment';
import LocationCityIcon from '@mui/icons-material/LocationCity';
import DateRangeIcon from '@mui/icons-material/DateRange';
import BadgeIcon from '@mui/icons-material/Badge';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import WidgetsIcon from '@mui/icons-material/Widgets';

const drawerWidth = 256;

const iconMap = {
    DashboardIcon,
    PeopleIcon,
    PeopleAltIcon,
    SettingsIcon,
    BarChartIcon,
    HomeIcon,
    TruckIcon,
    LabelIcon,
    ApartmentIcon,
    BusinessIcon,
    LocationCityIcon,
    DateRangeIcon,
    BadgeIcon,
    LocalShippingIcon,
    WidgetsIcon,
};

const NAV_ITEM_SX = (isSelected) => ({
    borderRadius: '10px',
    mx: 1,
    mb: 0.5,
    color: isSelected ? '#ffffff' : 'rgba(255,255,255,0.72)',
    backgroundColor: isSelected ? 'rgba(255,255,255,0.18)' : 'transparent',
    '&:hover': {
        backgroundColor: isSelected ? 'rgba(255,255,255,0.22)' : 'rgba(255,255,255,0.10)',
        color: '#ffffff',
    },
    transition: 'background-color 0.2s, color 0.2s',
});

const renderMenuItems = (items, t, toggleSubmenu, openSubmenu, currentPath, closeSidebarOnMobile) => {
    return items.map((item) => {
        const IconComponent = iconMap[item.icon];
        const isSubmenuOpen = openSubmenu === item.id;

        if (item.submenu) {
            const isAnySubItemSelected = item.submenu.some(subItem => currentPath.startsWith(subItem.path));

            return (
                <React.Fragment key={item.id}>
                    <ListItemButton
                        onClick={() => toggleSubmenu(item.id)}
                        sx={NAV_ITEM_SX(isAnySubItemSelected)}
                    >
                        {IconComponent && (
                            <ListItemIcon sx={{ minWidth: 36, color: 'inherit' }}>
                                <IconComponent fontSize="small" />
                            </ListItemIcon>
                        )}
                        <ListItemText
                            primary={t(item.i18nKey)}
                            primaryTypographyProps={{ fontSize: '0.875rem', fontWeight: isAnySubItemSelected ? 600 : 400 }}
                        />
                        {isSubmenuOpen ? <ExpandLess sx={{ fontSize: 18 }} /> : <ExpandMore sx={{ fontSize: 18 }} />}
                    </ListItemButton>
                    <Collapse in={isSubmenuOpen} timeout="auto" unmountOnExit>
                        <List component="div" disablePadding>
                            {item.submenu.map((subItem) => {
                                const isSubItemSelected = currentPath.startsWith(subItem.path);
                                const SubIconComponent = iconMap[subItem.icon];
                                return (
                                    <ListItemButton
                                        key={subItem.id}
                                        sx={{ ...NAV_ITEM_SX(isSubItemSelected), pl: 3 }}
                                        to={subItem.path}
                                        component={RouterLink}
                                        onClick={closeSidebarOnMobile}
                                    >
                                        <ListItemIcon sx={{ minWidth: 32, color: 'inherit' }}>
                                            {SubIconComponent
                                                ? <SubIconComponent sx={{ fontSize: 18 }} />
                                                : <WidgetsIcon sx={{ fontSize: 18 }} />
                                            }
                                        </ListItemIcon>
                                        <ListItemText
                                            primary={t(subItem.i18nKey)}
                                            primaryTypographyProps={{ fontSize: '0.82rem', fontWeight: isSubItemSelected ? 600 : 400 }}
                                        />
                                    </ListItemButton>
                                );
                            })}
                        </List>
                    </Collapse>
                </React.Fragment>
            );
        }

        const isItemSelected = item.path === '/'
            ? currentPath === '/'
            : currentPath.startsWith(item.path);

        return (
            <ListItem key={item.id} disablePadding>
                <Tooltip title={t(item.i18nKey)} placement="right" arrow disableHoverListener>
                    <ListItemButton
                        to={item.path}
                        component={RouterLink}
                        sx={NAV_ITEM_SX(isItemSelected)}
                        onClick={closeSidebarOnMobile}
                    >
                        {IconComponent && (
                            <ListItemIcon sx={{ minWidth: 36, color: 'inherit' }}>
                                <IconComponent fontSize="small" />
                            </ListItemIcon>
                        )}
                        <ListItemText
                            primary={t(item.i18nKey)}
                            primaryTypographyProps={{ fontSize: '0.875rem', fontWeight: isItemSelected ? 600 : 400 }}
                        />
                    </ListItemButton>
                </Tooltip>
            </ListItem>
        );
    });
};

const drawerPaperSx = (theme) => {
    const isDark = theme.palette.mode === 'dark';
    const bgFrom = isDark ? theme.palette.background.paper : theme.palette.primary.main;
    const bgTo = isDark ? theme.palette.background.default : theme.palette.primary.dark;
    const shadow = isDark
        ? `4px 0 24px ${alpha('#000000', 0.45)}`
        : `4px 0 24px ${alpha(theme.palette.primary.dark, 0.35)}`;

    return {
        width: drawerWidth,
        boxSizing: 'border-box',
        background: `linear-gradient(160deg, ${bgFrom} 0%, ${bgTo} 100%)`,
        color: '#ffffff',
        border: 'none',
        boxShadow: shadow,
        overflowX: 'hidden',
    };
};

const SidebarComponent = ({ showSidebar, toggleSidebar, isMobile }) => {
    const { t } = useTranslation();
    const { companySelected, userRoles, userName } = useContext(AppContext);
    const theme = useTheme();

    const userRoleList = userRoles ? userRoles.map(r => r.trim()) : [];
    const isAdmin = userRoleList.includes('Administrator');

    const isItemAllowed = (item) => {
        if (item.enabled === false) return false;
        const hasRole = !item.roles || item.roles.some(r => userRoleList.includes(r));
        if (!hasRole) return false;
        if (item.allowedUsers) return item.allowedUsers.includes(userName);
        return true;
    };

    const filterRoutesByRole = (items) => {
        return items
            .filter(item => isItemAllowed(item))
            .map(item => {
                if (item.submenu) {
                    const filteredSubmenu = item.submenu.filter(sub => isItemAllowed(sub));
                    return { ...item, submenu: filteredSubmenu };
                }
                return item;
            })
            .filter(item => !item.submenu || item.submenu.length > 0);
    };

    const filteredRoutes = filterRoutesByRole(routes);

    const location = useLocation();
    const currentPath = location.pathname;
    const isFirstRender = useRef(true);

    const hasCompany = companySelected && Object.keys(companySelected).length > 0;

    const displayLogo = hasCompany
        ? `${API_BASE_URL}/img/logos/${companySelected.logoName}`
        : AppLogoImage;

    const displayName = hasCompany
        ? companySelected.name
        : t('app_name');

    const findParentId = (routes, path) => {
        for (const item of routes) {
            if (item.submenu) {
                const isSubItemActive = item.submenu.some(subItem => path.startsWith(subItem.path));
                if (isSubItemActive) return item.id;
            }
        }
        return null;
    };

    const [openSubmenu, setOpenSubmenu] = useState(null);

    useEffect(() => {
        const activeParentId = findParentId(filteredRoutes, currentPath);

        if (isFirstRender.current) {
            if (activeParentId) setOpenSubmenu(activeParentId);
            isFirstRender.current = false;
            return;
        }

        if (activeParentId && openSubmenu !== activeParentId) setOpenSubmenu(activeParentId);
        if (!activeParentId && openSubmenu) setOpenSubmenu(null);
    }, [currentPath]);

    const toggleSubmenu = (submenuName) => {
        setOpenSubmenu(openSubmenu === submenuName ? null : submenuName);
    };

    const closeSidebarOnMobile = () => {
        if (isMobile) toggleSidebar();
    };

    const menuContent = renderMenuItems(
        filteredRoutes, t, toggleSubmenu, openSubmenu, currentPath, closeSidebarOnMobile
    );

    const SidebarHeader = ({ showClose }) => (
        <Box
            sx={{
                px: 2,
                py: 1.6,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                borderBottom: '1px solid rgba(255,255,255,0.10)',
            }}
        >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, overflow: 'hidden' }}>
                <Avatar
                    src={displayLogo}
                    alt={displayName}
                    sx={{
                        width: 38,
                        height: 38,
                        border: '2px solid rgba(255,255,255,0.3)',
                        flexShrink: 0,
                        bgcolor: 'rgba(255,255,255,0.15)',
                    }}
                >
                    <BusinessIcon fontSize="small" />
                </Avatar>
                <Typography
                    noWrap
                    sx={{ fontWeight: 700, fontSize: '0.95rem', color: '#ffffff', letterSpacing: 0.3 }}
                >
                    {displayName}
                </Typography>
            </Box>
            {showClose && (
                <IconButton onClick={toggleSidebar} size="small" sx={{ color: 'rgba(255,255,255,0.7)', '&:hover': { color: '#fff' } }}>
                    <CloseIcon fontSize="small" />
                </IconButton>
            )}
        </Box>
    );

    const drawerContent = (showClose) => (
        <>
            <SidebarHeader showClose={showClose} />
            <List sx={{ px: 0.5, flex: 1 }}>
                {menuContent}
            </List>
        </>
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
                    '& .MuiDrawer-paper': drawerPaperSx(theme),
                }}
            >
                {drawerContent(true)}
            </Drawer>

            {/* --- DRAWER DESKTOP --- */}
            <Drawer
                variant="permanent"
                open
                sx={{
                    display: { xs: 'none', md: 'block' },
                    '& .MuiDrawer-paper': drawerPaperSx(theme),
                }}
            >
                {drawerContent(false)}
            </Drawer>
        </Box>
    );
};

export default SidebarComponent;