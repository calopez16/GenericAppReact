import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    TextField,
    Button,
    Box,
    Typography,
    Grid,
    FormControlLabel,
    Switch,
    InputAdornment,
    Paper,
    CircularProgress,
    Tooltip,
    Alert,
    Modal,
    IconButton,
} from '@mui/material';
import CancelIcon from '@mui/icons-material/Clear';
import SaveIcon from '@mui/icons-material/Save';
import AddIcon from '@mui/icons-material/Add';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import CloseIcon from '@mui/icons-material/Close';
import DeleteIcon from '@mui/icons-material/Delete';
import { useTranslation } from 'react-i18next';


// --- CONSTANTES Y SIMULACIÓN DE DATOS ---
const MAX_PALLETS = 26;
const MAX_PAIRS = 13;
const destinations = ['Miami', 'New York', 'Dallas', 'Chicago'];

const getNextPalletId = (pallets) => {
    if (pallets.length === 0) return 1;
    return Math.max(...pallets.filter(p => p.id > 0).map(p => p.id), 0) + 1;
};

const generateDummyPallets = (count = 16) => {
    const actualCount = Math.min(count, MAX_PALLETS);
    const pallets = [];
    for (let i = 1; i <= actualCount; i++) {
        pallets.push({
            position: i, id: i, product: `Prod ${i % 3 + 1}`,
            boxesCount: Math.floor(Math.random() * 20) + 10,
            weight: (Math.random() * 500 + 200).toFixed(0),
            isLoaded: true, volume: (Math.random() * 1.5 + 1.0).toFixed(2),
            batch: `LOTE-${(Math.floor(Math.random() * 999) + 100)}`,
            destination: destinations[i % destinations.length],
        });
    }
    return pallets;
};

const initialFormData = {
    tripNumber: '', date: new Date().toISOString().split('T')[0], address: '', city: '', state: '', country: 'USA', postalCode: '', driver: '', trailerPlates: '', boxPlates: '', departureTime: '08:00', temperature: 4.0, line: '', mixed: false,
};


// -----------------------------------------------------------------------
// --- SUBCOMPONENTE: PalletModal ---
// -----------------------------------------------------------------------

