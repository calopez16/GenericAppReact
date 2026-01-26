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
    OutlinedInput,
    FormControl,
    InputLabel,
    Select,
    FormHelperText
} from '@mui/material';
import CancelIcon from '@mui/icons-material/Clear';
import SaveIcon from '@mui/icons-material/Save';
import AddIcon from '@mui/icons-material/Add';
import { useTranslation } from 'react-i18next';

const sizeOptions = ['SML', 'DL', 'STD', 'XL', 'LRG', 'JBO', 'TIPS', 'L1L2'];

const LabelTypeModal = ({ open, handleClose, data, isEditing, onSave }) => {
    const { t } = useTranslation();
    const descriptionRef = useRef(null);

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
                setFormData({
                    idLabelType: data.idLabelType || 0,
                    description: data.description || '',
                    sizes: Array.isArray(data.sizes) ? [...data.sizes] : []
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

    const handleChange = (e) => {
        const { name, value } = e.target;
        const finalValue = name === 'sizes'
            ? (typeof value === 'string' ? value.split(',') : value)
            : value;

        setFormData(prev => ({ ...prev, [name]: finalValue }));
        if (hasAttemptedSubmit) validateField(name, finalValue);
    };

    const validateField = (name, value) => {
        let isError = name === 'description'
            ? (!value || value.trim().length === 0)
            : (!Array.isArray(value) || value.length === 0);

        setValidationErrors(prev => ({ ...prev, [name]: isError }));
        return !isError;
    };

    const handleSubmit = (event) => {
        if (event) event.preventDefault();
        setHasAttemptedSubmit(true);

        const isDescValid = validateField('description', formData.description);
        const isSizesValid = validateField('sizes', formData.sizes);

        if (!isDescValid || !isSizesValid) return;

        // Enviamos una lista plana de objetos (desc + cada size individual)
        // Esto permite que el padre use su función de agrupación uniformemente
        const flatData = formData.sizes.map(s => ({
            idLabelType: isEditing ? formData.idLabelType : 0,
            description: formData.description,
            size: s
        }));

        onSave(flatData, isEditing);
        handleClose();
    };

    return (
        <Dialog open={open} onClose={handleClose} fullWidth maxWidth="xs">
            <DialogTitle>{isEditing ? t('labelType_edit') : t('labelType_add')}</DialogTitle>
            <Box component="form" onSubmit={handleSubmit} noValidate>
                <DialogContent>
                    <TextField
                        margin="normal" required fullWidth
                        label={t('description')} name="description"
                        value={formData.description} onChange={handleChange}
                        inputRef={descriptionRef} error={validationErrors.description}
                        helperText={validationErrors.description ? t('requiredField') : ''}
                    />
                    <FormControl fullWidth margin="normal" error={validationErrors.sizes} required>
                        <InputLabel id="lbl-sizes">{t('size')}</InputLabel>
                        <Select
                            labelId="lbl-sizes" multiple name="sizes"
                            value={formData.sizes} onChange={handleChange}
                            input={<OutlinedInput label={t('size')} />}
                            renderValue={(selected) => selected.join(', ')}
                        >
                            {sizeOptions.map((name) => (
                                <MenuItem key={name} value={name}>
                                    <Checkbox checked={formData.sizes.indexOf(name) > -1} />
                                    <ListItemText primary={name} />
                                </MenuItem>
                            ))}
                        </Select>
                        {validationErrors.sizes && <FormHelperText>{t('requiredField')}</FormHelperText>}
                    </FormControl>
                </DialogContent>
                <DialogActions>
                    <Button color="error" onClick={handleClose}>{t('cancel')}</Button>
                    <Button type="submit" variant="contained">{isEditing ? t('save') : t('add')}</Button>
                </DialogActions>
            </Box>
        </Dialog>
    );
};

export default LabelTypeModal;