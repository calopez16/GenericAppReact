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

// Este componente renderiza la lista de usuarios en formato de tabla.
const ClientListTable = ({
    clients,
    loading,
    t,
    handleOpenEditClient,
    handleToggleClientStatus,
    // **CORRECCIÓN: Asegúrate de desestructurar la nueva prop**
    handleOpenDeleteConfirmation,
    setSelectedClient // Esta prop se mantiene sin cambios
}) => {

    const minTableWidth = 900;

    return (
        <TableContainer component={Paper} sx={{ overflowX: 'auto' }}>
            <Table sx={{ minWidth: minTableWidth }}>
                <TableHead>
                    <TableRow>
                        <TableCell>{t('active')}</TableCell>
                        <TableCell>{t('name')}</TableCell>
                        <TableCell>{t('Rfc')}</TableCell>
                        <TableCell>{t('Address')}</TableCell>
                        <TableCell>{t('Phone')}</TableCell>
                        <TableCell align="right">{t('actions')}</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {loading ? (
                        <TableRow>
                            <TableCell colSpan={6} align="center">
                                {t('loading')}...
                            </TableCell>
                        </TableRow>
                    ) : (clients?.length ?? 0) === 0 ? (
                        <TableRow>
                            <TableCell colSpan={6} align="center"> {t('records_notFound')}.</TableCell>
                        </TableRow>
                    ) : (
                        clients.map((client) => (
                            <TableRow key={client.idClient}>
                                <TableCell>
                                    <Tooltip title={client.isActive ? t('disable') : t('enable')}>
                                        <Switch
                                            checked={client.isActive}
                                            onChange={() => handleToggleClientStatus(client)}
                                            color="primary"
                                        />
                                    </Tooltip>
                                </TableCell>
                                <TableCell>{client.name}</TableCell>
                                <TableCell>{client.rfc}</TableCell>
                                <TableCell>{client.address}</TableCell>
                                <TableCell>{client.phone}</TableCell>
                                <TableCell align="right">
                                    <Tooltip title={t('edit')}>
                                        <IconButton color="primary" onClick={() => handleOpenEditClient(client)}>
                                            <EditIcon />
                                        </IconButton>
                                    </Tooltip>
                                    {/* Uso de handleOpenDeleteConfirmation */}
                                    <Tooltip title={t('delete')}>
                                        <IconButton
                                            color="error"
                                            onClick={() => handleOpenDeleteConfirmation(client)}
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

export default ClientListTable;