import React from 'react';
import {
    TableContainer,
    Paper,
    Table,
    TableHead,
    TableRow,
    TableCell,
    TableBody,
    IconButton,
    Tooltip,
    Typography,
    Switch
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';

const ShipmentListTable = ({
    shipments,
    loading,
    t,
    handleOpenEditShipment,
    handleToggleShipmentStatus,
    handleDeleteShipment,
}) => {

    const minTableWidth = 1200;

    const formatDate = (dateString) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleDateString();
    };

    return (
        <TableContainer component={Paper} sx={{ overflowX: 'auto' }}>
            <Table sx={{ minWidth: minTableWidth }} aria-label="shipments table">
                <TableHead>
                    <TableRow>
                        <TableCell sx={{ fontWeight: 'bold' }}>{t('ID')}</TableCell>
                        <TableCell sx={{ fontWeight: 'bold' }}>{t('Name')}</TableCell>
                        <TableCell sx={{ fontWeight: 'bold' }}>{t('Client')}</TableCell>
                        <TableCell sx={{ fontWeight: 'bold' }}>{t('Status')}</TableCell>
                        <TableCell sx={{ fontWeight: 'bold' }}>{t('Creation Date')}</TableCell>
                        <TableCell sx={{ fontWeight: 'bold' }}>{t('Mixed Cargo')}</TableCell>
                        <TableCell sx={{ fontWeight: 'bold' }}>{t('Active')}</TableCell>
                        <TableCell sx={{ fontWeight: 'bold', minWidth: 100 }}>{t('Actions')}</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {loading ? (
                        <TableRow>
                            <TableCell colSpan={8} align="center">
                                <Typography>{t('loading')}...</Typography>
                            </TableCell>
                        </TableRow>
                        // CORRECCIÓN: Verifica si shipments es null/undefined O si su longitud es 0.
                    ) : !shipments || shipments.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={8} align="center">
                                <Typography>{t('records_notFound')}.</Typography>
                            </TableCell>
                        </TableRow>
                    ) : (
                        // Ahora shipments está garantizado de ser un array con items
                        shipments.map((shipment) => (
                            <TableRow key={shipment.idShipment}>
                                <TableCell>{shipment.idShipment}</TableCell>
                                <TableCell>{shipment.name}</TableCell>
                                <TableCell>{shipment.clientName || '-'}</TableCell>
                                <TableCell>{shipment.shipmentStatusDescription || '-'}</TableCell>
                                <TableCell>{formatDate(shipment.creationDate)}</TableCell>
                                <TableCell>{shipment.mixed ? t('YES') : t('NO')}</TableCell>
                                <TableCell>
                                    <Tooltip title={shipment.isActive ? t('disable') : t('enable')}>
                                        <Switch
                                            size="small"
                                            checked={shipment.isActive}
                                            onChange={() => handleToggleShipmentStatus(shipment)}
                                            color="primary"
                                        />
                                    </Tooltip>
                                </TableCell>
                                <TableCell>
                                    <Tooltip title={t('edit')}>
                                        <IconButton color="primary" onClick={() => handleOpenEditShipment(shipment)}>
                                            <EditIcon />
                                        </IconButton>
                                    </Tooltip>

                                    <Tooltip title={t('delete')}>
                                        <IconButton
                                            color="error"
                                            onClick={() => handleDeleteShipment(shipment)}
                                        >
                                            <DeleteForeverIcon />
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

export default ShipmentListTable;