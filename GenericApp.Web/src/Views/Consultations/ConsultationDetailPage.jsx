import React, { useState, useEffect } from 'react';
import {
    Box, Typography, Paper, Button, Avatar, CircularProgress,
    TextField, IconButton, Tooltip, Divider, Chip, Skeleton, MenuItem,
} from '@mui/material';
import Grid from '@mui/material/Grid';
import EventNoteIcon from '@mui/icons-material/EventNote';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SaveIcon from '@mui/icons-material/Save';
import HistoryIcon from '@mui/icons-material/ManageSearch';
import PersonIcon from '@mui/icons-material/Person';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ShowMessage } from '@helpers/NotificationService';
import { DataAPIConsultationsService } from '@data/Consultations/Data';
import { DataAPIClientsService } from '@data/Clients/Data';
import DentalChart from '@views/Consultations/DentalChart';

function ConsultationDetailPage() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { id } = useParams();
    const service = DataAPIConsultationsService();
    const clientService = DataAPIClientsService();

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [form, setForm] = useState(null);
    const [dentalProcedures, setDentalProcedures] = useState([]);
    const [catalogTreatments, setCatalogTreatments] = useState([]);
    const [oralHygieneOptions, setOralHygieneOptions] = useState([]);
    const [isChild, setIsChild] = useState(false);

    useEffect(() => {
        loadConsultation();
        service.getCatalogOptions().then(res => {
            if (res.success && res.data) {
                setCatalogTreatments(res.data.treatments ?? []);
                setOralHygieneOptions(res.data.oralHygienes ?? []);
            }
        });
    }, [id]);

    const loadConsultation = async () => {
        setLoading(true);
        try {
            const res = await service.getById(id);
            if (res.success && res.data) {
                const d = res.data;
                setForm({
                    idConsultation: d.idConsultation,
                    idClient: d.idClient,
                    clientName: d.clientName ?? '',
                    consultationDate: d.consultationDate?.substring(0, 10) ?? '',
                    reason: d.reason ?? '',
                    currentCondition: d.currentCondition ?? '',
                    physicalExam: d.physicalExam ?? '',
                    diagnosis: d.diagnosis ?? '',
                    treatment: d.treatment ?? '',
                    idOralHygiene: d.idOralHygiene ?? '',
                });
                setDentalProcedures((d.consultationTreatments ?? []).map(ct => ({
                    idConsultationTreatment: ct.idConsultationTreatment,
                    idTreatment: ct.idTreatment,
                    toothNumber: ct.toothNumber,
                    treatmentCode: ct.treatmentCode,
                    treatmentDescription: ct.treatmentDescription,
                })));
                // Fetch client to get the child flag for the odontogram
                clientService.getDataById(d.idClient).then(cr => {
                    if (cr.success && cr.data) setIsChild(cr.data.child ?? false);
                });
            } else {
                ShowMessage(t('records_notFound'), 'error');
                navigate('/consultas');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleFieldChange = (field) => (e) => setForm(prev => ({ ...prev, [field]: e.target.value }));

    const handleSave = async () => {
        if (!form.consultationDate) { ShowMessage(t('emptyFields'), 'warning'); return; }
        setSaving(true);
        try {
            const res = await service.update({
                ...form,
                idOralHygiene: form.idOralHygiene !== '' ? form.idOralHygiene : null,
                consultationTreatments: dentalProcedures.map(p => ({
                    idTreatment: p.idTreatment,
                    toothNumber: p.toothNumber,
                })),
            });
            if (res.success) {
                ShowMessage(t('recordEditedSuccessPlural'), 'success');
            } else {
                ShowMessage(t('error'), 'error');
            }
        } finally {
            setSaving(false);
        }
    };

    return (
        <Box>
            {/* Header */}
            <Paper elevation={0} sx={{ p: 2, mb: 3, borderRadius: 2, border: '1px solid', borderColor: 'divider', display: 'flex', alignItems: 'center', gap: 2 }}>
                <Tooltip title={t('back')}>
                    <IconButton onClick={() => navigate('/consultas')} size="small">
                        <ArrowBackIcon />
                    </IconButton>
                </Tooltip>
                <Avatar sx={{ bgcolor: 'primary.light', color: 'white', width: 42, height: 42, borderRadius: 2 }}>
                    <EventNoteIcon />
                </Avatar>
                <Box sx={{ flexGrow: 1 }}>
                    {loading ? <Skeleton width={200} /> : (
                        <>
                            <Typography variant="h6" fontWeight={700} lineHeight={1.2}>{t('ch_edit_consultation')}</Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.3 }}>
                                <PersonIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
                                <Typography variant="caption" color="text.secondary">{form?.clientName}</Typography>
                                <Chip
                                    label={form?.consultationDate ? new Date(form.consultationDate).toLocaleDateString() : ''}
                                    size="small" variant="outlined" color="primary" sx={{ ml: 0.5 }}
                                />
                            </Box>
                        </>
                    )}
                </Box>
                <Tooltip title={t('ch_history')}>
                    <Button
                        variant="outlined"
                        startIcon={<HistoryIcon />}
                        onClick={() => form && navigate(`/historia-clinica/${form.idClient}?consultationId=${form.idConsultation}`)}
                        disabled={loading}
                    >
                        {t('ch_history')}
                    </Button>
                </Tooltip>
                <Button
                    variant="contained"
                    disableElevation
                    endIcon={saving ? <CircularProgress size={18} color="inherit" /> : <SaveIcon />}
                    onClick={handleSave}
                    disabled={saving || loading}
                >
                    {t('save')}
                </Button>
            </Paper>

            {/* Form */}
            <Paper variant="outlined" sx={{ p: 3, borderRadius: 2.5 }}>
                {loading ? (
                    <Grid container spacing={2}>
                        {[...Array(6)].map((_, i) => (
                            <Grid key={i} size={{ xs: 12, sm: i === 0 ? 4 : 12 }}>
                                <Skeleton variant="rounded" height={i === 0 ? 56 : 100} />
                            </Grid>
                        ))}
                    </Grid>
                ) : (
                    <Grid container spacing={2.5}>
                        <Grid size={{ xs: 12 }}>
                            <Divider textAlign="left">
                                <Typography variant="caption" color="text.secondary" fontWeight={600}>{t('ch_section_consultation')}</Typography>
                            </Divider>
                        </Grid>
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
                                value={form.idOralHygiene ?? ''}
                                onChange={handleFieldChange('idOralHygiene')}
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
                                fullWidth multiline rows={5}
                                label={t('ch_current_condition')}
                                value={form.currentCondition}
                                onChange={handleFieldChange('currentCondition')}
                                inputProps={{ maxLength: 2000 }}
                            />
                        </Grid>
                        <Grid size={{ xs: 12 }}>
                            <TextField
                                fullWidth multiline rows={5}
                                label={t('ch_physical_exam')}
                                value={form.physicalExam}
                                onChange={handleFieldChange('physicalExam')}
                                inputProps={{ maxLength: 2000 }}
                            />
                        </Grid>
                        <Grid size={{ xs: 12 }}>
                            <TextField
                                fullWidth multiline rows={4}
                                label={t('ch_diagnosis')}
                                value={form.diagnosis}
                                onChange={handleFieldChange('diagnosis')}
                                inputProps={{ maxLength: 1000 }}
                            />
                        </Grid>
                        <Grid size={{ xs: 12 }}>
                            <TextField
                                fullWidth multiline rows={5}
                                label={t('ch_treatment')}
                                value={form.treatment}
                                onChange={handleFieldChange('treatment')}
                                inputProps={{ maxLength: 2000 }}
                            />
                        </Grid>
                    </Grid>
                )}
            </Paper>

            {/* Dental Chart */}
            <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 2.5, mt: 2 }}>
                <DentalChart
                    procedures={dentalProcedures}
                    onChange={setDentalProcedures}
                    catalogTreatments={catalogTreatments}
                    isChild={isChild}
                />
            </Paper>
        </Box>
    );
}

export default ConsultationDetailPage;
