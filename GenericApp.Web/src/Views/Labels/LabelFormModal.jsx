import React, { useState, useEffect, useContext } from 'react';
import {
    Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button, Box,
    Typography, TableContainer, Table, TableHead, TableRow, TableCell, TableBody,
    IconButton, Paper, Chip, Avatar, Divider, Tooltip, CircularProgress
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SaveIcon from '@mui/icons-material/Save';
import CloseIcon from '@mui/icons-material/Close';
import CancelIcon from '@mui/icons-material/Clear';
import LabelIcon from '@mui/icons-material/Label';
import { DataAPILabelsService } from '@data/Labels/Data';
import { useTranslation } from 'react-i18next';
import { ShowMessage } from '@helpers/NotificationService';
import LabelTypeModal from '@views/Labels/LabelTypeModal';
import { AppContext } from '@helpers/AppContext';

const LabelFormModal = ({ open, handleClose, data, isEditing, setData }) => {
    const { t } = useTranslation();
    const dataService = DataAPILabelsService();
    const { companySelected } = useContext(AppContext);

    const [formData, setFormData] = useState({ idLabel: 0, description: '', maxBoxQuantity: 120, labelTypes: [] });
    const [isLoading, setIsLoading] = useState(false);
    const [validationErrors, setValidationErrors] = useState({ description: false, maxBoxQuantity: false });
    const [showErrors, setShowErrors] = useState(false);
    const [isLabelTypeModalOpen, setIsLabelTypeModalOpen] = useState(false);
    const [selectedLabelType, setSelectedLabelType] = useState(null);
    const [isLabelTypeEditing, setIsLabelTypeEditing] = useState(false);
    const [availableLabelTypes, setAvailableLabelTypes] = useState([]); // Estado para los tipos del API

    const groupLabelTypes = (flatList) => {
        if (!flatList || !Array.isArray(flatList)) return [];
        return flatList.reduce((acc, current) => {
            const existing = acc.find(item => item.description.trim().toLowerCase() === current.description.trim().toLowerCase());
            if (existing) {
                if (current.size && !existing.sizes.includes(current.size)) existing.sizes.push(current.size);
            } else {
                acc.push({ ...current, sizes: current.size ? [current.size] : (current.sizes || []) });
            }
            return acc;
        }, []);
    };

    const fetchLabelTypes = async () => {
        try {
            // Asumiendo que dataService tiene este método o ajustándolo al que proporcionaste
            const response = await dataService.getActiveLabelTypes();
            if (response.success) {
                // Guardamos los datos originales del API
                setAvailableLabelTypes(response.data.data || response.data || []);
            }
        } catch (error) {
            console.error("Error fetching label types", error);
        }
    };

    useEffect(() => {
        if (open) {
            fetchLabelTypes();
            if (isEditing && data) {
                setFormData({
                    idLabel: data.idLabel,
                    description: data.description,
                    maxBoxQuantity: data.maxBoxQuantity,
                    labelTypes: groupLabelTypes(data.labelTypes),
                });
                setValidationErrors({ description: false, maxBoxQuantity: false });
            } else {
                setFormData({ idLabel: 0, description: '', maxBoxQuantity: 0, labelTypes: [] });
                setValidationErrors({ description: true, maxBoxQuantity: true });
            }
            setShowErrors(false);
        }
    }, [open, isEditing, data]);

    const handleSaveLabelType = (flatDataFromModal, isEditingType) => {
        const grouped = groupLabelTypes(flatDataFromModal)[0];
        if (!grouped) return;
        setFormData(prev => {
            const newList = isEditingType
                ? prev.labelTypes.map(lt => lt.description === selectedLabelType.description ? grouped : lt)
                : [...prev.labelTypes, grouped];
            return { ...prev, labelTypes: newList };
        });
    };

    const validateForm = () => {
        const errors = {
            description: !formData.description.trim(),
            maxBoxQuantity: !formData.maxBoxQuantity || Number(formData.maxBoxQuantity) <= 0,
        };
        setValidationErrors(errors);
        return !errors.description && !errors.maxBoxQuantity;
    };

    const handleFieldChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        setValidationErrors(prev => ({
            ...prev,
            [field]: field === 'description' ? !value.trim() : !value || Number(value) <= 0,
        }));
    };

    const handleSubmit = async (event) => {
        if (event) event.preventDefault();
        setShowErrors(true);
        if (!validateForm()) {
            ShowMessage(t('emptyFields'), 'warning');
            return;
        }

        try {
            setIsLoading(true);

            // Preparamos el payload para el API (Array de sizes por descripción)
            const payload = {
                ...formData,
                idCompany: companySelected.idCompany,
                labelTypes: formData.labelTypes.map(lt => ({
                    idLabelType: lt.idLabelType > 0 ? lt.idLabelType : 0,
                    description: lt.description,
                    sizes: lt.sizes,
                    isActive: true
                }))
            };

            const response = isEditing
                ? await dataService.editData(payload, true)
                : await dataService.addData(payload, true);

            if (response.responseCode == 409) {
                ShowMessage(t('dataAlreadyExists') + ": " + response.conflict, 'warning');
                return;
            }

            if (response.success) {
                const flatLabelTypesForState = [];
                formData.labelTypes.forEach(group => {
                    group.sizes.forEach(s => {
                        flatLabelTypesForState.push({
                            idLabelType: group.idLabelType > 0 ? group.idLabelType : 0,
                            description: group.description,
                            size: s,
                            isActive: true,
                            idLabel: isEditing ? formData.idLabel : response.data.idLabel
                        });
                    });
                });

                const updatedLabelForState = {
                    ...formData,
                    idLabel: isEditing ? formData.idLabel : response.data.idLabel,
                    labelTypes: flatLabelTypesForState,
                    isActive: isEditing ? (data?.isActive ?? true) : true
                };

                setData(prev => isEditing
                    ? prev.map(l => l.idLabel === updatedLabelForState.idLabel ? updatedLabelForState : l)
                    : [...prev, updatedLabelForState]
                );

                handleClose();
                ShowMessage(t(isEditing ? 'recordEditedSuccessPlural' : 'recordAddedSuccessPlural'), 'success');
            } else {
                ShowMessage(t('error'), 'error');
            }
        } catch (error) {
            ShowMessage(t('error'), 'error');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            <Dialog open={open} onClose={handleClose} fullWidth maxWidth="md" PaperProps={{ sx: { borderRadius: 3 } }}>
                <Box component="form" onSubmit={handleSubmit} noValidate>
                    <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', py: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Avatar sx={{ bgcolor: 'primary.light', color: 'white', width: 42, height: 42, borderRadius: 2 }}>
                                {isEditing ? <EditIcon /> : <LabelIcon />}
                            </Avatar>
                            <Box>
                                <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
                                    {isEditing ? t('label_edit') : t('label_add')}
                                </Typography>
                            </Box>
                        </Box>
                        <Tooltip title={t('close')}>
                            <IconButton onClick={handleClose} size="small" sx={{ color: 'text.secondary' }}>
                                <CloseIcon />
                            </IconButton>
                        </Tooltip>
                    </DialogTitle>

                    <Divider />

                    <DialogContent>
                        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mb: 3, mt: 1 }}>
                            <TextField
                                fullWidth
                                required
                                label={t('description')}
                                value={formData.description}
                                onChange={(e) => handleFieldChange('description', e.target.value)}
                                inputProps={{ maxLength: 150 }}
                                error={showErrors && validationErrors.description}
                                helperText={showErrors && validationErrors.description ? t('requiredField') : ''}
                            />
                            <TextField
                                fullWidth
                                required
                                label={t('label_maxBoxQuantity')}
                                type="number"
                                value={formData.maxBoxQuantity}
                                onChange={(e) => handleFieldChange('maxBoxQuantity', e.target.value)}
                                error={showErrors && validationErrors.maxBoxQuantity}
                                helperText={showErrors && validationErrors.maxBoxQuantity ? t('requiredField') : ''}
                            />
                        </Box>

                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                            <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>{t('labelTypes')}</Typography>
                            <Button
                                variant="outlined"
                                disableElevation
                                startIcon={<AddIcon />}
                                onClick={() => { setSelectedLabelType(null); setIsLabelTypeEditing(false); setIsLabelTypeModalOpen(true); }}
                            >
                                {t('labelType_add')}
                            </Button>
                        </Box>

                        <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
                            <Table size="small">
                                <TableHead sx={{ bgcolor: 'action.hover' }}>
                                    <TableRow>
                                        <TableCell sx={{ fontWeight: 'bold' }}>{t('description')}</TableCell>
                                        <TableCell align="right" sx={{ fontWeight: 'bold' }}>{t('actions')}</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {formData.labelTypes.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={2} align="center" sx={{ py: 3, color: 'text.secondary' }}>
                                                {t('records_notFound')}
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        formData.labelTypes.map((lt, idx) => (
                                            <TableRow key={`${lt.description}-${idx}`} hover>
                                                <TableCell>
                                                    <Typography variant="body2" sx={{ fontWeight: 'bold' }}>{lt.description}</Typography>
                                                    <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', mt: 0.5 }}>
                                                        {lt.sizes.map(s => <Chip key={s} label={s} size="small" variant="outlined" color="primary" />)}
                                                    </Box>
                                                </TableCell>
                                                <TableCell align="right">
                                                    <Tooltip title={t('edit')}>
                                                        <IconButton
                                                            onClick={() => { setSelectedLabelType(lt); setIsLabelTypeEditing(true); setIsLabelTypeModalOpen(true); }}
                                                            sx={{ color: 'white', bgcolor: 'primary.main', '&:hover': { bgcolor: 'primary.dark' }, p: 0.75, mr: 0.5 }}
                                                        >
                                                            <EditIcon fontSize="small" />
                                                        </IconButton>
                                                    </Tooltip>
                                                    <Tooltip title={t('delete')}>
                                                        <IconButton
                                                            onClick={() => setFormData(p => ({ ...p, labelTypes: p.labelTypes.filter(x => x.description !== lt.description) }))}
                                                            sx={{ color: 'white', bgcolor: 'error.main', '&:hover': { bgcolor: 'error.dark' }, p: 0.75 }}
                                                        >
                                                            <DeleteIcon fontSize="small" />
                                                        </IconButton>
                                                    </Tooltip>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </DialogContent>

                    <Divider />

                    <DialogActions sx={{ p: 2.5 }}>
                        <Button
                            onClick={handleClose}
                            color="error"
                            variant="outlined"
                            endIcon={<CancelIcon />}
                        >
                            {t('cancel')}
                        </Button>
                        <Button
                            type="submit"
                            variant="contained"
                            disableElevation
                            disabled={isLoading}
                            endIcon={isLoading
                                ? <CircularProgress size={18} color="inherit" />
                                : isEditing ? <SaveIcon /> : <AddIcon />
                            }
                        >
                            {isEditing ? t('save') : t('add')}
                        </Button>
                    </DialogActions>
                </Box>
            </Dialog>
            <LabelTypeModal
                open={isLabelTypeModalOpen}
                handleClose={() => setIsLabelTypeModalOpen(false)}
                data={selectedLabelType}
                isEditing={isLabelTypeEditing}
                onSave={handleSaveLabelType}
                availableOptions={availableLabelTypes}
            />
        </>
    );
};

export default LabelFormModal;