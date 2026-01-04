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
    Typography
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import VisibilityIcon from '@mui/icons-material/Visibility';

const ShipmentListTable = ({
    shipments,
    loading,
    t,
    handleOpenEditShipment,
    handleDeleteShipment,
    handleViewDetails,
    handleExportDocument
}) => {
    const minTableWidth = 1200;

    const formatRemision = (id) => {
        return id ? id.toString().padStart(4, '0') : '-';
    };

    const formatDate = (dateString) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleDateString();
    };

    return (
        <TableContainer component={Paper} sx={{ overflowX: 'auto' }}>
            <Table sx={{ minWidth: minTableWidth }} aria-label="shipments table">
                <TableHead>
                    <TableRow>
                        <TableCell sx={{ fontWeight: 'bold' }}>{t('NoRemision')}</TableCell>
                        <TableCell sx={{ fontWeight: 'bold' }}>{t('NoViaje')}</TableCell>
                        <TableCell sx={{ fontWeight: 'bold' }}>{t('RegFdaNo')}</TableCell>
                        <TableCell sx={{ fontWeight: 'bold' }}>{t('Shipment Date')}</TableCell>
                        <TableCell sx={{ fontWeight: 'bold' }}>{t('Driver')}</TableCell>
                        <TableCell sx={{ fontWeight: 'bold' }}>{t('Trailer Plate')}</TableCell>
                        <TableCell sx={{ fontWeight: 'bold', textAlign: 'center' }}>{t('Actions')}</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {loading ? (
                        <TableRow>
                            <TableCell colSpan={7} align="center">
                                <Typography>{t('loading')}...</Typography>
                            </TableCell>
                        </TableRow>
                    ) : !shipments || shipments.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={7} align="center">
                                <Typography>{t('records_notFound')}.</Typography>
                            </TableCell>
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
                                    <Tooltip title={t('export')}>
                                        <IconButton color="success" onClick={() => handleExportDocument(shipment)}>
                                            <FileDownloadIcon />
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