import React, { useState, useEffect, useRef, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    TextField,
    Button,
    Box,
    Typography,
    Grid,
    FormControlLabel,
    Switch,
    Paper,
    CircularProgress,
    Divider,
    InputAdornment,
    Autocomplete,
    useTheme,
    useMediaQuery
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import CancelIcon from '@mui/icons-material/Clear';
import ThermostatIcon from '@mui/icons-material/Thermostat';
import { useTranslation } from 'react-i18next';
import { dataApiShipmentsService } from '@data/Shipments/Data';
import { DataAPICitiesService } from '@data/Cities/Data';
import { DataAPIClientsService } from '@data/Clients/Data';
import { DataAPIDriversService } from '@data/Drivers/Data';
import { DataAPIShippingCompaniesService } from '@data/ShippingCompanies/Data';

import { ShowMessage } from '@helpers/NotificationService';
import { AppContext } from '@helpers/AppContext';

import TrailerGrid from './TrailerGrid';
import PalletDetailModal from './PalletDetailModal';

const initialManifestStructure = {
    idManifest: 0,
    idShipment: 0,
    exitDate: new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
    temperatureTrailerBoxF: '',
    temperatureTrailerBoxC: '',
    seasonYear: new Date().getFullYear(),
    idDriver: '',
    trailerPlate: '',
    trailerBoxPlate: '',
    idShippingCompany: '',
    regFdaNo: '',
    empaque: '',
    idManifestStatus: 1,
    comments: '',
    chismografo: '',
    trackingCode: '',
    gnnNumber: '',
    stamps: '',
    idCompany: 0,
    manifestPallets: []
};

const initialFormData = {
    idShipment: 0,
    shipmentDate: new Date().toISOString().split('T')[0],
    seasonYear: new Date().getFullYear(),
    name: '',
    rfc: '',
    address: '',
    postalCode: '',
    phone: '',
    mixed: false,
    idClient: '',
    idCity: '',
    idShipmentStatus: 1,
    isActive: true,
    comments: '',
    idCompany: 0,
    manifests: [{ ...initialManifestStructure }]
};

function ShipmentAddOrEdit() {
    const { t } = useTranslation();
    const { id } = useParams();
    const navigate = useNavigate();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    const isEditing = id !== undefined;
    const shipmentDataService = dataApiShipmentsService();
    const citiesService = DataAPICitiesService();
    const clientsService = DataAPIClientsService();
    const driversService = DataAPIDriversService();
    const shippingCompaniesService = DataAPIShippingCompaniesService();
    const { companySelected } = useContext(AppContext);

    const [formData, setFormData] = useState(initialFormData);
    const [isLoading, setIsLoading] = useState(isEditing);
    const [activeTab, setActiveTab] = useState(0);
    const [clients, setClients] = useState([]);
    const [drivers, setDrivers] = useState([]);
    const [shippingCos, setShippingCos] = useState([]);

    // Estado para manejar los errores de validación
    const [errors, setErrors] = useState({});

    const fetchClients = async () => {
        const response = await clientsService.getDataPagination(1, 500, "", true);
        if (response.success) setClients(response.data.data || []);
    };

    const fetchDrivers = async () => {
        const response = await driversService.getDataPagination(1, 500, "", true);
        if (response.success) setDrivers(response.data.data || []);
    };

    const fetchShippingCompanies = async () => {
        const response = await shippingCompaniesService.getDataPagination(1, 500, "", true);
        if (response.success) setShippingCos(response.data.data || []);
    };

    useEffect(() => {
        if (companySelected && !isEditing) {
            setFormData(prev => ({
                ...prev,
                idCompany: companySelected.idCompany || 0,
                manifests: prev.manifests.map(m => ({
                    ...m,
                    regFdaNo: companySelected.regFdaNo || '',
                    empaque: companySelected.empaque || '',
                    gnnNumber: companySelected.gnnNumber || '',
                    idCompany: companySelected.idCompany || 0
                }))
            }));
        }
    }, [companySelected, isEditing]);

    useEffect(() => {
        fetchClients();
        fetchDrivers();
        fetchShippingCompanies();
    }, []);

    useEffect(() => {
        if (isEditing && clients.length > 0) {
            const fetchShipment = async () => {
                try {
                    const response = await shipmentDataService.getDataById(id);
                    if (response.data) {
                        let data = response.data;
                        if (data.shipmentDate) data.shipmentDate = data.shipmentDate.split('T')[0];
                        if (data.manifests) {
                            data.manifests = data.manifests.map(m => ({
                                ...m,
                                exitDate: m.exitDate?.includes('T') ? m.exitDate.split('T')[1].slice(0, 5) : m.exitDate
                            }));
                        }

                        const selectedClient = clients.find(c => c.idClient === parseInt(data.idClient));

                        if (selectedClient) {
                            data.rfc = selectedClient.rfc || '';
                            data.postalCode = selectedClient.postalCode || '';
                            data.phone = selectedClient.phone || '';

                            let fullAddress = selectedClient.address || '';

                            if (selectedClient.idCity) {
                                try {
                                    const cityRes = await citiesService.getDataById(selectedClient.idCity);
                                    if (cityRes.success && cityRes.data) {
                                        const c = cityRes.data;
                                        const locationStr = `${c.description || ''}, ${c.idStateNavigation?.description || ''}, ${c.idStateNavigation?.idCountryNavigation?.description || ''}, C.P. ${selectedClient.postalCode}`;
                                        fullAddress = `${fullAddress} - ${locationStr}`.trim();
                                    }
                                } catch (error) {
                                    console.error("Error fetching city details", error);
                                }
                            }
                            data.address = fullAddress;
                        }

                        setFormData(prev => ({ ...prev, ...data }));
                    }
                } catch (e) {
                    ShowMessage(t('error_fetching_details'), 'error');
                } finally {
                    setIsLoading(false);
                }
            };
            fetchShipment();
        }
    }, [id, isEditing, clients.length]);

    const handleGeneralChange = (e) => {
        const { name, value, checked, type } = e.target;

        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: false }));
        }

        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
        }));
    };

    const handleClientChange = async (event, newValue) => {
        if (errors.idClient && newValue) {
            setErrors(prev => ({ ...prev, idClient: false }));
        }

        if (newValue) {
            let fullAddress = newValue.address || '';
            if (newValue.idCity) {
                try {
                    const response = await citiesService.getDataById(newValue.idCity);
                    if (response.success && response.data) {
                        const c = response.data;
                        const locationStr = `${c.description || ''}, ${c.idStateNavigation?.description || ''}, ${c.idStateNavigation?.idCountryNavigation?.description || ''}, C.P. ${newValue.postalCode}`;
                        fullAddress = `${fullAddress} - ${locationStr}`.trim();
                    }
                } catch (error) {
                    console.error("Error fetching city details", error);
                }
            }
            setFormData(prev => ({
                ...prev,
                idClient: newValue.idClient,
                rfc: newValue.rfc || '',
                address: fullAddress,
                postalCode: newValue.postalCode || '',
                phone: newValue.phone || '',
                idCity: newValue.idCity || ''
            }));
        } else {
            setFormData(prev => ({ ...prev, idClient: '', rfc: '', address: '', postalCode: '', phone: '', idCity: '' }));
        }
    };

    const handleManifestChange = (e) => {
        const { name, value } = e.target;

        // Limpiar error si existe en el campo modificado
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: false }));
        }

        const newManifests = [...formData.manifests];
        let updatedManifest = { ...newManifests[activeTab], [name]: value };
        if (name === 'temperatureTrailerBoxF' && value !== '') {
            updatedManifest.temperatureTrailerBoxC = ((parseFloat(value) - 32) * 5 / 9).toFixed(2);
        } else if (name === 'temperatureTrailerBoxC' && value !== '') {
            updatedManifest.temperatureTrailerBoxF = ((parseFloat(value) * 9 / 5) + 32).toFixed(2);
        }
        newManifests[activeTab] = updatedManifest;
        setFormData(prev => ({ ...prev, manifests: newManifests }));
    };

    const handleDriverChange = (event, newValue) => {
        if (errors.idDriver && newValue) {
            setErrors(prev => ({ ...prev, idDriver: false }));
        }
        const newManifests = [...formData.manifests];
        newManifests[activeTab] = {
            ...newManifests[activeTab],
            idDriver: newValue ? newValue.idDriver : ''
        };
        setFormData(prev => ({ ...prev, manifests: newManifests }));
    };

    const handleShippingCompanyChange = (event, newValue) => {
        if (errors.idShippingCompany && newValue) {
            setErrors(prev => ({ ...prev, idShippingCompany: false }));
        }
        const newManifests = [...formData.manifests];
        newManifests[activeTab] = {
            ...newManifests[activeTab],
            idShippingCompany: newValue ? newValue.idShippingCompany : ''
        };
        setFormData(prev => ({ ...prev, manifests: newManifests }));
    };

    const handleSubmit = async () => {
        // Validación de campos requeridos
        const newErrors = {};
        const currentManifest = formData.manifests[activeTab];

        if (!formData.shipmentDate) newErrors.shipmentDate = true;
        if (!formData.idClient) newErrors.idClient = true;

        // Validar campos requeridos dentro del manifiesto actual
        if (!currentManifest.idShippingCompany) newErrors.idShippingCompany = true;
        if (!currentManifest.idDriver) newErrors.idDriver = true;
        if (!currentManifest.exitDate) newErrors.exitDate = true;
        // Nuevo campo requerido: Temperatura F
        if (!currentManifest.temperatureTrailerBoxF) newErrors.temperatureTrailerBoxF = true;

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            ShowMessage(t('campos_requeridos_incompletos'), 'error');
            return;
        }

        setIsLoading(true);
        try {
            const method = isEditing ? shipmentDataService.editData : shipmentDataService.addData;
            const response = await method(formData, true);
            if (response.isSuccess || response.success) {
                ShowMessage(t('recordAddedSuccessPlural'), 'success');
                navigate('/shipments');
            } else {
                ShowMessage(response.message || t('error_saving'), 'error');
            }
        } catch (e) {
            ShowMessage(t('error_unexpected'), 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const [isPalletModalOpen, setIsPalletModalOpen] = useState(false);
    const [currentEditingPallet, setCurrentEditingPallet] = useState(null);
    const [currentEditingPosition, setCurrentEditingPosition] = useState(null);

    const handleOpenPalletModal = (pos, existingPallet) => {
        setCurrentEditingPosition(pos);
        setCurrentEditingPallet(existingPallet);
        setIsPalletModalOpen(true);
    };

    const handleSavePallet = (palletData) => {
        const newManifests = [...formData.manifests];
        const currentManifest = { ...newManifests[activeTab] };
        let newPallets = [...(currentManifest.manifestPallets || [])];
        const idx = newPallets.findIndex(p => p.position === palletData.position);
        const palletToSave = { ...palletData, idManifest: currentManifest.idManifest, idShipment: formData.idShipment };
        idx >= 0 ? newPallets[idx] = palletToSave : newPallets.push(palletToSave);
        currentManifest.manifestPallets = newPallets;
        newManifests[activeTab] = currentManifest;
        setFormData(prev => ({ ...prev, manifests: newManifests }));
    };

    const handleDeletePallet = (pos) => {
        const newManifests = [...formData.manifests];
        const currentManifest = { ...newManifests[activeTab] };
        const idx = currentManifest.manifestPallets.findIndex(p => p.position === pos);
        if (idx !== -1) {
            const pallet = currentManifest.manifestPallets[idx];
            pallet.idManifestPallet > 0 ? (pallet.isDeleted = true) : currentManifest.manifestPallets.splice(idx, 1);
        }
        newManifests[activeTab] = currentManifest;
        setFormData(prev => ({ ...prev, manifests: newManifests }));
    };

    if (isLoading) return <Box sx={{ p: 5, textAlign: 'center' }}><CircularProgress /></Box>;

    return (
        // Agregado pb: 10 para evitar superposición con el footer sticky
        <Box sx={{ p: 3, display: 'flex', flexDirection: 'column', minHeight: '100vh', pb: 10 }}>
            <Box sx={{ mb: 3 }}>
                <Typography variant={isMobile ? "h5" : "h4"} sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <LocalShippingIcon fontSize={isMobile ? "medium" : "large"} color="primary" />
                    {isEditing ? `${t('Edit Shipment')} #${formData.idShipment}` : t('New Shipment')}
                </Typography>
            </Box>

            <Paper sx={{ p: 4, borderRadius: 2, flexGrow: 1 }}>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', color: 'secondary.main', mb: 3 }}>
                    {t('General Shipment Data')}
                </Typography>

                <Grid container spacing={3}>
                    <Grid size={{ xs: 12 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                            <TextField
                                sx={{ width: { xs: '100%', sm: '250px' } }}
                                type="date"
                                label={t('Shipment Date')}
                                name="shipmentDate"
                                value={formData.shipmentDate}
                                onChange={handleGeneralChange}
                                InputLabelProps={{ shrink: true }}
                                required
                                error={!!errors.shipmentDate}
                            />
                            <FormControlLabel
                                control={<Switch checked={formData.mixed} onChange={handleGeneralChange} name="mixed" />}
                                label={t('Mixed')}
                            />
                        </Box>
                    </Grid>

                    <Grid size={{ xs: 12, md: 8 }}>
                        <Autocomplete
                            fullWidth
                            options={clients}
                            getOptionLabel={(option) => option.name || ""}
                            value={clients.find(c => c.idClient === parseInt(formData.idClient)) || null}
                            onChange={handleClientChange}
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    label={t('Client')}
                                    required
                                    error={!!errors.idClient}
                                />
                            )}
                        />
                    </Grid>
                    <Grid size={{ xs: 12, md: 4 }}>
                        <TextField
                            fullWidth
                            label={t('RFC')}
                            name="rfc"
                            value={formData.rfc || ''}
                            slotProps={{ input: { readOnly: true } }}
                        />
                    </Grid>

                    <Grid size={{ xs: 12, md: 8 }}>
                        <TextField
                            fullWidth
                            label={t('Address')}
                            name="address"
                            value={formData.address || ''}
                            slotProps={{ input: { readOnly: true } }}
                        />
                    </Grid>
                    {/*<Grid size={{ xs: 12, sm: 6, md: 3 }}>*/}
                    {/*    <TextField*/}
                    {/*        fullWidth*/}
                    {/*        label={t('Postal Code')}*/}
                    {/*        name="postalCode"*/}
                    {/*        value={formData.postalCode}*/}
                    {/*        slotProps={{ input: { readOnly: true } }}*/}
                    {/*    />*/}
                    {/*</Grid>*/}
                    <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                        <TextField
                            fullWidth
                            label={t('Phone')}
                            name="phone"
                            value={formData.phone}
                            slotProps={{ input: { readOnly: true } }}
                        />
                    </Grid>

                    <Grid size={{ xs: 12 }}>
                        <TextField
                            fullWidth
                            multiline
                            rows={2}
                            label={t('General Comments')}
                            name="comments"
                            value={formData.comments}
                            onChange={handleGeneralChange}
                        />
                    </Grid>
                </Grid>

                <Divider sx={{ my: 4 }} />

                <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', color: 'secondary.main', mb: 3 }}>
                    {t('Logistics & Manifests')}
                </Typography>

                <Grid container spacing={3}>
                    <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                        <TextField fullWidth type="number" label={t('Season')} name="season" value={formData.manifests[activeTab]?.seasonYear || ''} onChange={handleManifestChange} />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                        <TextField fullWidth label={t('RegFdaNo')} name="regFdaNo" value={formData.manifests[activeTab]?.regFdaNo || ''} onChange={handleManifestChange} />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                        <TextField fullWidth label={t('Empaque')} name="empaque" value={formData.manifests[activeTab]?.empaque || ''} onChange={handleManifestChange} />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                        <Autocomplete
                            options={shippingCos}
                            getOptionLabel={(option) => option.description || option.name || ""}
                            value={shippingCos.find(sc => sc.idShippingCompany === parseInt(formData.manifests[activeTab]?.idShippingCompany)) || null}
                            onChange={handleShippingCompanyChange}
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    label={t('Shipping Company')}
                                    required
                                    error={!!errors.idShippingCompany}
                                />
                            )}
                        />
                    </Grid>

                    <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                        <Autocomplete
                            options={drivers}
                            getOptionLabel={(option) => option.name || ""}
                            value={drivers.find(d => d.idDriver === parseInt(formData.manifests[activeTab]?.idDriver)) || null}
                            onChange={handleDriverChange}
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    label={t('Driver')}
                                    required
                                    error={!!errors.idDriver}
                                />
                            )}
                        />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                        <TextField fullWidth label={t('Trailer Plate')} name="trailerPlate" value={formData.manifests[activeTab]?.trailerPlate || ''} onChange={handleManifestChange} />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 12, md: 4 }}>
                        <TextField
                            fullWidth
                            type="time"
                            label={t('Exit Time')}
                            name="exitDate"
                            value={formData.manifests[activeTab]?.exitDate || ''}
                            onChange={handleManifestChange}
                            InputLabelProps={{ shrink: true }}
                            required
                            error={!!errors.exitDate}
                        />
                    </Grid>

                    <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                        <TextField fullWidth label={t('Box Plate')} name="trailerBoxPlate" value={formData.manifests[activeTab]?.trailerBoxPlate || ''} onChange={handleManifestChange} />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                        <TextField
                            fullWidth
                            type="number"
                            label={t('Temp °F')}
                            name="temperatureTrailerBoxF"
                            value={formData.manifests[activeTab]?.temperatureTrailerBoxF || ''}
                            onChange={handleManifestChange}
                            required
                            error={!!errors.temperatureTrailerBoxF}
                            slotProps={{ input: { startAdornment: <InputAdornment position="start"><ThermostatIcon /></InputAdornment> } }}
                        />
                    </Grid>
                </Grid>

                <Divider sx={{ my: 4 }} />

                <Box sx={{ overflowX: 'auto', mb: 4 }}>
                    <TrailerGrid
                        allManifests={formData.manifests}
                        currentManifestIndex={activeTab}
                        onUpdatePallet={handleOpenPalletModal}
                        onDeletePallet={handleDeletePallet}
                        t={t}
                    />
                </Box>

                <Divider sx={{ my: 4 }} />

                <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', color: 'secondary.main', mb: 3 }}>
                    {t('Rastreo')}
                </Typography>

                <Grid container spacing={3}>
                    <Grid size={{ xs: 12, sm: 4, md: 4 }}>
                        <TextField fullWidth label={t('CodigodeRastreo')} name="trackingCode" value={formData.manifests[activeTab]?.trackingCode || ''} onChange={handleManifestChange} />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 4, md: 4 }}>
                        <TextField fullWidth label={t('chismografo')} name="chismografo" value={formData.manifests[activeTab]?.chismografo || ''} onChange={handleManifestChange} />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 4, md: 4 }}>
                        <TextField fullWidth label={t('GnnNumber')} name="gnnNumber" value={formData.manifests[activeTab]?.gnnNumber || ''} onChange={handleManifestChange} />
                    </Grid>
                    <Grid size={{ xs: 12 }}>
                        <TextField fullWidth multiline rows={5} label={t('Sellos')} name="stamps" value={formData.manifests[activeTab]?.stamps || ''} onChange={handleManifestChange} />
                    </Grid>
                </Grid>
            </Paper>

            {/* Nuevo Footer Sticky fuera del Paper principal */}
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
                    justifyContent: 'flex-end',
                    gap: 2,
                    zIndex: 10,
                    flexDirection: { xs: 'column-reverse', sm: 'row' }
                }}
            >
                <Button
                    fullWidth={isMobile}
                    variant="outlined"
                    color="error"
                    size="large"
                    startIcon={<CancelIcon />}
                    onClick={() => navigate('/shipments')}
                >
                    {t('cancel')}
                </Button>
                <Button
                    fullWidth={isMobile}
                    variant="contained"
                    color="primary"
                    size="large"
                    startIcon={<SaveIcon />}
                    onClick={handleSubmit}
                >
                    {isEditing ? t('save') : t('add')}
                </Button>
            </Paper>

            <PalletDetailModal
                open={isPalletModalOpen}
                onClose={() => setIsPalletModalOpen(false)}
                onSave={handleSavePallet}
                onDelete={handleDeletePallet}
                initialData={currentEditingPallet}
                position={currentEditingPosition}
            />
        </Box>
    );
}

export default ShipmentAddOrEdit;