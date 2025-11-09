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

const DriverListTable = ({
    drivers,
    loading,
    t,
    handleOpenEditDriver,
    handleToggleDriverStatus,
    handleOpenDeleteConfirmation,
    setSelectedDriver
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
                        drivers.map((driver) => (
                            <TableRow key={driver.idDriver}>
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

export default DriverListTable;