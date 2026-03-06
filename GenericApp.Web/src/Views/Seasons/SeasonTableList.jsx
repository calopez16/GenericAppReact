import React from 'react';
import {
    TableContainer,
    Paper,
    Table,
    TableHead,
    TableRow,
    TableCell,
    TableBody,
    Switch,
    IconButton,
    Tooltip,
    Typography,
    Chip,
    Box,
    Skeleton
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import EmptyData from '@layout/EmptyData';

const ANIMATION_DURATION = 500;

const deletingRowStyle = {
    transition: `all ${ANIMATION_DURATION}ms ease-out`,
    transform: 'translateX(-100%)',
    opacity: 0,
    height: 0,
    padding: 0,
    overflow: 'hidden',
};

const normalRowStyle = {
    transition: `all ${ANIMATION_DURATION}ms ease-out`,
    transform: 'translateX(0)',
    opacity: 1,
};

const SeasonListTable = ({
    seasons,
    loading,
    t,
    handleOpenEditSeason,
    handleToggleSeasonStatus,
    handleOpenDeleteConfirmation,
    setSelectedSeason,
    deletingId,
    isSearch = false,
    rowsPerPage = 5
}) => {

    const rowHeight = 65;
    const colSpan = 6;

    const emptyRows = !loading && seasons?.length > 0
        ? Math.max(0, rowsPerPage - seasons.length)
        : 0;

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        try {
            return new Date(dateString).toLocaleDateString();
        } catch {
            return dateString;
        }
    };

    return (
        <TableContainer
            component={Paper}
            elevation={0}
            sx={{ overflowX: 'auto', border: '1px solid', borderColor: 'divider', borderRadius: 2 }}
        >
            <Table sx={{ minWidth: 900 }}>
                <TableHead sx={{ bgcolor: 'action.hover' }}>
                    <TableRow>
                        <TableCell sx={{ fontWeight: 'bold', width: 10 }} align="center">{t('status')}</TableCell>
                        <TableCell sx={{ fontWeight: 'bold' }}>{t('name')}</TableCell>
                        <TableCell sx={{ fontWeight: 'bold' }}>{t('initialDate')}</TableCell>
                        <TableCell sx={{ fontWeight: 'bold' }}>{t('endDate')}</TableCell>
                        <TableCell sx={{ fontWeight: 'bold' }}>{t('status')}</TableCell>
                        <TableCell sx={{ fontWeight: 'bold', width: 200 }} align="center">{t('actions')}</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {loading ? (
                        Array.from(new Array(rowsPerPage)).map((_, index) => (
                            <TableRow key={`skeleton-${index}`} style={{ height: rowHeight }}>
                                <TableCell align="center">
                                    <Skeleton variant="rectangular" width={40} height={20} sx={{ mx: 'auto', borderRadius: 1 }} />
                                </TableCell>
                                <TableCell><Skeleton width="60%" /></TableCell>
                                <TableCell><Skeleton width="50%" /></TableCell>
                                <TableCell><Skeleton width="50%" /></TableCell>
                                <TableCell><Skeleton variant="rounded" width={60} height={22} /></TableCell>
                                <TableCell align="center">
                                    <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
                                        <Skeleton variant="circular" width={30} height={30} />
                                        <Skeleton variant="circular" width={30} height={30} />
                                    </Box>
                                </TableCell>
                            </TableRow>
                        ))
                    ) : (
                        <>
                            {seasons?.map((season) => {
                                const isDeleting = season.idSeason === deletingId;

                                return (
                                    <TableRow
                                        key={season.idSeason}
                                        hover
                                        sx={isDeleting ? deletingRowStyle : { ...normalRowStyle, '&:last-child td, &:last-child th': { border: 0 }, height: rowHeight }}
                                    >
                                        <TableCell align="center">
                                            <Switch
                                                checked={season.isActive}
                                                onChange={() => handleToggleSeasonStatus(season)}
                                                color="primary"
                                                disabled={isDeleting}
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                                {season.name}
                                            </Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Typography variant="body2" color="text.secondary">
                                                {formatDate(season.initialDate)}
                                            </Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Typography variant="body2" color="text.secondary">
                                                {formatDate(season.endDate)}
                                            </Typography>
                                        </TableCell>
                                        <TableCell>
                                            {season.isClosed ? (
                                                <Chip label={t('closed')} size="small" color="error" sx={{ fontWeight: 'bold', borderRadius: 1.5 }} />
                                            ) : (
                                                <Chip label={t('open')} size="small" color="success" variant="outlined" sx={{ fontWeight: 'bold', borderRadius: 1.5 }} />
                                            )}
                                        </TableCell>
                                        <TableCell align="center">
                                            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
                                                <Tooltip title={t('edit')}>
                                                    <IconButton
                                                        onClick={() => handleOpenEditSeason(season)}
                                                        disabled={isDeleting}
                                                        sx={{ color: 'white', bgcolor: 'primary.main', '&:hover': { bgcolor: 'primary.dark' }, p: 1 }}
                                                    >
                                                        <EditIcon fontSize="small" />
                                                    </IconButton>
                                                </Tooltip>
                                                <Tooltip title={t('delete')}>
                                                    <IconButton
                                                        onClick={() => handleOpenDeleteConfirmation(season)}
                                                        disabled={isDeleting}
                                                        sx={{ color: 'white', bgcolor: 'error.main', '&:hover': { bgcolor: 'error.dark' }, p: 1 }}
                                                    >
                                                        <DeleteIcon fontSize="small" />
                                                    </IconButton>
                                                </Tooltip>
                                            </Box>
                                        </TableCell>
                                    </TableRow>
                                );
                            })}

                            {emptyRows > 0 && (
                                Array.from(new Array(emptyRows)).map((_, index) => (
                                    <TableRow key={`empty-${index}`} style={{ height: rowHeight }}>
                                        <TableCell colSpan={colSpan} sx={{ borderBottom: index === emptyRows - 1 ? 'none' : '1px solid rgba(224, 224, 224, 0.4)' }} />
                                    </TableRow>
                                ))
                            )}
                        </>
                    )}
                </TableBody>
            </Table>

            {!loading && (seasons?.length ?? 0) === 0 && (
                <Box sx={{ mt: 2 }}>
                    <EmptyData
                        isSearch={isSearch}
                        title={isSearch ? t('records_notFound') : t('no_seasons_yet')}
                        description={isSearch ? t('try_another_search_term') : t('start_by_adding_season')}
                    />
                </Box>
            )}
        </TableContainer>
    );
};

export default SeasonListTable;