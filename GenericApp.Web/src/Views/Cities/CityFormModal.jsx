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
    Avatar,
    Typography,
    IconButton,
    Tooltip,
    Divider,
    CircularProgress
} from '@mui/material';
import CancelIcon from '@mui/icons-material/Clear';
import SaveIcon from '@mui/icons-material/Save';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import CloseIcon from '@mui/icons-material/Close';

import { DataAPICitiesService } from '@data/Cities/Data';
import { useTranslation } from 'react-i18next';
import { ShowMessage } from '@helpers/NotificationService';

const CityFormModal = ({ open, handleClose, data, isEditing, setData }) => {
    const { t } = useTranslation();
    const dataService = DataAPICitiesService();

    const descriptionRef = useRef(null);

    const [formData, setFormData] = useState({
        idCity: 0,
        description: '',
        idState: null
    });

    const [isLoading, setIsLoading] = useState(false);
    const [states, setStates] = useState([]);
    const [selectedState, setSelectedState] = useState(null);
    const [isStatesLoading, setIsStatesLoading] = useState(false);
    const [isAutocompleteOpen, setIsAutocompleteOpen] = useState(false);

    const [validationErrors, setValidationErrors] = useState({
        description: false,
        idState: false,
    });
    const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState(false);

    const debounceTimerRef = useRef(null);
    const DEBOUNCE_TIME = 500;

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

    useEffect(() => {
        if (open) {
            fetchStates();
        }
    }, [open]);

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
            setSelectedState(null);
            setValidationErrors({ description: false, idState: false });
            setHasAttemptedSubmit(false);
        }
    }, [open, isEditing, data]);

    useEffect(() => {
        if (open && formData.idState !== null && states.length > 0) {
            const initialState = states.find(state => state.id === formData.idState);
            setSelectedState(initialState || null);
        } else if (open && formData.idState === null) {
            setSelectedState(null);
        }
    }, [open, states, formData.idState]);

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

    const validateForm = () => {
        const errors = {
            description: !formData.description.trim(),
            idState: formData.idState === null || formData.idState === 0,
        };

        setValidationErrors(errors);

        return !errors.description && !errors.idState;
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
                ShowMessage(t('dataAlreadyExists') + ": " + response.conflict, 'warning');
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

    return (
        <>
            <Dialog open={open} onClose={handleClose} fullWidth maxWidth="md" PaperProps={{ sx: { borderRadius: 3 } }}>
                <form onSubmit={handleSubmit} noValidate>
                <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', py: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Avatar sx={{ bgcolor: 'primary.light', color: 'white', width: 42, height: 42, borderRadius: 2 }}>
                            {isEditing ? <EditIcon /> : <AddIcon />}
                        </Avatar>
                        <Box>
                            <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
                                {isEditing ? t('city_edit') : t('city_add')}
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

                <Box component="div">
                    <DialogContent>
                        <Box
                            sx={{
                                mt: 1,
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
                                inputProps={{ maxLength: 150 }}
                            />

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
                                        label={t('state')}
                                        name="idState"
                                        error={validationErrors.idState}
                                        helperText={validationErrors.idState ? t('requiredField') : ''}
                                    />
                                )}
                            />
                        </Box>
                    </DialogContent>
                </Box>

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
        </>
    );
};

export default CityFormModal;