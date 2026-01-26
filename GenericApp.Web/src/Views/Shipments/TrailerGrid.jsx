import React, { useState, useEffect } from 'react';
import {
    Box, Paper, Typography, useTheme, useMediaQuery, Divider, Tooltip, Button
} from '@mui/material';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import SensorsIcon from '@mui/icons-material/Sensors';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import DeleteIcon from '@mui/icons-material/Delete';
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
const GridSlot = ({ pos, isMobile, theme, occupiedData, isSelected, isCopyMode, onClick, children }) => {
    const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
        id: `draggable-${pos}`,
        disabled: !occupiedData || isCopyMode,
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

const TrailerGrid = ({ allManifests, currentManifestIndex, onUpdatePallet, onMovePallet, onCopyPallet, t, onDeletePallet, onCopyModeChange }) => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const [selectedPosition, setSelectedPosition] = useState(null);
    const [copySourcePos, setCopySourcePos] = useState(null);
    const [selectedDestinations, setSelectedDestinations] = useState([]);

    const isCopyMode = copySourcePos !== null;

    useEffect(() => {
        if (onCopyModeChange) onCopyModeChange(isCopyMode, copySourcePos, handleConfirmCopy, () => {
            setCopySourcePos(null);
            setSelectedDestinations([]);
        });
    }, [isCopyMode, copySourcePos, selectedDestinations]);

    const handleStartCopy = (e, pos) => {
        e.stopPropagation(); // Evita abrir el modal de edición
        setCopySourcePos(pos);
        setSelectedDestinations([]);
    };

    const handleToggleDestination = (pos) => {
        if (selectedDestinations.includes(pos)) {
            setSelectedDestinations(prev => prev.filter(p => p !== pos));
        } else {
            setSelectedDestinations(prev => [...prev, pos]);
        }
    };

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
        // 1. Verificamos si estamos en modo copiado
        if (isCopyMode) {
            const occupiedData = getPalletAtPosition(pos);

            // Solo permitimos seleccionar espacios vacíos como destino 
            // o el pallet de origen (para desmarcar o cerrar el modo)
            if (!occupiedData || pos === copySourcePos) {
                handleToggleDestination(pos);
            }
            return; // Bloqueamos la ejecución del resto de la función (no abre modal)
        }

        // 2. Comportamiento normal (fuera de modo copia)
        const occupiedData = getPalletAtPosition(pos);
        if (occupiedData && occupiedData.manifestIndex !== currentManifestIndex) return;

        onUpdatePallet(pos, occupiedData ? occupiedData.pallet : null);
    };

    const handleConfirmCopy = () => {
        // Verificamos que existan destinos y que la función prop esté definida
        if (onCopyPallet && selectedDestinations.length > 0) {
            onCopyPallet(copySourcePos, selectedDestinations);

            // Limpiamos el modo copia después de ejecutar la acción
            setCopySourcePos(null);
            setSelectedDestinations([]);
        }
    };

    // Función para generar el desglose de LabelTypes para el Tooltip
    const getLabelBreakdown = (pallet) => {
        if (!pallet?.manifestPalletLoadings) return null;

        const summary = pallet.manifestPalletLoadings.reduce((acc, curr) => {
            const label = curr.description || 'N/A';
            acc[label] = (acc[label] || 0) + (Number(curr.boxQuantity) || 0);
            return acc;
        }, {});

        const total = Object.values(summary).reduce((a, b) => a + b, 0);

        return (
            <Box sx={{ p: 0.5 }}>
                {Object.entries(summary).map(([name, qty]) => (
                    <Typography key={name} variant="caption" display="block">
                        {name}: <strong>{qty} </strong>{t('boxes')}
                    </Typography>
                ))}
                <Divider sx={{ my: 0.5, borderColor: 'rgba(255,255,255,0.3)' }} />
                <Typography variant="caption" sx={{ fontWeight: 'bold' }}>
                    Total: {total} {t('boxes')}
                </Typography>
            </Box>
        );
    };

    const renderSlot = (pos) => {
        const occupiedData = getPalletAtPosition(pos);
        const totalBoxes = occupiedData?.pallet?.manifestPalletLoadings?.reduce((acc, curr) => acc + (Number(curr.boxQuantity) || 0), 0) || 0;
        const isSelectedForCopy = selectedDestinations.includes(pos);
        const isSource = copySourcePos === pos;

        return (
            <GridSlot
                key={pos}
                pos={pos}
                isMobile={isMobile}
                theme={theme}
                occupiedData={occupiedData}
                isSelected={isSelectedForCopy || isSource}
                isCopyMode={isCopyMode}
                onClick={handleSlotClick}
            >
                {/* Posición del pallet (Arriba a la izquierda) */}
                <Typography sx={{ position: 'absolute', top: 2, left: 4, fontWeight: 'bold', fontSize: '0.65rem' }}>
                    {pos}
                </Typography>

                {/* BOTONES DE ACCIÓN (Esquinas inferiores) */}
                {occupiedData && !isCopyMode && (
                    <>
                        {/* Botón Copiar (Abajo a la derecha) */}
                        <Tooltip title={t('copy')}>
                            <ContentCopyIcon
                                onClick={(e) => handleStartCopy(e, pos)}
                                sx={{
                                    position: 'absolute',
                                    bottom: 4,
                                    right: 4,
                                    fontSize: '1.4rem',
                                    cursor: 'pointer',
                                    zIndex: 10,
                                    '&:hover': { color: theme.palette.secondary.main }
                                }}
                            />
                        </Tooltip>

                        {/* Botón Eliminar (Abajo a la izquierda) */}
                        <Tooltip title={t('delete')}>
                            <DeleteIcon
                                onClick={(e) => {
                                    e.stopPropagation();
                                    e.preventDefault();
                                    onDeletePallet(pos);
                                }}
                                sx={{
                                    position: 'absolute',
                                    bottom: 4,
                                    left: 4,
                                    fontSize: '1.4rem',
                                    cursor: 'pointer',
                                    zIndex: 10,
                                    '&:hover': { color: theme.palette.error.main },
                                    color: 'rgba(255,255,255,0.8)'
                                }}
                            />
                        </Tooltip>
                    </>
                )}

                {/* Información Central del Pallet con Tooltip Detallado */}
                {occupiedData && (
                    <Tooltip
                        title={getLabelBreakdown(occupiedData.pallet)}
                        arrow
                        placement="top"
                    >
                        <Box sx={{
                            textAlign: 'center',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            mt: -1,
                            pointerEvents: 'auto' // Asegura que el tooltip se active al pasar el mouse
                        }}>
                            <Typography variant="caption" sx={{ fontWeight: 'bold', fontSize: '0.75rem', display: 'block', lineHeight: 1.2 }}>
                                {totalBoxes} {t('boxes')}
                            </Typography>
                            {occupiedData.pallet?.temperatureF && (
                                <Typography variant="caption" sx={{ fontSize: '0.65rem', opacity: 0.9, display: 'block' }}>
                                    {occupiedData.pallet.temperatureF}°F
                                </Typography>
                            )}
                            {occupiedData.pallet?.chismografo && (
                                <SensorsIcon className="pulse-animation" sx={{ fontSize: '1.1rem' }} />
                            )}
                        </Box>
                    </Tooltip>
                )}

                {/* Check de Modo Copiado (Central) */}
                {isCopyMode && !occupiedData && isSelectedForCopy && (
                    <CheckCircleIcon sx={{ color: theme.palette.primary.main, fontSize: '2rem' }} />
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
                        <Typography variant="caption" sx={{ fontWeight: 'bold' }}>{t('front')}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: 1, flexGrow: 1 }}>{slots}</Box>
                </Box>
                <Paper sx={{ p: 2, mt: 2, display: 'flex', justifyContent: 'space-around', alignItems: 'center', border: '1px solid #333' }}>
                    <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="caption" color="gray">{t('totalBultos')}</Typography>
                        <Typography variant="h5" color="primary" sx={{ fontWeight: 'bold' }}>{grandTotalBoxes.toLocaleString()} {t('boxes')}</Typography>
                    </Box>
                    <Divider orientation="vertical" flexItem />
                    <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="caption" color="gray">{t('pallets')}</Typography>
                        <Typography variant="h5" sx={{ fontWeight: 'bold' }}>{totalPallets} / 26</Typography>
                    </Box>
                </Paper>
            </Box>
        </DndContext>
    );
};

export default TrailerGrid;