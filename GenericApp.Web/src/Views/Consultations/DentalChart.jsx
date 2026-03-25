import React, { useState } from 'react';
import { Odontogram } from 'react-odontogram';
import 'react-odontogram/style.css';
import {
    Box, Typography, Paper, Chip, Button, Dialog, DialogTitle,
    DialogContent, DialogActions, TextField, Divider, Avatar,
    ToggleButtonGroup, ToggleButton,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';

const ADULT_UPPER_RIGHT = [18, 17, 16, 15, 14, 13, 12, 11];
const ADULT_UPPER_LEFT = [21, 22, 23, 24, 25, 26, 27, 28];
const ADULT_LOWER_RIGHT = [48, 47, 46, 45, 44, 43, 42, 41];
const ADULT_LOWER_LEFT = [31, 32, 33, 34, 35, 36, 37, 38];

const CHILD_UPPER_RIGHT = [55, 54, 53, 52, 51];
const CHILD_UPPER_LEFT = [61, 62, 63, 64, 65];
const CHILD_LOWER_RIGHT = [85, 84, 83, 82, 81];
const CHILD_LOWER_LEFT = [71, 72, 73, 74, 75];

// Palette for condition colors (fill + outline)
const CONDITION_COLORS = [
    { fill: '#ef535033', outline: '#ef5350' },
    { fill: '#42a5f533', outline: '#42a5f5' },
    { fill: '#66bb6a33', outline: '#66bb6a' },
    { fill: '#ffa72633', outline: '#ffa726' },
    { fill: '#ab47bc33', outline: '#ab47bc' },
    { fill: '#26c6da33', outline: '#26c6da' },
    { fill: '#8d6e6333', outline: '#8d6e63' },
    { fill: '#78909c33', outline: '#78909c' },
];

const QUICK_PROCEDURES = [
    'Extracción', 'Obturación', 'Endodoncia', 'Corona',
    'Limpieza', 'Blanqueamiento', 'Implante', 'Puente',
    'Sellador', 'Fluorización', 'Ortodoncia', 'Prótesis',
];

/**
 * Groups procedures by label into teethConditions for react-odontogram,
 * assigning a unique color per unique procedure label.
 */
function buildTeethConditions(procedures) {
    const map = new Map();
    procedures.forEach((p) => {
        const key = p.procedure;
        if (!map.has(key)) map.set(key, []);
        map.get(key).push(`teeth-${p.toothNumber}`);
    });
    const conditions = [];
    let idx = 0;
    map.forEach((teeth, label) => {
        const color = CONDITION_COLORS[idx % CONDITION_COLORS.length];
        conditions.push({ label, teeth, fillColor: color.fill, outlineColor: color.outline });
        idx++;
    });
    return conditions;
}

function ToothButton({ number, procedures, onClick, size = 'md' }) {
    const toothProcedures = procedures.filter(p => String(p.toothNumber) === String(number));
    const hasProcedures = toothProcedures.length > 0;
    const dotSize = size === 'sm' ? 6 : 8;
    const btnSize = size === 'sm' ? 36 : 44;
    const numSize = size === 'sm' ? 8 : 9;

    return (
        <Box
            onClick={() => onClick(number)}
            sx={{
                width: btnSize,
                height: btnSize,
                borderRadius: 1.5,
                border: '2px solid',
                borderColor: hasProcedures ? 'primary.main' : 'divider',
                bgcolor: hasProcedures ? 'primary.50' : 'background.paper',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 0.3,
                transition: 'all 0.15s',
                position: 'relative',
                flexShrink: 0,
                '&:hover': {
                    borderColor: 'primary.main',
                    bgcolor: 'primary.50',
                    transform: 'scale(1.06)',
                    zIndex: 1,
                },
            }}
        >
            <Typography sx={{ fontSize: numSize, fontWeight: 700, lineHeight: 1, color: 'text.primary' }}>
                {number}
            </Typography>
            {hasProcedures && (
                <Box sx={{ display: 'flex', gap: 0.3, flexWrap: 'wrap', justifyContent: 'center', position: 'absolute', bottom: 2 }}>
                    {toothProcedures.slice(0, 3).map((_, i) => {
                        const color = CONDITION_COLORS[i % CONDITION_COLORS.length];
                        return (
                            <Box
                                key={i}
                                sx={{
                                    width: dotSize,
                                    height: dotSize,
                                    borderRadius: '50%',
                                    bgcolor: color.outline,
                                }}
                            />
                        );
                    })}
                </Box>
            )}
        </Box>
    );
}

function ClassicDentalChart({ mode, procedures, onSelectTooth }) {
    const upperRight = mode === 'adult' ? ADULT_UPPER_RIGHT : CHILD_UPPER_RIGHT;
    const upperLeft = mode === 'adult' ? ADULT_UPPER_LEFT : CHILD_UPPER_LEFT;
    const lowerRight = mode === 'adult' ? ADULT_LOWER_RIGHT : CHILD_LOWER_RIGHT;
    const lowerLeft = mode === 'adult' ? ADULT_LOWER_LEFT : CHILD_LOWER_LEFT;
    const btnSize = mode === 'child' ? 'sm' : 'md';

    return (
        <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, overflowX: 'auto', bgcolor: 'background.default' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5, px: 1 }}>
                <Typography variant="caption" color="text.secondary" fontWeight={600}>? Der.</Typography>
                <Typography variant="caption" color="text.secondary" fontWeight={600}>Superior</Typography>
                <Typography variant="caption" color="text.secondary" fontWeight={600}>Izq. ?</Typography>
            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 0.5, mb: 0.5, flexWrap: 'nowrap' }}>
                {upperRight.map(n => (
                    <ToothButton key={n} number={n} procedures={procedures} onClick={onSelectTooth} size={btnSize} />
                ))}
                <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />
                {upperLeft.map(n => (
                    <ToothButton key={n} number={n} procedures={procedures} onClick={onSelectTooth} size={btnSize} />
                ))}
            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'center', my: 0.5 }}>
                <Typography variant="caption" color="text.secondary" sx={{ fontSize: 10 }}>— Línea media —</Typography>
            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 0.5, mt: 0.5, flexWrap: 'nowrap' }}>
                {lowerRight.map(n => (
                    <ToothButton key={n} number={n} procedures={procedures} onClick={onSelectTooth} size={btnSize} />
                ))}
                <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />
                {lowerLeft.map(n => (
                    <ToothButton key={n} number={n} procedures={procedures} onClick={onSelectTooth} size={btnSize} />
                ))}
            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.5, px: 1 }}>
                <Typography variant="caption" color="text.secondary" fontWeight={600}>? Der.</Typography>
                <Typography variant="caption" color="text.secondary" fontWeight={600}>Inferior</Typography>
                <Typography variant="caption" color="text.secondary" fontWeight={600}>Izq. ?</Typography>
            </Box>
        </Paper>
    );
}

