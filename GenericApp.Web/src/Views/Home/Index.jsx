import React, { useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { Link as RouterLink } from 'react-router-dom';
import { AppContext } from '@helpers/AppContext';
import AppLogoImage from '@images/logo.png'

// Importaciones de rutas
import routes from '@data/routes.json';

// Importaciones de MUI (estilo unificado)
import {
    Container,
    Typography,
    Grid,
    Card,
    CardContent,
    CardActions,
    Button,
    Box,
    Paper,
    Link
} from '@mui/material';

// Importaciones de Iconos
import HomeIcon from '@mui/icons-material/Home';
import SettingsIcon from '@mui/icons-material/Settings';
import PeopleIcon from '@mui/icons-material/People';
import BarChartIcon from '@mui/icons-material/BarChart';
import DashboardIcon from '@mui/icons-material/Dashboard';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';

// Mapa de iconos
const iconMap = {
    HomeIcon: <HomeIcon color="primary" />,
    SettingsIcon: <SettingsIcon color="primary" />,
    PeopleIcon: <PeopleIcon color="primary" />,
    BarChartIcon: <BarChartIcon color="primary" />,
    DashboardIcon: <DashboardIcon color="primary" />,
    AttachMoneyIcon: <AttachMoneyIcon color="primary" />
};

const WelcomePage = () => {
    // Hook de traducción
    const { t } = useTranslation();
    const { userName = 'Usuario' } = useContext(AppContext);

    return (
        <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
            <Paper elevation={3} sx={{ p: 4, borderRadius: 2, mb: 5 }}>

                {/* INICIO: Bloque de Contenido de Bienvenida y Logo (Flexbox) */}
                <Box
                    sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        flexDirection: { xs: 'column', md: 'row' },
                        textAlign: { xs: 'center', md: 'left' }
                    }}
                >
                    <Box sx={{ mb: { xs: 2, md: 0 } }}> {/* Contenedor del texto */}
                        <Typography variant="h4" component="h1" gutterBottom>
                            {t('welcome_page_title')} {userName} 👋
                        </Typography>
                        <Typography variant="body1" color="text.secondary">
                            {t('welcome_page_subtitle')}
                        </Typography>
                    </Box>

                    {/* Logo más grande y circular */}
                    <Box sx={{
                        flexShrink: 0,
                        ml: { md: 4 },
                        display: 'flex', // Asegura que el contenedor del logo también sea flex para centrar la imagen si es necesario
                        justifyContent: 'center',
                        alignItems: 'center',
                    }}>
                        <img
                            src={AppLogoImage}
                            alt="Logo de la Aplicación"
                            style={{
                                width: '200px', // Ancho fijo para el círculo
                                height: '200px', // Alto fijo para el círculo (igual al ancho)
                                borderRadius: '50%', // Hace la imagen circular
                                objectFit: 'cover',  // Asegura que la imagen cubra el área sin distorsionarse
                                border: '2px solid', // Añade un borde sutil
                                borderColor: 'primary.main', // Color del borde (usando el tema de MUI)
                                boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.1)' // Sombra para darle profundidad
                            }}
                        />
                    </Box>
                </Box>
                {/* FIN: Bloque de Contenido de Bienvenida y Logo */}

            </Paper>

            <Box>
                <Typography variant="h5" component="h2" gutterBottom>
                    {t('welcome_page_options_title')}
                </Typography>

                {/* GRID RESPONSIVE - Asegura que no se desborde con muchas opciones */}
                <Grid container spacing={4}>
                    {routes.map((route) => (
                        <Grid
                            item
                            key={route.id}
                            xs={12} // 1 por fila en móvil
                            sm={6}  // 2 por fila en tablet
                            md={4}  // 3 por fila en escritorio pequeño
                            lg={3}  // 4 por fila en escritorio grande
                            xl={2}  // 6 por fila en escritorio extra grande
                        >
                            <Card sx={{
                                display: 'flex',
                                flexDirection: 'column',
                                height: '100%',
                                transition: 'transform 0.3s',
                                '&:hover': {
                                    transform: 'translateY(-5px)',
                                    boxShadow: 6
                                }
                            }}>
                                <CardContent sx={{ flexGrow: 1 }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                        {iconMap[route.icon] || <SettingsIcon color="primary" />}
                                        <Typography variant="h6" component="div" sx={{ ml: 2 }}>
                                            {t(route.i18nKey)}
                                        </Typography>
                                    </Box>
                                    <Typography variant="body2" color="text.secondary">
                                        {t(route.i18nKeyDescription)}
                                    </Typography>
                                </CardContent>
                                <CardActions
                                    sx={{
                                        flexWrap: 'wrap',
                                        justifyContent: route.submenu ? 'flex-start' : 'flex-end',
                                        p: 2,
                                    }}
                                >
                                    {route.submenu ? (
                                        route.submenu.map(subItem => (
                                            <Button
                                                key={subItem.id}
                                                component={RouterLink}
                                                to={subItem.path}
                                                size="small"
                                                variant="contained"
                                                sx={{ m: 0.5 }}
                                            >
                                                {t('welcome_page_goTo', { page: t(subItem.i18nKey) })}
                                            </Button>
                                        ))
                                    ) : (
                                        <Button
                                            component={RouterLink}
                                            to={route.path}
                                            size="small"
                                            variant="contained"
                                        >
                                            {t('welcome_page_goTo', { page: t(route.i18nKey) })}
                                        </Button>
                                    )}
                                </CardActions>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            </Box>

            {/*<Box sx={{ mt: 5, textAlign: 'center' }}>*/}
            {/*    <Paper elevation={1} sx={{ p: 2, display: 'inline-block' }}>*/}
            {/*        <Typography variant="body2" color="text.secondary">*/}
            {/*            {t('welcome_page.support_text')} {' '}*/}
            {/*            <Link href="mailto:soporte@tuempresa.com">*/}
            {/*                soporte@tuempresa.com*/}
            {/*            </Link>*/}
            {/*            .*/}
            {/*        </Typography>*/}
            {/*    </Paper>*/}
            {/*</Box>*/}

        </Container>
    );
};

export default WelcomePage;