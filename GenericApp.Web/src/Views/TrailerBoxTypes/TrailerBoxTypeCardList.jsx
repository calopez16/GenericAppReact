import React from 'react';
import {
    Box,
    Typography,
    Paper,
    Switch,
    IconButton,
    Tooltip,
    Avatar,
    Chip,
    Divider,
    Skeleton
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ViewInArIcon from '@mui/icons-material/ViewInAr';
import EmptyData from '@layout/EmptyData';

const TrailerBoxTypeCardList = ({
    trailerBoxTypes,
    loading,
    t,
    handleOpenEditTrailerBoxType,
    handleToggleTrailerBoxTypeStatus,
    handleOpenDeleteConfirmation,
    deletingId,
    isSearch = false,
    rowsPerPage = 5
}) => {

    const MobileTrailerBoxTypeCard = ({ trailerBoxType }) => {
        const isDeleting = deletingId === trailerBoxType.idTrailerBoxType;

        return (
            <Paper
                elevation={0}
                sx={{
                    p: 2, mb: 2, borderRadius: 3, border: '1px solid', borderColor: 'divider',
                    transition: '0.3s', '&:hover': { boxShadow: '0 4px 20px 0 rgba(0,0,0,0.05)' },
                    opacity: isDeleting ? 0.5 : 1
                }}
            >
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Avatar
                        variant="rounded"
                        sx={{
                            width: 42, height: 42, mr: 2, flexShrink: 0,
                            bgcolor: trailerBoxType.isActive ? 'primary.main' : 'grey.400'
                        }}
                    >
                        <ViewInArIcon sx={{ color: 'white', fontSize: 22 }} />
                    </Avatar>
                    <Box sx={{ flexGrow: 1 }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
                            {trailerBoxType.description}
                        </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                        <Tooltip title={t('edit')}>
                            <IconButton
                                onClick={() => handleOpenEditTrailerBoxType(trailerBoxType)}
                                disabled={isDeleting}
                                sx={{ color: 'white', bgcolor: 'primary.main', '&:hover': { bgcolor: 'primary.dark' }, p: 1 }}
                            >
                                <EditIcon fontSize="small" />
                            </IconButton>
                        </Tooltip>
                        <Tooltip title={t('delete')}>
                            <IconButton
                                onClick={() => handleOpenDeleteConfirmation(trailerBoxType)}
                                disabled={isDeleting}
                                sx={{ color: 'white', bgcolor: 'error.main', '&:hover': { bgcolor: 'error.dark' }, p: 1 }}
                            >
                                <DeleteIcon fontSize="small" />
                            </IconButton>
                        </Tooltip>
                    </Box>
                </Box>

                <Divider sx={{ mb: 1.5, borderStyle: 'dashed' }} />

                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Chip
                        label={trailerBoxType.isActive ? t('active') : t('disabled')}
                        size="small"
                        color={trailerBoxType.isActive ? 'success' : 'default'}
                        sx={{ height: 24, fontSize: '0.75rem', fontWeight: 'bold', borderRadius: 1.5 }}
                    />
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="caption" color="text.secondary">{t('status')}</Typography>
                        <Switch
                            size="small"
                            checked={trailerBoxType.isActive}
                            onChange={() => handleToggleTrailerBoxTypeStatus(trailerBoxType)}
                            color="primary"
                            disabled={isDeleting}
                        />
                    </Box>
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
                            <Skeleton variant="rounded" width={42} height={42} sx={{ mr: 2, flexShrink: 0 }} />
                            <Box sx={{ flexGrow: 1 }}>
                                <Skeleton width="60%" />
                                <Skeleton width="40%" />
                            </Box>
                            <Box sx={{ display: 'flex', gap: 1 }}>
                                <Skeleton variant="circular" width={34} height={34} />
                                <Skeleton variant="circular" width={34} height={34} />
                            </Box>
                        </Box>
                        <Divider sx={{ mb: 1.5 }} />
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                            <Skeleton variant="rounded" width={60} height={24} />
                            <Skeleton width={80} />
                        </Box>
                    </Paper>
                ))}
            </Box>
        );
    }

    if ((trailerBoxTypes?.length ?? 0) === 0) {
        return (
            <Box sx={{ mt: 2 }}>
                <EmptyData
                    isSearch={isSearch}
                    title={isSearch ? t('records_notFound') : t('no_trailer_box_types_yet')}
                    description={isSearch ? t('try_another_search_term') : t('start_by_adding_trailer_box_type')}
                />
            </Box>
        );
    }

    return (
        <Box sx={{ mt: 2 }}>
            {trailerBoxTypes.map((trailerBoxType) => (
                <MobileTrailerBoxTypeCard key={trailerBoxType.idTrailerBoxType} trailerBoxType={trailerBoxType} />
            ))}
        </Box>
    );
};

export default TrailerBoxTypeCardList;