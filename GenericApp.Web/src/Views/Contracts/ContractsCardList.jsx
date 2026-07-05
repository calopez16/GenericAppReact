import React from 'react';
import {
    Box,
    Typography,
    Paper,
    Switch,
    IconButton,
    Tooltip,
    Chip,
    Divider,
    Skeleton
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import ArticleOutlinedIcon from '@mui/icons-material/ArticleOutlined';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import EmptyData from '@layout/EmptyData';

const ContractsCardList = ({
    contracts,
    loading,
    t,
    handleToggleContractStatus,
    handleOpenDeleteConfirmation,
    handleOpenPreview,
    deletingId,
    isSearch = false,
    rowsPerPage = 5
}) => {

    const formatDate = (dateString) => {
        if (!dateString) return '-';
        const date = new Date(dateString);
        return date.toLocaleString('es-ES', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hour12: true });
    };

    const MobileContractCard = ({ contract }) => {
        const isDeleting = contract.idContract === deletingId;

        return (
            <Paper
                elevation={0}
                sx={{
                    p: 2, mb: 2, borderRadius: 3, border: '1px solid', borderColor: 'divider',
                    opacity: isDeleting ? 0.5 : 1,
                    transition: '0.3s', '&:hover': { boxShadow: '0 4px 20px 0 rgba(0,0,0,0.05)' }
                }}
            >
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Box sx={{ flexGrow: 1 }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
                            {contract.documentName || t('noDocumentName')}
                        </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                        <Tooltip title={t('preview')}>
                            <IconButton
                                onClick={() => handleOpenPreview(contract)}
                                disabled={isDeleting}
                                sx={{ color: 'white', bgcolor: 'info.main', '&:hover': { bgcolor: 'info.dark' }, p: 1 }}
                            >
                                <VisibilityIcon fontSize="small" />
                            </IconButton>
                        </Tooltip>
                        <Tooltip title={t('delete')}>
                            <IconButton
                                onClick={() => handleOpenDeleteConfirmation(contract)}
                                disabled={isDeleting}
                                sx={{ color: 'white', bgcolor: 'error.main', '&:hover': { bgcolor: 'error.dark' }, p: 1 }}
                            >
                                <DeleteIcon fontSize="small" />
                            </IconButton>
                        </Tooltip>
                    </Box>
                </Box>

                {contract.employeeName && (
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, mb: 1 }}>
                        <ArticleOutlinedIcon sx={{ fontSize: 18, color: 'text.secondary', mt: 0.2 }} />
                        <Typography variant="body2" color="text.secondary">
                            {contract.employeeName}
                        </Typography>
                    </Box>
                )}

                {contract.signatureDate && (
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, mb: 1 }}>
                        <CalendarTodayIcon sx={{ fontSize: 16, color: 'text.secondary', mt: 0.3 }} />
                        <Typography variant="body2" color="text.secondary">
                            {formatDate(contract.signatureDate)}
                        </Typography>
                    </Box>
                )}

                <Divider sx={{ mb: 1.5, borderStyle: 'dashed' }} />

                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Chip
                        label={contract.isActive ? t('active') : t('disabled')}
                        size="small"
                        color={contract.isActive ? 'success' : 'default'}
                        sx={{ height: 24, fontSize: '0.75rem', fontWeight: 'bold', borderRadius: 1.5 }}
                    />
                    <Switch
                        checked={contract.isActive ?? false}
                        onChange={() => handleToggleContractStatus(contract)}
                        size="small"
                        disabled={isDeleting}
                    />
                </Box>
            </Paper>
        );
    };

    if (loading) {
        return (
            <Box>
                {Array.from(new Array(rowsPerPage)).map((_, index) => (
                    <Paper key={index} elevation={0} sx={{ p: 2, mb: 2, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                            <Box sx={{ flexGrow: 1 }}>
                                <Skeleton variant="text" width="60%" height={24} />
                            </Box>
                            <Box sx={{ display: 'flex', gap: 1 }}>
                                <Skeleton variant="circular" width={34} height={34} />
                                <Skeleton variant="circular" width={34} height={34} />
                            </Box>
                        </Box>
                        <Skeleton variant="text" width="80%" />
                        <Divider sx={{ my: 1.5 }} />
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Skeleton variant="rounded" width={60} height={24} />
                            <Skeleton variant="rectangular" width={36} height={20} sx={{ borderRadius: 1 }} />
                        </Box>
                    </Paper>
                ))}
            </Box>
        );
    }

    if (!contracts || contracts.length === 0) {
        return (
            <EmptyData
                message={isSearch ? t('no_results_found') : t('no_contracts_yet')}
                description={isSearch ? t('try_another_search_term') : t('start_by_adding_contract')}
            />
        );
    }

    return (
        <Box>
            {contracts.map((contract) => (
                <MobileContractCard key={contract.idContract} contract={contract} />
            ))}
        </Box>
    );
};

export default ContractsCardList;
