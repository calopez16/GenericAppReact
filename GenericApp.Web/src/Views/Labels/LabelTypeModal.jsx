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
    FormHelperText,
    Divider,
    InputAdornment,
    IconButton,
    Tooltip,
    Avatar,
    Typography
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Clear';
import CloseIcon from '@mui/icons-material/Close';
import EditIcon from '@mui/icons-material/Edit';
import CategoryIcon from '@mui/icons-material/Category';
import { useTranslation } from 'react-i18next';


const LabelTypeModal = ({ open, handleClose, data, isEditing, onSave, availableOptions = [] }) => {
    const { t } = useTranslation();
    const descriptionRef = useRef(null);

    const [dynamicSizeOptions, setDynamicSizeOptions] = useState([]);
    const [newSize, setNewSize] = useState('');

    const [formData, setFormData] = useState({
        idLabelType: 0,
        description: '',
        sizes: []
    });

    const [validationErrors, setValidationErrors] = useState({ description: false, sizes: false });
    const [showErrors, setShowErrors] = useState(false);

    useEffect(() => {
        if (open) {
            // 1. Extraer tamaños únicos de las opciones que vienen del API
            const apiSizes = [...new Set(availableOptions.map(item => item.size).filter(Boolean))];

            // 2. Si estamos editando, asegurar que los tamaños actuales del registro estén en la lista
            const currentSizes = data?.sizes || [];
            const mergedSizes = [...new Set([...apiSizes, ...currentSizes])];

            setDynamicSizeOptions(mergedSizes.length > 0 ? mergedSizes : ['SML', 'DL', 'STD', 'XL', 'LRG', 'JBO', 'TIPS', 'L1L2']);

            if (isEditing && data) {
                setFormData({
                    idLabelType: data.idLabelType || 0,
                    description: data.description || '',
                    sizes: Array.isArray(data.sizes) ? [...data.sizes] : []
                });
                setValidationErrors({ description: false, sizes: false });
            } else {
                setFormData({ idLabelType: Date.now() * -1, description: '', sizes: [] });
                setValidationErrors({ description: true, sizes: true });
            }
            setShowErrors(false);
        }
    }, [open, isEditing, data, availableOptions]);

    const handleAddCustomSize = () => {
        if (newSize.trim() && !dynamicSizeOptions.includes(newSize.trim())) {
            const addedSize = newSize.trim().toUpperCase();
            setDynamicSizeOptions(prev => [...prev, addedSize]);
            setFormData(prev => ({ ...prev, sizes: [...prev.sizes, addedSize] }));
            setNewSize('');
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        const newValue = name === 'sizes' ? (typeof value === 'string' ? value.split(',') : value) : value;
        setFormData(prev => ({ ...prev, [name]: newValue }));
        setValidationErrors(prev => ({
            ...prev,
            [name]: name === 'description'
                ? !newValue || newValue.trim().length === 0
                : !Array.isArray(newValue) || newValue.length === 0
        }));
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
        setShowErrors(true);
        if (!formData.description.trim() || formData.sizes.length === 0) {
            setValidationErrors({
                description: !formData.description.trim(),
                sizes: formData.sizes.length === 0
            });
            return;
        }

        const flatData = formData.sizes.map(s => ({
            idLabelType: isEditing && formData.idLabelType > 0 ? formData.idLabelType : 0,
            description: formData.description,
            size: s
        }));

        onSave(flatData, isEditing);
        handleClose();
    };

    return (
        <Dialog open={open} onClose={handleClose} fullWidth maxWidth="xs" PaperProps={{ sx: { borderRadius: 3 } }}>
            <Box component="form" onSubmit={handleSubmit} noValidate>
                <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', py: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Avatar sx={{ bgcolor: 'primary.light', color: 'white', width: 42, height: 42, borderRadius: 2 }}>
                            {isEditing ? <EditIcon /> : <CategoryIcon />}
                        </Avatar>
                        <Box>
                            <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
                                {isEditing ? t('labelType_edit') : t('labelType_add')}
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
                    <TextField
                        margin="normal" required fullWidth
                        label={t('description')} name="description"
                        value={formData.description} onChange={handleChange}
                        error={showErrors && validationErrors.description}
                        helperText={showErrors && validationErrors.description ? t('requiredField') : ''}
                    />

                    <FormControl fullWidth margin="normal" error={showErrors && validationErrors.sizes}>
                        <InputLabel id="lbl-sizes">{t('size')}</InputLabel>
                        <Select
                            labelId="lbl-sizes" multiple name="sizes"
                            value={formData.sizes} onChange={handleChange}
                            input={<OutlinedInput label={t('size')} />}
                            renderValue={(selected) => selected.join(', ')}
                        >

                            <Box
                                sx={{
                                    p: 2,
                                    pt: 2.5,
                                    display: 'flex',
                                    gap: 1,
                                    alignItems: 'center'
                                }}
                                onKeyDown={(e) => e.stopPropagation()}
                            >
                                <TextField
                                    label={t('new_size') || "Nuevo Tamaño"}
                                    size="small"
                                    value={newSize}
                                    fullWidth
                                    variant="outlined"
                                    onChange={(e) => setNewSize(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            e.preventDefault();
                                            handleAddCustomSize();
                                        }
                                    }}
                                />

                                <Tooltip title={t('add_size_tooltip') || "Agregar tamaño"} arrow placement="top">
                                    <span> {/* El span asegura que el tooltip funcione incluso si el botón llegara a estar deshabilitado */}
                                        <Button
                                            variant="contained"
                                            size="medium"
                                            onClick={handleAddCustomSize}
                                            disabled={!newSize.trim()} // Deshabilitar si está vacío
                                            sx={{
                                                whiteSpace: 'nowrap',
                                                minWidth: 'fit-content',
                                                height: '40px'
                                            }}
                                        >
                                            {t('add_plus') || "Agregar +"}
                                        </Button>
                                    </span>
                                </Tooltip>
                            </Box>

                            <Divider />
                            {dynamicSizeOptions.map((name) => (
                                <MenuItem key={name} value={name}>
                                    <Checkbox checked={formData.sizes.indexOf(name) > -1} />
                                    <ListItemText primary={name} />
                                </MenuItem>
                            ))}


                            
                        </Select>
                        {showErrors && validationErrors.sizes && <FormHelperText>{t('requiredField')}</FormHelperText>}
                    </FormControl>
                </DialogContent>

                <Divider />

                <DialogActions sx={{ p: 2.5 }}>
                    <Button
                        onClick={handleClose}
                        color="error"
                        variant="outlined"
                        endIcon={<CancelIcon />}
                    >
                        {t('cancel')}
                    </Button>
                    <Button
                        type="submit"
                        variant="contained"
                        disableElevation
                        endIcon={isEditing ? <SaveIcon /> : <AddIcon />}
                    >
                        {isEditing ? t('save') : t('add')}
                    </Button>
                </DialogActions>
            </Box>
        </Dialog>
    );
};

export default LabelTypeModal;