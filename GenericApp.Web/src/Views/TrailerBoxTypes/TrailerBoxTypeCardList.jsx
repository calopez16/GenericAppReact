import React from 'react';
import {
    Box,
    Typography,
    Paper,
    Switch,
    IconButton,
    Tooltip
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

const TrailerBoxTypeCardList = ({
    trailerBoxTypes,
    loading,
    t,
    handleOpenEditTrailerBoxType,
    handleToggleTrailerBoxTypeStatus,
    handleOpenDeleteConfirmation,
    setSelectedTrailerBoxType
}) => {

    const MobileTrailerBoxTypeCard = ({ trailerBoxType }) => (
        <Paper
            sx={{
                p: 2,
                mb: 2,
                display: 'flex',
                flexDirection: 'column',
                gap: 1,
                borderLeft: trailerBoxType.isActive ? '4px solid green' : '4px solid grey'
            }}
        >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                    <Typography variant="body1" component="div" sx={{ fontWeight: 'bold' }}>
                        {trailerBoxType.name}
                    </Typography>
                </Box>
                <Box>
                    <Tooltip title={t('edit')}>
                        <IconButton size="small" color="primary" onClick={() => handleOpenEditTrailerBoxType(trailerBoxType)}>
                            <EditIcon />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title={t('delete')}>
                        <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleOpenDeleteConfirmation(trailerBoxType)}
                        >
                            <DeleteIcon />
                        </IconButton>
                    </Tooltip>
                </Box>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Typography variant="body2" color="text.secondary">
                    {t('status')}: {trailerBoxType.isActive ? t('active') : t('disabled')}
                </Typography>
                <Tooltip title={trailerBoxType.isActive ? t('disable') : t('enable')}>
                    <Switch
                        size="small"
                        checked={trailerBoxType.isActive}
                        onChange={() => handleToggleTrailerBoxTypeStatus(trailerBoxType)}
                        color="primary"
                    />
                </Tooltip>
            </Box>
        </Paper>
    );

    if (loading) {
        return <Typography align="center" sx={{ mt: 2 }}>{t('loading')}...</Typography>;
    }

    if ((trailerBoxTypes?.length ?? 0) === 0) {
        return <Typography align="center" sx={{ mt: 2 }}>{t('records_notFound')}.</Typography>;
    }

    return (
        <Box>
            {trailerBoxTypes.map((trailerBoxType) => (
                <MobileTrailerBoxTypeCard key={trailerBoxType.idTrailerBoxType} trailerBoxType={trailerBoxType} />
            ))}
        </Box>
    );
};

export default TrailerBoxTypeCardList;