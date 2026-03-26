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
    useMediaQuery,
    Tooltip,
    Avatar,
    IconButton
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import CancelIcon from '@mui/icons-material/Clear';
import ThermostatIcon from '@mui/icons-material/Thermostat';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

import { useTranslation } from 'react-i18next';
import { dataApiShipmentsService } from '@data/Shipments/Data';
import { DataAPICitiesService } from '@data/Cities/Data';
import { DataAPIClientsService } from '@data/Clients/Data';
import { DataAPIDriversService } from '@data/Drivers/Data';
import { DataAPITrailerBoxTypesService } from '@data/TrailerBoxTypes/Data';
import { DataAPIShippingCompaniesService } from '@data/ShippingCompanies/Data';

import { ShowMessage } from '@helpers/NotificationService';
import { AppContext } from '@helpers/AppContext';

import TrailerGrid from './TrailerGrid';
import PalletDetailModal from './PalletDetailModal';
import ConfirmationModal from '@layout/ConfirmationModal'; // Importado según tu ejemplo
const initialManifestStructure = {
    idManifest: 0,
    idShipment: 0,
    exitDate: new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
    temperatureTrailerBoxF: null,
    temperatureTrailerBoxC: null,
    seasonYear: new Date().getFullYear(),
    idDriver: '',
    trailerPlate: '',
    trailerBoxPlate: '',
    trailerPlateEconomicNumber: '',
    trailerBoxPlateEconomicNumber: '',
    idShippingCompany: '',
    regFdaNo: '',
    empaque: '',
    idTrailerBoxType: '',
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
    idCompanyNavigation: null,
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
    const trailerBoxTypesService = DataAPITrailerBoxTypesService();
    const shippingCompaniesService = DataAPIShippingCompaniesService();
    const { companySelected } = useContext(AppContext);

    const [formData, setFormData] = useState(initialFormData);
    const [isLoading, setIsLoading] = useState(isEditing);
    const [activeTab, setActiveTab] = useState(0);
    const [clients, setClients] = useState([]);
    const [drivers, setDrivers] = useState([]);
    const [trailerBoxTypes, setTrailerBoxTypes] = useState([]);
    const [shippingCos, setShippingCos] = useState([]);
    const [isConfirmDeleteModalOpen, setIsConfirmDeleteModalOpen] = useState(false);
    const [palletToDeletePos, setPalletToDeletePos] = useState(null);
    const [copyModeInfo, setCopyModeInfo] = useState({ active: false, pos: null, confirm: null, cancel: null });
    const [loadingTrailerPlate, setLoadingTrailerPlate] = useState(false);
    const [loadingBoxPlate, setLoadingBoxPlate] = useState(false);

    const handleCopyModeChange = (isActive, sourcePos, confirmFn, cancelFn) => {
        setCopyModeInfo({ active: isActive, pos: sourcePos, confirm: confirmFn, cancel: cancelFn });
    };

    // Estado para manejar los errores de validación
    const [errors, setErrors] = useState({});

    const handleOpenDeleteConfirmation = (pos) => {
        setPalletToDeletePos(pos);
        setIsConfirmDeleteModalOpen(true);
    };


    const fetchClients = async () => {
        const response = await clientsService.getDataPagination(1, 500, "", true);
        if (response.success) setClients(response.data.data || []);
    };

    const fetchDrivers = async () => {
        const response = await driversService.getDataPagination(1, 500, "", true);
        if (response.success) setDrivers(response.data.data || []);
    };

    const fetchTrailerBoxTypes = async () => {
        const response = await trailerBoxTypesService.getDataPagination(1, 500, "", true);
        if (response.success) setTrailerBoxTypes(response.data.data || []);
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
        fetchTrailerBoxTypes();
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
                            const companyNav = data.idCompanyNavigation;
                            data.manifests = data.manifests.map(m => ({
                                ...m,
                                exitDate: m.exitDate?.includes('T') ? m.exitDate.split('T')[1].slice(0, 5) : m.exitDate,
                                regFdaNo: companyNav?.regFdaNo || m.regFdaNo || '',
                                empaque: companyNav?.empaque || m.empaque || '',
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
                    ShowMessage(t('error'), 'error');
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

    const handleEconomicBlur = (e, isBox) => {
        const value = e.target.value;
        if (value) {
            fetchPlateByEconomic(value, isBox);
        }
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

    const handleTrailerBoxTypeChange = (event, newValue) => {
        if (errors.idTrailerBoxType && newValue) {
            setErrors(prev => ({ ...prev, idTrailerBoxType: false }));
        }
        const newManifests = [...formData.manifests];
        newManifests[activeTab] = {
            ...newManifests[activeTab],
            idTrailerBoxType: newValue ? newValue.idTrailerBoxType : ''
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


        if (!currentManifest.idShippingCompany) newErrors.idShippingCompany = true;
        if (!currentManifest.idDriver) newErrors.idDriver = true;
        if (!currentManifest.exitDate) newErrors.exitDate = true;
        if (!currentManifest.temperatureTrailerBoxF) newErrors.temperatureTrailerBoxF = true;
        if (!currentManifest.trailerPlateEconomicNumber) newErrors.trailerPlateEconomicNumber = true;
        if (!currentManifest.trailerPlate) newErrors.trailerPlate = true;
        if (!currentManifest.trailerBoxPlateEconomicNumber) newErrors.trailerBoxPlateEconomicNumber = true;
        if (!currentManifest.trailerBoxPlate) newErrors.trailerBoxPlate = true;
        if (!currentManifest.idTrailerBoxType) newErrors.idTrailerBoxType = true;

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            ShowMessage(t('emptyFields'), 'warning');
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
                ShowMessage(response.message || t('error'), 'error');
            }
        } catch (e) {
            ShowMessage(t('error'), 'error');
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
        const newManifests = formData.manifests.map(m => ({
            ...m,
            manifestPallets: m.manifestPallets ? m.manifestPallets.map(p => ({ ...p })) : []
        }));

        if (palletData.chismografo) {
            newManifests.forEach(manifest => {
                if (manifest.manifestPallets) {
                    manifest.manifestPallets.forEach(p => {
                        if (p.position !== palletData.position) {
                            p.chismografo = false;
                        }
                    });
                }
            });
        }

        const currentManifest = newManifests[activeTab];

        const idx = currentManifest.manifestPallets.findIndex(p => p.position === palletData.position);

        const palletToSave = {
            ...palletData,
            idManifest: currentManifest.idManifest,
            idShipment: formData.idShipment,
            temperatureF: (palletData.temperatureF === '' || palletData.temperatureF === null || palletData.temperatureF === undefined)
                ? null
                : palletData.temperatureF,

            temperatureC: (palletData.temperatureC === '' || palletData.temperatureC === null || palletData.temperatureC === undefined)
                ? null
                : palletData.temperatureC,
        };

        if (idx >= 0) {
            currentManifest.manifestPallets[idx] = palletToSave;
        } else {
            currentManifest.manifestPallets.push(palletToSave);
        }

        setFormData(prev => ({ ...prev, manifests: newManifests }));
        setIsPalletModalOpen(false);
    };


    const handleConfirmDelete = () => {
        const pos = palletToDeletePos;
        const newManifests = [...formData.manifests];
        const currentManifest = { ...newManifests[activeTab] };

        const idx = currentManifest.manifestPallets.findIndex(p => p.position === pos);

        if (idx !== -1) {
            currentManifest.manifestPallets.splice(idx, 1);
        }

        newManifests[activeTab] = currentManifest;
        setFormData(prev => ({ ...prev, manifests: newManifests }));

        setIsConfirmDeleteModalOpen(false);
        setIsPalletModalOpen(false);

        ShowMessage(t('palletDeleted'), 'success');
    };

    const handleMovePallet = (fromPos, toPos) => {
        const newManifests = [...formData.manifests];
        const currentManifest = { ...newManifests[activeTab] };

        const fromIdx = currentManifest.manifestPallets.findIndex(p => p.position === fromPos && !p.isDeleted);
        const toIdx = currentManifest.manifestPallets.findIndex(p => p.position === toPos && !p.isDeleted);

        if (fromIdx !== -1) {
            const palletFrom = { ...currentManifest.manifestPallets[fromIdx] };

            if (toIdx !== -1) {
                const palletTo = { ...currentManifest.manifestPallets[toIdx] };
                palletFrom.position = toPos;
                palletTo.position = fromPos;
                currentManifest.manifestPallets[fromIdx] = palletTo;
                currentManifest.manifestPallets[toIdx] = palletFrom;
            } else {
                palletFrom.position = toPos;
                currentManifest.manifestPallets[fromIdx] = palletFrom;
            }

            newManifests[activeTab] = currentManifest;
            setFormData(prev => ({ ...prev, manifests: newManifests }));
        }
    };


    const handleCopyPallet = (fromPos, toPositions) => {
        const newManifests = [...formData.manifests];
        const currentManifest = { ...newManifests[activeTab] };

        const sourcePallet = currentManifest.manifestPallets.find(p => p.position === fromPos && !p.isDeleted);

        if (sourcePallet) {
            const newPallets = toPositions.map(toPos => ({
                ...sourcePallet,
                idManifestPallet: 0, // Importante: 0 para que el servidor lo cree como nuevo
                position: toPos,
                chismografo: false,
                manifestPalletLoadings: sourcePallet.manifestPalletLoadings?.map(l => ({
                    ...l,
                    idManifestPalletLoading: 0,
                    idManifestPallet: 0
                })) || []
            }));

            // Agregamos todos los nuevos pallets al manifiesto actual
            currentManifest.manifestPallets = [...currentManifest.manifestPallets, ...newPallets];
            newManifests[activeTab] = currentManifest;

            setFormData(prev => ({ ...prev, manifests: newManifests }));
            ShowMessage(t('palletCopied'), 'success');
        }
    };

    const fetchPlateByEconomic = async (economicNo, isBox) => {
        if (!economicNo || !companySelected?.idCompany) return;

        isBox ? setLoadingBoxPlate(true) : setLoadingTrailerPlate(true);

        try {
            const response = await shipmentDataService.getLastPlateByEconomicNumber(
                companySelected.idCompany,
                economicNo,
                isBox
            );

            // Si la respuesta es exitosa, actualizamos el campo correspondiente
            if (response && response.success && response.data) {
                const plateValue = response.data || ''; // Ajustar según el nombre del campo que devuelva tu API

                const newManifests = [...formData.manifests];
                newManifests[activeTab] = {
                    ...newManifests[activeTab],
                    [isBox ? 'trailerBoxPlate' : 'trailerPlate']: plateValue
                };
                setFormData(prev => ({ ...prev, manifests: newManifests }));
            }
        } catch (error) {
            console.error("Error fetching plate:", error);
        } finally {
            isBox ? setLoadingBoxPlate(false) : setLoadingTrailerPlate(false);
        }
    };


    if (isLoading) return <Box sx={{ p: 5, textAlign: 'center' }}><CircularProgress /></Box>;
    const formatManifest = (id) => id ? id.toString().padStart(3, '0') : '-';

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
                            {isEditing
                                ? <>{t('editManifest')}&nbsp;<Box component="span" sx={{ color: 'primary.main' }}>#{formatManifest(formData.shipmentNo)}</Box></>
                                : t('newManifest')
                            }
                        </Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ display: { xs: 'none', sm: 'block' } }}>
                            {isEditing ? t('editManifest_description') : t('newManifest_description')}
                        </Typography>
                    </Box>
                </Box>

                {/* Derecha: botón volver */}
                {/*<Tooltip title={t('cancel')}>*/}
                {/*    <IconButton*/}
                {/*        onClick={() => navigate('/shipments')}*/}
                {/*        size="small"*/}
                {/*        sx={{ color: 'white', bgcolor: 'error.main', '&:hover': { bgcolor: 'error.dark' }, p: 1 }}*/}
                {/*    >*/}
                {/*        <ArrowBackIcon fontSize="small" />*/}
                {/*    </IconButton>*/}
                {/*</Tooltip>*/}
            </Paper>

            <Paper sx={{ p: 4, borderRadius: 2, flexGrow: 1, mb: 12 }}>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', color: 'secondary.main', mb: 3 }}>
                    {t('manifestInfo')}
                </Typography>

                <Grid container spacing={3}>
                    <Grid size={{ xs: 12 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                            <TextField
                                sx={{ width: { xs: '100%', sm: '250px' } }}
                                type="date"
                                label={t('shipmentDate')}
                                name="shipmentDate"
                                value={formData.shipmentDate}
                                onChange={handleGeneralChange}
                                InputLabelProps={{ shrink: true }}
                                required
                                error={!!errors.shipmentDate}
                            />
                            <FormControlLabel
                                control={<Switch checked={formData.mixed} onChange={handleGeneralChange} name="mixed" />}
                                label={t('mixed')}
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
                                    label={t('client')}
                                    required
                                    error={!!errors.idClient}
                                />
                            )}
                        />
                    </Grid>
                    <Grid size={{ xs: 12, md: 4 }}>
                        <TextField
                            fullWidth
                            label={t('rfc')}
                            name="rfc"
                            value={formData.rfc || ''}
                            slotProps={{ input: { readOnly: true } }}
                        />
                    </Grid>

                    <Grid size={{ xs: 12, md: 8 }}>
                        <TextField
                            fullWidth
                            label={t('address')}
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
                            label={t('phone')}
                            name="phone"
                            value={formData.phone}
                            slotProps={{ input: { readOnly: true } }}
                        />
                    </Grid>

                    {/*<Grid size={{ xs: 12 }}>*/}
                    {/*    <TextField*/}
                    {/*        fullWidth*/}
                    {/*        multiline*/}
                    {/*        rows={2}*/}
                    {/*        label={t('General Comments')}*/}
                    {/*        name="comments"*/}
                    {/*        value={formData.comments}*/}
                    {/*        onChange={handleGeneralChange}*/}
                    {/*    />*/}
                    {/*</Grid>*/}
                </Grid>

                <Divider sx={{ my: 4 }} />

                <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', color: 'secondary.main', mb: 3 }}>
                    {t('remisionInfo')}
                </Typography>

                <Grid container spacing={3}>
                    <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                        <TextField fullWidth type="number" label={t('season')} name="season" value={formData.manifests[activeTab]?.seasonYear || ''} onChange={handleManifestChange} />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                        <TextField fullWidth label={t('regFdaNo')} name="regFdaNo" value={formData.manifests[activeTab]?.regFdaNo || ''} onChange={handleManifestChange} />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                        <TextField fullWidth label={t('empaque')} name="empaque" value={formData.manifests[activeTab]?.empaque || ''} onChange={handleManifestChange} />
                        {console.log(formData.manifests[activeTab])}
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
                                    label={t('shippingCompany')}
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
                                    label={t('driver')}
                                    required
                                    error={!!errors.idDriver}
                                />
                            )}
                        />
                    </Grid>

                    <Grid size={{ xs: 12, sm: 6, md: 2 }}>
                        <TextField
                            fullWidth
                            type="number"
                            label={t('temperatureF')}
                            name="temperatureTrailerBoxF"
                            value={formData.manifests[activeTab]?.temperatureTrailerBoxF || ""}
                            onChange={handleManifestChange}
                            required
                            error={!!errors.temperatureTrailerBoxF}
                            slotProps={{ input: { startAdornment: <InputAdornment position="start"><ThermostatIcon /></InputAdornment> } }}
                        />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 12, md: 2 }}>
                        <TextField
                            fullWidth
                            type="time"
                            label={t('exitTime')}
                            name="exitDate"
                            value={formData.manifests[activeTab]?.exitDate || ''}
                            onChange={handleManifestChange}
                            InputLabelProps={{ shrink: true }}
                            required
                            error={!!errors.exitDate}
                        />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                        <Autocomplete
                            options={trailerBoxTypes}
                            getOptionLabel={(option) => option.description || ""}
                            value={trailerBoxTypes.find(d => d.idTrailerBoxType === parseInt(formData.manifests[activeTab]?.idTrailerBoxType)) || null}
                            onChange={handleTrailerBoxTypeChange}
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    label={t('trailerBoxType')}
                                    required
                                    error={!!errors.idTrailerBoxType}
                                />
                            )}
                            required
                            error={!!errors.idTrailerBoxType}
                            helperText={errors.idTrailerBoxType ? t('requiredField') : ""}
                        />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                        <TextField
                            fullWidth
                            label={t('trailerPlateEconomicNo')}
                            name="trailerPlateEconomicNumber"
                            required
                            error={!!errors.trailerPlateEconomicNumber}
                            value={formData.manifests[activeTab]?.trailerPlateEconomicNumber || ''}
                            onChange={handleManifestChange}
                            onBlur={(e) => handleEconomicBlur(e, false)}
                            inputProps={{ maxLength: 50 }}
                        />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                        <TextField
                            fullWidth
                            label={t('trailerPlate')}
                            name="trailerPlate"
                            required
                            error={!!errors.trailerPlate}
                            value={formData.manifests[activeTab]?.trailerPlate || ''}
                            onChange={handleManifestChange}
                            inputProps={{ maxLength: 50 }}
                            slotProps={{
                                input: {
                                    endAdornment: loadingTrailerPlate ? (
                                        <InputAdornment position="end">
                                            <Tooltip title={t('searchingPlate') || "Buscando placa..."}>
                                                <CircularProgress size={20} />
                                            </Tooltip>
                                        </InputAdornment>
                                    ) : null,
                                }
                            }}
                        />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                        <TextField
                            fullWidth
                            label={t('boxPlateEconomicNo')}
                            name="trailerBoxPlateEconomicNumber"
                            required
                            error={!!errors.trailerBoxPlateEconomicNumber}
                            value={formData.manifests[activeTab]?.trailerBoxPlateEconomicNumber || ''}
                            onChange={handleManifestChange}
                            onBlur={(e) => handleEconomicBlur(e, true)}
                            inputProps={{ maxLength: 50 }}
                        />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                        <TextField
                            fullWidth
                            label={t('boxPlate')}
                            name="trailerBoxPlate"
                            required
                            error={!!errors.trailerBoxPlate}
                            value={formData.manifests[activeTab]?.trailerBoxPlate || ''}
                            onChange={handleManifestChange}
                            inputProps={{ maxLength: 50 }}
                            slotProps={{
                                input: {
                                    endAdornment: loadingBoxPlate ? (
                                        <InputAdornment position="end">
                                            <Tooltip title={t('searchingPlate') || "Buscando placa..."}>
                                                <CircularProgress size={20} />
                                            </Tooltip>
                                        </InputAdornment>
                                    ) : null,
                                }
                            }}
                        />
                    </Grid>

                </Grid>

                <Divider sx={{ my: 4 }} />

                <Box sx={{ overflowX: 'auto', mb: 4 }}>
                    <TrailerGrid
                        allManifests={formData.manifests}
                        currentManifestIndex={activeTab}
                        onUpdatePallet={handleOpenPalletModal}
                        onDeletePallet={handleOpenDeleteConfirmation}
                        onMovePallet={handleMovePallet}
                        onCopyPallet={handleCopyPallet}
                        onCopyModeChange={handleCopyModeChange} // Nueva prop
                        t={t}
                    />
                </Box>

                <Divider sx={{ my: 4 }} />

                <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', color: 'secondary.main', mb: 3 }}>
                    {t('tracking')}
                </Typography>

                <Grid container spacing={3}>
                    <Grid size={{ xs: 12, sm: 4, md: 4 }}>
                        <TextField fullWidth label={t('trackingCode')} name="trackingCode" value={formData.manifests[activeTab]?.trackingCode || ''} onChange={handleManifestChange} />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 4, md: 4 }}>
                        <TextField fullWidth label={t('chismografo')} name="chismografo" value={formData.manifests[activeTab]?.chismografo || ''} onChange={handleManifestChange} />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 4, md: 4 }}>
                        <TextField fullWidth label={t('gnnNumber')} name="gnnNumber" value={formData.manifests[activeTab]?.gnnNumber || ''} onChange={handleManifestChange} />
                    </Grid>
                    <Grid size={{ xs: 12 }}>
                        <TextField fullWidth multiline rows={5} label={t('stamps')} name="stamps" value={formData.manifests[activeTab]?.stamps || ''} onChange={handleManifestChange} />
                    </Grid>

                    <Grid size={{ xs: 12 }}>
                        <TextField fullWidth multiline rows={5} label={t('comments')} name="comments" value={formData.manifests[activeTab]?.comments || ''} onChange={handleManifestChange} inputProps={{ maxLength: 500 }} />
                    </Grid>
                </Grid>
            </Paper>

            <Paper
                elevation={4}
                sx={{
                    position: 'fixed',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    p: 2,
                    mt: 3,
                    backgroundColor: theme.palette.background.paper,
                    borderTop: `1px solid ${theme.palette.divider}`,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: 2,
                    zIndex: 1100,
                    flexDirection: { xs: 'column', sm: 'row' }
                }}
            >
                {copyModeInfo.active ? (
                    <>
                        <Typography variant="body1" sx={{ fontWeight: 'bold', color: 'white' }}>
                            {t('copyingPallet', { number: copyModeInfo.pos })}
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 2, width: { xs: '100%', sm: 'auto' } }}>
                            <Button
                                fullWidth={isMobile}
                                variant="contained"
                                color="inherit"
                                onClick={copyModeInfo.cancel}
                            >
                                {t('cancelCopying')}
                            </Button>
                            <Button
                                fullWidth={isMobile}
                                variant="contained"
                                color="primary"
                                startIcon={<CheckCircleIcon />}
                                onClick={copyModeInfo.confirm}
                            >
                                {t('finishCopying')}
                            </Button>
                        </Box>
                    </>
                ) : (
                    <>
                        <Box sx={{ display: { xs: 'none', sm: 'block' } }} /> {/* Espaciador */}
                        <Box sx={{ display: 'flex', gap: 2, width: { xs: '100%', sm: 'auto' }, ml: 'auto' }}>
                            <Button
                                fullWidth={isMobile}
                                variant="outlined"
                                color="light"
                                startIcon={<CancelIcon />}
                                onClick={() => navigate('/shipments')}
                            >
                                {t('cancel')}
                            </Button>
                            <Button
                                fullWidth={isMobile}
                                variant="contained"
                                color="primary"
                                startIcon={<SaveIcon />}
                                onClick={handleSubmit}
                            >
                                {isEditing ? t('save') : t('add')}
                            </Button>
                        </Box>
                    </>
                )}
            </Paper>

            <PalletDetailModal
                open={isPalletModalOpen}
                onClose={() => setIsPalletModalOpen(false)}
                onSave={handleSavePallet}
                onDelete={handleOpenDeleteConfirmation}
                initialData={currentEditingPallet}
                position={currentEditingPosition}
                // PASAMOS EL ARREGLO DE PALLETS DEL MANIFIESTO ACTUAL
                allPallets={formData.manifests[activeTab]?.manifestPallets || []}
            />

            <ConfirmationModal
                open={isConfirmDeleteModalOpen}
                onClose={() => setIsConfirmDeleteModalOpen(false)}
                onConfirm={handleConfirmDelete}
                title={t('deletePallet')}
                message={t('question_areYouSureDeletePallet', { position: palletToDeletePos })}
                confirmText={t('delete')}
                cancelText={t('cancel')}
            />
        </Box>
    );
}

export default ShipmentAddOrEdit;    