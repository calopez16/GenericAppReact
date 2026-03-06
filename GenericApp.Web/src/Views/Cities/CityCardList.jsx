import React from 'react';
import {
    Box,
    Typography,
    Paper,
    Switch,
    IconButton,
    Tooltip,
    Chip,
    Divider,
    Skeleton
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import EmptyData from '@layout/EmptyData';

const CityCardList = ({
    cities,
    loading,
    t,
    handleOpenEditCity,
    handleToggleCityStatus,
    handleOpenDeleteConfirmation,
    deletingId,
    isSearch = false,
    rowsPerPage = 5
}) => {

    const MobileCityCard = ({ city }) => {
        const isDeleting = city.idCity === deletingId;

        return (
            <Paper
                elevation={0}
                sx={{
                    p: 2, mb: 2, borderRadius: 3, border: '1px solid', borderColor: 'divider',
                    opacity: isDeleting ? 0.5 : 1,
                    transition: '0.3s', '&:hover': { boxShadow: '0 4px 20px 0 rgba(0,0,0,0.05)' }
                }}
            >
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Box sx={{ flexGrow: 1 }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
                            {city.description}
                        </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                        <Tooltip title={t('edit')}>
                            <IconButton
                                onClick={() => handleOpenEditCity(city)}
                                disabled={isDeleting}
                                sx={{ color: 'white', bgcolor: 'primary.main', '&:hover': { bgcolor: 'primary.dark' }, p: 1 }}
                            >
                                <EditIcon fontSize="small" />
                            </IconButton>
                        </Tooltip>
                        <Tooltip title={t('delete')}>
                            <IconButton
                                onClick={() => handleOpenDeleteConfirmation(city)}
                                disabled={isDeleting}
                                sx={{ color: 'white', bgcolor: 'error.main', '&:hover': { bgcolor: 'error.dark' }, p: 1 }}
                            >
                                <DeleteIcon fontSize="small" />
                            </IconButton>
                        </Tooltip>
                    </Box>
                </Box>

                {city.idStateNavigation && (
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, mb: 1 }}>
                        <LocationOnOutlinedIcon sx={{ fontSize: 18, color: 'text.secondary', mt: 0.2 }} />
                        <Typography variant="body2" color="text.secondary">
                            {city.idStateNavigation.description}, {city.idStateNavigation.idCountryNavigation?.description}
                        </Typography>
                    </Box>
                )}

                <Divider sx={{ mb: 1.5, borderStyle: 'dashed' }} />

                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Chip
                        label={city.isActive ? t('active') : t('disabled')}
                        size="small"
                        color={city.isActive ? 'success' : 'default'}
                        sx={{ height: 24, fontSize: '0.75rem', fontWeight: 'bold', borderRadius: 1.5 }}
                    />
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="caption" color="text.secondary">{t('status')}</Typography>
                        <Switch
                            size="small"
                            checked={city.isActive}
                            onChange={() => handleToggleCityStatus(city)}
                            color="primary"
                            disabled={isDeleting}
                        />
                    </Box>
                </Box>
            </Paper>
        );
    };

    if (loading) {
        return (
            <Box>
                {Array.from(new Array(rowsPerPage)).map((_, index) => (
                    <Paper key={index} elevation={0} sx={{ p: 2, mb: 2, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                            <Box sx={{ flexGrow: 1 }}>
                                <Skeleton width="60%" />
                            </Box>
                            <Box sx={{ display: 'flex', gap: 1 }}>
                                <Skeleton variant="circular" width={34} height={34} />
                                <Skeleton variant="circular" width={34} height={34} />
                            </Box>
                        </Box>
                        <Skeleton width="70%" sx={{ mb: 2 }} />
                        <Divider sx={{ mb: 1.5 }} />
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                            <Skeleton variant="rounded" width={60} height={24} />
                            <Skeleton width={80} />
                        </Box>
                    </Paper>
                ))}
            </Box>
        );
    }

    if ((cities?.length ?? 0) === 0) {
        return (
            <Box sx={{ mt: 2 }}>
                <EmptyData
                    isSearch={isSearch}
                    title={isSearch ? t('records_notFound') : t('no_cities_yet')}
                    description={isSearch ? t('try_another_search_term') : t('start_by_adding_city')}
                />
            </Box>
        );
    }

    return (
        <Box sx={{ mt: 2 }}>
            {cities.map((city) => (
                <MobileCityCard key={city.idCity} city={city} />
            ))}
        </Box>
    );
};

export default CityCardList;