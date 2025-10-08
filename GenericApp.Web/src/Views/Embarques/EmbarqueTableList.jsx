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
import VpnKeyIcon from '@mui/icons-material/VpnKey';

// Este componente renderiza la lista de usuarios en formato de tabla.
const UserListTable = ({
    users,
    loading,
    t,
    handleOpenEditUser,
    handleToggleUserStatus,
    setIsConfirmResetPasswordModalOpen,
    setSelectedUser
}) => {

    // Ancho mínimo para forzar el scroll horizontal si es necesario
    const minTableWidth = 650;

    return (
        // Utilizamos overflowX: 'auto' para garantizar la responsividad en esta vista
        <TableContainer component={Paper} sx={{ overflowX: 'auto' }}>
            <Table sx={{ minWidth: minTableWidth }}>
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
                                        <IconButton color="primary" onClick={() => { setIsConfirmResetPasswordModalOpen(true); setSelectedUser(user); }}>
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
    );
};

export default UserListTable;