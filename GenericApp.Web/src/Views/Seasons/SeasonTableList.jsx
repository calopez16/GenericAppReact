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

const SeasonListTable = ({
    seasons,
    loading,
    t,
    handleOpenEditSeason,
    handleToggleSeasonStatus,
    handleOpenDeleteConfirmation,
    setSelectedSeason
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
                        <TableCell>{t('Initial Date')}</TableCell>
                        <TableCell>{t('End Date')}</TableCell>
                        <TableCell>{t('Status')}</TableCell>
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
                        seasons.map((season) => (
                            <TableRow key={season.idSeason}>
                                <TableCell>
                                    <Tooltip title={season.isActive ? t('disable') : t('enable')}>
                                        <Switch
                                            checked={season.isActive}
                                            onChange={() => handleToggleSeasonStatus(season)}
                                            color="primary"
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
                                            label={t('Closed')}
                                            size="small"
                                            color="error"
                                        />
                                    ) : (
                                        <Chip
                                            label={t('Open')}
                                            size="small"
                                            color="success"
                                            variant="outlined"
                                        />
                                    )}
                                </TableCell>
                                <TableCell align="right">
                                    <Tooltip title={t('edit')}>
                                        <IconButton color="primary" onClick={() => handleOpenEditSeason(season)}>
                                            <EditIcon />
                                        </IconButton>
                                    </Tooltip>
                                    <Tooltip title={t('delete')}>
                                        <IconButton
                                            color="error"
                                            onClick={() => handleOpenDeleteConfirmation(season)}
                                            sx={{ ml: 1 }}
                                        >
                                            <DeleteIcon />
                                        </IconButton>
                                    </Tooltip>
                                </TableCell>
                            </TableRow>
                        ))
                    )}
                </TableBody>
            </Table>
        </TableContainer>
    );
};

export default SeasonListTable;