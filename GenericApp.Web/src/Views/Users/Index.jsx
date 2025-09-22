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
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import { DataAPIUsersService } from '@data/Users/Data';
import { useTranslation } from 'react-i18next';
import UserFormModal from './UserFormModal';
import { ShowMessage } from '@helpers/NotificationService';
import Tooltip from '@mui/material/Tooltip';

function Index() {
    const { t } = useTranslation();
    const service = DataAPIUsersService();
    const [users, setUsers] = useState([]);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [totalUsers, setTotalUsers] = useState(0);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false); // Estado para abrir/cerrar el modal
    const [selectedUser, setSelectedUser] = useState(null); // Estado para el usuario seleccionado a editar
    const [isEditing, setIsEditing] = useState(false); // Estado para saber si estamos editando

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
            if (isEnabled) {
                var dataResult = await service.disableUser(user.userName);
                if (dataResult.success)
                    ShowMessage(t('recordDisabled'), 'success');

            } else {
                var dataResult = await service.enableUser(user.userName);
                if (dataResult.success)
                    ShowMessage(t('recordEnabled'), 'success');
            }
            loadUsers();
        } catch (error) {
            console.error("Error toggling user status:", error);
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
        //setSelectedUser(null);
        //setIsEditing(false);
        loadUsers(); // Recarga la lista de usuarios después de cerrar el modal
    };

    return (
        <Box sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h4" component="h1">
                    {t('users')}
                </Typography>
                <Box>
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
                        sx={{ mr: 2 }}
                    />
                    <Button variant="contained" endIcon={<AddIcon />} onClick={handleOpenAddUser}>
                        {t('add')}
                    </Button>
                </Box>
            </Box>

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
                            <TableRow key={1}>
                                <TableCell key={1} colSpan={4} align="center"> {t('loading')}...</TableCell>
                            </TableRow>
                        ) : (users?.length ?? 0) === 0 ? (
                            <TableRow key={1}>
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
                user={selectedUser}
                isEditing={isEditing}
            />
        </Box>
    );
}

export default Index;