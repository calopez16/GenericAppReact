import React from 'react';
import {
    Box,
    Typography,
    Paper,
    Switch,
    IconButton,
    Tooltip
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import VpnKeyIcon from '@mui/icons-material/VpnKey';

const UserCardList = ({
    users,
    loading,
    t,
    handleOpenEditUser,
    handleToggleUserStatus,
    setIsConfirmResetPasswordModalOpen,
    setSelectedUser
}) => {

    // Componente interno para cada tarjeta de usuario
    const MobileUserCard = ({ user }) => (
        <Paper
            sx={{
                p: 2,
                mb: 2,
                display: 'flex',
                flexDirection: 'column',
                gap: 1,
                // Indicador visual de estado
                borderLeft: !user.isDisabled ? '4px solid green' : '4px solid grey'
            }}
        >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="body1" component="div" sx={{ fontWeight: 'bold' }}>
                    {user.userName}
                </Typography>
                <Box>
                    <Tooltip title={t('edit')}>
                        <IconButton size="small" color="primary" onClick={() => handleOpenEditUser(user)}>
                            <EditIcon />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title={t('resetPassword')}>
                        <IconButton size="small" color="primary" onClick={() => { setIsConfirmResetPasswordModalOpen(true); setSelectedUser(user); }}>
                            <VpnKeyIcon />
                        </IconButton>
                    </Tooltip>
                </Box>
            </Box>
            <Typography variant="body2" color="text.secondary">
                {t('email')}: {user.email}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Typography variant="body2" color="text.secondary">
                    {t('status')}: {!user.isDisabled ? t('active') : t('disabled')}
                </Typography>
                <Tooltip title={user.isDisabled ? t('enable') : t('disable')}>
                    <Switch
                        size="small"
                        checked={!user.isDisabled}
                        onChange={() => handleToggleUserStatus(user)}
                        color="primary"
                    />
                </Tooltip>
            </Box>
        </Paper>
    );

    if (loading) {
        return <Typography align="center" sx={{ mt: 2 }}>{t('loading')}...</Typography>;
    }

    if (users?.length === 0) {
        return <Typography align="center" sx={{ mt: 2 }}>{t('records_notFound')}.</Typography>;
    }

    return (
        <Box>
            {users.map((user, index) => (
                <MobileUserCard key={index} user={user} />
            ))}
        </Box>
    );
};

export default UserCardList;