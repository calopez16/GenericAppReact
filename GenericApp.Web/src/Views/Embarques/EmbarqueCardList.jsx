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
// ❌ Quitamos VpnKeyIcon
import DeleteForeverIcon from '@mui/icons-material/DeleteForever'; // 🚀 Añadimos ícono de eliminar

const EmbarqueCardList = ({
    embarques,
    loading,
    t,
    handleOpenEditEmbarque,
    handleToggleEmbarqueStatus,
    setIsConfirmResetPasswordModalOpen,
    setSelectedEmbarque
    // Asegúrate de pasar handleDeleteEmbarque desde el componente padre
    // handleDeleteEmbarque
}) => {

    const formatDate = (dateString) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleDateString();
    };

    // Componente interno para cada tarjeta de Embarque
    const MobileEmbarqueCard = ({ embarque }) => (
        <Paper
            sx={{
                p: 2,
                mb: 2,
                display: 'flex',
                flexDirection: 'column',
                gap: 1,
                // Indicador visual basado en si es mixto
                borderLeft: embarque.mixed ? '4px solid orange' : '4px solid #1976D2'
            }}
        >
            {/* Sección Superior: Número de Viaje, Fecha y Acciones */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Box>
                    <Typography variant="caption" color="text.secondary">{t('Trip Number')}</Typography>
                    <Typography variant="h6" sx={{ fontWeight: 'bold', lineHeight: 1 }}>
                        {embarque.tripNumber}
                    </Typography>
                    <Typography variant="body2" color="text.primary">
                        {t('Date')}: {formatDate(embarque.date)}
                    </Typography>
                </Box>
                <Box>
                    <Tooltip title={t('edit')}>
                        <IconButton size="small" color="primary" onClick={() => handleOpenEditEmbarque(embarque)}>
                            <EditIcon />
                        </IconButton>
                    </Tooltip>

                    {/* 🚀 Nuevo botón de Eliminar */}
                    <Tooltip title={t('delete')}>
                        <IconButton
                            size="small"
                            color="error" // Usamos color 'error' para indicar peligro
                            onClick={() => {
                                // Aquí deberías llamar a una función como handleDeleteEmbarque(embarque.id)
                                console.log("Eliminar embarque:", embarque.id);
                            }}>
                            <DeleteForeverIcon />
                        </IconButton>
                    </Tooltip>
                </Box>
            </Box>

            {/* Grid para los detalles clave */}
            <Grid container spacing={1}>

                {/* Driver */}
                <Grid item xs={12}>
                    <Typography variant="caption" color="text.secondary">{t('Driver')}:</Typography>
                    <Typography variant="body2">{embarque.driver}</Typography>
                </Grid>

                {/* Placas y Pallets */}
                <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">{t('Trailer Plates')}:</Typography>
                    <Typography variant="body2">{embarque.trailerPlates}</Typography>
                </Grid>
                <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">{t('Pallets')}:</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 'bold' }}>{embarque.pallets?.length || 0}</Typography>
                </Grid>

                {/* Ubicación y Temp */}
                <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">{t('City')}:</Typography>
                    <Typography variant="body2">{embarque.city}</Typography>
                </Grid>
                <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">{t('Temperature')}:</Typography>
                    <Typography variant="body2">{embarque.temperature}°C</Typography>
                </Grid>
            </Grid>

            {/* Estado (Mixed/Mixto) */}
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pt: 1, mt: 1, borderTop: '1px solid #eee' }}>
                <Typography variant="body2" color="text.secondary">
                    {t('Mixed Cargo')}:
                    <Typography component="span" sx={{ ml: 1, fontWeight: 'bold', color: embarque.mixed ? 'secondary.main' : 'primary.main' }}>
                        {embarque.mixed ? t('YES') : t('NO')}
                    </Typography>
                </Typography>

                {/* Switch de acción, se mantiene la estructura original */}
                <Tooltip title={t('toggle_shipment_status')}>
                    <Switch
                        size="small"
                        checked={embarque.mixed} // Usamos 'mixed' como ejemplo de un estado
                        onChange={() => handleToggleEmbarqueStatus(embarque)}
                        color="secondary"
                    />
                </Tooltip>
            </Box>
        </Paper>
    );

    if (loading) {
        return <Typography align="center" sx={{ mt: 2 }}>{t('loading')}...</Typography>;
    }

    if (embarques?.length === 0) {
        return <Typography align="center" sx={{ mt: 2 }}>{t('records_notFound')}.</Typography>;
    }

    return (
        <Box>
            {embarques.map((embarque, index) => (
                <MobileEmbarqueCard key={embarque.id || index} embarque={embarque} />
            ))}
        </Box>
    );
};

export default EmbarqueCardList;