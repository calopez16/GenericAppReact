import React, { useState, useEffect, useRef } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Button,
    Box,
    MenuItem,
    Checkbox,
    ListItemText,
    OutlinedInput
} from '@mui/material';
import CancelIcon from '@mui/icons-material/Clear';
import SaveIcon from '@mui/icons-material/Save';
import AddIcon from '@mui/icons-material/Add';
import { useTranslation } from 'react-i18next';

// Opciones disponibles para el dropdown
const sizeOptions = ['SML', 'DL', 'STD', 'XL', 'LRG', 'JBO', 'TIPS', 'L1L2'];

const LabelTypeModal = ({ open, handleClose, data, isEditing, onSave }) => {
    const { t } = useTranslation();
    const descriptionRef = useRef(null);

    // El estado local maneja 'sizes' como un array para la UI
    const [formData, setFormData] = useState({
        idLabelType: 0,
        description: '',
        sizes: []
    });

    const [validationErrors, setValidationErrors] = useState({
        description: false,
        sizes: false
    });
    const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState(false);

    useEffect(() => {
        if (open) {
            if (isEditing && data) {
                // Si el API envía un objeto con un solo .size, lo convertimos a array para el modal
                setFormData({
                    idLabelType: data.idLabelType || 0,
                    description: data.description || '',
                    sizes: data.sizes ? data.sizes : (data.size ? [data.size] : [])
                });
            } else {
                setFormData({
                    idLabelType: Date.now() * -1,
                    description: '',
                    sizes: []
                });
            }
            setValidationErrors({ description: false, sizes: false });
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

        // Para selects múltiples, MUI devuelve un array en e.target.value
        const finalValue = name === 'sizes'
            ? (typeof value === 'string' ? value.split(',') : value)
            : value;

        setFormData(prev => ({
            ...prev,
            [name]: finalValue
        }));

        if (hasAttemptedSubmit) {
            validateField(name, finalValue);
        }
    };

    const validateField = (name, value) => {
        let isError = false;
        if (name === 'description') {
            isError = value.trim().length === 0;
        }
        if (name === 'sizes') {
            isError = !value || value.length === 0;
        }

        setValidationErrors(prev => ({
            ...prev,
            [name]: isError
        }));
        return !isError;
    };

    const validateForm = () => {
        const descValid = validateField('description', formData.description);
        const sizesValid = validateField('sizes', formData.sizes);
        return (descValid && sizesValid);
    };

    const handleSubmit = (event) => {
        if (event) event.preventDefault();
        setHasAttemptedSubmit(true);

        if (!validateForm()) return;

        /**
         * TRANSFORMACIÓN PARA EL BACKEND:
         * El usuario ve un solo formulario, pero el backend recibe N objetos 
         * según la cantidad de sizes seleccionados.
         */
        const dataToSave = formData.sizes.map(sizeName => ({
            idLabelType: isEditing ? formData.idLabelType : 0,
            description: formData.description,
            size: sizeName
        }));

        // Se envía el listado de objetos al callback onSave
        onSave(dataToSave, isEditing);
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

                    <TextField
                        select
                        margin="normal"
                        required
                        fullWidth
                        label={t('size')}
                        name="sizes"
                        value={formData.sizes}
                        onChange={handleChange}
                        error={validationErrors.sizes}
                        helperText={validationErrors.sizes ? t('requiredField') : ''}
                        SelectProps={{
                            multiple: true,
                            renderValue: (selected) => (selected && selected.length > 0 ? selected.join(', ') : ''),
                            input: <OutlinedInput label={t('size')} />
                        }}
                    >
                        {sizeOptions.map((option) => (
                            <MenuItem key={option} value={option}>
                                <Checkbox checked={formData.sizes.indexOf(option) > -1} />
                                <ListItemText primary={option} />
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