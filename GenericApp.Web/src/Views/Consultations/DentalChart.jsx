import React, { useState, useEffect } from 'react';
import { Odontogram } from 'react-odontogram';
import 'react-odontogram/style.css';
import {
    Box, Typography, Paper, Chip, Button, Dialog, DialogTitle,
    DialogContent, DialogActions, Divider, Avatar,
    ToggleButtonGroup, ToggleButton, Alert,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import ChildCareIcon from '@mui/icons-material/ChildCare';

const ADULT_UPPER_RIGHT = [18, 17, 16, 15, 14, 13, 12, 11];
const ADULT_UPPER_LEFT  = [21, 22, 23, 24, 25, 26, 27, 28];
const ADULT_LOWER_RIGHT = [48, 47, 46, 45, 44, 43, 42, 41];
const ADULT_LOWER_LEFT  = [31, 32, 33, 34, 35, 36, 37, 38];

const CHILD_UPPER_RIGHT = [55, 54, 53, 52, 51];
const CHILD_UPPER_LEFT  = [61, 62, 63, 64, 65];
const CHILD_LOWER_RIGHT = [85, 84, 83, 82, 81];
const CHILD_LOWER_LEFT  = [71, 72, 73, 74, 75];

// Color palette — one slot per catalog treatment
const CONDITION_COLORS = [
    { fill: '#ef535033', outline: '#ef5350' },
    { fill: '#42a5f533', outline: '#42a5f5' },
    { fill: '#66bb6a33', outline: '#66bb6a' },
    { fill: '#ffa72633', outline: '#ffa726' },
    { fill: '#ab47bc33', outline: '#ab47bc' },
    { fill: '#26c6da33', outline: '#26c6da' },
    { fill: '#8d6e6333', outline: '#8d6e63' },
    { fill: '#78909c33', outline: '#78909c' },
    { fill: '#ef9a9a33', outline: '#ef9a9a' },
    { fill: '#a5d6a733', outline: '#a5d6a7' },
    { fill: '#ffe08233', outline: '#ffe082' },
];

function buildTeethConditions(procedures, catalogTreatments) {
    const colorByCode = new Map();
    catalogTreatments.forEach((t, i) => colorByCode.set(t.code, CONDITION_COLORS[i % CONDITION_COLORS.length]));

    const map = new Map();
    procedures.forEach((p) => {
        const key = p.treatmentCode ?? String(p.idTreatment);
        if (!map.has(key)) {
            map.set(key, {
                teeth: [],
                label: p.treatmentDescription ? `${p.treatmentCode} \u2013 ${p.treatmentDescription}` : key,
                color: colorByCode.get(key) ?? CONDITION_COLORS[map.size % CONDITION_COLORS.length],
            });
        }
        map.get(key).teeth.push(`teeth-${p.toothNumber}`);
    });

    return Array.from(map.values()).map(({ teeth, label, color }) => ({
        label,
        teeth,
        fillColor: color.fill,
        outlineColor: color.outline,
    }));
}

function getProcedureColor(p, catalogTreatments) {
    const idx = catalogTreatments.findIndex(t => t.code === p.treatmentCode);
    return CONDITION_COLORS[(idx >= 0 ? idx : 0) % CONDITION_COLORS.length];
}

// ??? ToothButton ??????????????????????????????????????????????????????????????
function ToothButton({ number, procedures, selected, onClick, size = 'md' }) {
    const toothProcedures = procedures.filter(p => String(p.toothNumber) === String(number));
    const hasProcedures   = toothProcedures.length > 0;
    const isSelected      = selected.includes(number);
    const dotSize  = size === 'sm' ? 6 : 8;
    const btnSize  = size === 'sm' ? 36 : 44;
    const numSize  = size === 'sm' ? 8 : 9;

    return (
        <Box
            onClick={() => onClick(number)}
            sx={{
                width: btnSize,
                height: btnSize,
                borderRadius: 1.5,
                border: '2px solid',
                borderColor: isSelected ? 'warning.main' : hasProcedures ? 'primary.main' : 'divider',
                bgcolor: isSelected ? 'warning.50' : hasProcedures ? 'primary.50' : 'background.paper',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 0.3,
                transition: 'all 0.15s',
                position: 'relative',
                flexShrink: 0,
                boxShadow: isSelected ? '0 0 0 2px #ffa726' : 'none',
                '&:hover': { borderColor: 'warning.main', bgcolor: 'warning.50', transform: 'scale(1.08)', zIndex: 1 },
            }}
        >
            <Typography sx={{ fontSize: numSize, fontWeight: 700, lineHeight: 1, color: 'text.primary' }}>
                {number}
            </Typography>
            {hasProcedures && (
                <Box sx={{ display: 'flex', gap: 0.3, flexWrap: 'wrap', justifyContent: 'center', position: 'absolute', bottom: 2 }}>
                    {toothProcedures.slice(0, 3).map((_, i) => (
                        <Box key={i} sx={{ width: dotSize, height: dotSize, borderRadius: '50%', bgcolor: CONDITION_COLORS[i % CONDITION_COLORS.length].outline }} />
                    ))}
                </Box>
            )}
        </Box>
    );
}

// ??? Classic dental chart grid ????????????????????????????????????????????????
function ClassicDentalChart({ mode, procedures, selectedTeeth, onToothClick }) {
    const upperRight = mode === 'adult' ? ADULT_UPPER_RIGHT : CHILD_UPPER_RIGHT;
    const upperLeft  = mode === 'adult' ? ADULT_UPPER_LEFT  : CHILD_UPPER_LEFT;
    const lowerRight = mode === 'adult' ? ADULT_LOWER_RIGHT : CHILD_LOWER_RIGHT;
    const lowerLeft  = mode === 'adult' ? ADULT_LOWER_LEFT  : CHILD_LOWER_LEFT;
    const btnSize    = mode === 'child' ? 'sm' : 'md';

    const row = (teeth) => teeth.map(n => (
        <ToothButton key={n} number={n} procedures={procedures} selected={selectedTeeth} onClick={onToothClick} size={btnSize} />
    ));

    return (
        <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, overflowX: 'auto', bgcolor: 'background.default' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5, px: 1 }}>
                <Typography variant="caption" color="text.secondary" fontWeight={600}>&#8592; Der.</Typography>
                <Typography variant="caption" color="text.secondary" fontWeight={600}>Superior</Typography>
                <Typography variant="caption" color="text.secondary" fontWeight={600}>Izq. &#8594;</Typography>
            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 0.5, mb: 0.5, flexWrap: 'nowrap' }}>
                {row(upperRight)}
                <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />
                {row(upperLeft)}
            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'center', my: 0.5 }}>
                <Typography variant="caption" color="text.secondary" sx={{ fontSize: 10 }}>
                    &#8212; L&#237;nea media &#8212;
                </Typography>
            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 0.5, mt: 0.5, flexWrap: 'nowrap' }}>
                {row(lowerRight)}
                <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />
                {row(lowerLeft)}
            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.5, px: 1 }}>
                <Typography variant="caption" color="text.secondary" fontWeight={600}>&#8592; Der.</Typography>
                <Typography variant="caption" color="text.secondary" fontWeight={600}>Inferior</Typography>
                <Typography variant="caption" color="text.secondary" fontWeight={600}>Izq. &#8594;</Typography>
            </Box>
        </Paper>
    );
}

