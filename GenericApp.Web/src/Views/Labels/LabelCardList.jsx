import React from 'react';
import {
    Box,
    Typography,
    Paper,
    Switch,
    IconButton,
    Tooltip,
    Chip,
    Divider
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import LabelOutlinedIcon from '@mui/icons-material/LabelOutlined';
import CategoryIcon from '@mui/icons-material/Category';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import EmptyData from '@layout/EmptyData';

const LabelCardList = ({
    labels,
    loading,
    t,
    handleOpenEditLabel,
    handleToggleLabelStatus,
    handleOpenDeleteConfirmation,
    isSearch = false
}) => {

    const renderLabelTypeChips = (labelTypes) => {
        if (!labelTypes || labelTypes.length === 0) return <Typography variant="caption" color="text.secondary">-</Typography>;

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
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, mt: 0.5 }}>
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
            elevation={0}
            sx={{
                p: 2, mb: 2, borderRadius: 3, border: '1px solid', borderColor: 'divider',
                transition: '0.3s', '&:hover': { boxShadow: '0 4px 20px 0 rgba(0,0,0,0.05)' }
            }}
        >
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Box
                    sx={{
                        width: 40, height: 40, borderRadius: 1.5, mr: 2, flexShrink: 0,
                        bgcolor: label.isActive ? 'primary.main' : 'grey.400',
                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}
                >
                    <LabelOutlinedIcon sx={{ color: 'white', fontSize: 22 }} />
                </Box>
                <Box sx={{ flexGrow: 1 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
                        {label.description}
                    </Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: 1 }}>
                    <Tooltip title={t('edit')}>
                        <IconButton
                            onClick={() => handleOpenEditLabel(label)}
                            sx={{
                                color: 'white',
                                bgcolor: 'primary.main',
                                '&:hover': { bgcolor: 'primary.dark' },
                                p: 1
                            }}
                        >
                            <EditIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title={t('delete')}>
                        <IconButton
                            onClick={() => handleOpenDeleteConfirmation(label)}
                            sx={{
                                color: 'white',
                                bgcolor: 'error.main',
                                '&:hover': { bgcolor: 'error.dark' },
                                p: 1
                            }}
                        >
                            <DeleteIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>
                </Box>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <Inventory2OutlinedIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
                <Typography variant="body2" color="text.secondary">
                    {t('label_maxBoxQuantity')}: <strong>{label.maxBoxQuantity}</strong>
                </Typography>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, mb: 2 }}>
                <CategoryIcon sx={{ fontSize: 18, color: 'text.secondary', mt: 0.3 }} />
                <Box>
                    <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 'bold' }}>
                        {t('types')}:
                    </Typography>
                    {renderLabelTypeChips(label.labelTypes)}
                </Box>
            </Box>

            <Divider sx={{ mb: 1.5, borderStyle: 'dashed' }} />

            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Chip
                    label={label.isActive ? t('active') : t('disabled')}
                    size="small"
                    color={label.isActive ? 'success' : 'default'}
                    sx={{ height: 24, fontSize: '0.75rem', fontWeight: 'bold', borderRadius: 1.5 }}
                />
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="caption" color="text.secondary">{t('status')}</Typography>
                    <Switch
                        size="small"
                        checked={label.isActive}
                        onChange={() => handleToggleLabelStatus(label)}
                        color="primary"
                    />
                </Box>
            </Box>
        </Paper>
    );

    if (loading) return <Typography align="center" sx={{ mt: 2 }}>{t('loading')}...</Typography>;

    if ((labels?.length ?? 0) === 0) return (
        <Box sx={{ mt: 2 }}>
            <EmptyData
                isSearch={isSearch}
                title={isSearch ? t('records_notFound') : t('no_labels_yet')}
                description={isSearch ? t('try_another_search_term') : t('start_by_adding_label')}
                actionLabel={t('add')}
            />
        </Box>
    );

    return (
        <Box sx={{ mt: 2 }}>
            {labels.map((label) => (
                <MobileLabelCard key={label.idLabel} label={label} />
            ))}
        </Box>
    );
};

export default LabelCardList;