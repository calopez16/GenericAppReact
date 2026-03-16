import React, { useState, useEffect, useContext, useRef } from 'react';
import {
    Box, Typography, Paper, Button, Avatar, LinearProgress,
    TablePagination, IconButton, Tooltip, Chip,
    TextField, ClickAwayListener,
} from '@mui/material';
import Grid from '@mui/material/Grid';
import EventNoteIcon from '@mui/icons-material/EventNote';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import PersonIcon from '@mui/icons-material/Person';
import SearchIcon from '@mui/icons-material/Search';
import CloseIcon from '@mui/icons-material/Close';
import HistoryIcon from '@mui/icons-material/ManageSearch';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { AppContext } from '@helpers/AppContext';
import { ShowMessage } from '@helpers/NotificationService';
import { DataAPIConsultationsService } from '@data/Consultations/Data';
import ConfirmationModal from '@layout/ConfirmationModal';
import EmptyData from '@layout/EmptyData';

function ConsultationsPage() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const service = DataAPIConsultationsService();
    const { companySelected } = useContext(AppContext);

    const [consultations, setConsultations] = useState([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [loading, setLoading] = useState(true);

    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [isSearchExpanded, setIsSearchExpanded] = useState(false);
    const searchRef = useRef(null);

    const [deleteTarget, setDeleteTarget] = useState(null);
    const [confirmOpen, setConfirmOpen] = useState(false);

    useEffect(() => {
        const t = setTimeout(() => setDebouncedSearch(searchTerm), 500);
        return () => clearTimeout(t);
    }, [searchTerm]);

    useEffect(() => {
        loadData();
    }, [page, rowsPerPage, debouncedSearch, companySelected]);

    const loadData = async () => {
        setLoading(true);
        try {
            const res = await service.getRecent(page + 1, rowsPerPage, debouncedSearch, companySelected?.idCompany);
            if (res.success && res.data) {
                setConsultations(res.data.data ?? []);
                setTotal(res.data.totalCount ?? 0);
            }
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        setConfirmOpen(false);
        if (!deleteTarget) return;
        const res = await service.delete(deleteTarget.idConsultation);
        if (res.success) {
            ShowMessage(t('recordDeleted'), 'success');
            loadData();
        } else {
            ShowMessage(t('error'), 'error');
        }
        setDeleteTarget(null);
    };

    const toggleSearch = () => {
        if (!isSearchExpanded) {
            setIsSearchExpanded(true);
            setTimeout(() => searchRef.current?.focus(), 100);
        } else if (searchTerm !== '') {
            setSearchTerm('');
        } else {
            setIsSearchExpanded(false);
        }
    };

    return (
        <Box>
            {/* Header */}
            <Paper elevation={0} sx={{ p: 2, mb: 2, borderRadius: 2, border: '1px solid', borderColor: 'divider', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar sx={{ bgcolor: 'primary.light', color: 'white', width: 45, height: 45, borderRadius: 2 }}>
                        <EventNoteIcon />
                    </Avatar>
                    <Box>
                        <Typography variant="h6" fontWeight={700} lineHeight={1.2}>{t('ch_consultations')}</Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ display: { xs: 'none', sm: 'block' } }}>
                            {t('ch_consultations_desc')}
                        </Typography>
                    </Box>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <ClickAwayListener onClickAway={() => { if (searchTerm === '') setIsSearchExpanded(false); }}>
                        <Box sx={{
                            display: 'flex', flexDirection: 'row-reverse', alignItems: 'center',
                            bgcolor: isSearchExpanded ? 'action.hover' : 'transparent',
                            borderRadius: 10, px: isSearchExpanded ? 1 : 0,
                            width: isSearchExpanded ? 260 : 42, height: 42,
                            transition: 'all 0.3s cubic-bezier(0.4,0,0.2,1)',
                            border: '1px solid', borderColor: isSearchExpanded ? 'primary.main' : 'transparent',
                            overflow: 'hidden',
                        }}>
                            <Tooltip title={t('search')}>
                                <IconButton onClick={toggleSearch} size="small" sx={{ color: isSearchExpanded ? 'primary.main' : 'text.secondary', flexShrink: 0, width: 42, height: 42 }}>
                                    {isSearchExpanded && searchTerm !== '' ? <CloseIcon /> : <SearchIcon />}
                                </IconButton>
                            </Tooltip>
                            <TextField
                                inputRef={searchRef}
                                placeholder={t('search')}
                                variant="standard"
                                fullWidth
                                value={searchTerm}
                                onChange={(e) => { setSearchTerm(e.target.value); setPage(0); }}
                                InputProps={{ disableUnderline: true, sx: { ml: 1, fontSize: '0.9rem', visibility: isSearchExpanded ? 'visible' : 'hidden', opacity: isSearchExpanded ? 1 : 0, transition: 'opacity 0.2s' } }}
                            />
                        </Box>
                    </ClickAwayListener>
                    <Button variant="contained" disableElevation endIcon={<AddIcon />} onClick={() => navigate('/consultas/nueva')}>
                        {t('ch_new_consultation')}
                    </Button>
                </Box>
            </Paper>

            {loading && <LinearProgress sx={{ mb: 2, borderRadius: 1 }} />}

            {/* Consultation Cards */}
            {!loading && consultations.length === 0 ? (
                <EmptyData
                    isSearch={debouncedSearch !== ''}
                    title={debouncedSearch !== '' ? t('records_notFound') : t('ch_no_consultations')}
                    description={debouncedSearch !== '' ? t('try_another_search_term') : t('ch_no_consultations_desc')}
                />
            ) : (
                <Grid container spacing={2}>
                    {consultations.map(c => (
                        <Grid key={c.idConsultation} size={{ xs: 12, md: 6, lg: 4 }}>
                            <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 2.5, height: '100%', display: 'flex', flexDirection: 'column', gap: 1, transition: '0.2s', '&:hover': { boxShadow: 3 } }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                    <Chip
                                        label={c.consultationDate ? new Date(c.consultationDate).toLocaleDateString() : '-'}
                                        color="primary" variant="outlined" size="small"
                                    />
                                    <Box sx={{ display: 'flex', gap: 0.5 }}>
                                        <Tooltip title={t('ch_history')}>
                                            <IconButton size="small" color="success" onClick={() => navigate(`/historia-clinica/${c.idClient}`)}>
                                                <HistoryIcon fontSize="small" />
                                            </IconButton>
                                        </Tooltip>
                                        <Tooltip title={t('edit')}>
                                            <IconButton size="small" onClick={() => navigate(`/consultas/${c.idConsultation}`)}>
                                                <EditIcon fontSize="small" />
                                            </IconButton>
                                        </Tooltip>
                                        <Tooltip title={t('delete')}>
                                            <IconButton size="small" color="error" onClick={() => { setDeleteTarget(c); setConfirmOpen(true); }}>
                                                <DeleteIcon fontSize="small" />
                                            </IconButton>
                                        </Tooltip>
                                    </Box>
                                </Box>

                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <Avatar sx={{ width: 32, height: 32, bgcolor: 'secondary.light', fontSize: 14 }}>
                                        <PersonIcon fontSize="small" />
                                    </Avatar>
                                    <Typography variant="subtitle2" fontWeight={700} noWrap>
                                        {c.clientName ?? '-'}
                                    </Typography>
                                </Box>

                                {c.reason && (
                                    <Typography variant="body2" color="text.secondary" sx={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                        <strong>{t('ch_reason')}:</strong> {c.reason}
                                    </Typography>
                                )}
                                {c.diagnosis && (
                                    <Typography variant="body2" color="text.secondary" sx={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                        <strong>{t('ch_diagnosis')}:</strong> {c.diagnosis}
                                    </Typography>
                                )}
                            </Paper>
                        </Grid>
                    ))}
                </Grid>
            )}

            <TablePagination
                component="div"
                count={total}
                page={page}
                rowsPerPage={rowsPerPage}
                onPageChange={(_, p) => setPage(p)}
                onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
                rowsPerPageOptions={[5, 10, 25]}
                labelRowsPerPage={t('rows_perPage')}
                labelDisplayedRows={({ from, to, count }) => `${from}-${to} ${t('of')} ${count}`}
            />

            <ConfirmationModal
                open={confirmOpen}
                onClose={() => { setConfirmOpen(false); setDeleteTarget(null); }}
                onConfirm={handleDelete}
                title={t('clients_delete')}
                message={t('ch_confirm_delete_consultation')}
                confirmText={t('delete')}
                cancelText={t('cancel')}
                type="danger"
            />
        </Box>
    );
}

export default ConsultationsPage;
