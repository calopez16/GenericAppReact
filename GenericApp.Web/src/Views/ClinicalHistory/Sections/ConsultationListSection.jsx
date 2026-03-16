import React, { useState } from 'react';
import {
    Box, Typography, Divider, Avatar, Paper, Button, IconButton,
    Chip, Tooltip, TablePagination,
} from '@mui/material';
import Grid from '@mui/material/Grid';
import EventNoteIcon from '@mui/icons-material/EventNote';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ShowMessage } from '@helpers/NotificationService';
import { DataAPIConsultationsService } from '@data/Consultations/Data';

const ConsultationListSection = ({ client, consultations, setConsultations, totalConsultations, setTotalConsultations }) => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const service = DataAPIConsultationsService();

    const [page, setPage] = useState(0);
    const rowsPerPage = 5;

    const reloadPage = async (p = page) => {
        const res = await service.getByClientId(client.idClient, p + 1, rowsPerPage);
        if (res.success && res.data) {
            setConsultations(res.data.data ?? []);
            setTotalConsultations(res.data.totalCount ?? 0);
        }
    };

    const handleDelete = async (id) => {
        const res = await service.delete(id);
        if (res.success) {
            ShowMessage(t('recordDeleted'), 'success');
            await reloadPage();
        } else {
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
                <Button variant="contained" startIcon={<AddIcon />} disableElevation onClick={() => navigate('/consultas/nueva')}>
                    {t('ch_new_consultation')}
                </Button>
            </Box>

            <Divider sx={{ mb: 3 }} />

            {consultations.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 6, color: 'text.secondary' }}>
                    <EventNoteIcon sx={{ fontSize: 48, opacity: 0.3, mb: 1 }} />
                    <Typography>{t('ch_no_consultations')}</Typography>
                    <Button sx={{ mt: 2 }} variant="outlined" startIcon={<AddIcon />} onClick={() => navigate('/consultas/nueva')}>
                        {t('ch_new_consultation')}
                    </Button>
                </Box>
            ) : (
                <Grid container spacing={2}>
                    {consultations.map(c => (
                        <Grid key={c.idConsultation} size={{ xs: 12 }}>
                            <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                                    <Chip
                                        label={c.consultationDate ? new Date(c.consultationDate).toLocaleDateString() : '-'}
                                        color="primary" variant="outlined" size="small"
                                    />
                                    <Box sx={{ display: 'flex', gap: 0.5 }}>
                                        <Tooltip title={t('edit')}>
                                            <IconButton size="small" onClick={() => navigate(`/consultas/${c.idConsultation}`)}>
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
                        </Grid>
                    ))}
                </Grid>
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
        </Box>
    );
};

export default ConsultationListSection;
