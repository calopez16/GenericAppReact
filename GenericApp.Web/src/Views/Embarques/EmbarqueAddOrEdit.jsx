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
} from '@mui/material';
import CancelIcon from '@mui/icons-material/Clear';
import SaveIcon from '@mui/icons-material/Save';
import AddIcon from '@mui/icons-material/Add';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import ForkLeftIcon from '@mui/icons-material/ForkLeft';
import LocalShippingIcon from '@mui/icons-material/LocalShipping'; // <-- Ícono de Camión Agregado
import { useTranslation } from 'react-i18next';


// --- SIMULACIÓN DE DATOS Y ESTRUCTURA ---

const generateDummyPallets = (count = 10) => {
    const pallets = [];
    for (let i = 1; i <= count; i++) {
        pallets.push({
            position: i,
            id: i,
            product: `Prod ${i % 3 + 1}`,
            boxesCount: Math.floor(Math.random() * 20) + 10,
            weight: (Math.random() * 500 + 200).toFixed(0),
            isLoaded: true,
        });
    }
    return pallets;
};

const initialFormData = {
    tripNumber: '',
    date: new Date().toISOString().split('T')[0],
    address: '',
    city: '',
    state: '',
    country: 'USA',
    postalCode: '',
    driver: '',
    trailerPlates: '',
    boxPlates: '',
    departureTime: '08:00',
    temperature: 4.0,
    line: '',
    mixed: false,
};


// --- SUBCOMPONENTE 1: Pallet Card (Arrastrable) ---

const PalletCard = ({ pallet, isSelected, onClick, onDragStart }) => (
    <Paper
        draggable
        onDragStart={onDragStart}
        onClick={onClick}
        sx={{
            p: 1, // Reducido el padding
            height: 110, // Reducida la altura para mejor ajuste
            cursor: 'grab',
            textAlign: 'center',
            bgcolor: pallet.isLoaded ? '#e0f7fa' : '#f5f5f5',
            border: `3px solid ${isSelected ? '#FF9800' : (pallet.isLoaded ? '#00BCD4' : '#9e9e9e')}`,
            boxShadow: isSelected ? '0 0 10px rgba(255, 152, 0, 0.8)' : 1,
            transition: 'all 0.2s',
            opacity: pallet.isLoaded ? 1 : 0.7, // Pallets no cargados un poco transparentes
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            '&:active': {
                cursor: 'grabbing',
            }
        }}
    >
        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 'bold' }}>
            POS {pallet.position}
        </Typography>
        <Typography variant="subtitle2" sx={{ fontWeight: 'bold', lineHeight: 1.1 }}>
            <ForkLeftIcon fontSize="inherit" sx={{ mr: 0.5 }} /> {pallet.product}
        </Typography>
        <Box sx={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center' }}>
            <Typography variant="caption" sx={{ fontWeight: 'medium' }}>
                Cajas: {pallet.boxesCount}
            </Typography>
            <Typography variant="caption" sx={{ color: '#d32f2f', fontWeight: 'bold' }}>
                {pallet.weight} kg
            </Typography>
        </Box>
    </Paper>
);


// --- SUBCOMPONENTE 2: Vista del Tráiler y Lógica de Pallets (MODIFICADO) ---

