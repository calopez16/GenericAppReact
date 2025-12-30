import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    TextField, Button, Box, Typography, Grid, FormControlLabel, Switch,
    Paper, CircularProgress, Divider, InputAdornment, Autocomplete
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import CancelIcon from '@mui/icons-material/Clear';
import ThermostatIcon from '@mui/icons-material/Thermostat';
import { useTranslation } from 'react-i18next';
import { dataApiShipmentsService } from '@data/Shipments/Data';
import { DataAPIClientsService } from '@data/Clients/Data';
import { DataAPICitiesService } from '@data/Cities/Data';
import { DataAPIDriversService } from '@data/Drivers/Data';
import { DataAPIShippingCompaniesService } from '@data/ShippingCompanies/Data';

import { ShowMessage } from '@helpers/NotificationService';

import TrailerGrid from './TrailerGrid';
import PalletDetailModal from './PalletDetailModal';

const initialManifestStructure = {
    idManifest: 0,
    idShipment: 0,
    exitDate: new Date().toISOString().slice(0, 16),
    temperatureTrailerBoxF: '',
    temperatureTrailerBoxC: '',
    season: new Date().getFullYear(),
    idDriver: '',
    trailerPlate: '',
    trailerBoxPlate: '',
    idShippingCompany: '',
    idManifestStatus: 1,
    comments: '',
    manifestPallets: []
};

const initialFormData = {
    idShipment: 0,
    shipmentDate: new Date().toISOString().split('T')[0],
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
    manifests: [{ ...initialManifestStructure }]
};

