import React, { useState, useEffect } from 'react';
import {
    Dialog, DialogTitle, DialogContent, DialogActions,
    Button, TextField, Grid, Typography, IconButton, Box, Divider,
    useTheme, useMediaQuery, AppBar, Toolbar
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import CloseIcon from '@mui/icons-material/Close'; // Importante para fullscreen
import { useTranslation } from 'react-i18next';

const PalletDetailModal = ({ open, onClose, onSave, initialData, onDelete, position }) => {
    const { t } = useTranslation();
    const [palletData, setPalletData] = useState(initialData || {});

    // --- LÓGICA DE DETECCIÓN DE PANTALLA ---
    const theme = useTheme();
    // 'sm' es ideal para modals fullscreen en celulares
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    useEffect(() => {
        setPalletData(initialData || {
            idManifestPallet: 0,
            position: position,
            temperatureF: '',
            temperatureC: '',
            comments: '',
            manifestPalletLoadings: []
        });
    }, [initialData, position, open]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setPalletData(prev => ({ ...prev, [name]: value }));
    };

    const handleAddLoading = () => {
        setPalletData(prev => ({
            ...prev,
            manifestPalletLoadings: [
                ...(prev.manifestPalletLoadings || []),
                { idManifestPalletLoading: 0, description: '', boxQuantity: '', idLabelType: 1 }
            ]
        }));
    };

    const handleLoadingChange = (index, field, value) => {
        const newLoadings = [...(palletData.manifestPalletLoadings || [])];
        newLoadings[index] = { ...newLoadings[index], [field]: value };
        setPalletData(prev => ({ ...prev, manifestPalletLoadings: newLoadings }));
    };

    const handleRemoveLoading = (index) => {
        const newLoadings = [...(palletData.manifestPalletLoadings || [])];
        newLoadings.splice(index, 1);
        setPalletData(prev => ({ ...prev, manifestPalletLoadings: newLoadings }));
    };

    const handleSave = () => {
        onSave(palletData);
        onClose();
    };

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="md"
            fullWidth
            // ACTIVAR PANTALLA COMPLETA EN MÓVIL
            fullScreen={isMobile}
        >
            {/* Si es FullScreen, a veces es mejor usar un AppBar personalizado */}
            {isMobile ? (
                <AppBar sx={{ position: 'relative' }}>
                    <Toolbar>
                        <IconButton edge="start" color="inherit" onClick={onClose} aria-label="close">
                            <CloseIcon />
                        </IconButton>
                        <Typography sx={{ ml: 2, flex: 1 }} variant="h6" component="div">
                            {t('Pos')} #{position}
                        </Typography>
                        <Button autoFocus color="inherit" onClick={handleSave}>
                            {t('Save')}
                        </Button>
                    </Toolbar>
                </AppBar>
            ) : (
                <DialogTitle>
                    {t('Edit Pallet Position')} #{position}
                </DialogTitle>
            )}

            <DialogContent dividers>
                <Grid container spacing={2}>
                    <Grid item xs={6}>
                        <TextField fullWidth label={t('Temperature F')} name="temperatureF" type="number" value={palletData.temperatureF || ''} onChange={handleChange} />
                    </Grid>
                    <Grid item xs={6}>
                        <TextField fullWidth label={t('Temperature C')} name="temperatureC" type="number" value={palletData.temperatureC || ''} onChange={handleChange} />
                    </Grid>
                    <Grid item xs={12}>
                        <TextField fullWidth label={t('Comments')} name="comments" multiline rows={2} value={palletData.comments || ''} onChange={handleChange} />
                    </Grid>
                </Grid>

                <Box sx={{ mt: 3, mb: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="h6">{t('Contents / Boxes')}</Typography>
                    <Button startIcon={<AddCircleIcon />} onClick={handleAddLoading} size="small" variant="outlined">
                        {isMobile ? t('Add') : t('Add Product')}
                    </Button>
                </Box>
                <Divider sx={{ mb: 2 }} />

                {palletData.manifestPalletLoadings && palletData.manifestPalletLoadings.map((loading, index) => (
                    <Grid container spacing={1} key={index} sx={{ mb: 2, alignItems: 'center' }}>
                        <Grid item xs={6} sm={7}>
                            <TextField
                                fullWidth size="small"
                                label={t('Description')}
                                value={loading.description || ''}
                                onChange={(e) => handleLoadingChange(index, 'description', e.target.value)}
                            />
                        </Grid>
                        <Grid item xs={4} sm={3}>
                            <TextField
                                fullWidth size="small"
                                label={t('Qty')}
                                type="number"
                                value={loading.boxQuantity || ''}
                                onChange={(e) => handleLoadingChange(index, 'boxQuantity', e.target.value)}
                            />
                        </Grid>
                        <Grid item xs={2} sm={2} sx={{ display: 'flex', justifyContent: 'center' }}>
                            <IconButton color="error" onClick={() => handleRemoveLoading(index)}>
                                <DeleteIcon />
                            </IconButton>
                        </Grid>
                    </Grid>
                ))}
            </DialogContent>

            {/* Si NO es mobile, mostramos los botones estándar abajo */}
            {!isMobile && (
                <DialogActions>
                    {onDelete && (
                        <Button onClick={() => { onDelete(position); onClose(); }} color="error">
                            {t('Delete Pallet')}
                        </Button>
                    )}
                    <Button onClick={onClose}>{t('Cancel')}</Button>
                    <Button onClick={handleSave} variant="contained" color="primary">
                        {t('Save Pallet')}
                    </Button>
                </DialogActions>
            )}
            {/* Si ES mobile y queremos botón de borrar, podemos agregarlo al final del content o en otro lugar */}
            {isMobile && onDelete && (
                <Box sx={{ p: 2, display: 'flex', justifyContent: 'center' }}>
                    <Button variant="outlined" color="error" fullWidth onClick={() => { onDelete(position); onClose(); }}>
                        {t('Delete Pallet')}
                    </Button>
                </Box>
            )}
        </Dialog>
    );
};

export default PalletDetailModal;