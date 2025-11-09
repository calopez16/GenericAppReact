import React, { useState, useEffect, useRef } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Button,
    Box,
} from '@mui/material';
import CancelIcon from '@mui/icons-material/Clear';
import SaveIcon from '@mui/icons-material/Save';
import AddIcon from '@mui/icons-material/Add';

import { DataAPIDriversService } from '@data/Drivers/Data';
import { useTranslation } from 'react-i18next';
import { ShowMessage } from '@helpers/NotificationService';

const DriverFormModal = ({ open, handleClose, data, isEditing, setData }) => {
    const { t } = useTranslation();
    const dataService = DataAPIDriversService();

    const nameRef = useRef(null);

    const [formData, setFormData] = useState({
        idDriver: 0,
        name: '',
    });

    const [isLoading, setIsLoading] = useState(false);

    const [validationErrors, setValidationErrors] = useState({
        name: false,
    });
    const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState(false);

    useEffect(() => {
        if (open) {
            if (isEditing && data) {
                setFormData({
                    idDriver: data.idDriver || 0,
                    name: data.name || ''
                });

            } else if (!isEditing) {
                setFormData({
                    idDriver: 0,
                    name: ''
                });
            }
            setValidationErrors({ name: false });
            setHasAttemptedSubmit(false);
        }
    }, [open, isEditing, data]);

    useEffect(() => {
        if (open) {
            setTimeout(() => {
                nameRef.current.focus();
            }, 100);
        }
    }, [open]);


    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));

        if (hasAttemptedSubmit && name === 'name') {
            setValidationErrors(prev => ({
                ...prev,
                name: value.trim().length === 0
            }));
        }
    };

    const validateForm = () => {
        const errors = {
            name: !formData.name.trim(),
        };

        setValidationErrors(errors);

        return !errors.name;
    };


    const handleSubmit = async (event) => {
        if (event) event.preventDefault();

        setHasAttemptedSubmit(true);

        if (!validateForm()) {
            ShowMessage(t('FillRequiredFields') || 'Por favor, rellene todos los campos obligatorios.', 'warning');
            return;
        }

        try {
            setIsLoading(true);

            const driverPayload = {
                idDriver: formData.idDriver || 0,
                name: formData.name,
            };

            let response;
            let messageKey;
            if (isEditing) {
                response = await dataService.editData(driverPayload, true);
                messageKey = 'recordEditedSuccessPlural';
            } else {
                response = await dataService.addData(driverPayload, true);
                messageKey = 'recordAddedSuccessPlural';
            }

            if (response.responseCode === 409) {
                ShowMessage(t('daraAlreadyExists') + ": " + response.conflict, 'warning');
                return;
            }

            if (response.success) {
                const newOrUpdatedDriver = {
                    ...driverPayload,
                    isActive: response.data.isActive,
                    idCompany: response.data.idCompany,
                    isDeleted: response.data.isDeleted,
                    idDriver: response.data.idDriver
                };

                if (isEditing) {
                    setData(prevData =>
                        prevData.map(driver =>
                            driver.idDriver === driverPayload.idDriver ? newOrUpdatedDriver : driver
                        )
                    );
                } else {
                    // Lógica original: Añadir al final del listado
                    setData(prevData => [...prevData, newOrUpdatedDriver]);
                }
            }

            handleClose();
            ShowMessage(t(messageKey), 'success');
        } catch (error) {
            ShowMessage(t('error'), 'error');
            console.error("Error saving driver:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const requiredErrorText = t('ThisFieldIsRequired') || 'Este campo es obligatorio.';

    return (
        <>
            <Dialog open={open} onClose={handleClose} fullWidth maxWidth="md">
                <DialogTitle>
                    {isEditing ? t('editDriver') : t('addDriver')}
                </DialogTitle>
                <Box component="form" onSubmit={handleSubmit} noValidate>
                    <DialogContent>
                        <Box
                            sx={{
                                mt: 2,
                                display: 'grid',
                                gridTemplateColumns: {
                                    xs: '1fr',
                                    sm: 'repeat(auto-fit, minmax(300px, 1fr))'
                                },
                                gap: 2
                            }}
                        >

                            <TextField
                                margin="normal"
                                required
                                fullWidth
                                label={t('driverName') || t('name')}
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                inputRef={nameRef}
                                sx={{ gridColumn: { xs: 'span 1', sm: 'span 2' } }}
                                error={validationErrors.name}
                                helperText={validationErrors.name ? requiredErrorText : ''}
                            />

                        </Box>
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
        </>
    );
};

export default DriverFormModal;