function AddProcedureDialog({ open, selectedTeeth, onClose, onAdd }) {
    const [procedure, setProcedure] = useState('');

    const handleAdd = () => {
        if (!procedure.trim()) return;
        onAdd(selectedTeeth, procedure.trim());
        setProcedure('');
    };

    const handleClose = () => {
        setProcedure('');
        onClose();
    };

    const teethLabels = selectedTeeth.map(t => t.notations?.fdi ?? t.id).join(', ');

    return (
        <Dialog open={open} onClose={handleClose} maxWidth="xs" fullWidth>
            <DialogTitle sx={{ fontWeight: 700, pb: 1 }}>
                Registrar procedimiento
                <Typography variant="caption" display="block" color="text.secondary">
                    Diente(s): {teethLabels}
                </Typography>
            </DialogTitle>
            <DialogContent>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.8, mb: 2, mt: 0.5 }}>
                    {QUICK_PROCEDURES.map(p => (
                        <Chip
                            key={p}
                            label={p}
                            size="small"
                            onClick={() => setProcedure(p)}
                            variant={procedure === p ? 'filled' : 'outlined'}
                            color={procedure === p ? 'primary' : 'default'}
                            sx={{ cursor: 'pointer' }}
                        />
                    ))}
                </Box>
                <TextField
                    fullWidth
                    size="small"
                    label="Procedimiento"
                    value={procedure}
                    onChange={e => setProcedure(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter' && procedure.trim()) handleAdd(); }}
                    placeholder="Escribe o selecciona un procedimiento"
                    inputProps={{ maxLength: 200 }}
                    autoFocus
                />
            </DialogContent>
            <DialogActions>
                <Button onClick={handleClose}>Cancelar</Button>
                <Button variant="contained" onClick={handleAdd} disabled={!procedure.trim()} disableElevation>
                    Agregar
                </Button>
            </DialogActions>
        </Dialog>
    );
}

/**
* DentalChart
 *
 * Props:
 *  - procedures: Array<{ toothNumber: string|number, procedure: string }>
 *  - onChange: (updatedProcedures) => void
 */
