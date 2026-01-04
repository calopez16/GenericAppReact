import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Button,
    Box,
    Typography,
    Grid,
    IconButton,
    AppBar,
    Toolbar,
    Paper,
    MenuItem,
    useMediaQuery
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Clear';
import SaveIcon from '@mui/icons-material/Save';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import InventoryIcon from '@mui/icons-material/Inventory';

import { DataAPILabelsService } from '@data/Labels/Data';
import { useTranslation } from 'react-i18next';
import { ShowMessage } from '@helpers/NotificationService';
import { grey, red, orange } from '@mui/material/colors';

const PalletDetailModal = ({ open, onClose, onSave, initialData, position }) => {
    const { t } = useTranslation();
    const isMobile = useMediaQuery((theme) => theme.breakpoints.down('sm'));
    const labelService = DataAPILabelsService();

    // Estados
    const [palletData, setPalletData] = useState({});
    const [labels, setLabels] = useState([]);
    const [labelTypes, setLabelTypes] = useState([]);

    // 1. Cargar catálogo de etiquetas al abrir
    useEffect(() => {
        if (open) {
            const fetchLabels = async () => {
                try {
                    const res = await labelService.getDataPagination(1, 100, "", true);
                    const dataArray = res?.data?.data || res?.data || (Array.isArray(res) ? res : []);
                    setLabels(dataArray);
                } catch (e) {
                    setLabels([]);
                }
            };
            fetchLabels();
        }
    }, [open]);

    // 2. Sincronizar datos iniciales y recuperar tipos si ya existe un IdLabel
    useEffect(() => {
        if (open) {
            const data = initialData || { idManifestPallet: 0, position, temperatureF: '', idLabel: '', manifestPalletLoadings: [] };
            setPalletData(data);

            // Si el pallet ya tiene una etiqueta guardada, cargamos sus tipos inmediatamente
            if (data.idLabel && labels.length > 0) {
                const found = labels.find(l => l.idLabel === data.idLabel);
                setLabelTypes(found?.labelTypes || []);
            }
        }
    }, [initialData, open, labels]); // Depende de labels para asegurar que ya llegaron los datos de la API

    // Cálculos
    const currentLabel = labels.find(l => l.idLabel === palletData.idLabel);
    const maxAllowed = currentLabel?.maxBoxQuantity || 0;
    const totalBoxes = palletData.manifestPalletLoadings?.reduce((acc, curr) => acc + (Number(curr.boxQuantity) || 0), 0) || 0;
    const isExceeded = maxAllowed > 0 && totalBoxes > maxAllowed;

    const handleLabelChange = (e) => {
        const id = e.target.value;
        const found = labels.find(l => l.idLabel === id);

        setLabelTypes(found?.labelTypes || []);
        setPalletData(prev => ({
            ...prev,
            idLabel: id // Guardamos el ID en el objeto principal del pallet
        }));
    };

    const handleLabelTypeChange = (index, typeId) => {
        const typeFound = labelTypes.find(t => t.idLabelType === typeId);
        const newLoadings = [...(palletData.manifestPalletLoadings || [])];

        newLoadings[index] = {
            ...newLoadings[index],
            idLabelType: typeId, 
            boxQuantity: maxAllowed || 0,
            description: typeFound?.description || ''
        };
        setPalletData(prev => ({ ...prev, manifestPalletLoadings: newLoadings }));
    };

    const handleLoadingChange = (index, field, value) => {
        const newLoadings = [...(palletData.manifestPalletLoadings || [])];
        newLoadings[index] = { ...newLoadings[index], [field]: value };
        setPalletData(prev => ({ ...prev, manifestPalletLoadings: newLoadings }));
    };

    const handleAddLoading = () => {
        setPalletData(prev => ({
            ...prev,
            manifestPalletLoadings: [...(prev.manifestPalletLoadings || []),
            { idManifestPalletLoading: 0, description: '', boxQuantity: '', idLabelType: '' }]
        }));
    };

    const handleRemoveLoading = (index) => {
        const newLoadings = [...palletData.manifestPalletLoadings];
        newLoadings.splice(index, 1);
        setPalletData(prev => ({ ...prev, manifestPalletLoadings: newLoadings }));
    };

    const handleSavePallet = () => {
        if (isExceeded) {
            ShowMessage(`Excede el límite de ${maxAllowed} cajas`, 'error');
            return;
        }
        onSave(palletData);
        onClose();
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth fullScreen={isMobile} PaperProps={{ sx: { bgcolor: grey[900], color: '#fff' } }}>
            {!isMobile ? (
                <DialogTitle sx={{ borderBottom: `1px solid ${grey[800]}`, py: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="h6" fontWeight="bold">PALLET #{position}</Typography>
                        <Box sx={{ textAlign: 'right' }}>
                            <Typography variant="h6" color={isExceeded ? red[400] : "primary.main"} sx={{ fontWeight: 'bold', lineHeight: 1 }}>
                                {totalBoxes} / {maxAllowed || '--'}
                            </Typography>
                            <Typography variant="caption" sx={{ color: grey[500], fontWeight: 'bold' }}>MAX. BOXES</Typography>
                        </Box>
                    </Box>
                </DialogTitle>
            ) : (
                <AppBar sx={{ position: 'relative', bgcolor: grey[800] }}>
                    <Toolbar>
                        <IconButton edge="start" color="inherit" onClick={onClose}><CloseIcon /></IconButton>
                        <Typography sx={{ ml: 2, flex: 1 }} variant="h6">#{position} — {totalBoxes} BX</Typography>
                        <Button color="inherit" onClick={handleSavePallet}>{t('save')}</Button>
                    </Toolbar>
                </AppBar>
            )}

            <DialogContent sx={{ mt: 3 }}>
                <Grid container spacing={3}>
                    <Grid size={{ xs: 6 }} sx={{ mt: 1 }}>
                        <TextField fullWidth label="TEMP °F" type="number" size="small"
                            value={palletData.temperatureF || ''}
                            onChange={(e) => setPalletData({ ...palletData, temperatureF: e.target.value })}
                            sx={{ input: { color: '#fff' }, '& label': { color: grey[400] } }} />
                    </Grid>

                    <Grid size={{ xs: 12 }}>
                        <TextField select fullWidth label="ETIQUETA" size="small"
                            value={palletData.idLabel || ''}
                            onChange={handleLabelChange}
                            sx={{ '& .MuiSelect-select': { color: '#fff' }, '& label': { color: grey[400] } }}
                        >
                            {Array.isArray(labels) && labels.map((l) => (
                                <MenuItem key={l.idLabel} value={l.idLabel}>{l.description}</MenuItem>
                            ))}
                        </TextField>
                    </Grid>
                </Grid>

                <Box sx={{ mt: 5, mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="subtitle2" sx={{ color: grey[400], fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 1 }}>
                        <InventoryIcon sx={{ fontSize: 18 }} /> CARGAMENTOS
                        {isExceeded && <WarningAmberIcon sx={{ color: orange[500], fontSize: 20 }} />}
                    </Typography>
                    <Button startIcon={<AddIcon />} onClick={handleAddLoading} variant="contained" size="small" sx={{ borderRadius: '20px' }}>
                        {t('add')}
                    </Button>
                </Box>

                <Box sx={{ maxHeight: 380, overflowY: 'auto', pr: 0.5 }}>
                    {palletData.manifestPalletLoadings?.map((loading, index) => (
                        <Paper key={index} elevation={0} sx={{ p: 2, mb: 2, bgcolor: grey[800], border: `1px solid ${isExceeded ? red[700] : grey[700]}`, borderRadius: '8px' }}>
                            <Grid container spacing={2}>
                                {/* Fila 1: Tipo + Eliminar */}
                                <Grid size={{ xs: 10.5 }}>
                                    <TextField select fullWidth size="small" label="TIPO DE ETIQUETA" variant="filled"
                                        value={loading.idLabelType || ''}
                                        onChange={(e) => handleLabelTypeChange(index, e.target.value)}
                                        disabled={!palletData.idLabel}
                                        sx={{ '& .MuiSelect-select': { color: '#fff' }, '& label': { color: grey[400] }, bgcolor: 'rgba(255,255,255,0.05)' }}
                                    >
                                        {labelTypes.map((t) => (
                                            <MenuItem key={t.idLabelType} value={t.idLabelType}>{t.description}</MenuItem>
                                        ))}
                                    </TextField>
                                </Grid>
                                <Grid size={{ xs: 1.5 }} sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                                    <IconButton color="error" onClick={() => handleRemoveLoading(index)}><DeleteIcon /></IconButton>
                                </Grid>

                                {/* Fila 2: Cantidad + Descripción */}
                                <Grid size={{ xs: 3 }}>
                                    <TextField label="CANT" type="number" size="small" fullWidth
                                        value={loading.boxQuantity || ''}
                                        onChange={(e) => handleLoadingChange(index, 'boxQuantity', e.target.value)}
                                        sx={{ input: { color: '#fff' }, '& label': { color: grey[400] } }} />
                                </Grid>
                                <Grid size={{ xs: 9 }}>
                                    <TextField label="DESCRIPCIÓN" fullWidth size="small"
                                        value={loading.description || ''}
                                        onChange={(e) => handleLoadingChange(index, 'description', e.target.value)}
                                        sx={{ input: { color: '#fff' }, '& label': { color: grey[400] } }} />
                                </Grid>
                            </Grid>
                        </Paper>
                    ))}
                </Box>
            </DialogContent>

            {!isMobile && (
                <DialogActions sx={{ p: 3, borderTop: `1px solid ${grey[800]}`, gap: 1 }}>
                    <Button color="inherit" variant="outlined" startIcon={<CloseIcon />} onClick={onClose}>{t('cancel')}</Button>
                    <Button onClick={handleSavePallet} variant="contained" startIcon={<SaveIcon />} color={isExceeded ? "error" : "primary"} sx={{ fontWeight: 'bold', px: 4 }}>
                        {t('save')}
                    </Button>
                </DialogActions>
            )}
        </Dialog>
    );
};

export default PalletDetailModal;