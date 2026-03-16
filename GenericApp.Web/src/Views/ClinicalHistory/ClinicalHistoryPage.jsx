import React, { useState, useEffect } from 'react';
import {
    Box, Typography, Paper, Button, Avatar, CircularProgress,
    Divider, IconButton, Tooltip, Skeleton, Chip, Fab, Alert, AlertTitle, LinearProgress,
} from '@mui/material';
import Grid from '@mui/material/Grid';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import MedicalServicesIcon from '@mui/icons-material/MedicalServices';
import EventNoteIcon from '@mui/icons-material/EventNote';
import PersonIcon from '@mui/icons-material/Person';
import FavoriteIcon from '@mui/icons-material/Favorite';
import NatureIcon from '@mui/icons-material/Nature';
import SaveIcon from '@mui/icons-material/Save';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ShowMessage } from '@helpers/NotificationService';
import { DataAPIClientsService } from '@data/Clients/Data';
import { DataAPIMedicalRecordsService } from '@data/MedicalRecords/Data';
import { DataAPIConsultationsService } from '@data/Consultations/Data';

import PatientInfoSection from './Sections/PatientInfoSection';
import PathologicalHistorySection from './Sections/PathologicalHistorySection';
import NonPathologicalHistorySection from './Sections/NonPathologicalHistorySection';
import ConsultationListSection from './Sections/ConsultationListSection';

