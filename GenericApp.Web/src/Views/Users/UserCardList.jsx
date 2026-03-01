import React from 'react';
import {
    Box, Typography, Paper, Switch, IconButton, Tooltip, Avatar, Chip, Divider
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import VpnKeyIcon from '@mui/icons-material/VpnKey';
import MailOutlineIcon from '@mui/icons-material/MailOutline';
import BusinessIcon from '@mui/icons-material/Business'; // Icono para compañía
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings'; // Icono para roles
import EmptyData from '@layout/EmptyData';

const UserCardList = ({
    users, loading, t, handleOpenEditUser, handleToggleUserStatus,
    setIsConfirmResetPasswordModalOpen, setSelectedUser,
    isSearch = false,
}) => {

    const MobileUserCard = ({ user }) => (
        <Paper
            elevation={0}
            sx={{
                p: 2, mb: 2, borderRadius: 3, border: '1px solid', borderColor: 'divider',
                transition: '0.3s', '&:hover': { boxShadow: '0 4px 20px 0 rgba(0,0,0,0.05)' }
            }}
        >
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar sx={{ bgcolor: user.isDisabled ? 'grey.400' : 'primary.main', mr: 2 }}>
                    {user.userName.charAt(0).toUpperCase()}
                </Avatar>
                <Box sx={{ flexGrow: 1 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
                        {user.userName}
                    </Typography>
                    {/* Campo: Compañía */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.3 }}>
                        <BusinessIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
                        <Typography variant="caption" color="text.secondary">
                            {user.companyDescription || t('no_company')}
                        </Typography>
                    </Box>
                </Box>
                <Box sx={{ display: 'flex', gap: 1 }}>
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
                                setIsConfirmResetPasswordModalOpen(true);
                                setSelectedUser(user);
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
            </Box>

            {/* Campo: Email */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <MailOutlineIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
                <Typography variant="body2" color="text.secondary">
                    {user.email}
                </Typography>
            </Box>

            {/* Campo: Roles */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <AdminPanelSettingsIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {user.roles?.map((role, idx) => (
                        <Typography
                            key={idx}
                            variant="caption"
                            sx={{
                                bgcolor: 'action.hover',
                                px: 1,
                                py: 0.2,
                                borderRadius: 1,
                                border: '1px solid',
                                borderColor: 'divider'
                            }}
                        >
                            {role}
                        </Typography>
                    ))}
                </Box>
            </Box>

            <Divider sx={{ mb: 1.5, borderStyle: 'dashed' }} />

            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Chip
                    label={!user.isDisabled ? t('active') : t('disabled')}
                    size="small"
                    color={!user.isDisabled ? "success" : "default"}
                    variant="soft"
                    sx={{ height: 24, fontSize: '0.75rem', fontWeight: 'bold', borderRadius: 1.5 }}
                />
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="caption" color="text.secondary">{t('status')}</Typography>
                    <Switch
                        size="small"
                        checked={!user.isDisabled}
                        onChange={() => handleToggleUserStatus(user)}
                    />
                </Box>
            </Box>
        </Paper>
    );

    if (loading) return <Typography align="center" sx={{ mt: 2 }}>{t('loading')}...</Typography>;

    if (users?.length === 0) return (
        <Box sx={{ mt: 2 }}>
            <EmptyData
                isSearch={isSearch}
                title={isSearch ? t('records_notFound') : t('no_users_yet')}
                description={isSearch ? t('try_another_search_term') : t('start_by_adding_user')}
                actionLabel={t('add')}
            />
        </Box>
    );

    return (
        <Box sx={{ mt: 2 }}>
            {users.map((user, index) => (
                <MobileUserCard key={user.userName || index} user={user} />
            ))}
        </Box>
    );
};

export default UserCardList;