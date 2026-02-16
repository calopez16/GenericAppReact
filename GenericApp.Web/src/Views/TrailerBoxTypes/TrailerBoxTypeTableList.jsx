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
    opacity: 1,
    transform: 'translateY(0) translateX(0)', 
    transition: `all ${ANIMATION_DURATION}ms ease-out`,
    maxHeight: '1000px',
    padding: '16px 24px',
};


const TrailerBoxTypeListTable = ({
    trailerBoxTypes,
    loading,
    t,
    handleOpenEditTrailerBoxType,
    handleToggleTrailerBoxTypeStatus,
    handleOpenDeleteConfirmation,
    deletingId,
    addingId
}) => {

    const minTableWidth = 900;

    return (
        <TableContainer component={Paper} sx={{ overflowX: 'auto' }}>
            <Table sx={{ minWidth: minTableWidth }}>
                <TableHead>
                    <TableRow>
                        <TableCell>{t('active')}</TableCell>
                        <TableCell>{t('description')}</TableCell>
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
                    ) : (trailerBoxTypes?.length ?? 0) === 0 ? (
                        <TableRow>
                            <TableCell colSpan={4} align="center"> {t('records_notFound')}.</TableCell>
                        </TableRow>
                    ) : (
                        trailerBoxTypes.map((trailerBoxType) => {
                            const isDeleting = trailerBoxType.idTrailerBoxType === deletingId;
                            const isAdding = trailerBoxType.idTrailerBoxType === addingId;

                            let rowCurrentStyle = normalRowStyle;

                            if (isDeleting) {
                                rowCurrentStyle = deletingRowStyle;
                            } else if (isAdding) {
                                rowCurrentStyle = {
                                    maxHeight: '0px',
                                    opacity: 0,
                                    padding: '0px 24px',
                                    transform: 'translateY(-10px)',

                                    transition: `max-height ${ANIMATION_DURATION}ms ease-out, opacity ${ANIMATION_DURATION}ms ease-out, padding ${ANIMATION_DURATION}ms ease-out, transform ${ANIMATION_DURATION}ms ease-out`,
                                    overflow: 'hidden',
                                };
                            }
                            return (
                                <TableRow
                                    key={trailerBoxType.idTrailerBoxType}
                                    sx={rowCurrentStyle}
                                >
                                    <TableCell>
                                        <Tooltip title={trailerBoxType.isActive ? t('disable') : t('enable')}>
                                            <Switch
                                                checked={trailerBoxType.isActive}
                                                onChange={() => handleToggleTrailerBoxTypeStatus(trailerBoxType)}
                                                color="primary"
                                            />
                                        </Tooltip>
                                    </TableCell>
                                    <TableCell>
                                        <Tooltip title={`ID: ${trailerBoxType.idTrailerBoxType}`}>
                                            <Typography>{trailerBoxType.description}</Typography>
                                        </Tooltip>
                                    </TableCell>
                                    <TableCell align="right">
                                        <Tooltip title={t('edit')}>
                                            <IconButton color="primary" onClick={() => handleOpenEditTrailerBoxType(trailerBoxType)}>
                                                <EditIcon />
                                            </IconButton>
                                        </Tooltip>
                                        <Tooltip title={t('delete')}>
                                            <IconButton
                                                color="error"
                                                onClick={() => handleOpenDeleteConfirmation(trailerBoxType)}
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

export default TrailerBoxTypeListTable;