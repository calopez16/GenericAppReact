import React from 'react';
import {
    Box,
    Typography,
    Paper,
    Switch,
    IconButton,
    Tooltip,
    Grid
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';

const ShipmentCardList = ({
    shipments,
    loading,
    t,
    handleOpenEditShipment,
    handleToggleShipmentStatus,
    handleDeleteShipment,
}) => {

    const formatDate = (dateString) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleDateString();
    };

    const MobileShipmentCard = ({ shipment }) => (
        <Paper
            sx={{
                p: 2,
                mb: 2,
                display: 'flex',
                flexDirection: 'column',
                gap: 1,
                // Indicador visual basado en si es activo
                borderLeft: shipment.isActive ? '4px solid #1976D2' : '4px solid gray'
            }}
        >
            {/* Sección Superior: ID, Nombre y Botones de Acción */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="subtitle1" fontWeight="bold">
                    {shipment.name || `${t('Shipment')} #${shipment.idShipment}`}
                </Typography>
                <Box sx={{ display: 'flex', gap: 0.5 }}>
                    <Tooltip title={t('edit')}>
                        <IconButton size="small" color="primary" onClick={() => handleOpenEditShipment(shipment)}>
                            <EditIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>
                    {/* Botón de Eliminar */}
                    <Tooltip title={t('delete')}>
                        <IconButton size="small" color="error" onClick={() => handleDeleteShipment(shipment)}>
                            <DeleteForeverIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>
                </Box>
            </Box>

            {/* Detalles del Shipment */}
            <Grid container spacing={1}>
                <Grid item xs={12}>
                    <Typography variant="body2" color="text.secondary">
                        {t('ID')}: <Typography component="span" fontWeight="bold">{shipment.idShipment}</Typography>
                    </Typography>
                </Grid>
                <Grid item xs={12}>
                    <Typography variant="body2" color="text.secondary">
                        {t('Client')}: <Typography component="span" fontWeight="bold">{shipment.clientName || '-'}</Typography>
                    </Typography>
                </Grid>
                <Grid item xs={12}>
                    <Typography variant="body2" color="text.secondary">
                        {t('Status')}: <Typography component="span" fontWeight="bold">{shipment.shipmentStatusDescription || '-'}</Typography>
                    </Typography>
                </Grid>
                <Grid item xs={12}>
                    <Typography variant="body2" color="text.secondary">
                        {t('Creation Date')}: <Typography component="span" fontWeight="bold">{formatDate(shipment.creationDate)}</Typography>
                    </Typography>
                </Grid>
            </Grid>

            {/* Pie de la tarjeta: Estado Activo y Toggle */}
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pt: 1, mt: 1, borderTop: '1px solid #eee' }}>
                <Typography variant="body2" color="text.secondary">
                    {t('Active')}:
                    <Typography component="span" sx={{ ml: 1, fontWeight: 'bold', color: shipment.isActive ? 'primary.main' : 'error.main' }}>
                        {shipment.isActive ? t('YES') : t('NO')}
                    </Typography>
                </Typography>

                {/* Switch de acción para Active/Inactive */}
                <Tooltip title={shipment.isActive ? t('disable') : t('enable')}>
                    <Switch
                        size="small"
                        checked={shipment.isActive}
                        onChange={() => handleToggleShipmentStatus(shipment)}
                        color="primary"
                    />
                </Tooltip>
            </Box>
        </Paper>
    );

    if (loading) {
        return <Typography align="center" sx={{ mt: 2 }}>{t('loading')}...</Typography>;
    }

    // CORRECCIÓN: Verifica si shipments es null/undefined O si su longitud es 0.
    if (!shipments || shipments.length === 0) {
        return <Typography align="center" sx={{ mt: 2 }}>{t('records_notFound')}.</Typography>;
    }

    return (
        <Box>
            {shipments.map((shipment, index) => (
                <MobileShipmentCard key={shipment.idShipment || index} shipment={shipment} />
            ))}
        </Box>
    );
};

export default ShipmentCardList;