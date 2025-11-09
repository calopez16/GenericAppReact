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

const CityListTable = ({
    cities,
    loading,
    t,
    handleOpenEditCity,
    handleToggleCityStatus,
    handleOpenDeleteConfirmation,
    setSelectedCity
}) => {

    const minTableWidth = 900;

    return (
        <TableContainer component={Paper} sx={{ overflowX: 'auto' }}>
            <Table sx={{ minWidth: minTableWidth }}>
                <TableHead>
                    <TableRow>
                        <TableCell>{t('active')}</TableCell>
                        <TableCell>{t('city')}</TableCell>
                        <TableCell>{t('state')}</TableCell>
                        <TableCell>{t('country')}</TableCell>
                        <TableCell align="right">{t('actions')}</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {loading ? (
                        <TableRow>
                            <TableCell colSpan={5} align="center">
                                {t('loading')}...
                            </TableCell>
                        </TableRow>
                    ) : (cities?.length ?? 0) === 0 ? (
                        <TableRow>
                            <TableCell colSpan={5} align="center"> {t('records_notFound')}.</TableCell>
                        </TableRow>
                    ) : (
                        cities.map((city) => (
                            <TableRow key={city.idCity}>
                                <TableCell>
                                    <Tooltip title={city.isActive ? t('disable') : t('enable')}>
                                        <Switch
                                            checked={city.isActive}
                                            onChange={() => handleToggleCityStatus(city)}
                                            color="primary"
                                        />
                                    </Tooltip>
                                </TableCell>
                                <TableCell>
                                    <Tooltip title={`ID: ${city.idCity}`}>
                                        <Typography>{city.description}</Typography>
                                    </Tooltip>
                                </TableCell>
                                <TableCell>
                                    {city.idStateNavigation?.description || 'N/A'}
                                </TableCell>
                                <TableCell>
                                    {city.idStateNavigation?.idCountryNavigation?.description || 'N/A'}
                                </TableCell>
                                <TableCell align="right">
                                    <Tooltip title={t('edit')}>
                                        <IconButton color="primary" onClick={() => handleOpenEditCity(city)}>
                                            <EditIcon />
                                        </IconButton>
                                    </Tooltip>
                                    <Tooltip title={t('delete')}>
                                        <IconButton
                                            color="error"
                                            onClick={() => handleOpenDeleteConfirmation(city)}
                                            sx={{ ml: 1 }}
                                        >
                                            <DeleteIcon />
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

export default CityListTable;