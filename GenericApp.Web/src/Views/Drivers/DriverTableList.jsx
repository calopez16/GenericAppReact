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


const DriverListTable = ({
    drivers,
    loading,
    t,
    handleOpenEditDriver,
    handleToggleDriverStatus,
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
                        <TableCell>{t('name')}</TableCell>
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
                    ) : (drivers?.length ?? 0) === 0 ? (
                        <TableRow>
                            <TableCell colSpan={4} align="center"> {t('records_notFound')}.</TableCell>
                        </TableRow>
                    ) : (
                        drivers.map((driver) => {
                            const isDeleting = driver.idDriver === deletingId;
                            const isAdding = driver.idDriver === addingId;

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
                                    key={driver.idDriver}
                                    sx={rowCurrentStyle}
                                >
                                    <TableCell>
                                        <Tooltip title={driver.isActive ? t('disable') : t('enable')}>
                                            <Switch
                                                checked={driver.isActive}
                                                onChange={() => handleToggleDriverStatus(driver)}
                                                color="primary"
                                            />
                                        </Tooltip>
                                    </TableCell>
                                    <TableCell>
                                        <Tooltip title={`ID: ${driver.idDriver}`}>
                                            <Typography>{driver.name}</Typography>
                                        </Tooltip>
                                    </TableCell>
                                    <TableCell align="right">
                                        <Tooltip title={t('edit')}>
                                            <IconButton color="primary" onClick={() => handleOpenEditDriver(driver)}>
                                                <EditIcon />
                                            </IconButton>
                                        </Tooltip>
                                        <Tooltip title={t('delete')}>
                                            <IconButton
                                                color="error"
                                                onClick={() => handleOpenDeleteConfirmation(driver)}
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

export default DriverListTable;