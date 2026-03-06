import React from 'react';
import {
    TableContainer, Paper, Table, TableHead, TableRow, TableCell, TableBody,
    IconButton, Tooltip, Typography, Box, Skeleton
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteForeverIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import FactCheckIcon from '@mui/icons-material/FactCheck';
import DescriptionIcon from '@mui/icons-material/Description';
import ReceiptIcon from '@mui/icons-material/Receipt';
import EmptyData from '@layout/EmptyData';

const ShipmentListTable = ({
    shipments,
    pageLoading,
    t,
    handleOpenEditShipment,
    handleDeleteShipment,
    handleViewDetails,
    handleExportManifest,
    handleExportRemision,
    handleOpenBitacoraModal,
    isSearch = false,
    rowsPerPage = 5
}) => {
    const rowHeight = 65;
    const colSpan = 7;

    const formatRemision = (id) => id ? id.toString().padStart(4, '0') : '-';
    const formatManifest = (id) => id ? id.toString().padStart(3, '0') : '-';
    const formatDate = (dateString) => dateString ? new Date(dateString).toLocaleDateString() : '-';

    const emptyRows = !pageLoading && shipments?.length > 0
        ? Math.max(0, rowsPerPage - shipments.length)
        : 0;

    return (
        <TableContainer
            component={Paper}
            elevation={0}
            sx={{ overflowX: 'auto', border: '1px solid', borderColor: 'divider', borderRadius: 2 }}
        >
            <Table sx={{ minWidth: 1000 }}>
                <TableHead sx={{ bgcolor: 'action.hover' }}>
                    <TableRow>
                        <TableCell sx={{ fontWeight: 'bold' }}>{t('manifestNo')}</TableCell>
                        <TableCell sx={{ fontWeight: 'bold' }}>{t('remisionNo')}</TableCell>
                        <TableCell sx={{ fontWeight: 'bold' }}>{t('regFdaNo')}</TableCell>
                        <TableCell sx={{ fontWeight: 'bold' }}>{t('shipmentDate')}</TableCell>
                        <TableCell sx={{ fontWeight: 'bold' }}>{t('driver')}</TableCell>
                        <TableCell sx={{ fontWeight: 'bold' }}>{t('trailerPlate')}</TableCell>
                        <TableCell sx={{ fontWeight: 'bold', width: 280 }} align="center">{t('actions')}</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {pageLoading ? (
                        Array.from(new Array(rowsPerPage)).map((_, index) => (
                            <TableRow key={`skeleton-${index}`} style={{ height: rowHeight }}>
                                <TableCell><Skeleton width="80%" /></TableCell>
                                <TableCell><Skeleton width="80%" /></TableCell>
                                <TableCell><Skeleton width="60%" /></TableCell>
                                <TableCell><Skeleton width="70%" /></TableCell>
                                <TableCell><Skeleton width="60%" /></TableCell>
                                <TableCell><Skeleton width="60%" /></TableCell>
                                <TableCell align="center">
                                    <Box sx={{ display: 'flex', justifyContent: 'center', gap: 0.5 }}>
                                        {Array.from(new Array(6)).map((__, i) => (
                                            <Skeleton key={i} variant="circular" width={30} height={30} />
                                        ))}
                                    </Box>
                                </TableCell>
                            </TableRow>
                        ))
                    ) : (
                        <>
                            {shipments?.map((shipment) => (
                                <TableRow
                                    key={shipment.idShipment}
                                    hover
                                    sx={{ '&:last-child td, &:last-child th': { border: 0 }, height: rowHeight }}
                                >
                                    <TableCell>
                                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                            {formatRemision(shipment.shipmentNo)}
                                        </Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="body2">
                                            {formatManifest(shipment.shipmentNo) || '-'}
                                        </Typography>
                                    </TableCell>
                                    <TableCell>{shipment.regFdaNo || '-'}</TableCell>
                                    <TableCell>{formatDate(shipment.idShipmentNavigation?.shipmentDate)}</TableCell>
                                    <TableCell>{shipment.idDriverNavigation?.name || '-'}</TableCell>
                                    <TableCell>{shipment.trailerBoxPlate || '-'}</TableCell>
                                    <TableCell align="center">
                                        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 0.5 }}>
                                            <Tooltip title={t('bitacoraSellos')}>
                                                <IconButton
                                                    size="small"
                                                    onClick={() => handleOpenBitacoraModal(shipment)}
                                                    sx={{ color: 'white', bgcolor: 'secondary.main', '&:hover': { bgcolor: 'secondary.dark' }, p: 1 }}
                                                >
                                                    <FactCheckIcon fontSize="small" />
                                                </IconButton>
                                            </Tooltip>
                                            <Tooltip title={t('generateManifest')}>
                                                <IconButton
                                                    size="small"
                                                    onClick={() => handleExportManifest(shipment)}
                                                    sx={{ color: 'white', bgcolor: 'primary.main', '&:hover': { bgcolor: 'primary.dark' }, p: 1 }}
                                                >
                                                    <DescriptionIcon fontSize="small" />
                                                </IconButton>
                                            </Tooltip>
                                            <Tooltip title={t('generateRemision')}>
                                                <IconButton
                                                    size="small"
                                                    onClick={() => handleExportRemision(shipment)}
                                                    sx={{ color: 'white', bgcolor: 'success.main', '&:hover': { bgcolor: 'success.dark' }, p: 1 }}
                                                >
                                                    <ReceiptIcon fontSize="small" />
                                                </IconButton>
                                            </Tooltip>
                                            <Tooltip title={t('details')}>
                                                <IconButton
                                                    size="small"
                                                    onClick={() => handleViewDetails(shipment)}
                                                    sx={{ color: 'white', bgcolor: 'info.main', '&:hover': { bgcolor: 'info.dark' }, p: 1 }}
                                                >
                                                    <VisibilityIcon fontSize="small" />
                                                </IconButton>
                                            </Tooltip>
                                            <Tooltip title={t('edit')}>
                                                <IconButton
                                                    size="small"
                                                    onClick={() => handleOpenEditShipment(shipment)}
                                                    sx={{ color: 'white', bgcolor: 'primary.main', '&:hover': { bgcolor: 'primary.dark' }, p: 1 }}
                                                >
                                                    <EditIcon fontSize="small" />
                                                </IconButton>
                                            </Tooltip>
                                            <Tooltip title={t('delete')}>
                                                <IconButton
                                                    size="small"
                                                    onClick={() => handleDeleteShipment(shipment)}
                                                    sx={{ color: 'white', bgcolor: 'error.main', '&:hover': { bgcolor: 'error.dark' }, p: 1 }}
                                                >
                                                    <DeleteForeverIcon fontSize="small" />
                                                </IconButton>
                                            </Tooltip>
                                        </Box>
                                    </TableCell>
                                </TableRow>
                            ))}

                            {emptyRows > 0 && (
                                Array.from(new Array(emptyRows)).map((_, index) => (
                                    <TableRow key={`empty-${index}`} style={{ height: rowHeight }}>
                                        <TableCell colSpan={colSpan} sx={{ borderBottom: index === emptyRows - 1 ? 'none' : '1px solid rgba(224, 224, 224, 0.4)' }} />
                                    </TableRow>
                                ))
                            )}
                        </>
                    )}
                </TableBody>
            </Table>

            {!pageLoading && (shipments?.length ?? 0) === 0 && (
                <Box sx={{ mt: 2 }}>
                    <EmptyData
                        isSearch={isSearch}
                        title={isSearch ? t('records_notFound') : t('no_results_found')}
                        description={isSearch ? t('try_another_search_term') : t('shipments_description')}
                    />
                </Box>
            )}
        </TableContainer>
    );
};

export default ShipmentListTable;