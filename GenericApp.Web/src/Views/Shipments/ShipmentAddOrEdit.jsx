import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    TextField, Button, Box, Typography, Grid, FormControlLabel, Switch,
    Paper, CircularProgress, Tabs, Tab, IconButton,
    useTheme, useMediaQuery
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import AddIcon from '@mui/icons-material/Add';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import CancelIcon from '@mui/icons-material/Clear';
import CloseIcon from '@mui/icons-material/Close';
import { useTranslation } from 'react-i18next';
import { dataApiShipmentsService } from '@data/Shipments/Data';
import { ShowMessage } from '@helpers/NotificationService';

import TrailerGrid from './TrailerGrid';
import PalletDetailModal from './PalletDetailModal';

const ALLOW_MULTIPLE_MANIFESTS = true;

const initialManifestStructure = {
    idManifest: 0,
    idShipment: 0,
    comments: '',
    manifestPallets: []
};

const initialFormData = {
    idShipment: 0,
    name: '',
    address: '',
    postalCode: '',
    phone: '',
    mixed: false,
    idClient: null,
    idShipmentStatus: null,
    isActive: true,
    country: '',
    state: '',
    city: '',
    manifests: [{ ...initialManifestStructure }]
};

function ShipmentAddOrEdit() {
    const { t } = useTranslation();
    const { id } = useParams();
    const navigate = useNavigate();
    const isEditing = id !== undefined;
    const shipmentDataService = dataApiShipmentsService();

    // --- LÓGICA DE DETECCIÓN DE PANTALLA ---
    const theme = useTheme();
    const isSmallScreen = useMediaQuery(theme.breakpoints.down('md'));

    const [formData, setFormData] = useState(initialFormData);
    const [isLoading, setIsLoading] = useState(isEditing);
    const [activeTab, setActiveTab] = useState(0);

    const [isPalletModalOpen, setIsPalletModalOpen] = useState(false);
    const [currentEditingPallet, setCurrentEditingPallet] = useState(null);
    const [currentEditingPosition, setCurrentEditingPosition] = useState(null);

    useEffect(() => {
        if (isEditing) {
            const fetchShipment = async () => {
                try {
                    const response = await shipmentDataService.getDataById(id);
                    if (response.data && response.data.Data) {
                        const data = response.data.Data;
                        if (!data.manifests || data.manifests.length === 0) {
                            data.manifests = [{ ...initialManifestStructure, idShipment: data.idShipment }];
                        }
                        setFormData(data);
                        setIsLoading(false);
                    } else {
                        ShowMessage.error(t('shipment_not_found'));
                        navigate('/shipments');
                    }
                } catch (e) {
                    ShowMessage.error(t('error_fetching_shipment_details'));
                    navigate('/shipments');
                }
            };
            fetchShipment();
        }
    }, [id, isEditing, navigate, shipmentDataService, t]);

    const handleGeneralChange = (e) => {
        const { name, value, checked, type } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
        }));
    };

    const handleTabChange = (event, newValue) => {
        setActiveTab(newValue);
    };

    const handleAddManifest = () => {
        setFormData(prev => ({
            ...prev,
            manifests: [...prev.manifests, { ...initialManifestStructure, idShipment: prev.idShipment }]
        }));
        setActiveTab(formData.manifests.length);
    };

    const handleRemoveManifest = (e, index) => {
        e.stopPropagation();
        if (formData.manifests.length <= 1) {
            ShowMessage.warning(t('Must have at least one manifest'));
            return;
        }
        if (!window.confirm(t('Are you sure?'))) return;

        const newManifests = formData.manifests.filter((_, i) => i !== index);
        setFormData(prev => ({ ...prev, manifests: newManifests }));

        if (activeTab >= index && activeTab > 0) setActiveTab(prev => prev - 1);
    };

    const handleOpenPalletModal = (pos, existingPallet) => {
        setCurrentEditingPosition(pos);
        setCurrentEditingPallet(existingPallet);
        setIsPalletModalOpen(true);
    };

    const handleSavePallet = (palletData) => {
        const newManifests = [...formData.manifests];
        const currentManifest = { ...newManifests[activeTab] };
        let newPallets = [...(currentManifest.manifestPallets || [])];

        const existingIndex = newPallets.findIndex(p => p.position === palletData.position);
        if (existingIndex >= 0) {
            newPallets[existingIndex] = { ...palletData, idManifest: currentManifest.idManifest, idShipment: formData.idShipment };
        } else {
            newPallets.push({ ...palletData, idManifest: currentManifest.idManifest, idShipment: formData.idShipment });
        }
        currentManifest.manifestPallets = newPallets;
        newManifests[activeTab] = currentManifest;
        setFormData(prev => ({ ...prev, manifests: newManifests }));
    };

    const handleDeletePallet = (pos) => {
        const newManifests = [...formData.manifests];
        const currentManifest = { ...newManifests[activeTab] };
        const palletIndex = currentManifest.manifestPallets.findIndex(p => p.position === pos);
        if (palletIndex !== -1) {
            const pallet = currentManifest.manifestPallets[palletIndex];
            if (pallet.idManifestPallet > 0) {
                currentManifest.manifestPallets[palletIndex] = { ...pallet, isDeleted: true };
            } else {
                currentManifest.manifestPallets.splice(palletIndex, 1);
            }
        }
        newManifests[activeTab] = currentManifest;
        setFormData(prev => ({ ...prev, manifests: newManifests }));
    };

    const handleMovePallet = (fromPos, toPos) => {
        const newManifests = [...formData.manifests];
        const currentManifest = { ...newManifests[activeTab] };
        const pallets = [...(currentManifest.manifestPallets || [])];
        const sourcePalletIndex = pallets.findIndex(p => p.position === fromPos && !p.isDeleted);
        const destPalletIndex = pallets.findIndex(p => p.position === toPos && !p.isDeleted);

        if (sourcePalletIndex === -1) return;

        if (destPalletIndex !== -1) {
            pallets[sourcePalletIndex].position = toPos;
            pallets[destPalletIndex].position = fromPos;
        } else {
            pallets[sourcePalletIndex].position = toPos;
        }
        currentManifest.manifestPallets = pallets;
        newManifests[activeTab] = currentManifest;
        setFormData(prev => ({ ...prev, manifests: newManifests }));
    };

    const handleCopyPallet = (fromPos, toPos) => {
        let sourcePallet = null;
        formData.manifests.forEach(m => {
            const found = m.manifestPallets?.find(p => p.position === fromPos && !p.isDeleted);
            if (found) sourcePallet = found;
        });
        if (!sourcePallet) return;

        const newPallet = {
            ...sourcePallet,
            idManifestPallet: 0,
            position: toPos,
            manifestPalletLoadings: sourcePallet.manifestPalletLoadings.map(l => ({ ...l, idManifestPalletLoading: 0 }))
        };

        const newManifests = [...formData.manifests];
        const currentManifest = { ...newManifests[activeTab] };
        if (!currentManifest.manifestPallets) currentManifest.manifestPallets = [];
        currentManifest.manifestPallets.push(newPallet);
        newManifests[activeTab] = currentManifest;
        setFormData(prev => ({ ...prev, manifests: newManifests }));
    };

    const handleSubmit = async () => {
        setIsLoading(true);
        try {
            const method = isEditing ? shipmentDataService.editData : shipmentDataService.addData;
            const response = await method(formData, true);

            if (response.isSuccess || response.success) {
                ShowMessage.success(isEditing ? t('shipment_updated_successfully') : t('shipment_created_successfully'));
                navigate('/shipments');
            } else {
                ShowMessage.error(response.message || t('error_saving_shipment'));
            }
        } catch (e) {
            ShowMessage.error(t('server_error_check_data'));
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) return <Box sx={{ p: 5, textAlign: 'center' }}><CircularProgress /></Box>;

    return (
        <Paper sx={{
            // AJUSTE: Menos padding en pantallas pequeñas para ganar espacio
            p: isSmallScreen ? 2 : 4,
            m: isSmallScreen ? 1 : 2
        }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="h5" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <LocalShippingIcon color="primary" />
                    {isEditing ? t('Edit Shipment') : t('New Shipment')}
                </Typography>
            </Box>

            <Grid container spacing={2} sx={{ mb: 4 }}>
                <Grid item xs={12} sm={6} md={4}>
                    <TextField fullWidth required label={t('Name')} name="name" value={formData.name} onChange={handleGeneralChange} />
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                    <TextField fullWidth label={t('Client')} name="idClient" value={formData.idClient || ''} onChange={handleGeneralChange} />
                </Grid>
                <Grid item xs={12} sm={12} md={4}>
                    <FormControlLabel control={<Switch checked={formData.mixed} onChange={handleGeneralChange} name="mixed" />} label={t('Mixed Cargo')} />
                </Grid>
                <Grid item xs={12}>
                    <TextField fullWidth label={t('Address')} name="address" value={formData.address} onChange={handleGeneralChange} />
                </Grid>
            </Grid>

            <Typography variant="h6" gutterBottom sx={{ mt: 4 }}>{t('Load Planning')}</Typography>

            {ALLOW_MULTIPLE_MANIFESTS && (
                <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                    <Tabs
                        value={activeTab}
                        onChange={handleTabChange}
                        variant="scrollable"
                        scrollButtons="auto"
                        allowScrollButtonsMobile // Permite scroll de tabs en móvil
                    >
                        {formData.manifests.map((m, index) => (
                            <Tab
                                key={index}
                                label={
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        {`Manifest #${index + 1}`}
                                        {formData.manifests.length > 1 && (
                                            <CloseIcon fontSize="small" onClick={(e) => handleRemoveManifest(e, index)} />
                                        )}
                                    </Box>
                                }
                            />
                        ))}
                        <IconButton onClick={handleAddManifest} color="primary" sx={{ ml: 1 }}>
                            <AddIcon />
                        </IconButton>
                    </Tabs>
                </Box>
            )}

            <Box sx={{ p: 2, bgcolor: '#fafafa', mb: 2 }}>
                <TextField
                    fullWidth
                    label={t('Manifest Comments')}
                    value={formData.manifests[activeTab]?.comments || ''}
                    onChange={(e) => {
                        const newManifests = [...formData.manifests];
                        newManifests[activeTab].comments = e.target.value;
                        setFormData(prev => ({ ...prev, manifests: newManifests }));
                    }}
                />
            </Box>

            <TrailerGrid
                allManifests={formData.manifests}
                currentManifestIndex={activeTab}
                onUpdatePallet={handleOpenPalletModal}
                onMovePallet={handleMovePallet}
                onCopyPallet={handleCopyPallet}
                onDeletePallet={handleDeletePallet}
                t={t}
            />

            {/* BOTONES DE ACCIÓN */}
            <Box sx={{
                display: 'flex',
                // APILAR BOTONES EN COLUMNA EN PANTALLAS PEQUEÑAS
                flexDirection: isSmallScreen ? 'column' : 'row',
                justifyContent: 'flex-end',
                gap: 2,
                mt: 4
            }}>
                <Button
                    variant="outlined"
                    color="error"
                    startIcon={<CancelIcon />}
                    onClick={() => navigate('/shipments')}
                    fullWidth={isSmallScreen}
                >
                    {t('Cancel')}
                </Button>
                <Button
                    variant="contained"
                    color="primary"
                    startIcon={<SaveIcon />}
                    onClick={handleSubmit}
                    fullWidth={isSmallScreen}
                >
                    {t('Save Shipment')}
                </Button>
            </Box>

            <PalletDetailModal
                open={isPalletModalOpen}
                onClose={() => setIsPalletModalOpen(false)}
                onSave={handleSavePallet}
                onDelete={handleDeletePallet}
                initialData={currentEditingPallet}
                position={currentEditingPosition}
            />
        </Paper>
    );
}

export default ShipmentAddOrEdit;