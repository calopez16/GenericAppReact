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
    useTheme,
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
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const labelService = DataAPILabelsService();

    // Estados
    const [palletData, setPalletData] = useState(initialData || {});
    const [labels, setLabels] = useState([]);
    const [selectedLabelId, setSelectedLabelId] = useState('');
    const [labelTypes, setLabelTypes] = useState([]);

    // Cálculos de Totales y Validaciones
    const currentLabel = labels.find(l => l.idLabel === selectedLabelId);
    const maxAllowed = currentLabel?.maxBoxQuantity || 0;
    const totalBoxes = palletData.manifestPalletLoadings?.reduce((acc, curr) => acc + (Number(curr.boxQuantity) || 0), 0) || 0;
    const isExceeded = maxAllowed > 0 && totalBoxes > maxAllowed;

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

    useEffect(() => {
        setPalletData(initialData || { idManifestPallet: 0, position, temperatureF: '', manifestPalletLoadings: [] });
        setSelectedLabelId('');
        setLabelTypes([]);
    }, [initialData, position, open]);

    const handleLabelChange = (e) => {
        const id = e.target.value;
        setSelectedLabelId(id);
        const found = labels.find(l => l.idLabel === id);
        setLabelTypes(found?.labelTypes || []);
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
            ShowMessage(t('limitExceeded', { total: totalBoxes, max: maxAllowed }), 'error');
            return;
        }
        onSave(palletData);
        onClose();
    };

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="sm"
            fullWidth
            fullScreen={isMobile}
        >
            {isMobile ? (
                <AppBar sx={{ position: 'relative' }}>
                    <Toolbar>
                        <IconButton edge="start" color="inherit" onClick={onClose}><CloseIcon /></IconButton>
                        <Typography sx={{ ml: 2, flex: 1 }} variant="h6">#{position} — {totalBoxes} BX</Typography>
                        <Button color="inherit" onClick={handleSavePallet}>{t('save')}</Button>
                    </Toolbar>
                </AppBar>
            ) : (
                <DialogTitle sx={{ borderBottom: `1px solid ${grey[800]}`, py: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="h6" fontWeight="bold">PALLET #{position}</Typography>
                        <Box sx={{ textAlign: 'right' }}>
                            <Typography variant="h6" color={isExceeded ? red[400] : "primary.main"} sx={{ fontWeight: 'bold', lineHeight: 1 }}>
                                {totalBoxes} / {maxAllowed || '--'}
                            </Typography>
                            <Typography variant="caption" sx={{ fontWeight: 'bold' }}>MAX. BOXES</Typography>
                        </Box>
                    </Box>
                </DialogTitle>
            )}

            <DialogContent sx={{ mt: 3 }}>
                <Grid container spacing={3}>
                    <Grid size={{ xs: 6 }} sx={{mt:1} }>
                        <TextField
                            fullWidth
                            label="TEMP °F"
                            type="number"
                            size="small"
                            value={palletData.temperatureF || ''}
                            onChange={(e) => setPalletData({ ...palletData, temperatureF: e.target.value })}
                        />
                    </Grid>

                    <Grid size={{ xs: 12 }}>
                        <TextField
                            select
                            fullWidth
                            label="SELECT LABEL"
                            size="small"
                            value={selectedLabelId}
                            onChange={handleLabelChange}
                        >
                            {Array.isArray(labels) && labels.map((l) => (
                                <MenuItem key={l.idLabel} value={l.idLabel}>{l.description}</MenuItem>
                            ))}
                        </TextField>
                    </Grid>
                </Grid>

                <Box sx={{ mt: 5, mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 1 }}>
                        <InventoryIcon sx={{ fontSize: 18 }} /> LOADINGS
                        {isExceeded && <WarningAmberIcon sx={{ color: orange[500], fontSize: 20 }} />}
                    </Typography>
                    <Button
                        startIcon={<AddIcon />}
                        onClick={handleAddLoading}
                        variant="contained"
                        size="small"
                    >
                        {t('add')}
                    </Button>
                </Box>

                <Box sx={{ maxHeight: 380, overflowY: 'auto', pr: 0.5 }}>
                    {palletData.manifestPalletLoadings?.map((loading, index) => (
                        <Paper
                            key={index}
                            elevation={0}
                            sx={{ p: 2, mb: 2, border: `1px solid ${isExceeded ? red[700] : ''}`, borderRadius: '8px' }}
                        >
                            <Grid container spacing={2}>
                                <Grid size={{ xs: 10.5 }}>
                                    <TextField
                                        select
                                        fullWidth
                                        size="small"
                                        label="LABEL TYPE"
                                        variant="filled"
                                        value={loading.idLabelType || ''}
                                        onChange={(e) => handleLabelTypeChange(index, e.target.value)}
                                        disabled={!selectedLabelId}
                                    >
                                        {labelTypes.map((t) => (
                                            <MenuItem key={t.idLabelType} value={t.idLabelType}>{t.description}</MenuItem>
                                        ))}
                                    </TextField>
                                </Grid>
                                <Grid size={{ xs: 1.5 }} sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                                    <IconButton color="error" onClick={() => handleRemoveLoading(index)}>
                                        <DeleteIcon />
                                    </IconButton>
                                </Grid>

                                {/* Fila 2: Cantidad + Descripción */}
                                <Grid size={{ xs: 3 }}>
                                    <TextField
                                        label="QTY"
                                        type="number"
                                        size="small"
                                        fullWidth
                                        value={loading.boxQuantity || ''}
                                        onChange={(e) => handleLoadingChange(index, 'boxQuantity', e.target.value)}
                                        sx={{'& label': { color: grey[400] } }}
                                    />
                                </Grid>
                                <Grid size={{ xs: 9 }}>
                                    <TextField
                                        label="DESCRIPTION"
                                        fullWidth
                                        size="small"
                                        value={loading.description || ''}
                                        onChange={(e) => handleLoadingChange(index, 'description', e.target.value)}
                                        sx={{ '& label': { color: grey[400] } }}
                                    />
                                </Grid>
                            </Grid>
                        </Paper>
                    ))}
                </Box>
            </DialogContent>

            {!isMobile && (
                <DialogActions sx={{ p: 3, borderTop: `1px solid ${grey[800]}`, gap: 1 }}>
                    <Button
                        color="inherit"
                        variant="outlined"
                        startIcon={<CloseIcon />}
                        onClick={onClose}
                    >
                        {t('cancel')}
                    </Button>
                    <Button
                        onClick={handleSavePallet}
                        variant="contained"
                        startIcon={<SaveIcon />}
                        color={isExceeded ? "error" : "primary"}
                        sx={{ fontWeight: 'bold', px: 4 }}
                    >
                        {t('save')}
                    </Button>
                </DialogActions>
            )}
        </Dialog>
    );
};

export default PalletDetailModal;