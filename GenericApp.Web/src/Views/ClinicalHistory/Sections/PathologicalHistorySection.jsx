import React, { useState } from 'react';
import {
Box,
TextField,
Typography,
Divider,
Avatar,
Card,
CardContent,
CardHeader,
Button,
CircularProgress,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    IconButton,
    Chip,
    List,
    ListItem,
    ListItemText,
    FormControl,
    FormLabel,
    RadioGroup,
    FormControlLabel,
    Radio,
    Switch,
    Autocomplete,
    Tooltip,
    Table,
    TableHead,
    TableBody,
    TableRow,
    TableCell,
    TableContainer,
    Paper,
    Alert,
} from '@mui/material';
import Grid from '@mui/material/Grid';
import FavoriteIcon from '@mui/icons-material/Favorite';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import ScalpelIcon from '@mui/icons-material/ContentCut';
import AllergyIcon from '@mui/icons-material/Coronavirus';
import SickIcon from '@mui/icons-material/Sick';
import SaveIcon from '@mui/icons-material/Save';
import { useTranslation } from 'react-i18next';
import { ShowMessage } from '@helpers/NotificationService';
import { DataAPIMedicalRecordsService } from '@data/MedicalRecords/Data';

const ALLERGY_SUGGESTIONS = [
    'Penicilina', 'Aspirina', 'Ibuprofeno', 'Sulfamidas', 'Látex',
    'Polen', 'Mariscos', 'Nueces', 'Leche', 'Huevo', 'Soya',
    'Trigo / Gluten', 'Ácaros del polvo', 'Hongos', 'Picadura de abeja',
    'Colorantes artificiales', 'Conservantes', 'Anestésicos locales',
];

