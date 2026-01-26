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

const LabelCardList = ({
    labels,
    loading,
    t,
    handleOpenEditLabel,
    handleToggleLabelStatus,
    handleOpenDeleteConfirmation
}) => {

    const renderLabelTypeChips = (labelTypes) => {
        if (!labelTypes || labelTypes.length === 0) return "-";

        const grouped = labelTypes.reduce((acc, current) => {
            const existing = acc.find(item => item.description === current.description);
            if (existing) {
                if (!existing.sizes.includes(current.size)) existing.sizes.push(current.size);
            } else {
                acc.push({ description: current.description, sizes: [current.size] });
            }
            return acc;
        }, []);

        return (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, mt: 1 }}>
                {grouped.map((g, i) => (
                    <Box key={i}>
                        <Typography variant="caption" sx={{ fontWeight: 'bold', display: 'block' }}>
                            {g.description}:
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                            {g.sizes.map(s => (
                                <Chip key={s} label={s} size="small" variant="outlined" color="primary" />
                            ))}
                        </Box>
                    </Box>
                ))}
            </Box>
        );
    };

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

            <Box>
                <Typography variant="caption" color="text.secondary">
                    {t('label_maxBoxQuantity')}: {label.maxBoxQuantity}
                </Typography>
            </Box>

            <Box>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 'bold' }}>
                    {t('types')}:
                </Typography>
                {renderLabelTypeChips(label.labelTypes)}
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 1 }}>
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

    if (loading) return <Typography align="center" sx={{ mt: 2 }}>{t('loading')}...</Typography>;
    if ((labels?.length ?? 0) === 0) return <Typography align="center" sx={{ mt: 2 }}>{t('records_notFound')}.</Typography>;

    return (
        <Box>
            {labels.map((label) => (
                <MobileLabelCard key={label.idLabel} label={label} />
            ))}
        </Box>
    );
};

export default LabelCardList;