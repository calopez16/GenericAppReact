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
import ConfirmationResetPasswordModal from '@views/Layout/ConfirmationModal';
import PasswordModal from './PasswordModal';
import UserFormModal from './UserFormModal';
import UserCardList from './UserCardList';
import UserListTable from './UserTableList';


function Index() {
    const { t } = useTranslation();
    const service = DataAPIUsersService();
    const [users, setUsers] = useState([]);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [totalUsers, setTotalUsers] = useState(0);

    // 1. Estado para el input inmediato y para el valor "debounced"
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(searchTerm);

    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
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
        const loadUsers = async () => {
            try {
                setLoading(true);
                // Se usa el valor "debounced" para hacer la petición a la API
                const response = await service.getUsersPagination(page + 1, rowsPerPage, debouncedSearchTerm);
                setUsers(response.data.users);
                setTotalUsers(response.data.totalCount);
            } catch (error) {
                console.error("Error loading users:", error);
            } finally {
                setLoading(false);
            }
        };

        loadUsers();
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

    const handleToggleUserStatus = async (user) => {
        try {
            const isEnabled = !user.isDisabled;
            let dataResult;
            if (isEnabled) {
                dataResult = await service.disableUser(user.userName);
                if (dataResult.success) {
                    ShowMessage(t('recordDisabled'), 'success');
                }
            } else {
                dataResult = await service.enableUser(user.userName);
                if (dataResult.success) {
                    ShowMessage(t('recordEnabled'), 'success');
                }
            }
            if (dataResult.success) {
                setUsers(prevUsers =>
                    prevUsers.map(u =>
                        u.userName === user.userName ? { ...u, isDisabled: !u.isDisabled } : u
                    )
                );
            }
        } catch (error) {
            ShowMessage(t('error'), 'error');
            console.error("Error toggling user status:", error);
        }
    };

    const handleResetPassword = async (user) => {
        try {
            setIsConfirmResetPasswordModalOpen(false);
            const response = await service.resetPassword(user.userName);
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

    const handleOpenAddUser = () => {
        setSelectedUser(null);
        setIsEditing(false);
        setIsModalOpen(true);
    };

    const handleOpenEditUser = (user) => {
        setSelectedUser(user);
        setIsEditing(true);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
    };

    const commonListProps = {
        users,
        loading,
        t,
        handleOpenEditUser,
        handleToggleUserStatus,
        setIsConfirmResetPasswordModalOpen,
        setSelectedUser
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
                    {t('users')}
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
                        onClick={handleOpenAddUser}
                        fullWidth={isSmallScreen}
                    >
                        {t('add')}
                    </Button>
                </Box>
            </Box>

            {loading && <LinearProgress />}

            {isSmallScreen ? (
                <UserCardList {...commonListProps} />
            ) : (
                <UserListTable {...commonListProps} />
            )}

            <TablePagination
                rowsPerPageOptions={[5, 10, 25]}
                component="div"
                count={totalUsers}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handlePageChange}
                onRowsPerPageChange={handleRowsPerPageChange}
                labelRowsPerPage={t('rows_perPage')}
                labelDisplayedRows={({ from, to, count }) =>
                    `${from}-${to} ${t('of')} ${count !== -1 ? count : `${t('moreThan')} ${to}`}`
                }
            />

            <UserFormModal
                open={isModalOpen}
                handleClose={handleCloseModal}
                data={selectedUser}
                isEditing={isEditing}
                setData={setUsers}
            />
            <PasswordModal
                open={isPasswordModalOpen}
                onClose={() => setIsPasswordModalOpen(!isPasswordModalOpen)}
                password={assignedPassword}
            />
            <ConfirmationResetPasswordModal
                open={isConfirmResetPasswordModalOpen}
                onClose={() => setIsConfirmResetPasswordModalOpen(!isConfirmResetPasswordModalOpen)}
                onConfirm={() => handleResetPassword(selectedUser)}
                title={t("resetPassword")}
                message={t("question_areYouSureResetPassword")}
            />
        </Box>
    );
}

export default Index;