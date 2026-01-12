import React, { useState } from 'react';
import {
    Box, Paper, Typography, useTheme, useMediaQuery, Divider, Tooltip
} from '@mui/material';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import SensorsIcon from '@mui/icons-material/Sensors';

// Importaciones de dnd-kit
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
} from '@dnd-kit/core';
import {
    useSortable,
    sortableKeyboardCoordinates,
} from '@dnd-kit/sortable';
import { useDraggable, useDroppable } from '@dnd-kit/core';

const ROWS = 13;

// Componente para cada Celda (Slot) que puede recibir o ser arrastrado
const GridSlot = ({ pos, isMobile, theme, occupiedData, isSelected, onClick, children }) => {
    const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
        id: `draggable-${pos}`,
        disabled: !occupiedData, // Solo se puede arrastrar si hay un pallet
        data: { pos }
    });

    const { setNodeRef: setDropRef, isOver } = useDroppable({
        id: `droppable-${pos}`,
        data: { pos }
    });

    const style = {
        transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
        zIndex: isDragging ? 1000 : 1,
        opacity: isDragging ? 0.5 : 1,
        height: isMobile ? 85 : 95,
        width: '100%',
        backgroundColor: isOver ? theme.palette.action.hover : (isSelected ? theme.palette.secondary.dark : (occupiedData ? (occupiedData.manifestIndex === 0 ? theme.palette.primary.main : '#666') : '')),
        border: `1.5px solid ${isOver ? theme.palette.primary.main : (isSelected ? theme.palette.secondary.main : (occupiedData ? theme.palette.secondary.main : '#666'))}`,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        cursor: occupiedData ? 'grab' : 'pointer',
        position: 'relative',
        color: occupiedData ? '#fff' : '#888',
        touchAction: 'none' // Importante para dispositivos móviles
    };

    // Combinamos las referencias de Draggable y Droppable
    const setCombinedRef = (element) => {
        setNodeRef(element);
        setDropRef(element);
    };

    return (
        <Paper
            ref={setCombinedRef}
            elevation={0}
            onClick={() => onClick(pos)}
            style={style}
            {...listeners}
            {...attributes}
        >
            {children}
        </Paper>
    );
};

const TrailerGrid = ({ allManifests, currentManifestIndex, onUpdatePallet, onMovePallet, t }) => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const [selectedPosition, setSelectedPosition] = useState(null);

    // Configuración de sensores para dnd-kit
    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8, // Permite distinguir entre un click y un arrastre
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const getPalletAtPosition = (pos) => {
        if (!allManifests) return null;
        for (let i = 0; i < allManifests.length; i++) {
            const manifest = allManifests[i];
            const manifestPallets = manifest.manifestPallets || [];
            const pallet = manifestPallets.find(p => p.position === pos && !(p.isDeleted));
            if (pallet) return { pallet, manifestIndex: i };
        }
        return null;
    };

    const handleDragEnd = (event) => {
        const { active, over } = event;

        if (over && active.id !== over.id) {
            const fromPos = active.data.current.pos;
            const toPos = over.data.current.pos;

            if (onMovePallet) {
                onMovePallet(fromPos, toPos);
            }
        }
    };

    const grandTotalBoxes = allManifests?.reduce((total, m) =>
        total + ((m.manifestPallets || []).filter(p => !p.isDeleted).reduce((pSum, p) =>
            pSum + ((p.manifestPalletLoadings || []).reduce((lSum, l) => lSum + (Number(l.boxQuantity) || 0), 0) || 0), 0) || 0), 0) || 0;

    const totalPallets = allManifests?.reduce((total, m) => total + ((m.manifestPallets || []).filter(p => !p.isDeleted).length || 0), 0) || 0;

    const handleSlotClick = (pos) => {
        const occupiedData = getPalletAtPosition(pos);
        // Si no se está arrastrando, funciona como el click normal para abrir el modal
        if (occupiedData && occupiedData.manifestIndex !== currentManifestIndex) return;
        onUpdatePallet(pos, occupiedData ? occupiedData.pallet : null);
    };

    const renderSlot = (pos) => {
        const occupiedData = getPalletAtPosition(pos);
        const totalBoxes = occupiedData?.pallet?.manifestPalletLoadings?.reduce((acc, curr) => acc + (Number(curr.boxQuantity) || 0), 0) || 0;
        const isSelected = selectedPosition === pos;

        return (
            <GridSlot
                key={pos}
                pos={pos}
                isMobile={isMobile}
                theme={theme}
                occupiedData={occupiedData}
                isSelected={isSelected}
                onClick={handleSlotClick}
            >
                <Typography sx={{ position: 'absolute', top: 2, left: 4, fontWeight: 'bold', fontSize: '0.65rem' }}>{pos}</Typography>
                {occupiedData && (
                    <Box sx={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', pointerEvents: 'none' }}>
                        <Typography variant="caption" sx={{ fontWeight: 'bold', fontSize: '0.75rem', display: 'block', lineHeight: 1.2 }}>
                            {totalBoxes} BX
                        </Typography>
                        {occupiedData.pallet?.temperatureF && (
                            <Typography variant="caption" sx={{ fontSize: '0.65rem', opacity: 0.9, display: 'block' }}>
                                {occupiedData.pallet.temperatureF}°F
                            </Typography>
                        )}
                        {occupiedData.pallet?.chismografo && (
                            <Tooltip title="Chismógrafo Detectado" arrow placement="bottom">
                                <SensorsIcon className="pulse-animation" sx={{ mt: 1 }} />
                            </Tooltip>
                        )}
                    </Box>
                )}
            </GridSlot>
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
        <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
        >
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
        </DndContext>
    );
};

export default TrailerGrid;