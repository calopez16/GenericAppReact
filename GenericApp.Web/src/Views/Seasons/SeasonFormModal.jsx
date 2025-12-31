import React, { useState, useEffect, useRef,useContext } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Button,
    Box,
    Switch,
    FormControlLabel,
} from '@mui/material';
import CancelIcon from '@mui/icons-material/Clear';
import SaveIcon from '@mui/icons-material/Save';
import AddIcon from '@mui/icons-material/Add';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import { AppContext } from '@helpers/AppContext';

import { DataAPISeasonsService } from '@data/Seasons/Data';
import { useTranslation } from 'react-i18next';
import { ShowMessage } from '@helpers/NotificationService';

dayjs.extend(customParseFormat);

const SeasonFormModal = ({ open, handleClose, data, isEditing, setData }) => {
    const { t } = useTranslation();
    const dataService = DataAPISeasonsService();
    const { companySelected } = useContext(AppContext);

    const nameRef = useRef(null);

    const DISPLAY_FORMAT = 'DD/MM/YYYY';

    const parseDateToDayjs = (date) => {
        if (!date) return null;
        return dayjs(date);
    };

    const [formData, setFormData] = useState({
        idSeason: 0,
        name: '',
        description: '',
        initialDate: null,
        endDate: null,
        isClosed: false,
        isActive: true,
        idCompany: 1,
    });

    const [isLoading, setIsLoading] = useState(false);
    const [isClosingOrOpening, setIsClosingOrOpening] = useState(false);

    const [validationErrors, setValidationErrors] = useState({
        name: false,
        description: false,
        initialDate: false,
        endDate: false,
    });
    const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState(false);

    useEffect(() => {
        if (open) {
            if (isEditing && data) {
                setFormData({
                    idSeason: data.idSeason || 0,
                    name: data.name || '',
                    description: data.description || '',
                    initialDate: parseDateToDayjs(data.initialDate),
                    endDate: parseDateToDayjs(data.endDate),
                    isClosed: data.isClosed ?? false,
                    isActive: data.isActive ?? true,
                    idCompany: companySelected.idCompany || null,
                });
            } else if (!isEditing) {
                setFormData({
                    idSeason: 0,
                    name: '',
                    description: '',
                    initialDate: dayjs(),
                    endDate: dayjs(),
                    isClosed: false,
                    isActive: true,
                    idCompany: companySelected.idCompany || null,
                });
            }
            setValidationErrors({ name: false, description: false, initialDate: false, endDate: false });
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
            const isError = value.trim().length === 0;
            setValidationErrors(prev => ({
                ...prev,
                [name]: isError
            }));
        }
    };

    const handleDateChange = (date, name) => {
        const validDate = date && dayjs.isDayjs(date) && date.isValid() ? date : null;

        setFormData(prev => ({
            ...prev,
            [name]: validDate,
        }));

        if (hasAttemptedSubmit) {
            const isError = !validDate;
            setValidationErrors(prev => ({
                ...prev,
                [name]: isError,
            }));
        }
    };

    const validateForm = () => {
        let errorMsg = null;

        const errors = {
            name: !formData.name.trim(),
            description: false,
            initialDate: !formData.initialDate || !formData.initialDate.isValid(),
            endDate: !formData.endDate || !formData.endDate.isValid(),
        };

        if (errors.name || errors.initialDate || errors.endDate) {
            errorMsg = t('emptyFields');
        } 

        if (!errorMsg) {
            const startDayjs = formData.initialDate;
            const endDayjs = formData.endDate;

            if (startDayjs.isAfter(endDayjs, 'day')) {
                errorMsg = t('season_dateRangeError');
            }
        }

        setValidationErrors(errors);

        return errorMsg;
    };


    const handleSubmit = async (event) => {
        if (event) event.preventDefault();

        setHasAttemptedSubmit(true);

        const validationResult = validateForm();

        if (validationResult) {
            ShowMessage(validationResult, 'warning');
            return;
        }

        try {
            setIsLoading(true);

            const initialDateISO = formData.initialDate.toISOString();
            const endDateISO = formData.endDate.toISOString();

            const seasonPayload = {
                idSeason: formData.idSeason || 0,
                name: formData.name,
                description: formData.description,
                initialDate: initialDateISO,
                endDate: endDateISO,
                isClosed: formData.isClosed,
                isActive: formData.isActive,
                idCompany: formData.idCompany,
            };

            let response;
            let messageKey;
            if (isEditing) {
                response = await dataService.editData(seasonPayload, true);
                messageKey = 'recordEditedSuccessPlural';
            } else {
                response = await dataService.addData(seasonPayload, true);
                messageKey = 'recordAddedSuccessPlural';
            }

            if (response.responseCode === 409) {
                ShowMessage(t('dataAlreadyExists') + ": " + response.conflict, 'warning');
                return;
            }

            if (response.success) {
                if (isEditing) {
                    setData(prevData =>
                        prevData.map(season =>
                            season.idSeason === seasonPayload.idSeason ? { ...season, ...response.data } : season
                        )
                    );
                } else {
                    setData(prevData => [...prevData, { ...seasonPayload, idSeason: response.data.idSeason, isActive: response.data.isActive }]);
                }
            }

            handleClose();
            ShowMessage(t(messageKey), 'success');
        } catch (error) {
            ShowMessage(t('error'), 'error');
            console.error("Error saving season:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleToggleCloseStatus = async () => {
        if (!isEditing || !formData.idSeason) return;

        const willClose = !formData.isClosed;

        try {
            setIsClosingOrOpening(true);
            let response;

            if (willClose) {
                response = await dataService.close(formData.idSeason);
            } else {
                response = await dataService.open(formData.idSeason);
            }

            if (response.success) {
                setFormData(prev => ({ ...prev, isClosed: willClose }));

                setData(prevData =>
                    prevData.map(season =>
                        season.idSeason === formData.idSeason ? { ...season, isClosed: willClose } : season
                    )
                );

                const messageKey = willClose ? t('season_closeSuccesfully') : t('season_openSuccesfully');
                ShowMessage(messageKey, 'success');

                handleClose();
            } else {
                ShowMessage(t('season_errorUpdate'), 'error');
            }
        } catch (error) {
            ShowMessage(t('error'), 'error');
            console.error("Error toggling close status:", error);
        } finally {
            setIsClosingOrOpening(false);
        }
    };


    const toggleButtonText = formData.isClosed ?
        (t('season_open')) :
        (t('season_close'));

    return (
        <>
            <Dialog open={open} onClose={handleClose} fullWidth maxWidth="md">
                <DialogTitle>
                    {isEditing ? t('season_edit') : t('season_add')}
                </DialogTitle>
                <Box component="form" onSubmit={handleSubmit} noValidate>
                    <DialogContent>
                        <Box
                            sx={{
                                mt: 2,
                                display: 'grid',
                                gridTemplateColumns: {
                                    xs: '1fr',
                                    sm: 'repeat(2, 1fr)'
                                },
                                gap: 2
                            }}
                        >

                            <TextField
                                required
                                fullWidth
                                label={t('name')}
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                inputRef={nameRef}
                                sx={{ gridColumn: { xs: 'span 1', sm: 'span 2' } }}
                                error={validationErrors.name}
                                helperText={validationErrors.name ? t('requiredField') : ''}
                            />

                            <DatePicker
                                label={t('initialDate')}
                                value={formData.initialDate}
                                onChange={(date) => handleDateChange(date, 'initialDate')}
                                inputFormat={DISPLAY_FORMAT}
                                sx={{ gridColumn: { xs: 'span 1', sm: 'span 1' } }}
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        required
                                        fullWidth
                                        name="initialDate"
                                        error={validationErrors.initialDate || params.error}
                                        helperText={validationErrors.initialDate ? t('requiredField') : params.helperText}
                                    />
                                )}
                            />

                            <DatePicker
                                label={t('endDate')}
                                value={formData.endDate}
                                onChange={(date) => handleDateChange(date, 'endDate')}
                                inputFormat={DISPLAY_FORMAT}
                                sx={{ gridColumn: { xs: 'span 1', sm: 'span 1' } }}
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        required
                                        fullWidth
                                        name="endDate"
                                        error={validationErrors.endDate || params.error}
                                        helperText={validationErrors.endDate ? t('requiredField') : params.helperText}
                                    />
                                )}
                            />

                            <TextField
                                fullWidth
                                label={t('description')}
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                multiline
                                rows={2}
                                sx={{ gridColumn: { xs: 'span 1', sm: 'span 2' } }}
                            />
                        </Box>
                    </DialogContent>
                    <DialogActions
                        sx={{
                            flexDirection: { xs: 'column', sm: 'row' },
                            justifyContent: isEditing ? { xs: 'flex-start', sm: 'space-between' } : 'flex-end',
                            p: 3
                        }}
                    >
                        {isEditing && (
                            <Button
                                color={formData.isClosed ? "success" : "error"}
                                variant="contained"
                                onClick={handleToggleCloseStatus}
                                disabled={isClosingOrOpening || isLoading}
                                sx={{
                                    order: { xs: 1, sm: 1 },
                                    width: { xs: '100%', sm: 'auto' },
                                    mb: { xs: 2, sm: 0 }
                                }}
                            >
                                {toggleButtonText}
                            </Button>
                        )}

                        <Box
                            sx={{
                                order: { xs: 2, sm: isEditing ? 2 : 1 },
                                width: { xs: '100%', sm: 'auto' },
                                display: 'flex',
                                justifyContent: { xs: 'space-between', sm: 'flex-end' }
                            }}
                        >
                            <Button color="error" variant="outlined" endIcon={<CancelIcon />} onClick={handleClose} sx={{ mr: { xs: 0, sm: 1 } }}>
                                {t('cancel') || 'Cancelar'}
                            </Button>
                            <Button
                                type="submit"
                                color="primary"
                                variant="contained"
                                endIcon={isEditing ? <SaveIcon /> : <AddIcon />}
                                disabled={isLoading || isClosingOrOpening}
                            >
                                {isEditing ? t('save') : t('add')}
                            </Button>
                        </Box>
                    </DialogActions>
                </Box>
            </Dialog>
        </>
    );
};

export default SeasonFormModal;