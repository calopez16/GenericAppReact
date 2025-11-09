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
import LabelTypeModal from './LabelTypeModal'; // Nuevo modal importado

const LabelFormModal = ({ open, handleClose, data, isEditing, setData }) => {
    const { t } = useTranslation();
    // CAMBIO: Servicio para Labels
    const dataService = DataAPILabelsService();

    const descriptionRef = useRef(null);

    const [formData, setFormData] = useState({
        idLabel: 0,
        description: '', // CAMBIO: Usamos 'description'
        labelTypes: [],  // NUEVO: Lista de LabelTypes
    });

    const [isLoading, setIsLoading] = useState(false);

    const [validationErrors, setValidationErrors] = useState({
        description: false,
    });
    const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState(false);

    // ESTADOS PARA GESTIÓN DE LABEL TYPES
    const [isLabelTypeModalOpen, setIsLabelTypeModalOpen] = useState(false);
    const [selectedLabelType, setSelectedLabelType] = useState(null);
    const [isLabelTypeEditing, setIsLabelTypeEditing] = useState(false);

    // --- Lógica de Inicialización ---
    useEffect(() => {
        if (open) {
            if (isEditing && data) {
                setFormData({
                    idLabel: data.idLabel || 0,
                    description: data.description || '',
                    labelTypes: data.labelTypes || [], // Inicializa con datos existentes
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

    // --- Manejo de Cambios del Formulario Principal ---
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

    // --- Validación del Formulario Principal ---
    const validateForm = () => {
        const errors = {
            description: !formData.description.trim(),
        };

        setValidationErrors(errors);

        return !errors.description;
    };

    // --- Envío del Formulario Principal ---
    const handleSubmit = async (event) => {
        if (event) event.preventDefault();

        setHasAttemptedSubmit(true);

        if (!validateForm()) {
            ShowMessage(t('FillRequiredFields') || 'Por favor, rellene todos los campos obligatorios.', 'warning');
            return;
        }

        try {
            setIsLoading(true);

            // Ajuste del payload
            const labelPayload = {
                idLabel: formData.idLabel || 0,
                description: formData.description,
                // Asegurar que LabelTypes está en el payload
                labelTypes: formData.labelTypes.map(lt => ({
                    ...lt,
                    // Si es nuevo (idLabelType negativo), se envía como 0
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
                ShowMessage(t('daraAlreadyExists') + ": " + response.conflict, 'warning');
                return;
            }

            if (response.success) {
                const updatedLabel = {
                    ...labelPayload,
                    idLabel: response.data.idLabel, // ID real si es nuevo
                    isActive: response.data.isActive,
                    labelTypes: response.data.labelTypes // Recibir la data fresca del backend
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

    // --- Gestión de LabelTypes ---

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
                // Editar existente
                return {
                    ...prev,
                    labelTypes: prev.labelTypes.map(lt =>
                        lt.idLabelType === newLabelTypeData.idLabelType ? { ...lt, ...newLabelTypeData } : lt
                    )
                };
            } else {
                // Agregar nuevo
                return {
                    ...prev,
                    labelTypes: [...prev.labelTypes, { ...newLabelTypeData, isActive: true, idLabel: prev.idLabel || 0 }]
                };
            }
        });
    };

    const requiredErrorText = t('ThisFieldIsRequired') || 'Este campo es obligatorio.';

    return (
        <>
            <Dialog open={open} onClose={handleClose} fullWidth maxWidth="md">
                <DialogTitle>
                    {isEditing ? t('editLabel') : t('addLabel')}
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
                                helperText={validationErrors.description ? requiredErrorText : ''}
                            />
                        </Box>

                        <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>
                            {t('LabelTypes')}
                        </Typography>
                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 1 }}>
                            <Button
                                variant="outlined"
                                startIcon={<AddIcon />}
                                onClick={handleOpenAddLabelType}
                                size="small"
                            >
                                {t('addLabelType')}
                            </Button>
                        </Box>

                        <TableContainer component={Paper}>
                            <Table size="small">
                                <TableHead>
                                    <TableRow>
                                        <TableCell>{t('description')}</TableCell>
                                        <TableCell align="center">{t('maxBoxQuantity')}</TableCell>
                                        <TableCell align="center">{t('active')}</TableCell>
                                        <TableCell align="right">{t('actions')}</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {(formData.labelTypes?.length ?? 0) === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={4} align="center">
                                                {t('noLabelTypes')}
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        formData.labelTypes.map((lt) => (
                                            <TableRow key={lt.idLabelType}>
                                                <TableCell>{lt.description}</TableCell>
                                                <TableCell align="center">{lt.maxBoxQuantity}</TableCell>
                                                <TableCell align="center">{lt.isActive ? t('yes') : t('no')}</TableCell>
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
                                {(t('cancel') || 'Cancelar')}
                            </Button>
                            <Button
                                type="submit"
                                color="primary"
                                variant="contained"
                                endIcon={isEditing ? <SaveIcon /> : <AddIcon />}
                                disabled={isLoading}
                            >
                                {(isEditing ? (t('save') || 'Guardar') : (t('add') || 'Agregar'))}
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