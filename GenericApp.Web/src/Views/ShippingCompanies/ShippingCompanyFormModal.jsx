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

import { DataAPIShippingCompaniesService } from '@data/ShippingCompanies/Data';
import { useTranslation } from 'react-i18next';
import { ShowMessage } from '@helpers/NotificationService';

const ShippingCompanyFormModal = ({ open, handleClose, data, isEditing, setData }) => {
    const { t } = useTranslation();
    const dataService = DataAPIShippingCompaniesService();

    const nameRef = useRef(null);

    const [formData, setFormData] = useState({
        idShippingCompany: 0,
        name: ''
    });

    const [isLoading, setIsLoading] = useState(false);


    const [validationErrors, setValidationErrors] = useState({
        name: false
    });
    const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState(false);

    useEffect(() => {
        if (open) {
            if (isEditing && data) {
                setFormData({
                    idShippingCompany: data.idShippingCompany || 0,
                    name: data.name || ''
                });

            } else if (!isEditing) {
                setFormData({
                    idShippingCompany: 0,
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
            name: !formData.name.trim()
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

            const shippingCompanyPayload = {
                idShippingCompany: formData.idShippingCompany || 0,
                name: formData.name
            };

            let response;
            let messageKey;
            if (isEditing) {
                response = await dataService.editData(shippingCompanyPayload, true);
                messageKey = 'recordEditedSuccessPlural';
            } else {
                response = await dataService.addData(shippingCompanyPayload, true);
                messageKey = 'recordAddedSuccessPlural';
            }

            if (response.responseCode === 409) {
                ShowMessage(t('daraAlreadyExists') + ": " + response.conflict, 'warning');
                return;
            }

            if (response.success) {
                const updatedShippingCompany = { ...shippingCompanyPayload, isActive: response.data.isActive };

                if (isEditing) {
                    setData(prevData =>
                        prevData.map(shippingCompany =>
                            shippingCompany.idShippingCompany === shippingCompanyPayload.idShippingCompany ? updatedShippingCompany : shippingCompany
                        )
                    );
                } else {
                    setData(prevData => [...prevData, { ...updatedShippingCompany, idShippingCompany: response.data.idShippingCompany }]);
                }
            }

            handleClose();
            ShowMessage(t(messageKey), 'success');
        } catch (error) {
            ShowMessage(t('error'), 'error');
            console.error("Error saving shippingCompany:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const requiredErrorText = t('ThisFieldIsRequired') || 'Este campo es obligatorio.';

    return (
        <>
            {/* Se asegura que onClose={handleClose} esté presente en Dialog */}
            <Dialog open={open} onClose={handleClose} fullWidth maxWidth="md">
                <DialogTitle>
                    {isEditing ? t('editShippingCompany') : t('addShippingCompany')}
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
                                label={t('shippingCompanyName') || t('name')}
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

export default ShippingCompanyFormModal;