const PalletModal = ({ open, onClose, pallet, isLoaded, nextPalletId, onSave, onDelete }) => {
    const { t } = useTranslation();
    const isNew = !isLoaded;

    const initialPalletData = isLoaded ? pallet : {
        position: pallet.position, product: '', boxesCount: 1, weight: 100, volume: 1.0, batch: '', destination: destinations[0], isLoaded: true, id: nextPalletId,
    };
    const [formData, setFormData] = useState(initialPalletData);
    const [isSaving, setIsSaving] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        setFormData(initialPalletData);
    }, [pallet, isLoaded, nextPalletId]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSave = async () => {
        if (isNew && (!formData.product || formData.product.trim() === '')) {
            alert(t('Please define a product for the new pallet.'));
            return;
        }

        setIsSaving(true);
        try {
            await new Promise(resolve => setTimeout(resolve, 500));
            const palletToSave = {
                ...formData, position: pallet.position,
                boxesCount: parseInt(formData.boxesCount), weight: formData.weight.toString(),
                volume: formData.volume.toString(), id: isNew ? nextPalletId : formData.id, isLoaded: true,
            };
            onSave(palletToSave, isNew);
            onClose();
        } catch (error) {
            console.error("Error saving pallet:", error);
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!window.confirm(t('Are you sure you want to unload this pallet?'))) return;

        setIsDeleting(true);
        try {
            await new Promise(resolve => setTimeout(resolve, 500));
            onDelete(pallet.position);
            onClose();
        } catch (error) {
            console.error("Error deleting pallet:", error);
        } finally {
            setIsDeleting(false);
        }
    };

    // Estilos de Modal minimalistas (ajustados para el uso de Box en Material UI)
    const modalStyle = {
        position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
        width: { xs: '95%', sm: 500, md: 600 }, bgcolor: 'background.paper', boxShadow: 24, p: 4, borderRadius: 2, maxHeight: '90vh', overflowY: 'auto',
    };

    return (
        <Modal open={open} onClose={onClose} aria-labelledby="pallet-modal-title">
            <Box sx={modalStyle}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                    <Typography id="pallet-modal-title" variant="h5" component="h2"
                        sx={{ fontWeight: 'bold', color: isNew ? '#4caf50' : '#00BCD4' }}>
                        {isNew ? t('Load New Pallet') : t('Pallet Details')} - POS {pallet.position}
                    </Typography>
                    <IconButton onClick={onClose}><CloseIcon /></IconButton>
                </Box>

                <Grid container spacing={2}>
                    <Grid item xs={6}>
                        <TextField fullWidth label={t('Pallet ID')} value={isNew ? t('New (ID') + ` ${nextPalletId})` : formData.id} disabled variant="outlined" />
                    </Grid>
                    <Grid item xs={6}>
                        <TextField fullWidth label={t('Loaded Status')} value={isLoaded ? t('Loaded') : t('Empty')} disabled variant="outlined" sx={{ '& .MuiInputBase-input': { color: isLoaded ? 'green' : 'red', fontWeight: 'bold' } }} />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <TextField required fullWidth label={t('Product')} name="product" value={formData.product} onChange={handleChange} disabled={isDeleting} />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <TextField fullWidth label={t('Batch / Lot')} name="batch" value={formData.batch} onChange={handleChange} disabled={isDeleting} />
                    </Grid>
                    <Grid item xs={12}>
                        <TextField select fullWidth label={t('Destination')} name="destination" value={formData.destination} onChange={handleChange} SelectProps={{ native: true }} disabled={isDeleting} >
                            {destinations.map(dest => (<option key={dest} value={dest}>{dest}</option>))}
                        </TextField>
                    </Grid>
                    <Grid item xs={4}>
                        <TextField fullWidth label={t('Weight (kg)')} name="weight" type="number" inputProps={{ step: "1" }} value={formData.weight} onChange={handleChange} disabled={isDeleting} />
                    </Grid>
                    <Grid item xs={4}>
                        <TextField fullWidth label={t('Boxes')} name="boxesCount" type="number" inputProps={{ step: "1", min: "1" }} value={formData.boxesCount} onChange={handleChange} disabled={isDeleting} />
                    </Grid>
                    <Grid item xs={4}>
                        <TextField fullWidth label={t('Volume (m³)')} name="volume" type="number" inputProps={{ step: "0.01" }} value={formData.volume} onChange={handleChange} disabled helperText={t('Calculated Volume')} />
                    </Grid>
                </Grid>

                <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2, pt: 3, mt: 3, borderTop: '1px solid #eee' }}>
                    {isLoaded && (
                        <Tooltip title={t('Unload Pallet')} placement="top">
                            <Button
                                color="error" variant="outlined"
                                startIcon={isDeleting ? <CircularProgress size={20} color="inherit" /> : <DeleteIcon />}
                                onClick={handleDelete} disabled={isDeleting || isSaving}
                            >
                                {isDeleting ? t('Unloading...') : t('Unload')}
                            </Button>
                        </Tooltip>
                    )}

                    <Box sx={{ ml: 'auto', display: 'flex', gap: 2 }}>
                        <Button color="inherit" variant="outlined" onClick={onClose} disabled={isSaving || isDeleting}>
                            {t('Cancel')}
                        </Button>
                        <Button
                            color="primary" variant="contained"
                            startIcon={isSaving ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
                            onClick={handleSave} disabled={isSaving || isDeleting || (isNew && formData.product.trim() === '')}
                        >
                            {isSaving ? t('Saving...') : (isNew ? t('Load Pallet') : t('Update Pallet'))}
                        </Button>
                    </Box>
                </Box>
            </Box>
        </Modal>
    );
};

// -----------------------------------------------------------------------
// --- SUBCOMPONENTE PLANO 2D (CSS MANEJADO POR CLASES) ---
// -----------------------------------------------------------------------