const TrailerView = ({ pallets, setPallets }) => {
    const { t } = useTranslation();
    const [draggedItem, setDraggedItem] = useState(null);
    const [selectedPallets, setSelectedPallets] = useState([]);
    const [swapMessage, setSwapMessage] = useState(null);

    const sortedPallets = pallets.sort((a, b) => a.position - b.position);
    const findPalletByPosition = (position) => sortedPallets.find(p => p.position === position);

    const handleDragStart = (e, pallet) => {
        setDraggedItem(pallet);
        e.dataTransfer.effectAllowed = "move";
    };

    const handleDrop = (e, targetPosition) => {
        e.preventDefault();
        if (!draggedItem || draggedItem.position === targetPosition) return;

        const newPallets = [...pallets];

        const sourceIndex = newPallets.findIndex(p => p.position === draggedItem.position);
        const targetIndex = newPallets.findIndex(p => p.position === targetPosition);

        // Intercambio de posiciones
        if (targetIndex !== -1 && sourceIndex !== -1) {
            // Intercambiar dos pallets existentes
            [newPallets[sourceIndex].position, newPallets[targetIndex].position] =
                [newPallets[targetIndex].position, newPallets[sourceIndex].position];
        } else if (targetIndex === -1 && sourceIndex !== -1) {
            // Mover pallet a un slot vacío (se usa la posición del slot)
            newPallets[sourceIndex].position = targetPosition;
        }

        setPallets(newPallets);
        setDraggedItem(null);
        setSelectedPallets([]);
    };

    const handlePalletClick = (pallet) => {
        const position = pallet.position;
        if (selectedPallets.includes(position)) {
            setSelectedPallets(selectedPallets.filter(pos => pos !== position));
        } else if (selectedPallets.length < 2) {
            setSelectedPallets([...selectedPallets, position]);
        }
    };

    const handleSwapPositions = () => {
        if (selectedPallets.length !== 2) {
            setSwapMessage({ severity: 'warning', text: t('Select exactly two positions to swap.') });
            return;
        }

        const [pos1, pos2] = selectedPallets;

        const newPallets = [...pallets];
        const index1 = newPallets.findIndex(p => p.position === pos1);
        const index2 = newPallets.findIndex(p => p.position === pos2);

        // Intercambio de posiciones
        [newPallets[index1].position, newPallets[index2].position] =
            [newPallets[index2].position, newPallets[index1].position];

        setPallets(newPallets);
        setSelectedPallets([]);
        setSwapMessage({ severity: 'success', text: t(`Positions ${pos1} and ${pos2} swapped successfully!`) });

        // Limpia el mensaje después de un tiempo
        setTimeout(() => setSwapMessage(null), 3000);
    };

    const totalPalletsCount = sortedPallets.length;
    // Nos aseguramos de tener al menos 10 slots o el número actual de pallets, redondeado al par superior.
    const minSlots = 10;
    const currentSlots = Math.max(minSlots, totalPalletsCount % 2 === 0 ? totalPalletsCount : totalPalletsCount + 1);
    const totalPairs = Math.ceil(currentSlots / 2);

    const renderPalletSlot = (position) => {
        const pallet = findPalletByPosition(position);
        const isSelected = selectedPallets.includes(position);

        // Si la posición excede el número de slots, no se renderiza.
        if (position > currentSlots) return null;

        return (
            <Grid item xs={6} key={position}>
                <Box
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => handleDrop(e, position)}
                    onClick={() => pallet && handlePalletClick(pallet)} // Solo si hay pallet para seleccionar
                    sx={{
                        p: 0.5,
                        minHeight: 130,
                        cursor: pallet ? 'pointer' : 'default',
                        border: '1px dashed #90a4ae',
                        borderRadius: 1,
                        bgcolor: isSelected ? '#ffe0b2' : 'transparent',
                        transition: 'all 0.2s',
                        '&:hover': {
                            bgcolor: isSelected ? '#ffcc80' : '#eceff1',
                        }
                    }}
                >
                    {pallet ? (
                        <PalletCard
                            pallet={pallet}
                            isSelected={isSelected}
                            onClick={() => handlePalletClick(pallet)} // Se usa el onClick del Box principal
                            onDragStart={(e) => handleDragStart(e, pallet)}
                        />
                    ) : (
                        <Box sx={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Typography variant="caption" color="text.disabled" sx={{ p: 1, textAlign: 'center' }}>
                                {t('Empty Slot')} **({position})**
                            </Typography>
                        </Box>
                    )}
                </Box>
            </Grid>
        );
    };


    return (
        <Box sx={{ mt: 3 }}>
            {/* Encabezado y Acción de Reemplazar */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">🚚 {t('Pallet Arrangement (Trailer View)')}</Typography>
                <Box>
                    <Tooltip title={selectedPallets.length === 2 ? t('Click to swap selected pallets') : t('Select two positions to swap')}>
                        <span>
                            <Button
                                variant="contained"
                                color="secondary"
                                startIcon={<SwapHorizIcon />}
                                onClick={handleSwapPositions}
                                disabled={selectedPallets.length !== 2}
                            >
                                {t('Replace Position')} ({selectedPallets.length}/2)
                            </Button>
                        </span>
                    </Tooltip>
                </Box>
            </Box>

            {swapMessage && (
                <Alert severity={swapMessage.severity} onClose={() => setSwapMessage(null)} sx={{ mb: 2 }}>
                    {swapMessage.text}
                </Alert>
            )}

            <Paper elevation={3} sx={{ p: 2, bgcolor: '#f0f4f7', border: '2px solid #546e7a' }}>

                {/* Visualización del Frente del Camión */}
                <Box
                    sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        py: 2,
                        mb: 2,
                        bgcolor: '#424242', // Gris Oscuro para el Frente
                        color: 'white',
                        borderRadius: 1,
                        border: '2px solid #ffeb3b',
                    }}
                >
                    <LocalShippingIcon sx={{ fontSize: 60, mb: 1, color: '#ffeb3b' }} />
                    <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                        {t('TRUCK FRONT')}
                    </Typography>
                </Box>


                {/* Área de Pallets */}
                <Grid container spacing={2}>
                    {/* Renderiza en pares (uno arriba, otro abajo) */}
                    {Array.from({ length: totalPairs }).map((_, i) => {
                        const pos1 = i * 2 + 1; // Posición Superior (Impar)
                        const pos2 = i * 2 + 2; // Posición Inferior (Par)

                        return (
                            <Grid item xs={12} key={i}>
                                <Typography variant="caption" sx={{ display: 'block', textAlign: 'center', mb: 0.5, color: '#455a64', fontWeight: 'bold' }}>
                                    --- {t('ROW')} {i + 1} ---
                                </Typography>
                                <Grid container spacing={2}>
                                    {/* Slot 1 (Superior/Izquierda) */}
                                    {renderPalletSlot(pos1)}
                                    {/* Slot 2 (Inferior/Derecha) */}
                                    {pos2 <= currentSlots && renderPalletSlot(pos2)}
                                </Grid>
                            </Grid>
                        );
                    })}
                </Grid>

                {/* Parte Trasera del Tráiler (Puerta) */}
                <Box sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    py: 1,
                    mt: 2,
                    bgcolor: '#78909c', // Gris más claro para la parte trasera
                    color: 'white',
                    borderBottomLeftRadius: 4,
                    borderBottomRightRadius: 4,
                }}>
                    <Typography variant="subtitle2">
                        {t('TRAILER DOOR')} &rarr; **({currentSlots} Total Slots)**
                    </Typography>
                </Box>
            </Paper>
        </Box>
    );
};


