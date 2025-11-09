import React from 'react';
import {
    Box,
    Typography,
    Paper,
    Switch,
    IconButton,
    Tooltip
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

const DriverCardList = ({
    drivers,
    loading,
    t,
    handleOpenEditDriver,
    handleToggleDriverStatus,
    handleOpenDeleteConfirmation,
    setSelectedDriver
}) => {

    const MobileDriverCard = ({ driver }) => (
        <Paper
            sx={{
                p: 2,
                mb: 2,
                display: 'flex',
                flexDirection: 'column',
                gap: 1,
                // Resalta la tarjeta según si está activo o no
                borderLeft: driver.isActive ? '4px solid green' : '4px solid grey'
            }}
        >
            {/* Sección superior: Nombre y Acciones */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                    <Typography variant="body1" component="div" sx={{ fontWeight: 'bold' }}>
                        {driver.name}
                    </Typography>
                    {/* Campo añadido: IdDriver */}
                    <Typography variant="caption" color="text.secondary">
                        ID: {driver.idDriver}
                    </Typography>
                </Box>
                <Box>
                    <Tooltip title={t('edit')}>
                        <IconButton size="small" color="primary" onClick={() => handleOpenEditDriver(driver)}>
                            <EditIcon />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title={t('delete')}>
                        <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleOpenDeleteConfirmation(driver)}
                        >
                            <DeleteIcon />
                        </IconButton>
                    </Tooltip>
                </Box>
            </Box>

            {/* Sección inferior: Estado y Switch */}
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Typography variant="body2" color="text.secondary">
                    {t('status')}: {driver.isActive ? t('active') : t('disabled')}
                </Typography>
                <Tooltip title={driver.isActive ? t('disable') : t('enable')}>
                    <Switch
                        size="small"
                        checked={driver.isActive}
                        onChange={() => handleToggleDriverStatus(driver)}
                        color="primary"
                    />
                </Tooltip>
            </Box>
        </Paper>
    );

    if (loading) {
        return <Typography align="center" sx={{ mt: 2 }}>{t('loading')}...</Typography>;
    }

    if ((drivers?.length ?? 0) === 0) {
        return <Typography align="center" sx={{ mt: 2 }}>{t('records_notFound')}.</Typography>;
    }

    return (
        <Box>
            {drivers.map((driver) => (
                <MobileDriverCard key={driver.idDriver} driver={driver} />
            ))}
        </Box>
    );
};

export default DriverCardList;