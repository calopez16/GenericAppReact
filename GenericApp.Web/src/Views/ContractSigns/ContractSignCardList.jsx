import React, { useContext } from 'react';
import {
    Box,
    Card,
    CardContent,
    Typography,
    IconButton,
    Switch,
    Chip,
    Avatar,
    Tooltip,
    Stack,
    Paper,
    Divider,
    Skeleton
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ImageIcon from '@mui/icons-material/Image';
import { AppContext } from '@helpers/AppContext';
import EmptyData from '@layout/EmptyData';
import { API_BASE_URL } from '@config';

function ContractSignCardList({
    signs,
    loading,
    t,
    handleOpenEditSign,
    handleToggleSignStatus,
    handleOpenDeleteConfirmation,
    deletingId,
    isSearch = false,
    rowsPerPage = 5
}) {
    const { companySelected } = useContext(AppContext);

    const MobileSignCard = ({ sign }) => {
        const isDeleting = sign.idContractSign === deletingId;

        return (
            <Paper
                elevation={0}
                sx={{
                    p: 2,
                    mb: 2,
                    borderRadius: 3,
                    border: '1px solid',
                    borderColor: 'divider',
                    opacity: isDeleting ? 0.5 : 1,
                    transition: '0.3s',
                    '&:hover': { boxShadow: '0 4px 20px 0 rgba(0,0,0,0.05)' }
                }}
            >
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Box sx={{ flexGrow: 1 }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
                            {sign.name}
                        </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 1 }}>                       
                        <Tooltip title={t('edit')}>
                            <IconButton
                                onClick={() => handleOpenEditSign(sign)}
                                disabled={isDeleting}
                                sx={{ color: 'white', bgcolor: 'primary.main', '&:hover': { bgcolor: 'primary.dark' }, p: 1 }}
                            >
                                <EditIcon fontSize="small" />
                            </IconButton>
                        </Tooltip>
                        <Tooltip title={t('delete')}>
                            <IconButton
                                onClick={() => handleOpenDeleteConfirmation(sign)}
                                disabled={isDeleting}
                                sx={{ color: 'white', bgcolor: 'error.main', '&:hover': { bgcolor: 'error.dark' }, p: 1 }}
                            >
                                <DeleteIcon fontSize="small" />
                            </IconButton>
                        </Tooltip>
                    </Box>
                </Box>


                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mb: 2 }}>
                    {sign.signFileName ? (
                        <Avatar
                            variant="rounded"
                            src={`${API_BASE_URL}/img/signs/${companySelected?.idCompany}/${sign.signFileName}`}
                            sx={{ width: '100%', height: '100%' }}
                        >
                            <ImageIcon />
                        </Avatar>
                    ) : (
                        <Avatar
                            variant="rounded"
                            sx={{ width: 100, height: 60, bgcolor: 'action.hover' }}
                        >
                            <ImageIcon />
                        </Avatar>
                    )}
                </Box>
                <Divider sx={{ my: 1.5 }} />
                
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Chip
                        label={sign.isActive ? t('active') : t('disabled')}
                        size="small"
                        color={sign.isActive ? 'success' : 'default'}
                        sx={{ height: 24, fontSize: '0.75rem', fontWeight: 'bold', borderRadius: 1.5 }}
                    />
                    <Switch
                        checked={sign.isActive ?? false}
                        onChange={() => handleToggleSignStatus(sign)}
                        size="small"
                        disabled={isDeleting}
                    />
                </Box>
            </Paper>
        );
    };

    if (loading) {
        return (
            <Box sx={{ mb: 2 }}>
                <Stack spacing={2}>
                    {Array.from(new Array(rowsPerPage)).map((_, index) => (
                        <Paper
                            key={`skeleton-${index}`}
                            elevation={0}
                            sx={{ p: 2, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}
                        >
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                <Box sx={{ flexGrow: 1 }}>
                                    <Skeleton variant="text" width="60%" height={28} />
                                    <Skeleton variant="rounded" width={80} height={24} sx={{ mt: 1 }} />
                                </Box>
                                <Skeleton variant="circular" width={42} height={42} />
                            </Box>
                            <Divider sx={{ my: 1.5 }} />
                            <Skeleton variant="rectangular" width={100} height={60} sx={{ borderRadius: 1, mb: 2 }} />
                            <Box sx={{ display: 'flex', gap: 1 }}>
                                <Skeleton variant="rounded" width="50%" height={40} />
                                <Skeleton variant="rounded" width="50%" height={40} />
                            </Box>
                        </Paper>
                    ))}
                </Stack>
            </Box>
        );
    }

    if (signs.length === 0) {
        return (
            <EmptyData
                iconComponent={ImageIcon}
                title={isSearch ? t('no_results_found') : t('noRecordsFound')}
                subtitle={isSearch ? t('try_another_search_term') : t('contractSigns_description')}
            />
        );
    }

    return (
        <Box sx={{ mb: 2 }}>
            <Stack spacing={2}>
                {signs.map((sign) => (
                    <MobileSignCard key={sign.idContractSign} sign={sign} />
                ))}
            </Stack>
        </Box>
    );
}

export default ContractSignCardList;
