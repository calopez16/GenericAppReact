import React, { useState, useEffect, useContext, useRef } from 'react';
import {
    Box, Typography, Paper, Button, Avatar, LinearProgress,
    TextField, IconButton, Tooltip, Divider, CircularProgress, Chip,
} from '@mui/material';
import Grid from '@mui/material/Grid';
import EventNoteIcon from '@mui/icons-material/EventNote';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SearchIcon from '@mui/icons-material/Search';
import PersonIcon from '@mui/icons-material/Person';
import SaveIcon from '@mui/icons-material/Save';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { AppContext } from '@helpers/AppContext';
import { ShowMessage } from '@helpers/NotificationService';
import { DataAPIClientsService } from '@data/Clients/Data';
import { DataAPIConsultationsService } from '@data/Consultations/Data';
import EmptyData from '@layout/EmptyData';

function NewConsultationPage() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const clientService = DataAPIClientsService();
    const consultService = DataAPIConsultationsService();
    const { companySelected } = useContext(AppContext);

    // Step 1: client search
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [clients, setClients] = useState([]);
    const [searchLoading, setSearchLoading] = useState(false);
    const [selectedClient, setSelectedClient] = useState(null);

    // Step 2: consultation form
    const [form, setForm] = useState({
        consultationDate: new Date().toISOString().substring(0, 10),
        reason: '',
        currentCondition: '',
        physicalExam: '',
        diagnosis: '',
        treatment: '',
    });
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => setDebouncedSearch(searchTerm), 400);
        return () => clearTimeout(timer);
    }, [searchTerm]);

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

    const handleFieldChange = (field) => (e) => setForm(prev => ({ ...prev, [field]: e.target.value }));

    const handleSave = async () => {
        if (!selectedClient) { ShowMessage(t('ch_select_client_first'), 'warning'); return; }
        if (!form.consultationDate) { ShowMessage(t('emptyFields'), 'warning'); return; }
        setSaving(true);
        try {
            const res = await consultService.create({
                idClient: selectedClient.idClient,
                ...form,
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
                    <Typography variant="h6" fontWeight={700} lineHeight={1.2}>{t('ch_new_consultation')}</Typography>
                    <Typography variant="caption" color="text.secondary">{t('ch_new_consultation_desc')}</Typography>
                </Box>
                <Button
                    variant="contained"
                    disableElevation
                    endIcon={saving ? <CircularProgress size={18} color="inherit" /> : <SaveIcon />}
                    onClick={handleSave}
                    disabled={saving || !selectedClient}
                >
                    {t('save')}
                </Button>
            </Paper>

            <Grid container spacing={3}>
                {/* LEFT: Client Search */}
                <Grid size={{ xs: 12, md: 4 }}>
                    <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 2.5 }}>
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

                        {selectedClient && (
                            <Paper variant="outlined" sx={{ p: 1.5, mb: 2, borderRadius: 2, borderColor: 'success.main', bgcolor: 'success.50' }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <CheckCircleIcon color="success" fontSize="small" />
                                    <Box>
                                        <Typography variant="body2" fontWeight={700}>{selectedClient.name}</Typography>
                                        <Typography variant="caption" color="text.secondary">{t('ch_patient_selected')}</Typography>
                                    </Box>
                                    <Button size="small" sx={{ ml: 'auto' }} onClick={() => setSelectedClient(null)}>
                                        {t('ch_change')}
                                    </Button>
                                </Box>
                            </Paper>
                        )}

                        {debouncedSearch.length >= 2 && clients.length === 0 && !searchLoading && (
                            <EmptyData isSearch title={t('records_notFound')} description={t('try_another_search_term')} />
                        )}

                        {clients.length > 0 && !selectedClient && (
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                {clients.map(c => (
                                    <Paper
                                        key={c.idClient}
                                        variant="outlined"
                                        onClick={() => { setSelectedClient(c); setClients([]); setSearchTerm(''); }}
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

                        {debouncedSearch.length < 2 && !selectedClient && (
                            <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', mt: 3 }}>
                                {t('ch_search_min_chars')}
                            </Typography>
                        )}
                    </Paper>
                </Grid>

                {/* RIGHT: Consultation Form */}
                <Grid size={{ xs: 12, md: 8 }}>
                    <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 2.5 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                            <Typography variant="subtitle1" fontWeight={700} flexGrow={1}>
                                {t('ch_section_consultation')}
                            </Typography>
                            {!selectedClient && (
                                <Chip label={t('ch_select_client_first')} color="warning" size="small" variant="outlined" />
                            )}
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
                                    disabled={!selectedClient}
                                />
                            </Grid>
                            <Grid size={{ xs: 12 }}>
                                <TextField
                                    fullWidth multiline rows={3}
                                    label={t('ch_reason')}
                                    value={form.reason}
                                    onChange={handleFieldChange('reason')}
                                    inputProps={{ maxLength: 1000 }}
                                    disabled={!selectedClient}
                                />
                            </Grid>
                            <Grid size={{ xs: 12 }}>
                                <TextField
                                    fullWidth multiline rows={4}
                                    label={t('ch_current_condition')}
                                    value={form.currentCondition}
                                    onChange={handleFieldChange('currentCondition')}
                                    inputProps={{ maxLength: 2000 }}
                                    disabled={!selectedClient}
                                />
                            </Grid>
                            <Grid size={{ xs: 12 }}>
                                <TextField
                                    fullWidth multiline rows={4}
                                    label={t('ch_physical_exam')}
                                    value={form.physicalExam}
                                    onChange={handleFieldChange('physicalExam')}
                                    inputProps={{ maxLength: 2000 }}
                                    disabled={!selectedClient}
                                />
                            </Grid>
                            <Grid size={{ xs: 12 }}>
                                <TextField
                                    fullWidth multiline rows={3}
                                    label={t('ch_diagnosis')}
                                    value={form.diagnosis}
                                    onChange={handleFieldChange('diagnosis')}
                                    inputProps={{ maxLength: 1000 }}
                                    disabled={!selectedClient}
                                />
                            </Grid>
                            <Grid size={{ xs: 12 }}>
                                <TextField
                                    fullWidth multiline rows={4}
                                    label={t('ch_treatment')}
                                    value={form.treatment}
                                    onChange={handleFieldChange('treatment')}
                                    inputProps={{ maxLength: 2000 }}
                                    disabled={!selectedClient}
                                />
                            </Grid>
                        </Grid>
                    </Paper>
                </Grid>
            </Grid>
        </Box>
    );
}

export default NewConsultationPage;
