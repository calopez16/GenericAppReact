import React, { useState, useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { AppContext } from '@helpers/AppContext';
import routes from '@data/routes.json'; 
// MUI Imports
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

// MUI Icon Imports
import DashboardIcon from '@mui/icons-material/Dashboard';
import PeopleIcon from '@mui/icons-material/People';
import SettingsIcon from '@mui/icons-material/Settings';
import BarChartIcon from '@mui/icons-material/BarChart';
import CloseIcon from '@mui/icons-material/Close';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';

const drawerWidth = 240;

// Mapeo de nombres de iconos a componentes
const iconMap = {
    DashboardIcon: DashboardIcon,
    PeopleIcon: PeopleIcon,
    SettingsIcon: SettingsIcon,
    BarChartIcon: BarChartIcon,
};

// Componente recursivo para renderizar los ítems del menú
const renderMenuItems = (items, t, toggleSubmenu, openSubmenu) => {
    return items.map((item) => {
        const IconComponent = iconMap[item.icon];
        const isSubmenuOpen = openSubmenu === item.id;

        // Si el ítem tiene submenú
        if (item.submenu) {
            return (
                <React.Fragment key={item.id}>
                    <ListItemButton onClick={() => toggleSubmenu(item.id)}>
                        {IconComponent && <ListItemIcon><IconComponent /></ListItemIcon>}
                        <ListItemText primary={t(item.i18nKey)} />
                        {isSubmenuOpen ? <ExpandLess /> : <ExpandMore />}
                    </ListItemButton>
                    <Collapse in={isSubmenuOpen} timeout="auto" unmountOnExit>
                        <List component="div" disablePadding>
                            {item.submenu.map((subItem) => (
                                <ListItemButton key={subItem.id} sx={{ pl: 4 }} component="a" href={subItem.path}>
                                    <ListItemText primary={t(subItem.i18nKey)} />
                                </ListItemButton>
                            ))}
                        </List>
                    </Collapse>
                </React.Fragment>
            );
        }

        // Si es un ítem de menú normal
        return (
            <ListItem key={item.id} disablePadding>
                <ListItemButton component="a" href={item.path}>
                    {IconComponent && <ListItemIcon><IconComponent /></ListItemIcon>}
                    <ListItemText primary={t(item.i18nKey)} />
                </ListItemButton>
            </ListItem>
        );
    });
};

const SidebarComponent = ({ showSidebar, toggleSidebar }) => {
    const { t } = useTranslation();
    const { themeMode } = useContext(AppContext);
    const [openSubmenu, setOpenSubmenu] = useState(null);

    const toggleSubmenu = (submenuName) => {
        setOpenSubmenu(openSubmenu === submenuName ? null : submenuName);
    };

    const menuContent = renderMenuItems(routes, t, toggleSubmenu, openSubmenu);

    return (
        <Box
            component="nav"
            sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}
        >
            {/* Drawer Temporal (para móviles) */}
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
                        <Avatar src="https://via.placeholder.com/40" alt="Logo" sx={{ mr: 2, width: 40, height: 40 }} />
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

            {/* Drawer Permanente (para escritorio) */}
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
                open // Este Drawer siempre está abierto
            >
                <Box sx={{ p: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <Avatar src="https://via.placeholder.com/40" alt="Logo" sx={{ mr: 2, width: 40, height: 40 }} />
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