// -----------------------------------------------------------------------
// --- COMPONENTE PRINCIPAL: EmbarqueAddOrEdit (SIN CAMBIOS ESTRUCTURALES) ---
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
            // --- Simulación de Carga (Datos de Pallets y Formulario) ---
            const initialPallets = isEditing ? generateDummyPallets(parseInt(id) * 2) : generateDummyPallets(10);

            let initialData = initialFormData;
            if (isEditing && id) {
                // Simulación de carga de datos de formulario
                initialData = {
                    ...initialFormData,
                    tripNumber: `V${id}`,
                    driver: `Driver ${id} (Loaded)`,
                    city: 'Phoenix',
                    state: 'AZ',
                    country: 'USA',
                    date: '2025-10-15',
                    temperature: 5.5,
                    mixed: true,
                    trailerPlates: `TRL${id}`,
                    boxPlates: `BOX${id}`,
                    departureTime: '10:30',
                    address: '123 Main St',
                    postalCode: '85001'
                };
            }

            setPallets(initialPallets);
            setFormData(initialData);
            setIsPageLoading(false);
            // --- Fin Simulación ---
        };
        loadShipmentData();
    }, [isEditing, id]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    };

    const handleSubmit = async () => {
        const shipmentPayload = {
            id: isEditing ? parseInt(id) : 0,
            ...formData,
            // IMPORTANTE: Se envían los pallets con sus posiciones finales
            pallets: pallets.map(p => ({
                id: p.id,
                position: p.position
            })),
            temperature: parseFloat(formData.temperature),
        };

        console.log("Submitting Payload with Pallets:", shipmentPayload);

        setIsLoading(true);
        try {
            await new Promise(resolve => setTimeout(resolve, 1500));
            // ShowMessage(t(...), 'success');
            navigate('/embarques');
        } catch (error) {
            // ShowMessage(t('error'), 'error');
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

            <Grid container spacing={4}>

                {/* Columna Izquierda: Datos del Embarque (100% en móvil, 50% en escritorio) */}
                <Grid item xs={12} md={6}>
                    <Box component="form" noValidate>

                        {/* Sección 1: Datos Generales */}
                        <Typography variant="h6" gutterBottom>{t('General Information')}</Typography>
                        <Grid container spacing={3}>

                            {/* Trip Number */}
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    required
                                    fullWidth
                                    label={t('Trip Number')}
                                    name="tripNumber"
                                    value={formData.tripNumber}
                                    onChange={handleChange}
                                />
                            </Grid>

                            {/* Driver */}
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    required
                                    fullWidth
                                    label={t('Driver')}
                                    name="driver"
                                    value={formData.driver}
                                    onChange={handleChange}
                                />
                            </Grid>

                            {/* Shipping Line */}
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    label={t('Shipping Line')}
                                    name="line"
                                    value={formData.line}
                                    onChange={handleChange}
                                />
                            </Grid>

                            {/* Date */}
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    required
                                    fullWidth
                                    label={t('Date')}
                                    name="date"
                                    type="date"
                                    value={formData.date}
                                    onChange={handleChange}
                                    InputLabelProps={{ shrink: true }}
                                />
                            </Grid>

                            {/* Departure Time */}
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    required
                                    fullWidth
                                    label={t('Departure Time')}
                                    name="departureTime"
                                    type="time"
                                    value={formData.departureTime}
                                    onChange={handleChange}
                                    InputLabelProps={{ shrink: true }}
                                />
                            </Grid>

                            {/* Temperature */}
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    required
                                    fullWidth
                                    label={t('Temperature')}
                                    name="temperature"
                                    type="number"
                                    inputProps={{ step: "0.1" }}
                                    value={formData.temperature}
                                    onChange={handleChange}
                                    InputProps={{ endAdornment: <InputAdornment position="end">°C</InputAdornment> }}
                                />
                            </Grid>
                        </Grid>

                        {/* --- Sección 2: Logística y Ubicación --- */}
                        <Box sx={{ my: 4 }} />
                        <Typography variant="h6" gutterBottom>{t('Logistics and Location')}</Typography>
                        <Grid container spacing={3}>

                            {/* Trailer Plates */}
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    required
                                    fullWidth
                                    label={t('Trailer Plates')}
                                    name="trailerPlates"
                                    value={formData.trailerPlates}
                                    onChange={handleChange}
                                />
                            </Grid>

                            {/* Box Plates */}
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    label={t('Box Plates')}
                                    name="boxPlates"
                                    value={formData.boxPlates}
                                    onChange={handleChange}
                                />
                            </Grid>

                            {/* Mixed Cargo Switch */}
                            <Grid item xs={12} sm={6} sx={{ display: 'flex', alignItems: 'center' }}>
                                <FormControlLabel
                                    control={
                                        <Switch
                                            checked={formData.mixed}
                                            onChange={handleChange}
                                            name="mixed"
                                            color="secondary"
                                        />
                                    }
                                    label={t('Mixed Cargo')}
                                />
                            </Grid>

                            {/* City / State */}
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    required
                                    fullWidth
                                    label={t('City')}
                                    name="city"
                                    value={formData.city}
                                    onChange={handleChange}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    label={t('State')}
                                    name="state"
                                    value={formData.state}
                                    onChange={handleChange}
                                />
                            </Grid>

                            {/* Country / Postal Code */}
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    label={t('Country')}
                                    name="country"
                                    value={formData.country}
                                    onChange={handleChange}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    label={t('Postal Code')}
                                    name="postalCode"
                                    value={formData.postalCode}
                                    onChange={handleChange}
                                />
                            </Grid>

                            {/* Address */}
                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    label={t('Address')}
                                    name="address"
                                    value={formData.address}
                                    onChange={handleChange}
                                    multiline
                                    rows={2}
                                />
                            </Grid>

                        </Grid>
                    </Box>
                </Grid>

                {/* Columna Derecha: Vista del Tráiler (100% en móvil, 50% en escritorio) */}
                <Grid item xs={12} md={6}>
                    <TrailerView pallets={pallets} setPallets={setPallets} />
                </Grid>
            </Grid>

            {/* Acciones de la página */}
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, pt: 4, borderTop: '1px solid #eee', mt: 4 }}>
                <Button color="error" variant="outlined" endIcon={<CancelIcon />} onClick={handleCancel}>
                    {t('Cancel')}
                </Button>
                <Button
                    color="primary"
                    variant="contained"
                    endIcon={isEditing ? <SaveIcon /> : <AddIcon />}
                    onClick={handleSubmit}
                    disabled={isLoading}
                >
                    {isLoading ? <CircularProgress size={24} color="inherit" /> : (isEditing ? t('Save Changes') : t('Create Shipment'))}
                </Button>
            </Box>
        </Paper>
    );
};

export default EmbarqueAddOrEdit;