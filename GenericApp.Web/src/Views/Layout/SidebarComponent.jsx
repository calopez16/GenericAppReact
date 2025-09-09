import React, { useState, useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { AppContext } from '@helpers/AppContext';

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

// Extraer el contenido del menú a una función para evitar duplicación de código
const menuContent = (t, toggleSubmenu, openSubmenu) => (
    <List>
        <ListItem disablePadding>
            <ListItemButton component="a" href="#dashboard">
                <ListItemIcon><DashboardIcon /></ListItemIcon>
                <ListItemText primary={t('dashboard')} />
            </ListItemButton>
        </ListItem>
        <ListItemButton onClick={() => toggleSubmenu('users')}>
            <ListItemIcon><PeopleIcon /></ListItemIcon>
            <ListItemText primary={t('usuarios')} />
            {openSubmenu === 'users' ? <ExpandLess /> : <ExpandMore />}
        </ListItemButton>
        <Collapse in={openSubmenu === 'users'} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
                <ListItemButton sx={{ pl: 4 }} component="a" href="#users/list">
                    <ListItemText primary={t('ver_todos')} />
                </ListItemButton>
                <ListItemButton sx={{ pl: 4 }} component="a" href="#users/add">
                    <ListItemText primary={t('anadir_usuario')} />
                </ListItemButton>
            </List>
        </Collapse>
        <ListItem disablePadding>
            <ListItemButton component="a" href="#reports">
                <ListItemIcon><BarChartIcon /></ListItemIcon>
                <ListItemText primary={t('reportes')} />
            </ListItemButton>
        </ListItem>
        <ListItem disablePadding>
            <ListItemButton component="a" href="#settings">
                <ListItemIcon><SettingsIcon /></ListItemIcon>
                <ListItemText primary={t('configuracion')} />
            </ListItemButton>
        </ListItem>
    </List>
);

const SidebarComponent = ({ showSidebar, toggleSidebar }) => {
    const { t } = useTranslation();
    const { themeMode } = useContext(AppContext);
    const [openSubmenu, setOpenSubmenu] = useState(null);

    const toggleSubmenu = (submenuName) => {
        setOpenSubmenu(openSubmenu === submenuName ? null : submenuName);
    };

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
                        <Typography variant="h6" component="div">{t('mi_sistema')}</Typography>
                    </Box>
                    <IconButton onClick={toggleSidebar}>
                        <CloseIcon />
                    </IconButton>
                </Box>
                {menuContent(t, toggleSubmenu, openSubmenu)}
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
                        <Typography variant="h6" component="div">{t('mi_sistema')}</Typography>
                    </Box>
                </Box>
                {menuContent(t, toggleSubmenu, openSubmenu)}
            </Drawer>
        </Box>
    );
};

export default SidebarComponent;