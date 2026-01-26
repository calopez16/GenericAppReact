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
    Paper,
    MenuItem,
    useMediaQuery,
    FormControlLabel,
    Checkbox,
    Chip
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Clear';
import SaveIcon from '@mui/icons-material/Save';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import InventoryIcon from '@mui/icons-material/Inventory';
import SensorsIcon from '@mui/icons-material/Sensors';

import { DataAPILabelsService } from '@data/Labels/Data';
import { useTranslation } from 'react-i18next';
import { ShowMessage } from '@helpers/NotificationService';
import { grey, red, orange } from '@mui/material/colors';

const PalletDetailModal = ({ open, onClose, onSave, initialData, position, onDelete }) => {
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

                    if (initialData?.idLabel && !dataArray.some(l => l.idLabel === initialData.idLabel)) {
                        const missingLabel = {
                            idLabel: initialData.idLabel,
                            description: initialData.idLabelNavigation?.description || '',
                            isDeleted: true,
                            maxBoxQuantity: initialData.idLabelNavigation?.maxBoxQuantity || 0,
                            // Llenamos labelTypes con los datos de las cargas existentes
                            labelTypes: initialData.manifestPalletLoadings?.map(loading => ({
                                idLabelType: loading.idLabelType,
                                description: loading.idLabelTypeNavigation?.description || '',
                                size: loading.idLabelTypeNavigation?.size || '',
                                idLabel: initialData.idLabel
                            })).filter((value, index, self) =>
                                // Opcional: Evitar duplicados si hay varias cargas con el mismo tipo
                                index === self.findIndex((t) => t.idLabelType === value.idLabelType)
                            ) || []
                        };
                        dataArray.push(missingLabel);
                    }

                    setLabels(dataArray);
                } catch (e) {
                    setLabels([]);
                }
            };
            fetchLabels();
        }
    }, [open, initialData]);

    // Sincronizar data inicial y tipos
    useEffect(() => {
        if (open) {
            const data = initialData || { idManifestPallet: 0, position, temperatureF: '', idLabel: '', chismografo: false, manifestPalletLoadings: [] };
            setPalletData(data);

            let currentTypes = [];
            const found = labels.find(l => l.idLabel === data.idLabel);
            if (found) {
                currentTypes = [...(found.labelTypes || [])];
            }

            data.manifestPalletLoadings?.forEach(loading => {
                if (loading.idLabelTypeNavigation) {
                    const exists = currentTypes.some(t => t.idLabelType === loading.idLabelType);
                    if (!exists) {
                        currentTypes.push({
                            idLabelType: loading.idLabelType,
                            description: loading.idLabelTypeNavigation.description,
                            size: loading.idLabelTypeNavigation.size,
                            idLabel: data.idLabel
                        });
                    }
                }
            });

            setLabelTypes(currentTypes);
        }
    }, [open, initialData, labels]);

    // Cálculos
    const currentLabel = labels.find(l => l.idLabel === palletData.idLabel);
    const maxAllowed = currentLabel?.maxBoxQuantity || 0;
    const totalBoxes = palletData.manifestPalletLoadings?.reduce((acc, curr) => acc + (Number(curr.boxQuantity) || 0), 0) || 0;
    const isExceeded = maxAllowed > 0 && totalBoxes > maxAllowed;

    // Bloqueo de Dropdown: Si hay elementos en la lista de cargas
    const isLabelSelectorDisabled = palletData.manifestPalletLoadings?.length > 0;

    const handleLabelChange = (e) => {
        const id = e.target.value;
        const found = labels.find(l => l.idLabel === id);

        setLabelTypes(found?.labelTypes || []);
        setPalletData(prev => ({
            ...prev,
            idLabel: id
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
        if (!palletData.idLabel) {
            ShowMessage(t('selectLabelFirst'), 'warning');
            return;
        }
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
        //if (isExceeded) {
        //    ShowMessage(`${t('maxBoxQuantityExcedeed', { quantity: maxAllowed })}`, 'info');
        //}
        onSave(palletData);
        onClose();
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle sx={{ borderBottom: `1px solid ${grey[800]}`, py: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="h6" fontWeight="bold">PALLET #{position}</Typography>
                    <Box sx={{ textAlign: 'right' }}>
                        <Typography variant="h6" color={isExceeded ? red[400] : "primary.main"} sx={{ fontWeight: 'bold', lineHeight: 1 }}>
                            {totalBoxes} / {maxAllowed || '--'}
                        </Typography>
                        <Typography variant="caption" sx={{ color: grey[500], fontWeight: 'bold' }}>{t('maxBoxes')}</Typography>
                    </Box>
                </Box>
            </DialogTitle>

            <DialogContent sx={{ mt: 3 }}>
                <Grid container spacing={3}>
                    <Grid size={{ xs: 6 }} sx={{ mt: 1 }}>
                        <TextField fullWidth label={t('temperatureF')} type="number" size="small"
                            value={palletData.temperatureF || ''}
                            onChange={(e) => setPalletData({ ...palletData, temperatureF: e.target.value })}
                        />
                    </Grid>
                    <Grid size={{ xs: 6 }}>
                        <Paper variant="outlined" sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mt: '5px', borderColor: palletData.chismografo ? '#29b6f6' : grey[700], transition: 'all 0.3s' }}>
                            <FormControlLabel
                                control={
                                    <Checkbox
                                        checked={palletData.chismografo || false}
                                        onChange={(e) => setPalletData({ ...palletData, chismografo: e.target.checked })}
                                        icon={<SensorsIcon sx={{ color: grey[500] }} />}
                                        checkedIcon={<SensorsIcon className="pulse-animation" />}
                                    />
                                }
                                label={
                                    <Typography variant="body2" sx={{ color: palletData.chismografo ? '#29b6f6' : grey[400], fontWeight: palletData.chismografo ? 'bold' : 'normal' }}>
                                        {t('chismografo')}
                                    </Typography>
                                }
                            />
                        </Paper>
                    </Grid>
                    <Grid size={{ xs: 12 }}>
                        <TextField
                            select
                            fullWidth
                            label={t('label')}
                            size="small"
                            value={palletData.idLabel || ''}
                            onChange={handleLabelChange}
                            disabled={isLabelSelectorDisabled}
                            helperText={isLabelSelectorDisabled ? t('clearLoadsToChangeLabel') : ""}
                        >
                            {Array.isArray(labels) && labels.map((l) => (
                                <MenuItem key={l.idLabel} value={l.idLabel}>
                                    {l.description}
                                    {l.isDeleted && (
                                        <Chip
                                            label={t('deleted')}
                                            size="small"
                                            variant="outlined"
                                            color="secondary"
                                            sx={{ marginLeft: 1 }}
                                        />
                                    )}
                                </MenuItem>
                            ))}
                        </TextField>
                    </Grid>
                </Grid>

                <Box sx={{ mt: 5, mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="subtitle2" sx={{ color: grey[400], fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 1 }}>
                        <InventoryIcon sx={{ fontSize: 18 }} /> {t('shipload')}
                        {isExceeded && <WarningAmberIcon sx={{ color: orange[500], fontSize: 20 }} />}
                    </Typography>
                    <Button startIcon={<AddIcon />} onClick={handleAddLoading} variant="contained" size="small">
                        {t('add')}
                    </Button>
                </Box>

                <Box sx={{ maxHeight: 380, overflowY: 'auto', pr: 0.5 }}>
                    {palletData.manifestPalletLoadings?.map((loading, index) => (
                        <Paper key={index} elevation={0} sx={{ p: 2, mb: 2, border: `1px solid ${isExceeded ? red[700] : ""}`, borderRadius: '8px' }}>
                            <Grid container spacing={2}>
                                <Grid size={{ xs: 10.5 }}>
                                    <TextField select fullWidth size="small" label={t('labelType')} variant="filled"
                                        value={loading.idLabelType || ''}
                                        onChange={(e) => handleLabelTypeChange(index, e.target.value)}
                                        disabled={!palletData.idLabel}
                                    >
                                        {labelTypes.map((t_type) => (
                                            <MenuItem key={t_type.idLabelType} value={t_type.idLabelType}>
                                                {t_type.description}
                                                <Chip label={t_type.size} size="small" variant="filled" color="primary" sx={{ marginLeft: 1 }} />
                                            </MenuItem>
                                        ))}
                                    </TextField>
                                </Grid>
                                <Grid size={{ xs: 1.5 }} sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                                    <IconButton color="error" onClick={() => handleRemoveLoading(index)}><DeleteIcon /></IconButton>
                                </Grid>

                                <Grid size={{ xs: 3 }}>
                                    <TextField label={t('boxes')} type="number" size="small" fullWidth
                                        value={loading.boxQuantity || ''}
                                        onChange={(e) => handleLoadingChange(index, 'boxQuantity', e.target.value)}
                                    />
                                </Grid>
                                <Grid size={{ xs: 9 }}>
                                    <TextField label={t('description')} fullWidth size="small"
                                        value={loading.description || ''}
                                        onChange={(e) => handleLoadingChange(index, 'description', e.target.value)}
                                    />
                                </Grid>
                            </Grid>
                        </Paper>
                    ))}
                </Box>
            </DialogContent>

            <DialogActions sx={{ p: 3, borderTop: `1px solid ${grey[800]}`, gap: 1 }}>
                {(palletData.idManifestPallet > 0 || palletData.manifestPalletLoadings?.length > 0) && (
                    <Button
                        color="error"
                        variant="text"
                        startIcon={<DeleteIcon />}
                        onClick={() => onDelete(position)}
                        sx={{ mr: 'auto' }}
                    >
                        {t('delete')}
                    </Button>
                )}
                <Button color="inherit" variant="outlined" startIcon={<CloseIcon />} onClick={onClose}>{t('cancel')}</Button>
                <Button onClick={handleSavePallet} variant="contained" startIcon={<SaveIcon />} color={"primary"}>
                    {t('save')}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default PalletDetailModal;