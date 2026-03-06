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
    FormControlLabel,
    Checkbox,
    Chip,
    Autocomplete,
    Avatar,
    Divider,
    Tooltip,
    LinearProgress
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import SaveIcon from '@mui/icons-material/Save';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import InventoryIcon from '@mui/icons-material/Inventory';
import SensorsIcon from '@mui/icons-material/Sensors';
import ViewInArIcon from '@mui/icons-material/ViewInAr';

import { DataAPILabelsService } from '@data/Labels/Data';
import { useTranslation } from 'react-i18next';
import { ShowMessage } from '@helpers/NotificationService';

const PalletDetailModal = ({ open, onClose, onSave, initialData, position, onDelete, allPallets = [] }) => {
const { t } = useTranslation();
const labelService = DataAPILabelsService();

    // Estados
    const [palletData, setPalletData] = useState({});
    const [labels, setLabels] = useState([]);
    const [labelTypes, setLabelTypes] = useState([]);
    const [submitted, setSubmitted] = useState(false); // Control de validación visual

    // Limpiar estado de validación al abrir el modal
    useEffect(() => {
        if (open) {
            setSubmitted(false);
        }
    }, [open]);

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
                            labelTypes: initialData.manifestPalletLoadings?.map(loading => ({
                                idLabelType: loading.idLabelType,
                                description: loading.idLabelTypeNavigation?.description || '',
                                size: loading.idLabelTypeNavigation?.size || '',
                                idLabel: initialData.idLabel
                            })).filter((value, index, self) =>
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

    // Sincronizar data inicial
    useEffect(() => {
        if (open) {
            let data = initialData || {
                idManifestPallet: 0,
                position,
                temperatureF: '',
                idLabel: '',
                chismografo: false,
                manifestPalletLoadings: []
            };

            const isNewPallet = !initialData || initialData.idManifestPallet === 0;

            if (isNewPallet && position > 1 && Array.isArray(allPallets)) {
                const previousPallet = allPallets.find(p => p.position === position - 1);
                if (previousPallet && previousPallet.temperatureF) {
                    data = {
                        ...data,
                        temperatureF: previousPallet.temperatureF
                    };
                }
            }

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
    }, [open, initialData, labels, position, allPallets]);

    const currentLabel = labels.find(l => l.idLabel === palletData.idLabel);
    const maxAllowed = currentLabel?.maxBoxQuantity || 0;
    const totalBoxes = palletData.manifestPalletLoadings?.reduce((acc, curr) => acc + (Number(curr.boxQuantity) || 0), 0) || 0;
    const isExceeded = maxAllowed > 0 && totalBoxes > maxAllowed;
    const isLabelSelectorDisabled = palletData.manifestPalletLoadings?.length > 0;

    const handleLabelChange = (event, newValue) => {
        const id = newValue ? newValue.idLabel : '';
        const found = labels.find(l => l.idLabel === id);
        setLabelTypes(found?.labelTypes || []);
        setPalletData(prev => ({ ...prev, idLabel: id }));
    };

    const handleLabelTypeChange = (index, typeId) => {
        const newLoadings = [...(palletData.manifestPalletLoadings || [])];
        const boxesOtherRows = newLoadings.reduce((acc, curr, i) => i === index ? acc : acc + (Number(curr.boxQuantity) || 0), 0);
        const remainingSpace = maxAllowed - boxesOtherRows;

        newLoadings[index] = {
            ...newLoadings[index],
            idLabelType: typeId,
            boxQuantity: remainingSpace > 0 ? remainingSpace : 0
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
        setSubmitted(true); // Activar bordes rojos

        if (!palletData.idLabel) {
            ShowMessage(t('labelRequired'), 'error');
            return;
        }

        if (!palletData.manifestPalletLoadings || palletData.manifestPalletLoadings.length === 0) {
            ShowMessage(t('atLeastOneLoadingRequired'), 'error');
            return;
        }

        const hasInvalidItems = palletData.manifestPalletLoadings.some(l => !l.idLabelType || !l.boxQuantity || Number(l.boxQuantity) <= 0);
        if (hasInvalidItems) {
            ShowMessage(t('loadingFieldsRequired'), 'error');
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
            PaperProps={{ sx: { borderRadius: 3 } }}
        >
            {/* ── HEADER estilo Index ── */}
            <DialogTitle sx={{ p: 0 }}>
                <Paper
                    elevation={0}
                    sx={{
                        px: 2.5,
                        py: 2,
                        borderRadius: 0,
                        borderBottom: '1px solid',
                        borderColor: 'divider',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        gap: 2
                    }}
                >
                    {/* Izquierda: avatar + título + descripción */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Avatar sx={{
                            bgcolor: isExceeded ? 'error.main' : 'primary.light',
                            color: 'white',
                            width: 45,
                            height: 45,
                            borderRadius: 2,
                            transition: 'background-color 0.3s'
                        }}>
                            <ViewInArIcon />
                        </Avatar>
                        <Box>
                            <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
                                PALLET #{position}
                            </Typography>
                            <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                                {currentLabel?.description
                                    ? currentLabel.description
                                    : t('label')}
                            </Typography>
                        </Box>
                    </Box>

                    {/* Derecha: badge cajas + botón cerrar */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Chip
                            icon={isExceeded
                                ? <WarningAmberIcon sx={{ fontSize: 16 }} />
                                : <InventoryIcon sx={{ fontSize: 16 }} />
                            }
                            label={`${totalBoxes} / ${maxAllowed || '--'} ${t('maxBoxes')}`}
                            size="small"
                            color={isExceeded ? 'error' : totalBoxes > 0 ? 'primary' : 'default'}
                            variant={totalBoxes > 0 ? 'filled' : 'outlined'}
                            sx={{ fontWeight: 700, fontSize: '0.75rem' }}
                        />
                        <Tooltip title={t('close')}>
                            <IconButton onClick={onClose} size="small" sx={{ color: 'text.secondary' }}>
                                <CloseIcon />
                            </IconButton>
                        </Tooltip>
                    </Box>
                </Paper>
            </DialogTitle>

            {/* ── CONTENIDO ── */}
            <DialogContent>
                <Box sx={{ mt: 1 }}>
                    <Grid container spacing={2}>
                        {/* Temperatura */}
                        <Grid size={{ xs: 7 }}>
                            <TextField
                                fullWidth
                                label={t('temperatureF')}
                                type="number"
                                size="small"
                                value={palletData.temperatureF || ''}
                                onChange={(e) => setPalletData({ ...palletData, temperatureF: e.target.value })}
                            />
                        </Grid>

                        {/* Chismógrafo */}
                        <Grid size={{ xs: 5 }}>
                            <Paper
                                variant="outlined"
                                sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    height: '100%',
                                    borderRadius: 2,
                                    borderColor: palletData.chismografo ? 'primary.main' : 'divider',
                                    transition: 'border-color 0.3s'
                                }}
                            >
                                <FormControlLabel
                                    control={
                                        <Checkbox
                                            checked={palletData.chismografo || false}
                                            onChange={(e) => setPalletData({ ...palletData, chismografo: e.target.checked })}
                                            icon={<SensorsIcon />}
                                            checkedIcon={<SensorsIcon />}
                                            color="primary"
                                        />
                                    }
                                    label={
                                        <Typography
                                            variant="body2"
                                            sx={{
                                                color: palletData.chismografo ? 'primary.main' : 'text.secondary',
                                                fontWeight: palletData.chismografo ? 700 : 400
                                            }}
                                        >
                                            {t('chismografo')}
                                        </Typography>
                                    }
                                />
                            </Paper>
                        </Grid>

                        {/* Etiqueta */}
                        <Grid size={{ xs: 12 }}>
                            <Autocomplete
                                fullWidth
                                size="small"
                                options={Array.isArray(labels) ? labels : []}
                                getOptionLabel={(option) => option.description || ''}
                                isOptionEqualToValue={(option, value) => option.idLabel === value.idLabel}
                                value={labels.find(l => l.idLabel === palletData.idLabel) || null}
                                onChange={handleLabelChange}
                                disabled={isLabelSelectorDisabled}
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        label={`${t('label')} *`}
                                        error={submitted && !palletData.idLabel}
                                        helperText={
                                            submitted && !palletData.idLabel
                                                ? t('requiredField')
                                                : isLabelSelectorDisabled
                                                    ? t('clearLoadsToChangeLabel')
                                                    : ''
                                        }
                                    />
                                )}
                                renderOption={(props, option) => {
                                    const { key, ...optionProps } = props;
                                    return (
                                        <Box component="li" key={option.idLabel} {...optionProps} sx={{ display: 'flex', alignItems: 'center', px: 2, py: 1 }}>
                                            <Typography variant="body2">{option.description}</Typography>
                                            {option.isDeleted && (
                                                <Chip label={t('deleted')} size="small" variant="outlined" color="secondary" sx={{ ml: 1, height: 20, fontSize: '0.65rem' }} />
                                            )}
                                        </Box>
                                    );
                                }}
                            />
                        </Grid>
                    </Grid>

                    {/* ── CARGAS ── */}
                    <Box sx={{ mt: 3, mb: 1.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1 }}>
                            <InventoryIcon sx={{ fontSize: 18 }} />
                            {t('shipload')}
                            {isExceeded && <WarningAmberIcon sx={{ color: 'warning.main', fontSize: 18 }} />}
                        </Typography>
                        <Button
                            startIcon={<AddIcon />}
                            onClick={handleAddLoading}
                            variant="contained"
                            disableElevation
                            size="small"
                        >
                            {t('add')}
                        </Button>
                    </Box>

                    <Box sx={{ maxHeight: 380, overflowY: 'auto', pr: 0.5 }}>
                        {palletData.manifestPalletLoadings?.map((loading, index) => {
                            const selectedType = labelTypes.find(t_type => t_type.idLabelType === loading.idLabelType);
                            const rowInvalid = !loading.idLabelType || !loading.boxQuantity || Number(loading.boxQuantity) <= 0;
                            const showRowError = submitted && (rowInvalid || isExceeded);

                            return (
                                <Paper
                                    key={index}
                                    elevation={0}
                                    sx={{
                                        p: 2,
                                        mb: 2,
                                        borderRadius: 2,
                                        border: '1px solid',
                                        borderColor: showRowError ? 'error.main' : 'divider',
                                        transition: 'border-color 0.2s'
                                    }}
                                >
                                    <Grid container spacing={2}>
                                        {/* Tipo de etiqueta */}
                                        <Grid size={{ xs: 10.5 }}>
                                            <Autocomplete
                                                fullWidth
                                                size="small"
                                                options={labelTypes || []}
                                                getOptionLabel={(option) => option.description || ''}
                                                isOptionEqualToValue={(option, value) => option.idLabelType === value.idLabelType}
                                                value={selectedType || null}
                                                onChange={(_, newValue) => handleLabelTypeChange(index, newValue ? newValue.idLabelType : '')}
                                                disabled={!palletData.idLabel}
                                                renderInput={(params) => (
                                                    <TextField
                                                        {...params}
                                                        label={`${t('labelType')} *`}
                                                        variant="filled"
                                                        error={submitted && !loading.idLabelType}
                                                        helperText={submitted && !loading.idLabelType ? t('requiredField') : ''}
                                                        InputProps={{
                                                            ...params.InputProps,
                                                            startAdornment: selectedType ? (
                                                                <Chip label={selectedType.size} size="small" color="primary" sx={{ ml: 1, mr: 2, width: 50, height: 20, fontSize: '0.65rem' }} />
                                                            ) : null
                                                        }}
                                                    />
                                                )}
                                                renderOption={(props, option) => {
                                                    const { key, ...optionProps } = props;
                                                    return (
                                                        <Box component="li" key={option.idLabelType} {...optionProps} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 2, py: 1 }}>
                                                            <Chip label={option.size} size="small" variant="filled" color="primary" sx={{ height: 20, width: 50, fontSize: '0.65rem' }} />
                                                            <Typography variant="body2" sx={{ ml: 2 }}>{option.description}</Typography>
                                                        </Box>
                                                    );
                                                }}
                                            />
                                        </Grid>

                                        {/* Botón eliminar fila */}
                                        <Grid size={{ xs: 1.5 }} sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                                            <Tooltip title={t('delete')}>
                                                <IconButton
                                                    color="error"
                                                    size="small"
                                                    onClick={() => handleRemoveLoading(index)}
                                                    sx={{ bgcolor: 'error.main', color: 'white', '&:hover': { bgcolor: 'error.dark' }, p: 1 }}
                                                >
                                                    <DeleteIcon fontSize="small" />
                                                </IconButton>
                                            </Tooltip>
                                        </Grid>

                                        {/* Cajas */}
                                        <Grid size={{ xs: 4 }}>
                                            <TextField
                                                label={`${t('boxes')} *`}
                                                type="number"
                                                size="small"
                                                fullWidth
                                                value={loading.boxQuantity || ''}
                                                onChange={(e) => handleLoadingChange(index, 'boxQuantity', e.target.value)}
                                                error={submitted && (!loading.boxQuantity || Number(loading.boxQuantity) <= 0)}
                                                helperText={submitted && (!loading.boxQuantity || Number(loading.boxQuantity) <= 0) ? t('requiredField') : ''}
                                            />
                                        </Grid>

                                        {/* Descripción */}
                                        <Grid size={{ xs: 8 }}>
                                            <TextField
                                                label={t('description')}
                                                fullWidth
                                                size="small"
                                                value={loading.description || ''}
                                                onChange={(e) => handleLoadingChange(index, 'description', e.target.value)}
                                                inputProps={{ maxLength: 250 }}
                                            />
                                        </Grid>
                                    </Grid>
                                </Paper>
                            );
                        })}
                    </Box>
                </Box>
            </DialogContent>

            <Divider />

            {/* ── ACCIONES ── */}
            <DialogActions sx={{ p: 2.5, gap: 1 }}>
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
                <Button
                    color="error"
                    variant="outlined"
                    startIcon={<CloseIcon />}
                    onClick={onClose}
                >
                    {t('cancel')}
                </Button>
                <Button
                    onClick={handleSavePallet}
                    variant="contained"
                    disableElevation
                    startIcon={<SaveIcon />}
                >
                    {t('save')}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default PalletDetailModal;