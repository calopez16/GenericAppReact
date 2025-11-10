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
    Box
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

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
    maxHeight: '1000px',
};

const SeasonListTable = ({
    seasons,
    loading,
    t,
    handleOpenEditSeason,
    handleToggleSeasonStatus,
    handleOpenDeleteConfirmation,
    setSelectedSeason,
    deletingId
}) => {

    const minTableWidth = 900;

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        try {
            return new Date(dateString).toLocaleDateString();
        } catch {
            return dateString;
        }
    };

    return (
        <TableContainer component={Paper} sx={{ overflowX: 'auto' }}>
            <Table sx={{ minWidth: minTableWidth }}>
                <TableHead>
                    <TableRow>
                        <TableCell>{t('active')}</TableCell>
                        <TableCell>{t('name')}</TableCell>
                        <TableCell>{t('initialDate')}</TableCell>
                        <TableCell>{t('endDate')}</TableCell>
                        <TableCell>{t('status')}</TableCell>
                        <TableCell align="right">{t('actions')}</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {loading ? (
                        <TableRow>
                            <TableCell colSpan={6} align="center">
                                {t('loading')}...
                            </TableCell>
                        </TableRow>
                    ) : (seasons?.length ?? 0) === 0 ? (
                        <TableRow>
                            <TableCell colSpan={6} align="center"> {t('records_notFound')}.</TableCell>
                        </TableRow>
                    ) : (
                        seasons.map((season) => {
                            const isDeleting = season.idSeason === deletingId;

                            const rowCurrentStyle = isDeleting ? deletingRowStyle : normalRowStyle;

                            return (
                                <TableRow
                                    key={season.idSeason}
                                    sx={rowCurrentStyle}
                                >
                                    <TableCell>
                                        <Tooltip title={season.isActive ? t('disable') : t('enable')}>
                                            <Switch
                                                checked={season.isActive}
                                                onChange={() => handleToggleSeasonStatus(season)}
                                                color="primary"
                                                disabled={isDeleting}
                                            />
                                        </Tooltip>
                                    </TableCell>
                                    <TableCell>
                                        <Tooltip title={`ID: ${season.idSeason}`}>
                                            <Typography>{season.name}</Typography>
                                        </Tooltip>
                                    </TableCell>
                                    <TableCell>
                                        {formatDate(season.initialDate)}
                                    </TableCell>
                                    <TableCell>
                                        {formatDate(season.endDate)}
                                    </TableCell>
                                    <TableCell>
                                        {season.isClosed ? (
                                            <Chip
                                                label={t('closed')}
                                                size="small"
                                                color="error"
                                            />
                                        ) : (
                                            <Chip
                                                label={t('open')}
                                                size="small"
                                                color="success"
                                                variant="outlined"
                                            />
                                        )}
                                    </TableCell>
                                    <TableCell align="right">
                                        <Tooltip title={t('edit')}>
                                            <IconButton
                                                color="primary"
                                                onClick={() => handleOpenEditSeason(season)}
                                                disabled={isDeleting}
                                            >
                                                <EditIcon />
                                            </IconButton>
                                        </Tooltip>
                                        <Tooltip title={t('delete')}>
                                            <IconButton
                                                color="error"
                                                onClick={() => handleOpenDeleteConfirmation(season)}
                                                sx={{ ml: 1 }}
                                                disabled={isDeleting}
                                            >
                                                <DeleteIcon />
                                            </IconButton>
                                        </Tooltip>
                                    </TableCell>
                                </TableRow>
                            );
                        })
                    )}
                </TableBody>
            </Table>
        </TableContainer>
    );
};

export default SeasonListTable;