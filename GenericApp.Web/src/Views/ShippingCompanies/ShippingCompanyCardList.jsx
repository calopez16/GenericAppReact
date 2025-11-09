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

const ShippingCompanyCardList = ({
    shippingCompanies,
    loading,
    t,
    handleOpenEditShippingCompany,
    handleToggleShippingCompanyStatus,
    handleOpenDeleteConfirmation,
    setSelectedShippingCompany
}) => {

    const MobileShippingCompanyCard = ({ shippingCompany }) => (
        <Paper
            sx={{
                p: 2,
                mb: 2,
                display: 'flex',
                flexDirection: 'column',
                gap: 1,
                borderLeft: shippingCompany.isActive ? '4px solid green' : '4px solid grey'
            }}
        >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                    <Typography variant="body1" component="div" sx={{ fontWeight: 'bold' }}>
                        {shippingCompany.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                        ID: {shippingCompany.idShippingCompany}
                    </Typography>
                </Box>
                <Box>
                    <Tooltip title={t('edit')}>
                        <IconButton size="small" color="primary" onClick={() => handleOpenEditShippingCompany(shippingCompany)}>
                            <EditIcon />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title={t('delete')}>
                        <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleOpenDeleteConfirmation(shippingCompany)}
                        >
                            <DeleteIcon />
                        </IconButton>
                    </Tooltip>
                </Box>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Typography variant="body2" color="text.secondary">
                    {t('status')}: {shippingCompany.isActive ? t('active') : t('disabled')}
                </Typography>
                <Tooltip title={shippingCompany.isActive ? t('disable') : t('enable')}>
                    <Switch
                        size="small"
                        checked={shippingCompany.isActive}
                        onChange={() => handleToggleShippingCompanyStatus(shippingCompany)}
                        color="primary"
                    />
                </Tooltip>
            </Box>
        </Paper>
    );

    if (loading) {
        return <Typography align="center" sx={{ mt: 2 }}>{t('loading')}...</Typography>;
    }

    if ((shippingCompanies?.length ?? 0) === 0) {
        return <Typography align="center" sx={{ mt: 2 }}>{t('records_notFound')}.</Typography>;
    }

    return (
        <Box>
            {shippingCompanies.map((shippingCompany) => (
                <MobileShippingCompanyCard key={shippingCompany.idShippingCompany} shippingCompany={shippingCompany} />
            ))}
        </Box>
    );
};

export default ShippingCompanyCardList;