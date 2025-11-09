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
    Typography
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

const LabelListTable = ({
    labels, // CAMBIO: drivers -> labels
    loading,
    t,
    handleOpenEditLabel, // CAMBIO: Driver -> Label
    handleToggleLabelStatus, // CAMBIO: Driver -> Label
    handleOpenDeleteConfirmation,
    setSelectedLabel // CAMBIO: Driver -> Label
}) => {

    const minTableWidth = 900;

    return (
        <TableContainer component={Paper} sx={{ overflowX: 'auto' }}>
            <Table sx={{ minWidth: minTableWidth }}>
                <TableHead>
                    <TableRow>
                        <TableCell>{t('active')}</TableCell>
                        <TableCell>{t('description')}</TableCell>
                        <TableCell>{t('types')}</TableCell>
                        <TableCell align="right">{t('actions')}</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {loading ? (
                        <TableRow>
                            <TableCell colSpan={4} align="center">
                                {t('loading')}...
                            </TableCell>
                        </TableRow>
                    ) : (labels?.length ?? 0) === 0 ? (
                        <TableRow>
                            <TableCell colSpan={4} align="center"> {t('records_notFound')}.</TableCell>
                        </TableRow>
                    ) : (
                        labels.map((label) => (
                            <TableRow key={label.idLabel}>
                                <TableCell>
                                    <Tooltip title={label.isActive ? t('disable') : t('enable')}>
                                        <Switch
                                            checked={label.isActive}
                                            onChange={() => handleToggleLabelStatus(label)}
                                            color="primary"
                                        />
                                    </Tooltip>
                                </TableCell>
                                <TableCell>
                                    <Tooltip title={`ID: ${label.idLabel}`}>
                                        <Typography>{label.description}</Typography>
                                    </Tooltip>
                                </TableCell>
                                <TableCell>
                                    <Typography>{label.labelTypes?.length || 0}</Typography>
                                </TableCell>
                                <TableCell align="right">
                                    <Tooltip title={t('edit')}>
                                        <IconButton color="primary" onClick={() => handleOpenEditLabel(label)}>
                                            <EditIcon />
                                        </IconButton>
                                    </Tooltip>
                                    <Tooltip title={t('delete')}>
                                        <IconButton
                                            color="error"
                                            onClick={() => handleOpenDeleteConfirmation(label)}
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

export default LabelListTable;