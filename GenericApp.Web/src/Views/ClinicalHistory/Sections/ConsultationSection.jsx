import React, { useState } from 'react';
import {
    Box,
    Grid,
    TextField,
    Typography,
    Divider,
    Avatar,
    Paper,
    Button,
    IconButton,
    Chip,
    Tooltip,
    CircularProgress,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TablePagination,
    MenuItem,
} from '@mui/material';
import EventNoteIcon from '@mui/icons-material/EventNote';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SaveIcon from '@mui/icons-material/Save';
import CloseIcon from '@mui/icons-material/Close';
import { useTranslation } from 'react-i18next';
import { ShowMessage } from '@helpers/NotificationService';
import { DataAPIConsultationsService } from '@data/Consultations/Data';

const ConsultationSection = ({ client, consultations, setConsultations, totalConsultations, setTotalConsultations }) => {
    const { t } = useTranslation();
    const service = DataAPIConsultationsService();

    const [dialogOpen, setDialogOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [page, setPage] = useState(0);
    const [rowsPerPage] = useState(5);

    const emptyForm = {
        idConsultation: null,
        idClient: client?.idClient ?? 0,
        consultationDate: new Date().toISOString().substring(0, 10),
        reason: '',
        currentCondition: '',
        physicalExam: '',
        diagnosis: '',
        treatment: '',
        oralHygiene: '',
    };

    const [form, setForm] = useState(emptyForm);

    const handleOpenNew = () => {
        setForm({ ...emptyForm, consultationDate: new Date().toISOString().substring(0, 10) });
        setIsEditing(false);
        setDialogOpen(true);
    };

    const handleOpenEdit = (consultation) => {
        setForm({
            idConsultation: consultation.idConsultation,
            idClient: consultation.idClient,
            consultationDate: consultation.consultationDate?.substring(0, 10) ?? '',
            reason: consultation.reason ?? '',
            currentCondition: consultation.currentCondition ?? '',
            physicalExam: consultation.physicalExam ?? '',
            diagnosis: consultation.diagnosis ?? '',
            treatment: consultation.treatment ?? '',
            oralHygiene: consultation.oralHygiene ?? '',
        });
        setIsEditing(true);
        setDialogOpen(true);
    };

    const handleChange = (field) => (e) => {
        setForm(prev => ({ ...prev, [field]: e.target.value }));
    };

    const reloadPage = async (pageNum = page) => {
        const res = await service.getByClientId(client.idClient, pageNum + 1, rowsPerPage);
        if (res.success && res.data) {
            setConsultations(res.data.data ?? []);
            setTotalConsultations(res.data.totalCount ?? 0);
        }
    };

    const handleSubmit = async () => {
        if (!form.consultationDate) {
            ShowMessage(t('emptyFields'), 'warning');
            return;
        }
        setIsLoading(true);
        try {
            let res;
            if (isEditing) {
                res = await service.update(form);
            } else {
                res = await service.create(form);
            }

            if (res.success) {
                setDialogOpen(false);
                await reloadPage();
                ShowMessage(isEditing ? t('recordEditedSuccessPlural') : t('recordAddedSuccessSingular'), 'success');
            } else {
                ShowMessage(t('error'), 'error');
            }
        } catch {
            ShowMessage(t('error'), 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (id) => {
        try {
            const res = await service.delete(id);
            if (res.success) {
                await reloadPage();
                ShowMessage(t('recordDeleted'), 'success');
            }
        } catch {
            ShowMessage(t('error'), 'error');
        }
    };

    const handlePageChange = async (_, newPage) => {
        setPage(newPage);
        await reloadPage(newPage);
    };

    return (
        <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
                <Avatar sx={{ bgcolor: 'primary.light', borderRadius: 1.5 }}>
                    <EventNoteIcon />
                </Avatar>
                <Typography variant="h6" fontWeight={700} sx={{ flexGrow: 1 }}>
                    {t('ch_section_consultation')}
                </Typography>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    disableElevation
                    onClick={handleOpenNew}
                >
                    {t('ch_new_consultation')}
                </Button>
            </Box>

            <Divider sx={{ mb: 3 }} />

            {consultations.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 6, color: 'text.secondary' }}>
                    <EventNoteIcon sx={{ fontSize: 48, opacity: 0.3, mb: 1 }} />
                    <Typography>{t('ch_no_consultations')}</Typography>
                </Box>
            ) : (
                consultations.map(c => (
                    <Paper
                        key={c.idConsultation}
                        variant="outlined"
                        sx={{ p: 2, mb: 2, borderRadius: 2 }}
                    >
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                            <Chip
                                label={c.consultationDate ? new Date(c.consultationDate).toLocaleDateString() : '-'}
                                color="primary"
                                variant="outlined"
                                size="small"
                            />
                            <Box sx={{ display: 'flex', gap: 0.5 }}>
                                <Tooltip title={t('edit')}>
                                    <IconButton size="small" onClick={() => handleOpenEdit(c)}>
                                        <EditIcon fontSize="small" />
                                    </IconButton>
                                </Tooltip>
                                <Tooltip title={t('delete')}>
                                    <IconButton size="small" color="error" onClick={() => handleDelete(c.idConsultation)}>
                                        <DeleteIcon fontSize="small" />
                                    </IconButton>
                                </Tooltip>
                            </Box>
                        </Box>
                        {c.reason && (
                            <Typography variant="body2" sx={{ mb: 0.5 }}>
                                <strong>{t('ch_reason')}:</strong> {c.reason}
                            </Typography>
                        )}
                        {c.diagnosis && (
                            <Typography variant="body2" sx={{ mb: 0.5 }}>
                                <strong>{t('ch_diagnosis')}:</strong> {c.diagnosis}
                            </Typography>
                        )}
                        {c.treatment && (
                            <Typography variant="body2">
                                <strong>{t('ch_treatment')}:</strong> {c.treatment}
                            </Typography>
                        )}
                    </Paper>
                ))
            )}

            {totalConsultations > rowsPerPage && (
                <TablePagination
                    component="div"
                    count={totalConsultations}
                    page={page}
                    onPageChange={handlePageChange}
                    rowsPerPage={rowsPerPage}
                    rowsPerPageOptions={[5]}
                    labelRowsPerPage={t('rows_perPage')}
                />
            )}

            {/* Consultation Dialog */}
            <Dialog
                open={dialogOpen}
                onClose={() => setDialogOpen(false)}
                maxWidth="md"
                fullWidth
                PaperProps={{ sx: { borderRadius: 3 } }}
            >
                <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <EventNoteIcon color="primary" />
                        <Typography variant="h6" fontWeight={700}>
                            {isEditing ? t('ch_edit_consultation') : t('ch_new_consultation')}
                        </Typography>
                    </Box>
                    <IconButton onClick={() => setDialogOpen(false)} size="small">
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>
                <Divider />
                <DialogContent>
                    <Grid container spacing={2} sx={{ mt: 0.5 }}>
                        <Grid item xs={12} sm={4}>
                            <TextField
                                fullWidth
                                required
                                label={t('date')}
                                type="date"
                                value={form.consultationDate}
                                onChange={handleChange('consultationDate')}
                                InputLabelProps={{ shrink: true }}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label={t('ch_reason')}
                                value={form.reason}
                                onChange={handleChange('reason')}
                                multiline
                                rows={3}
                                inputProps={{ maxLength: 1000 }}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label={t('ch_current_condition')}
                                value={form.currentCondition}
                                onChange={handleChange('currentCondition')}
                                multiline
                                rows={4}
                                inputProps={{ maxLength: 2000 }}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label={t('ch_physical_exam')}
                                value={form.physicalExam}
                                onChange={handleChange('physicalExam')}
                                multiline
                                rows={4}
                                inputProps={{ maxLength: 2000 }}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label={t('ch_diagnosis')}
                                value={form.diagnosis}
                                onChange={handleChange('diagnosis')}
                                multiline
                                rows={3}
                                inputProps={{ maxLength: 1000 }}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label={t('ch_treatment')}
                                value={form.treatment}
                                onChange={handleChange('treatment')}
                                multiline
                                rows={4}
                                inputProps={{ maxLength: 2000 }}
                            />
                        </Grid>
                    </Grid>
                </DialogContent>
                <Divider />
                <DialogActions sx={{ p: 2 }}>
                    <Button onClick={() => setDialogOpen(false)} color="error" variant="outlined">
                        {t('cancel')}
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        variant="contained"
                        disableElevation
                        disabled={isLoading}
                        endIcon={isLoading ? <CircularProgress size={18} color="inherit" /> : <SaveIcon />}
                    >
                        {isEditing ? t('save') : t('add')}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default ConsultationSection;