const Truck2DView = ({ pallets, onSelectPallet, selectedPalletPosition }) => {
    const { t } = useTranslation();

    const sortedPallets = pallets.sort((a, b) => a.position - b.position);
    const palletMap = sortedPallets.reduce((acc, p) => {
        acc[p.position] = p;
        return acc;
    }, {});

    /**
     * Dibuja un slot de palet.
     */
    const PalletSlot = ({ position }) => {
        const pallet = palletMap[position];
        const isLoaded = !!pallet;
        const isSelected = selectedPalletPosition === position;

        const handleClick = () => {
            const data = isLoaded ? pallet : { position: position, isLoaded: false };
            onSelectPallet(data);
        };

        const className = `pallet-slot ${isLoaded ? 'pallet-loaded' : 'pallet-empty'} ${isSelected ? 'pallet-selected' : ''}`;

        if (isLoaded) {
            return (
                <Tooltip title={`${pallet.product} (${pallet.boxesCount} cajas, ${pallet.weight} kg)`} arrow>
                    <Paper elevation={2} onClick={handleClick} className={className}>
                        <Typography variant="caption" sx={{ color: 'white', fontWeight: 'bold' }}>POS {position}</Typography>
                        <Typography variant="body2" sx={{ color: 'white', fontSize: '0.75rem', lineHeight: 1 }}>{pallet.product}</Typography>
                        <Typography variant="caption" sx={{ color: 'white', fontSize: '0.65rem' }}>{pallet.weight} kg</Typography>
                    </Paper>
                </Tooltip>
            );
        }

        return (
            <Paper elevation={0} onClick={handleClick} className={className}>
                <Typography variant="caption" color="text.disabled">SLOT {position}</Typography>
                <AddIcon color={isSelected ? 'success' : 'disabled'} />
            </Paper>
        );
    };

    const rows = Array.from({ length: MAX_PAIRS }, (_, i) => [i * 2 + 1, i * 2 + 2]);

    return (
        <Box className="truck-container">
            {/* 1. CABINA (Kenworth T680 - FIJA) */}
            <Paper elevation={3} className="truck-cabin">
                <LocalShippingIcon sx={{ color: 'white', fontSize: 30, mt: 1 }} />
            </Paper>

            {/* 2. TRÁILER (Área de Carga con SCROLL HORIZONTAL) */}
            <Paper elevation={3} className="truck-trailer">
                <Typography variant="caption" className="trailer-header">
                    {t('Trailer Cargo Area')} - {MAX_PALLETS} POSITIONS
                </Typography>

                <Box className="pallet-scroller">
                    {rows.map((pair, index) => (
                        <Box
                            key={index}
                            className={`pallet-pair-column ${index === MAX_PAIRS - 1 ? 'last-column' : ''}`}
                        >
                            <Typography variant="caption" sx={{ fontWeight: 'bold' }}>FILA {index + 1}</Typography>
                            <PalletSlot position={pair[0]} />
                            <PalletSlot position={pair[1]} />
                        </Box>
                    ))}
                </Box>
            </Paper>
        </Box>
    );
};

// -----------------------------------------------------------------------
// --- SUBCOMPONENTE C: El Contenedor Lógico del Dashboard (TrailerView) ---
// -----------------------------------------------------------------------

