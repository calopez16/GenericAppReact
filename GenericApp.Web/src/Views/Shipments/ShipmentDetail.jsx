import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Box,
    Paper,
    Typography,
    Button,
    Grid,
    Divider,
    CircularProgress,
    Chip,
    useTheme,
    useMediaQuery,
    IconButton,
    TextField,
    Avatar,
    Tooltip
} from '@mui/material';
import { ShowMessage } from '@helpers/NotificationService';

// Iconos
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import DescriptionIcon from '@mui/icons-material/Description';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import PlaceIcon from '@mui/icons-material/Place';
import ThermostatIcon from '@mui/icons-material/Thermostat';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import PersonIcon from '@mui/icons-material/Person';
import BusinessIcon from '@mui/icons-material/Business';
import ConfirmationNumberIcon from '@mui/icons-material/ConfirmationNumber';
import NotesIcon from '@mui/icons-material/Notes';
import PhoneIcon from '@mui/icons-material/Phone';
import InventoryIcon from '@mui/icons-material/Inventory';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import ReceiptIcon from '@mui/icons-material/Receipt';
import SensorsIcon from '@mui/icons-material/Sensors';
import FactCheckIcon from '@mui/icons-material/FactCheck';

import ConfirmationModal from '@layout/ConfirmationModal';

import { useTranslation } from 'react-i18next';
import { dataApiShipmentsService } from '@data/Shipments/Data';
import { DataAPIClientsService } from '@data/Clients/Data';
import { DataAPICitiesService } from '@data/Cities/Data';

const DetailItem = ({ label, value, icon }) => (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        <Typography
            variant="caption"
            color="text.secondary"
            sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 0.5,
                textTransform: 'uppercase',
                mb: 0.5
            }}
        >
            {icon && React.cloneElement(icon, { sx: { fontSize: 16 } })}
            {label}
        </Typography>
        <Typography
            variant="body1"
            color="text.primary"
            component="div"
            sx={{ fontWeight: 500, wordBreak: 'break-word' }}
        >
            {value !== null && value !== undefined && value !== '' ? value : '-'}
        </Typography>
    </Box>
);

