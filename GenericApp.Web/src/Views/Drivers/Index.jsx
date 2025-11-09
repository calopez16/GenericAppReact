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
import { DataAPIDriversService } from '@data/Drivers/Data';
import { useTranslation } from 'react-i18next';
import { ShowMessage } from '@helpers/NotificationService';
import ConfirmationModal from '@layout/ConfirmationModal';
import DriverFormModal from '@views/Drivers/DriverFormModal';
import DriverCardList from '@views/Drivers/DriverCardList';
import DriverListTable from '@views/Drivers/DriverTableList';


function Index() {
    const { t } = useTranslation();
    const driverDataService = DataAPIDriversService();
    const [drivers, setDrivers] = useState([]);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [totalDrivers, setTotalDrivers] = useState(0);

    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(searchTerm);

    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedDriver, setSelectedDriver] = useState(null);
    const [isEditing, setIsEditing] = useState(false);

    // **NUEVOS ESTADOS** para el modal de confirmación de eliminación
    const [isConfirmDeleteModalOpen, setIsConfirmDeleteModalOpen] = useState(false);
    const [driverToDelete, setDriverToDelete] = useState(null);

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
        const loadDrivers = async () => {
            try {
                setLoading(true);
                const response = await driverDataService.getDataPagination(page + 1, rowsPerPage, debouncedSearchTerm);
                setDrivers(response.data.data);
                setTotalDrivers(response.data.totalCount);
            } catch (error) {
                console.error("Error loading drivers:", error);
            } finally {
                setLoading(false);
            }
        };

        loadDrivers();
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

    const handleToggleDriverStatus = async (driver) => {
        const isActiveNow = driver.isActive;

        try {
            let dataResult;
            if (isActiveNow) {
                dataResult = await driverDataService.disableData(driver.idDriver);
                if (dataResult.success) {
                    ShowMessage(t('recordDisabled'), 'success');
                }
            } else {
                dataResult = await driverDataService.enableData(driver.idDriver);
                if (dataResult.success) {
                    ShowMessage(t('recordEnabled'), 'success');
                }
            }

            if (dataResult.success) {
                setDrivers(prevDrivers =>
                    prevDrivers.map(u =>
                        u.idDriver === driver.idDriver ? { ...u, isActive: !isActiveNow } : u
                    )
                );
            }
        } catch (error) {
            ShowMessage(t('error'), 'error');
            console.error("Error toggling driver status:", error);
        }
    };

    // **NUEVA FUNCIÓN:** Abre el modal de confirmación y guarda el drivere
    const handleOpenDeleteConfirmation = (driver) => {
        setDriverToDelete(driver);
        setIsConfirmDeleteModalOpen(true);
    };

    // **FUNCIÓN ACTUALIZADA:** Ejecuta la eliminación
    const handleDeleteDriver = async () => {
        // Cierra el modal de confirmación inmediatamente
        setIsConfirmDeleteModalOpen(false);

        if (!driverToDelete) return; // Seguridad

        try {
            setLoading(true);

            const dataResult = await driverDataService.deleteData(driverToDelete.idDriver);

            if (dataResult.success) {
                ShowMessage(t('recordDeleted'), 'success');
                // Quitar el drivere de la lista local
                setDrivers(prevDrivers => prevDrivers.filter(c => c.idDriver !== driverToDelete.idDriver));
                // Resetea la página a 0 para recargar y reajustar la paginación
                setPage(0);
            } else {
                ShowMessage(dataResult.message || t('errorDeletingRecord'), 'error');
            }
        } catch (error) {
            ShowMessage(t('error'), 'error');
            console.error("Error deleting driver:", error);
        } finally {
            setDriverToDelete(null); // Limpia el drivere seleccionado
            setLoading(false);
        }
    };

    const handleCloseDeleteConfirmation = () => {
        setIsConfirmDeleteModalOpen(false);
        setDriverToDelete(null);
    };


    const handleOpenAddDriver = () => {
        setSelectedDriver(null);
        setIsEditing(false);
        setIsModalOpen(true);
    };

    const handleOpenEditDriver = (driver) => {
        setSelectedDriver(driver);
        setIsEditing(true);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
    };

    const commonListProps = {
        drivers,
        loading,
        t,
        handleOpenEditDriver,
        handleToggleDriverStatus,
        handleOpenDeleteConfirmation,
        setSelectedDriver
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
                    {t('drivers')}
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
                        onClick={handleOpenAddDriver}
                        fullWidth={isSmallScreen}
                    >
                        {t('add')}
                    </Button>
                </Box>
            </Box>

            {loading && <LinearProgress />}

            {isSmallScreen ? (
                // **PASAR PROP ACTUALIZADA**
                <DriverCardList {...commonListProps} />
            ) : (
                // **PASAR PROP ACTUALIZADA**
                <DriverListTable {...commonListProps} />
            )}

            {/* ... (TablePagination) ... */}
            <TablePagination
                rowsPerPageOptions={[5, 10, 25]}
                component="div"
                count={totalDrivers}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handlePageChange}
                onRowsPerPageChange={handleRowsPerPageChange}
                labelRowsPerPage={t('rows_perPage')}
                labelDisplayedRows={({ from, to, count }) =>
                    `${from}-${to} ${t('of')} ${count !== -1 ? count : `${t('moreThan')} ${to}`}`
                }
            />

            {/* ... (DriverFormModal) ... */}
            <DriverFormModal
                open={isModalOpen}
                handleClose={handleCloseModal}
                data={selectedDriver}
                isEditing={isEditing}
                setData={setDrivers}
            />

            {/* **NUEVO:** Confirmation Modal para Eliminación */}
            <ConfirmationModal
                open={isConfirmDeleteModalOpen}
                onClose={handleCloseDeleteConfirmation}
                onConfirm={handleDeleteDriver}
                title={t('deleteDriver')}
                message={t('question_areYouSureDeleteDriver', { driverName: driverToDelete?.description || '' })}
                confirmText={t('delete')}
                cancelText={t('cancel')}
            />
        </Box>
    );
}

export default Index;