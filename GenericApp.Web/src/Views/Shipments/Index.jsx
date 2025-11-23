import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // 👈 IMPORTANTE: Importar useNavigate
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
import { DataAPIEmbarquesService } from '@data/Embarques/Data';
import { useTranslation } from 'react-i18next';
import { ShowMessage } from '@helpers/NotificationService';
import EmbarqueCardList from './ShipmentCardList';
import EmbarqueListTable from './ShipmentTableList';


function Index() {
    const { t } = useTranslation();
    const navigate = useNavigate(); // 👈 Inicializar el hook de navegación
    const embarqueDataService = DataAPIEmbarquesService();
    const [embarques, setEmbarques] = useState([]);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [totalEmbarques, setTotalEmbarques] = useState(0);

    // Estados de búsqueda
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(searchTerm);

    const [loading, setLoading] = useState(true);

    // ❌ ELIMINAMOS los estados de modal y edición, ya que la navegación los reemplaza.
    // const [isModalOpen, setIsModalOpen] = useState(false);
    // const [selectedEmbarque, setSelectedEmbarque] = useState(null);
    // const [isEditing, setIsEditing] = useState(false);

    // Mantenemos los estados para las funciones de Reset Password si son modales
    const [isConfirmResetPasswordModalOpen, setIsConfirmResetPasswordModalOpen] = useState(false);
    const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
    const [assignedPassword, setAssignedPassword] = useState('');
    const [selectedEmbarque, setSelectedEmbarque] = useState(null); // Necesario para Reset Password

    const theme = useTheme();
    const isSmallScreen = useMediaQuery(theme.breakpoints.down('xl'));

    // Efectos de Debounce y Carga de Datos (se mantienen sin cambios)
    useEffect(() => {
        const timerId = setTimeout(() => {
            setDebouncedSearchTerm(searchTerm);
        }, 500);
        return () => {
            clearTimeout(timerId);
        };
    }, [searchTerm]);

    useEffect(() => {
        const loadEmbarques = async () => {
            try {
                setLoading(true);
                const response = await embarqueDataService.getPagination(page + 1, rowsPerPage, debouncedSearchTerm);
                setEmbarques(response.data.embarques);
                setTotalEmbarques(response.data.totalCount);
            } catch (error) {
                console.error("Error loading embarques:", error);
            } finally {
                setLoading(false);
            }
        };

        loadEmbarques();
    }, [page, rowsPerPage, debouncedSearchTerm]);


    // Handlers de paginación y búsqueda
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

    // Handlers de acciones de datos (se mantienen sin cambios)
    const handleToggleEmbarqueStatus = async (embarque) => {
        try {
            // ... lógica de toggle status
        } catch (error) {
            ShowMessage(t('error'), 'error');
            console.error("Error toggling embarque status:", error);
        }
    };

    const handleResetPassword = async (embarque) => {
        // ... lógica de reset password
    };


    // 🚀 NUEVA LÓGICA: Redirigir a la ruta de Agregar
    const handleOpenAddEmbarque = () => {
        navigate('/embarques/add');
    };

    // 🚀 NUEVA LÓGICA: Redirigir a la ruta de Edición con el ID
    const handleOpenEditEmbarque = (embarque) => {
        // Asumiendo que 'id' es la propiedad que identifica el embarque
        navigate(`/embarques/edit/${embarque.id}`);
    };

    // ❌ handleCloseModal se elimina.

    const commonListProps = {
        embarques,
        loading,
        t,
        handleOpenEditEmbarque, // Pasa la función de navegación
        handleToggleEmbarqueStatus,
        setIsConfirmResetPasswordModalOpen,
        setSelectedEmbarque // Se mantiene para Reset Password
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
                    {t('embarques')}
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
                        onClick={handleOpenAddEmbarque} // 👈 Ahora navega a /embarques/add
                        fullWidth={isSmallScreen}
                    >
                        {t('add')}
                    </Button>
                </Box>
            </Box>

            {loading && <LinearProgress />}

            {/* Renderiza el listado (que ahora solo es el listado, sin el modal) */}
            {isSmallScreen ? (
                <EmbarqueCardList {...commonListProps} />
            ) : (
                <EmbarqueListTable {...commonListProps} />
            )}

            <TablePagination
                rowsPerPageOptions={[5, 10, 25]}
                component="div"
                count={totalEmbarques}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handlePageChange}
                onRowsPerPageChange={handleRowsPerPageChange}
                labelRowsPerPage={t('rows_perPage')}
                labelDisplayedRows={({ from, to, count }) =>
                    `${from}-${to} ${t('of')} ${count !== -1 ? count : `${t('moreThan')} ${to}`}`
                }
            />

            {/* Aquí deberías incluir los modales (si son modales) para Reset Password */}
        </Box>
    );
}

export default Index;