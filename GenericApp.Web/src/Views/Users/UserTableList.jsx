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
    Typography,
    Avatar,
    Box,
    Skeleton
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import VpnKeyIcon from '@mui/icons-material/VpnKey';
import MailOutlineIcon from '@mui/icons-material/MailOutline';
import EmptyData from '@layout/EmptyData';

const UserListTable = ({
    users,
    loading,
    t,
    handleOpenEditUser,
    handleToggleUserStatus,
    setIsConfirmResetPasswordModalOpen,
    setSelectedUser,
    isSearch = false,
    rowsPerPage = 5
}) => {

    const minTableWidth = 650;
    const rowHeight = 75;

    const emptyRows = !loading && users?.length > 0
        ? Math.max(0, rowsPerPage - users.length)
        : 0;

    return (
        <TableContainer
            component={Paper}
            elevation={0}
            sx={{
                overflowX: 'auto',
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 2
            }}
        >
            <Table sx={{ minWidth: minTableWidth }} aria-label="users table">
                <TableHead sx={{ bgcolor: 'action.hover' }}>
                    <TableRow>
                        <TableCell sx={{ fontWeight: 'bold', width: 150 }} align="center">
                            {t('status')}
                        </TableCell>
                        <TableCell sx={{ fontWeight: 'bold' }}>{t('user')}</TableCell>
                        <TableCell sx={{ fontWeight: 'bold' }}>{t('email')}</TableCell>
                        <TableCell sx={{ fontWeight: 'bold' }}>{t('company')}</TableCell>
                        <TableCell sx={{ fontWeight: 'bold' }}>{t('roles')}</TableCell>
                        <TableCell sx={{ fontWeight: 'bold' }} align="center">{t('actions')}</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {loading ? (
                        Array.from(new Array(rowsPerPage)).map((_, index) => (
                            <TableRow key={`skeleton-${index}`} style={{ height: rowHeight }}>
                                <TableCell align="center">
                                    <Skeleton variant="rectangular" width={40} height={20} sx={{ mx: 'auto' }} />
                                </TableCell>
                                <TableCell>
                                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                        <Skeleton variant="circular" width={40} height={40} sx={{ mr: 2 }} />
                                        <Skeleton width="60%" />
                                    </Box>
                                </TableCell>
                                <TableCell><Skeleton width="80%" /></TableCell>
                                <TableCell><Skeleton width="80%" /></TableCell>
                                <TableCell><Skeleton width="80%" /></TableCell>
                                <TableCell align="center">
                                    <Skeleton variant="circular" width={30} height={30} sx={{ mx: 'auto' }} />
                                </TableCell>
                            </TableRow>
                        ))
                    ) : (
                        <>
                            {users?.map((user) => (
                                <TableRow
                                    key={user.id}
                                    hover
                                    sx={{ '&:last-child td, &:last-child th': { border: 0 }, height: rowHeight }}
                                >
                                    {/* Columna 1: Switch de Estado (150px) */}
                                    <TableCell align="center">
                                        <Switch
                                            size="medium"
                                            checked={!user.isDisabled}
                                            onChange={() => handleToggleUserStatus(user)}
                                        />
                                    </TableCell>

                                    {/* Columna 2: Usuario */}
                                    <TableCell>
                                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                            <Avatar
                                                sx={{
                                                    bgcolor: user.isDisabled ? 'grey.400' : 'primary.main',
                                                    mr: 2,
                                                    width: 40,
                                                    height: 40,
                                                    fontSize: '1rem'
                                                }}
                                            >
                                                {user.userName.charAt(0).toUpperCase()}
                                            </Avatar>
                                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                                {user.userName}
                                            </Typography>
                                        </Box>
                                    </TableCell>

                                    {/* Columna 3: Email */}
                                    <TableCell>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                            <MailOutlineIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
                                            <Typography variant="body2" color="text.secondary">
                                                {user.email}
                                            </Typography>
                                        </Box>
                                    </TableCell>

                                    <TableCell>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                            <Typography variant="body2" color="text.secondary">
                                                {user.companyDescription}
                                            </Typography>
                                        </Box>
                                    </TableCell>

                                    <TableCell>
                                        <Box>
                                            {user.roles.map((rol) => (
                                                <Typography variant="body2" color="text.secondary">
                                                    {rol}
                                                </Typography>
                                            ))}
                                        </Box>
                                    </TableCell>

                                    {/* Columna 4: Acciones */}
                                    <TableCell align="center">
                                        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
                                            <Tooltip title={t('edit')}>
                                                <IconButton
                                                    onClick={() => handleOpenEditUser(user)}
                                                    sx={{
                                                        color: 'white',
                                                        bgcolor: 'primary.main',
                                                        '&:hover': { bgcolor: 'primary.dark' },
                                                        p: 1
                                                    }}
                                                >
                                                    <EditIcon fontSize="small" />
                                                </IconButton>
                                            </Tooltip>
                                            <Tooltip title={t('resetPassword')}>
                                                <IconButton
                                                    onClick={() => {
                                                        setSelectedUser(user);
                                                        setIsConfirmResetPasswordModalOpen(true);
                                                    }}
                                                    sx={{
                                                        color: 'white',
                                                        bgcolor: 'warning.main',
                                                        '&:hover': { bgcolor: 'warning.dark' },
                                                        p: 1
                                                    }}
                                                >
                                                    <VpnKeyIcon fontSize="small" />
                                                </IconButton>
                                            </Tooltip>
                                        </Box>
                                    </TableCell>
                                </TableRow>
                            ))}

                            {emptyRows > 0 && (
                                Array.from(new Array(emptyRows)).map((_, index) => (
                                    <TableRow key={`empty-${index}`} style={{ height: rowHeight }}>
                                        <TableCell colSpan={6} sx={{ borderBottom: index === emptyRows - 1 ? 'none' : '1px solid rgba(224, 224, 224, 0.4)' }} />
                                    </TableRow>
                                ))
                            )}
                        </>
                    )}
                </TableBody>
            </Table>

            {!loading && users?.length === 0 && (
                <Box sx={{ mt: 2 }}>
                    <EmptyData
                        isSearch={isSearch}
                        title={isSearch ? t('records_notFound') : t('no_users_yet')}
                        description={isSearch ? t('try_another_search_term') : t('start_by_adding_user')}
                        actionLabel={t('add')}
                    />
                </Box>
            )}
        </TableContainer>
    );
};

export default UserListTable;