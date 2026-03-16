import React from 'react';
import {
    Box,
    TextField,
    Typography,
    Divider,
    Avatar,
    MenuItem,
    Card,
    CardContent,
    Alert,
} from '@mui/material';
import Grid from '@mui/material/Grid';
import NatureIcon from '@mui/icons-material/Nature';
import { useTranslation } from 'react-i18next';

const BLOOD_TYPES = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
const HABIT_OPTIONS = ['Nunca', 'Ocasional', 'Moderado', 'Frecuente'];
const YES_NO_OPTIONS = ['No', 'Sí', 'Antecedentes familiares'];

const NonPathologicalHistorySection = ({ medicalFormData, setMedicalFormData, hasMedicalRecord, hideSectionHeader }) => {
const { t } = useTranslation();

const handleChange = (field) => (e) => {
    setMedicalFormData(prev => ({ ...prev, [field]: e.target.value }));
};

return (
    <Box>
        {!hideSectionHeader && (
            <>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
                    <Avatar sx={{ bgcolor: 'success.light', borderRadius: 1.5 }}>
                        <NatureIcon />
                    </Avatar>
                    <Typography variant="h6" fontWeight={700}>
                        {t('ch_section_nonpathological')}
                    </Typography>
                </Box>
                <Divider sx={{ mb: 3 }} />
            </>
        )}

        {!hasMedicalRecord && (
            <Alert severity="warning" sx={{ mb: 2, borderRadius: 1.5 }}>
                {t('ch_save_first')}
            </Alert>
        )}

        <Grid container spacing={2.5} sx={{ opacity: hasMedicalRecord ? 1 : 0.55, pointerEvents: hasMedicalRecord ? 'auto' : 'none' }}>
                {/* Blood Type */}
                <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                    <TextField
                        select
                        fullWidth
                        label={t('ch_blood_type')}
                        value={medicalFormData.bloodType}
                        onChange={handleChange('bloodType')}
                        variant="outlined"
                    >
                        <MenuItem value=""><em>{t('ch_not_specified')}</em></MenuItem>
                        {BLOOD_TYPES.map(bt => (
                            <MenuItem key={bt} value={bt}>{bt}</MenuItem>
                        ))}
                    </TextField>
                </Grid>

                {/* Lifestyle */}
                <Grid size={{ xs: 12 }}>
                    <Card variant="outlined">
                        <CardContent>
                            <Typography variant="subtitle2" fontWeight={700} mb={2}>{t('ch_lifestyle')}</Typography>
                            <Grid container spacing={2}>
                                <Grid size={{ xs: 12, sm: 4 }}>
                                    <TextField
                                        select
                                        fullWidth
                                        label={t('ch_smoking')}
                                        value={medicalFormData.smokingHabit}
                                        onChange={handleChange('smokingHabit')}
                                    >
                                        <MenuItem value=""><em>{t('ch_not_specified')}</em></MenuItem>
                                        {HABIT_OPTIONS.map(o => <MenuItem key={o} value={o}>{o}</MenuItem>)}
                                    </TextField>
                                </Grid>
                                <Grid size={{ xs: 12, sm: 4 }}>
                                    <TextField
                                        select
                                        fullWidth
                                        label={t('ch_alcohol')}
                                        value={medicalFormData.alcoholHabit}
                                        onChange={handleChange('alcoholHabit')}
                                    >
                                        <MenuItem value=""><em>{t('ch_not_specified')}</em></MenuItem>
                                        {HABIT_OPTIONS.map(o => <MenuItem key={o} value={o}>{o}</MenuItem>)}
                                    </TextField>
                                </Grid>
                                <Grid size={{ xs: 12, sm: 4 }}>
                                    <TextField
                                        select
                                        fullWidth
                                        label={t('ch_drugs')}
                                        value={medicalFormData.drugHabit}
                                        onChange={handleChange('drugHabit')}
                                    >
                                        <MenuItem value=""><em>{t('ch_not_specified')}</em></MenuItem>
                                        {HABIT_OPTIONS.map(o => <MenuItem key={o} value={o}>{o}</MenuItem>)}
                                    </TextField>
                                </Grid>
                            </Grid>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Diabetes */}
                <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                        select
                        fullWidth
                        label={t('ch_diabetes')}
                        value={medicalFormData.diabetesStatus}
                        onChange={handleChange('diabetesStatus')}
                    >
                        <MenuItem value=""><em>{t('ch_not_specified')}</em></MenuItem>
                        {YES_NO_OPTIONS.map(o => <MenuItem key={o} value={o}>{o}</MenuItem>)}
                    </TextField>
                </Grid>
                {medicalFormData.diabetesStatus && medicalFormData.diabetesStatus !== 'No' && (
                    <Grid size={{ xs: 12, sm: 6 }}>
                        <TextField
                            fullWidth
                            label={t('ch_diabetes_notes')}
                            value={medicalFormData.diabetesNotes}
                            onChange={handleChange('diabetesNotes')}
                            multiline
                            rows={2}
                            inputProps={{ maxLength: 500 }}
                        />
                    </Grid>
                )}

                {/* Cancer */}
                <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                        select
                        fullWidth
                        label={t('ch_cancer')}
                        value={medicalFormData.cancerStatus}
                        onChange={handleChange('cancerStatus')}
                    >
                        <MenuItem value=""><em>{t('ch_not_specified')}</em></MenuItem>
                        {YES_NO_OPTIONS.map(o => <MenuItem key={o} value={o}>{o}</MenuItem>)}
                    </TextField>
                </Grid>
                {medicalFormData.cancerStatus && medicalFormData.cancerStatus !== 'No' && (
                    <Grid size={{ xs: 12, sm: 6 }}>
                        <TextField
                            fullWidth
                            label={t('ch_cancer_notes')}
                            value={medicalFormData.cancerNotes}
                            onChange={handleChange('cancerNotes')}
                            multiline
                            rows={2}
                            inputProps={{ maxLength: 500 }}
                        />
                    </Grid>
                )}
            </Grid>
        </Box>
    );
};

export default NonPathologicalHistorySection;
