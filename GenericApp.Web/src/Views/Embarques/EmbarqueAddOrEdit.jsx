import React, { useState, useEffect, useCallback, useRef } from 'react';
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
import ForkLeftIcon from '@mui/icons-material/ForkLeft'; // ✅ This line is now clean
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import { useTranslation } from 'react-i18next';

// -----------------------------------------------------------------------
// --- IMPORTACIONES 3D (REQUIERE: three, @react-three/fiber, @react-three/drei) ---
import { Canvas } from '@react-three/fiber';
import { OrbitControls, ContactShadows } from '@react-three/drei';

// --- CONSTANTES Y SIMULACIÓN DE DATOS ---
const MAX_PALLETS = 26;
const MAX_PAIRS = MAX_PALLETS / 2; // 13 filas
const destinations = ['Miami', 'New York', 'Dallas', 'Chicago'];

// 🆕 Función para obtener el próximo ID, asegurando que sea único (mayor que el más alto actual)
const getNextPalletId = (pallets) => {
    if (pallets.length === 0) return 1;
    return Math.max(...pallets.map(p => p.id)) + 1;
};

const generateDummyPallets = (count = 16) => {
    const actualCount = Math.min(count, MAX_PALLETS);
    const pallets = [];
    for (let i = 1; i <= actualCount; i++) {
        pallets.push({
            position: i,
            id: i,
            product: `Prod ${i % 3 + 1}`,
            boxesCount: Math.floor(Math.random() * 20) + 10,
            weight: (Math.random() * 500 + 200).toFixed(0),
            isLoaded: i <= MAX_PALLETS - 2 ? true : false,
            // 🆕 DATOS AÑADIDOS
            volume: (Math.random() * 1.5 + 1.0).toFixed(2), // Volumen en m³
            batch: `LOTE-${(Math.floor(Math.random() * 999) + 100)}`, // Lote simulado
            destination: destinations[i % destinations.length], // Destino simulado
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


// -----------------------------------------------------------------------
// --- SUBCOMPONENTES 3D (FIJADOS A 26 PALETS) ---
// -----------------------------------------------------------------------

// --- Palet con Tarima y Carga separadas ---
const Pallet3D = ({ pallet, isSelected, onClick, get3DPosition }) => {
    const [x, y, z] = get3DPosition(pallet.position);

    const loadColor = isSelected ? '#FF9800' : (pallet.isLoaded ? '#00BCD4' : '#607d8b');
    const baseColor = pallet.isLoaded ? '#8d6e63' : '#4e342e';
    const loadHeight = 1.0;
    const baseHeight = 0.2;

    return (
        <group position={[x, y, z]} onClick={(e) => {
            e.stopPropagation();
            onClick(pallet);
        }} castShadow receiveShadow>

            {/* 1. Tarima (Base del Palet) */}
            <mesh position={[0, baseHeight / 2, 0]} castShadow receiveShadow>
                <boxGeometry args={[2.2, baseHeight, 2.4]} />
                <meshStandardMaterial color={baseColor} />
            </mesh>

            {/* 2. Carga (Caja sobre la tarima) - Sombreada en 3D */}
            {pallet.isLoaded && (
                <mesh position={[0, baseHeight + loadHeight / 2, 0]} castShadow>
                    <boxGeometry args={[2.0, loadHeight, 2.2]} />
                    <meshStandardMaterial color={loadColor} />
                </mesh>
            )}

        </group>
    );
};

// --- Escena del Tráiler y Camión (Modelo Kenworth T880) ---
const Trailer3DScene = ({ pallets, handlePalletClick, selectedPallets }) => {

    // Dimensiones fijas para 13 pares de palets
    const trailerWidth = 5.0;
    const palletSpacing = 0.3;
    const palletSizeZ = 2.4;

    const cargoLength = MAX_PAIRS * (palletSizeZ + palletSpacing);
    const truckCabinLength = 4.5;
    const connectionGap = 1.0;
    const trailerWallDepth = 0.2;

    // AJUSTE: Desplazamiento de la caja del tráiler hacia atrás
    const trailerZAdjust = 1.2;

    const totalSceneLength = cargoLength + truckCabinLength + connectionGap + trailerWallDepth;

    // Z Offset: Punto de referencia central para el modelo del camión
    const zOffset = (totalSceneLength / 2) - connectionGap - truckCabinLength / 2;

    // Z Central del Tráiler: Usado para posicionar la caja de carga
    const trailerCenterZ = zOffset - cargoLength / 2 + palletSizeZ / 2 - trailerZAdjust;

    // Función de Posicionamiento 3D (usa constantes fijas)
    const get3DPosition = useCallback((position) => {
        if (position > MAX_PALLETS) return [0, -100, 0];

        const row = Math.floor((position - 1) / 2);
        const side = (position - 1) % 2;

        const x = side === 0 ? -1.5 : 1.5;

        // Y: La posición Y de cada palet es 0 (base del tráiler)
        const z = zOffset - (row * (palletSizeZ + palletSpacing)) - palletSizeZ / 2 - trailerZAdjust;
        return [x, 0, z];
    }, [palletSizeZ, palletSpacing, zOffset, trailerZAdjust]);


    // 📐 CÁLCULO PARA VISTA CENITAL FIJA
    const viewCenterZ = zOffset + connectionGap / 2;

    return (
        <group>

            {/* 1. ILUMINACIÓN (Mantenida fuera del grupo de rotación para evitar girar la fuente de luz) */}
            <ambientLight intensity={0.5} />
            <directionalLight
                // Luz Principal
                position={[5, 10, zOffset / 2]}
                intensity={2.0}
                castShadow
                shadow-mapSize-width={2048}
                shadow-mapSize-height={2048}
                shadow-camera-near={0.1}
                shadow-camera-far={30}
                shadow-camera-left={-10}
                shadow-camera-right={10}
                shadow-camera-top={10}
                shadow-camera-bottom={-10}
            />
            <directionalLight
                // Luz de Relleno
                position={[-5, 5, zOffset / 2 + 5]}
                intensity={0.8}
            />

            {/* 🚀 GRUPO DE ROTACIÓN: Aplica una rotación de 90 grados (π/2) alrededor del eje Y a todo el modelo. */}
            <group rotation={[0, Math.PI / 2, 0]}>

                {/* 2. ENTORNO DEL TRÁILER (Paredes y Piso - FIJAS) */}
                <group position={[0, 0, trailerCenterZ]}>

                    {/* Suelo/Piso del Tráiler (área de carga) */}
                    <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
                        <planeGeometry args={[trailerWidth, cargoLength + trailerWallDepth]} />
                        <meshStandardMaterial color="#6d4c41" />
                    </mesh>

                    {/* Pared Trasera (Puerta) */}
                    <mesh position={[0, 2, cargoLength / 2]} receiveShadow>
                        <boxGeometry args={[trailerWidth, 4, trailerWallDepth]} />
                        <meshStandardMaterial color="#cfd8dc" />
                    </mesh>

                    {/* RUEDAS DEL TRÁILER (Doble Eje Trasero) - AJUSTE EN Y NEGATIVO */}
                    {/* Eje Trasero 1 */}
                    <mesh position={[-1.8, -0.5, cargoLength / 2 - 2.0]} rotation={[0, 0, Math.PI / 2]} castShadow>
                        <cylinderGeometry args={[0.7, 0.7, 0.8, 16]} />
                        <meshStandardMaterial color="#424242" />
                    </mesh>
                    <mesh position={[1.8, -0.5, cargoLength / 2 - 2.0]} rotation={[0, 0, Math.PI / 2]} castShadow>
                        <cylinderGeometry args={[0.7, 0.7, 0.8, 16]} />
                        <meshStandardMaterial color="#424242" />
                    </mesh>
                    {/* Eje Trasero 2 */}
                    <mesh position={[-1.8, -0.5, cargoLength / 2 - 3.5]} rotation={[0, 0, Math.PI / 2]} castShadow>
                        <cylinderGeometry args={[0.7, 0.7, 0.8, 16]} />
                        <meshStandardMaterial color="#424242" />
                    </mesh>
                    <mesh position={[1.8, -0.5, cargoLength / 2 - 3.5]} rotation={[0, 0, Math.PI / 2]} castShadow>
                        <cylinderGeometry args={[0.7, 0.7, 0.8, 16]} />
                        <meshStandardMaterial color="#424242" />
                    </mesh>

                </group>

                {/* 3. MODELO DE CAMIÓN (Cabina y Motor) */}
                <group position={[0, 0, zOffset + connectionGap / 2 + truckCabinLength / 2]} >
                    {/* Cabina Principal */}
                    <mesh position={[0, 1.8, -0.5]} castShadow>
                        <boxGeometry args={[3.8, 3.6, truckCabinLength - 0.5]} />
                        <meshStandardMaterial color="#d32f2f" />
                    </mesh>

                    {/* Capó Delantero */}
                    <mesh position={[0, 1.2, truckCabinLength / 2 + 0.5]} castShadow>
                        <boxGeometry args={[3.8, 2.0, 2.5]} />
                        <meshStandardMaterial color="#d32f2f" />
                    </mesh>

                    {/* Parrilla Frontal */}
                    <mesh position={[0, 1.5, truckCabinLength / 2 + 1.8]} castShadow>
                        <boxGeometry args={[2.5, 1, 0.1]} />
                        <meshStandardMaterial color="#424242" />
                    </mesh>

                    {/* Faros */}
                    <mesh position={[-1.8, 2.0, truckCabinLength / 2 + 1.3]} castShadow>
                        <boxGeometry args={[0.2, 1.5, 0.5]} />
                        <meshStandardMaterial color="#ffeb3b" />
                    </mesh>
                    <mesh position={[1.8, 2.0, truckCabinLength / 2 + 1.3]} castShadow>
                        <boxGeometry args={[0.2, 1.5, 0.5]} />
                        <meshStandardMaterial color="#ffeb3b" />
                    </mesh>

                    {/* Ventanas Laterales */}
                    <mesh position={[-1.91, 2.8, -0.5]} rotation={[0, -0.1, 0]} castShadow>
                        <boxGeometry args={[0.1, 1.2, 1.5]} />
                        <meshStandardMaterial color="#3fa3b5" transparent opacity={0.7} /> {/* Azul translúcido */}
                    </mesh>
                    <mesh position={[1.91, 2.8, -0.5]} rotation={[0, 0.1, 0]} castShadow>
                        <boxGeometry args={[0.1, 1.2, 1.5]} />
                        <meshStandardMaterial color="#3fa3b5" transparent opacity={0.7} /> {/* Azul translúcido */}
                    </mesh>

                    {/* Techo de la cabina */}
                    <mesh position={[0, 3.7, -0.5]} castShadow>
                        <boxGeometry args={[3.0, 0.2, 3.0]} />
                        <meshStandardMaterial color="#d32f2f" />
                    </mesh>

                    {/* Parachoques delantero */}
                    <mesh position={[0, 0.5, truckCabinLength / 2 + 1.8]} castShadow>
                        <boxGeometry args={[4.0, 0.8, 0.3]} />
                        <meshStandardMaterial color="#757575" />
                    </mesh>

                    {/* Ruedas Delanteras del Camión */}
                    <mesh position={[-1.8, 0.0, truckCabinLength / 2 + 0.5]} rotation={[0, 0, Math.PI / 2]} castShadow>
                        <cylinderGeometry args={[0.7, 0.7, 0.8, 16]} />
                        <meshStandardMaterial color="#424242" />
                    </mesh>
                    <mesh position={[1.8, 0.0, truckCabinLength / 2 + 0.5]} rotation={[0, 0, Math.PI / 2]} castShadow>
                        <cylinderGeometry args={[0.7, 0.7, 0.8, 16]} />
                        <meshStandardMaterial color="#424242" />
                    </mesh>

                    {/* Escapes Verticales */}
                    <mesh position={[-2.2, 2.5, -truckCabinLength / 2]} castShadow>
                        <cylinderGeometry args={[0.2, 0.2, 4.0, 8]} />
                        <meshStandardMaterial color="#a1887f" />
                    </mesh>
                    <mesh position={[2.2, 2.5, -truckCabinLength / 2]} castShadow>
                        <cylinderGeometry args={[0.2, 0.2, 4.0, 8]} />
                        <meshStandardMaterial color="#a1887f" />
                    </mesh>

                    {/* Espejos Laterales */}
                    <mesh position={[-2.1, 2.5, -1.0]} castShadow>
                        <boxGeometry args={[0.1, 0.5, 0.5]} />
                        <meshStandardMaterial color="#757575" />
                    </mesh>
                    <mesh position={[2.1, 2.5, -1.0]} castShadow>
                        <boxGeometry args={[0.1, 0.5, 0.5]} />
                        <meshStandardMaterial color="#757575" />
                    </mesh>
                </group>


                {/* 4. Palets */}
                {pallets.map(pallet => (
                    <Pallet3D
                        key={pallet.id}
                        pallet={pallet}
                        get3DPosition={get3DPosition}
                        isSelected={selectedPallets.includes(pallet.position)}
                        onClick={handlePalletClick}
                    />
                ))}

            </group> {/* Fin del grupo de rotación (rotation={[0, Math.PI / 2, 0]}) */}

            {/* 5. SOMBRAS DE CONTACTO */}
            {/* Las sombras se ajustan en la posición original del suelo */}
            <ContactShadows
                position={[10, -0.05, trailerCenterZ]}
                scale={15}
                far={10}
                blur={3}
                opacity={0.5}
                rotation={[Math.PI / 2, 0, 0]}
            />

            {/* 6. Controles de la Cámara */}
            <OrbitControls
                enableZoom={true}
                enablePan={true}
                enableRotate={true} // Habilitar rotación para poder manipular la vista
               // mouseButtons={{
                 //   LEFT: 0,    // 0 = ROTATE (Girar con el botón izquierdo)
                   // MIDDLE: 1,  // 1 = DOLLY (Zoom/Rueda del ratón)
                   // RIGHT: 2,   // 2 = PAN (Mover la vista con el botón derecho)
                //}}
                // Target de vista por defecto (apunta al centro longitudinal del camión)
                //target={[0, -300, viewCenterZ]}
                //maxPolarAngle={Math.PI}
            />
        </group>
    );
};


// -----------------------------------------------------------------------
// --- SUBCOMPONENTE A: Detalles del Palet Seleccionado (MODIFICADO) ---
// -----------------------------------------------------------------------
const PalletDetails = ({ selectedPallet }) => {
    const { t } = useTranslation();

    if (!selectedPallet) {
        return (
            <Paper elevation={2} sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', bgcolor: '#f5f5f5' }}>
                <Typography variant="h6" color="text.secondary">
                    {t('Select a Pallet')}
                </Typography>
                <Typography variant="body2" color="text.disabled">
                    {t('Click on a pallet in the 3D model or the list below.')}
                </Typography>
            </Paper>
        );
    }

    return (
        <Paper elevation={2} sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column', bgcolor: '#fff3e0', border: '2px solid #FF9800' }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', color: '#FF9800' }}>
                {t('Selected Pallet Details')}
            </Typography>
            <Grid container spacing={1}>

                {/* Posición y Estado */}
                <Grid item xs={6}><Typography variant="subtitle1" sx={{ fontWeight: 'medium' }}>{t('Position')}:</Typography></Grid>
                <Grid item xs={6}><Typography variant="subtitle1" color="primary">{selectedPallet.position}</Typography></Grid>

                <Grid item xs={6}><Typography variant="body1">{t('Loaded')}:</Typography></Grid>
                <Grid item xs={6}><Typography variant="body1" color={selectedPallet.isLoaded ? 'success.main' : 'error.main'}>{selectedPallet.isLoaded ? t('Yes') : t('No')}</Typography></Grid>

                <Grid item xs={12}><Box sx={{ borderBottom: '1px dashed #ccc', my: 1 }} /></Grid>

                {/* Detalles de Carga */}
                <Grid item xs={6}><Typography variant="body1">**{t('Product')}:**</Typography></Grid>
                <Grid item xs={6}><Typography variant="body1" sx={{ fontWeight: 'bold' }}>{selectedPallet.product}</Typography></Grid>

                <Grid item xs={6}><Typography variant="body1">**{t('Batch / Lot')}:**</Typography></Grid>
                <Grid item xs={6}><Typography variant="body1">{selectedPallet.batch}</Typography></Grid>

                <Grid item xs={6}><Typography variant="body1">{t('Destination')}:</Typography></Grid>
                <Grid item xs={6}><Typography variant="body1" color="secondary">{selectedPallet.destination}</Typography></Grid>

                <Grid item xs={12}><Box sx={{ borderBottom: '1px dashed #ccc', my: 1 }} /></Grid>

                {/* Métricas */}
                <Grid item xs={6}><Typography variant="body1">{t('Box Count')}:</Typography></Grid>
                <Grid item xs={6}><Typography variant="body1">{selectedPallet.boxesCount}</Typography></Grid>

                <Grid item xs={6}><Typography variant="body1">{t('Weight (kg)')}:</Typography></Grid>
                <Grid item xs={6}><Typography variant="body1">{selectedPallet.weight} kg</Typography></Grid>

                <Grid item xs={6}><Typography variant="body1">{t('Volume (m³)')}:</Typography></Grid>
                <Grid item xs={6}><Typography variant="body1">{selectedPallet.volume} m³</Typography></Grid>

            </Grid>
            <Box sx={{ mt: 'auto', pt: 2, borderTop: '1px dashed #ccc' }}>
                <Typography variant="caption" color="text.secondary">
                    {t('Internal ID')}: {selectedPallet.id}
                </Typography>
            </Box>
        </Paper>
    );
};

// --- SUBCOMPONENTE B: Cuadrícula 2D (100% de Ancho, 26 Slots) ---
const PalletGridView = ({ pallets, onSelectPallet, selectedPalletsPositions, onAddPalletClick }) => {
    const { t } = useTranslation();

    const renderPalletCardForGrid = (pallet, pos) => {
        const isSelected = selectedPalletsPositions.includes(pos);

        if (!pallet) {
            // Renderiza un slot vacío si no hay pallet en esa posición
            return (
                <Paper
                    elevation={1}
                    onClick={() => onAddPalletClick(pos)}
                    sx={{
                        height: 120,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        bgcolor: '#f0f0f0',
                        border: '2px dashed #9e9e9e',
                        cursor: 'pointer',
                        '&:hover': {
                            bgcolor: '#e8e8e8',
                            border: '2px dashed #00BCD4',
                        },
                    }}
                >
                    <AddIcon color="primary" sx={{ mb: 0.5 }} />
                    <Typography variant="caption" color="text.disabled">SLOT {pos}</Typography>
                    <Typography variant="caption" color="primary">AÑADIR PALET</Typography>
                </Paper>
            );
        }

        return (
            <Paper
                onClick={() => onSelectPallet(pallet)}
                sx={{
                    p: 1.5,
                    height: 120,
                    cursor: 'pointer',
                    textAlign: 'center',
                    bgcolor: pallet.isLoaded ? '#e0f7fa' : '#f5f5f5',
                    border: `3px solid ${isSelected ? '#FF9800' : (pallet.isLoaded ? '#00BCD4' : '#9e9e9e')}`,
                    boxShadow: isSelected ? '0 0 10px rgba(255, 152, 0, 0.8)' : 1,
                    transition: 'all 0.2s',
                    opacity: pallet.isLoaded ? 1 : 0.7,
                }}
            >
                <Typography variant="caption" color="text.secondary">
                    POS {pallet.position}
                </Typography>
                <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                    <ForkLeftIcon fontSize="small" sx={{ mr: 0.5 }} /> {pallet.product}
                </Typography>
                <Typography variant="body2" sx={{ lineHeight: 1.2 }}>
                    Cajas: {pallet.boxesCount}
                </Typography>
                <Typography variant="caption">
                    {pallet.weight} kg
                </Typography>
            </Paper>
        );
    };


    const sortedPallets = pallets.sort((a, b) => a.position - b.position);
    const totalPairs = MAX_PAIRS;

    return (
        <Box sx={{ mt: 4, mb: 2 }}>
            <Typography variant="h6" gutterBottom>{t('Pallet List (Top-Down View)')}</Typography>
            <Grid container spacing={2}>
                {/* Iteramos por las 13 filas (pares de palets) */}
                {Array.from({ length: totalPairs }).map((_, i) => {
                    const pos1 = i * 2 + 1;
                    const pos2 = i * 2 + 2;
                    const pallet1 = sortedPallets.find(p => p.position === pos1);
                    const pallet2 = sortedPallets.find(p => p.position === pos2);

                    return (
                        <Grid item xs={12} sm={6} md={3} key={i}>
                            <Paper elevation={1} sx={{ p: 1, borderLeft: '3px solid #00BCD4' }}>
                                <Typography variant="caption" sx={{ display: 'block', textAlign: 'center', mb: 1, fontWeight: 'bold' }}>
                                    {t('ROW')} {i + 1}
                                </Typography>
                                <Grid container spacing={1}>
                                    <Grid item xs={6}>
                                        {renderPalletCardForGrid(pallet1, pos1)}
                                    </Grid>
                                    <Grid item xs={6}>
                                        {renderPalletCardForGrid(pallet2, pos2)}
                                    </Grid>
                                </Grid>
                            </Paper>
                        </Grid>
                    );
                })}
            </Grid>
        </Box>
    );
};

// 🆕 SUBCOMPONENTE: PalletAdder
const PalletAdder = ({ emptyPositions, onAddPallet, nextId }) => {
    const { t } = useTranslation();
    const [newPalletData, setNewPalletData] = useState({
        position: '',
        product: '',
        boxesCount: 1,
        weight: 100,
        volume: 1.0,
        batch: '',
        destination: destinations[0],
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setNewPalletData(prev => ({ ...prev, [name]: value }));
    };

    const handleAdd = () => {
        if (!newPalletData.position || !newPalletData.product || newPalletData.product.trim() === '') {
            alert('Por favor, selecciona una posición y define un producto.');
            return;
        }

        const newPallet = {
            ...newPalletData,
            id: nextId,
            position: parseInt(newPalletData.position),
            boxesCount: parseInt(newPalletData.boxesCount),
            weight: newPalletData.weight.toString(), // Asegurar que el peso se guarda como string
            volume: newPalletData.volume.toString(), // Asegurar que el volumen se guarda como string
            isLoaded: true,
        };

        onAddPallet(newPallet);

        // Resetear el formulario, excepto quizás el producto, lote y destino si se añadirán más del mismo
        setNewPalletData(prev => ({
            ...prev,
            position: '',
            boxesCount: 1,
            weight: 100,
            volume: 1.0,
        }));
    };

    return (
        <Paper elevation={3} sx={{ p: 3, mt: 4, bgcolor: '#e8f5e9', border: '2px solid #4caf50' }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', color: '#4caf50' }}>
                <AddIcon sx={{ mr: 1 }} /> {t('Add New Pallet')}
            </Typography>
            <Grid container spacing={2}>
                <Grid item xs={12} sm={6} md={2}>
                    <TextField
                        select
                        fullWidth
                        required
                        label={t('Position')}
                        name="position"
                        value={newPalletData.position}
                        onChange={handleChange}
                        SelectProps={{ native: true }}
                        helperText={t('Select an empty slot')}
                    >
                        <option value="">{t('Select')}</option>
                        {emptyPositions.sort((a, b) => a - b).map(pos => (
                            <option key={pos} value={pos}>{pos}</option>
                        ))}
                    </TextField>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <TextField
                        required
                        fullWidth
                        label={t('Product')}
                        name="product"
                        value={newPalletData.product}
                        onChange={handleChange}
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={2}>
                    <TextField
                        fullWidth
                        label={t('Batch / Lot')}
                        name="batch"
                        value={newPalletData.batch}
                        onChange={handleChange}
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={2}>
                    <TextField
                        select
                        fullWidth
                        label={t('Destination')}
                        name="destination"
                        value={newPalletData.destination}
                        onChange={handleChange}
                        SelectProps={{ native: true }}
                    >
                        {destinations.map(dest => (
                            <option key={dest} value={dest}>{dest}</option>
                        ))}
                    </TextField>
                </Grid>
                <Grid item xs={12} sm={6} md={1}>
                    <TextField
                        fullWidth
                        label={t('Weight (kg)')}
                        name="weight"
                        type="number"
                        inputProps={{ step: "1" }}
                        value={newPalletData.weight}
                        onChange={handleChange}
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={1}>
                    <TextField
                        fullWidth
                        label={t('Boxes')}
                        name="boxesCount"
                        type="number"
                        inputProps={{ step: "1", min: "1" }}
                        value={newPalletData.boxesCount}
                        onChange={handleChange}
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={1} sx={{ display: 'flex', alignItems: 'center' }}>
                    <Button
                        variant="contained"
                        color="success"
                        startIcon={<AddIcon />}
                        onClick={handleAdd}
                        fullWidth
                        disabled={!newPalletData.position || newPalletData.product.trim() === ''}
                    >
                        {t('Add')}
                    </Button>
                </Grid>
            </Grid>
            <Typography variant="caption" display="block" color="text.secondary" sx={{ mt: 1 }}>
                {t('Pallet ID')}: {nextId} | {t('Total loaded pallets')}: {MAX_PALLETS - emptyPositions.length}
            </Typography>
        </Paper>
    );
};


// -----------------------------------------------------------------------
// --- SUBCOMPONENTE C: El Contenedor Lógico del Dashboard (TrailerView) ---
// -----------------------------------------------------------------------

const TrailerView = ({ pallets, setPallets }) => {
    const { t } = useTranslation();
    const [selectedPalletPositions, setSelectedPalletPositions] = useState([]);
    const [selectedPalletData, setSelectedPalletData] = useState(null);
    const [swapMessage, setSwapMessage] = useState(null);

    // 🆕 Lógica para encontrar posiciones vacías
    const occupiedPositions = new Set(pallets.map(p => p.position));
    const emptyPositions = Array.from({ length: MAX_PALLETS }, (_, i) => i + 1).filter(pos => !occupiedPositions.has(pos));
    const nextPalletId = getNextPalletId(pallets);


    const handlePalletClick = useCallback((pallet) => {
        if (!pallet) return;

        const position = pallet.position;

        if (selectedPalletPositions.includes(position)) {
            setSelectedPalletData(null);
            setSelectedPalletPositions([]);
        } else {
            setSelectedPalletData(pallet);
            setSelectedPalletPositions([position]);
        }
        setSwapMessage(null);
    }, [selectedPalletPositions]);


    // 🆕 Lógica para añadir un palet
    const handleAddPallet = (newPallet) => {
        setPallets(prevPallets => [...prevPallets, newPallet]);
        setSelectedPalletData(newPallet);
        setSelectedPalletPositions([newPallet.position]);
        setSwapMessage({ severity: 'success', text: t(`Pallet ${newPallet.id} added at position ${newPallet.position}.`) });
    };

    // 🆕 Lógica para añadir un palet al hacer clic en un slot vacío en la cuadrícula
    const handleAddPalletClickFromGrid = useCallback((position) => {
        // Establece la posición en el formulario de PalletAdder (si lo tuvieras fuera de este componente)
        // Como PalletAdder es un componente controlado por su propio estado, no haremos nada por ahora,
        // pero podríamos usar setSelectedPalletData para mostrar un slot vacío en PalletDetails, etc.
        setSwapMessage({ severity: 'info', text: t(`Selected empty position ${position}. Use the 'Add New Pallet' form below.`) });
        // Podríamos preseleccionar la posición en el Adder si estuviera fuera
    }, [t]);

    // Lógica de Swap eliminada

    return (
        <Box sx={{ mt: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h5">
                    <LocalShippingIcon sx={{ mr: 1, color: '#d32f2f' }} /> {t('Loading Dashboard')}
                </Typography>
                <Typography variant="h6" color="text.secondary">
                    {t('Capacity')}: {pallets.length}/{MAX_PALLETS}
                </Typography>
                {/* Botón de Swap eliminado */}
            </Box>

            {swapMessage && (
                <Alert severity={swapMessage.severity} onClose={() => setSwapMessage(null)} sx={{ mb: 2 }}>
                    {swapMessage.text}
                </Alert>
            )}

            {/* Canvas 3D (No modificado en su estructura) */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Paper elevation={3} sx={{ height: '550px', width: '100%', p: 1, border: '2px solid #546e7a' }}>
                    <Canvas
                        // ✅ VISTA CENITAL: [0, 35, 0] para mostrar todo el camión desde arriba
                        camera={{ position: [0, 90, -5], fov: 5 }}
                        shadows
                        style={{ background: '#e0f2f1', height: '100%', width: '100%' }}
                    >
                        <Trailer3DScene
                            pallets={pallets}
                            handlePalletClick={handlePalletClick}
                            selectedPallets={selectedPalletPositions}
                        />
                    </Canvas>
                </Paper>
            </Box>

            {/* --- FILA INFERIOR: CUADRÍCULA 2D (100% ANCHO) --- */}
            <PalletGridView
                pallets={pallets}
                onSelectPallet={handlePalletClick}
                selectedPalletsPositions={selectedPalletPositions}
                onAddPalletClick={handleAddPalletClickFromGrid} // Pasa la nueva función
            />

            <Typography variant="caption" sx={{ display: 'block', textAlign: 'center', mt: 1, color: '#455a64' }}>
                * {t('Use the mouse to rotate, zoom, and move the view.')}
            </Typography>

            {/* 🆕 NUEVO: Pallet Adder (Agregar Palet) */}
            <PalletAdder
                emptyPositions={emptyPositions}
                onAddPallet={handleAddPallet}
                nextId={nextPalletId}
            />

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
            // Genera una lista de palets y luego añade las posiciones (1 a 26) que faltan como palets vacíos
            const initialLoadedPallets = isEditing ? generateDummyPallets(parseInt(id) * 3 + 10) : generateDummyPallets(16);

            // Llenar las posiciones vacías restantes con objetos de palet 'vacío' 
            const occupiedPositions = new Set(initialLoadedPallets.map(p => p.position));
            const emptyPallets = Array.from({ length: MAX_PALLETS }, (_, i) => i + 1)
                .filter(pos => !occupiedPositions.has(pos))
                .map(pos => ({
                    position: pos,
                    id: -pos, // Usar un ID negativo temporal o un valor no numérico para diferenciar los slots vacíos si es necesario
                    product: 'VACÍO',
                    boxesCount: 0,
                    weight: "0",
                    isLoaded: false,
                    volume: "0.00",
                    batch: '',
                    destination: 'N/A',
                }));

            const initialPallets = [...initialLoadedPallets, ...emptyPallets].sort((a, b) => a.position - b.position);

            let initialData = initialFormData;
            if (isEditing && id) {
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

            // Filtrar los palets vacíos (id < 0) antes de guardarlos en el estado, ya que la simulación 3D y la cuadrícula
            // manejan la lógica de 'vacío' encontrando la ausencia de un palet en esa posición.
            // setPallets(initialPallets.filter(p => p.isLoaded));
            setPallets(initialLoadedPallets); // Dejamos solo los palets cargados

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
        // Asegúrate de enviar solo los palets que están cargados (isLoaded: true o product !== 'VACÍO')
        const loadedPallets = pallets.filter(p => p.isLoaded && p.product !== 'VACÍO');

        const shipmentPayload = {
            id: isEditing ? parseInt(id) : 0,
            ...formData,
            pallets: loadedPallets.map(p => ({
                id: p.id,
                position: p.position,
                product: p.product,
                boxesCount: p.boxesCount,
                weight: p.weight,
                volume: p.volume,
                batch: p.batch,
                destination: p.destination,
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
                        {/* Datos Generales */}
                        <Grid item xs={12} sm={6}><TextField required fullWidth label={t('Trip Number')} name="tripNumber" value={formData.tripNumber} onChange={handleChange} /></Grid>
                        <Grid item xs={12} sm={6}><TextField required fullWidth label={t('Driver')} name="driver" value={formData.driver} onChange={handleChange} /></Grid>
                        <Grid item xs={12} sm={6}><TextField fullWidth label={t('Shipping Line')} name="line" value={formData.line} onChange={handleChange} /></Grid>
                        <Grid item xs={12} sm={6}><TextField required fullWidth label={t('Date')} name="date" type="date" value={formData.date} onChange={handleChange} InputLabelProps={{ shrink: true }} /></Grid>
                        <Grid item xs={12} sm={6}><TextField required fullWidth label={t('Departure Time')} name="departureTime" type="time" value={formData.departureTime} onChange={handleChange} InputLabelProps={{ shrink: true }} /></Grid>
                        <Grid item xs={12} sm={6}><TextField required fullWidth label={t('Temperature')} name="temperature" type="number" inputProps={{ step: "0.1" }} value={formData.temperature} onChange={handleChange} InputProps={{ endAdornment: <InputAdornment position="end">°C</InputAdornment> }} /></Grid>

                        {/* Logística y Ubicación */}
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

            {/* FILA 2: Dashboard de Carga (Actualizado) */}
            <Box sx={{ mt: 5, borderTop: '2px solid #bdbdbd', pt: 3 }}>
                <TrailerView pallets={pallets} setPallets={setPallets} />
            </Box>


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