function ShipmentAddOrEdit() {
    const { t } = useTranslation();
    const { id } = useParams();
    const navigate = useNavigate();
    const isEditing = id !== undefined;
    const shipmentDataService = dataApiShipmentsService();
    const citiesService = DataAPICitiesService();
    const clientsService = DataAPIClientsService();
    const driversService = DataAPIDriversService();
    const shippingCompaniesService = DataAPIShippingCompaniesService();

    const [formData, setFormData] = useState(initialFormData);
    const [isLoading, setIsLoading] = useState(isEditing);
    const [activeTab, setActiveTab] = useState(0);
    const [clients, setClients] = useState([]);
    const [drivers, setDrivers] = useState([]);
    const [shippingCos, setShippingCos] = useState([]); // Estado para compañías

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
        fetchClients();
        fetchDrivers();
        fetchShippingCompanies();
        if (isEditing) {
            const fetchShipment = async () => {
                try {
                    const response = await shipmentDataService.getDataById(id);
                    if (response.data && response.data.Data) {
                        const data = response.data.Data;
                        if (data.shipmentDate) data.shipmentDate = data.shipmentDate.split('T')[0];
                        if (data.manifests) {
                            data.manifests = data.manifests.map(m => ({
                                ...m,
                                exitDate: m.exitDate ? m.exitDate.slice(0, 16) : new Date().toISOString().slice(0, 16)
                            }));
                        }
                        setFormData(prev => ({ ...prev, ...data }));
                    }
                } catch (e) {
                    ShowMessage.error(t('error_fetching_details'));
                } finally {
                    setIsLoading(false);
                }
            };
            fetchShipment();
        }
    }, [id]);

    const handleGeneralChange = (e) => {
        const { name, value, checked, type } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
        }));
    };

    const handleClientChange = async (event, newValue) => {
        if (newValue) {
            let fullAddress = newValue.address || '';
            if (newValue.idCity) {
                try {
                    const response = await citiesService.getDataById(newValue.idCity);
                    if (response.success && response.data) {
                        const c = response.data;
                        const locationStr = `${c.description || ''}, ${c.idStateNavigation?.description || ''}, ${c.idStateNavigation?.idCountryNavigation?.description || ''}`;
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
                idCity: newValue.idCity || '',
            }));
        } else {
            setFormData(prev => ({ ...prev, idClient: '', rfc: '', address: '', postalCode: '', phone: '', idCity: '' }));
        }
    };

    const handleManifestChange = (e) => {
        const { name, value } = e.target;
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
        const newManifests = [...formData.manifests];
        newManifests[activeTab] = {
            ...newManifests[activeTab],
            idDriver: newValue ? newValue.idDriver : ''
        };
        setFormData(prev => ({ ...prev, manifests: newManifests }));
    };

    const handleShippingCompanyChange = (event, newValue) => {
        const newManifests = [...formData.manifests];
        newManifests[activeTab] = {
            ...newManifests[activeTab],
            idShippingCompany: newValue ? newValue.idShippingCompany : ''
        };
        setFormData(prev => ({ ...prev, manifests: newManifests }));
    };

    const handleSubmit = async () => {
        setIsLoading(true);
        try {
            const method = isEditing ? shipmentDataService.editData : shipmentDataService.addData;
            const response = await method(formData, true);
            if (response.isSuccess || response.success) {
                ShowMessage.success(t('Success'));
                navigate('/shipments');
            } else {
                ShowMessage.error(response.message || t('Error'));
            }
        } catch (e) {
            ShowMessage.error(t('Server Error'));
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
        <Box sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h4" sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <LocalShippingIcon fontSize="large" color="primary" />
                    {isEditing ? `${t('Edit Shipment')} #${formData.idShipment}` : t('New Shipment')}
                </Typography>
                <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button variant="outlined" color="error" startIcon={<CancelIcon />} onClick={() => navigate('/shipments')}>{t('Cancel')}</Button>
                    <Button variant="contained" color="primary" startIcon={<SaveIcon />} onClick={handleSubmit}>{t('Save Shipment')}</Button>
                </Box>
            </Box>

            <Paper sx={{ p: 4, borderRadius: 2 }}>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>{t('General Shipment Data')}</Typography>

                <Box sx={{ mt: 2, mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                    <TextField
                        sx={{ width: { xs: '100%', sm: '250px' } }}
                        type="date"
                        label={t('Shipment Date')}
                        name="shipmentDate"
                        value={formData.shipmentDate}
                        onChange={handleGeneralChange}
                        InputLabelProps={{ shrink: true }}
                        required
                    />
                    <FormControlLabel control={<Switch checked={formData.mixed} onChange={handleGeneralChange} name="mixed" />} label={t('Mixed')} />
                </Box>

                <Box sx={{ mt: 2, mb: 4, display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(4, 1fr)' }, gap: 2 }}>
                    <Autocomplete
                        options={clients}
                        getOptionLabel={(option) => option.name || ""}
                        value={clients.find(c => c.idClient === parseInt(formData.idClient)) || null}
                        onChange={handleClientChange}
                        sx={{ gridColumn: { xs: 'span 1', sm: 'span 3' } }}
                        renderInput={(params) => <TextField {...params} label={t('Client')} required />}
                    />
                    <TextField fullWidth label={t('RFC')} name="rfc" value={formData.rfc || ''} InputProps={{ readOnly: true }} />

                    <TextField fullWidth label={t('Address')} name="address" value={formData.address} onChange={handleGeneralChange} sx={{ gridColumn: { xs: 'span 1', sm: 'span 2' } }} InputProps={{ readOnly: true }} />
                    <TextField fullWidth label={t('Postal Code')} name="postalCode" value={formData.postalCode} onChange={handleGeneralChange} InputProps={{ readOnly: true }} />
                    <TextField fullWidth label={t('Phone')} name="phone" value={formData.phone} onChange={handleGeneralChange} InputProps={{ readOnly: true }} />

                    <TextField fullWidth multiline rows={2} label={t('General Comments')} name="comments" value={formData.comments} onChange={handleGeneralChange} sx={{ gridColumn: { xs: 'span 1', sm: 'span 4' } }} />
                </Box>

                <Divider sx={{ my: 4 }} />

                <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', color: 'secondary.main' }}>{t('Logistics & Manifests')}</Typography>

                <Box sx={{ mt: 2, mb: 4, display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(4, 1fr)' }, gap: 2 }}>
                    <TextField
                        fullWidth
                        type="datetime-local"
                        label={t('Exit Date')}
                        name="exitDate"
                        value={formData.manifests[activeTab]?.exitDate || ''}
                        onChange={handleManifestChange}
                        InputLabelProps={{ shrink: true }}
                    />
                    <TextField fullWidth type="number" label={t('Season')} name="season" value={formData.manifests[activeTab]?.season || ''} onChange={handleManifestChange} sx={{ gridColumn: { xs: 'span 1', sm: 'span 1' } }} />
                    <Autocomplete
                        options={shippingCos}
                        getOptionLabel={(option) => option.description || option.name || ""}
                        value={shippingCos.find(sc => sc.idShippingCompany === parseInt(formData.manifests[activeTab]?.idShippingCompany)) || null}
                        onChange={handleShippingCompanyChange}
                        sx={{ gridColumn: { xs: 'span 1', sm: 'span 2' } }}
                        renderInput={(params) => <TextField {...params} label={t('Shipping Company')} />}
                    />
                </Box>
                <Box sx={{ mt: 2, mb: 4, display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(4, 1fr)' }, gap: 2 }}>
                    <TextField fullWidth type="number" label={t('Temp °F')} name="temperatureTrailerBoxF" value={formData.manifests[activeTab]?.temperatureTrailerBoxF || ''} onChange={handleManifestChange} InputProps={{ startAdornment: <InputAdornment position="start"><ThermostatIcon /></InputAdornment> }} sx={{ gridColumn: { xs: 'span 1', sm: 'span 1' } }} />

                    <Autocomplete
                        options={drivers}
                        getOptionLabel={(option) => option.name || ""}
                        value={drivers.find(d => d.idDriver === parseInt(formData.manifests[activeTab]?.idDriver)) || null}
                        onChange={handleDriverChange}
                        sx={{ gridColumn: { xs: 'span 1', sm: 'span 1' } }}
                        renderInput={(params) => <TextField {...params} label={t('Driver')} />}
                    />

                    <TextField fullWidth label={t('Trailer Plate')} name="trailerPlate" value={formData.manifests[activeTab]?.trailerPlate || ''} onChange={handleManifestChange} sx={{ gridColumn: { xs: 'span 1', sm: 'span 1' } }} />
                    <TextField fullWidth label={t('Box Plate')} name="trailerBoxPlate" value={formData.manifests[activeTab]?.trailerBoxPlate || ''} onChange={handleManifestChange} sx={{ gridColumn: { xs: 'span 1', sm: 'span 1' } }} />


                    {/*    <TextField fullWidth multiline rows={2} label={t('Manifest Comments')} name="comments" value={formData.manifests[activeTab]?.comments || ''} onChange={handleManifestChange} sx={{ gridColumn: { xs: 'span 1', sm: 'span 4' } }} />*/}
                </Box>

                <TrailerGrid
                    allManifests={formData.manifests}
                    currentManifestIndex={activeTab}
                    onUpdatePallet={handleOpenPalletModal}
                    onDeletePallet={handleDeletePallet}
                    t={t}
                />
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