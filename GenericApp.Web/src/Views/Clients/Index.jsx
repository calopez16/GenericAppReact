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
// Importación necesaria para el botón de eliminar (si no estaba ya)
import DeleteIcon from '@mui/icons-material/Delete';
import { DataAPIClientsService } from '@data/Clients/Data';
import { useTranslation } from 'react-i18next';
import { ShowMessage } from '@helpers/NotificationService';
// **NUEVA IMPORTACIÓN:** Importa tu ConfirmationModal
import ConfirmationModal from '@layout/ConfirmationModal'; // Asegúrate de ajustar la ruta si es necesario
import ClientFormModal from '@views/clients/ClientFormModal';
import ClientCardList from '@views/clients/ClientCardList';
import ClientListTable from '@views/clients/ClientTableList';


function Index() {
    const { t } = useTranslation();
    const clientDataService = DataAPIClientsService();
    const [clients, setClients] = useState([]);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [totalClients, setTotalClients] = useState(0);

    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(searchTerm);

    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedClient, setSelectedClient] = useState(null);
    const [isEditing, setIsEditing] = useState(false);

    // **NUEVOS ESTADOS** para el modal de confirmación de eliminación
    const [isConfirmDeleteModalOpen, setIsConfirmDeleteModalOpen] = useState(false);
    const [clientToDelete, setClientToDelete] = useState(null);

    const theme = useTheme();
    const isSmallScreen = useMediaQuery(theme.breakpoints.down('xl'));

    // ... (useEffect para debounce y carga de datos se mantienen iguales) ...
    useEffect(() => {
        const timerId = setTimeout(() => {
            setDebouncedSearchTerm(searchTerm);
        }, 500);
        return () => {
            clearTimeout(timerId);
        };
    }, [searchTerm]);

    useEffect(() => {
        const loadClients = async () => {
            try {
                setLoading(true);
                const response = await clientDataService.getDataPagination(page + 1, rowsPerPage, debouncedSearchTerm);
                setClients(response.data.data);
                setTotalClients(response.data.totalCount);
            } catch (error) {
                console.error("Error loading clients:", error);
            } finally {
                setLoading(false);
            }
        };

        loadClients();
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

    const handleToggleClientStatus = async (client) => {
        const isActiveNow = client.isActive;

        try {
            let dataResult;
            if (isActiveNow) {
                dataResult = await clientDataService.disableData(client.idClient);
                if (dataResult.success) {
                    ShowMessage(t('recordDisabled'), 'success');
                }
            } else {
                dataResult = await clientDataService.enableData(client.idClient);
                if (dataResult.success) {
                    ShowMessage(t('recordEnabled'), 'success');
                }
            }

            if (dataResult.success) {
                setClients(prevClients =>
                    prevClients.map(u =>
                        u.idClient === client.idClient ? { ...u, isActive: !isActiveNow } : u
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
        setClientToDelete(client);
        setIsConfirmDeleteModalOpen(true);
    };

    // **FUNCIÓN ACTUALIZADA:** Ejecuta la eliminación
    const handleDeleteClient = async () => {
        // Cierra el modal de confirmación inmediatamente
        setIsConfirmDeleteModalOpen(false);

        if (!clientToDelete) return; // Seguridad

        try {
            setLoading(true);

            const dataResult = await clientDataService.deleteData(clientToDelete.idClient);

            if (dataResult.success) {
                ShowMessage(t('recordDeleted'), 'success');
                // Quitar el cliente de la lista local
                setClients(prevClients => prevClients.filter(c => c.idClient !== clientToDelete.idClient));
                // Resetea la página a 0 para recargar y reajustar la paginación
                setPage(0);
            } else {
                ShowMessage(dataResult.message || t('errorDeletingRecord'), 'error');
            }
        } catch (error) {
            ShowMessage(t('error'), 'error');
            console.error("Error deleting client:", error);
        } finally {
            setClientToDelete(null); // Limpia el cliente seleccionado
            setLoading(false);
        }
    };

    const handleCloseDeleteConfirmation = () => {
        setIsConfirmDeleteModalOpen(false);
        setClientToDelete(null);
    };


    const handleOpenAddClient = () => {
        setSelectedClient(null);
        setIsEditing(false);
        setIsModalOpen(true);
    };

    const handleOpenEditClient = (client) => {
        setSelectedClient(client);
        setIsEditing(true);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
    };

    const commonListProps = {
        clients,
        loading,
        t,
        handleOpenEditClient,
        handleToggleClientStatus,
        handleOpenDeleteConfirmation,
        setSelectedClient
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
                    {t('clients')}
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
                        onClick={handleOpenAddClient}
                        fullWidth={isSmallScreen}
                    >
                        {t('add')}
                    </Button>
                </Box>
            </Box>

            {loading && <LinearProgress />}

            {isSmallScreen ? (
                // **PASAR PROP ACTUALIZADA**
                <ClientCardList {...commonListProps} />
            ) : (
                // **PASAR PROP ACTUALIZADA**
                <ClientListTable {...commonListProps} />
            )}

            {/* ... (TablePagination) ... */}
            <TablePagination
                rowsPerPageOptions={[5, 10, 25]}
                component="div"
                count={totalClients}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handlePageChange}
                onRowsPerPageChange={handleRowsPerPageChange}
                labelRowsPerPage={t('rows_perPage')}
                labelDisplayedRows={({ from, to, count }) =>
                    `${from}-${to} ${t('of')} ${count !== -1 ? count : `${t('moreThan')} ${to}`}`
                }
            />

            {/* ... (ClientFormModal) ... */}
            <ClientFormModal
                open={isModalOpen}
                handleClose={handleCloseModal}
                data={selectedClient}
                isEditing={isEditing}
                setData={setClients}
            />

            {/* **NUEVO:** Confirmation Modal para Eliminación */}
            <ConfirmationModal
                open={isConfirmDeleteModalOpen}
                onClose={handleCloseDeleteConfirmation}
                onConfirm={handleDeleteClient}
                title={t('deleteClient')}
                message={t('question_areYouSureDeleteClient', { clientName: clientToDelete?.name || '' })}
                confirmText={t('delete')}
                cancelText={t('cancel')}
            />
        </Box>
    );
}

export default Index;