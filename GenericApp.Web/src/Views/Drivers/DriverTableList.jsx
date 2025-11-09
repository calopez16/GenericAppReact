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

const ANIMATION_DURATION = 500; // Duración de la animación en milisegundos

// Estilo para la animación de ELIMINACIÓN (deslizamiento a la izquierda)
const deletingRowStyle = {
    transition: `all ${ANIMATION_DURATION}ms ease-out`,
    transform: 'translateX(-100%)',
    opacity: 0,
    height: 0, // Al final de la animación, la altura se reduce a 0
    padding: 0,
    overflow: 'hidden',
};

// Estilo NORMAL (Estado final después de la animación de entrada y estado por defecto)
const normalRowStyle = {
    opacity: 1,
    transform: 'translateY(0) translateX(0)', // Aseguramos posición normal
    transition: `all ${ANIMATION_DURATION}ms ease-out`,
    maxHeight: '1000px', // Un valor lo suficientemente grande para contener cualquier fila
    padding: '16px 24px', // padding normal de las TableCell (ajusta si es diferente en tu tema)
};


const DriverListTable = ({
    drivers,
    loading,
    t,
    handleOpenEditDriver,
    handleToggleDriverStatus,
    handleOpenDeleteConfirmation,
    deletingId,
    addingId
}) => {

    const minTableWidth = 900;

    return (
        <TableContainer component={Paper} sx={{ overflowX: 'auto' }}>
            <Table sx={{ minWidth: minTableWidth }}>
                <TableHead>
                    <TableRow>
                        <TableCell>{t('active')}</TableCell>
                        <TableCell>{t('name')}</TableCell>
                        <TableCell align="right">{t('actions')}</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {loading ? (
                        <TableRow>
                            <TableCell colSpan={4} align="center">
                                {t('loading')}...
                            </TableCell>
                        </TableRow>
                    ) : (drivers?.length ?? 0) === 0 ? (
                        <TableRow>
                            <TableCell colSpan={4} align="center"> {t('records_notFound')}.</TableCell>
                        </TableRow>
                    ) : (
                        drivers.map((driver) => {
                            const isDeleting = driver.idDriver === deletingId;
                            const isAdding = driver.idDriver === addingId;

                            let rowCurrentStyle = normalRowStyle;

                            if (isDeleting) {
                                rowCurrentStyle = deletingRowStyle;
                            } else if (isAdding) {
                                // ESTILOS PARA LA ANIMACIÓN DE "CRECIMIENTO EN ALTO"
                                rowCurrentStyle = {
                                    maxHeight: '0px', // Inicia con altura cero
                                    opacity: 0,       // Inicia invisible
                                    padding: '0px 24px', // Padding también a cero para que no haya espacio residual
                                    transform: 'translateY(-10px)', // Un pequeño desplazamiento inicial para un efecto sutil

                                    // La transición al estado normal (definido en normalRowStyle)
                                    transition: `max-height ${ANIMATION_DURATION}ms ease-out, opacity ${ANIMATION_DURATION}ms ease-out, padding ${ANIMATION_DURATION}ms ease-out, transform ${ANIMATION_DURATION}ms ease-out`,
                                    overflow: 'hidden', // Oculta el contenido mientras la altura es 0
                                };
                            }
                            // Cuando `isAdding` pasa a `false` (después del setTimeout en Index.jsx),
                            // la fila transicionará de `rowCurrentStyle` a `normalRowStyle`.

                            return (
                                <TableRow
                                    key={driver.idDriver}
                                    sx={rowCurrentStyle}
                                >
                                    <TableCell>
                                        <Tooltip title={driver.isActive ? t('disable') : t('enable')}>
                                            <Switch
                                                checked={driver.isActive}
                                                onChange={() => handleToggleDriverStatus(driver)}
                                                color="primary"
                                            />
                                        </Tooltip>
                                    </TableCell>
                                    <TableCell>
                                        <Tooltip title={`ID: ${driver.idDriver}`}>
                                            <Typography>{driver.name}</Typography>
                                        </Tooltip>
                                    </TableCell>
                                    <TableCell align="right">
                                        <Tooltip title={t('edit')}>
                                            <IconButton color="primary" onClick={() => handleOpenEditDriver(driver)}>
                                                <EditIcon />
                                            </IconButton>
                                        </Tooltip>
                                        <Tooltip title={t('delete')}>
                                            <IconButton
                                                color="error"
                                                onClick={() => handleOpenDeleteConfirmation(driver)}
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

export default DriverListTable;