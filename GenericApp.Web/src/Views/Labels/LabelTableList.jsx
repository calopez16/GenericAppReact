import React from 'react';
import {
    TableContainer, Paper, Table, TableHead, TableRow, TableCell, TableBody,
    Switch, IconButton, Tooltip, Typography, Box, Chip, Skeleton
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import LabelOutlinedIcon from '@mui/icons-material/LabelOutlined';
import EmptyData from '@layout/EmptyData';

const LabelListTable = ({
    labels, loading, t, handleOpenEditLabel, handleToggleLabelStatus,
    handleOpenDeleteConfirmation, deletingId, isSearch = false, rowsPerPage = 5
}) => {

    const rowHeight = 65;
    const emptyRows = !loading && labels?.length > 0
        ? Math.max(0, rowsPerPage - labels.length)
        : 0;

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
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                {grouped.map((g, i) => (
                    <Box key={i} sx={{ mb: 0.5 }}>
                        <Typography variant="caption" sx={{ fontWeight: 'bold', display: 'block' }}>{g.description}</Typography>
                    </Box>
                ))}
            </Box>
        );
    };

    return (
        <TableContainer
            component={Paper}
            elevation={0}
            sx={{
                overflowX: 'auto',
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 2
            }}
        >
            <Table sx={{ minWidth: 650 }} aria-label="labels table">
                <TableHead sx={{ bgcolor: 'action.hover' }}>
                    <TableRow>
                        <TableCell sx={{ fontWeight: 'bold', width: 10  }} align="center">{t('status')}</TableCell>
                        <TableCell sx={{ fontWeight: 'bold' }}>{t('description')}</TableCell>
                        <TableCell sx={{ fontWeight: 'bold' }}>{t('label_maxBoxQuantity')}</TableCell>
                        <TableCell sx={{ fontWeight: 'bold' }}>{t('types')}</TableCell>
                        <TableCell sx={{ fontWeight: 'bold', width: 200 }} align="center">{t('actions')}</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {loading ? (
                        Array.from(new Array(rowsPerPage)).map((_, index) => (
                            <TableRow key={`skeleton-${index}`} style={{ height: rowHeight }}>
                                <TableCell align="center">
                                    <Skeleton variant="rectangular" width={40} height={20} sx={{ mx: 'auto' }} />
                                </TableCell>
                                <TableCell>
                                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                        <Skeleton variant="circular" width={32} height={32} sx={{ mr: 2 }} />
                                        <Skeleton width="60%" />
                                    </Box>
                                </TableCell>
                                <TableCell><Skeleton width="50%" /></TableCell>
                                <TableCell><Skeleton width="70%" /></TableCell>
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
                            {labels?.map((label) => (
                                <TableRow
                                    key={label.idLabel}
                                    hover
                                    sx={{ '&:last-child td, &:last-child th': { border: 0 }, height: rowHeight }}
                                >
                                    <TableCell align="center">
                                        <Switch
                                            size="medium"
                                            checked={label.isActive}
                                            onChange={() => handleToggleLabelStatus(label)}
                                            disabled={label.idLabel === deletingId}
                                            color="primary"
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                            <Box
                                                sx={{
                                                    width: 32, height: 32, borderRadius: 1.5,
                                                    bgcolor: label.isActive ? 'primary.main' : 'grey.400',
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                    flexShrink: 0
                                                }}
                                            >
                                                <LabelOutlinedIcon sx={{ fontSize: 18, color: 'white' }} />
                                            </Box>
                                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                                {label.description}
                                            </Typography>
                                        </Box>
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="body2" color="text.secondary">
                                            {label.maxBoxQuantity}
                                        </Typography>
                                    </TableCell>
                                    <TableCell>{renderLabelTypeChips(label.labelTypes)}</TableCell>
                                    <TableCell align="center">
                                        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
                                            <Tooltip title={t('edit')}>
                                                <IconButton
                                                    onClick={() => handleOpenEditLabel(label)}
                                                    disabled={label.idLabel === deletingId}
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
                                                    disabled={label.idLabel === deletingId}
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
                                    </TableCell>
                                </TableRow>
                            ))}

                            {emptyRows > 0 && (
                                Array.from(new Array(emptyRows)).map((_, index) => (
                                    <TableRow key={`empty-${index}`} style={{ height: rowHeight }}>
                                        <TableCell colSpan={5} sx={{ borderBottom: index === emptyRows - 1 ? 'none' : '1px solid rgba(224, 224, 224, 0.4)' }} />
                                    </TableRow>
                                ))
                            )}
                        </>
                    )}
                </TableBody>
            </Table>

            {!loading && labels?.length === 0 && (
                <Box sx={{ mt: 2 }}>
                    <EmptyData
                        isSearch={isSearch}
                        title={isSearch ? t('records_notFound') : t('no_labels_yet')}
                        description={isSearch ? t('try_another_search_term') : t('start_by_adding_label')}
                        actionLabel={t('add')}
                    />
                </Box>
            )}
        </TableContainer>
    );
};

export default LabelListTable;