// ??? Assign treatment dialog ??????????????????????????????????????????????????
function AssignTreatmentDialog({ open, selectedTeeth, onClose, onAdd, catalogTreatments }) {
    const [pickedTreatment, setPickedTreatment] = useState(null);

    useEffect(() => { if (!open) setPickedTreatment(null); }, [open]);

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle sx={{ fontWeight: 700, pb: 1 }}>
                Asignar tratamiento
                <Typography variant="caption" display="block" color="text.secondary" sx={{ mt: 0.3 }}>
                    Diente(s): <strong>{selectedTeeth.join(', ') || '&#8212;'}</strong>
                </Typography>
            </DialogTitle>
            <DialogContent>
                {catalogTreatments.length === 0 ? (
                    <Alert severity="info">Cargando cat&#225;logo de tratamientos&#8230;</Alert>
                ) : (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 0.5 }}>
                        {catalogTreatments.map((t, i) => {
                            const color  = CONDITION_COLORS[i % CONDITION_COLORS.length];
                            const picked = pickedTreatment?.idTreatment === t.idTreatment;
                            return (
                                <Chip
                                    key={t.idTreatment}
                                    label={`${t.code} \u2013 ${t.description}`}
                                    onClick={() => setPickedTreatment(t)}
                                    variant={picked ? 'filled' : 'outlined'}
                                    sx={{
                                        cursor: 'pointer',
                                        fontWeight: picked ? 700 : 400,
                                        bgcolor: picked ? color.fill : undefined,
                                        borderColor: color.outline,
                                        '&:hover': { bgcolor: color.fill },
                                    }}
                                />
                            );
                        })}
                    </Box>
                )}
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Cancelar</Button>
                <Button
                    variant="contained"
                    disableElevation
                    onClick={() => pickedTreatment && onAdd(selectedTeeth, pickedTreatment)}
                    disabled={!pickedTreatment || selectedTeeth.length === 0}
                >
                    Agregar a {selectedTeeth.length} diente{selectedTeeth.length !== 1 ? 's' : ''}
                </Button>
            </DialogActions>
        </Dialog>
    );
}

