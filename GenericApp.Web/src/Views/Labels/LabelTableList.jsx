import React from 'react';
import { TableContainer, Paper, Table, TableHead, TableRow, TableCell, TableBody, Switch, IconButton, Tooltip, Typography, Box, Chip } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

const LabelListTable = ({ labels, loading, t, handleOpenEditLabel, handleToggleLabelStatus, handleOpenDeleteConfirmation, deletingId }) => {

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
                        {/*<Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>*/}
                        {/*    {g.sizes.map(s => <Chip key={s} label={s} size="small" variant="outlined" color="primary" />)}*/}
                        {/*</Box>*/}
                    </Box>
                ))}
            </Box>
        );
    };

    return (
        <TableContainer component={Paper} sx={{ overflowX: 'auto' }}>
            <Table sx={{ minWidth: 900 }}>
                <TableHead>
                    <TableRow>
                        <TableCell>{t('active')}</TableCell>
                        <TableCell>{t('description')}</TableCell>
                        <TableCell>{t('label_maxBoxQuantity')}</TableCell>
                        <TableCell>{t('types')}</TableCell>
                        <TableCell align="right">{t('actions')}</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {loading ? (
                        <TableRow><TableCell colSpan={5} align="center">{t('loading')}...</TableCell></TableRow>
                    ) : (labels?.length ?? 0) === 0 ? (
                        <TableRow><TableCell colSpan={5} align="center">{t('records_notFound')}</TableCell></TableRow>
                    ) : (
                        labels.map((label) => (
                            <TableRow key={label.idLabel}>
                                <TableCell>
                                    <Switch checked={label.isActive} onChange={() => handleToggleLabelStatus(label)} color="primary" disabled={label.idLabel === deletingId} />
                                </TableCell>
                                <TableCell><Typography>{label.description}</Typography></TableCell>
                                <TableCell><Typography>{label.maxBoxQuantity}</Typography></TableCell>
                                <TableCell>{renderLabelTypeChips(label.labelTypes)}</TableCell>
                                <TableCell align="right">
                                    <IconButton color="primary" onClick={() => handleOpenEditLabel(label)}><EditIcon /></IconButton>
                                    <IconButton color="error" onClick={() => handleOpenDeleteConfirmation(label)}><DeleteIcon /></IconButton>
                                </TableCell>
                            </TableRow>
                        ))
                    )}
                </TableBody>
            </Table>
        </TableContainer>
    );
};

export default LabelListTable;