import React, { useState, useEffect, useContext, useRef } from 'react';
import {
    Box, Typography, Paper, Button, Avatar, LinearProgress,
    TextField, IconButton, Tooltip, Divider, CircularProgress, Chip, Tabs, Tab, Alert, MenuItem
} from '@mui/material';
import Grid from '@mui/material/Grid';
import EventNoteIcon from '@mui/icons-material/EventNote';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import SearchIcon from '@mui/icons-material/Search';
import PersonIcon from '@mui/icons-material/Person';
import SaveIcon from '@mui/icons-material/Save';
import FavoriteIcon from '@mui/icons-material/Favorite';
import NatureIcon from '@mui/icons-material/Nature';
import ChildCareIcon from '@mui/icons-material/ChildCare';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { AppContext } from '@helpers/AppContext';
import { ShowMessage } from '@helpers/NotificationService';
import { DataAPIClientsService } from '@data/Clients/Data';
import { DataAPIConsultationsService } from '@data/Consultations/Data';
import { DataAPIMedicalRecordsService } from '@data/MedicalRecords/Data';
import EmptyData from '@layout/EmptyData';
import DentalChart from '@views/Consultations/DentalChart';
import PatientInfoSection from '@views/ClinicalHistory/Sections/PatientInfoSection';
import PathologicalHistorySection from '@views/ClinicalHistory/Sections/PathologicalHistorySection';
import NonPathologicalHistorySection from '@views/ClinicalHistory/Sections/NonPathologicalHistorySection';

function PatientBanner({ client }) {
    const { t } = useTranslation();
    if (!client) return null;
    const age = client.birthDate
        ? Math.floor((new Date() - new Date(client.birthDate)) / (365.25 * 24 * 60 * 60 * 1000))
        : null;
    return (
        <Paper variant="outlined" sx={{ p: 1.5, mb: 2, borderRadius: 2, display: 'flex', alignItems: 'center', gap: 1.5, bgcolor: 'primary.50' }}>
            <Avatar sx={{ width: 36, height: 36, bgcolor: 'primary.main' }}>
                <PersonIcon fontSize="small" />
            </Avatar>
            <Box sx={{ flexGrow: 1 }}>
                <Typography variant="subtitle2" fontWeight={700}>{client.name}</Typography>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 0.3 }}>
                    {age !== null && (
                        <Chip label={`${age} ${t('ch_years')}`} size="small" variant="outlined" color="primary" sx={{ height: 18, fontSize: 11 }} />
                    )}
                    {client.gender && (
                        <Chip label={client.gender} size="small" variant="outlined" color="primary" sx={{ height: 18, fontSize: 11 }} />
                    )}
                    {client.child && (
                        <Chip icon={<ChildCareIcon sx={{ fontSize: 13 }} />} label={t('ch_child_patient')} size="small" variant="outlined" color="warning" sx={{ height: 18, fontSize: 11 }} />
                    )}
                </Box>
            </Box>
        </Paper>
    );
}

