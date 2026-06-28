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
    Box,
    Skeleton
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
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

const ContractTemplateTableList = ({
    templates,
    loading,
    t,
    handleOpenEditTemplate,
    handleToggleTemplateStatus,
    handleOpenDeleteConfirmation,
    handleOpenPreview,
    handleOpenSignature,
    deletingId,
    isSearch = false,
    rowsPerPage = 5
}) => {

    const rowHeight = 65;
    const colSpan = 6;

    const emptyRows = !loading && templates?.length > 0
        ? Math.max(0, rowsPerPage - templates.length)
        : 0;

    return (
        <TableContainer
            component={Paper}
            elevation={0}
            sx={{ overflowX: 'auto', border: '1px solid', borderColor: 'divider', borderRadius: 2 }}
        >
            <Table sx={{ minWidth: 600 }}>
                <TableHead sx={{ bgcolor: 'action.hover' }}>
                    <TableRow>
                        <TableCell sx={{ fontWeight: 'bold', width: 10 }} align="center">{t('status')}</TableCell>
                        <TableCell sx={{ fontWeight: 'bold' }}>{t('name')}</TableCell>
                        <TableCell sx={{ fontWeight: 'bold' }}>{t('description')}</TableCell>
                        <TableCell sx={{ fontWeight: 'bold', width: 80 }} align="center">{t('contractTemplate_preview_col')}</TableCell>
                        <TableCell sx={{ fontWeight: 'bold', width: 160 }} align="center">{t('actions')}</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {loading ? (
                        Array.from(new Array(rowsPerPage)).map((_, index) => (
                            <TableRow key={`skeleton-${index}`} style={{ height: rowHeight }}>
                                <TableCell align="center">
                                    <Skeleton variant="rectangular" width={40} height={20} sx={{ mx: 'auto', borderRadius: 1 }} />
                                </TableCell>
                                <TableCell><Skeleton variant="text" width="70%" /></TableCell>
                                <TableCell><Skeleton variant="text" width="50%" /></TableCell>
                                <TableCell align="center">
                                    <Skeleton variant="circular" width={30} height={30} sx={{ mx: 'auto' }} />
                                </TableCell>
                                <TableCell align="center">
                                    <Skeleton variant="circular" width={30} height={30} sx={{ mx: 'auto' }} />
                                </TableCell>
                                <TableCell align="center">
                                    <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
                                        <Skeleton variant="circular" width={30} height={30} />
                                        <Skeleton variant="circular" width={30} height={30} />
                                    </Box>
                                </TableCell>
                            </TableRow>
                        ))
                    ) : templates?.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={colSpan} sx={{ border: 'none', py: 4 }}>
                                <EmptyData
                                    message={isSearch ? t('no_results_found') : t('no_contract_templates_yet')}
                                    description={isSearch ? t('try_another_search_term') : t('start_by_adding_contract_template')}
                                />
                            </TableCell>
                        </TableRow>
                    ) : (
                        <>
                            {templates.map((template) => {
                                const isDeleting = template.idTemplate === deletingId;
                                return (
                                    <TableRow
                                        key={template.idTemplate}
                                        style={isDeleting ? deletingRowStyle : normalRowStyle}
                                        sx={{ '&:last-child td': { borderBottom: 0 } }}
                                    >
                                        <TableCell align="center">
                                            <Switch
                                                checked={template.isActive ?? false}
                                                onChange={() => handleToggleTemplateStatus(template)}
                                                size="small"
                                                disabled={isDeleting}
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                                {template.name}
                                            </Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Typography variant="body2" color="text.secondary">
                                                {template.description || t('noDescription')}
                                            </Typography>
                                        </TableCell>
                                        <TableCell align="center">
                                            <Tooltip title={t('contractTemplate_preview')}>
                                                <IconButton
                                                    size="small"
                                                    onClick={() => handleOpenPreview(template)}
                                                    disabled={isDeleting}
                                                    sx={{ color: 'white', bgcolor: 'info.main', '&:hover': { bgcolor: 'info.dark' } }}
                                                >
                                                    <VisibilityIcon fontSize="small" />
                                                </IconButton>
                                            </Tooltip>
                                        </TableCell>
                                       
                                        <TableCell align="center">
                                            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 0.5 }}>
                                                <Tooltip title={t('edit')}>
                                                    <IconButton
                                                        size="small"
                                                        onClick={() => handleOpenEditTemplate(template)}
                                                        disabled={isDeleting}
                                                        sx={{ color: 'white', bgcolor: 'primary.main', '&:hover': { bgcolor: 'primary.dark' } }}
                                                    >
                                                        <EditIcon fontSize="small" />
                                                    </IconButton>
                                                </Tooltip>
                                                <Tooltip title={t('delete')}>
                                                    <IconButton
                                                        size="small"
                                                        onClick={() => handleOpenDeleteConfirmation(template)}
                                                        disabled={isDeleting}
                                                        sx={{ color: 'white', bgcolor: 'error.main', '&:hover': { bgcolor: 'error.dark' } }}
                                                    >
                                                        <DeleteIcon fontSize="small" />
                                                    </IconButton>
                                                </Tooltip>
                                            </Box>
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                            {emptyRows > 0 &&
                                Array.from(new Array(emptyRows)).map((_, index) => (
                                    <TableRow key={`empty-${index}`} style={{ height: rowHeight }}>
                                        <TableCell colSpan={colSpan} sx={{ border: 'none' }} />
                                    </TableRow>
                                ))
                            }
                        </>
                    )}
                </TableBody>
            </Table>
        </TableContainer>
    );
};

export default ContractTemplateTableList;
