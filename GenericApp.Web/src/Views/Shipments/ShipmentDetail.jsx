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
    IconButton
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

import { useTranslation } from 'react-i18next';
import { dataApiShipmentsService } from '@data/Shipments/Data';
import { DataAPIClientsService } from '@data/Clients/Data';
import { DataAPICitiesService } from '@data/Cities/Data';
import { grey } from '@mui/material/colors';

// Componente simple para mostrar Etiqueta y Valor
// Nota: Agregué component="div" al Typography del valor para permitir bloques internos (saltos de linea)
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

    // Servicios
    const shipmentDataService = dataApiShipmentsService();
    const clientsService = DataAPIClientsService();
    const citiesService = DataAPICitiesService();

    const [shipment, setShipment] = useState(null);
    const [loading, setLoading] = useState(true);

    // Estados para guardar la info extendida del cliente
    const [clientFullAddress, setClientFullAddress] = useState('');
    const [fetchedClient, setFetchedClient] = useState(null);

    // Estado para controlar la visibilidad de la sección de rastreo por cada manifiesto
    // Objeto donde key = index del manifiesto, value = boolean (true=visible)
    const [trackingVisibility, setTrackingVisibility] = useState({});

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

                // Lógica traída de AddOrEdit para obtener info completa del cliente
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

    // --- Helpers de Formato ---
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

    // Helper para alternar visibilidad de rastreo
    const toggleTracking = (index) => {
        setTrackingVisibility(prev => ({
            ...prev,
            [index]: !prev[index]
        }));
    };

    const handleExportManifest = async (shipment) => {
        try {
            setLoading(true);
            ShowMessage(t('exporting_manifest'), 'info');
            // 1. Llamada al servicio
            // Asumimos que getManifestPdfById está configurado en axios con responseType: 'blob' o 'arraybuffer'
            const response = await shipmentDataService.getManifestPdfById(shipment.idShipment);

            // 2. Validar y Crear el Blob
            // Algunos servicios devuelven el archivo en 'response.data', otros directamente en 'response'.
            // Ajusta esto según tu configuración de Axios.
            const fileData = response.data ? response.data : response;

            const blob = new Blob([fileData], { type: 'application/pdf' });

            // 3. Crear URL temporal y abrir en nueva pestaña
            const pdfUrl = window.URL.createObjectURL(blob);
            window.open(pdfUrl, '_blank');

        } catch (error) {
            console.error("Error exportando manifiesto:", error);
            ShowMessage(t('error_fetching_data'), 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleExportRemision = async (shipment) => {
        try {
            setLoading(true);
            ShowMessage(t('exporting_manifest'), 'info');
            // 1. Llamada al servicio
            // Asumimos que getManifestPdfById está configurado en axios con responseType: 'blob' o 'arraybuffer'
            const response = await shipmentDataService.getRemisionPdfById(shipment.idShipment);

            // 2. Validar y Crear el Blob
            // Algunos servicios devuelven el archivo en 'response.data', otros directamente en 'response'.
            // Ajusta esto según tu configuración de Axios.
            const fileData = response.data ? response.data : response;

            const blob = new Blob([fileData], { type: 'application/pdf' });

            // 3. Crear URL temporal y abrir en nueva pestaña
            const pdfUrl = window.URL.createObjectURL(blob);
            window.open(pdfUrl, '_blank');

        } catch (error) {
            console.error("Error exportando manifiesto:", error);
            ShowMessage(t('error_fetching_data'), 'error');
        } finally {
            setLoading(false);
        }
    };

    // Helper para renderizar los stamps con saltos de línea
    const renderStamps = (stampsStr) => {
        if (!stampsStr) return '-';
        // Dividimos por saltos de linea y mapeamos
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

    // --- Helpers para la vista ---
    const getClientName = () => {
        if (fetchedClient) return fetchedClient.name;
        return shipment.idClientNavigation?.name || shipment.idClient || '';
    };

    const getRFC = () => {
        if (fetchedClient) return fetchedClient.rfc;
        return shipment.rfc || shipment.idClientNavigation?.rfc;
    };

    const getPhone = () => {
        if (fetchedClient) return fetchedClient.phone;
        return shipment.phone || shipment.idClientNavigation?.phone;
    };

    const getPostalCode = () => {
        if (fetchedClient) return fetchedClient.postalCode;
        return shipment.postalCode || shipment.idClientNavigation?.postalCode;
    };

    const getClientAddress = () => {
        if (clientFullAddress) return clientFullAddress;
        if (shipment.idClientNavigation) {
            return shipment.idClientNavigation.address || shipment.address || '';
        }
        return shipment.address || '';
    };

    return (
        <Box sx={{ p: { xs: 0, md: 3 }, display: 'flex', flexDirection: 'column', minHeight: '100vh', pb: 10 }}>

            {/* --- CABECERA SUPERIOR --- */}
            <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                    <Typography variant={isMobile ? "h5" : "h4"} sx={{ display: 'flex', alignItems: 'center', gap: 2, fontWeight: 'bold' }}>
                        <DescriptionIcon fontSize="inherit" />
                        {t('Shipment Details')} #{shipment.idShipment}
                    </Typography>
                </Box>

                {/*<Button*/}
                {/*    variant="outlined"*/}
                {/*    color="inherit"*/}
                {/*    startIcon={<ArrowBackIcon />}*/}
                {/*    onClick={() => navigate('/shipments')}*/}
                {/*    sx={{ display: { xs: 'none', md: 'flex' } }}*/}
                {/*>*/}
                {/*    {t('back')}*/}
                {/*</Button>*/}
            </Box>

            <Paper sx={{ p: { xs: 2, md: 4 }, borderRadius: 2, flexGrow: 1 }} elevation={1}>

                {/* --- SECCIÓN 1: DATOS GENERALES --- */}
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', mb: 3 }}>
                    {t('General Shipment Data')}
                </Typography>

                <Grid container spacing={1}>
                    <Grid size={{ xs: 6, md: 2 }}>
                        <DetailItem
                            icon={<CalendarTodayIcon />}
                            label={t('Shipment Date')}
                            value={shipment.idShipmentNavigation?.shipmentDate ? new Date(shipment.idShipmentNavigation.shipmentDate).toLocaleDateString() : (shipment.shipmentDate ? new Date(shipment.shipmentDate).toLocaleDateString() : '-')}
                        />
                    </Grid>

                    <Grid size={{ xs: 6, md: 10 }}>
                        <DetailItem label={t('Mixed')} value={shipment.mixed ? t('Yes') : t('No')} />
                    </Grid>

                    <Grid size={{ xs: 12, xl: 5 }}>
                        <DetailItem
                            icon={<BusinessIcon />}
                            label={t('Client')}
                            value={getClientName()}
                        />
                    </Grid>
                    <Grid size={{ xs: 4, md: 4, xl: 2 }}>
                        <DetailItem label={t('RFC')} value={getRFC()} />
                    </Grid>
                    <Grid size={{ xs: 4, md: 4, xl: 2 }}>
                        <DetailItem label={t('Postal Code')} value={getPostalCode()} />
                    </Grid>
                    <Grid size={{ xs: 4, md: 4, xl: 2 }}>
                        <DetailItem
                            icon={<PhoneIcon />}
                            label={t('Phone')}
                            value={getPhone()}
                        />
                    </Grid>
                    <Grid size={{ xs: 12, xl: 6 }}>
                        <DetailItem
                            icon={<PlaceIcon />}
                            label={t('Address')}
                            value={getClientAddress()}
                        />
                    </Grid>
                    <Grid size={{ xs: 12 }}>
                        <DetailItem
                            icon={<NotesIcon />}
                            label={t('General Comments')}
                            value={shipment.comments}
                        />
                    </Grid>
                </Grid>

                <Divider sx={{ my: 4 }} />

                {/* --- ITERACIÓN DE MANIFIESTOS --- */}
                {shipment.manifests && shipment.manifests.map((manifest, index) => (
                    <Box key={manifest.idManifest || index} sx={{ mb: 12 }}>

                        {/* Header simple del Manifiesto */}
                        <Box sx={{ mb: 3 }}>
                            <Typography variant="h6" fontWeight="bold">
                                {t('Manifest')} #{manifest.idManifest || (index + 1)}
                            </Typography>
                        </Box>

                        {/* --- SECCIÓN 2: LOGÍSTICA --- */}
                        <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold', mb: 2, textDecoration: 'underline', textDecorationColor: theme.palette.divider }}>
                            {t('Logistics')}
                        </Typography>

                        <Grid container spacing={3} sx={{ mb: 4 }}>
                            <Grid size={{ xs: 3, md: 4, xl: 2 }}>
                                <DetailItem label={t('Season')} value={manifest.seasonYear} />
                            </Grid>
                            <Grid size={{ xs: 5, md: 4, xl: 2 }}>
                                <DetailItem label={t('RegFdaNo')} value={manifest.regFdaNo} />
                            </Grid>
                            <Grid size={{ xs: 4, md: 4, xl: 2 }}>
                                <DetailItem label={t('Empaque')} value={manifest.empaque} />
                            </Grid>
                            <Grid size={{ xs: 12, md: 4, xl: 2 }}>
                                <DetailItem
                                    icon={<LocalShippingIcon />}
                                    label={t('Shipping Company')}
                                    value={manifest.idShippingCompanyNavigation?.name || manifest.idShippingCompanyNavigation?.description}
                                />
                            </Grid>

                            <Grid size={{ xs: 4, md: 4, xl: 2 }}>
                                <DetailItem
                                    icon={<PersonIcon />}
                                    label={t('Driver')}
                                    value={manifest.idDriverNavigation?.name}
                                />
                            </Grid>
                            <Grid size={{ xs: 4, md: 4, xl: 2 }}>
                                <DetailItem label={t('Trailer Plate')} value={manifest.trailerPlate} />
                            </Grid>
                            <Grid size={{ xs: 4, md: 4, xl: 2 }}>
                                <DetailItem
                                    label={t('Exit Time')}
                                    value={formatTime12Hour(manifest.exitDate)}
                                />
                            </Grid>

                            <Grid size={{ xs: 4, md: 4, xl: 2 }}>
                                <DetailItem label={t('Box Plate')} value={manifest.trailerBoxPlate} />
                            </Grid>
                            <Grid size={{ xs: 4, md: 4, xl: 2 }}>
                                <DetailItem
                                    icon={<ThermostatIcon />}
                                    label={`${t('Temp')} °F`}
                                    value={manifest.temperatureTrailerBoxF}
                                />
                            </Grid>
                        </Grid>

                        {/* --- SECCIÓN 4: CARGO DETAILS (PALLETS COMO CAJAS/CARDS) --- */}
                        <Box sx={{ mt: 3 }}>
                            <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold', mb: 2 }}>
                                {t('Cargo Details')} (Pallets)
                            </Typography>

                            <Grid container spacing={2}>
                                {manifest.manifestPallets && manifest.manifestPallets
                                    .filter(p => !p.isDeleted)
                                    .sort((a, b) => a.position - b.position)
                                    .map((pallet, pIndex) => (
                                        <Grid item size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={pIndex}>
                                            <Paper
                                                variant="outlined"
                                                sx={{
                                                    height: '100%',
                                                    display: 'flex',
                                                    flexDirection: 'column',
                                                    overflow: 'hidden',
                                                    borderColor: 'rgba(0, 0, 0, 0.12)'
                                                }}
                                            >
                                                <Box sx={{
                                                    p: 1.5,
                                                    display: 'flex',
                                                    justifyContent: 'space-between',
                                                    alignItems: 'center',
                                                    borderBottom: `1px solid ${theme.palette.divider}`
                                                }}>
                                                    <Typography variant="subtitle2" fontWeight="bold" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                        <InventoryIcon fontSize="small" color="action" />
                                                        {t('Position')} {pallet.position}
                                                    </Typography>
                                                </Box>

                                                <Box sx={{ p: 2, flexGrow: 1 }}>
                                                    {pallet.manifestPalletLoadings && pallet.manifestPalletLoadings.length > 0 ? (
                                                        pallet.manifestPalletLoadings.map((loading, lIndex) => (
                                                            <Box key={lIndex} sx={{ mb: lIndex < pallet.manifestPalletLoadings.length - 1 ? 2 : 0 }}>
                                                                <Typography variant="body2" fontWeight="bold" gutterBottom>
                                                                    {loading.description || t('No Description')}
                                                                </Typography>

                                                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
                                                                    <Chip
                                                                        label={`${t('Box')}: ${loading.boxQuantity || 0}`}
                                                                        size="small"
                                                                        variant="outlined"
                                                                    />
                                                                    <Typography variant="caption" color="text.secondary">
                                                                        {loading.idLabelType ? `Type: ${loading.idLabelTypeNavigation?.description || loading.idLabelType}` : '-'}
                                                                    </Typography>
                                                                </Box>

                                                                {lIndex < pallet.manifestPalletLoadings.length - 1 && (
                                                                    <Divider sx={{ my: 1.5, borderStyle: 'dashed' }} />
                                                                )}
                                                            </Box>
                                                        ))
                                                    ) : (
                                                        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', minHeight: 60 }}>
                                                            <Typography variant="body2" color="text.secondary" fontStyle="italic">
                                                                {t('Empty Pallet')}
                                                            </Typography>
                                                        </Box>
                                                    )}
                                                </Box>
                                            </Paper>
                                        </Grid>
                                    ))}

                                {(!manifest.manifestPallets || manifest.manifestPallets.filter(p => !p.isDeleted).length === 0) && (
                                    <Grid size={{ xs: 12 }}>
                                        <Paper variant="outlined" sx={{ p: 3, textAlign: 'center', borderStyle: 'dashed' }}>
                                            <Typography variant="body1" color="text.secondary">
                                                {t('No pallets in this manifest')}
                                            </Typography>
                                        </Paper>
                                    </Grid>
                                )}
                            </Grid>
                        </Box>

                        <Box sx={{ mt: 4 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                                <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold', mb: 0, textDecoration: 'underline', textDecorationColor: theme.palette.divider }}>
                                    {t('Rastreo')}
                                </Typography>
                                {/* Botón para ver detalle */}
                                {/*<Button*/}
                                {/*    size="small"*/}
                                {/*    variant="text"*/}
                                {/*    color="primary"*/}
                                {/*    startIcon={trackingVisibility[index] ? <VisibilityOffIcon /> : <VisibilityIcon />}*/}
                                {/*    onClick={() => toggleTracking(index)}*/}
                                {/*    sx={{ textTransform: 'none', fontWeight: 'bold' }}*/}
                                {/*>*/}
                                {/*    {trackingVisibility[index] ? t('Ocultar detalle') : t('Ver detalle')}*/}
                                {/*</Button>*/}
                            </Box>

                            {/* Contenido condicional */}
                            {/*{trackingVisibility[index] && (*/}
                                <Grid container spacing={3}>
                                    <Grid size={{ xs: 12, md: 4, xl: 2 }}>
                                        <DetailItem
                                            icon={<ConfirmationNumberIcon />}
                                            label={t('CodigodeRastreo')}
                                            value={manifest.trackingCode}
                                        />
                                    </Grid>
                                    <Grid size={{ xs: 12, md: 4, xl: 2 }}>
                                        <DetailItem label={t('chismografo')} value={manifest.chismografo} />
                                    </Grid>
                                    <Grid size={{ xs: 12, md: 4, xl: 2 }}>
                                        <DetailItem label={t('GnnNumber')} value={manifest.gnnNumber} />
                                    </Grid>
                                    <Grid size={{ xs: 12, md: 4, xl: 2 }}>
                                        {/* AQUI SE USAN LOS STAMPS SEPARADOS */}
                                        <DetailItem
                                            label={t('Sellos')}
                                            value={renderStamps(manifest.stamps)}
                                        />
                                    </Grid>
                                </Grid>
                            {/*)}*/}
                        </Box>

                        {/* Separador entre manifiestos */}
                        {index < shipment.manifests.length - 1 && <Divider sx={{ my: 5 }} />}

                    </Box>
                ))}

            </Paper>

            {/* --- FOOTER: ACCIONES Y NAVEGACIÓN --- */}
            <Paper
                elevation={3}
                sx={{
                    position: 'sticky',
                    bottom: 0,
                    p: 2,
                    mt: 3,
                    backgroundColor: theme.palette.background.paper,
                    borderTop: `1px solid ${theme.palette.divider}`,
                    display: 'flex',
                    justifyContent: 'flex-end', // Alinea todo a la derecha
                    alignItems: 'center',
                    gap: 2, // Espacio entre los botones
                    zIndex: 10,
                    flexWrap: 'wrap' // Para que se ajusten en móviles si no caben
                }}
            >
                {/* Botón Imprimir Manifiesto (Color Secondary) */}
                <Button
                    variant="contained"
                    color="secondary"
                    startIcon={<DescriptionIcon />}
                    onClick={() => handleExportManifest(shipment)}
                    sx={{ minWidth: 120 }}
                >
                    {t('Manifiesto')}
                </Button>

                {/* Botón Imprimir Remisión (Color Success) */}
                <Button
                    variant="contained"
                    color="success"
                    startIcon={<ReceiptIcon />}
                    onClick={() => handleExportRemision(shipment)}
                    sx={{ minWidth: 120 }}
                >
                    {t('Remisión')}
                </Button>

                {/* Botón Regresar (Existente) */}
                <Button
                    variant="contained"
                    color="inherit"
                    size="large"
                    startIcon={<ArrowBackIcon />}
                    onClick={() => navigate('/shipments')}
                    sx={{ px: 4, minWidth: 150 }}
                >
                    {t('back')}
                </Button>
            </Paper>
        </Box>
    );
};

export default ShipmentDetail;