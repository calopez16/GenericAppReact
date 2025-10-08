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
import { DataAPIUsersService } from '@data/Users/Data';
import { useTranslation } from 'react-i18next';
import { ShowMessage } from '@helpers/NotificationService';
import EmbarqueFormModal from './EmbarqueFormModal';
import EmbarqueCardList from './EmbarqueCardList';
import EmbarqueListTable from './EmbarqueTableList';


function Index() {
    const { t } = useTranslation();
    const embarqueDataService = DataAPIEmbarquesService();
    const [embarques, setEmbarques] = useState([]);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [totalEmbarques, setTotalEmbarques] = useState(0);

    // 1. Estado para el input inmediato y para el valor "debounced"
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(searchTerm);

    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedEmbarque, setSelectedEmbarque] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [isConfirmResetPasswordModalOpen, setIsConfirmResetPasswordModalOpen] = useState(false);
    const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
    const [assignedPassword, setAssignedPassword] = useState('');

    const theme = useTheme();
    const isSmallScreen = useMediaQuery(theme.breakpoints.down('xl'));

    // 2. useEffect para implementar el "debounce"
    // Este efecto se ejecuta cada vez que 'searchTerm' cambia
    useEffect(() => {
        // Se crea un temporizador que actualizará el término de búsqueda debounced después de 500ms
        const timerId = setTimeout(() => {
            setDebouncedSearchTerm(searchTerm);
        }, 500);

        // Función de limpieza: se ejecuta si el usuario vuelve a escribir antes de que pasen los 500ms.
        // Cancela el temporizador anterior para evitar ejecuciones innecesarias.
        return () => {
            clearTimeout(timerId);
        };
    }, [searchTerm]); // La dependencia es el término de búsqueda del input


    // 3. useEffect para la carga de datos
    // Este efecto ahora depende de 'debouncedSearchTerm' en lugar de 'searchTerm'
    useEffect(() => {
        const loadEmbarques = async () => {
            try {
                setLoading(true);
                // Se usa el valor "debounced" para hacer la petición a la API
                const response = await embarqueDataService.getEmbarquesPagination(page + 1, rowsPerPage, debouncedSearchTerm);
                setEmbarques(response.data.embarques);
                setTotalEmbarques(response.data.totalCount);
            } catch (error) {
                console.error("Error loading embarques:", error);
            } finally {
                setLoading(false);
            }
        };

        loadEmbarques();
    }, [page, rowsPerPage, debouncedSearchTerm]); // La dependencia ahora es el término de búsqueda "debounced"


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

    const handleToggleEmbarqueStatus = async (embarque) => {
        try {
            const isEnabled = !embarque.isDisabled;
            let dataResult;
            if (isEnabled) {
                dataResult = await embarqueDataService.disableEmbarque(embarque.embarqueName);
                if (dataResult.success) {
                    ShowMessage(t('recordDisabled'), 'success');
                }
            } else {
                dataResult = await embarqueDataService.enableEmbarque(embarque.embarqueName);
                if (dataResult.success) {
                    ShowMessage(t('recordEnabled'), 'success');
                }
            }
            if (dataResult.success) {
                setEmbarques(prevEmbarques =>
                    prevEmbarques.map(u =>
                        u.embarqueName === embarque.embarqueName ? { ...u, isDisabled: !u.isDisabled } : u
                    )
                );
            }
        } catch (error) {
            ShowMessage(t('error'), 'error');
            console.error("Error toggling embarque status:", error);
        }
    };

    const handleResetPassword = async (embarque) => {
        try {
            setIsConfirmResetPasswordModalOpen(false);
            const response = await embarqueDataService.resetPassword(embarque.embarqueName);
            if (response.success) {
                setAssignedPassword(response.data.newPassword);
                setIsPasswordModalOpen(true);
                ShowMessage(t('passwordChanged'), 'success');
            } else {
                ShowMessage(t('error'), 'error');
            }
        } catch (error) {
            console.error("Error resetting password:", error);
            ShowMessage(t('error'), 'error');
        }
    };

    const handleOpenAddEmbarque = () => {
        setSelectedEmbarque(null);
        setIsEditing(false);
        setIsModalOpen(true);
    };

    const handleOpenEditEmbarque = (embarque) => {
        setSelectedEmbarque(embarque);
        setIsEditing(true);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
    };

    const commonListProps = {
        embarques,
        loading,
        t,
        handleOpenEditEmbarque,
        handleToggleEmbarqueStatus,
        setIsConfirmResetPasswordModalOpen,
        setSelectedEmbarque
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
                        onClick={handleOpenAddEmbarque}
                        fullWidth={isSmallScreen}
                    >
                        {t('add')}
                    </Button>
                </Box>
            </Box>

            {loading && <LinearProgress />}

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

            <EmbarqueFormModal
                open={isModalOpen}
                handleClose={handleCloseModal}
                data={selectedEmbarque}
                isEditing={isEditing}
                setData={setEmbarques}
            />
        </Box>
    );
}

export default Index;