const TrailerView = ({ pallets, setPallets }) => {
    const { t } = useTranslation();
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedPalletData, setSelectedPalletData] = useState(null);
    const [message, setMessage] = useState(null);

    const nextPalletId = getNextPalletId(pallets);

    const handlePalletClick = useCallback((pallet) => {
        setSelectedPalletData(pallet);
        setModalOpen(true);
        setMessage(null);
    }, []);

    const handleModalClose = () => {
        setModalOpen(false);
        setSelectedPalletData(null);
    };

    const handleSavePallet = (palletToSave, isNew) => {
        if (isNew) {
            setPallets(prevPallets => [...prevPallets, palletToSave]);
            setMessage({ severity: 'success', text: t(`Pallet ${palletToSave.id} loaded at position ${palletToSave.position}.`) });
        } else {
            setPallets(prevPallets => prevPallets.map(p =>
                p.position === palletToSave.position ? palletToSave : p
            ));
            setMessage({ severity: 'info', text: t(`Pallet ${palletToSave.id} updated at position ${palletToSave.position}.`) });
        }
    };

    const handleDeletePallet = (position) => {
        setPallets(prevPallets => prevPallets.filter(p => p.position !== position));
        setMessage({ severity: 'warning', text: t(`Pallet unloaded from position ${position}.`) });
    };

    return (
        <Box >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h5">
                    <LocalShippingIcon sx={{ mr: 1, color: '#d32f2f' }} /> {t('Loading Dashboard (2D View)')}
                </Typography>
                <Typography variant="h6" color="text.secondary">
                    {t('Capacity')}: {pallets.length}/{MAX_PALLETS}
                </Typography>
            </Box>

            {message && (
                <Alert severity={message.severity} onClose={() => setMessage(null)} sx={{ mb: 2 }}>
                    {message.text}
                </Alert>
            )}

            {/* --- VISTA 2D DEL CAMIÓN --- */}
            <Grid>
                <Grid >
                    <Truck2DView
                        pallets={pallets}
                        onSelectPallet={handlePalletClick}
                        selectedPalletPosition={selectedPalletData ? selectedPalletData.position : null}
                    />
                </Grid>
            </Grid>

            <Typography variant="caption" sx={{ display: 'block', textAlign: 'center', mt: 1, color: '#455a64' }}>
                * {t('Click on any position to load, unload or modify pallet information.')}
            </Typography>

            {/* 🆕 MODAL CENTRALIZADO */}
            {selectedPalletData && (
                <PalletModal
                    open={modalOpen}
                    onClose={handleModalClose}
                    pallet={selectedPalletData}
                    isLoaded={selectedPalletData.isLoaded}
                    nextPalletId={nextPalletId}
                    onSave={handleSavePallet}
                    onDelete={handleDeletePallet}
                />
            )}
        </Box>
    );
};


// -----------------------------------------------------------------------
// --- COMPONENTE PRINCIPAL: EmbarqueAddOrEdit ---
// -----------------------------------------------------------------------

