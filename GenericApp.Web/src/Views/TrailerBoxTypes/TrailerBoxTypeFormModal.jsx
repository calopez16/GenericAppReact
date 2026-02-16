import React, { useState, useEffect, useRef, useContext } from 'react';
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
        }
    }, [open, isEditing, data]);

    useEffect(() => {
        if (open) {
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

        if (hasAttemptedSubmit && description === 'description') {
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
        <>
            <Dialog open={open} onClose={handleClose} fullWidth maxWidth="md">
                <DialogTitle>
                    {isEditing ? t('trailerBoxType_edit') : t('trailerBoxType_add')}
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
                                label={t('description')}
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                inputRef={descriptionRef}
                                sx={{ gridColumn: { xs: 'span 1', sm: 'span 2' } }}
                                error={validationErrors.description}
                                helperText={validationErrors.description ? t('requiredField') : ''}
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
        </>
    );
};

export default TrailerBoxTypeFormModal;