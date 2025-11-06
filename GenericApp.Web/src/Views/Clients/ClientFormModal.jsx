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

    const [formData, setFormData] = useState({
        idClient: 0,
        name: '',
        rfc: '',
        address: '',
        idCity: 0,
        postalCode: '',
        phone: '',
        notes: '',
    });

    const [isLoading, setIsLoading] = useState(false);
    const [cities, setCities] = useState([]);
    const [selectedCity, setSelectedCity] = useState(null);
    const [isCitiesLoading, setIsCitiesLoading] = useState(false);
    const [isAutocompleteOpen, setIsAutocompleteOpen] = useState(false);

    const debounceTimerRef = useRef(null);
    const DEBOUNCE_TIME = 500;

    // --- Lógica de Carga de Ciudades ---
    const fetchCities = async (searchTerm = "") => {
        setIsCitiesLoading(true);
        try {
            const response = await citiesService.getDataPagination(1, 100, searchTerm);
            if (response.success && Array.isArray(response.data.data)) {
                const cityList = response.data.data.map(city => ({
                    idCity: city.idCity,
                    name: city.description
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

    // ... (Efectos y Handlers de Estado sin cambios)
    useEffect(() => {
        if (open) {
            fetchCities();
        }
    }, [open]);

    useEffect(() => {
        if (isEditing && data) {
            const cityData = { ...data };
            setFormData({
                idClient: cityData.idClient || 0,
                name: cityData.name || '',
                rfc: cityData.rfc || '',
                address: cityData.address || '',
                idCity: cityData.idCity || 0,
                postalCode: cityData.postalCode || '',
                phone: cityData.phone || '',
                notes: cityData.notes || '',
            });
        } else if (!isEditing) {
            setFormData({
                idClient: 0,
                name: '', rfc: '', address: '', idCity: 0,
                postalCode: '', phone: '', notes: '',
            });
        }
        setSelectedCity(null);
    }, [open, isEditing, data]);

    useEffect(() => {
        if (open && formData.idCity !== 0 && cities.length > 0) {
            const initialCity = cities.find(city => city.idCity === formData.idCity);
            setSelectedCity(initialCity || null);
        } else if (open && formData.idCity === 0) {
            setSelectedCity(null);
        }
    }, [open, cities, formData.idCity]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleCityChange = (event, newValue) => {
        setSelectedCity(newValue);
        setFormData(prev => ({
            ...prev,
            idCity: newValue ? newValue.idCity : 0
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

    const handleSubmit = async () => {
        if (!formData.name) {
            ShowMessage(t('NameIsRequired') || 'El nombre es requerido.', 'warning');
            return;
        }

        try {
            setIsLoading(true);

            const finalIdCity = formData.idCity ? parseInt(formData.idCity) : 0;

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
                ShowMessage(t('daraAlreadyExists') + ": " + response.conflict, 'warning');
                return;
            }

            if (response.success) {
                if (isEditing) {
                    setData(prevData =>
                        prevData.map(client =>
                            client.idClient === clientPayload.idClient ? { ...client, ...clientPayload } : client
                        )
                    );
                } else {
                    setData(prevData => [...prevData, { ...clientPayload, idClient: response.data.idClient, isActive:response.data.isActive }]);
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

    // ----------------------------------------------------------------

    return (
        <>
            <Dialog open={open} onClose={handleClose} fullWidth maxWidth="md">
                <DialogTitle>
                    {isEditing ? t('editClient') : t('addClient')}
                </DialogTitle>
                <DialogContent>
                    {/* 🌟 AJUSTE RESPONSIVO EN EL BOX: En pantallas pequeñas (<600px) solo habrá 1 columna */}
                    <Box
                        component="form"
                        noValidate
                        sx={{
                            mt: 2,
                            display: 'grid',
                            // En sm (o menor) usa 1 columna; en md o mayor usa hasta 2.
                            gridTemplateColumns: {
                                xs: '1fr', // 1 columna para pantallas pequeñas (móviles)
                                sm: 'repeat(auto-fit, minmax(300px, 1fr))' // 2 columnas o más para tablet/desktop
                            },
                            gap: 2
                        }}
                    >

                        {/* Los campos que deben ocupar todo el ancho en desktop (gridColumn: 'span 2')
                           ahora usarán la sintaxis de breakpoints: {xs: 'span 1', sm: 'span 2'} */}

                        {/* NAME */}
                        <TextField
                            margin="normal"
                            required
                            fullWidth
                            label={t('Name')}
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            // 🌟 AJUSTE RESPONSIVO: Ocupa todo el ancho en móvil (xs: 'span 1') y todo el ancho en desktop (sm: 'span 2')
                            sx={{ gridColumn: { xs: 'span 1', sm: 'span 2' } }}
                            error={!formData.name}
                            helperText={!formData.name ? (t('NameIsRequired') || 'El nombre es requerido.') : ''}
                        />

                        {/* RFC y PHONE (Se quedan como están, ocupan 1 columna por defecto) */}
                        <TextField margin="normal" fullWidth label={t('Rfc')} name="rfc" value={formData.rfc} onChange={handleChange} />
                        <TextField margin="normal" fullWidth label={t('Phone')} name="phone" value={formData.phone} onChange={handleChange} />

                        {/* ADDRESS */}
                        <TextField
                            margin="normal"
                            fullWidth
                            label={t('Address')}
                            name="address"
                            value={formData.address}
                            onChange={handleChange}
                            // 🌟 AJUSTE RESPONSIVO
                            sx={{ gridColumn: { xs: 'span 1', sm: 'span 2' } }}
                        />

                        {/* POSTAL CODE y CITY (Se quedan como están, ocupan 1 columna por defecto) */}
                        <TextField margin="normal" fullWidth label={t('PostalCode')} name="postalCode" value={formData.postalCode} onChange={handleChange} />

                        {/* CITY AUTOCOMPLETE */}
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
                                    label={t('IdCity')}
                                    name="idCity"
                                />
                            )}
                        />

                        {/* NOTES */}
                        <TextField
                            margin="normal"
                            fullWidth
                            label={t('Notes')}
                            name="notes"
                            value={formData.notes}
                            onChange={handleChange}
                            multiline
                            rows={4}
                            // 🌟 AJUSTE RESPONSIVO
                            sx={{ gridColumn: { xs: 'span 1', sm: 'span 2' } }}
                        />

                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button color="error" variant="outlined" endIcon={<CancelIcon />} onClick={handleClose}>
                        {t('cancel')}
                    </Button>
                    <Button color="primary" variant="contained" endIcon={isEditing ? <SaveIcon /> : <AddIcon />} onClick={handleSubmit} disabled={isLoading || isCitiesLoading}>
                        {isEditing ? t('save') : t('add')}
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
};

export default ClientFormModal;