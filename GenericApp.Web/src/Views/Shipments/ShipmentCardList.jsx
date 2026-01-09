import React from 'react';
import { Box, Typography, Paper, IconButton, Grid, Divider } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteForeverIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
// Importamos los iconos
import ReceiptIcon from '@mui/icons-material/Receipt';
import DescriptionIcon from '@mui/icons-material/Description';

const ShipmentCardList = ({
    shipments,
    loading,
    t,
    handleOpenEditShipment,
    handleDeleteShipment,
    handleViewDetails,
    // Recibimos las nuevas funciones
    handleExportManifest,
    handleExportRemision
}) => {
    const formatRemision = (id) => id ? id.toString().padStart(4, '0') : '-';
    const formatDate = (dateString) => dateString ? new Date(dateString).toLocaleDateString() : '-';

    if (loading) return <Typography align="center" sx={{ mt: 2 }}>{t('loading')}...</Typography>;
    if (!shipments || shipments.length === 0) return <Typography align="center" sx={{ mt: 2 }}>{t('records_notFound')}.</Typography>;

    return (
        <Box>
            {shipments.map((shipment, index) => (
                <Paper key={shipment.idShipment || index} sx={{ p: 2, mb: 2, borderLeft: '4px solid #1976D2' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                        <Box>
                            <Typography variant="subtitle1" fontWeight="bold">
                                {t('NoRemision')}: {formatRemision(shipment.idShipmentNavigation?.idShipment)}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                {t('NoViaje')}: {shipment.idManifest || '-'}
                            </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', gap: 0.5 }}>
                            {/* Botón Manifiesto */}
                            <IconButton size="small" color="secondary" onClick={() => handleExportManifest(shipment)}>
                                <DescriptionIcon fontSize="small" />
                            </IconButton>
                            {/* Botón Remisión */}
                            <IconButton size="small" color="success" onClick={() => handleExportRemision(shipment)}>
                                <ReceiptIcon fontSize="small" />
                            </IconButton>

                            <IconButton size="small" color="info" onClick={() => handleViewDetails(shipment)}>
                                <VisibilityIcon fontSize="small" />
                            </IconButton>
                            <IconButton size="small" color="primary" onClick={() => handleOpenEditShipment(shipment)}>
                                <EditIcon fontSize="small" />
                            </IconButton>
                            <IconButton size="small" color="error" onClick={() => handleDeleteShipment(shipment)}>
                                <DeleteForeverIcon fontSize="small" />
                            </IconButton>
                        </Box>
                    </Box>
                    <Divider sx={{ my: 1 }} />
                    <Grid container spacing={1}>
                        <Grid item xs={6}><Typography variant="caption" color="text.secondary">{t('FDA No')}</Typography><Typography variant="body2">{shipment.regFdaNo || '-'}</Typography></Grid>
                        <Grid item xs={6}><Typography variant="caption" color="text.secondary">{t('Date')}</Typography><Typography variant="body2">{formatDate(shipment.idShipmentNavigation?.shipmentDate)}</Typography></Grid>
                        <Grid item xs={12}><Typography variant="caption" color="text.secondary">{t('Driver')}</Typography><Typography variant="body2">{shipment.idDriverNavigation?.name || '-'}</Typography></Grid>
                        <Grid item xs={12}><Typography variant="caption" color="text.secondary">{t('Plate')}</Typography><Typography variant="body2">{shipment.trailerBoxPlate || '-'}</Typography></Grid>
                    </Grid>
                </Paper>
            ))}
        </Box>
    );
};

export default ShipmentCardList;