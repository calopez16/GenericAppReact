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
import DeleteIcon from '@mui/icons-material/Delete';

const ClientCardList = ({
    clients,
    loading,
    t,
    handleOpenEditClient,
    handleToggleClientStatus,
    handleOpenDeleteConfirmation,
    setSelectedClient
}) => {

    const MobileClientCard = ({ client }) => (
        <Paper
            sx={{
                p: 2,
                mb: 2,
                display: 'flex',
                flexDirection: 'column',
                gap: 1,
                borderLeft: client.isActive ? '4px solid green' : '4px solid grey'
            }}
        >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="body1" component="div" sx={{ fontWeight: 'bold' }}>
                    {client.name}
                </Typography>
                <Box>
                    <Tooltip title={t('edit')}>
                        <IconButton size="small" color="primary" onClick={() => handleOpenEditClient(client)}>
                            <EditIcon />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title={t('delete')}>
                        <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleOpenDeleteConfirmation(client)}
                        >
                            <DeleteIcon />
                        </IconButton>
                    </Tooltip>
                </Box>
            </Box>
            <Typography variant="body2" color="text.secondary">
                {t('rfc')}: {client.rfc}
            </Typography>
            <Typography variant="body2" color="text.secondary">
                {t('phone')}: {client.phone}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Typography variant="body2" color="text.secondary">
                    {t('status')}: {client.isActive ? t('active') : t('disabled')}
                </Typography>
                <Tooltip title={client.isActive ? t('disable') : t('enable')}>
                    <Switch
                        size="small"
                        checked={client.isActive}
                        onChange={() => handleToggleClientStatus(client)}
                        color="primary"
                    />
                </Tooltip>
            </Box>
        </Paper>
    );

    if (loading) {
        return <Typography align="center" sx={{ mt: 2 }}>{t('loading')}...</Typography>;
    }

    if ((clients?.length ?? 0) === 0) {
        return <Typography align="center" sx={{ mt: 2 }}>{t('records_notFound')}.</Typography>;
    }

    return (
        <Box>
            {clients.map((client) => (
                <MobileClientCard key={client.idClient} client={client} />
            ))}
        </Box>
    );
};

export default ClientCardList;