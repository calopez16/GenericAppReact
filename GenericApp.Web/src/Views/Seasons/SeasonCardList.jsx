import React from 'react';
import {
    Box,
    Typography,
    Paper,
    Switch,
    IconButton,
    Tooltip,
    Chip
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

const SeasonCardList = ({
    seasons,
    loading,
    t,
    handleOpenEditSeason,
    handleToggleSeasonStatus,
    handleOpenDeleteConfirmation,
    setSelectedSeason
}) => {

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        try {
            return new Date(dateString).toLocaleDateString();
        } catch {
            return dateString;
        }
    };

    const MobileSeasonCard = ({ season }) => (
        <Paper
            sx={{
                p: 2,
                mb: 2,
                display: 'flex',
                flexDirection: 'column',
                gap: 1,
                borderLeft: season.isActive ? '4px solid green' : '4px solid grey'
            }}
        >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="body1" component="div" sx={{ fontWeight: 'bold' }}>
                    {season.name}
                </Typography>
                <Box>
                    <Tooltip title={t('edit')}>
                        <IconButton size="small" color="primary" onClick={() => handleOpenEditSeason(season)}>
                            <EditIcon />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title={t('delete')}>
                        <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleOpenDeleteConfirmation(season)}
                        >
                            <DeleteIcon />
                        </IconButton>
                    </Tooltip>
                </Box>
            </Box>

            <Box>
                <Typography variant="body2" color="text.secondary">
                    {t('initialDate')}: {formatDate(season.initialDate)}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                    {t('endDate')}: {formatDate(season.endDate)}
                </Typography>
                {season.description && (
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                        {t('description')}: {season.description}
                    </Typography>
                )}
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pt: 1 }}>
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
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Typography variant="body2" color="text.secondary">
                    {t('status')}: {season.isActive ? t('active') : t('disabled')}
                </Typography>
                <Tooltip title={season.isActive ? t('disable') : t('enable')}>
                    <Switch
                        size="small"
                        checked={season.isActive}
                        onChange={() => handleToggleSeasonStatus(season)}
                        color="primary"
                    />
                </Tooltip>
            </Box>        
        </Paper>
    );

    if (loading) {
        return <Typography align="center" sx={{ mt: 2 }}>{t('loading')}...</Typography>;
    }

    if ((seasons?.length ?? 0) === 0) {
        return <Typography align="center" sx={{ mt: 2 }}>{t('records_notFound')}.</Typography>;
    }

    return (
        <Box>
            {seasons.map((season) => (
                <MobileSeasonCard key={season.idSeason} season={season} />
            ))}
        </Box>
    );
};

export default SeasonCardList;