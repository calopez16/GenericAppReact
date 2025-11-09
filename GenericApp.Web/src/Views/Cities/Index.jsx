import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    TextField,
    InputAdornment,
    Button,
    TablePagination,
    useMediaQuery,
    useTheme,
    LinearProgress
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import { DataAPICitiesService } from '@data/Cities/Data';
import { useTranslation } from 'react-i18next';
import { ShowMessage } from '@helpers/NotificationService';
import ConfirmationModal from '@layout/ConfirmationModal';
import CityFormModal from '@views/cities/CityFormModal';
import CityCardList from '@views/cities/CityCardList';
import CityListTable from '@views/cities/CityTableList';


function Index() {
    const { t } = useTranslation();
    const clientDataService = DataAPICitiesService();
    const [cities, setCities] = useState([]);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [totalCities, setTotalCities] = useState(0);

    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(searchTerm);

    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedCity, setSelectedCity] = useState(null);
    const [isEditing, setIsEditing] = useState(false);

    // **NUEVOS ESTADOS** para el modal de confirmación de eliminación
    const [isConfirmDeleteModalOpen, setIsConfirmDeleteModalOpen] = useState(false);
    const [clientToDelete, setCityToDelete] = useState(null);

    const theme = useTheme();
    const isSmallScreen = useMediaQuery(theme.breakpoints.down('xl'));

    useEffect(() => {
        const timerId = setTimeout(() => {
            setDebouncedSearchTerm(searchTerm);
        }, 500);
        return () => {
            clearTimeout(timerId);
        };
    }, [searchTerm]);

    useEffect(() => {
        const loadCities = async () => {
            try {
                setLoading(true);
                const response = await clientDataService.getDataPagination(page + 1, rowsPerPage, debouncedSearchTerm);
                setCities(response.data.data);
                setTotalCities(response.data.totalCount);
            } catch (error) {
                console.error("Error loading cities:", error);
            } finally {
                setLoading(false);
            }
        };

        loadCities();
    }, [page, rowsPerPage, debouncedSearchTerm]);


    const handlePageChange = (event, newPage) => {
        setPage(newPage);
    };

    const handleRowsPerPageChange = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const handleSearchChange = (event) => {
        setSearchTerm(event.target.value);
        setPage(0);
    };

    const handleToggleCityStatus = async (client) => {
        const isActiveNow = client.isActive;

        try {
            let dataResult;
            if (isActiveNow) {
                dataResult = await clientDataService.disableData(client.idCity);
                if (dataResult.success) {
                    ShowMessage(t('recordDisabled'), 'success');
                }
            } else {
                dataResult = await clientDataService.enableData(client.idCity);
                if (dataResult.success) {
                    ShowMessage(t('recordEnabled'), 'success');
                }
            }

            if (dataResult.success) {
                setCities(prevCities =>
                    prevCities.map(u =>
                        u.idCity === client.idCity ? { ...u, isActive: !isActiveNow } : u
                    )
                );
            }
        } catch (error) {
            ShowMessage(t('error'), 'error');
            console.error("Error toggling client status:", error);
        }
    };

    // **NUEVA FUNCIÓN:** Abre el modal de confirmación y guarda el cliente
    const handleOpenDeleteConfirmation = (client) => {
        setCityToDelete(client);
        setIsConfirmDeleteModalOpen(true);
    };

    // **FUNCIÓN ACTUALIZADA:** Ejecuta la eliminación
    const handleDeleteCity = async () => {
        // Cierra el modal de confirmación inmediatamente
        setIsConfirmDeleteModalOpen(false);

        if (!clientToDelete) return; // Seguridad

        try {
            setLoading(true);

            const dataResult = await clientDataService.deleteData(clientToDelete.idCity);

            if (dataResult.success) {
                ShowMessage(t('recordDeleted'), 'success');
                // Quitar el cliente de la lista local
                setCities(prevCities => prevCities.filter(c => c.idCity !== clientToDelete.idCity));
                // Resetea la página a 0 para recargar y reajustar la paginación
                setPage(0);
            } else {
                ShowMessage(dataResult.message || t('errorDeletingRecord'), 'error');
            }
        } catch (error) {
            ShowMessage(t('error'), 'error');
            console.error("Error deleting client:", error);
        } finally {
            setCityToDelete(null); // Limpia el cliente seleccionado
            setLoading(false);
        }
    };

    const handleCloseDeleteConfirmation = () => {
        setIsConfirmDeleteModalOpen(false);
        setCityToDelete(null);
    };


    const handleOpenAddCity = () => {
        setSelectedCity(null);
        setIsEditing(false);
        setIsModalOpen(true);
    };

    const handleOpenEditCity = (client) => {
        setSelectedCity(client);
        setIsEditing(true);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
    };

    const commonListProps = {
        cities,
        loading,
        t,
        handleOpenEditCity,
        handleToggleCityStatus,
        handleOpenDeleteConfirmation,
        setSelectedCity
    };

    return (
        <Box sx={{ p: 3 }}>
            {/* ... (Header, Search y Add Button) ... */}
            <Box sx={{
                display: 'flex',
                flexDirection: isSmallScreen ? 'column' : 'row',
                justifyContent: 'space-between',
                alignItems: isSmallScreen ? 'stretch' : 'center',
                gap: isSmallScreen ? 1 : 2,
                mb: 2,
            }}>
                <Typography variant="h4" component="h1">
                    {t('cities')}
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: isSmallScreen ? 'column' : 'row', gap: 1, flexGrow: 1, justifyContent: 'flex-end' }}>
                    <TextField
                        label={t('search') + "..."}
                        variant="outlined"
                        size="small"
                        value={searchTerm}
                        onChange={handleSearchChange}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SearchIcon />
                                </InputAdornment>
                            ),
                        }}
                        fullWidth={isSmallScreen}
                        sx={{ flexShrink: 1 }}
                    />
                    <Button
                        variant="contained"
                        endIcon={<AddIcon />}
                        onClick={handleOpenAddCity}
                        fullWidth={isSmallScreen}
                    >
                        {t('add')}
                    </Button>
                </Box>
            </Box>

            {loading && <LinearProgress />}

            {isSmallScreen ? (
                // **PASAR PROP ACTUALIZADA**
                <CityCardList {...commonListProps} />
            ) : (
                // **PASAR PROP ACTUALIZADA**
                <CityListTable {...commonListProps} />
            )}

            {/* ... (TablePagination) ... */}
            <TablePagination
                rowsPerPageOptions={[5, 10, 25]}
                component="div"
                count={totalCities}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handlePageChange}
                onRowsPerPageChange={handleRowsPerPageChange}
                labelRowsPerPage={t('rows_perPage')}
                labelDisplayedRows={({ from, to, count }) =>
                    `${from}-${to} ${t('of')} ${count !== -1 ? count : `${t('moreThan')} ${to}`}`
                }
            />

            {/* ... (CityFormModal) ... */}
            <CityFormModal
                open={isModalOpen}
                handleClose={handleCloseModal}
                data={selectedCity}
                isEditing={isEditing}
                setData={setCities}
            />

            {/* **NUEVO:** Confirmation Modal para Eliminación */}
            <ConfirmationModal
                open={isConfirmDeleteModalOpen}
                onClose={handleCloseDeleteConfirmation}
                onConfirm={handleDeleteCity}
                title={t('deleteCity')}
                message={t('question_areYouSureDeleteCity', { clientName: clientToDelete?.description || '' })}
                confirmText={t('delete')}
                cancelText={t('cancel')}
            />
        </Box>
    );
}

export default Index;