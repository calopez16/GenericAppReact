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

import { DataAPIClientsService } from '@data/Clients/Data';
import { DataAPICitiesService } from '@data/Cities/Data';
import { useTranslation } from 'react-i18next';
import { ShowMessage } from '@helpers/NotificationService';

const ClientFormModal = ({ open, handleClose, data, isEditing, setData }) => {
    const { t } = useTranslation();
    const service = DataAPIClientsService();
    const citiesService = DataAPICitiesService();

    const nameRef = useRef(null);

    const [formData, setFormData] = useState({
        idClient: 0,
        name: '',
        rfc: '',
        address: '',
        idCity: null,
        postalCode: '',
        phone: '',
        notes: '',
    });

    const [isLoading, setIsLoading] = useState(false);
    const [cities, setCities] = useState([]);
    const [selectedCity, setSelectedCity] = useState(null);
    const [isCitiesLoading, setIsCitiesLoading] = useState(false);
    const [isAutocompleteOpen, setIsAutocompleteOpen] = useState(false);

    const [validationErrors, setValidationErrors] = useState({
        name: false,
    });
    const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState(false);

    const debounceTimerRef = useRef(null);
    const DEBOUNCE_TIME = 500;

    const fetchCities = async (searchTerm = "") => {
        setIsCitiesLoading(true);
        try {
            const response = await citiesService.getDataPagination(1, 100, searchTerm, true);
            if (response.success && Array.isArray(response.data.data)) {
                const cityList = response.data.data.map(city => ({
                    idCity: city.idCity,
                    name: `${city.description}, ${city.idStateNavigation?.description}, ${city.idStateNavigation?.idCountryNavigation.description}`
                }));
                setCities(cityList);
            } else {
                setCities([]);
            }
        } catch (error) {
            console.error("Error fetching cities:", error);
            setCities([]);
        } finally {
            setIsCitiesLoading(false);
        }
    };

    useEffect(() => {
        if (open) {
            fetchCities();
        }
    }, [open]);

    useEffect(() => {
        if (open) {
            if (isEditing && data) {
                const clientData = { ...data };
                setFormData({
                    idClient: clientData.idClient || 0,
                    name: clientData.name || '',
                    rfc: clientData.rfc || '',
                    address: clientData.address || '',
                    idCity: clientData.idCity || null,
                    postalCode: clientData.postalCode || '',
                    phone: clientData.phone || '',
                    notes: clientData.notes || '',
                });
            } else if (!isEditing) {
                setFormData({
                    idClient: 0,
                    name: '', rfc: '', address: '', idCity: null,
                    postalCode: '', phone: '', notes: '',
                });
            }
            setSelectedCity(null);
            setValidationErrors({ name: false });
            setHasAttemptedSubmit(false);
        }
    }, [open, isEditing, data]);

    useEffect(() => {
        if (open && formData.idCity !== null && cities.length > 0) {
            const initialCity = cities.find(city => city.idCity === formData.idCity);
            setSelectedCity(initialCity || null);
        } else if (open && formData.idCity === null) {
            setSelectedCity(null);
        }
    }, [open, cities, formData.idCity]);

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
            setValidationErrors(prev => ({
                ...prev,
                name: value.trim().length === 0
            }));
        }
    };

    const handleCityChange = (event, newValue) => {
        setSelectedCity(newValue);
        setFormData(prev => ({
            ...prev,
            idCity: newValue ? newValue.idCity : null
        }));
    };

    const handleAutocompleteOpen = () => {
        setIsAutocompleteOpen(true);
        if (cities.length <= 1 || (cities.length === 1 && selectedCity && cities[0].idCity === selectedCity.idCity)) {
            fetchCities("");
        }
    };

    const handleCityInputChange = (event, newInputValue) => {
        if (debounceTimerRef.current) {
            clearTimeout(debounceTimerRef.current);
        }

        if (newInputValue.length === 0) {
            fetchCities("");
            return;
        }

        if (newInputValue.length >= 3) {
            debounceTimerRef.current = setTimeout(() => {
                fetchCities(newInputValue);
            }, DEBOUNCE_TIME);
        }
    };

    const validateForm = () => {
        const isNameEmpty = !formData.name.trim();
        const errors = {
            name: isNameEmpty,
        };

        setValidationErrors(errors);

        return !isNameEmpty;
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

            const finalIdCity = formData.idCity ? parseInt(formData.idCity) : null;

            const clientPayload = {
                idClient: formData.idClient || 0,
                name: formData.name,
                rfc: formData.rfc,
                address: formData.address,
                idCity: finalIdCity,
                postalCode: formData.postalCode,
                phone: formData.phone,
                notes: formData.notes,
            };

            let response;
            let messageKey;
            if (isEditing) {
                response = await service.editData(clientPayload, true);
                messageKey = 'recordEditedSuccessPlural';
            } else {
                response = await service.addData(clientPayload, true);
                messageKey = 'recordAddedSuccessPlural';
            }

            if (response.responseCode === 409) {
                ShowMessage(t('dataAlreadyExists') + ": " + response.conflict, 'warning');
                return;
            }

            if (response.success) {
                const newClientData = { ...clientPayload, idClient: response.data?.idClient || clientPayload.idClient, isActive: response.data?.isActive };

                if (isEditing) {
                    setData(prevData =>
                        prevData.map(client =>
                            client.idClient === clientPayload.idClient ? { ...client, ...newClientData } : client
                        )
                    );
                } else {
                    setData(prevData => [...prevData, newClientData]);
                }
            }

            handleClose();
            ShowMessage(t(messageKey), 'success');
        } catch (error) {
            ShowMessage(t('error'), 'error');
            console.error("Error saving client:", error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            <Dialog open={open} onClose={handleClose} fullWidth maxWidth="md">
                <DialogTitle>
                    {isEditing ? t('clients_edit') : t('clients_add')}
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
                                label={t('name')}
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                inputRef={nameRef}
                                sx={{ gridColumn: { xs: 'span 1', sm: 'span 2' } }}
                                error={validationErrors.name}
                                helperText={validationErrors.name ? t('requiredField') : ''}
                            />

                            <TextField margin="normal" fullWidth label={t('rfc')} name="rfc" value={formData.rfc} onChange={handleChange} />
                            <TextField margin="normal" fullWidth label={t('phone')} name="phone" value={formData.phone} onChange={handleChange} />

                            <TextField
                                margin="normal"
                                fullWidth
                                label={t('address')}
                                name="address"
                                value={formData.address}
                                onChange={handleChange}
                                sx={{ gridColumn: { xs: 'span 1', sm: 'span 2' } }}
                            />

                            <TextField margin="normal" fullWidth label={t('postalCode')} name="postalCode" value={formData.postalCode} onChange={handleChange} />

                            <Autocomplete
                                id="city-autocomplete"
                                options={cities}
                                getOptionLabel={(option) => option.name || ""}
                                isOptionEqualToValue={(option, value) => option.idCity === value.idCity}
                                loading={isCitiesLoading}
                                value={selectedCity}
                                onChange={handleCityChange}
                                onOpen={handleAutocompleteOpen}
                                onClose={() => setIsAutocompleteOpen(false)}
                                open={isAutocompleteOpen}
                                onInputChange={handleCityInputChange}
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        margin="normal"
                                        fullWidth
                                        label={t('city')}
                                        name="idCity"
                                    />
                                )}
                            />

                            <TextField
                                margin="normal"
                                fullWidth
                                label={t('notes')}
                                name="notes"
                                value={formData.notes}
                                onChange={handleChange}
                                multiline
                                rows={4}
                                sx={{ gridColumn: { xs: 'span 1', sm: 'span 2' } }}
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
                                {(isEditing ? t('save') : t('add') )}
                            </Button>
                        </Box>
                    </DialogActions>
                </Box>
            </Dialog>
        </>
    );
};

export default ClientFormModal;