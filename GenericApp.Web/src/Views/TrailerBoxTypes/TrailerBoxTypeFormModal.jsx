import React, { useState, useEffect, useRef, useContext } from 'react';
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
import { AppContext } from '@helpers/AppContext';

import { DataAPITrailerBoxTypesService } from '@data/TrailerBoxTypes/Data';
import { useTranslation } from 'react-i18next';
import { ShowMessage } from '@helpers/NotificationService';

const TrailerBoxTypeFormModal = ({ open, handleClose, data, isEditing, setData }) => {
    const { t } = useTranslation();
    const dataService = DataAPITrailerBoxTypesService();
    const { companySelected } = useContext(AppContext);

    const descriptionRef = useRef(null);

    const [formData, setFormData] = useState({
        idTrailerBoxType: 0,
        description: '',
    });

    const [isLoading, setIsLoading] = useState(false);

    const [validationErrors, setValidationErrors] = useState({
        description: false,
    });
    const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState(false);

    useEffect(() => {
        if (open) {
            if (isEditing && data) {
                setFormData({
                    idTrailerBoxType: data.idTrailerBoxType || 0,
                    description: data.description || ''
                });
            } else if (!isEditing) {
                setFormData({
                    idTrailerBoxType: 0,
                    description: ''
                });
            }
            setValidationErrors({ description: false });
            setHasAttemptedSubmit(false);
            setTimeout(() => { if (descriptionRef.current) descriptionRef.current.focus(); }, 100);
        }
    }, [open, isEditing, data]);

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

    const validateForm = () => {
        const errors = {
            description: !formData.description.trim(),
        };
        setValidationErrors(errors);
        return !errors.description;
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

            const trailerBoxTypePayload = {
                idTrailerBoxType: formData.idTrailerBoxType || 0,
                description: formData.description,
                idCompany: companySelected?.idCompany ?? 0
            };

            let response;
            let messageKey;
            if (isEditing) {
                response = await dataService.editData(trailerBoxTypePayload, true);
                messageKey = 'recordEditedSuccessPlural';
            } else {
                response = await dataService.addData(trailerBoxTypePayload, true);
                messageKey = 'recordAddedSuccessPlural';
            }

            if (response.responseCode === 409) {
                ShowMessage(t('dataAlreadyExists') + ": " + response.conflict, 'warning');
                return;
            }

            if (response.success) {
                const newOrUpdatedTrailerBoxType = {
                    ...trailerBoxTypePayload,
                    isActive: response.data.isActive,
                    idCompany: response.data.idCompany,
                    isDeleted: response.data.isDeleted,
                    idTrailerBoxType: response.data.idTrailerBoxType
                };

                if (isEditing) {
                    setData(prevData =>
                        prevData.map(trailerBoxType =>
                            trailerBoxType.idTrailerBoxType === trailerBoxTypePayload.idTrailerBoxType ? newOrUpdatedTrailerBoxType : trailerBoxType
                        )
                    );
                } else {
                    setData(prevData => [...prevData, newOrUpdatedTrailerBoxType]);
                }
            }

            handleClose();
            ShowMessage(t(messageKey), 'success');
        } catch (error) {
            ShowMessage(t('error'), 'error');
            console.error("Error saving trailerBoxType:", error);
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
                                {isEditing ? t('trailerBoxType_edit') : t('trailerBoxType_add')}
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
                            label={t('description')}
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            inputRef={descriptionRef}
                            error={validationErrors.description}
                            helperText={validationErrors.description ? t('requiredField') : ''}
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

export default TrailerBoxTypeFormModal;