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

const CityCardList = ({
    cities,
    loading,
    t,
    handleOpenEditCity,
    handleToggleCityStatus,
    handleOpenDeleteConfirmation,
    setSelectedCity
}) => {

    // Componente interno para cada tarjeta de ciudad
    const MobileCityCard = ({ city }) => (
        <Paper
            sx={{
                p: 2,
                mb: 2,
                display: 'flex',
                flexDirection: 'column',
                gap: 1,
                // Uso de la propiedad ajustada: city.isActive
                borderLeft: city.isActive ? '4px solid green' : '4px solid grey'
            }}
        >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="body1" component="div" sx={{ fontWeight: 'bold' }}>
                    {/* Uso de la propiedad ajustada: city.description (Nombre de la Ciudad) */}
                    {city.description}
                </Typography>
                <Box>
                    <Tooltip title={t('edit')}>
                        <IconButton size="small" color="primary" onClick={() => handleOpenEditCity(city)}>
                            <EditIcon />
                        </IconButton>
                    </Tooltip>
                    {/* Uso de handleOpenDeleteConfirmation */}
                    <Tooltip title={t('delete')}>
                        <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleOpenDeleteConfirmation(city)}
                        >
                            <DeleteIcon />
                        </IconButton>
                    </Tooltip>
                </Box>
            </Box>

            {/* Agregando información de Estado/País para mayor contexto en la tarjeta */}
            {city.idStateNavigation && (
                <Box>
                    <Typography variant="body2" color="text.secondary">
                        {t('state')}: {city.idStateNavigation.description}
                    </Typography>
                    {city.idStateNavigation.idCountryNavigation && (
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                            {t('country')}: {city.idStateNavigation.idCountryNavigation.description}
                        </Typography>
                    )}
                </Box>
            )}

            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Typography variant="body2" color="text.secondary">
                    {/* Uso de la propiedad ajustada: city.isActive */}
                    {t('status')}: {city.isActive ? t('active') : t('disabled')}
                </Typography>
                <Tooltip title={city.isActive ? t('disable') : t('enable')}>
                    <Switch
                        size="small"
                        checked={city.isActive} // Propiedad ajustada: isActive
                        onChange={() => handleToggleCityStatus(city)}
                        color="primary"
                    />
                </Tooltip>
            </Box>
        </Paper>
    );

    if (loading) {
        return <Typography align="center" sx={{ mt: 2 }}>{t('loading')}...</Typography>;
    }

    if ((cities?.length ?? 0) === 0) {
        return <Typography align="center" sx={{ mt: 2 }}>{t('records_notFound')}.</Typography>;
    }

    return (
        <Box>
            {cities.map((city) => (
                // Uso de la propiedad ajustada: key={city.idCity}
                <MobileCityCard key={city.idCity} city={city} />
            ))}
        </Box>
    );
};

export default CityCardList;