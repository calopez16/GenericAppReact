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

const LabelCardList = ({
    labels,
    loading,
    t,
    handleOpenEditLabel,
    handleToggleLabelStatus,
    handleOpenDeleteConfirmation,
    setSelectedLabel
}) => {

    const MobileLabelCard = ({ label }) => (
        <Paper
            sx={{
                p: 2,
                mb: 2,
                display: 'flex',
                flexDirection: 'column',
                gap: 1,
                borderLeft: label.isActive ? '4px solid green' : '4px solid grey'
            }}
        >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                    <Typography variant="body1" component="div" sx={{ fontWeight: 'bold' }}>
                        {label.description}
                    </Typography>
                </Box>
                <Box>
                    <Tooltip title={t('edit')}>
                        <IconButton size="small" color="primary" onClick={() => handleOpenEditLabel(label)}>
                            <EditIcon />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title={t('delete')}>
                        <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleOpenDeleteConfirmation(label)}
                        >
                            <DeleteIcon />
                        </IconButton>
                    </Tooltip>
                </Box>
            </Box>

            {/* ¡NUEVO CAMPO! MaxBoxQuantity */}
            <Box>
                <Typography variant="caption" color="text.secondary">
                    {t('label_maxBoxQuantity')}: {label.maxBoxQuantity}
                </Typography>
            </Box>

            <Box>
                <Typography variant="caption" color="text.secondary">
                    {t('types')}: {label.labelTypes?.length || 0}
                </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Typography variant="body2" color="text.secondary">
                    {t('status')}: {label.isActive ? t('active') : t('disabled')}
                </Typography>
                <Tooltip title={label.isActive ? t('disable') : t('enable')}>
                    <Switch
                        size="small"
                        checked={label.isActive}
                        onChange={() => handleToggleLabelStatus(label)}
                        color="primary"
                    />
                </Tooltip>
            </Box>
        </Paper>
    );

    if (loading) {
        return <Typography align="center" sx={{ mt: 2 }}>{t('loading')}...</Typography>;
    }

    if ((labels?.length ?? 0) === 0) {
        return <Typography align="center" sx={{ mt: 2 }}>{t('records_notFound')}.</Typography>;
    }

    return (
        <Box>
            {labels.map((label) => (
                <MobileLabelCard key={label.idLabel} label={label} />
            ))}
        </Box>
    );
};

export default LabelCardList;