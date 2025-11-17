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
    maxHeight: '1000px',
};

const LabelListTable = ({
    labels,
    loading,
    t,
    handleOpenEditLabel,
    handleToggleLabelStatus,
    handleOpenDeleteConfirmation,
    setSelectedLabel,
    deletingId
}) => {

    const minTableWidth = 900;

    return (
        <TableContainer component={Paper} sx={{ overflowX: 'auto' }}>
            <Table sx={{ minWidth: minTableWidth }}>
                <TableHead>
                    <TableRow>
                        <TableCell>{t('active')}</TableCell>
                        <TableCell>{t('description')}</TableCell>
                        <TableCell>{t('label_maxBoxQuantity')}</TableCell> {/* ¡NUEVA COLUMNA! */}
                        <TableCell>{t('types')}</TableCell>
                        <TableCell align="right">{t('actions')}</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {loading ? (
                        <TableRow>
                            <TableCell colSpan={5} align="center"> {/* Colspan ajustado a 5 */}
                                {t('loading')}...
                            </TableCell>
                        </TableRow>
                    ) : (labels?.length ?? 0) === 0 ? (
                        <TableRow>
                            <TableCell colSpan={5} align="center"> {t('records_notFound')}.</TableCell> {/* Colspan ajustado a 5 */}
                        </TableRow>
                    ) : (
                        labels.map((label) => {
                            const isDeleting = label.idLabel === deletingId;

                            const rowCurrentStyle = isDeleting ? deletingRowStyle : normalRowStyle;

                            return (
                                <TableRow
                                    key={label.idLabel}
                                    sx={rowCurrentStyle}
                                >
                                    <TableCell>
                                        <Tooltip title={label.isActive ? t('disable') : t('enable')}>
                                            <Switch
                                                checked={label.isActive}
                                                onChange={() => handleToggleLabelStatus(label)}
                                                color="primary"
                                                disabled={isDeleting}
                                            />
                                        </Tooltip>
                                    </TableCell>
                                    <TableCell>
                                        <Tooltip title={`ID: ${label.idLabel}`}>
                                            <Typography>{label.description}</Typography>
                                        </Tooltip>
                                    </TableCell>
                                    <TableCell>
                                        <Typography>{label.maxBoxQuantity}</Typography> {/* ¡NUEVO VALOR! */}
                                    </TableCell>
                                    <TableCell>
                                        <Typography>{label.labelTypes?.length || 0}</Typography>
                                    </TableCell>
                                    <TableCell align="right">
                                        <Tooltip title={t('edit')}>
                                            <IconButton
                                                color="primary"
                                                onClick={() => handleOpenEditLabel(label)}
                                                disabled={isDeleting}
                                            >
                                                <EditIcon />
                                            </IconButton>
                                        </Tooltip>
                                        <Tooltip title={t('delete')}>
                                            <IconButton
                                                color="error"
                                                onClick={() => handleOpenDeleteConfirmation(label)}
                                                sx={{ ml: 1 }}
                                                disabled={isDeleting}
                                            >
                                                <DeleteIcon />
                                            </IconButton>
                                        </Tooltip>
                                    </TableCell>
                                </TableRow>
                            );
                        })
                    )}
                </TableBody>
            </Table>
        </TableContainer>
    );
};

export default LabelListTable;