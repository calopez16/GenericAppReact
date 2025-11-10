import React, { useState, useEffect, useRef } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Button,
    Box,
    Typography,
    TableContainer,
    Table,
    TableHead,
    TableRow,
    TableCell,
    TableBody,
    IconButton,
    Paper,
} from '@mui/material';
import CancelIcon from '@mui/icons-material/Clear';
import SaveIcon from '@mui/icons-material/Save';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { DataAPILabelsService } from '@data/Labels/Data';
import { useTranslation } from 'react-i18next';
import { ShowMessage } from '@helpers/NotificationService';
import LabelTypeModal from '@views/Labels/LabelTypeModal';

const LabelFormModal = ({ open, handleClose, data, isEditing, setData }) => {
    const { t } = useTranslation();
    const dataService = DataAPILabelsService();
    const descriptionRef = useRef(null);
    const [formData, setFormData] = useState({
        idLabel: 0,
        description: '',
        labelTypes: [],
    });

    const [isLoading, setIsLoading] = useState(false);

    const [validationErrors, setValidationErrors] = useState({
        description: false,
    });
    const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState(false);

    const [isLabelTypeModalOpen, setIsLabelTypeModalOpen] = useState(false);
    const [selectedLabelType, setSelectedLabelType] = useState(null);
    const [isLabelTypeEditing, setIsLabelTypeEditing] = useState(false);

    useEffect(() => {
        if (open) {
            if (isEditing && data) {
                setFormData({
                    idLabel: data.idLabel || 0,
                    description: data.description || '',
                    labelTypes: data.labelTypes || [],
                });
            } else {
                setFormData({
                    idLabel: 0,
                    description: '',
                    labelTypes: [],
                });
            }
            setValidationErrors({ description: false });
            setHasAttemptedSubmit(false);
        }
    }, [open, isEditing, data]);

    useEffect(() => {
        if (open && descriptionRef.current) {
            setTimeout(() => {
                descriptionRef.current.focus();
            }, 100);
        }
    }, [open]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));

        if (hasAttemptedSubmit && name === 'description') {
            setValidationErrors(prev => ({
                ...prev,
                description: value.trim().length === 0
            }));
        }
    };

    const validateForm = () => {
        const errors = {
            description: !formData.description.trim(),
        };

        setValidationErrors(errors);

        return !errors.description;
    };

    const handleSubmit = async (event) => {
        if (event) event.preventDefault();

        setHasAttemptedSubmit(true);

        if (!validateForm()) {
            ShowMessage(t('emptyFields'), 'warning');
            return;
        }

        try {
            setIsLoading(true);

            const labelPayload = {
                idLabel: formData.idLabel || 0,
                description: formData.description,
                labelTypes: formData.labelTypes.map(lt => ({
                    ...lt,
                    idLabelType: lt.idLabelType > 0 ? lt.idLabelType : 0,
                    idLabel: formData.idLabel || 0, // En edición, se pasa el IdLabel
                    isActive: lt.isActive === undefined ? true : lt.isActive,
                })),
            };

            let response;
            let messageKey;
            if (isEditing) {
                response = await dataService.editData(labelPayload, true);
                messageKey = 'recordEditedSuccessPlural';
            } else {
                response = await dataService.addData(labelPayload, true);
                messageKey = 'recordAddedSuccessPlural';
            }

            if (response.responseCode === 409) {
                ShowMessage(t('dataAlreadyExists') + ": " + response.conflict, 'warning');
                return;
            }

            if (response.success) {
                const updatedLabel = {
                    ...labelPayload,
                    idLabel: response.data.idLabel,
                    isActive: response.data.isActive,
                    labelTypes: response.data.labelTypes
                };

                if (isEditing) {
                    setData(prevData =>
                        prevData.map(label =>
                            label.idLabel === labelPayload.idLabel ? updatedLabel : label
                        )
                    );
                } else {
                    setData(prevData => [...prevData, updatedLabel]);
                }
            }

            handleClose();
            ShowMessage(t(messageKey), 'success');
        } catch (error) {
            ShowMessage(t('error'), 'error');
            console.error("Error saving label:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleOpenAddLabelType = () => {
        setSelectedLabelType(null);
        setIsLabelTypeEditing(false);
        setIsLabelTypeModalOpen(true);
    };

    const handleOpenEditLabelType = (labelType) => {
        setSelectedLabelType(labelType);
        setIsLabelTypeEditing(true);
        setIsLabelTypeModalOpen(true);
    };

    const handleRemoveLabelType = (idLabelType) => {
        setFormData(prev => ({
            ...prev,
            labelTypes: prev.labelTypes.filter(lt => lt.idLabelType !== idLabelType)
        }));
    };

    const handleSaveLabelType = (newLabelTypeData, isEditingType) => {
        setFormData(prev => {
            if (isEditingType) {
                return {
                    ...prev,
                    labelTypes: prev.labelTypes.map(lt =>
                        lt.idLabelType === newLabelTypeData.idLabelType ? { ...lt, ...newLabelTypeData } : lt
                    )
                };
            } else {
                return {
                    ...prev,
                    labelTypes: [...prev.labelTypes, { ...newLabelTypeData, isActive: true, idLabel: prev.idLabel || 0 }]
                };
            }
        });
    };

    return (
        <>
            <Dialog open={open} onClose={handleClose} fullWidth maxWidth="md">
                <DialogTitle>
                    {isEditing ? t('label_edit') : t('label_add')}
                </DialogTitle>
                <Box component="form" onSubmit={handleSubmit} noValidate>
                    <DialogContent>
                        <Box
                            sx={{
                                mt: 2,
                                display: 'grid',
                                gridTemplateColumns: '1fr',
                                gap: 2,
                                mb: 3
                            }}
                        >
                            <TextField
                                margin="normal"
                                required
                                fullWidth
                                label={t('description')}
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                inputRef={descriptionRef}
                                error={validationErrors.description}
                                helperText={validationErrors.description ? t('requiredField') : ''}
                            />
                        </Box>

                        <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>
                            {t('labelTypes')}
                        </Typography>
                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 1 }}>
                            <Button
                                variant="outlined"
                                startIcon={<AddIcon />}
                                onClick={handleOpenAddLabelType}
                                size="small"
                            >
                                {t('labelType_add')}
                            </Button>
                        </Box>

                        <TableContainer component={Paper}>
                            <Table size="small">
                                <TableHead>
                                    <TableRow>
                                        <TableCell>{t('description')}</TableCell>
                                        <TableCell align="center">{t('labelType_maxBoxQuantity')}</TableCell>
                                        <TableCell align="right">{t('actions')}</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {(formData.labelTypes?.length ?? 0) === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={4} align="center">
                                                {t('labelTypes_noRecords')}
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        formData.labelTypes.map((lt) => (
                                            <TableRow key={lt.idLabelType}>
                                                <TableCell>{lt.description}</TableCell>
                                                <TableCell align="center">{lt.maxBoxQuantity}</TableCell>
                                                <TableCell align="right">
                                                    <IconButton size="small" color="primary" onClick={() => handleOpenEditLabelType(lt)}>
                                                        <EditIcon fontSize="inherit" />
                                                    </IconButton>
                                                    <IconButton size="small" color="error" onClick={() => handleRemoveLabelType(lt.idLabelType)}>
                                                        <DeleteIcon fontSize="inherit" />
                                                    </IconButton>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </DialogContent>
                    <DialogActions
                        sx={{
                            flexDirection: { xs: 'column', sm: 'row' },
                            justifyContent: 'flex-end',
                            p: 3
                        }}
                    >
                        <Box
                            sx={{
                                width: { xs: '100%', sm: 'auto' },
                                display: 'flex',
                                justifyContent: { xs: 'space-between', sm: 'flex-end' },
                            }}
                        >
                            <Button
                                type="button"
                                color="error"
                                variant="outlined"
                                endIcon={<CancelIcon />}
                                onClick={handleClose}
                                sx={{ mr: { xs: 0, sm: 1 } }}
                            >
                                {t('cancel')}
                            </Button>
                            <Button
                                type="submit"
                                color="primary"
                                variant="contained"
                                endIcon={isEditing ? <SaveIcon /> : <AddIcon />}
                                disabled={isLoading}
                            >
                                {(isEditing ? t('save') : t('add'))}
                            </Button>
                        </Box>
                    </DialogActions>
                </Box>
            </Dialog>

            <LabelTypeModal
                open={isLabelTypeModalOpen}
                handleClose={() => setIsLabelTypeModalOpen(false)}
                data={selectedLabelType}
                isEditing={isLabelTypeEditing}
                onSave={handleSaveLabelType}
            />
        </>
    );
};

export default LabelFormModal;