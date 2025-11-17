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
} from '@mui/material';
import CancelIcon from '@mui/icons-material/Clear';
import SaveIcon from '@mui/icons-material/Save';
import AddIcon from '@mui/icons-material/Add';
import { useTranslation } from 'react-i18next';

const LabelTypeModal = ({ open, handleClose, data, isEditing, onSave }) => {
    const { t } = useTranslation();
    const descriptionRef = useRef(null);

    const [formData, setFormData] = useState({
        idLabelType: 0,
        description: '',
        // maxBoxQuantity: 0, // ¡ELIMINADO!
    });
    const [validationErrors, setValidationErrors] = useState({
        description: false,
        // maxBoxQuantity: false, // ¡ELIMINADO!
    });
    const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState(false);

    useEffect(() => {
        if (open) {
            if (isEditing && data) {
                setFormData({
                    idLabelType: data.idLabelType || 0,
                    description: data.description || '',
                    // maxBoxQuantity: data.maxBoxQuantity || 0, // ¡ELIMINADO!
                });
            } else {
                setFormData({
                    idLabelType: Date.now() * -1,
                    description: '',
                    // maxBoxQuantity: 0, // ¡ELIMINADO!
                });
            }
            setValidationErrors({ description: false /*, maxBoxQuantity: false*/ }); // ¡ELIMINADO!
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

        if (hasAttemptedSubmit) {
            validateField(name, value);
        }
    };

    const validateField = (name, value) => {
        let isError = false;
        if (name === 'description') {
            isError = value.trim().length === 0;
        }
        // else if (name === 'maxBoxQuantity') { // ¡ELIMINADO!
        //     isError = parseInt(value) <= 0;
        // }

        setValidationErrors(prev => ({
            ...prev,
            [name]: isError
        }));
        return !isError;
    };

    const validateForm = () => {
        const descValid = validateField('description', formData.description);
        // const maxValid = validateField('maxBoxQuantity', formData.maxBoxQuantity); // ¡ELIMINADO!

        return descValid; // Solo chequea descripción
    };


    const handleSubmit = (event) => {
        if (event) event.preventDefault();
        setHasAttemptedSubmit(true);

        if (!validateForm()) {
            return;
        }

        onSave(formData, isEditing);
        handleClose();
    };

    return (
        <Dialog open={open} onClose={handleClose} fullWidth maxWidth="xs">
            <DialogTitle>
                {isEditing ? t('labelType_edit') : t('labelType_add')}
            </DialogTitle>
            <Box component="form" onSubmit={handleSubmit} noValidate>
                <DialogContent>
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
                    {/* CAMPO ELIMINADO: maxBoxQuantity */}
                </DialogContent>
                <DialogActions>
                    <Button type="button" color="error" variant="outlined" endIcon={<CancelIcon />} onClick={handleClose}>
                        {t('cancel')}
                    </Button>
                    <Button type="submit" color="primary" variant="contained" endIcon={isEditing ? <SaveIcon /> : <AddIcon />}>
                        {isEditing ? t('save') : t('add')}
                    </Button>
                </DialogActions>
            </Box>
        </Dialog>
    );
};

export default LabelTypeModal;