const ShipmentDetail = () => {
    const { t } = useTranslation();
    const { id } = useParams();
    const navigate = useNavigate();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    const shipmentDataService = dataApiShipmentsService();
    const clientsService = DataAPIClientsService();
    const citiesService = DataAPICitiesService();

    const [shipment, setShipment] = useState(null);
    const [loading, setLoading] = useState(true);
    const [clientFullAddress, setClientFullAddress] = useState('');
    const [fetchedClient, setFetchedClient] = useState(null);
    const [closingTimeError, setClosingTimeError] = useState(false);

    const [isBitacoraModalOpen, setIsBitacoraModalOpen] = useState(false);
    const [closingTime, setClosingTime] = useState("");

    useEffect(() => {
        loadShipmentData();
    }, [id]);

    const loadShipmentData = async () => {
        try {
            setLoading(true);
            const response = await shipmentDataService.getDataById(id);
            if (response && response.data) {
                const data = response.data;
                setShipment(data);
                if (data.idClient) {
                    await fetchClientDetails(data.idClient);
                }
            }
        } catch (error) {
            console.error("Error loading shipment details", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchClientDetails = async (idClient) => {
        try {
            const clientRes = await clientsService.getDataById(idClient);
            if (clientRes && clientRes.data) {
                const client = clientRes.data;
                setFetchedClient(client);
                let fullAddress = client.address || '';
                if (client.idCity) {
                    try {
                        const cityRes = await citiesService.getDataById(client.idCity);
                        if (cityRes.success && cityRes.data) {
                            const c = cityRes.data;
                            const locationStr = `${c.description || ''}, ${c.idStateNavigation?.description || ''}, ${c.idStateNavigation?.idCountryNavigation?.description || ''}`;
                            fullAddress = `${fullAddress} - ${locationStr}`.trim();
                        }
                    } catch (cityError) {
                        console.error("Error fetching city details", cityError);
                    }
                }
                if (fullAddress.startsWith(' - ')) fullAddress = fullAddress.substring(3);
                setClientFullAddress(fullAddress);
            }
        } catch (error) {
            console.error("Error fetching client details", error);
        }
    };

    const formatTime12Hour = (timeValue) => {
        if (!timeValue) return '-';
        try {
            const today = new Date().toISOString().split('T')[0];
            const date = new Date(`${today}T${timeValue}`);
            if (!isNaN(date.getTime())) {
                return date.toLocaleTimeString('en-US', {
                    hour: 'numeric',
                    minute: '2-digit',
                    hour12: true
                });
            }
            return timeValue;
        } catch (error) {
            return timeValue;
        }
    };

    const handleExportManifest = async (shipment) => {
        try {
            setLoading(true);
            ShowMessage(`${t('exportingManifest')}...`, 'info');
            const response = await shipmentDataService.getManifestPdfById(shipment.idShipment);
            const fileData = response.data ? response.data : response;
            const blob = new Blob([fileData], { type: 'application/pdf' });
            const pdfUrl = window.URL.createObjectURL(blob);
            window.open(pdfUrl, '_blank');
        } catch (error) {
            ShowMessage(t('error'), 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleExportRemision = async (shipment) => {
        try {
            setLoading(true);
            ShowMessage(`${t('exportingRemision')}...`, 'info');
            const response = await shipmentDataService.getRemisionPdfById(shipment.idShipment);
            const fileData = response.data ? response.data : response;
            const blob = new Blob([fileData], { type: 'application/pdf' });
            const pdfUrl = window.URL.createObjectURL(blob);
            window.open(pdfUrl, '_blank');
        } catch (error) {
            ShowMessage(t('error'), 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleExportBitacora = async () => {
        if (!closingTime) {
            setClosingTimeError(true);
            return;
        }
        try {
            setLoading(true);
            ShowMessage(`${t('exportingBitacora')}...`, 'info');
            const response = await shipmentDataService.getBitacoraSellosPdfById(shipment.idShipment, closingTime);
            const fileData = response.data ? response.data : response;
            const blob = new Blob([fileData], { type: 'application/pdf' });
            const pdfUrl = window.URL.createObjectURL(blob);
            window.open(pdfUrl, '_blank');
            setIsBitacoraModalOpen(false);
            setClosingTime("");
            setClosingTimeError(false);
        } catch (error) {
            ShowMessage(t('error'), 'error');
        } finally {
            setLoading(false);
        }
    };

    const renderStamps = (stampsStr) => {
        if (!stampsStr) return '-';
        return stampsStr.split(/\r?\n/).map((line, i) => (
            <Box key={i} component="span" sx={{ display: 'block', mb: 0.5 }}>
                {line}
            </Box>
        ));
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
                <CircularProgress />
            </Box>
        );
    }

    if (!shipment) {
        return (
            <Box sx={{ p: 3 }}>
                <Typography variant="h6">{t('records_notFound')}</Typography>
                <Button variant="outlined" startIcon={<ArrowBackIcon />} onClick={() => navigate('/shipments')} sx={{ mt: 2 }}>
                    {t('back')}
                </Button>
            </Box>
        );
    }

    const getClientName = () => fetchedClient?.name || shipment.idClientNavigation?.name || shipment.idClient || '';
    const getRFC = () => fetchedClient?.rfc || shipment.rfc || shipment.idClientNavigation?.rfc;
    const getPhone = () => fetchedClient?.phone || shipment.phone || shipment.idClientNavigation?.phone;
    const getPostalCode = () => fetchedClient?.postalCode || shipment.postalCode || shipment.idClientNavigation?.postalCode;
    const getClientAddress = () => clientFullAddress || shipment.idClientNavigation?.address || shipment.address || '';
    const formatManifest = (id) => id ? id.toString().padStart(3, '0') : '-';
    const formatRemision = (id) => id ? id.toString().padStart(4, '0') : '-';

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column' }}>

            {/* ── HEADER estilo Index ── */}
            <Paper
                elevation={0}
                sx={{
                    p: 2,
                    mb: 3,
                    borderRadius: 2,
                    border: '1px solid',
                    borderColor: 'divider',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: 2,
                    flexWrap: 'wrap'
                }}
            >
                {/* Izquierda: avatar + título + descripción */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar sx={{ bgcolor: 'primary.light', color: 'white', width: 45, height: 45, borderRadius: 2 }}>
                        <LocalShippingIcon />
                    </Avatar>
                    <Box>
                        <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
                            {t('manifestDetail')} &nbsp;
                            <Box component="span" sx={{ color: 'primary.main' }}>
                                #{formatManifest(shipment.shipmentNo)}
                            </Box>
                        </Typography>
                       
                    </Box>
                </Box>

                {/* Derecha: chips de info + botón volver */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                    {shipment.idShipmentNavigation?.shipmentDate && (
                        <Chip
                            icon={<CalendarTodayIcon sx={{ fontSize: 15 }} />}
                            label={new Date(shipment.idShipmentNavigation.shipmentDate).toLocaleDateString()}
                            size="small"
                            variant="outlined"
                            sx={{ fontWeight: 600 }}
                        />
                    )}
                    {shipment.idDriverNavigation?.name && (
                        <Chip
                            icon={<PersonIcon sx={{ fontSize: 15 }} />}
                            label={shipment.idDriverNavigation.name}
                            size="small"
                            color="primary"
                            variant="outlined"
                            sx={{ fontWeight: 600, display: { xs: 'none', md: 'flex' } }}
                        />
                    )}
                    {/*<Tooltip title={t('back')}>*/}
                    {/*    <IconButton*/}
                    {/*        onClick={() => navigate('/shipments')}*/}
                    {/*        size="small"*/}
                    {/*        sx={{ color: 'white', bgcolor: 'primary.main', '&:hover': { bgcolor: 'primary.dark' }, p: 1 }}*/}
                    {/*    >*/}
                    {/*        <ArrowBackIcon fontSize="small" />*/}
                    {/*    </IconButton>*/}
                    {/*</Tooltip>*/}
                </Box>
            </Paper>

            <Paper sx={{ p: { xs: 2, md: 4 }, borderRadius: 2, flexGrow: 1, mb: 12 }} elevation={1}>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', mb: 3 }}>
                    {t('manifestInfo')}
                </Typography>

                <Grid container spacing={1}>
                    <Grid size={{ xs: 6, md: 2 }}>
                        <DetailItem
                            icon={<CalendarTodayIcon />}
                            label={t('shipmentDate')}
                            value={shipment.idShipmentNavigation?.shipmentDate ? new Date(shipment.idShipmentNavigation.shipmentDate).toLocaleDateString() : (shipment.shipmentDate ? new Date(shipment.shipmentDate).toLocaleDateString() : '-')}
                        />
                    </Grid>
                    <Grid size={{ xs: 6, md: 10 }}>
                        <DetailItem label={t('mixed')} value={shipment.mixed ? t('yes') : t('no')} />
                    </Grid>
                    <Grid size={{ xs: 12, xl: 5 }}>
                        <DetailItem icon={<BusinessIcon />} label={t('client')} value={getClientName()} />
                    </Grid>
                    <Grid size={{ xs: 4, md: 4, xl: 2 }}>
                        <DetailItem label={t('rfc')} value={getRFC()} />
                    </Grid>
                    <Grid size={{ xs: 4, md: 4, xl: 2 }}>
                        <DetailItem label={t('postalCode')} value={getPostalCode()} />
                    </Grid>
                    <Grid size={{ xs: 4, md: 4, xl: 2 }}>
                        <DetailItem icon={<PhoneIcon />} label={t('phone')} value={getPhone()} />
                    </Grid>
                    <Grid size={{ xs: 12, xl: 6 }}>
                        <DetailItem icon={<PlaceIcon />} label={t('address')} value={getClientAddress()} />
                    </Grid>
                </Grid>

                <Divider sx={{ my: 4 }} />

                {shipment.manifests && shipment.manifests.map((manifest, index) => {
                    const activePallets = manifest.manifestPallets?.filter(p => !p.isDeleted) || [];
                    const totalPallets = activePallets.length;
                    const grandTotalBoxes = activePallets.reduce((acc, pallet) => {
                        const palletSum = pallet.manifestPalletLoadings?.reduce((sum, load) => sum + (Number(load.boxQuantity) || 0), 0) || 0;
                        return acc + palletSum;
                    }, 0);

                    return (
                        <Box key={manifest.idManifest || index} sx={{ mb: 12 }}>
                            <Box sx={{ mb: 3 }}>
                                <Typography variant="h6" fontWeight="bold">
                                    {t('remision')} #{formatRemision(shipment.shipmentNo)}
                                </Typography>
                            </Box>

                            <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold', mb: 2, textDecoration: 'underline', textDecorationColor: theme.palette.divider }}>
                                {t('remisionInfo')}
                            </Typography>

                            <Grid container spacing={3} sx={{ mb: 4 }}>
                                <Grid size={{ xs: 3, md: 4, xl: 2 }}>
                                    <DetailItem label={t('Season')} value={manifest.seasonYear} />
                                </Grid>
                                <Grid size={{ xs: 5, md: 4, xl: 2 }}>
                                    <DetailItem label={t('RegFdaNo')} value={shipment.idCompanyNavigation?.regFdaNo || manifest.regFdaNo} />
                                </Grid>
                                <Grid size={{ xs: 4, md: 4, xl: 2 }}>
                                    <DetailItem label={t('Empaque')} value={shipment.idCompanyNavigation?.empaque || manifest.empaque} />
                                </Grid>
                                <Grid size={{ xs: 12, md: 4, xl: 2 }}>
                                    <DetailItem icon={<LocalShippingIcon />} label={t('shippingCompany')} value={manifest.idShippingCompanyNavigation?.name || manifest.idShippingCompanyNavigation?.description} />
                                </Grid>
                                <Grid size={{ xs: 4, md: 4, xl: 2 }}>
                                    <DetailItem icon={<PersonIcon />} label={t('driver')} value={manifest.idDriverNavigation?.name} />
                                </Grid>
                                <Grid size={{ xs: 4, md: 4, xl: 2 }}>
                                    <DetailItem label={`${t('trailerBoxType')}`} value={`${manifest.idTrailerBoxTypeNavigation.description}`} />
                                </Grid>
                                <Grid size={{ xs: 4, md: 4, xl: 2 }}>
                                    <DetailItem label={t('trailerPlateEconomicNo')} value={manifest.trailerPlateEconomicNumber} />
                                </Grid>
                                <Grid size={{ xs: 4, md: 4, xl: 2 }}>
                                    <DetailItem label={t('trailerPlate')} value={manifest.trailerPlate} />
                                </Grid>
                                <Grid size={{ xs: 4, md: 4, xl: 2 }}>
                                    <DetailItem label={t('exitTime')} value={formatTime12Hour(manifest.exitDate)} />
                                </Grid>
                                <Grid size={{ xs: 4, md: 4, xl: 2 }}>
                                    <DetailItem label={t('boxPlateEconomicNo')} value={manifest.trailerBoxPlateEconomicNumber} />
                                </Grid>
                                <Grid size={{ xs: 4, md: 4, xl: 2 }}>
                                    <DetailItem label={t('boxPlate')} value={manifest.trailerBoxPlate} />
                                </Grid>
                                <Grid size={{ xs: 4, md: 4, xl: 2 }}>
                                    <DetailItem icon={<ThermostatIcon />} label={`${t('temperatureF')}`} value={`${manifest.temperatureTrailerBoxF} ${t('temperatureSignF')}`} />
                                </Grid>
                            </Grid>

                            <Box sx={{ mt: 3 }}>
                                <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold', mb: 2 }}>
                                    {t('shipload')} ({t('pallets')})
                                </Typography>

                                <Grid container spacing={2}>
                                    {activePallets
                                        .sort((a, b) => a.position - b.position)
                                        .map((pallet, pIndex) => (
                                            <Grid item size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={pIndex}>
                                                <Paper variant="outlined" sx={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden', borderColor: 'rgba(0, 0, 0, 0.12)' }}>
                                                    <Box sx={{ p: 1.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: `1px solid ${theme.palette.divider}` }}>
                                                        <Typography variant="subtitle2" fontWeight="bold" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                            <InventoryIcon fontSize="small" color="action" />
                                                            {t('position')} {pallet.position}
                                                        </Typography>
                                                        {pallet.chismografo && (

                                                            <Tooltip title={t('chismografo')} arrow>
                                                                <SensorsIcon color="primary" sx={{ fontSize: 20, animation: 'pulse 2s infinite ease-in-out', '@keyframes pulse': { '0%': { opacity: 1 }, '50%': { opacity: 0.4 }, '100%': { opacity: 1 } } }} />
                                                            </Tooltip>
                                                        )}
                                                        <Chip
                                                            icon={<ThermostatIcon style={{ fontSize: '16px' }} />}
                                                            label={pallet.temperatureF ? `${pallet.temperatureF} ${t('temperatureSignF')}` : '-'}
                                                            size="small"
                                                            color="primary"
                                                            variant="outlined"
                                                            sx={{
                                                                fontWeight: 'bold',
                                                                height: '24px',
                                                                '& .MuiChip-label': { px: 1 }
                                                            }}
                                                        />
                                                    </Box>


                                                    <Box sx={{ p: 2, flexGrow: 1 }}>
                                                        {pallet.manifestPalletLoadings?.length > 0 ? (
                                                            pallet.manifestPalletLoadings.map((loading, lIndex) => (
                                                                <Box key={lIndex} sx={{ mb: lIndex < pallet.manifestPalletLoadings.length - 1 ? 2 : 0 }}>
                                                                    <Typography variant="body2" fontWeight="bold" gutterBottom>{loading.idLabelTypeNavigation?.description || t('noDescription')} {loading.description} {loading.idLabelTypeNavigation?.size} ({loading.boxQuantity})</Typography>
                                                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
                                                                        <Typography variant="caption" color="text.secondary">
                                                                            
                                                                        </Typography>
                                                                        <Chip label={`${t('total')}: ${loading.boxQuantity || 0} ${t('boxes')}`} size="small" variant="outlined" />
                                                                    </Box>
                                                                    {lIndex < pallet.manifestPalletLoadings.length - 1 && <Divider sx={{ my: 1.5, borderStyle: 'dashed' }} />}
                                                                </Box>
                                                            ))
                                                        ) : (
                                                            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', minHeight: 60 }}>
                                                                <Typography variant="body2" color="text.secondary" fontStyle="italic">{t('emptyPallet')}</Typography>
                                                            </Box>
                                                        )}
                                                    </Box>
                                                </Paper>
                                            </Grid>
                                        ))}

                                    {activePallets.length === 0 && (
                                        <Grid size={{ xs: 12 }}>
                                            <Paper variant="outlined" sx={{ p: 3, textAlign: 'center', borderStyle: 'dashed' }}>
                                                <Typography variant="body1" color="text.secondary">{t('noPalletsLoaded')}</Typography>
                                            </Paper>
                                        </Grid>
                                    )}

                                    {/* SECCIÓN DE TOTALES CALCULADOS */}
                                    <Grid size={{ xs: 12 }}>
                                        <Paper sx={{ p: 2, mt: 2, display: 'flex', justifyContent: 'space-around', alignItems: 'center', border: '1px solid #333' }}>
                                            <Box sx={{ textAlign: 'center' }}>
                                                <Typography variant="caption" color="gray">{t('totalBultos')}</Typography>
                                                <Typography variant="h5" color="primary" sx={{ fontWeight: 'bold' }}>{grandTotalBoxes.toLocaleString()} {t('boxes')}</Typography>
                                            </Box>
                                            <Divider orientation="vertical" flexItem />
                                            <Box sx={{ textAlign: 'center' }}>
                                                <Typography variant="caption" color="gray">{t('pallets')}</Typography>
                                                <Typography variant="h5" sx={{ fontWeight: 'bold' }}>{totalPallets} / 26</Typography>
                                            </Box>
                                        </Paper>
                                    </Grid>
                                </Grid>
                            </Box>
                            <Divider sx={{ my: 4 }} />

                            <Box sx={{ mt: 4 }}>
                                <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold', mb: 2, textDecoration: 'underline', textDecorationColor: theme.palette.divider }}>
                                    {t('tracking')}
                                </Typography>
                                <Grid container spacing={3}>
                                    <Grid size={{ xs: 12, md: 4, xl: 2 }}>
                                        <DetailItem icon={<ConfirmationNumberIcon />} label={t('trackingCode')} value={manifest.trackingCode} />
                                    </Grid>
                                    <Grid size={{ xs: 12, md: 4, xl: 2 }}>
                                        <DetailItem label={t('chismografo')} value={manifest.chismografo} />
                                    </Grid>
                                    <Grid size={{ xs: 12, md: 4, xl: 2 }}>
                                        <DetailItem label={t('gnnNumber')} value={manifest.gnnNumber} />
                                    </Grid>
                                    <Grid size={{ xs: 12, md: 4, xl: 2 }}>
                                        <DetailItem label={t('stamps')} value={renderStamps(manifest.stamps)} />
                                    </Grid>
                                    <Grid size={{ xs: 12 }}>
                                        <DetailItem icon={<NotesIcon />} label={t('comments')} value={manifest.comments} />
                                    </Grid>
                                </Grid>
                            </Box>
                            {index < shipment.manifests.length - 1 && <Divider sx={{ my: 5 }} />}
                        </Box>
                    );
                })}
            </Paper>

            <Paper elevation={4} sx={{ position: 'fixed', bottom: 0, left: 0, right: 0, p: 2, backgroundColor: theme.palette.background.paper, borderTop: `1px solid ${theme.palette.divider}`, display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 2, zIndex: 1100, flexWrap: 'wrap' }}>
                <Button variant="contained" color="inherit" startIcon={<ArrowBackIcon />} onClick={() => navigate('/shipments')} sx={{ px: 4, minWidth: 150 }}>
                    {t('back')}
                </Button>
                <Button variant="contained" color="primary" startIcon={<FactCheckIcon />} onClick={() => setIsBitacoraModalOpen(true)}>
                    {t('generateBitacora')}
                </Button>
                <Button variant="contained" color="primary" startIcon={<DescriptionIcon />} onClick={() => handleExportManifest(shipment)} sx={{ minWidth: 120 }}>
                    {t('generateManifest')}
                </Button>
                <Button variant="contained" color="success" startIcon={<ReceiptIcon />} onClick={() => handleExportRemision(shipment)} sx={{ minWidth: 120 }}>
                    {t('generateRemision')}
                </Button>               
            </Paper>

            <ConfirmationModal
                open={isBitacoraModalOpen}
                onClose={() => {
                    setIsBitacoraModalOpen(false);
                    setClosingTimeError(false); // Limpiar error al cerrar
                }}
                onConfirm={handleExportBitacora}
                title={t('generateBitacora')}
                message={
                    <Box sx={{ mt: 2 }}>
                        <Typography variant="body2" sx={{ mb: 2 }}>
                            {t('enterClosingTimeBitacora')}
                        </Typography>
                        <TextField
                            fullWidth
                            label={t('closingTime')}
                            type="time"
                            value={closingTime}
                            error={closingTimeError} // Activa el borde rojo
                            helperText={closingTimeError ? t('field_required') : ''} // Texto descriptivo en rojo
                            onChange={(e) => {
                                setClosingTime(e.target.value);
                                if (e.target.value) setClosingTimeError(false); // Quita el rojo al escribir
                            }}
                            InputLabelProps={{ shrink: true }}
                            inputProps={{ step: 300 }}
                        />
                    </Box>
                }
                confirmText={t('generate')}
            />
        </Box>
    );
};

export default ShipmentDetail;