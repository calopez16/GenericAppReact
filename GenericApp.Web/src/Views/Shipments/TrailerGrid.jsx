import React, { useState } from 'react';
import {
    Box, Paper, Typography, useTheme, useMediaQuery, Divider, Tooltip
} from '@mui/material';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import SensorsIcon from '@mui/icons-material/Sensors';

const ROWS = 13;

const TrailerGrid = ({ allManifests, currentManifestIndex, onUpdatePallet, onMovePallet, t }) => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const [interactionMode, setInteractionMode] = useState('select');
    const [selectedPosition, setSelectedPosition] = useState(null);

    const getPalletAtPosition = (pos) => {
        if (!allManifests) return null;
        for (let i = 0; i < allManifests.length; i++) {
            const manifest = allManifests[i];
            const manifestPallets = manifest.manifestPallets || []; // Protección contra null/undefined
            const pallet = manifestPallets.find(p => p.position === pos && !(p.isDeleted));
            if (pallet) return { pallet, manifestIndex: i };
        }
        return null;
    };

    // --- CÁLCULOS TOTALES DEL CAMIÓN ---
    const grandTotalBoxes = allManifests?.reduce((total, m) =>
        total + ((m.manifestPallets || []).filter(p => !p.isDeleted).reduce((pSum, p) =>
            pSum + ((p.manifestPalletLoadings || []).reduce((lSum, l) => lSum + (Number(l.boxQuantity) || 0), 0) || 0), 0) || 0), 0) || 0;

    const totalPallets = allManifests?.reduce((total, m) => total + ((m.manifestPallets || []).filter(p => !p.isDeleted).length || 0), 0) || 0;

    const handleSlotClick = (pos) => {
        const occupiedData = getPalletAtPosition(pos);
        if (interactionMode === 'swap') {
            if (selectedPosition === null) { if (occupiedData) setSelectedPosition(pos); }
            else { if (selectedPosition !== pos) onMovePallet(selectedPosition, pos); setSelectedPosition(null); setInteractionMode('select'); }
        } else if (interactionMode === 'select') {
            if (occupiedData && occupiedData.manifestIndex !== currentManifestIndex) return;
            onUpdatePallet(pos, occupiedData ? occupiedData.pallet : null);
        }
    };

    const renderSlot = (pos) => {
        const occupiedData = getPalletAtPosition(pos);
        // Protecciones adicionales con optional chaining (?.) y valores por defecto
        const totalBoxes = occupiedData?.pallet?.manifestPalletLoadings?.reduce((acc, curr) => acc + (Number(curr.boxQuantity) || 0), 0) || 0;
        const isOccupied = !!occupiedData;
        const isSelected = selectedPosition === pos;

        return (
            <Paper
                key={pos} elevation={0}
                onClick={() => handleSlotClick(pos)}
                sx={{
                    height: isMobile ? 85 : 95,
                    width: '100%',
                    backgroundColor: isSelected ? theme.palette.secondary.dark : (isOccupied ? (occupiedData.manifestIndex === currentManifestIndex ? theme.palette.primary.main : '#666') : ''),
                    border: `1.5px solid ${isSelected ? theme.palette.secondary.main : (isOccupied ? theme.palette.secondary.main : '#666')}`,
                    display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', cursor: 'pointer', position: 'relative', color: isOccupied ? '#fff' : '#888'
                }}
            >
                <Typography sx={{ position: 'absolute', top: 2, left: 4, fontWeight: 'bold', fontSize: '0.65rem' }}>{pos}</Typography>
                {isOccupied && (
                    <Box sx={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>

                        {/* 1. Cajas */}
                        <Typography variant="caption" sx={{ fontWeight: 'bold', fontSize: '0.75rem', display: 'block', lineHeight: 1.2 }}>
                            {totalBoxes} BX
                        </Typography>

                        {/* 2. Temperatura */}
                        {occupiedData.pallet?.temperatureF && (
                            <Typography variant="caption" sx={{ fontSize: '0.65rem', opacity: 0.9, display: 'block' }}>
                                {occupiedData.pallet.temperatureF}°F
                            </Typography>
                        )}

                        {/* 3. Icono Sensor / Chismógrafo usando CLASSNAME */}
                        {occupiedData.pallet?.chismografo && (
                            <Tooltip title="Chismógrafo Detectado" arrow placement="bottom">
                                {/* Aquí aplicamos la clase definida en el CSS */}
                                <SensorsIcon className="pulse-animation" sx={{ mt: 1 }} />
                            </Tooltip>
                        )}
                    </Box>
                )}
            </Paper>
        );
    };

    const slots = [];
    for (let i = 0; i < ROWS; i++) {
        slots.push(
            <Box key={i} sx={{ display: 'flex', flexDirection: isMobile ? 'row' : 'column', gap: 1, flex: 1, minWidth: isMobile ? '100%' : 65 }}>
                {renderSlot((i * 2) + 1)}
                {renderSlot((i * 2) + 2)}
            </Box>
        );
    }

    return (
        <Box sx={{ width: '100%' }}>
            <Box sx={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', p: 2, borderRadius: '10px', border: '3px solid', gap: 2 }}>
                <Box sx={{ width: isMobile ? '100%' : 80, height: isMobile ? 60 : 'auto', bgcolor: '#111', borderRadius: '8px', display: 'flex', flexDirection: isMobile ? 'row' : 'column', justifyContent: 'center', alignItems: 'center', color: '#fff', gap: 1 }}>
                    <LocalShippingIcon sx={{ transform: 'scaleX(-1)', fontSize: 32 }} />
                    <Typography variant="caption" sx={{ fontWeight: 'bold' }}>FRONT</Typography>
                </Box>
                <Box sx={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: 1, flexGrow: 1 }}>{slots}</Box>
            </Box>
            <Paper sx={{ p: 2, mt: 2, display: 'flex', justifyContent: 'space-around', alignItems: 'center', border: '1px solid #333' }}>
                <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="caption" color="gray">TOTAL CAMIÓN</Typography>
                    <Typography variant="h5" color="primary" sx={{ fontWeight: 'bold' }}>{grandTotalBoxes} BX</Typography>
                </Box>
                <Divider orientation="vertical" flexItem />
                <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="caption" color="gray">PALLETS</Typography>
                    <Typography variant="h5" sx={{ fontWeight: 'bold' }}>{totalPallets} / 26</Typography>
                </Box>
            </Paper>
        </Box>
    );
};

export default TrailerGrid;