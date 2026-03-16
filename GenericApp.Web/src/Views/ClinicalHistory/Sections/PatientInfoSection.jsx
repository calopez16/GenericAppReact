import React, { useState, useEffect, useRef, useContext } from 'react';
import { TextField, Autocomplete, CircularProgress, MenuItem } from '@mui/material';
import Grid from '@mui/material/Grid';
import { useTranslation } from 'react-i18next';
import { AppContext } from '@helpers/AppContext';
import { DataAPICitiesService } from '@data/Cities/Data';

const MARITAL_OPTIONS = ['Soltero(a)', 'Casado(a)', 'Divorciado(a)', 'Viudo(a)', 'Unión libre'];
const GENDER_OPTIONS = ['Masculino', 'Femenino'];

const PatientInfoSection = ({ clientForm, setClientForm }) => {
    const { t } = useTranslation();
    const citiesService = DataAPICitiesService();

    const [cities, setCities] = useState([]);
    const [selectedCity, setSelectedCity] = useState(null);
    const [isCitiesLoading, setIsCitiesLoading] = useState(false);
    const debounceRef = useRef(null);

    const fetchCities = async (search = '') => {
        setIsCitiesLoading(true);
        try {
            const res = await citiesService.getDataPagination(1, 100, search, true);
            if (res.success && Array.isArray(res.data?.data)) {
                const list = res.data.data.map(c => ({
                    idCity: c.idCity,
                    label: `${c.description}, ${c.idStateNavigation?.description}, ${c.idStateNavigation?.idCountryNavigation?.description}`,
                }));
                setCities(list);
                if (clientForm?.idCity) {
                    const found = list.find(c => c.idCity === clientForm.idCity);
                    if (found) setSelectedCity(found);
                }
            }
        } finally {
            setIsCitiesLoading(false);
        }
    };

    useEffect(() => {
        fetchCities();
    }, []);

    useEffect(() => {
        if (clientForm?.idCity && cities.length > 0) {
            const found = cities.find(c => c.idCity === clientForm.idCity);
            setSelectedCity(found ?? null);
        }
    }, [clientForm?.idCity, cities]);

    const handleField = (field) => (e) =>
        setClientForm(prev => ({ ...prev, [field]: e.target.value }));

    const handleCityInput = (_, value) => {
        clearTimeout(debounceRef.current);
        if (!value || value.length === 0) { fetchCities(''); return; }
        if (value.length >= 3) {
            debounceRef.current = setTimeout(() => fetchCities(value), 400);
        }
    };

    const handleCityChange = (_, newValue) => {
        setSelectedCity(newValue);
        setClientForm(prev => ({ ...prev, idCity: newValue?.idCity ?? null }));
    };

    if (!clientForm) return null;

    return (
        <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 4 }}>
                <TextField
                    fullWidth required
                    label={t('name')}
                    value={clientForm.name}
                    onChange={handleField('name')}
                    inputProps={{ maxLength: 150 }}
                />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
                <TextField
                    fullWidth
                    label={t('birthDate')}
                    type="date"
                    value={clientForm.birthDate}
                    onChange={handleField('birthDate')}
                    InputLabelProps={{ shrink: true }}
                />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
                <TextField
                    select
                    fullWidth
                    label={t('gender')}
                    value={clientForm.gender ?? ''}
                    onChange={handleField('gender')}
                >
                    <MenuItem value=""><em>—</em></MenuItem>
                    {GENDER_OPTIONS.map(o => <MenuItem key={o} value={o}>{o}</MenuItem>)}
                </TextField>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                    fullWidth
                    label={t('phone')}
                    value={clientForm.phone}
                    onChange={handleField('phone')}
                    inputProps={{ maxLength: 30 }}
                />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                    select
                    fullWidth
                    label={t('maritalState')}
                    value={clientForm.maritalState}
                    onChange={handleField('maritalState')}
                >
                    <MenuItem value=""><em>—</em></MenuItem>
                    {MARITAL_OPTIONS.map(o => <MenuItem key={o} value={o}>{o}</MenuItem>)}
                </TextField>
            </Grid>
            <Grid size={{ xs: 12 }}>
                <TextField
                    fullWidth
                    label={t('address')}
                    value={clientForm.address}
                    onChange={handleField('address')}
                    inputProps={{ maxLength: 250 }}
                />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
                <Autocomplete
                    options={cities}
                    getOptionLabel={(o) => o.label ?? ''}
                    isOptionEqualToValue={(o, v) => o.idCity === v.idCity}
                    value={selectedCity}
                    onChange={handleCityChange}
                    onInputChange={handleCityInput}
                    loading={isCitiesLoading}
                    renderInput={(params) => (
                        <TextField
                            {...params}
                            label={t('city')}
                            InputProps={{
                                ...params.InputProps,
                                endAdornment: (
                                    <>
                                        {isCitiesLoading && <CircularProgress size={16} />}
                                        {params.InputProps.endAdornment}
                                    </>
                                ),
                            }}
                        />
                    )}
                />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                    fullWidth
                    label={t('ocupation')}
                    value={clientForm.ocupation}
                    onChange={handleField('ocupation')}
                    inputProps={{ maxLength: 100 }}
                />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                    fullWidth
                    label={t('education')}
                    value={clientForm.education}
                    onChange={handleField('education')}
                    inputProps={{ maxLength: 100 }}
                />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                    fullWidth
                    label={t('profession')}
                    value={clientForm.profession}
                    onChange={handleField('profession')}
                    inputProps={{ maxLength: 100 }}
                />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                    fullWidth
                    label={t('religion')}
                    value={clientForm.religion}
                    onChange={handleField('religion')}
                    inputProps={{ maxLength: 100 }}
                />
            </Grid>
            <Grid size={{ xs: 12 }}>
                <TextField
                    fullWidth multiline rows={2}
                    label={t('notes')}
                    value={clientForm.notes}
                    onChange={handleField('notes')}
                    inputProps={{ maxLength: 500 }}
                />
            </Grid>
        </Grid>
    );
};

export default PatientInfoSection;
