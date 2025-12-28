import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
// Asegúrate de que la ruta de importación sea la correcta según tu estructura
import { dataApiShipmentsService } from '@data/Shipments/Data';
import { useTranslation } from 'react-i18next';
import { ShowMessage } from '@helpers/NotificationService';
import ConfirmationModal from '@layout/ConfirmationModal';

// Importamos las vistas de lista (Tabla y Tarjetas)
import ShipmentCardList from './ShipmentCardList';
import ShipmentListTable from './ShipmentTableList';

function ShipmentsIndex() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const shipmentDataService = dataApiShipmentsService();

    // Estados de Datos y Paginación
    const [shipments, setShipments] = useState([]);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(5);
    const [totalShipments, setTotalShipments] = useState(0);

    // Estados de Búsqueda
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(searchTerm);

    // Estados de UI y Control
    const [loading, setLoading] = useState(true);

    // Estados para Eliminar
    const [isConfirmDeleteModalOpen, setIsConfirmDeleteModalOpen] = useState(false);
    const [shipmentToDelete, setShipmentToDelete] = useState(null);
    const [deletingId, setDeletingId] = useState(null);

    const ANIMATION_DURATION = 500;

    // Lógica Responsiva solicitada
    const theme = useTheme();
    const isSmallScreen = useMediaQuery(theme.breakpoints.down('xl'));

    // Debounce para la búsqueda
    useEffect(() => {
        const timerId = setTimeout(() => {
            setDebouncedSearchTerm(searchTerm);
        }, 500);
        return () => {
            clearTimeout(timerId);
        };
    }, [searchTerm]);

    // Carga de datos
    useEffect(() => {
        const loadShipments = async () => {
            try {
                setLoading(true);
                // Asumiendo que getPagination acepta (pageNumber, pageSize, searchTerm)
                const response = await shipmentDataService.getPagination(page + 1, rowsPerPage, debouncedSearchTerm);

                // Ajustar según la estructura de respuesta de tu API (Data.jsx)
                // Generalmente es response.data.Data para la lista y response.data.TotalCount para el total
                if (response.data && response.data.Data) {
                    setShipments(response.data.Data.Data || response.data.Data); // Ajuste por si viene anidado en paginatedResponse
                    setTotalShipments(response.data.Data.TotalCount || response.data.TotalCount || 0);
                }
            } catch (error) {
                console.error("Error loading shipments:", error);
                ShowMessage(t('error_fetching_data'), 'error');
            } finally {
                setLoading(false);
            }
        };

        loadShipments();
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

    // Navegación a Crear (diferente a Seasons que usa Modal)
    const handleOpenAddShipment = () => {
        navigate('/shipments/add'); // Ajusta la ruta según tu Router
    };

    // Navegación a Editar (diferente a Seasons que usa Modal)
    const handleOpenEditShipment = (shipment) => {
        navigate(`/shipments/edit/${shipment.idShipment}`);
    };

    // Toggle Status (Activar/Desactivar)
    const handleToggleShipmentStatus = async (shipment) => {
        const isActiveNow = shipment.isActive;

        try {
            let dataResult;
            if (isActiveNow) {
                dataResult = await shipmentDataService.disableData(shipment.idShipment);
                if (dataResult.isSuccess || dataResult.success) { // Ajuste según tu respuesta API standard
                    ShowMessage(t('recordDisabled'), 'success');
                }
            } else {
                dataResult = await shipmentDataService.enableData(shipment.idShipment);
                if (dataResult.isSuccess || dataResult.success) {
                    ShowMessage(t('recordEnabled'), 'success');
                }
            }

            if (dataResult.isSuccess || dataResult.success) {
                setShipments(prevShipments =>
                    prevShipments.map(s =>
                        s.idShipment === shipment.idShipment ? { ...s, isActive: !isActiveNow } : s
                    )
                );
            }
        } catch (error) {
            ShowMessage(t('error'), 'error');
            console.error("Error toggling shipment status:", error);
        }
    };

    // Lógica de Eliminado
    const handleOpenDeleteConfirmation = (shipment) => {
        setShipmentToDelete(shipment);
        setIsConfirmDeleteModalOpen(true);
    };

    const handleDeleteShipment = async () => {
        setIsConfirmDeleteModalOpen(false);

        if (!shipmentToDelete) return;

        const idToDelete = shipmentToDelete.idShipment;

        try {
            setDeletingId(idToDelete);

            const dataResult = await shipmentDataService.deleteData(idToDelete);

            if (dataResult.isSuccess || dataResult.success) {
                ShowMessage(t('recordDeleted'), 'success');

                setTimeout(() => {
                    setShipments(prevShipments => prevShipments.filter(s => s.idShipment !== idToDelete));
                    setDeletingId(null);
                    // Si borramos el último de la página, regresar una página
                    if (shipments.length === 1 && page > 0) {
                        setPage(page - 1);
                    }
                }, ANIMATION_DURATION);

            } else {
                ShowMessage(dataResult.message || t('errorDeletingRecord'), 'error');
                setDeletingId(null);
            }
        } catch (error) {
            ShowMessage(t('error'), 'error');
            console.error("Error deleting shipment:", error);
            setDeletingId(null);
        } finally {
            setShipmentToDelete(null);
        }
    };

    const handleCloseDeleteConfirmation = () => {
        setIsConfirmDeleteModalOpen(false);
        setShipmentToDelete(null);
    };

    // Props comunes para pasar a las vistas hijas
    const commonListProps = {
        shipments,
        loading,
        t,
        handleOpenEditShipment,
        handleToggleShipmentStatus,
        handleDeleteShipment: handleOpenDeleteConfirmation, // Pasamos la función que abre el modal
        deletingId
    };

    return (
        <Box sx={{ p: 3 }}>
            <Box sx={{
                display: 'flex',
                flexDirection: isSmallScreen ? 'column' : 'row',
                justifyContent: 'space-between',
                alignItems: isSmallScreen ? 'stretch' : 'center',
                gap: isSmallScreen ? 1 : 2,
                mb: 2,
            }}>
                <Typography variant="h4" component="h1">
                    {t('Shipments')}
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
                        onClick={handleOpenAddShipment}
                        fullWidth={isSmallScreen}
                    >
                        {t('add')}
                    </Button>
                </Box>
            </Box>

            {loading && <LinearProgress sx={{ mb: 2 }} />}

            {/* Renderizado condicional basado en breakpoints */}
            {isSmallScreen ? (
                <ShipmentCardList {...commonListProps} />
            ) : (
                <ShipmentListTable {...commonListProps} />
            )}

            <TablePagination
                rowsPerPageOptions={[5, 10, 25]}
                component="div"
                count={totalShipments}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handlePageChange}
                onRowsPerPageChange={handleRowsPerPageChange}
                labelRowsPerPage={t('rows_perPage')}
                labelDisplayedRows={({ from, to, count }) =>
                    `${from}-${to} ${t('of')} ${count !== -1 ? count : `${t('moreThan')} ${to}`}`
                }
            />

            <ConfirmationModal
                open={isConfirmDeleteModalOpen}
                onClose={handleCloseDeleteConfirmation}
                onConfirm={handleDeleteShipment}
                title={t('Delete Shipment')}
                message={t('question_areYouSureDeleteRecord', { name: shipmentToDelete?.name || shipmentToDelete?.idShipment })}
                confirmText={t('delete')}
                cancelText={t('cancel')}
            />
        </Box>
    );
}

export default ShipmentsIndex;