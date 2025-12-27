import React, { useState } from 'react';
import {
    Box,
    Paper,
    Typography,
    Button,
    ButtonGroup,
    useTheme,
    useMediaQuery
} from '@mui/material';
import GridViewIcon from '@mui/icons-material/GridView';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import EditIcon from '@mui/icons-material/Edit';
import InfoIcon from '@mui/icons-material/Info';

// CONFIGURACIÓN GLOBAL
const MAX_PALLETS = 26;
const ROWS = 13;

const TrailerGrid = ({
    allManifests,
    currentManifestIndex,
    onUpdatePallet,
    onMovePallet,
    onCopyPallet,
    onDeletePallet, // Asegúrate de recibir esta prop si la usas
    t
}) => {
    // --- LÓGICA DE DETECCIÓN DE PANTALLA ---
    const theme = useTheme();
    // Usamos 'md' como punto de quiebre para el camión porque es ancho
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const isTinyScreen = useMediaQuery(theme.breakpoints.down('sm'));

    // Estados de interacción
    const [interactionMode, setInteractionMode] = useState('select');
    const [selectedPosition, setSelectedPosition] = useState(null);

    // Helper: Encontrar pallet en una posición
    const getPalletAtPosition = (pos) => {
        if (!allManifests) return null;
        for (let i = 0; i < allManifests.length; i++) {
            const manifest = allManifests[i];
            // Aseguramos que no esté eliminado (soft delete check)
            const pallet = manifest.manifestPallets?.find(p => p.position === pos && !(p.isDeleted));
            if (pallet) return { pallet, manifestIndex: i };
        }
        return null;
    };

    const handleSlotClick = (pos) => {
        const occupiedData = getPalletAtPosition(pos);

        if (interactionMode === 'swap') {
            if (selectedPosition === null) {
                if (!occupiedData) return;
                setSelectedPosition(pos);
            } else {
                if (selectedPosition !== pos) onMovePallet(selectedPosition, pos);
                setSelectedPosition(null);
                setInteractionMode('select');
            }
            return;
        }

        if (interactionMode === 'copy') {
            if (selectedPosition === null) {
                if (!occupiedData) return;
                setSelectedPosition(pos);
            } else {
                if (!occupiedData) {
                    onCopyPallet(selectedPosition, pos);
                }
            }
            return;
        }

        if (interactionMode === 'select') {
            if (occupiedData && occupiedData.manifestIndex !== currentManifestIndex) return;
            onUpdatePallet(pos, occupiedData ? occupiedData.pallet : null);
        }
    };

    const renderSlot = (pos) => {
        const occupiedData = getPalletAtPosition(pos);
        const isOccupied = !!occupiedData;
        const isCurrentManifest = occupiedData?.manifestIndex === currentManifestIndex;
        const isSelected = selectedPosition === pos;

        let bgColor = '#f5f5f5';
        let borderColor = '#ddd';

        if (isOccupied) {
            bgColor = isCurrentManifest ? '#bbdefb' : '#e0e0e0';
            borderColor = isCurrentManifest ? '#1976d2' : '#9e9e9e';
        }
        if (isSelected) {
            borderColor = '#ff9800';
            bgColor = '#fff3e0';
        }

        // AJUSTE RESPONSIVO: Altura dinámica
        const slotHeight = isTinyScreen ? 50 : 60;

        return (
            <Paper
                key={pos}
                elevation={isOccupied ? 3 : 0}
                sx={{
                    height: slotHeight,
                    width: '100%',
                    backgroundColor: bgColor,
                    border: `2px solid ${borderColor}`,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    cursor: 'pointer',
                    position: 'relative',
                    transition: 'all 0.2s',
                    '&:hover': { filter: 'brightness(0.95)' }
                }}
                onClick={() => handleSlotClick(pos)}
            >
                <Typography variant="caption" sx={{ position: 'absolute', top: 1, left: 3, fontWeight: 'bold', color: '#777', fontSize: isTinyScreen ? '0.65rem' : '0.75rem' }}>
                    {pos}
                </Typography>

                {isOccupied ? (
                    <>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, flexDirection: isTinyScreen ? 'column' : 'row' }}>
                            {isCurrentManifest ?
                                <EditIcon sx={{ fontSize: isTinyScreen ? 16 : 20 }} color="primary" /> :
                                <InfoIcon sx={{ fontSize: isTinyScreen ? 16 : 20 }} color="action" />
                            }
                            <Typography variant={isTinyScreen ? "caption" : "body2"} fontWeight="bold" sx={{ lineHeight: 1 }}>
                                {occupiedData.pallet.manifestPalletLoadings?.length || 0} {isTinyScreen ? '' : 'items'}
                            </Typography>
                        </Box>
                    </>
                ) : (
                    interactionMode === 'copy' && selectedPosition ?
                        <ContentCopyIcon color="disabled" sx={{ opacity: 0.3 }} /> :
                        (!isTinyScreen && <Typography variant="caption" color="text.secondary">{t('Empty')}</Typography>)
                )}
            </Paper>
        );
    };

    const leftColumn = [];
    const rightColumn = [];

    for (let i = 0; i < ROWS; i++) {
        const posLeft = (i * 2) + 1;
        const posRight = (i * 2) + 2;
        leftColumn.push(renderSlot(posLeft));
        rightColumn.push(renderSlot(posRight));
    }

    return (
        <Box sx={{ mt: 2 }}>
            {/* HERRAMIENTAS RESPONSIVAS */}
            <Box sx={{ mb: 2, display: 'flex', justifyContent: 'center' }}>
                <ButtonGroup
                    variant="contained"
                    size={isTinyScreen ? "small" : "medium"}
                    orientation={isTinyScreen ? "vertical" : "horizontal"}
                    fullWidth={isTinyScreen}
                    aria-label="pallet tools"
                >
                    <Button
                        color={interactionMode === 'select' ? "primary" : "inherit"}
                        onClick={() => { setInteractionMode('select'); setSelectedPosition(null); }}
                        startIcon={<GridViewIcon />}
                    >
                        {t('Select / Edit')}
                    </Button>
                    <Button
                        color={interactionMode === 'swap' ? "secondary" : "inherit"}
                        onClick={() => { setInteractionMode('swap'); setSelectedPosition(null); }}
                        startIcon={<SwapHorizIcon />}
                    >
                        {t('Move / Swap')}
                    </Button>
                    <Button
                        color={interactionMode === 'copy' ? "warning" : "inherit"}
                        onClick={() => { setInteractionMode('copy'); setSelectedPosition(null); }}
                        startIcon={<ContentCopyIcon />}
                    >
                        {t('Copy')}
                    </Button>
                </ButtonGroup>
            </Box>

            {/* LEYENDA (Ocultar en móviles muy pequeños si molesta, o simplificar) */}
            {!isTinyScreen && (
                <Typography align="center" variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {interactionMode === 'select' && t('Click a slot to add/edit details.')}
                    {interactionMode === 'swap' && (selectedPosition ? t('Select destination slot to swap.') : t('Select a pallet to move.'))}
                    {interactionMode === 'copy' && (selectedPosition ? t('Select an empty slot to paste.') : t('Select a pallet to copy.'))}
                </Typography>
            )}

            {/* TRAILER VISUALIZACIÓN */}
            <Box sx={{
                display: 'flex',
                flexDirection: isMobile ? 'column' : 'row', // APILAR SI ES MOBILE
                gap: isMobile ? 1 : 4, // MENOS ESPACIO SI ES MOBILE
                p: isMobile ? 1 : 2,
                bgcolor: '#eee',
                borderRadius: 2,
                border: '4px solid #333',
                borderTop: 'none',
                minHeight: isMobile ? 'auto' : 600
            }}>
                <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 1 }}>
                    <Typography align="center" variant="caption" fontWeight="bold">LEFT SIDE</Typography>
                    {leftColumn}
                </Box>

                {/* Divisor visual si se apilan */}
                {isMobile && <Box sx={{ height: 2, bgcolor: '#ccc', my: 1 }} />}

                <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 1 }}>
                    <Typography align="center" variant="caption" fontWeight="bold">RIGHT SIDE</Typography>
                    {rightColumn}
                </Box>
            </Box>
            <Box sx={{ height: 10, bgcolor: '#333', width: '100%', mt: 0, borderBottomLeftRadius: 4, borderBottomRightRadius: 4 }} />
            <Typography align="center" sx={{ mt: 1 }} fontWeight="bold">{t('CABIN FRONT')}</Typography>
        </Box>
    );
};

export default TrailerGrid;