const EmbarqueAddOrEdit = ({ isEditing }) => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { id } = useParams();

    const [formData, setFormData] = useState(initialFormData);
    const [pallets, setPallets] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isPageLoading, setIsPageLoading] = useState(true);

    useEffect(() => {
        const loadShipmentData = async () => {
            const initialLoadedPallets = isEditing ? generateDummyPallets(parseInt(id) * 3 + 10) : generateDummyPallets(16);

            setPallets(initialLoadedPallets);

            let initialData = initialFormData;
            if (isEditing && id) {
                initialData = {
                    ...initialFormData,
                    tripNumber: `V${id}`,
                    driver: `Driver ${id} (Loaded)`,
                    city: 'Phoenix', state: 'AZ', country: 'USA', date: '2025-10-15', temperature: 5.5, mixed: true, trailerPlates: `TRL${id}`, boxPlates: `BOX${id}`, departureTime: '10:30', address: '123 Main St', postalCode: '85001'
                };
            }

            setFormData(initialData);
            setIsPageLoading(false);
        };
        loadShipmentData();
    }, [isEditing, id]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    };

    const handleSubmit = async () => {
        const loadedPallets = pallets.filter(p => p.isLoaded && p.product !== 'VACÍO');

        const shipmentPayload = {
            id: isEditing ? parseInt(id) : 0, ...formData,
            pallets: loadedPallets.map(p => ({
                id: p.id, position: p.position, product: p.product, boxesCount: p.boxesCount, weight: p.weight, volume: p.volume, batch: p.batch, destination: p.destination,
            })),
            temperature: parseFloat(formData.temperature),
        };

        console.log("Submitting Payload with Pallets:", shipmentPayload);

        setIsLoading(true);
        try {
            await new Promise(resolve => setTimeout(resolve, 1500));
            navigate('/embarques');
        } catch (error) {
            console.error("Error saving shipment:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCancel = () => {
        navigate('/embarques');
    };

    if (isPageLoading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4, py: 8 }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Paper elevation={3} sx={{ p: 4, m: { xs: 1, sm: 2, md: 4 } }}>
            <Typography variant="h4" component="h1" gutterBottom>
                {isEditing ? t('Edit Shipment') : t('Add New Shipment')}
            </Typography>

            {/* FILA 1: Formulario de Datos */}
            <Grid container spacing={4} sx={{ mb: 4 }}>
                <Grid item xs={12}>
                    <Typography variant="h6" gutterBottom>{t('Shipment Data')}</Typography>
                    <Grid container spacing={3} component="form" noValidate>
                        <Grid item xs={12} sm={6}><TextField required fullWidth label={t('Trip Number')} name="tripNumber" value={formData.tripNumber} onChange={handleChange} /></Grid>
                        <Grid item xs={12} sm={6}><TextField required fullWidth label={t('Driver')} name="driver" value={formData.driver} onChange={handleChange} /></Grid>
                        <Grid item xs={12} sm={6}><TextField fullWidth label={t('Shipping Line')} name="line" value={formData.line} onChange={handleChange} /></Grid>
                        <Grid item xs={12} sm={6}><TextField required fullWidth label={t('Date')} name="date" type="date" value={formData.date} onChange={handleChange} InputLabelProps={{ shrink: true }} /></Grid>
                        <Grid item xs={12} sm={6}><TextField required fullWidth label={t('Departure Time')} name="departureTime" type="time" value={formData.departureTime} onChange={handleChange} InputLabelProps={{ shrink: true }} /></Grid>
                        <Grid item xs={12} sm={6}><TextField required fullWidth label={t('Temperature')} name="temperature" type="number" inputProps={{ step: "0.1" }} value={formData.temperature} onChange={handleChange} InputProps={{ endAdornment: <InputAdornment position="end">°C</InputAdornment> }} /></Grid>

                        <Grid item xs={12}><Typography variant="subtitle1" sx={{ mt: 2 }}>{t('Logistics and Location')}</Typography></Grid>
                        <Grid item xs={12} sm={6}><TextField required fullWidth label={t('Trailer Plates')} name="trailerPlates" value={formData.trailerPlates} onChange={handleChange} /></Grid>
                        <Grid item xs={12} sm={6}><TextField fullWidth label={t('Box Plates')} name="boxPlates" value={formData.boxPlates} onChange={handleChange} /></Grid>
                        <Grid item xs={12} sm={6}><FormControlLabel control={<Switch checked={formData.mixed} onChange={handleChange} name="mixed" color="secondary" />} label={t('Mixed Cargo')} /></Grid>
                        <Grid item xs={12} sm={6}><TextField required fullWidth label={t('City')} name="city" value={formData.city} onChange={handleChange} /></Grid>
                        <Grid item xs={12} sm={6}><TextField fullWidth label={t('State')} name="state" value={formData.state} onChange={handleChange} /></Grid>
                        <Grid item xs={12} sm={6}><TextField fullWidth label={t('Country')} name="country" value={formData.country} onChange={handleChange} /></Grid>
                        <Grid item xs={12} sm={6}><TextField fullWidth label={t('Postal Code')} name="postalCode" value={formData.postalCode} onChange={handleChange} /></Grid>
                        <Grid item xs={12}><TextField fullWidth label={t('Address')} name="address" value={formData.address} onChange={handleChange} multiline rows={2} /></Grid>
                    </Grid>
                </Grid>
            </Grid>

            {/* FILA 2: Dashboard de Carga (2D con Scroll) */}
            <Box>
                <TrailerView pallets={pallets} setPallets={setPallets} />
            </Box>

            {/* Acciones de la página */}
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, pt: 4, borderTop: '1px solid #eee', mt: 4 }}>
                <Button color="error" variant="outlined" endIcon={<CancelIcon />} onClick={handleCancel}>
                    {t('Cancel')}
                </Button>
                <Button
                    color="primary" variant="contained" endIcon={isEditing ? <SaveIcon /> : <AddIcon />}
                    onClick={handleSubmit} disabled={isLoading}
                >
                    {isLoading ? <CircularProgress size={24} color="inherit" /> : (isEditing ? t('Save Changes') : t('Create Shipment'))}
                </Button>
            </Box>
        </Paper>
    );
};

export default EmbarqueAddOrEdit;