const PathologicalHistorySection = ({ medicalRecord, setMedicalRecord, medicalFormData, setMedicalFormData, gender, activeConsultationId, hideSectionHeader }) => {
const { t } = useTranslation();
const service = DataAPIMedicalRecordsService();

const surgeries = medicalRecord?.surgeries ?? [];
const allergies = medicalRecord?.allergies ?? [];
const diseases = medicalRecord?.diseases ?? [];
const bloodPressureHistory = medicalRecord?.bloodPressureRecords ?? [];

const isFemale = gender === 'Femenino';

const [surgeryForm, setSurgeryForm] = useState({ description: '', surgeryDate: new Date().toISOString().substring(0, 10) });
const [surgeryLoading, setSurgeryLoading] = useState(null);
const [surgerySaving, setSurgerySaving] = useState(false);

// Allergy
const [allergyInput, setAllergyInput] = useState([]);
const [allergyLoading, setAllergyLoading] = useState(false);

// Disease
const [diseaseLoading, setDiseaseLoading] = useState(false);
const [newDisease, setNewDisease] = useState({ description: '', medications: '' });

// Blood pressure history
const [bpForm, setBpForm] = useState({ value: '', date: new Date().toISOString().substring(0, 10) });
const [bpSaving, setBpSaving] = useState(false);

    const hasMedicalRecord = !!medicalRecord?.idMedicalRecord;

    const noRecordWarning = (
        <Alert severity="warning" sx={{ mb: 2, borderRadius: 1.5 }}>
            {t('ch_save_first')}
        </Alert>
    );

    const updateSurgeries = (newList) =>
        setMedicalRecord(prev => ({ ...prev, surgeries: newList }));
    const updateAllergies = (newList) =>
        setMedicalRecord(prev => ({ ...prev, allergies: newList }));
    const updateDiseases = (newList) =>
        setMedicalRecord(prev => ({ ...prev, diseases: newList }));
    const updateBloodPressureHistory = (newList) =>
        setMedicalRecord(prev => ({ ...prev, bloodPressureRecords: newList }));

    // --- Surgeries ---
    const handleAddSurgery = async () => {
        if (!surgeryForm.description.trim()) {
            ShowMessage(t('emptyFields'), 'warning');
            return;
        }
        setSurgerySaving(true);
        try {
            const res = await service.addSurgery(medicalRecord.idMedicalRecord, {
                description: surgeryForm.description,
                surgeryDate: surgeryForm.surgeryDate || null,
            }, activeConsultationId);
            if (res.success && res.data) {
                setSurgeryForm({ description: '', surgeryDate: new Date().toISOString().substring(0, 10) });
                updateSurgeries([...surgeries, res.data]);
                ShowMessage(t('recordAddedSuccessSingular'), 'success');
            }
        } finally {
            setSurgerySaving(false);
        }
    };

    const handleDeleteSurgery = async (surgeryId) => {
        setSurgeryLoading(surgeryId);
        try {
            const res = await service.deleteSurgery(medicalRecord.idMedicalRecord, surgeryId);
            if (res.success) {
                updateSurgeries(surgeries.filter(s => s.idSurgery !== surgeryId));
                ShowMessage(t('recordDeleted'), 'success');
            }
        } catch {
            ShowMessage(t('error'), 'error');
        } finally {
            setSurgeryLoading(null);
        }
    };

    // --- Allergies ---
    const handleSaveAllergies = async () => {
        if (!hasMedicalRecord || allergyInput.length === 0) return;
        setAllergyLoading(true);
        try {
            const existingDescriptions = allergies.map(a => a.description?.toLowerCase());
            const newOnes = allergyInput.filter(a => !existingDescriptions.includes(a.toLowerCase()));
             const results = await Promise.all(newOnes.map(desc =>
                 service.addAllergy(medicalRecord.idMedicalRecord, { description: desc }, activeConsultationId)
             ));
            const added = results.filter(r => r.success && r.data).map(r => r.data);
            setAllergyInput([]);
            if (added.length > 0) updateAllergies([...allergies, ...added]);
            ShowMessage(t('recordAddedSuccessPlural'), 'success');
        } finally {
            setAllergyLoading(false);
        }
    };

    const handleDeleteAllergy = async (allergyId) => {
        try {
            const res = await service.deleteAllergy(medicalRecord.idMedicalRecord, allergyId);
            if (res.success) {
                updateAllergies(allergies.filter(a => a.idAllergy !== allergyId));
                ShowMessage(t('recordDeleted'), 'success');
            }
        } catch {
            ShowMessage(t('error'), 'error');
        }
    };

    // --- Diseases ---
    const handleAddDisease = async () => {
        if (!newDisease.description.trim()) {
            ShowMessage(t('emptyFields'), 'warning');
            return;
        }
        setDiseaseLoading(true);
        try {
            const res = await service.addDisease(medicalRecord.idMedicalRecord, newDisease, activeConsultationId);
            if (res.success && res.data) {
                setNewDisease({ description: '', medications: '' });
                updateDiseases([...diseases, res.data]);
                ShowMessage(t('recordAddedSuccessSingular'), 'success');
            }
        } finally {
            setDiseaseLoading(false);
        }
    };

    const handleDeleteDisease = async (diseaseId) => {
        try {
            const res = await service.deleteDisease(medicalRecord.idMedicalRecord, diseaseId);
            if (res.success) {
                updateDiseases(diseases.filter(d => d.idDisease !== diseaseId));
                ShowMessage(t('recordDeleted'), 'success');
            }
        } catch {
            ShowMessage(t('error'), 'error');
        }
    };

    const handleToggleDiseaseStatus = async (disease) => {
        setDiseaseLoading(true);
        try {
            const payload = {
                ...disease,
                isActive: !(disease.isActive ?? true),
            };
            const res = await service.updateDisease(medicalRecord.idMedicalRecord, disease.idDisease, payload, activeConsultationId);
            if (res.success && res.data) {
                const updated = diseases.map(d => (d.idDisease === disease.idDisease ? res.data : d));
                updateDiseases(updated);
                ShowMessage(t('recordEditedSuccessSingular'), 'success');
            }
        } finally {
            setDiseaseLoading(false);
        }
    };

    const handleAddBloodPressureRecord = async () => {
        if (!bpForm.value.trim()) {
            ShowMessage(t('emptyFields'), 'warning');
            return;
        }
        setBpSaving(true);
        try {
            const payload = {
                value: bpForm.value,
                recordedAt: bpForm.date ? new Date(bpForm.date).toISOString() : new Date().toISOString(),
            };
            const res = await service.addBloodPressureRecord(medicalRecord.idMedicalRecord, payload, activeConsultationId);
            if (res.success && res.data) {
                const current = medicalRecord?.bloodPressureRecords ?? [];
                const updated = [...current, res.data].sort((a, b) => new Date(b.recordedAt) - new Date(a.recordedAt));
                updateBloodPressureHistory(updated);
                setBpForm({ value: '', date: new Date().toISOString().substring(0, 10) });
                ShowMessage(t('recordAddedSuccessSingular'), 'success');
            }
        } finally {
            setBpSaving(false);
        }
    };

    return (
        <Box>
            {!hideSectionHeader && (
                <>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
                        <Avatar sx={{ bgcolor: 'error.light', borderRadius: 1.5 }}>
                            <FavoriteIcon />
                        </Avatar>
                        <Typography variant="h6" fontWeight={700}>
                            {t('ch_section_pathological')}
                        </Typography>
                    </Box>
                    <Divider sx={{ mb: 3 }} />
                </>
            )}

            {!hasMedicalRecord && noRecordWarning}

            <Grid container spacing={2.5} sx={{ opacity: hasMedicalRecord ? 1 : 0.55, pointerEvents: hasMedicalRecord ? 'auto' : 'none' }}>
                {/* Blood Pressure */}
                <Grid size={{ xs: 12 }}>
                    <Card variant="outlined">
                        <CardHeader title={<Typography fontWeight={700}>{t('ch_bp_history')}</Typography>} />
                        <CardContent>
                            <FormControl sx={{ mb: 2 }}>
                                <FormLabel>{t('ch_blood_pressure')}</FormLabel>
                                <RadioGroup
                                    row
                                    value={medicalFormData.bloodPressure}
                                    onChange={(e) => setMedicalFormData(prev => ({ ...prev, bloodPressure: e.target.value }))}
                                >
                                    <FormControlLabel value="Alta" control={<Radio />} label={t('ch_bp_high')} />
                                    <FormControlLabel value="Normal" control={<Radio />} label={t('ch_bp_normal')} />
                                    <FormControlLabel value="Baja" control={<Radio />} label={t('ch_bp_low')} />
                                </RadioGroup>
                            </FormControl>
                            <Divider sx={{ mb: 2 }} />
                            <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 1, mb: 2 }}>
                                <Table size="small">
                                    <TableHead sx={{ bgcolor: 'action.hover' }}>
                                        <TableRow>
                                            <TableCell sx={{ fontWeight: 700 }}>{t('date')}</TableCell>
                                            <TableCell sx={{ fontWeight: 700 }}>{t('ch_bp_value')}</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {bloodPressureHistory.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={2} align="center" sx={{ color: 'text.secondary', py: 3 }}>
                                                    {t('no_records_yet')}
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            bloodPressureHistory.map(bp => (
                                                <TableRow key={bp.idBloodPressureRecord} hover>
                                                    <TableCell>{bp.recordedAt ? new Date(bp.recordedAt).toLocaleDateString() : '-'}</TableCell>
                                                    <TableCell>{bp.value}</TableCell>
                                                </TableRow>
                                            ))
                                        )}
                                    </TableBody>
                                </Table>
                            </TableContainer>

                            {hasMedicalRecord && (
                                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', alignItems: 'center' }}>
                                    <TextField
                                        label={t('date')}
                                        type="date"
                                        size="small"
                                        value={bpForm.date}
                                        onChange={(e) => setBpForm(prev => ({ ...prev, date: e.target.value }))}
                                        InputLabelProps={{ shrink: true }}
                                        sx={{ minWidth: 160 }}
                                    />
                                    <TextField
                                        label={t('ch_bp_value')}
                                        size="small"
                                        value={bpForm.value}
                                        onChange={(e) => setBpForm(prev => ({ ...prev, value: e.target.value }))}
                                        sx={{ flexGrow: 1, minWidth: 160 }}
                                        inputProps={{ maxLength: 20 }}
                                    />                                  
                                    <Button
                                        variant="contained"
                                        disableElevation
                                        startIcon={bpSaving ? null : <AddIcon />}
                                        onClick={handleAddBloodPressureRecord}
                                        disabled={bpSaving}
                                    >
                                        {bpSaving ? <CircularProgress size={18} color="inherit" /> : t('add')}
                                    </Button>
                                </Box>
                            )}
                        </CardContent>
                    </Card>
                </Grid>

                {/* Pregnancy — only for female patients */}
                {isFemale && (
                <Grid size={{ xs: 12 }}>
                    <Card variant="outlined">
                        <CardContent>
                            <FormControlLabel
                                control={
                                    <Switch
                                        checked={medicalFormData.isPregnant ?? false}
                                        onChange={(e) => setMedicalFormData(prev => ({
                                            ...prev,
                                            isPregnant: e.target.checked,
                                            pregnancyMonths: e.target.checked ? prev.pregnancyMonths : '',
                                        }))}
                                    />
                                }
                                label={t('ch_is_pregnant')}
                            />
                            {medicalFormData.isPregnant && (
                                <TextField
                                    label={t('ch_pregnancy_months')}
                                    type="number"
                                    value={medicalFormData.pregnancyMonths}
                                    onChange={(e) => setMedicalFormData(prev => ({ ...prev, pregnancyMonths: e.target.value }))}
                                    size="small"
                                    sx={{ mt: 2, maxWidth: 200 }}
                                    inputProps={{ min: 1, max: 9 }}
                                />
                            )}
                        </CardContent>
                    </Card>
                </Grid>
                )}

                {/* Surgeries / Transfusions */}
                <Grid size={{ xs: 12 }}>
                    <Card variant="outlined">
                        <CardHeader
                            avatar={<Avatar sx={{ bgcolor: 'warning.light', width: 32, height: 32 }}><ScalpelIcon fontSize="small" /></Avatar>}
                            title={<Typography fontWeight={700}>{t('ch_surgeries')}</Typography>}
                        />
                        <CardContent>
                            {surgerySaving && (
                                <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
                                    <CircularProgress size={24} />
                                </Box>
                            )}
                            {!surgerySaving && (
                            <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 1 }}>
                                <Table size="small">
                                    <TableHead sx={{ bgcolor: 'action.hover' }}>
                                        <TableRow>
                                            <TableCell sx={{ fontWeight: 700 }}>{t('description')}</TableCell>
                                            <TableCell sx={{ fontWeight: 700 }}>{t('date')}</TableCell>
                                            <TableCell sx={{ fontWeight: 700, width: 60 }} align="center">{t('actions')}</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {surgeries.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={3} align="center" sx={{ color: 'text.secondary', py: 3 }}>
                                                    {t('no_records_yet')}
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            surgeries.map(s => (
                                                <TableRow key={s.idSurgery} hover>
                                                    <TableCell>{s.description}</TableCell>
                                                    <TableCell>
                                                        {s.surgeryDate ? new Date(s.surgeryDate).toLocaleDateString() : '-'}
                                                    </TableCell>
                                                    <TableCell align="center">
                                                        <Tooltip title={t('delete')}>
                                                            <IconButton color="error" size="small" onClick={() => handleDeleteSurgery(s.idSurgery)} disabled={surgeryLoading === s.idSurgery}>
                                                                {surgeryLoading === s.idSurgery ? <CircularProgress size={16} color="error" /> : <DeleteIcon fontSize="small" />}
                                                            </IconButton>
                                                        </Tooltip>
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        )}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                            )}
                            {hasMedicalRecord && (
                                <Box sx={{ mt: 2, display: 'flex', gap: 1, flexWrap: 'wrap', alignItems: 'center' }}>
                                    <TextField
                                        label={t('date')}
                                        type="date"
                                        size="small"
                                        value={surgeryForm.surgeryDate}
                                        onChange={(e) => setSurgeryForm(prev => ({ ...prev, surgeryDate: e.target.value }))}
                                        InputLabelProps={{ shrink: true }}
                                        sx={{ minWidth: 160 }}
                                    />
                                    <TextField
                                        label={t('description')}
                                        size="small"
                                        value={surgeryForm.description}
                                        onChange={(e) => setSurgeryForm(prev => ({ ...prev, description: e.target.value }))}
                                        sx={{ flexGrow: 1, minWidth: 200 }}
                                        inputProps={{ maxLength: 500 }}
                                    />
                                    <Button
                                        variant="contained"
                                        disableElevation
                                        startIcon={surgerySaving ? null : <AddIcon />}
                                        onClick={handleAddSurgery}
                                        disabled={surgerySaving}
                                    >
                                        {surgerySaving ? <CircularProgress size={18} color="inherit" /> : t('add')}
                                    </Button>
                                </Box>
                            )}
                        </CardContent>
                    </Card>
                </Grid>

                {/* Allergies */}
                <Grid size={{ xs: 12 }}>
                    <Card variant="outlined">
                        <CardHeader
                            avatar={<Avatar sx={{ bgcolor: 'secondary.light', width: 32, height: 32 }}><AllergyIcon fontSize="small" /></Avatar>}
                            title={<Typography fontWeight={700}>{t('ch_allergies')}</Typography>}
                        />
                        <CardContent>
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                                {allergies.map(a => (
                                    <Chip
                                        key={a.idAllergy}
                                        label={a.description}
                                        onDelete={() => handleDeleteAllergy(a.idAllergy)}
                                        color="secondary"
                                        variant="outlined"
                                        size="small"
                                    />
                                ))}
                            </Box>
                            {hasMedicalRecord && (
                                <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-start' }}>
                                    <Autocomplete
                                        multiple
                                        freeSolo
                                        options={ALLERGY_SUGGESTIONS}
                                        value={allergyInput}
                                        onChange={(_, val) => setAllergyInput(val)}
                                        renderTags={(value, getTagProps) =>
                                            value.map((option, index) => (
                                                <Chip variant="outlined" label={option} size="small" {...getTagProps({ index })} />
                                            ))
                                        }
                                        renderInput={(params) => (
                                            <TextField {...params} variant="outlined" size="small" label={t('ch_add_allergy')} sx={{ minWidth: 300 }} />
                                        )}
                                        sx={{ flexGrow: 1 }}
                                    />
                                    <Button
                                        variant="contained"
                                        disableElevation
                                        disabled={allergyLoading || allergyInput.length === 0}
                                        onClick={handleSaveAllergies}
                                        startIcon={<SaveIcon />}
                                    >
                                        {t('save')}
                                    </Button>
                                </Box>
                            )}
                        </CardContent>
                    </Card>
                </Grid>

                {/* Diseases */}
                <Grid size={{ xs: 12 }}>
                    <Card variant="outlined">
                        <CardHeader
                            avatar={<Avatar sx={{ bgcolor: 'info.light', width: 32, height: 32 }}><SickIcon fontSize="small" /></Avatar>}
                            title={<Typography fontWeight={700}>{t('ch_diseases')}</Typography>}
                        />
                        <CardContent>
                            <List disablePadding>
                                {diseases.map(d => (
                                    <ListItem
                                        key={d.idDisease}
                                        divider
                                        secondaryAction={
                                            <Tooltip title={t('delete')}>
                                                <IconButton edge="end" color="error" size="small" onClick={() => handleDeleteDisease(d.idDisease)}>
                                                    <DeleteIcon fontSize="small" />
                                                </IconButton>
                                            </Tooltip>
                                        }
                                    >
                                        <ListItemText
                                            primary={d.description}
                                            secondary={d.medications ? `${t('ch_medications')}: ${d.medications}` : undefined}
                                        />
                                        <Chip
                                            size="small"
                                            label={d.isActive ? t('ch_disease_active') : t('ch_disease_resolved')}
                                            color={d.isActive ? 'success' : 'default'}
                                            sx={{ ml: 1 }}
                                        />
                                        <FormControlLabel
                                            control={
                                                <Switch
                                                    checked={d.isActive ?? true}
                                                    onChange={() => handleToggleDiseaseStatus(d)}
                                                    size="small"
                                                    disabled={diseaseLoading}
                                                />
                                            }
                                            label={d.isActive ? t('active') : t('disabled')}
                                            sx={{ ml: 2 }}
                                        />
                                    </ListItem>
                                ))}
                            </List>
                            {hasMedicalRecord && (
                                <Box sx={{ mt: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                                    <TextField
                                        label={t('ch_disease')}
                                        size="small"
                                        value={newDisease.description}
                                        onChange={(e) => setNewDisease(prev => ({ ...prev, description: e.target.value }))}
                                        sx={{ flexGrow: 1, minWidth: 200 }}
                                        inputProps={{ maxLength: 250 }}
                                    />
                                    <TextField
                                        label={t('ch_medications')}
                                        size="small"
                                        value={newDisease.medications}
                                        onChange={(e) => setNewDisease(prev => ({ ...prev, medications: e.target.value }))}
                                        sx={{ flexGrow: 2, minWidth: 200 }}
                                        inputProps={{ maxLength: 500 }}
                                    />
                                    <Button
                                        variant="contained"
                                        disableElevation
                                        startIcon={<AddIcon />}
                                        disabled={diseaseLoading}
                                        onClick={handleAddDisease}
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

export default PathologicalHistorySection;
