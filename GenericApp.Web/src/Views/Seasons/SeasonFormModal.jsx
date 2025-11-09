import React, { useState, useEffect, useRef } from 'react';
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

import { DataAPISeasonsService } from '@data/Seasons/Data';
import { useTranslation } from 'react-i18next';
import { ShowMessage } from '@helpers/NotificationService';

dayjs.extend(customParseFormat);

const SeasonFormModal = ({ open, handleClose, data, isEditing, setData }) => {
    const { t } = useTranslation();
    const dataService = DataAPISeasonsService();

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
                    idCompany: data.idCompany || 1,
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
                    idCompany: 1,
                });
            }
            setValidationErrors({ name: false, description: false, initialDate: false, endDate: false });
            setHasAttemptedSubmit(false);
        }
    }, [open, isEditing, data]);

    useEffect(() => {
        if (open && nameRef.current) {
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

        if (errors.name) {
            errorMsg = t('NameIsRequired') || 'El nombre es obligatorio.';
        } else if (errors.initialDate) {
            errorMsg = t('InitialDateIsRequired') || 'La fecha de inicio es obligatoria.';
        } else if (errors.endDate) {
            errorMsg = t('EndDateIsRequired') || 'La fecha de fin es obligatoria.';
        }

        if (!errorMsg) {
            const startDayjs = formData.initialDate;
            const endDayjs = formData.endDate;

            if (startDayjs.isAfter(endDayjs, 'day')) {
                errorMsg = t('DateRangeError') || 'La fecha de inicio no puede ser posterior a la fecha de fin.';
            }
        }

        setValidationErrors(errors);

        return errorMsg;
    };


    const handleSubmit = async () => {
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
                ShowMessage(t('daraAlreadyExists') + ": " + response.conflict, 'warning');
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

                const messageKey = willClose ? 'Temporada cerrada con éxito' : 'Temporada abierta con éxito';
                ShowMessage(t(messageKey) || messageKey, 'success');

                handleClose();
            } else {
                ShowMessage(t('error') || 'Error al actualizar el estado de la temporada', 'error');
            }
        } catch (error) {
            ShowMessage(t('error') || 'Error al comunicarse con el servidor', 'error');
            console.error("Error toggling close status:", error);
        } finally {
            setIsClosingOrOpening(false);
        }
    };


    const requiredErrorText = t('ThisFieldIsRequired') || 'Este campo es obligatorio.';

    const toggleButtonText = formData.isClosed ?
        (t('Abrir Temporada') || 'Abrir Temporada') :
        (t('Cerrar Temporada') || 'Cerrar Temporada');

    return (
        <>
            <Dialog open={open} onClose={handleClose} fullWidth maxWidth="md">
                <DialogTitle>
                    {isEditing ? t('editSeason') : t('addSeason')}
                </DialogTitle>
                <DialogContent>
                    <Box
                        component="form"
                        noValidate
                        sx={{
                            mt: 2,
                            display: 'grid',
                            // En xs, solo definimos una columna (1fr). 
                            // En sm (y superiores), definimos dos columnas (repeat(2, 1fr)).
                            gridTemplateColumns: {
                                xs: '1fr',
                                sm: 'repeat(2, 1fr)'
                            },
                            gap: 2
                        }}
                    >

                        {/* Campo Name: Ocupa las 2 columnas en sm, y como solo hay 1 columna en xs, ocupa el 100% */}
                        <TextField
                            required
                            fullWidth
                            label={t('Name')}
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            inputRef={nameRef}
                            // En sm, ocupa las 2 columnas, en xs ocupa la única columna disponible.
                            sx={{ gridColumn: { xs: 'span 1', sm: 'span 2' } }}
                            error={validationErrors.name}
                            helperText={validationErrors.name ? requiredErrorText : ''}
                        />

                        {/* Campo Initial Date: Ocupa 1 columna en sm, y la única columna disponible en xs */}
                        <DatePicker
                            label={t('Initial Date')}
                            value={formData.initialDate}
                            onChange={(date) => handleDateChange(date, 'initialDate')}
                            inputFormat={DISPLAY_FORMAT}
                            // En xs, forzamos a que ocupe la única columna disponible (span 1 = 100%).
                            // En sm, ocupa 1 de las 2 columnas.
                            sx={{ gridColumn: { xs: 'span 1', sm: 'span 1' } }}
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    required
                                    fullWidth
                                    name="initialDate"
                                    error={validationErrors.initialDate || params.error}
                                    helperText={validationErrors.initialDate ? requiredErrorText : params.helperText}
                                />
                            )}
                        />

                        {/* Campo End Date: Ocupa 1 columna en sm, y la única columna disponible en xs */}
                        <DatePicker
                            label={t('End Date')}
                            value={formData.endDate}
                            onChange={(date) => handleDateChange(date, 'endDate')}
                            inputFormat={DISPLAY_FORMAT}
                            // En xs, forzamos a que ocupe la única columna disponible (span 1 = 100%).
                            // En sm, ocupa 1 de las 2 columnas.
                            sx={{ gridColumn: { xs: 'span 1', sm: 'span 1' } }}
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    required
                                    fullWidth
                                    name="endDate"
                                    error={validationErrors.endDate || params.error}
                                    helperText={validationErrors.endDate ? requiredErrorText : params.helperText}
                                />
                            )}
                        />

                        {/* Campo Description: Ocupa las 2 columnas en sm, y la única columna en xs */}
                        <TextField
                            fullWidth
                            label={t('description')}
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            multiline
                            rows={2}
                            // En sm, ocupa las 2 columnas, en xs ocupa la única columna disponible.
                            sx={{ gridColumn: { xs: 'span 1', sm: 'span 2' } }}
                        />
                    </Box>
                </DialogContent>
                <DialogActions
                    sx={{
                        // Orden de botones: 'column' en xs, 'row' en sm
                        flexDirection: { xs: 'column', sm: 'row' },
                        // Alineación en xs: 'flex-start' o 'center'. Usamos 'space-between' para el layout original en sm, y reajustamos el orden.
                        justifyContent: isEditing ? { xs: 'flex-start', sm: 'space-between' } : 'flex-end',
                        p: 3 // Aumentamos el padding para la disposición de columna
                    }}
                >
                    {isEditing && (
                        // Botón "Cerrar temporada" o "Abrir Temporada" (row1: Cerrar temporada en la solicitud)
                        <Button
                            color={formData.isClosed ? "success" : "error"}
                            variant="contained"
                            onClick={handleToggleCloseStatus}
                            disabled={isClosingOrOpening || isLoading}
                            // En xs, se pone en la parte superior (row1). En sm, a la izquierda (orden 1).
                            sx={{
                                order: { xs: 1, sm: 1 },
                                width: { xs: '100%', sm: 'auto' }, // Ancho completo en xs
                                mb: { xs: 2, sm: 0 } // Margen inferior en xs
                            }}
                        >
                            {toggleButtonText}
                        </Button>
                    )}

                    {/* Botones Cancelar y Guardar (row2: Cancelar y guardar en la solicitud) */}
                    <Box
                        sx={{
                            // En xs, se pone en la parte inferior (row2). En sm, a la derecha (orden 2).
                            order: { xs: 2, sm: isEditing ? 2 : 1 },
                            width: { xs: '100%', sm: 'auto' }, // Ancho completo en xs
                            display: 'flex',
                            justifyContent: { xs: 'space-between', sm: 'flex-end' } // Espacio entre botones en xs
                        }}
                    >
                        <Button color="error" variant="outlined" endIcon={<CancelIcon />} onClick={handleClose} sx={{ mr: { xs: 0, sm: 1 } }}>
                            {t('cancel') || 'Cancelar'}
                        </Button>
                        <Button
                            color="primary"
                            variant="contained"
                            endIcon={isEditing ? <SaveIcon /> : <AddIcon />}
                            onClick={handleSubmit}
                            disabled={isLoading || isClosingOrOpening}
                        >
                            {isEditing ? (t('save') || 'Guardar') : (t('add') || 'Agregar')}
                        </Button>
                    </Box>
                </DialogActions>
            </Dialog>
        </>
    );
};

export default SeasonFormModal;