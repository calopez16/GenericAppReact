import React, { useContext, useEffect, useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { AppContext } from '@helpers/AppContext';
import AppLogoImage from '@images/logo.png'
import { API_BASE_URL } from '@config';
import { DataAPIDashboardService } from '@data/Dashboard/Data';

// Importaciones de MUI
import {
    Container, Typography, Box, Paper, Avatar, Skeleton
} from '@mui/material';
import Grid from '@mui/material/Grid';

// Importación de MUI X Charts
import { LineChart } from '@mui/x-charts/LineChart';

// Importaciones de Iconos
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import InventoryIcon from '@mui/icons-material/Inventory';
import AcUnitIcon from '@mui/icons-material/AcUnit';
import EventNoteIcon from '@mui/icons-material/EventNote';

const DashboardPage = () => {
    const { t } = useTranslation();
    const { userName = 'Usuario', companySelected } = useContext(AppContext);
    const dashboardService = DataAPIDashboardService();
    const lastLoadedCompanyId = useRef(null);

    // Estados
    const [tempData, setTempData] = useState({ value: `0 °F`, trend: '...', loading: true });
    const [cajasSemana, setCajasSemana] = useState({ value: '0', trend: '...', loading: true });
    const [ultimoViaje, setUltimoViaje] = useState({ value: `0 ${t('dashboard.units.boxes')}`, trend: '---', loading: true });
    const [embarquesTemp, setEmbarquesTemp] = useState({ value: '0', trend: '---', loading: true });
    const [chartData, setChartData] = useState({ months: [], shipments: [], loading: true });

    const hasCompany = companySelected && companySelected.idCompany > 0;

    // Array de meses traducidos para fallback
    const fallbackMonths = [
        t('months.jan'), t('months.feb'), t('months.mar'), t('months.apr'),
        t('months.may'), t('months.jun'), t('months.jul'), t('months.aug'),
        t('months.sep'), t('months.oct'), t('months.nov'), t('months.dec')
    ];

    useEffect(() => {
        if (!hasCompany || lastLoadedCompanyId.current === companySelected.idCompany) return;

        const id = companySelected.idCompany;
        lastLoadedCompanyId.current = id;

        setTempData(p => ({ ...p, loading: true }));
        setCajasSemana(p => ({ ...p, loading: true }));
        setUltimoViaje(p => ({ ...p, loading: true }));
        setEmbarquesTemp(p => ({ ...p, loading: true }));
        setChartData(p => ({ ...p, loading: true }));

        fetchEmbarquesTemporada(id);
        fetchCajasSemana(id);
        fetchUltimoViaje(id);
        fetchTemperaturaPromedio(id);
        fetchGraficaEmbarques(id);

    }, [companySelected, hasCompany]);

    const fetchGraficaEmbarques = async (id) => {
        try {
            const res = await dashboardService.getGraficaEmbarques(id);
            setChartData({
                months: res.data?.meses || fallbackMonths,
                shipments: res.data?.embarques || Array(12).fill(0),
                loading: false
            });
        } catch (e) {
            console.error("Error en fetchGraficaEmbarques:", e);
            setChartData({ months: fallbackMonths, shipments: Array(12).fill(0), loading: false });
        }
    };

    const fetchEmbarquesTemporada = async (id) => {
        try {
            const res = await dashboardService.getEmbarquesTemporada(id);
            setEmbarquesTemp({
                value: res.data?.totalEmbarques || '0',
                trend: res.data?.seasonYear || '---',
                loading: false
            });
        } catch (e) {
            console.error("Error en fetchEmbarquesTemporada:", e);
            setEmbarquesTemp({ value: '0', trend: t('dashboard.errors.data'), loading: false });
        }
    };

    const fetchCajasSemana = async (id) => {
        try {
            const res = await dashboardService.getTotalCajasSemana(id);
            setCajasSemana({
                value: (res.data?.totalCajas || 0).toLocaleString(),
                trend: `${res.data?.totalViajes || 0} ${t('dashboard.units.trips')}`,
                loading: false
            });
        } catch (e) {
            console.error("Error en fetchCajasSemana:", e);
            setCajasSemana({ value: '0', trend: `0 ${t('dashboard.units.trips')}`, loading: false });
        }
    };

    const fetchUltimoViaje = async (id) => {
        try {
            const res = await dashboardService.getUltimoViaje(id);
            const total = Number(res.data?.totalCajas) || 0;
            const formattedTotal = total.toLocaleString();
            setUltimoViaje({
                value: `${formattedTotal} ${t('dashboard.units.boxes')}`,
                trend: res.data?.numeroViaje ? `${t('dashboard.units.trip')} #${res.data.numeroViaje}` : '---',
                loading: false
            });
        } catch (e) {
            console.error("Error en fetchUltimoViaje:", e);
            setUltimoViaje({ value: `${(0).toLocaleString()} ${t('dashboard.units.boxes')}`, trend: '---', loading: false });
        }
    };

    const fetchTemperaturaPromedio = async (id) => {
        try {
            const res = await dashboardService.getTemperaturaPromedio(id);
            setTempData({
                value: `${res.data?.temperaturaPromedio || 0} °F`,
                trend: t('dashboard.trends.global_avg'),
                loading: false
            });
        } catch (e) {
            console.error("Error en fetchTemperaturaPromedio:", e);
            setTempData({ value: '0 °F', trend: t('dashboard.errors.data'), loading: false });
        }
    };

    const statCards = [
        { title: t('dashboard.cards.season_shipments'), data: embarquesTemp, icon: <EventNoteIcon color="primary" /> },
        { title: t('dashboard.cards.week_boxes'), data: cajasSemana, icon: <InventoryIcon color="success" /> },
        { title: t('dashboard.cards.last_trip'), data: ultimoViaje, icon: <LocalShippingIcon color="info" /> },
        { title: t('dashboard.cards.avg_temp'), data: tempData, icon: <AcUnitIcon color="warning" /> },
    ];

    const displayLogo = hasCompany ? `${API_BASE_URL}/img/logos/${companySelected.logoName}` : AppLogoImage;
    const displayName = hasCompany ? companySelected.name : t('app_name');

    return (
        <Container maxWidth="xl" sx={{ mt: 2, mb: 2 }}>
            <Paper elevation={3} sx={{ p: 2.5, borderRadius: 2, mb: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexDirection: { xs: 'column', md: 'row' } }}>
                    <Box sx={{ mb: { xs: 2, md: 0 } }}>
                        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                            {displayName} - {t('welcome_page_title')} {userName} 👋
                        </Typography>
                        <Typography variant="body1" color="text.secondary">{t('welcome_page_subtitle')}</Typography>
                    </Box>
                    <Avatar src={displayLogo} sx={{ width: 120, height: 120, border: '2px solid', borderColor: 'primary.main' }} />
                </Box>
            </Paper>

            <Grid container spacing={2} sx={{ mb: 2 }}>
                {statCards.map((card, index) => (
                    <Grid key={index} size={{ xs: 12, sm: 6, md: 3 }}>
                        <Paper sx={{ p: 3, borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '100%' }}>
                            <Box sx={{ width: '100%' }}>
                                <Typography variant="subtitle2" color="text.secondary">{card.title}</Typography>
                                {card.data.loading ? (
                                    <Box sx={{ mt: 1 }}>
                                        <Skeleton width="70%" height={30} />
                                        <Skeleton width="40%" height={20} />
                                    </Box>
                                ) : (
                                    <>
                                        <Typography variant="h5" sx={{ fontWeight: 'bold', my: 0.5 }}>{card.data.value}</Typography>
                                        <Typography variant="caption" sx={{ fontWeight: 'bold', color: 'text.secondary' }}>{card.data.trend}</Typography>
                                    </>
                                )}
                            </Box>
                            <Avatar sx={{ bgcolor: 'action.hover', width: 56, height: 56, ml: 1 }}>{card.icon}</Avatar>
                        </Paper>
                    </Grid>
                ))}
            </Grid>

            <Grid container spacing={1}>
                <Grid size={{ xs: 12 }}>
                    <Paper sx={{ p: 3, borderRadius: 2, height: '450px', display: 'flex', flexDirection: 'column' }}>
                        <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
                            {t('dashboard.charts.monthly_performance')} ({new Date().getFullYear()})
                        </Typography>

                        {chartData.loading ? (
                            <Skeleton variant="rectangular" width="100%" height="100%" sx={{ borderRadius: 2 }} />
                        ) : (
                            <Box sx={{ width: '100%', height: '100%', flexGrow: 1 }}>
                                <LineChart
                                    xAxis={[{
                                        data: chartData.months,
                                        scaleType: 'point',
                                        label: t('dashboard.charts.months_axis')
                                    }]}
                                    series={[
                                        {
                                            data: chartData.shipments,
                                            label: t('dashboard.charts.total_shipments'),
                                            color: '#1976d2',
                                            area: true,
                                            connectNulls: false,
                                        },
                                    ]}
                                    margin={{ left: -20, right: 15, top: 20, bottom: 60 }}
                                />
                            </Box>
                        )}
                    </Paper>
                </Grid>
            </Grid>
        </Container>
    );
};

export default DashboardPage;