// ??? DentalChart (main export) ????????????????????????????????????????????????
/**
 * Props:
 *  - procedures        : { idTreatment, toothNumber, treatmentCode, treatmentDescription }[]
 *  - onChange          : (updatedProcedures) => void
 *  - catalogTreatments : { idTreatment, code, description }[]
 *  - isChild           : boolean — pre-selects child odontogram
 */
export default function DentalChart({ procedures = [], onChange, catalogTreatments = [], isChild = false }) {
    const [mode, setMode]             = useState(isChild ? 'child' : 'adult');
    const [viewType, setViewType]     = useState('classic');
    const [dialogOpen, setDialogOpen] = useState(false);
    const [classicSelected, setClassicSelected] = useState([]);

    // Sync mode when isChild prop changes (patient loaded asynchronously)
    useEffect(() => { setMode(isChild ? 'child' : 'adult'); }, [isChild]);

    const teethConditions = buildTeethConditions(procedures, catalogTreatments);
    const maxTeeth = mode === 'adult' ? 8 : 5;

    // react-odontogram: selection opens dialog immediately
    const handleOdontogramChange = (selectedTeeth) => {
        if (selectedTeeth.length > 0) {
            setClassicSelected(selectedTeeth.map(t => Number(t.notations?.fdi ?? t.id.replace('teeth-', ''))));
            setDialogOpen(true);
        }
    };

    // Classic view: toggle tooth in selection set
    const handleClassicToothClick = (number) => {
        setClassicSelected(prev => prev.includes(number) ? prev.filter(n => n !== number) : [...prev, number]);
    };

    const handleCloseDialog = () => setDialogOpen(false);

    const handleAddProcedure = (toothNumbers, treatment) => {
        const newEntries = toothNumbers.map(num => ({
            idTreatment: treatment.idTreatment,
            toothNumber: num,
            treatmentCode: treatment.code,
            treatmentDescription: treatment.description,
        }));
        onChange?.([...procedures, ...newEntries]);
        setClassicSelected([]);
        setDialogOpen(false);
    };

    return (
        <Box>
            {/* ?? Header ?? */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                <Avatar sx={{ bgcolor: 'info.light', borderRadius: 1.5, width: 38, height: 38, color: 'white' }}>
                    <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                        <path d="M12 2C9.5 2 7.5 3.5 6.5 5.5C5.5 3.5 3.5 2 2 2C2 6 4 9 6 10C6 14 8 18 9 20C9.5 21 10 22 11 22C11.5 22 12 21.5 12 21C12 21.5 12.5 22 13 22C14 22 14.5 21 15 20C16 18 18 14 18 10C20 9 22 6 22 2C20.5 2 18.5 3.5 17.5 5.5C16.5 3.5 14.5 2 12 2Z" />
                    </svg>
                </Avatar>
                <Box sx={{ flexGrow: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="subtitle1" fontWeight={700}>Odontograma</Typography>
                        {isChild && (
                            <Chip
                                icon={<ChildCareIcon sx={{ fontSize: 14 }} />}
                                label="Pedi&#225;trico"
                                size="small"
                                color="warning"
                                variant="outlined"
                                sx={{ height: 20, fontSize: 11 }}
                            />
                        )}
                    </Box>
                    <Typography variant="caption" color="text.secondary">
                        {viewType === 'classic'
                            ? 'Haz clic en uno o varios dientes y luego presiona &#8220;Asignar tratamiento&#8221;'
                            : 'Selecciona dientes en el odontograma para asignarles un tratamiento'}
                    </Typography>
                </Box>
                <ToggleButtonGroup
                    value={mode}
                    exclusive
                    onChange={(_, v) => { if (v) { setMode(v); setClassicSelected([]); } }}
                    size="small"
                >
                    <ToggleButton value="adult" sx={{ fontSize: 11, px: 1.5 }}>Adulto</ToggleButton>
                    <ToggleButton value="child" sx={{ fontSize: 11, px: 1.5 }}>Ni&#241;o</ToggleButton>
                </ToggleButtonGroup>
            </Box>

            {/* ?? View switcher ?? */}
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
                <ToggleButtonGroup
                    value={viewType}
                    exclusive
                    onChange={(_, v) => { if (v) { setViewType(v); setClassicSelected([]); } }}
                    size="small"
                >
                    <ToggleButton value="classic" sx={{ fontSize: 11, px: 1.5 }}>Vista cl&#225;sica</ToggleButton>
                    <ToggleButton value="react"   sx={{ fontSize: 11, px: 1.5 }}>react-odontogram</ToggleButton>
                </ToggleButtonGroup>
            </Box>

            <Divider sx={{ mb: 2 }} />

            {/* ?? Chart ?? */}
            {viewType === 'react' ? (
                <Box sx={{ overflowX: 'auto', pb: 1, display: 'flex', justifyContent: 'center' }}>
                    <Box sx={{ width: '100%', maxWidth: 700 }}>
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
                    selectedTeeth={classicSelected}
                    onToothClick={handleClassicToothClick}
                />
            )}

            {/* ?? Assign button bar (classic view) ?? */}
            {viewType === 'classic' && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1.5, minHeight: 36 }}>
                    {classicSelected.length > 0 ? (
                        <>
                            <Typography variant="caption" color="text.secondary" sx={{ flexGrow: 1 }}>
                                Seleccionados:&nbsp;<strong>{classicSelected.join(', ')}</strong>
                            </Typography>
                            <Button size="small" onClick={() => setClassicSelected([])}>
                                Limpiar
                            </Button>
                            <Button
                                variant="contained"
                                size="small"
                                disableElevation
                                onClick={() => setDialogOpen(true)}
                            >
                                Asignar tratamiento ({classicSelected.length})
                            </Button>
                        </>
                    ) : (
                        <Typography variant="caption" color="text.disabled">
                            Haz clic en un diente para seleccionarlo
                        </Typography>
                    )}
                </Box>
            )}

            {/* ?? Registered treatments list ?? */}
            {procedures.length > 0 && (
                <Paper variant="outlined" sx={{ mt: 2, borderRadius: 2, overflow: 'hidden' }}>
                    <Box sx={{ px: 2, py: 1.2, bgcolor: 'action.hover', display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="body2" fontWeight={700}>Tratamientos registrados</Typography>
                        <Chip label={procedures.length} size="small" color="primary" />
                    </Box>
                    <Box sx={{ p: 1.5, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                        {procedures.map((p, i) => {
                            const color = getProcedureColor(p, catalogTreatments);
                            return (
                                <Chip
                                    key={i}
                                    size="small"
                                    label={`D${p.toothNumber} \u2013 ${p.treatmentCode ?? ''} ${p.treatmentDescription ?? ''}`}
                                    onDelete={() => onChange?.(procedures.filter((_, j) => j !== i))}
                                    deleteIcon={<DeleteIcon fontSize="small" />}
                                    sx={{ bgcolor: color.fill, border: `1px solid ${color.outline}`, fontWeight: 600 }}
                                />
                            );
                        })}
                    </Box>
                </Paper>
            )}

            {/* ?? Dialog ?? */}
            <AssignTreatmentDialog
                open={dialogOpen}
                selectedTeeth={classicSelected}
                onClose={handleCloseDialog}
                onAdd={handleAddProcedure}
                catalogTreatments={catalogTreatments}
            />
        </Box>
    );
}
