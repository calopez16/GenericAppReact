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
// ❌ Quitamos VpnKeyIcon
import DeleteForeverIcon from '@mui/icons-material/DeleteForever'; // 🚀 Añadimos ícono de eliminar

const EmbarqueListTable = ({
    embarques,
    loading,
    t,
    handleOpenEditEmbarque,
    handleToggleEmbarqueStatus,
    setIsConfirmResetPasswordModalOpen,
    setSelectedEmbarque
    // Si tienes un handler de eliminación, debes pasarlo como prop:
    // handleDeleteEmbarque
}) => {

    const minTableWidth = 1400;

    const formatTime = (timeSpan) => {
        if (!timeSpan || typeof timeSpan !== 'string') return '-';
        const parts = timeSpan.split(':');
        return parts.length >= 2 ? `${parts[0]}:${parts[1]}` : timeSpan;
    };

    const formatDate = (dateString) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleDateString();
    };

    return (
        <TableContainer component={Paper} sx={{ overflowX: 'auto' }}>
            <Table sx={{ minWidth: minTableWidth }}>
                <TableHead>
                    <TableRow>
                        <TableCell align="center">{t('Mixed')}</TableCell>
                        <TableCell>{t('Trip Number')}</TableCell>
                        <TableCell>{t('Date')}</TableCell>
                        <TableCell>{t('Driver')}</TableCell>
                        <TableCell>{t('Trailer Plates')}</TableCell>
                        <TableCell>{t('Departure Time')}</TableCell>
                        <TableCell>{t('Temperature')}</TableCell>
                        <TableCell>{t('City, State')}</TableCell>
                        <TableCell align="center">{t('Pallets Qty')}</TableCell>
                        <TableCell align="right">{t('actions')}</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {loading ? (
                        <TableRow>
                            <TableCell colSpan={10} align="center">
                                {t('loading')}...
                            </TableCell>
                        </TableRow>
                    ) : embarques?.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={10} align="center"> {t('records_notFound')}.</TableCell>
                        </TableRow>
                    ) : (
                        embarques.map((embarque, index) => (
                            <TableRow key={embarque.id || index} hover>

                                {/* Mixed (Mixto) */}
                                <TableCell align="center">
                                    <Tooltip title={embarque.mixed ? t('Mixed Cargo') : t('Single Cargo')}>
                                        <Typography color={embarque.mixed ? 'secondary' : 'primary'} variant="body2">
                                            {embarque.mixed ? 'MIX' : 'STD'}
                                        </Typography>
                                    </Tooltip>
                                </TableCell>

                                {/* TripNumber */}
                                <TableCell sx={{ fontWeight: 'bold' }}>{embarque.tripNumber}</TableCell>

                                {/* Date */}
                                <TableCell>{formatDate(embarque.date)}</TableCell>

                                {/* Driver */}
                                <TableCell>{embarque.driver}</TableCell>

                                {/* TrailerPlates */}
                                <TableCell>{embarque.trailerPlates}</TableCell>

                                {/* DepartureTime */}
                                <TableCell>{formatTime(embarque.departureTime)}</TableCell>

                                {/* Temperature */}
                                <TableCell>{`${embarque.temperature}°C`}</TableCell>

                                {/* City, State */}
                                <TableCell>{`${embarque.city}, ${embarque.state}`}</TableCell>

                                {/* Pallets Qty */}
                                <TableCell align="center">{embarque.pallets?.length || 0}</TableCell>

                                {/* Actions */}
                                <TableCell align="right">
                                    {/* Botón de Editar (se mantiene) */}
                                    <Tooltip title={t('edit')}>
                                        <IconButton color="primary" onClick={() => handleOpenEditEmbarque(embarque)}>
                                            <EditIcon />
                                        </IconButton>
                                    </Tooltip>

                                    {/* 🚀 Botón de Eliminar (reemplazado) */}
                                    <Tooltip title={t('delete')}>
                                        <IconButton
                                            color="error" // Usamos color 'error' para visualmente indicar peligro
                                            onClick={() => {
                                                // 🚨 Aquí va la lógica para eliminar. 
                                                // Deberías usar una prop handleDeleteEmbarque(embarque.id)
                                                console.log("Acción de eliminar para embarque:", embarque.id);
                                            }}>
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

export default EmbarqueListTable;