function ClinicalHistoryPage() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { clientId } = useParams();
    const clientService = DataAPIClientsService();
    const medicalService = DataAPIMedicalRecordsService();
    const consultService = DataAPIConsultationsService();

    const [isFetching, setIsFetching] = useState(true);

    const [client, setClient] = useState(null);
    const [clientForm, setClientForm] = useState(null);
    const [isSaving, setIsSaving] = useState(false);
    const [isCreatingMedicalRecord, setIsCreatingMedicalRecord] = useState(false);

    const [medicalRecord, setMedicalRecord] = useState(null);
    const [medicalFormData, setMedicalFormData] = useState(null);

    const [consultations, setConsultations] = useState([]);
    const [totalConsultations, setTotalConsultations] = useState(0);

    useEffect(() => { loadAll(); }, [clientId]);

    const loadAll = async () => {
        setIsFetching(true);
        try {
            const [clientRes, mrRes, consRes] = await Promise.all([
                clientService.getDataById(clientId),
                medicalService.getByClientId(clientId),
                consultService.getByClientId(clientId, 1, 5),
            ]);

            if (clientRes.success && clientRes.data) {
                const c = clientRes.data;
                setClient(c);
                setClientForm({
                    idClient: c.idClient,
                    name: c.name ?? '',
                    address: c.address ?? '',
                    phone: c.phone ?? '',
                    birthDate: c.birthDate ? c.birthDate.substring(0, 10) : '',
                    gender: c.gender ?? '',
                    maritalState: c.maritalState ?? '',
                    ocupation: c.ocupation ?? '',
                    education: c.education ?? '',
                    profession: c.profession ?? '',
                    religion: c.religion ?? '',
                    notes: c.notes ?? '',
                    idCity: c.idCity ?? null,
                    idCityNavigation: c.idCityNavigation ?? null,
                    idCompany: c.idCompany ?? null,
                });
            }

            if (mrRes.success && mrRes.data) {
                const mr = mrRes.data;
                setMedicalRecord(mr);
                setMedicalFormData({
                    idMedicalRecord: mr.idMedicalRecord,
                    idClient: parseInt(clientId),
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
                });
            } else {
                const emptyPayload = {
                    idMedicalRecord: null,
                    idClient: parseInt(clientId),
                    bloodType: '', smokingHabit: '', alcoholHabit: '', drugHabit: '',
                    bloodPressure: '', isPregnant: false, pregnancyMonths: null,
                    diabetesStatus: '', diabetesNotes: '', cancerStatus: '', cancerNotes: '',
                };
                setMedicalFormData(emptyPayload);
                setIsCreatingMedicalRecord(true);
                try {
                    const createRes = await medicalService.create(emptyPayload);
                    if (createRes?.success && createRes.data?.idMedicalRecord) {
                        const newMr = {
                            surgeries: [],
                            allergies: [],
                            diseases: [],
                            ...createRes.data,
                        };
                        setMedicalRecord(newMr);
                        setMedicalFormData(prev => ({ ...prev, idMedicalRecord: newMr.idMedicalRecord }));
                    }
                } finally {
                    setIsCreatingMedicalRecord(false);
                }
            }

            if (consRes.success && consRes.data) {
                setConsultations(consRes.data.data ?? []);
                setTotalConsultations(consRes.data.totalCount ?? 0);
            }
        } finally {
            setIsFetching(false);
        }
    };

    const handleSaveAll = async () => {
        if (!clientForm?.name?.trim()) { ShowMessage(t('emptyFields'), 'warning'); return; }
        setIsSaving(true);
        try {
            const saves = [];
            saves.push(clientService.editData(clientForm, true));
            if (medicalFormData) {
                const payload = {
                    ...medicalFormData,
                    pregnancyMonths: medicalFormData.pregnancyMonths !== '' ? parseInt(medicalFormData.pregnancyMonths) : null,
                };
                saves.push(
                    medicalFormData.idMedicalRecord
                        ? medicalService.update(payload)
                        : medicalService.create(payload)
                );
            }
            const [clientRes, mrRes] = await Promise.all(saves);
            if (clientRes?.success) setClient(prev => ({ ...prev, ...clientForm }));
            if (mrRes?.success && mrRes.data?.idMedicalRecord) {
                const isNew = !medicalFormData?.idMedicalRecord;
                const newMr = {
                    surgeries: [],
                    allergies: [],
                    diseases: [],
                    ...mrRes.data,
                };
                setMedicalFormData(prev => ({ ...prev, idMedicalRecord: newMr.idMedicalRecord }));
                setMedicalRecord(isNew ? newMr : prev => ({ ...prev, ...newMr }));
            }
            ShowMessage(t('recordEditedSuccessPlural'), 'success');
        } catch {
            ShowMessage(t('error'), 'error');
        } finally {
            setIsSaving(false);
        }
    };

    const SectionHeader = ({ icon, color, title }) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2.5 }}>
            <Avatar sx={{ bgcolor: color, borderRadius: 1.5, width: 38, height: 38 }}>
                {icon}
            </Avatar>
            <Typography variant="subtitle1" fontWeight={700} sx={{ flexGrow: 1 }}>
                {title}
            </Typography>
        </Box>
    );

    if (isFetching) {
        return (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Skeleton variant="rounded" height={72} sx={{ borderRadius: 2 }} />
                {[340, 420, 280, 360].map((h, i) => (
                    <Skeleton key={i} variant="rounded" height={h} sx={{ borderRadius: 2.5 }} />
                ))}
            </Box>
        );
    }

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>

            {/* ?? Sticky Page Header ?? */}
            <Paper
                elevation={0}
                sx={{
                    p: 2, borderRadius: 2, border: '1px solid', borderColor: 'divider',
                    display: 'flex', alignItems: 'center', gap: 2,
                    position: 'sticky', top: 0, zIndex: 10, bgcolor: 'background.paper',
                }}
            >
                <Tooltip title={t('back')}>
                    <IconButton onClick={() => navigate('/consultas')} size="small">
                        <ArrowBackIcon />
                    </IconButton>
                </Tooltip>
                <Avatar sx={{ bgcolor: 'primary.main', width: 44, height: 44, borderRadius: 2 }}>
                    <MedicalServicesIcon />
                </Avatar>
                <Box sx={{ flexGrow: 1 }}>
                    <Typography variant="h6" fontWeight={700} lineHeight={1.2}>
                        {t('ch_title')}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="caption" color="text.secondary">
                            {client?.name}
                        </Typography>
                        {client?.birthDate && (
                            <Chip
                                size="small"
                                variant="outlined"
                                label={`${Math.floor((new Date() - new Date(client.birthDate)) / (365.25 * 24 * 60 * 60 * 1000))} ${t('ch_years')}`}
                                sx={{ height: 18, fontSize: 11 }}
                            />
                        )}
                    </Box>
                </Box>
                <Button
                    variant="outlined"
                    startIcon={<EventNoteIcon />}
                    onClick={() => navigate('/consultas/nueva')}
                    size="small"
                >
                    {t('ch_new_consultation')}
                </Button>
            </Paper>

            {/* Patient Info */}
            <Paper variant="outlined" sx={{ p: 3, borderRadius: 2.5 }}>
                <SectionHeader
                    icon={<PersonIcon fontSize="small" />}
                    color="primary.light"
                    title={t('ch_section_profile')}
                />
                <Divider sx={{ mb: 2.5 }} />
                <PatientInfoSection clientForm={clientForm} setClientForm={setClientForm} />
            </Paper>

            {/* Banner: creando historial clínico automáticamente */}
            {isCreatingMedicalRecord && (
                <Alert
                    severity="info"
                    icon={<CircularProgress size={20} color="inherit" />}
                    sx={{ borderRadius: 2.5 }}
                >
                    <AlertTitle sx={{ fontWeight: 700 }}>{t('ch_creating_medical_record')}</AlertTitle>
                    {t('ch_creating_medical_record_hint')}
                    <LinearProgress sx={{ mt: 1, borderRadius: 1 }} />
                </Alert>
            )}

            {/* Pathological + Non-Pathological side-by-side on desktop */}
            <Grid container spacing={2.5}>
                <Grid size={{ xs: 12, lg: 6 }}>
                    <Paper variant="outlined" sx={{ p: 3, borderRadius: 2.5, height: '100%' }}>
                        <SectionHeader
                            icon={<FavoriteIcon fontSize="small" />}
                            color="error.light"
                            title={t('ch_section_pathological')}
                        />
                        <Divider sx={{ mb: 2.5 }} />
                        {medicalFormData && (
                            <PathologicalHistorySection
                                medicalRecord={medicalRecord}
                                setMedicalRecord={setMedicalRecord}
                                medicalFormData={medicalFormData}
                                setMedicalFormData={setMedicalFormData}
                                gender={clientForm?.gender}
                                hideSectionHeader
                            />
                        )}
                    </Paper>
                </Grid>

                <Grid size={{ xs: 12, lg: 6 }}>
                    <Paper variant="outlined" sx={{ p: 3, borderRadius: 2.5, height: '100%' }}>
                        <SectionHeader
                            icon={<NatureIcon fontSize="small" />}
                            color="success.light"
                            title={t('ch_section_nonpathological')}
                        />
                        <Divider sx={{ mb: 2.5 }} />
                        {medicalFormData && (
                            <NonPathologicalHistorySection
                                medicalFormData={medicalFormData}
                                setMedicalFormData={setMedicalFormData}
                                hasMedicalRecord={!!medicalRecord}
                                hideSectionHeader
                            />
                        )}
                    </Paper>
                </Grid>
            </Grid>

            {/* Consultations */}
            <Paper variant="outlined" sx={{ p: 3, borderRadius: 2.5 }}>
                <ConsultationListSection
                    client={client}
                    consultations={consultations}
                    setConsultations={setConsultations}
                    totalConsultations={totalConsultations}
                    setTotalConsultations={setTotalConsultations}
                />
            </Paper>

            {/* Botón flotante global de guardar */}
            <Box sx={{ position: 'fixed', bottom: 32, right: 32, zIndex: 20 }}>
                <Tooltip title={t('save')} placement="left">
                    <Fab
                        color="primary"
                        onClick={handleSaveAll}
                        disabled={isSaving}
                        sx={{ boxShadow: 6 }}
                    >
                        {isSaving ? <CircularProgress size={24} color="inherit" /> : <SaveIcon />}
                    </Fab>
                </Tooltip>
            </Box>

        </Box>
    );
}

export default ClinicalHistoryPage;
