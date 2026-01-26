import React from 'react';
import {
    TableContainer, Paper, Table, TableHead, TableRow, TableCell, TableBody,
    IconButton, Tooltip, Typography
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteForeverIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import FactCheckIcon from '@mui/icons-material/FactCheck';
// Importamos los iconos solicitados
import DescriptionIcon from '@mui/icons-material/Description';
import ReceiptIcon from '@mui/icons-material/Receipt';

const ShipmentListTable = ({
    shipments,
    loading,
    t,
    handleOpenEditShipment,
    handleDeleteShipment,
    handleViewDetails,
    // Recibimos las nuevas funciones
    handleExportManifest,
    handleExportRemision,
    handleOpenBitacoraModal
}) => {
    const minTableWidth = 1200;

    const formatRemision = (id) => id ? id.toString().padStart(4, '0') : '-';
    const formatDate = (dateString) => dateString ? new Date(dateString).toLocaleDateString() : '-';

    return (
        <TableContainer component={Paper} sx={{ overflowX: 'auto' }}>
            <Table sx={{ minWidth: minTableWidth }} aria-label="shipments table">
                <TableHead>
                    <TableRow>
                        <TableCell sx={{ fontWeight: 'bold' }}>{t('manifestNo')}</TableCell>
                        <TableCell sx={{ fontWeight: 'bold' }}>{t('remisionNo')}</TableCell>
                        <TableCell sx={{ fontWeight: 'bold' }}>{t('regFdaNo')}</TableCell>
                        <TableCell sx={{ fontWeight: 'bold' }}>{t('shipmentDate')}</TableCell>
                        <TableCell sx={{ fontWeight: 'bold' }}>{t('driver')}</TableCell>
                        <TableCell sx={{ fontWeight: 'bold' }}>{t('trailerPlate')}</TableCell>
                        <TableCell sx={{ fontWeight: 'bold', textAlign: 'center' }}>{t('actions')}</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {loading ? (
                        <TableRow>
                            <TableCell colSpan={7} align="center"><Typography>{t('loading')}...</Typography></TableCell>
                        </TableRow>
                    ) : !shipments || shipments.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={7} align="center"><Typography>{t('records_notFound')}.</Typography></TableCell>
                        </TableRow>
                    ) : (
                        shipments.map((shipment) => (
                            <TableRow key={shipment.idShipment}>
                                <TableCell>{formatRemision(shipment.idShipmentNavigation?.idShipment)}</TableCell>
                                <TableCell>{shipment.idManifest || '-'}</TableCell>
                                <TableCell>{shipment.regFdaNo || '-'}</TableCell>
                                <TableCell>{formatDate(shipment.idShipmentNavigation?.shipmentDate)}</TableCell>
                                <TableCell>{shipment.idDriverNavigation?.name || '-'}</TableCell>
                                <TableCell>{shipment.trailerBoxPlate || '-'}</TableCell>
                                <TableCell align="center">
                                    <Tooltip title={t('bitacoraSellos')}>
                                        <IconButton color="primary" onClick={() => handleOpenBitacoraModal(shipment)}>
                                            <FactCheckIcon />
                                        </IconButton>
                                    </Tooltip>
                                    {/* Botón Manifiesto */}
                                    <Tooltip title={t('generateManifest')}>
                                        <IconButton color="primary" onClick={() => handleExportManifest(shipment)}>
                                            <DescriptionIcon />
                                        </IconButton>
                                    </Tooltip>
                                    {/* Botón Remisión */}
                                    <Tooltip title={t('generateRemision')}>
                                        <IconButton color="success" onClick={() => handleExportRemision(shipment)}>
                                            <ReceiptIcon />
                                        </IconButton>
                                    </Tooltip>

                                    <Tooltip title={t('details')}>
                                        <IconButton color="info" onClick={() => handleViewDetails(shipment)}>
                                            <VisibilityIcon />
                                        </IconButton>
                                    </Tooltip>
                                    <Tooltip title={t('edit')}>
                                        <IconButton color="primary" onClick={() => handleOpenEditShipment(shipment)}>
                                            <EditIcon />
                                        </IconButton>
                                    </Tooltip>
                                    <Tooltip title={t('delete')}>
                                        <IconButton color="error" onClick={() => handleDeleteShipment(shipment)}>
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