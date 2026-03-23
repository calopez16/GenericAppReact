import React, { useState, useEffect, useRef } from 'react';
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
	Button,
} from '@mui/material';
import Grid from '@mui/material/Grid';
import NatureIcon from '@mui/icons-material/Nature';
import { useTranslation } from 'react-i18next';
import { ShowMessage } from '@helpers/NotificationService';
import { DataAPIMedicalRecordsService } from '@data/MedicalRecords/Data';

const BLOOD_TYPES = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

const NonPathologicalHistorySection = ({ medicalRecord, setMedicalRecord, medicalFormData, setMedicalFormData, hasMedicalRecord, activeConsultationId, pendingNotesRef, savedFlagRef: savedCounter, hideSectionHeader }) => {
const { t } = useTranslation();
const service = DataAPIMedicalRecordsService();

const [lifestyleNote, setLifestyleNote] = useState('');
const [diabetesNote, setDiabetesNote] = useState('');
const [cancerNote, setCancerNote] = useState('');
const [savingNoteType, setSavingNoteType] = useState(null);
const originalValuesRef = useRef(null);

const handleChange = (field) => (e) => {
	setMedicalFormData(prev => ({ ...prev, [field]: e.target.value }));
};

useEffect(() => {
    if (medicalFormData && !originalValuesRef.current) {
        originalValuesRef.current = {
            smokingHabit: medicalFormData.smokingHabit,
            alcoholHabit: medicalFormData.alcoholHabit,
            drugHabit: medicalFormData.drugHabit,
            diabetesStatus: medicalFormData.diabetesStatus,
            cancerStatus: medicalFormData.cancerStatus,
        };
    }
}, [medicalFormData?.idMedicalRecord]);

useEffect(() => {
    if (!savedCounter || !medicalFormData) return;
    originalValuesRef.current = {
        smokingHabit: medicalFormData.smokingHabit,
        alcoholHabit: medicalFormData.alcoholHabit,
        drugHabit: medicalFormData.drugHabit,
        diabetesStatus: medicalFormData.diabetesStatus,
        cancerStatus: medicalFormData.cancerStatus,
    };
}, [savedCounter]);

const getFieldLabelKey = (field) => {
    const map = {
        smokingHabit: 'ch_smoking',
        alcoholHabit: 'ch_alcohol',
        drugHabit: 'ch_drugs',
        diabetesStatus: 'ch_diabetes',
        cancerStatus: 'ch_cancer',
    };
    return map[field] ?? field;
};

const handleDropdownChange = (field) => (e) => {
    const newValue = e.target.value;
    setMedicalFormData(prev => ({ ...prev, [field]: newValue }));
    if (!pendingNotesRef) return;
    const original = originalValuesRef.current?.[field] ?? '';
    if (newValue !== original) {
        const noteContent = t('ch_auto_note_change', {
            label: t(getFieldLabelKey(field)),
            from: original || t('ch_not_specified'),
            to: newValue || t('ch_not_specified'),
        });
        pendingNotesRef.current = [
            ...(pendingNotesRef.current ?? []).filter(n => n._autoField !== field),
            { noteType: getNoteType(field), content: noteContent, _autoField: field },
        ];
    } else {
        pendingNotesRef.current = (pendingNotesRef.current ?? []).filter(n => n._autoField !== field);
    }
};

const getNoteType = (field) => {
    if (field === 'diabetesStatus') return 'Diabetes';
    if (field === 'cancerStatus') return 'Cancer';
    return 'Lifestyle';
};

const notes = medicalRecord?.medicalNotes ?? [];
const lifestyleNotes = notes.filter(n => n.noteType === 'Lifestyle');
const diabetesNotes = notes.filter(n => n.noteType === 'Diabetes');
const cancerNotes = notes.filter(n => n.noteType === 'Cancer');

const getNoteValue = (noteType) => {
	if (noteType === 'Diabetes') return diabetesNote;
	if (noteType === 'Cancer') return cancerNote;
	return lifestyleNote;
};

const clearNoteValue = (noteType) => {
	if (noteType === 'Diabetes') setDiabetesNote('');
	else if (noteType === 'Cancer') setCancerNote('');
	else setLifestyleNote('');
};

const handleAddNote = async (noteType) => {
	const content = getNoteValue(noteType);
	if (!content.trim()) {
		ShowMessage(t('emptyFields'), 'warning');
		return;
	}
	if (!medicalRecord?.idMedicalRecord) return;
	setSavingNoteType(noteType);
	try {
		const res = await service.addNote(medicalRecord.idMedicalRecord, { noteType, content }, activeConsultationId);
		if (res.success && res.data) {
			setMedicalRecord(prev => ({
				...prev,
				medicalNotes: [...(prev?.medicalNotes || []), res.data],
			}));
			clearNoteValue(noteType);
			ShowMessage(t('recordAddedSuccessSingular'), 'success');
		} else {
			ShowMessage(t('error'), 'error');
		}
	} finally {
		setSavingNoteType(null);
	}
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
                                        onChange={handleDropdownChange('smokingHabit')}
                                    >
                                        <MenuItem value=""><em>{t('ch_not_specified')}</em></MenuItem>
                                        {t('ch_habit_options', { returnObjects: true }).map(o => <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>)}
                                    </TextField>
                                </Grid>
                                <Grid size={{ xs: 12, sm: 4 }}>
                                    <TextField
                                        select
                                        fullWidth
                                        label={t('ch_alcohol')}
                                        value={medicalFormData.alcoholHabit}
                                        onChange={handleDropdownChange('alcoholHabit')}
                                    >
                                        <MenuItem value=""><em>{t('ch_not_specified')}</em></MenuItem>
                                        {t('ch_habit_options', { returnObjects: true }).map(o => <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>)}
                                    </TextField>
                                </Grid>
                                <Grid size={{ xs: 12, sm: 4 }}>
                                    <TextField
                                        select
                                        fullWidth
                                        label={t('ch_drugs')}
                                        value={medicalFormData.drugHabit}
                                        onChange={handleDropdownChange('drugHabit')}
                                    >
                                        <MenuItem value=""><em>{t('ch_not_specified')}</em></MenuItem>
                                        {t('ch_habit_options', { returnObjects: true }).map(o => <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>)}
                                    </TextField>
                                </Grid>
                            </Grid>

                            {medicalFormData.lifestyleLastUpdated && (
                                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 2 }}>
                                    {t('ch_lifestyle_last_updated')}{' '}
                                    {new Date(medicalFormData.lifestyleLastUpdated).toLocaleString()}
                                </Typography>
                            )}

                            <Box sx={{ mt: 2 }}>
                                <Typography variant="subtitle2" fontWeight={700} mb={1}>{t('ch_lifestyle_notes_title')}</Typography>
                                {lifestyleNotes.length === 0 ? (
                                    <Typography variant="body2" color="text.secondary">{t('ch_no_notes')}</Typography>
                                ) : (
                                    lifestyleNotes.map(n => (
                                        <Typography key={n.idMedicalNote} variant="body2" sx={{ mb: 0.5 }}>
                                            <strong>{new Date(n.createdAt).toLocaleString()}:</strong> {n.content}
                                        </Typography>
                                    ))
                                )}
                                {hasMedicalRecord && (
                                    <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                                        <TextField
                                            fullWidth
                                            size="small"
                                            label={t('ch_add_note')}
                                            value={lifestyleNote}
                                            onChange={(e) => setLifestyleNote(e.target.value)}
                                        />
                                        <Button
                                            variant="contained"
                                            disableElevation
                                            onClick={() => handleAddNote('Lifestyle')}
                                            disabled={savingNoteType === 'Lifestyle'}
                                        >
                                            {t('add')}
                                        </Button>
                                    </Box>
                                )}
                            </Box>
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
                        onChange={handleDropdownChange('diabetesStatus')}
                    >
                        <MenuItem value=""><em>{t('ch_not_specified')}</em></MenuItem>
                        {t('ch_yesno_options', { returnObjects: true }).map(o => <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>)}
                    </TextField>
                </Grid>

                {/* Diabetes notes history */}
                <Grid size={{ xs: 12 }}>
                    <Card variant="outlined">
                        <CardContent>
                            <Typography variant="subtitle2" fontWeight={700} mb={1}>{t('ch_diabetes_notes_history')}</Typography>
                            {diabetesNotes.length === 0 ? (
                                <Typography variant="body2" color="text.secondary">{t('ch_no_notes')}</Typography>
                            ) : (
                                diabetesNotes.map(n => (
                                    <Typography key={n.idMedicalNote} variant="body2" sx={{ mb: 0.5 }}>
                                        <strong>{new Date(n.createdAt).toLocaleString()}:</strong> {n.content}
                                    </Typography>
                                ))
                            )}
                            {hasMedicalRecord && (
                                <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                                    <TextField
                                        fullWidth
                                        size="small"
                                        label={t('ch_add_note')}
                                        value={diabetesNote}
                                        onChange={(e) => setDiabetesNote(e.target.value)}
                                    />
                                    <Button
                                        variant="contained"
                                        disableElevation
                                        onClick={() => handleAddNote('Diabetes')}
                                        disabled={savingNoteType === 'Diabetes'}
                                    >
                                        {t('add')}
                                    </Button>
                                </Box>
                            )}
                        </CardContent>
                    </Card>
                </Grid>

                {/* Cancer */}
                <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                        select
                        fullWidth
                        label={t('ch_cancer')}
                        value={medicalFormData.cancerStatus}
                        onChange={handleDropdownChange('cancerStatus')}
                    >
                        <MenuItem value=""><em>{t('ch_not_specified')}</em></MenuItem>
                        {t('ch_yesno_options', { returnObjects: true }).map(o => <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>)}
                    </TextField>
                </Grid>

                {/* Cancer notes history */}
                <Grid size={{ xs: 12 }}>
                    <Card variant="outlined">
                        <CardContent>
                            <Typography variant="subtitle2" fontWeight={700} mb={1}>{t('ch_cancer_notes_history')}</Typography>
                            {cancerNotes.length === 0 ? (
                                <Typography variant="body2" color="text.secondary">{t('ch_no_notes')}</Typography>
                            ) : (
                                cancerNotes.map(n => (
                                    <Typography key={n.idMedicalNote} variant="body2" sx={{ mb: 0.5 }}>
                                        <strong>{new Date(n.createdAt).toLocaleString()}:</strong> {n.content}
                                    </Typography>
                                ))
                            )}
                            {hasMedicalRecord && (
                                <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                                    <TextField
                                        fullWidth
                                        size="small"
                                        label={t('ch_add_note')}
                                        value={cancerNote}
                                        onChange={(e) => setCancerNote(e.target.value)}
                                    />
                                    <Button
                                        variant="contained"
                                        disableElevation
                                        onClick={() => handleAddNote('Cancer')}
                                        disabled={savingNoteType === 'Cancer'}
                                    >
                                        {t('add')}
                                    </Button>
                                </Box>
                            )}
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
        </Box>
    );
};

export default NonPathologicalHistorySection;
