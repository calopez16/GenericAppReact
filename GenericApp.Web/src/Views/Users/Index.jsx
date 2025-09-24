import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    TableContainer,
    Paper,
    Table,
    TableHead,
    TableRow,
    TableCell,
    TableBody,
    Switch,
    IconButton,
    TextField,
    InputAdornment,
    Button,
    TablePagination,
    useMediaQuery,
    useTheme,
    Grid,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogContentText,
    DialogActions,
    LinearProgress
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import VpnKeyIcon from '@mui/icons-material/VpnKey'; // Importa el icono de la llave
import { DataAPIUsersService } from '@data/Users/Data';
import { useTranslation } from 'react-i18next';
import UserFormModal from './UserFormModal';
import { ShowMessage } from '@helpers/NotificationService';
import Tooltip from '@mui/material/Tooltip';
import PasswordModal from './PasswordModal'; // Asegúrate de que la ruta sea correcta
import ConfirmationResetPasswordModal from '@views/Layout/ConfirmationModal'; // Asegúrate de que la ruta sea correcta


function Index() {
    const { t } = useTranslation();
    const service = DataAPIUsersService();
    const [users, setUsers] = useState([]);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [totalUsers, setTotalUsers] = useState(0);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [isConfirmResetPasswordModalOpen, setIsConfirmResetPasswordModalOpen] = useState(false);

    // Estados para la nueva funcionalidad de la contraseña
    const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
    const [assignedPassword, setAssignedPassword] = useState('');

    const theme = useTheme();
    const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));

    const loadUsers = async () => {
        try {
            setLoading(true);
            const response = await service.getUsersPagination(page + 1, rowsPerPage, searchTerm);
            setUsers(response.data.users);
            setTotalUsers(response.data.totalCount);
        } catch (error) {
            console.error("Error loading users:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadUsers();
    }, [page, rowsPerPage, searchTerm]);

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

    // Función para reiniciar la contraseña
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
        } finally {
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
            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>{t('active')}</TableCell>
                            <TableCell>{t('userName')}</TableCell>
                            <TableCell>{t('email')}</TableCell>
                            <TableCell align="right">{t('actions')}</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={4} align="center">
                                    {t('loading')}...
                                </TableCell>
                            </TableRow>
                        ) : users?.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={4} align="center"> {t('records_notFound')}.</TableCell>
                            </TableRow>
                        ) : (
                            users.map((user, index) => (
                                <TableRow key={index}>
                                    <TableCell>
                                        <Tooltip title={user.isDisabled ? t('enable') : t('disable')}>
                                            <Switch
                                                checked={!user.isDisabled}
                                                onChange={() => handleToggleUserStatus(user)}
                                                color="primary"
                                            />
                                        </Tooltip>
                                    </TableCell>
                                    <TableCell>{user.userName}</TableCell>
                                    <TableCell>{user.email}</TableCell>
                                    <TableCell align="right">
                                        <Tooltip title={t('edit')}>
                                            <IconButton color="primary" onClick={() => handleOpenEditUser(user)}>
                                                <EditIcon />
                                            </IconButton>
                                        </Tooltip>
                                        <Tooltip title={t('resetPassword')}>
                                            <IconButton color="primary" onClick={() => { setIsConfirmResetPasswordModalOpen(true), setSelectedUser(user) }}>
                                                <VpnKeyIcon />
                                            </IconButton>
                                        </Tooltip>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

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
            />
        </Box>
    );
}

export default Index;