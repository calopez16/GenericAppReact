import React, { useState, useEffect, useRef } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Button,
    Box,
    Autocomplete,
} from '@mui/material';
import CancelIcon from '@mui/icons-material/Clear';
import SaveIcon from '@mui/icons-material/Save';
import AddIcon from '@mui/icons-material/Add';

import { DataAPICitiesService } from '@data/Cities/Data';
import { useTranslation } from 'react-i18next';
import { ShowMessage } from '@helpers/NotificationService';

const CityFormModal = ({ open, handleClose, data, isEditing, setData }) => {
    const { t } = useTranslation();
    const dataService = DataAPICitiesService();

    // Referencia para el foco automático en 'description'
    const descriptionRef = useRef(null);

    const [formData, setFormData] = useState({
        idCity: 0,
        description: '', // Requerido
        idState: null // Requerido
    });

    const [isLoading, setIsLoading] = useState(false);
    const [states, setStates] = useState([]);
    const [selectedState, setSelectedState] = useState(null);
    const [isStatesLoading, setIsStatesLoading] = useState(false);
    const [isAutocompleteOpen, setIsAutocompleteOpen] = useState(false);

    // ESTADOS NUEVOS para la validación diferida
    const [validationErrors, setValidationErrors] = useState({
        description: false,
        idState: false,
    });
    const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState(false);

    const debounceTimerRef = useRef(null);
    const DEBOUNCE_TIME = 500;

    // --- Lógica de Carga de Ciudades ---
    const fetchStates = async (searchTerm = "") => {
        setIsStatesLoading(true);
        try {
            const response = await dataService.getStatesPagination(1, 100, searchTerm);
            if (response.success && Array.isArray(response.data.data)) {
                const stateList = response.data.data.map(state => ({
                    id: state.idState,
                    name: `${state.description}, ${state.idCountryNavigation.description}`
                }));
                setStates(stateList);
            } else {
                setStates([]);
            }
        } catch (error) {
            console.error("Error fetching states:", error);
            setStates([]);
        } finally {
            setIsStatesLoading(false);
        }
    };

    // 1. Efecto para cargar los estados al abrir el modal
    useEffect(() => {
        if (open) {
            fetchStates();
        }
    }, [open]);

    // 2. Efecto para inicializar el formulario y RESETEAR la validación
    useEffect(() => {
        if (open) {
            if (isEditing && data) {
                setFormData({
                    idCity: data.idCity || 0,
                    description: data.description || '',
                    idState: data.idState || null
                });

            } else if (!isEditing) {
                setFormData({
                    idCity: 0,
                    description: '',
                    idState: null
                });
            }
            // RESETEAR la validación al abrir el modal
            setValidationErrors({ description: false, idState: false });
            setHasAttemptedSubmit(false);
        }
    }, [open, isEditing, data]);


    // 3. Efecto para inicializar el Autocomplete (selectedState)
    useEffect(() => {
        if (open && formData.idState !== null && states.length > 0) {
            const initialState = states.find(state => state.id === formData.idState);
            setSelectedState(initialState || null);
        } else if (open && formData.idState === null) {
            setSelectedState(null);
        }
    }, [open, states, formData.idState]);

    // 4. EFECTO PARA ENFOCAR EL CAMPO 'description'
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

        // Mostrar/Ocultar error instantáneamente si ya se intentó enviar y el campo es 'description'
        if (hasAttemptedSubmit && name === 'description') {
            setValidationErrors(prev => ({
                ...prev,
                description: value.trim().length === 0
            }));
        }
    };

    const handleStateChange = (event, newValue) => {
        setSelectedState(newValue);
        const newIdState = newValue ? newValue.id : null;
        setFormData(prev => ({
            ...prev,
            idState: newIdState
        }));

        // Mostrar/Ocultar error instantáneamente si ya se intentó enviar
        if (hasAttemptedSubmit) {
            setValidationErrors(prev => ({
                ...prev,
                idState: newIdState === null,
            }));
        }
    };

    const handleAutocompleteOpen = () => {
        setIsAutocompleteOpen(true);
        if (states.length <= 1) {
            fetchStates("");
        }
    };

    const handleStateInputChange = (event, newInputValue) => {
        if (debounceTimerRef.current) {
            clearTimeout(debounceTimerRef.current);
        }

        if (newInputValue.length === 0) {
            fetchStates("");
            return;
        }

        if (newInputValue.length >= 3) {
            debounceTimerRef.current = setTimeout(() => {
                fetchStates(newInputValue);
            }, DEBOUNCE_TIME);
        }
    };

    // --- FUNCIÓN DE VALIDACIÓN ---
    const validateForm = () => {
        const errors = {
            description: !formData.description.trim(),
            idState: formData.idState === null || formData.idState === 0,
        };

        setValidationErrors(errors);

        return !errors.description && !errors.idState;
    };


    // --- FUNCIÓN DE SUBMIT MODIFICADA ---
    const handleSubmit = async () => {
        setHasAttemptedSubmit(true); // Activa la visualización de errores

        if (!validateForm()) {
            ShowMessage(t('FillRequiredFields') || 'Por favor, rellene todos los campos obligatorios.', 'warning');
            return;
        }

        try {
            setIsLoading(true);

            const finalIdState = formData.idState ? parseInt(formData.idState) : 0;

            const cityPayload = {
                idCity: formData.idCity || 0,
                description: formData.description,
                idState: finalIdState
            };

            let response;
            let messageKey;
            if (isEditing) {
                response = await dataService.editData(cityPayload, true);
                messageKey = 'recordEditedSuccessPlural';
            } else {
                response = await dataService.addData(cityPayload, true);
                messageKey = 'recordAddedSuccessPlural';
            }

            if (response.responseCode === 409) {
                ShowMessage(t('daraAlreadyExists') + ": " + response.conflict, 'warning');
                return;
            }

            if (response.success) {
                if (isEditing) {
                    setData(prevData =>
                        prevData.map(city =>
                            city.idCity === cityPayload.idCity ? { ...city, ...cityPayload, idStateNavigation: response.data.idStateNavigation } : city
                        )
                    );
                } else {
                    setData(prevData => [...prevData, { ...cityPayload, idCity: response.data.idCity, isActive: response.data.isActive, idStateNavigation: response.data.idStateNavigation }]);
                }
            }

            handleClose();
            ShowMessage(t(messageKey), 'success');
        } catch (error) {
            ShowMessage(t('error'), 'error');
            console.error("Error saving city:", error);
        } finally {
            setIsLoading(false);
        }
    };

    // ----------------------------------------------------------------
    const requiredErrorText = t('ThisFieldIsRequired') || 'Este campo es obligatorio.';

    return (
        <>
            <Dialog open={open} onClose={handleClose} fullWidth maxWidth="md">
                <DialogTitle>
                    {isEditing ? t('editCity') : t('addCity')}
                </DialogTitle>
                <DialogContent>
                    <Box
                        component="form"
                        noValidate
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

                        {/* DESCRIPTION / NAME */}
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
                            // CONTROL DE ERROR usando el estado de validación
                            error={validationErrors.description}
                            helperText={validationErrors.description ? requiredErrorText : ''}
                        />


                        {/* STATE AUTOCOMPLETE */}
                        <Autocomplete
                            id="state-autocomplete"
                            options={states}
                            getOptionLabel={(option) => option.name || ""}
                            isOptionEqualToValue={(option, value) => option.id === value.id}
                            loading={isStatesLoading}
                            value={selectedState}
                            onChange={handleStateChange}
                            onOpen={handleAutocompleteOpen}
                            onClose={() => setIsAutocompleteOpen(false)}
                            open={isAutocompleteOpen}
                            onInputChange={handleStateInputChange}
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    margin="normal"
                                    required
                                    fullWidth
                                    label={t('idState')}
                                    name="idState"
                                    // CONTROL DE ERROR usando el estado de validación
                                    error={validationErrors.idState}
                                    helperText={validationErrors.idState ? requiredErrorText : ''}
                                />
                            )}
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
                            {(t('cancel') || 'Cancelar')}
                        </Button>
                        <Button
                            color="primary"
                            variant="contained"
                            endIcon={isEditing ? <SaveIcon /> : <AddIcon />}
                            onClick={handleSubmit}
                            disabled={isLoading || isStatesLoading}
                        >
                            {(isEditing ? (t('save') || 'Guardar') : (t('add') || 'Agregar'))}
                        </Button>
                    </Box>
                </DialogActions>
            </Dialog>
        </>
    );
};

export default CityFormModal;