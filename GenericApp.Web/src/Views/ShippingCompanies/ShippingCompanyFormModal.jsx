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
    IconButton,
    Avatar,
    Divider,
    Tooltip,
    CircularProgress
} from '@mui/material';
import CancelIcon from '@mui/icons-material/Clear';
import SaveIcon from '@mui/icons-material/Save';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import CloseIcon from '@mui/icons-material/Close';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';

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
            setTimeout(() => { if (nameRef.current) nameRef.current.focus(); }, 100);
        }
    }, [open, isEditing, data]);

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
            ShowMessage(t('emptyFields') || 'Por favor, rellene todos los campos obligatorios.', 'warning');
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
                ShowMessage(t('dataAlreadyExists') + ": " + response.conflict, 'warning');
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


    return (
        <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm" PaperProps={{ sx: { borderRadius: 3 } }}>
            <form onSubmit={handleSubmit} noValidate>
                <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', py: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Avatar sx={{ bgcolor: 'primary.light', color: 'white', width: 42, height: 42, borderRadius: 2 }}>
                            {isEditing ? <EditIcon /> : <LocalShippingIcon />}
                        </Avatar>
                        <Box>
                            <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
                                {isEditing ? t('shippingCompanies_edit') : t('shippingCompanies_add')}
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
                    <Box sx={{ mt: 1 }}>
                        <TextField
                            required
                            fullWidth
                            label={t('name')}
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            inputRef={nameRef}
                            error={validationErrors.name}
                            helperText={validationErrors.name ? t('requiredField') : ''}
                            inputProps={{ maxLength: 150 }}
                        />
                    </Box>
                </DialogContent>

                <Divider />

                <DialogActions sx={{ p: 2.5 }}>
                    <Button
                        color="error"
                        variant="outlined"
                        endIcon={<CancelIcon />}
                        onClick={handleClose}
                    >
                        {t('cancel')}
                    </Button>
                    <Button
                        type="submit"
                        color="primary"
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
            </form>
        </Dialog>
    );
};

export default ShippingCompanyFormModal;