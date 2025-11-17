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
        maxBoxQuantity: 120, // ¡NUEVO CAMPO!
        labelTypes: [],
    });

    const [isLoading, setIsLoading] = useState(false);

    const [validationErrors, setValidationErrors] = useState({
        description: false,
        maxBoxQuantity: false, // ¡NUEVO CAMPO DE VALIDACIÓN!
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
                    maxBoxQuantity: data.maxBoxQuantity || 120, // Carga el valor
                    labelTypes: data.labelTypes || [],
                });
            } else {
                setFormData({
                    idLabel: 0,
                    description: '',
                    maxBoxQuantity: 0, // Valor inicial
                    labelTypes: [],
                });
            }
            setValidationErrors({ description: false, maxBoxQuantity: false });
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

        let processedValue = value;
        if (name === 'maxBoxQuantity') {
            // Asegura que sea un número y no negativo. Usa parseFloat para decimal.
            processedValue = parseFloat(value) || 0;
            if (processedValue < 0) processedValue = 0;
        }


        setFormData(prev => ({
            ...prev,
            [name]: processedValue
        }));

        if (hasAttemptedSubmit) {
            // Solo valida inmediatamente el campo afectado
            const isError = name === 'description' ? value.trim().length === 0 : name === 'maxBoxQuantity' ? parseFloat(value) <= 0 : false;
            setValidationErrors(prev => ({
                ...prev,
                [name]: isError
            }));
        }
    };

    const validateForm = () => {
        const errors = {
            description: !formData.description.trim(),
            maxBoxQuantity: formData.maxBoxQuantity <= 0, // Debe ser > 0
        };

        setValidationErrors(errors);

        return !errors.description && !errors.maxBoxQuantity;
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
                maxBoxQuantity: formData.maxBoxQuantity, // ¡NUEVO CAMPO EN EL PAYLOAD!
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
                    labelTypes: response.data.labelTypes,
                    maxBoxQuantity: response.data.maxBoxQuantity, // Asegura que se actualice con el valor de retorno
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
                                gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, // Cambio para tener 2 columnas
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
                                sx={{ gridColumn: { xs: 'span 1', sm: 'span 1' } }}
                            />
                            <TextField
                                margin="normal"
                                required
                                fullWidth
                                label={t('label_maxBoxQuantity')} // Cambiar key de traducción
                                name="maxBoxQuantity"
                                type="number"
                                value={formData.maxBoxQuantity}
                                onChange={handleChange}
                                inputProps={{ min: 0, step: "0.01" }} // Permite decimales
                                error={validationErrors.maxBoxQuantity}
                                helperText={validationErrors.maxBoxQuantity ? t('requiredField_greaterThanZero') : ''} // Nueva traducción
                                sx={{ gridColumn: { xs: 'span 1', sm: 'span 1' } }}
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
                                        <TableCell align="right">{t('actions')}</TableCell> {/* Quitar la columna MaxBoxQuantity */}
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {(formData.labelTypes?.length ?? 0) === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={2} align="center"> {/* ColSpan ajustado a 2 */}
                                                {t('labelTypes_noRecords')}
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        formData.labelTypes.map((lt) => (
                                            <TableRow key={lt.idLabelType > 0 ? lt.idLabelType : lt.idLabelType * -1}> {/* Ajuste en la key para nuevos registros */}
                                                <TableCell>{lt.description}</TableCell>
                                                <TableCell align="right">
                                                    <IconButton size="small" color="primary" onClick={() => handleOpenEditLabelType(lt)}>
                                                        <EditIcon fontSize="inherit" />
                                                    </IconButton>
                                                    <IconButton size="small" color="error" onClick={() => handleRemoveLabelType(lt.idLabelType > 0 ? lt.idLabelType : lt.idLabelType)}> {/* Ajuste para eliminar nuevos registros */}
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