export default function DentalChart({ procedures = [], onChange }) {
    const [mode, setMode] = useState('adult'); // 'adult' | 'child'
    const [viewType, setViewType] = useState('react'); // 'react' | 'classic'
    const [dialogOpen, setDialogOpen] = useState(false);
    const [pendingTeeth, setPendingTeeth] = useState([]);

    const teethConditions = buildTeethConditions(procedures);
    const maxTeeth = mode === 'adult' ? 8 : 5;

    // When user clicks a tooth in the Odontogram, open the procedure dialog
    const handleOdontogramChange = (selectedTeeth) => {
        if (selectedTeeth.length > 0) {
            setPendingTeeth(selectedTeeth);
            setDialogOpen(true);
        }
    };

    const handleClassicSelectTooth = (toothNumber) => {
        setPendingTeeth([{ id: `teeth-${toothNumber}`, notations: { fdi: String(toothNumber) } }]);
        setDialogOpen(true);
    };

    const handleAddProcedure = (selectedTeeth, procedure) => {
        const newEntries = selectedTeeth.map(t => ({
            toothNumber: t.notations?.fdi ?? t.id.replace('teeth-', ''),
            procedure,
        }));
        onChange?.([...procedures, ...newEntries]);
        setDialogOpen(false);
        setPendingTeeth([]);
    };

    const handleCloseDialog = () => {
        setDialogOpen(false);
        setPendingTeeth([]);
    };

    const handleRemoveProcedure = (index) => {
        onChange?.(procedures.filter((_, i) => i !== index));
    };

    return (
        <Box>
            {/* Header */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                <Avatar
                    sx={{ bgcolor: 'info.light', borderRadius: 1.5, width: 38, height: 38, color: 'white' }}
                >
                    <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                        <path d="M12 2C9.5 2 7.5 3.5 6.5 5.5C5.5 3.5 3.5 2 2 2C2 6 4 9 6 10C6 14 8 18 9 20C9.5 21 10 22 11 22C11.5 22 12 21.5 12 21C12 21.5 12.5 22 13 22C14 22 14.5 21 15 20C16 18 18 14 18 10C20 9 22 6 22 2C20.5 2 18.5 3.5 17.5 5.5C16.5 3.5 14.5 2 12 2Z" />
                    </svg>
                </Avatar>
                <Box sx={{ flexGrow: 1 }}>
                    <Typography variant="subtitle1" fontWeight={700}>Odontograma</Typography>
                    <Typography variant="caption" color="text.secondary">
                        Selecciona uno o varios dientes para registrar un procedimiento
                    </Typography>
                </Box>
                <ToggleButtonGroup
                    value={mode}
                    exclusive
                    onChange={(_, v) => { if (v) setMode(v); }}
                    size="small"
                >
                    <ToggleButton value="adult" sx={{ fontSize: 11, px: 1.5 }}>Adulto</ToggleButton>
                    <ToggleButton value="child" sx={{ fontSize: 11, px: 1.5 }}>Niño</ToggleButton>
                </ToggleButtonGroup>
            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
                <ToggleButtonGroup
                    value={viewType}
                    exclusive
                    onChange={(_, v) => { if (v) setViewType(v); }}
                    size="small"
                >
                    <ToggleButton value="classic" sx={{ fontSize: 11, px: 1.5 }}>Vista clásica</ToggleButton>
                    <ToggleButton value="react" sx={{ fontSize: 11, px: 1.5 }}>react-odontogram</ToggleButton>
                </ToggleButtonGroup>
            </Box>

            <Divider sx={{ mb: 2 }} />

            {viewType === 'react' ? (
                <Box sx={{ overflowX: 'auto', pb: 1, display: 'flex', justifyContent: 'center' }}>
                    <Box sx={{ width: '100%', maxWidth: 680 }}>
                        <Odontogram
                            key={mode}
                            onChange={handleOdontogramChange}
                            teethConditions={teethConditions.length > 0 ? teethConditions : undefined}
                            showLabels={teethConditions.length > 0}
                            maxTeeth={maxTeeth}
                            notation="FDI"
                            layout="circle"
                            tooltip={{
                                placement: 'top',
                                content: (payload) =>
                                    payload ? (
                                        <Box sx={{ minWidth: 120, fontSize: 12, p: 0.5 }}>
                                            <strong>Diente {payload.notations?.fdi}</strong>
                                            <div style={{ color: '#888', fontSize: 11 }}>{payload.type}</div>
                                        </Box>
                                    ) : null,
                            }}
                            styles={{ width: '100%' }}
                        />
                    </Box>
                </Box>
            ) : (
                <ClassicDentalChart
                    mode={mode}
                    procedures={procedures}
                    onSelectTooth={handleClassicSelectTooth}
                />
            )}

            {/* Registered procedures list */}
            {procedures.length > 0 && (
                <Paper variant="outlined" sx={{ mt: 2, borderRadius: 2, overflow: 'hidden' }}>
                    <Box sx={{ px: 2, py: 1.2, bgcolor: 'action.hover', display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="body2" fontWeight={700}>Procedimientos registrados</Typography>
                        <Chip label={procedures.length} size="small" color="primary" />
                    </Box>
                    <Box sx={{ p: 1.5, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                        {procedures.map((p, i) => {
                            const color = CONDITION_COLORS[i % CONDITION_COLORS.length];
                            return (
                                <Chip
                                    key={i}
                                    size="small"
                                    label={`D${p.toothNumber} – ${p.procedure}`}
                                    onDelete={() => handleRemoveProcedure(i)}
                                    deleteIcon={<DeleteIcon fontSize="small" />}
                                    sx={{
                                        bgcolor: color.fill,
                                        border: `1px solid ${color.outline}`,
                                        fontWeight: 600,
                                    }}
                                />
                            );
                        })}
                    </Box>
                </Paper>
            )}

            {/* Add procedure dialog */}
            <AddProcedureDialog
                open={dialogOpen}
                selectedTeeth={pendingTeeth}
                onClose={handleCloseDialog}
                onAdd={handleAddProcedure}
            />
        </Box>
    );
}

