import React, { useState, useEffect, useRef } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Button,
    Box,
    MenuItem, // 1. Importamos MenuItem
} from '@mui/material';
import CancelIcon from '@mui/icons-material/Clear';
import SaveIcon from '@mui/icons-material/Save';
import AddIcon from '@mui/icons-material/Add';
import { useTranslation } from 'react-i18next';

// Definimos las opciones disponibles
const sizeOptions = ['SML', 'DL', 'STD', 'XL', 'LRG', 'JBO'];

const LabelTypeModal = ({ open, handleClose, data, isEditing, onSave }) => {
    const { t } = useTranslation();
    const descriptionRef = useRef(null);

    const [formData, setFormData] = useState({
        idLabelType: 0,
        description: '',
        size: ''
    });
    const [validationErrors, setValidationErrors] = useState({
        description: false,
        size: false
    });
    const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState(false);

    useEffect(() => {
        if (open) {
            if (isEditing && data) {
                setFormData({
                    idLabelType: data.idLabelType || 0,
                    description: data.description || '',
                    size: data.size || ''
                });
            } else {
                setFormData({
                    idLabelType: Date.now() * -1,
                    description: '',
                    size: ''
                });
            }
            setValidationErrors({ description: false, size: false });
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
        if (name === 'description' || name === 'size') {
            isError = value.trim().length === 0;
        }

        setValidationErrors(prev => ({
            ...prev,
            [name]: isError
        }));
        return !isError;
    };

    const validateForm = () => {
        const descValid = validateField('description', formData.description);
        const sizeValid = validateField('size', formData.size);
        return (descValid && sizeValid);
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

                    {/* CAMBIO REALIZADO AQUÍ: Propiedad select y MenuItems */}
                    <TextField
                        select
                        margin="normal"
                        required
                        fullWidth
                        label={t('size')}
                        name="size"
                        value={formData.size}
                        onChange={handleChange}
                        error={validationErrors.size}
                        helperText={validationErrors.size ? t('requiredField') : ''}
                    >
                        {sizeOptions.map((option) => (
                            <MenuItem key={option} value={option}>
                                {option}
                            </MenuItem>
                        ))}
                    </TextField>

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