import React from 'react';
import {
    Box,
    Typography,
    Paper,
    Switch,
    IconButton,
    Tooltip,
    Avatar
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { API_BASE_URL } from '@config';

const CompanyCardList = ({
    companies,
    loading,
    t,
    handleOpenEditCompany,
    handleToggleCompanyStatus,
    handleOpenDeleteConfirmation
}) => {

    const MobileCompanyCard = ({ company }) => {
        const logoSrc = company.logoName ? `${API_BASE_URL}/img/logos/${company.logoName}` : null;

        return (
            <Paper
                sx={{
                    p: 2,
                    mb: 2,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 1,
                    borderLeft: company.isActive ? '4px solid green' : '4px solid grey'
                }}
            >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                        <Avatar
                            src={logoSrc}
                            alt={company.name}
                            variant="rounded"
                            sx={{ width: 50, height: 50 }}
                        >
                            {company.name?.charAt(0)}
                        </Avatar>
                        <Box>
                            <Typography variant="body1" component="div" sx={{ fontWeight: 'bold' }}>
                                {company.name}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                                FDA: {company.regFdaNo || 'N/A'}
                            </Typography>
                        </Box>
                    </Box>

                    <Box>
                        <Tooltip title={t('edit')}>
                            <IconButton size="small" color="primary" onClick={() => handleOpenEditCompany(company)}>
                                <EditIcon />
                            </IconButton>
                        </Tooltip>
                        <Tooltip title={t('delete')}>
                            <IconButton
                                size="small"
                                color="error"
                                onClick={() => handleOpenDeleteConfirmation(company)}
                            >
                                <DeleteIcon />
                            </IconButton>
                        </Tooltip>
                    </Box>
                </Box>

                <Box sx={{ mt: 1 }}>
                    <Typography variant="body2" color="text.secondary">
                        {company.address} {company.postalCode && `, ${company.postalCode}`}
                    </Typography>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 1 }}>
                    <Typography variant="body2" color="text.secondary">
                        {t('status')}: {company.isActive ? t('active') : t('disabled')}
                    </Typography>
                    <Tooltip title={company.isActive ? t('disable') : t('enable')}>
                        <Switch
                            size="small"
                            checked={company.isActive}
                            onChange={() => handleToggleCompanyStatus(company)}
                            color="primary"
                        />
                    </Tooltip>
                </Box>
            </Paper>
        );
    };

    if (loading) {
        return <Typography align="center" sx={{ mt: 2 }}>{t('loading')}...</Typography>;
    }

    if ((companies?.length ?? 0) === 0) {
        return <Typography align="center" sx={{ mt: 2 }}>{t('records_notFound')}.</Typography>;
    }

    return (
        <Box>
            {companies.map((company) => (
                <MobileCompanyCard key={company.idCompany} company={company} />
            ))}
        </Box>
    );
};

export default CompanyCardList;