import React, { useState, useEffect, useContext } from 'react';
import {
    Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button, Box,
    Typography, TableContainer, Table, TableHead, TableRow, TableCell, TableBody,
    IconButton, Paper, Chip
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
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
            } else {
                setFormData({ idLabel: 0, description: '', maxBoxQuantity: 0, labelTypes: [] });
            }
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

    const handleSubmit = async (event) => {
        if (event) event.preventDefault();
        if (!formData.description.trim() || formData.maxBoxQuantity <= 0) return;

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
            <Dialog open={open} onClose={handleClose} fullWidth maxWidth="md">
                <DialogTitle>{isEditing ? t('label_edit') : t('label_add')}</DialogTitle>
                <Box component="form" onSubmit={handleSubmit}>
                    <DialogContent>
                        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mb: 3 }}>
                            <TextField fullWidth label={t('description')} value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} inputProps={{ maxLength: 150 }} />
                            <TextField fullWidth label={t('label_maxBoxQuantity')} type="number" value={formData.maxBoxQuantity} onChange={(e) => setFormData({ ...formData, maxBoxQuantity: e.target.value })} />
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                            <Typography variant="h6">{t('labelTypes')}</Typography>
                            <Button variant="outlined" startIcon={<AddIcon />} onClick={() => { setSelectedLabelType(null); setIsLabelTypeEditing(false); setIsLabelTypeModalOpen(true); }}>{t('labelType_add')}</Button>
                        </Box>
                        <TableContainer component={Paper}>
                            <Table size="small">
                                <TableHead><TableRow><TableCell>{t('description')}</TableCell><TableCell align="right">{t('actions')}</TableCell></TableRow></TableHead>
                                <TableBody>
                                    {formData.labelTypes.map((lt, idx) => (
                                        <TableRow key={`${lt.description}-${idx}`}>
                                            <TableCell>
                                                <Typography variant="body2" sx={{ fontWeight: 'bold' }}>{lt.description}</Typography>
                                                <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', mt: 0.5 }}>
                                                    {lt.sizes.map(s => <Chip key={s} label={s} size="small" variant="outlined" color="primary" />)}
                                                </Box>
                                            </TableCell>
                                            <TableCell align="right">
                                                <IconButton onClick={() => { setSelectedLabelType(lt); setIsLabelTypeEditing(true); setIsLabelTypeModalOpen(true); }} color="primary"><EditIcon fontSize="small" /></IconButton>
                                                <IconButton onClick={() => setFormData(p => ({ ...p, labelTypes: p.labelTypes.filter(x => x.description !== lt.description) }))} color="error"><DeleteIcon fontSize="small" /></IconButton>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </DialogContent>
                    <DialogActions sx={{ p: 3 }}>
                        <Button onClick={handleClose} color="error">{t('cancel')}</Button>
                        <Button type="submit" variant="contained" disabled={isLoading}>{isEditing ? t('save') : t('add')}</Button>
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