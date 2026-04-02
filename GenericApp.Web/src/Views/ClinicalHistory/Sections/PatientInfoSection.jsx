import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { TextField, Autocomplete, CircularProgress, MenuItem, FormControlLabel, Checkbox } from '@mui/material';
import Grid from '@mui/material/Grid';
import { useTranslation } from 'react-i18next';
import { DataAPICitiesService } from '@data/Cities/Data';
import { DataAPIClientsService } from '@data/Clients/Data';

const REQUIRED_FIELDS = ['name', 'birthDate', 'gender', 'idMaritalStatus'];

const initialErrors = { name: false, birthDate: false, gender: false, idMaritalStatus: false };

const PatientInfoSection = forwardRef(({ clientForm, setClientForm }, ref) => {
    const { t } = useTranslation();
    const citiesService = DataAPICitiesService();
    const clientsService = DataAPIClientsService();

    const [cities, setCities] = useState([]);
    const [selectedCity, setSelectedCity] = useState(null);
    const [isCitiesLoading, setIsCitiesLoading] = useState(false);
    const [genderOptions, setGenderOptions] = useState([]);
    const [maritalOptions, setMaritalOptions] = useState([]);
    const [isCatalogLoading, setIsCatalogLoading] = useState(false);
    const debounceRef = useRef(null);

    const [errors, setErrors] = useState(initialErrors);
    const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState(false);

    const validateAll = (form) => {
        return {
            name: !form?.name?.trim(),
            birthDate: !form?.birthDate,
            gender: !form?.gender,
            idMaritalStatus: form?.idMaritalStatus === null || form?.idMaritalStatus === undefined || form?.idMaritalStatus === '',
        };
    };

    useImperativeHandle(ref, () => ({
        validate() {
            setHasAttemptedSubmit(true);
            const newErrors = validateAll(clientForm);
            setErrors(newErrors);
            return !Object.values(newErrors).some(Boolean);
        },
    }));

    const fetchCatalogOptions = async () => {
        setIsCatalogLoading(true);
        try {
            const res = await clientsService.getCatalogOptions();
            if (res.success) {
                setGenderOptions(Array.isArray(res.data?.genders) ? res.data.genders : []);
                setMaritalOptions(Array.isArray(res.data?.maritalStates) ? res.data.maritalStates : []);
            }
        } finally {
            setIsCatalogLoading(false);
        }
    };

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
        fetchCatalogOptions();
    }, []);

    useEffect(() => {
        if (clientForm?.idCity && cities.length > 0) {
            const found = cities.find(c => c.idCity === clientForm.idCity);
            setSelectedCity(found ?? null);
        }
    }, [clientForm?.idCity, cities]);

    const handleField = (field) => (e) => {
        const value = e.target.value;
        setClientForm(prev => {
            const updated = { ...prev, [field]: value };
            // When birthDate changes, auto-suggest child flag based on age < 15
            if (field === 'birthDate' && value) {
                const age = Math.floor((new Date() - new Date(value)) / (365.25 * 24 * 60 * 60 * 1000));
                updated.child = age >= 0 && age < 15;
            }
            return updated;
        });
        if (hasAttemptedSubmit && REQUIRED_FIELDS.includes(field)) {
            setErrors(prev => ({
                ...prev,
                [field]: field === 'idMaritalStatus'
                    ? value === null || value === undefined || value === ''
                    : !value?.trim?.(),
            }));
        }
    };

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
                    error={errors.name}
                    helperText={errors.name ? t('requiredField') : ''}
                />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
                <TextField
                    fullWidth required
                    label={t('birthDate')}
                    type="date"
                    value={clientForm.birthDate ?? ''}
                    onChange={handleField('birthDate')}
                    InputLabelProps={{ shrink: true }}
                    error={errors.birthDate}
                    helperText={errors.birthDate ? t('requiredField') : ''}
                />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
                <TextField
                    select
                    fullWidth required
                    label={t('gender')}
                    value={clientForm.gender ?? ''}
                    onChange={handleField('gender')}
                    disabled={isCatalogLoading}
                    error={errors.gender}
                    helperText={errors.gender ? t('requiredField') : ''}
                >
                    <MenuItem value="">{t('select')}</MenuItem>
                    {genderOptions.map(o => <MenuItem key={o} value={o}>{o}</MenuItem>)}
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
                    fullWidth required
                    label={t('maritalState')}
                    value={clientForm.idMaritalStatus ?? ''}
                    onChange={handleField('idMaritalStatus')}
                    disabled={isCatalogLoading}
                    error={errors.idMaritalStatus}
                    helperText={errors.idMaritalStatus ? t('requiredField') : ''}
                >
                    <MenuItem value="">{t('select')}</MenuItem>
                    {maritalOptions.map(o => <MenuItem key={o.idMaritalStatus} value={o.idMaritalStatus}>{o.description}</MenuItem>)}
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
            <Grid size={{ xs: 12 }}>
                <FormControlLabel
                    control={
                        <Checkbox
                            checked={!!clientForm.child}
                            onChange={(e) => setClientForm(prev => ({ ...prev, child: e.target.checked }))}
                            color="primary"
                        />
                    }
                    label={t('ch_child_patient')}
                />
            </Grid>
        </Grid>
    );
});

PatientInfoSection.displayName = 'PatientInfoSection';

export default PatientInfoSection;
