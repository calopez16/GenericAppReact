import React, { useState, useContext, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { AppContext } from '@helpers/AppContext';

// MUI Imports
import {
    Box,
    Grid,
    Card,
    CardContent,
    Typography,
    Button,
    LinearProgress,
    Alert,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Pagination
} from '@mui/material';

// Iconos de Material-UI
import RefreshIcon from '@mui/icons-material/Refresh';
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import TimelineIcon from '@mui/icons-material/Timeline';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';

const mockData = [
    { id: 1, firstName: 'Juan', lastName: 'Pérez', username: '@jperez' },
    { id: 2, firstName: 'María', lastName: 'García', username: '@mgarcia' },
    { id: 3, firstName: 'Pedro', lastName: 'López', username: '@plopez' },
    { id: 4, firstName: 'Ana', lastName: 'Martínez', username: '@amartinez' },
    { id: 5, firstName: 'Luis', lastName: 'Sánchez', username: '@lsanchez' },
    { id: 6, firstName: 'Sofía', lastName: 'Ramírez', username: '@sramirez' },
    { id: 7, firstName: 'Carlos', lastName: 'Torres', username: '@ctorres' },
    { id: 8, firstName: 'Laura', lastName: 'Díaz', username: '@ldiaz' },
];

function Home() {
    const { t } = useTranslation();
    const { setLoading } = useContext(AppContext);

    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(5);
    const totalPages = Math.ceil(mockData.length / itemsPerPage);
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = mockData.slice(indexOfFirstItem, indexOfLastItem);
    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    const handleRefreshData = () => {
        setLoading(true);
        setTimeout(() => {
            setLoading(false);
        }, 1500);
    };

    return (
        <Box sx={{ p: 4 }}>
            <Typography variant="h4" component="h1" gutterBottom>
                {t('dashboard_stats')}
            </Typography>

            {/* Fila de estadísticas mejorada */}
            <Grid container spacing={4} sx={{ mb: 4 }}>
                <Grid item xs={12} sm={6} md={3}>
                    <Card variant="outlined">
                        <CardContent>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <Box>
                                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                                        {t('usuarios_activos')}
                                    </Typography>
                                    <Typography variant="h4" color="primary.main">
                                        2,548
                                    </Typography>
                                </Box>
                                <PeopleAltIcon sx={{ fontSize: 40, color: 'primary.main' }} />
                            </Box>
                            <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                                {t('en_la_ultima_semana')}
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <Card variant="outlined">
                        <CardContent>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <Box>
                                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                                        {t('ventas_mensuales')}
                                    </Typography>
                                    <Typography variant="h4" color="secondary.main">
                                        $12,456
                                    </Typography>
                                </Box>
                                <MonetizationOnIcon sx={{ fontSize: 40, color: 'secondary.main' }} />
                            </Box>
                            <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                                {t('comparado_con_el_mes_anterior')}
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <Card variant="outlined">
                        <CardContent>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <Box>
                                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                                        {t('tasas_de_conversion')}
                                    </Typography>
                                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                        <LinearProgress variant="determinate" value={75} sx={{ width: '100%', mr: 1, height: 8 }} />
                                        <Typography variant="body2" color="text.secondary">75%</Typography>
                                    </Box>
                                </Box>
                                <TimelineIcon sx={{ fontSize: 40, color: 'info.main' }} />
                            </Box>
                            <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                                {t('objetivo_80%')}
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <Card variant="outlined">
                        <CardContent>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <Box>
                                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                                        {t('estado_del_sistema')}
                                    </Typography>
                                    <Alert severity="success" sx={{ mt: 1 }}>
                                        {t('operativo')}
                                    </Alert>
                                </Box>
                                <VerifiedUserIcon sx={{ fontSize: 40, color: 'success.main' }} />
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {/* Sección de la tabla */}
            <Box sx={{ mt: 5 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                    <Typography variant="h5" component="h2">
                        {t('ejemplo_tabla')}
                    </Typography>
                    <Button
                        variant="outlined"
                        size="small"
                        sx={{ ml: 2 }}
                        onClick={handleRefreshData}
                        startIcon={<RefreshIcon />}
                    >
                        Recargar Datos
                    </Button>
                </Box>
                <Card variant="outlined">
                    <TableContainer component={Paper}>
                        <Table sx={{ minWidth: 650 }} aria-label="simple table">
                            <TableHead>
                                <TableRow>
                                    <TableCell>{t('id')}</TableCell>
                                    <TableCell>{t('nombre')}</TableCell>
                                    <TableCell>{t('apellido')}</TableCell>
                                    <TableCell>{t('usuario')}</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {currentItems.map((item) => (
                                    <TableRow key={item.id}>
                                        <TableCell component="th" scope="row">{item.id}</TableCell>
                                        <TableCell>{item.firstName}</TableCell>
                                        <TableCell>{item.lastName}</TableCell>
                                        <TableCell>{item.username}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Card>
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
                    <Pagination
                        count={totalPages}
                        page={currentPage}
                        onChange={(event, value) => paginate(value)}
                        color="primary"
                    />
                </Box>
            </Box>
        </Box>
    );
}

export default Home;
