import React from 'react';
import {
    Box,
    Grid,
    TextField,
    Typography,
    Divider,
    Avatar,
    Chip,
} from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import { useTranslation } from 'react-i18next';

const ReadOnlyField = ({ label, value }) => (
    <TextField
        label={label}
        value={value || ''}
        variant="outlined"
        fullWidth
        InputProps={{ readOnly: true }}
        InputLabelProps={{ shrink: true }}
        sx={{ '& .MuiInputBase-input': { color: 'text.primary' } }}
    />
);

const PatientProfileSection = ({ client }) => {
    const { t } = useTranslation();

    const birthDateFormatted = client?.birthDate
        ? new Date(client.birthDate).toLocaleDateString()
        : '';

    return (
        <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
                <Avatar sx={{ bgcolor: 'primary.light', borderRadius: 1.5 }}>
                    <PersonIcon />
                </Avatar>
                <Box>
                    <Typography variant="h6" fontWeight={700}>
                        {t('ch_section_profile')}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        {t('ch_section_profile_desc')}
                    </Typography>
                </Box>
                <Chip label={t('ch_readonly')} size="small" color="info" variant="outlined" sx={{ ml: 'auto' }} />
            </Box>

            <Divider sx={{ mb: 3 }} />

            <Grid container spacing={2}>
                <Grid item xs={12}>
                    <ReadOnlyField label={t('name')} value={client?.name} />
                </Grid>
                <Grid item xs={12} sm={6}>
                    <ReadOnlyField label={t('birthDate')} value={birthDateFormatted} />
                </Grid>
                <Grid item xs={12} sm={6}>
                    <ReadOnlyField label={t('phone')} value={client?.phone} />
                </Grid>
                <Grid item xs={12}>
                    <ReadOnlyField label={t('address')} value={client?.address} />
                </Grid>
                <Grid item xs={12} sm={6}>
                    <ReadOnlyField label={t('maritalState')} value={client?.maritalState} />
                </Grid>
                <Grid item xs={12} sm={6}>
                    <ReadOnlyField label={t('ocupation')} value={client?.ocupation} />
                </Grid>
                <Grid item xs={12} sm={6}>
                    <ReadOnlyField label={t('education')} value={client?.education} />
                </Grid>
                <Grid item xs={12} sm={6}>
                    <ReadOnlyField label={t('profession')} value={client?.profession} />
                </Grid>
                <Grid item xs={12} sm={6}>
                    <ReadOnlyField label={t('religion')} value={client?.religion} />
                </Grid>
                <Grid item xs={12} sm={6}>
                    <ReadOnlyField label={t('city')} value={client?.idCityNavigation
                        ? `${client.idCityNavigation.description}`
                        : ''} />
                </Grid>
                {client?.notes && (
                    <Grid item xs={12}>
                        <ReadOnlyField label={t('notes')} value={client?.notes} />
                    </Grid>
                )}
            </Grid>
        </Box>
    );
};

export default PatientProfileSection;