function NewConsultationPage() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const clientService = DataAPIClientsService();
    const consultService = DataAPIConsultationsService();
    const medicalService = DataAPIMedicalRecordsService();
    const { companySelected } = useContext(AppContext);

    // Step: 1=select patient, 2=clinical history, 3=consultation form
    const [step, setStep] = useState(1);

    // Step 1: client search
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [clients, setClients] = useState([]);
    const [searchLoading, setSearchLoading] = useState(false);
    const [selectedClient, setSelectedClient] = useState(null);

    // Step 2: clinical history
    const [historyLoading, setHistoryLoading] = useState(false);
    const [clientForm, setClientForm] = useState(null);
    const [medicalRecord, setMedicalRecord] = useState(null);
    const [medicalFormData, setMedicalFormData] = useState(null);
    const [isSavingHistory, setIsSavingHistory] = useState(false);
    const [historyTab, setHistoryTab] = useState(0);
    const pendingNotesRef = useRef([]);
    const [savedCounter, setSavedCounter] = useState(0);

    // Step 3: dental procedures
    const [dentalProcedures, setDentalProcedures] = useState([]);
    const [catalogTreatments, setCatalogTreatments] = useState([]);
    const [catalogLoading, setCatalogLoading] = useState(false);

    // Step 3: consultation form
    const [form, setForm] = useState({
        consultationDate: new Date().toISOString().substring(0, 10),
        reason: '',
        currentCondition: '',
        physicalExam: '',
        diagnosis: '',
        treatment: '',
        idOralHygiene: '',
    });
    const [oralHygieneOptions, setOralHygieneOptions] = useState([]);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => setDebouncedSearch(searchTerm), 400);
        return () => clearTimeout(timer);
    }, [searchTerm]);

    useEffect(() => {
        if (step === 3 && catalogTreatments.length === 0) {
            setCatalogLoading(true);
            consultService.getCatalogOptions()
                .then(res => {
                    if (res.success && res.data) {
                        setCatalogTreatments(res.data.treatments ?? []);
                        setOralHygieneOptions(res.data.oralHygienes ?? []);
                    }
                })
                .finally(() => setCatalogLoading(false));
        }
    }, [step]);

    useEffect(() => {
        if (debouncedSearch.trim().length < 2) { setClients([]); return; }
        searchClients();
    }, [debouncedSearch]);

    const searchClients = async () => {
        setSearchLoading(true);
        try {
            const res = await clientService.getDataPagination(1, 10, debouncedSearch);
            if (res.success && res.data) setClients(res.data.data ?? []);
        } finally {
            setSearchLoading(false);
        }
    };

    const handleSelectClient = async (c) => {
        setSelectedClient(c);
        setClients([]);
        setSearchTerm('');
        setStep(2);
        setHistoryLoading(true);
        try {
            const [clientRes, mrRes] = await Promise.all([
                clientService.getDataById(c.idClient),
                medicalService.getByClientId(c.idClient),
            ]);
            if (clientRes.success && clientRes.data) {
                const cd = clientRes.data;
                setClientForm({
                    idClient: cd.idClient,
                    name: cd.name ?? '',
                    address: cd.address ?? '',
                    phone: cd.phone ?? '',
                    birthDate: cd.birthDate ? cd.birthDate.substring(0, 10) : '',
                    gender: cd.gender ?? '',
                    idMaritalStatus: cd.idMaritalStatus ?? '',
                    ocupation: cd.ocupation ?? '',
                    education: cd.education ?? '',
                    profession: cd.profession ?? '',
                    religion: cd.religion ?? '',
                    notes: cd.notes ?? '',
                    child: cd.child ?? false,
                    idCity: cd.idCity ?? null,
                    idCityNavigation: cd.idCityNavigation ?? null,
                    idCompany: cd.idCompany ?? null,
                });
                setSelectedClient(prev => ({ ...prev, child: cd.child ?? false }));
            }
            if (mrRes.success && mrRes.data) {
                const mr = mrRes.data;
                setMedicalRecord(mr);
                setMedicalFormData({
                    idMedicalRecord: mr.idMedicalRecord,
                    idClient: c.idClient,
                    bloodType: mr.bloodType ?? '',
                    smokingHabit: mr.smokingHabit ?? '',
                    alcoholHabit: mr.alcoholHabit ?? '',
                    drugHabit: mr.drugHabit ?? '',
                    bloodPressure: mr.bloodPressure ?? '',
                    isPregnant: mr.isPregnant ?? false,
                    pregnancyMonths: mr.pregnancyMonths ?? '',
                    diabetesStatus: mr.diabetesStatus ?? '',
                    diabetesNotes: mr.diabetesNotes ?? '',
                    cancerStatus: mr.cancerStatus ?? '',
                    cancerNotes: mr.cancerNotes ?? '',
                    lifestyleLastUpdated: mr.lifestyleLastUpdated ?? null,
                    lifestyleLastUpdatedConsultationId: mr.lifestyleLastUpdatedConsultationId ?? null,
                });
            } else {
                const emptyPayload = {
                    idMedicalRecord: null,
                    idClient: c.idClient,
                    bloodType: '', smokingHabit: '', alcoholHabit: '', drugHabit: '',
                    bloodPressure: '', isPregnant: false, pregnancyMonths: null,
                    diabetesStatus: '', diabetesNotes: '', cancerStatus: '', cancerNotes: '',
                    lifestyleLastUpdated: null, lifestyleLastUpdatedConsultationId: null,
                };
                setMedicalFormData(emptyPayload);
                const createRes = await medicalService.create(emptyPayload);
                if (createRes?.success && createRes.data?.idMedicalRecord) {
                    const newMr = { surgeries: [], allergies: [], diseases: [], medicalNotes: [], bloodPressureRecords: [], ...createRes.data };
                    setMedicalRecord(newMr);
                    setMedicalFormData(prev => ({ ...prev, idMedicalRecord: newMr.idMedicalRecord }));
                }
            }
        } finally {
            setHistoryLoading(false);
        }
    };

    const handleSaveHistory = async () => {
        if (!clientForm?.name?.trim()) { ShowMessage(t('emptyFields'), 'warning'); return; }
        setIsSavingHistory(true);
        try {
            const saves = [clientService.editData(clientForm, true)];
            if (medicalFormData) {
                const payload = {
                    ...medicalFormData,
                    pregnancyMonths: medicalFormData.pregnancyMonths !== '' ? parseInt(medicalFormData.pregnancyMonths) : null,
                };
                saves.push(
                    medicalFormData.idMedicalRecord
                        ? medicalService.update(payload, null)
                        : medicalService.create(payload)
                );
            }
            const [clientRes, mrRes] = await Promise.all(saves);
            if (clientRes?.success) {
                setSelectedClient(prev => ({ ...prev, name: clientForm.name, gender: clientForm.gender, birthDate: clientForm.birthDate, child: clientForm.child }));
            }
            if (mrRes?.success && mrRes.data?.idMedicalRecord) {
                setMedicalFormData(prev => ({ ...prev, idMedicalRecord: mrRes.data.idMedicalRecord }));
                setMedicalRecord(prev => ({
                    ...(prev ?? {}),
                    idMedicalRecord: mrRes.data.idMedicalRecord,
                    bloodType: mrRes.data.bloodType,
                    smokingHabit: mrRes.data.smokingHabit,
                    alcoholHabit: mrRes.data.alcoholHabit,
                    drugHabit: mrRes.data.drugHabit,
                    bloodPressure: mrRes.data.bloodPressure,
                    isPregnant: mrRes.data.isPregnant,
                    pregnancyMonths: mrRes.data.pregnancyMonths,
                    diabetesStatus: mrRes.data.diabetesStatus,
                    cancerStatus: mrRes.data.cancerStatus,
                    lifestyleLastUpdated: mrRes.data.lifestyleLastUpdated,
                    lifestyleLastUpdatedConsultationId: mrRes.data.lifestyleLastUpdatedConsultationId,
                }));
            }
            const resolvedMedicalRecordId = mrRes?.data?.idMedicalRecord ?? medicalFormData?.idMedicalRecord;
            const pendingNotes = pendingNotesRef.current ?? [];
            if (pendingNotes.length > 0 && resolvedMedicalRecordId) {
                const noteResults = await Promise.all(pendingNotes.map(n => medicalService.addNote(resolvedMedicalRecordId, n, null)));
                const addedNotes = noteResults.filter(r => r?.success && r.data).map(r => r.data);
                if (addedNotes.length > 0) {
                    setMedicalRecord(prev => ({ ...prev, medicalNotes: [...(prev?.medicalNotes ?? []), ...addedNotes] }));
                }
                pendingNotesRef.current = [];
            }
            setSavedCounter(c => c + 1);
            ShowMessage(t('recordEditedSuccessPlural'), 'success');
        } catch {
            ShowMessage(t('error'), 'error');
        } finally {
            setIsSavingHistory(false);
        }
    };

    const handleFieldChange = (field) => (e) => setForm(prev => ({ ...prev, [field]: e.target.value }));

    const handleSave = async () => {
        if (!selectedClient) { ShowMessage(t('ch_select_client_first'), 'warning'); return; }
        if (!form.consultationDate) { ShowMessage(t('emptyFields'), 'warning'); return; }
        setSaving(true);
        try {
            const res = await consultService.create({
                idClient: selectedClient.idClient,
                ...form,
                idOralHygiene: form.idOralHygiene !== '' ? form.idOralHygiene : null,
                consultationTreatments: dentalProcedures.map(p => ({
                    idTreatment: p.idTreatment,
                    toothNumber: p.toothNumber,
                })),
            });
            if (res.success) {
                ShowMessage(t('recordAddedSuccessSingular'), 'success');
                navigate(`/consultas/${res.data.idConsultation}`);
            } else {

                ShowMessage(t('error'), 'error');
            }
        } finally {
            setSaving(false);
        }
    };

    // Step indicator labels
    const stepLabels = [t('ch_search_patient'), t('ch_title'), t('ch_section_consultation')];

    return (
        <Box>
            {/* Header */}
            <Paper elevation={0} sx={{ p: 2, mb: 3, borderRadius: 2, border: '1px solid', borderColor: 'divider', display: 'flex', alignItems: 'center', gap: 2 }}>
                <Tooltip title={t('back')}>
                    <IconButton
                        onClick={() => {
                            if (step === 1) navigate('/consultas');
                            else if (step === 2) { setStep(1); setSelectedClient(null); }
                            else setStep(2);
                        }}
                        size="small"
                    >
                        <ArrowBackIcon />
                    </IconButton>
                </Tooltip>
                <Avatar sx={{ bgcolor: 'primary.light', color: 'white', width: 42, height: 42, borderRadius: 2 }}>
                    <EventNoteIcon />
                </Avatar>
                <Box sx={{ flexGrow: 1 }}>
                    <Typography variant="h6" fontWeight={700} lineHeight={1.2}>{t('ch_new_consultation')}</Typography>
                    <Typography variant="caption" color="text.secondary">
                        {t('step')} {step} / 3 — {stepLabels[step - 1]}
                    </Typography>
                </Box>
                {step === 2 && (
                    <>
                        <Button
                            variant="outlined"
                            disableElevation
                            startIcon={isSavingHistory ? <CircularProgress size={16} color="inherit" /> : <SaveIcon />}
                            onClick={handleSaveHistory}
                            disabled={isSavingHistory || historyLoading}
                            sx={{ mr: 1 }}
                        >
                            {t('save')}
                        </Button>
                        <Button
                            variant="contained"
                            disableElevation
                            endIcon={<ArrowForwardIcon />}
                            onClick={() => setStep(3)}
                            disabled={historyLoading}
                        >
                            {t('ch_continue_consultation')}
                        </Button>
                    </>
                )}
                {step === 3 && (
                    <Button
                        variant="contained"
                        disableElevation
                        endIcon={saving ? <CircularProgress size={18} color="inherit" /> : <SaveIcon />}
                        onClick={handleSave}
                        disabled={saving}
                    >
                        {t('save')}
                    </Button>
                )}
            </Paper>

            {/* Step 1: Search patient */}
            {step === 1 && (
                <Paper variant="outlined" sx={{ p: 3, borderRadius: 2.5, maxWidth: 520, mx: 'auto' }}>
                    <Typography variant="subtitle1" fontWeight={700} mb={2}>
                        {t('ch_search_patient')}
                    </Typography>
                    <TextField
                        fullWidth
                        placeholder={t('ch_search_patient_placeholder')}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        size="small"
                        InputProps={{
                            startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} fontSize="small" />,
                            endAdornment: searchLoading ? <CircularProgress size={16} /> : null,
                        }}
                        sx={{ mb: 2 }}
                    />

                    {debouncedSearch.length >= 2 && clients.length === 0 && !searchLoading && (
                        <EmptyData isSearch title={t('records_notFound')} description={t('try_another_search_term')} />
                    )}

                    {clients.length > 0 && (
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                            {clients.map(c => (
                                <Paper
                                    key={c.idClient}
                                    variant="outlined"
                                    onClick={() => handleSelectClient(c)}
                                    sx={{ p: 1.5, borderRadius: 2, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 1.5, transition: '0.15s', '&:hover': { borderColor: 'primary.main', bgcolor: 'action.hover' } }}
                                >
                                    <Avatar sx={{ width: 34, height: 34, bgcolor: 'primary.light' }}>
                                        <PersonIcon fontSize="small" />
                                    </Avatar>
                                    <Box>
                                        <Typography variant="body2" fontWeight={600}>{c.name}</Typography>
                                        {c.phone && <Typography variant="caption" color="text.secondary">{c.phone}</Typography>}
                                    </Box>
                                </Paper>
                            ))}
                        </Box>
                    )}

                    {debouncedSearch.length < 2 && (
                        <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', mt: 3 }}>
                            {t('ch_search_min_chars')}
                        </Typography>
                    )}
                </Paper>
            )}

            {/* Step 2: Clinical History */}
            {step === 2 && (
                <Box>
                    <PatientBanner client={selectedClient} />

                    {historyLoading ? (
                        <Box sx={{ mt: 2 }}>
                            <LinearProgress sx={{ borderRadius: 1, mb: 2 }} />
                            {[300, 380, 260].map((h, i) => (
                                <Paper key={i} variant="outlined" sx={{ height: h, borderRadius: 2.5, mb: 2, bgcolor: 'action.hover' }} />
                            ))}
                        </Box>
                    ) : (
                        <>
                            <Alert severity="info" sx={{ mb: 2, borderRadius: 2 }}>
                                {t('ch_review_history_before_consultation')}
                            </Alert>
                            <Paper variant="outlined" sx={{ borderRadius: 2.5 }}>
                                <Tabs
                                    value={historyTab}
                                    onChange={(_, v) => setHistoryTab(v)}
                                    variant="scrollable"
                                    scrollButtons="auto"
                                    sx={{ borderBottom: 1, borderColor: 'divider', px: 1 }}
                                >
                                    <Tab icon={<PersonIcon fontSize="small" />} iconPosition="start" label={t('ch_step_profile')} />
                                    <Tab icon={<FavoriteIcon fontSize="small" />} iconPosition="start" label={t('ch_step_pathological')} />
                                    <Tab icon={<NatureIcon fontSize="small" />} iconPosition="start" label={t('ch_step_nonpathological')} />
                                </Tabs>
                                <Box sx={{ p: 3 }}>
                                    {historyTab === 0 && clientForm && (
                                        <PatientInfoSection clientForm={clientForm} setClientForm={setClientForm} />
                                    )}
                                    {historyTab === 1 && medicalFormData && (
                                        <>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2.5 }}>
                                                <Avatar sx={{ bgcolor: 'error.light', borderRadius: 1.5, width: 38, height: 38 }}>
                                                    <FavoriteIcon fontSize="small" />
                                                </Avatar>
                                                <Typography variant="subtitle1" fontWeight={700}>{t('ch_section_pathological')}</Typography>
                                            </Box>
                                            <Divider sx={{ mb: 2.5 }} />
                                            <PathologicalHistorySection
                                                medicalRecord={medicalRecord}
                                                setMedicalRecord={setMedicalRecord}
                                                medicalFormData={medicalFormData}
                                                setMedicalFormData={setMedicalFormData}
                                                gender={clientForm?.gender}
                                                activeConsultationId={null}
                                                hideSectionHeader
                                            />
                                        </>
                                    )}
                                    {historyTab === 2 && medicalFormData && (
                                        <>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2.5 }}>
                                                <Avatar sx={{ bgcolor: 'success.light', borderRadius: 1.5, width: 38, height: 38 }}>
                                                    <NatureIcon fontSize="small" />
                                                </Avatar>
                                                <Typography variant="subtitle1" fontWeight={700}>{t('ch_section_nonpathological')}</Typography>
                                            </Box>
                                            <Divider sx={{ mb: 2.5 }} />
                                            <NonPathologicalHistorySection
                                                medicalRecord={medicalRecord}
                                                setMedicalRecord={setMedicalRecord}
                                                medicalFormData={medicalFormData}
                                                setMedicalFormData={setMedicalFormData}
                                                hasMedicalRecord={!!medicalRecord}
                                                activeConsultationId={null}
                                                pendingNotesRef={pendingNotesRef}
                                                savedFlagRef={savedCounter}
                                                hideSectionHeader
                                            />
                                        </>
                                    )}
                                </Box>
                            </Paper>

                            {/* Floating continue button */}
                            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3, gap: 1.5 }}>
                                <Button
                                    variant="outlined"
                                    startIcon={isSavingHistory ? <CircularProgress size={16} color="inherit" /> : <SaveIcon />}
                                    onClick={handleSaveHistory}
                                    disabled={isSavingHistory}
                                >
                                    {t('save')}
                                </Button>
                                <Button
                                    variant="contained"
                                    disableElevation
                                    endIcon={<ArrowForwardIcon />}
                                    onClick={() => setStep(3)}
                                >
                                    {t('ch_continue_consultation')}
                                </Button>
                            </Box>
                        </>
                    )}
                </Box>
            )}

            {/* Step 3: Consultation form */}
            {step === 3 && (
                <Box>
                    <PatientBanner client={selectedClient} />
                    <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 2.5 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                            <Avatar sx={{ bgcolor: 'primary.light', color: 'white', width: 36, height: 36, borderRadius: 1.5 }}>
                                <EventNoteIcon fontSize="small" />
                            </Avatar>
                            <Typography variant="subtitle1" fontWeight={700} flexGrow={1}>
                                {t('ch_section_consultation')}
                            </Typography>
                        </Box>
                        <Divider sx={{ mb: 2.5 }} />
                        <Grid container spacing={2}>
                            <Grid size={{ xs: 12, sm: 4 }}>
                                <TextField
                                    fullWidth required
                                    label={t('date')}
                                    type="date"
                                    value={form.consultationDate}
                                    onChange={handleFieldChange('consultationDate')}
                                    InputLabelProps={{ shrink: true }}
                                />
                            </Grid>
                            <Grid size={{ xs: 12, sm: 4 }}>
                                <TextField
                                    select
                                    fullWidth
                                    label={t('ch_oral_hygiene')}
                                    value={form.idOralHygiene}
                                    onChange={handleFieldChange('idOralHygiene')}
                                    disabled={catalogLoading}
                                >
                                    <MenuItem value="">{t('select')}</MenuItem>
                                    {oralHygieneOptions.map(o => (
                                        <MenuItem key={o.idOralHygiene} value={o.idOralHygiene}>{o.description}</MenuItem>
                                    ))}
                                </TextField>
                            </Grid>
                            <Grid size={{ xs: 12 }}>
                                <TextField
                                    fullWidth multiline rows={3}
                                    label={t('ch_reason')}
                                    value={form.reason}
                                    onChange={handleFieldChange('reason')}
                                    inputProps={{ maxLength: 1000 }}
                                />
                            </Grid>
                            <Grid size={{ xs: 12 }}>
                                <TextField
                                    fullWidth multiline rows={4}
                                    label={t('ch_current_condition')}
                                    value={form.currentCondition}
                                    onChange={handleFieldChange('currentCondition')}
                                    inputProps={{ maxLength: 2000 }}
                                />
                            </Grid>
                            <Grid size={{ xs: 12 }}>
                                <TextField
                                    fullWidth multiline rows={4}
                                    label={t('ch_physical_exam')}
                                    value={form.physicalExam}
                                    onChange={handleFieldChange('physicalExam')}
                                    inputProps={{ maxLength: 2000 }}
                                />
                            </Grid>
                            <Grid size={{ xs: 12 }}>
                                <TextField
                                    fullWidth multiline rows={3}
                                    label={t('ch_diagnosis')}
                                    value={form.diagnosis}
                                    onChange={handleFieldChange('diagnosis')}
                                    inputProps={{ maxLength: 1000 }}
                                />
                            </Grid>
                            <Grid size={{ xs: 12 }}>
                                <TextField
                                    fullWidth multiline rows={4}
                                    label={t('ch_treatment')}
                                    value={form.treatment}
                                    onChange={handleFieldChange('treatment')}
                                    inputProps={{ maxLength: 2000 }}
                                />
                            </Grid>
                        </Grid>
                    </Paper>

                    {/* Dental Chart */}
                    <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 2.5, mt: 2 }}>
                        <DentalChart
                            procedures={dentalProcedures}
                            onChange={setDentalProcedures}
                            catalogTreatments={catalogTreatments}
                            isChild={selectedClient?.child ?? false}
                        />
                    </Paper>
                </Box>
            )}


        </Box>
    );
}

export default NewConsultationPage;
