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

const ClientListTable = ({
    clients,
    loading,
    t,
    handleOpenEditClient,
    handleToggleClientStatus,
    handleOpenDeleteConfirmation,
    setSelectedClient,
    // RECIBIR LA PROP DE ANIMACIÓN
    deletingId
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
                        clients.map((client) => {
                            const isDeleting = client.idClient === deletingId;

                            // Aplicar estilos condicionales
                            const rowCurrentStyle = isDeleting ? deletingRowStyle : normalRowStyle;

                            return (
                                <TableRow
                                    key={client.idClient}
                                    sx={rowCurrentStyle}
                                >
                                    <TableCell>
                                        <Tooltip title={client.isActive ? t('disable') : t('enable')}>
                                            <Switch
                                                checked={client.isActive}
                                                onChange={() => handleToggleClientStatus(client)}
                                                color="primary"
                                                disabled={isDeleting}
                                            />
                                        </Tooltip>
                                    </TableCell>
                                    <TableCell>{client.name}</TableCell>
                                    <TableCell>{client.rfc}</TableCell>
                                    <TableCell>{client.address}</TableCell>
                                    <TableCell>{client.phone}</TableCell>
                                    <TableCell align="right">
                                        <Tooltip title={t('edit')}>
                                            <IconButton
                                                color="primary"
                                                onClick={() => handleOpenEditClient(client)}
                                                disabled={isDeleting}
                                            >
                                                <EditIcon />
                                            </IconButton>
                                        </Tooltip>
                                        <Tooltip title={t('delete')}>
                                            <IconButton
                                                color="error"
                                                onClick={() => handleOpenDeleteConfirmation(client)}
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

export default ClientListTable;