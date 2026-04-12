import React from 'react';
import {
    Box,
    Typography,
    Paper,
    Switch,
    IconButton,
    Tooltip,
    Chip,
    Divider,
    Skeleton
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import ArticleOutlinedIcon from '@mui/icons-material/ArticleOutlined';
import EmptyData from '@layout/EmptyData';

const ContractTemplateCardList = ({
    templates,
    loading,
    t,
    handleOpenEditTemplate,
    handleToggleTemplateStatus,
    handleOpenDeleteConfirmation,
    handleOpenPreview,
    deletingId,
    isSearch = false,
    rowsPerPage = 5
}) => {

    const MobileTemplateCard = ({ template }) => {
        const isDeleting = template.idTemplate === deletingId;

        return (
            <Paper
                elevation={0}
                sx={{
                    p: 2, mb: 2, borderRadius: 3, border: '1px solid', borderColor: 'divider',
                    opacity: isDeleting ? 0.5 : 1,
                    transition: '0.3s', '&:hover': { boxShadow: '0 4px 20px 0 rgba(0,0,0,0.05)' }
                }}
            >
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Box sx={{ flexGrow: 1 }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
                            {template.name}
                        </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                        <Tooltip title={t('contractTemplate_preview')}>
                            <IconButton
                                onClick={() => handleOpenPreview(template)}
                                disabled={isDeleting}
                                sx={{ color: 'white', bgcolor: 'info.main', '&:hover': { bgcolor: 'info.dark' }, p: 1 }}
                            >
                                <VisibilityIcon fontSize="small" />
                            </IconButton>
                        </Tooltip>
                        <Tooltip title={t('edit')}>
                            <IconButton
                                onClick={() => handleOpenEditTemplate(template)}
                                disabled={isDeleting}
                                sx={{ color: 'white', bgcolor: 'primary.main', '&:hover': { bgcolor: 'primary.dark' }, p: 1 }}
                            >
                                <EditIcon fontSize="small" />
                            </IconButton>
                        </Tooltip>
                        <Tooltip title={t('delete')}>
                            <IconButton
                                onClick={() => handleOpenDeleteConfirmation(template)}
                                disabled={isDeleting}
                                sx={{ color: 'white', bgcolor: 'error.main', '&:hover': { bgcolor: 'error.dark' }, p: 1 }}
                            >
                                <DeleteIcon fontSize="small" />
                            </IconButton>
                        </Tooltip>
                    </Box>
                </Box>

                {template.description && (
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, mb: 1 }}>
                        <ArticleOutlinedIcon sx={{ fontSize: 18, color: 'text.secondary', mt: 0.2 }} />
                        <Typography variant="body2" color="text.secondary">
                            {template.description}
                        </Typography>
                    </Box>
                )}

                <Divider sx={{ mb: 1.5, borderStyle: 'dashed' }} />

                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Chip
                        label={template.isActive ? t('active') : t('disabled')}
                        size="small"
                        color={template.isActive ? 'success' : 'default'}
                        sx={{ height: 24, fontSize: '0.75rem', fontWeight: 'bold', borderRadius: 1.5 }}
                    />
                    <Switch
                        checked={template.isActive ?? false}
                        onChange={() => handleToggleTemplateStatus(template)}
                        size="small"
                        disabled={isDeleting}
                    />
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
                            <Box sx={{ flexGrow: 1 }}>
                                <Skeleton variant="text" width="60%" height={24} />
                            </Box>
                            <Box sx={{ display: 'flex', gap: 1 }}>
                                <Skeleton variant="circular" width={34} height={34} />
                                <Skeleton variant="circular" width={34} height={34} />
                            </Box>
                        </Box>
                        <Skeleton variant="text" width="80%" />
                        <Divider sx={{ my: 1.5 }} />
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Skeleton variant="rounded" width={60} height={24} />
                            <Skeleton variant="rectangular" width={36} height={20} sx={{ borderRadius: 1 }} />
                        </Box>
                    </Paper>
                ))}
            </Box>
        );
    }

    if (!templates || templates.length === 0) {
        return (
            <EmptyData
                message={isSearch ? t('no_results_found') : t('no_contract_templates_yet')}
                description={isSearch ? t('try_another_search_term') : t('start_by_adding_contract_template')}
            />
        );
    }

    return (
        <Box>
            {templates.map((template) => (
                <MobileTemplateCard key={template.idTemplate} template={template} />
            ))}
        </Box>
    );
};

export default ContractTemplateCardList;
