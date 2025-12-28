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
    Box
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { API_BASE_URL } from '@config';

const ANIMATION_DURATION = 500;

const deletingRowStyle = {
    transition: `all ${ANIMATION_DURATION}ms ease-out`,
    transform: 'translateX(-100%)',
    opacity: 0,
    height: 0,
    padding: 0,
    overflow: 'hidden',
};

const normalRowStyle = {
    transition: `all ${ANIMATION_DURATION}ms ease-out`,
    transform: 'translateX(0)',
    opacity: 1,
    maxHeight: '1000px',
    padding: '16px 24px',
};

const CompanyListTable = ({
    companies,
    loading,
    t,
    handleOpenEditCompany,
    handleToggleCompanyStatus,
    handleOpenDeleteConfirmation,
    deletingId
}) => {

    const minTableWidth = 900;

    return (
        <TableContainer component={Paper} sx={{ overflowX: 'auto' }}>
            <Table sx={{ minWidth: minTableWidth }}>
                <TableHead>
                    <TableRow>
                        {/* 1. Columna Status al principio */}
                        <TableCell>{t('status')}</TableCell>
                        <TableCell>{t('logo')}</TableCell>
                        <TableCell>{t('name')}</TableCell>
                        <TableCell>{t('address')}</TableCell>
                        <TableCell>{t('reg_fda_no')}</TableCell>
                        <TableCell align="right">{t('actions')}</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {loading ? (
                        <TableRow>
                            <TableCell colSpan={6} align="center">
                                <Typography sx={{ mt: 2 }}>{t('loading')}...</Typography>
                            </TableCell>
                        </TableRow>
                    ) : (companies?.length ?? 0) === 0 ? (
                        <TableRow>
                            <TableCell colSpan={6} align="center">
                                <Typography sx={{ mt: 2 }}>{t('records_notFound')}.</Typography>
                            </TableCell>
                        </TableRow>
                    ) : (
                        companies.map((company) => {
                            const isDeleting = deletingId === company.idCompany;
                            const logoSrc = company.logoName ? `${API_BASE_URL}/img/logos/${company.logoName}` : null;

                            return (
                                <TableRow
                                    key={company.idCompany}
                                    sx={isDeleting ? deletingRowStyle : normalRowStyle}
                                >
                                    <TableCell>
                                        <Switch
                                            checked={company.isActive}
                                            onChange={() => handleToggleCompanyStatus(company)}
                                            color="primary"
                                            disabled={isDeleting}
                                        />
                                    </TableCell>

                                    <TableCell>
                                        <Avatar
                                            src={logoSrc}
                                            alt={company.name}
                                            variant="rounded"
                                            sx={{ width: 40, height: 40 }}
                                        >
                                            {company.name?.charAt(0)}
                                        </Avatar>
                                    </TableCell>

                                    <TableCell>
                                        <Typography variant="body1" fontWeight="bold">
                                            {company.name}
                                        </Typography>
                                    </TableCell>

                                    <TableCell>
                                        <Box>
                                            <Typography variant="body2">
                                                {company.address}
                                            </Typography>
                                            <Typography variant="caption" color="text.secondary">
                                                {company.postalCode}
                                            </Typography>
                                        </Box>
                                    </TableCell>

                                    <TableCell>
                                        {company.regFdaNo || '-'}
                                    </TableCell>

                                    <TableCell align="right">
                                        <Tooltip title={t('edit')}>
                                            <IconButton
                                                color="primary"
                                                onClick={() => handleOpenEditCompany(company)}
                                                disabled={isDeleting}
                                            >
                                                <EditIcon />
                                            </IconButton>
                                        </Tooltip>
                                        <Tooltip title={t('delete')}>
                                            <IconButton
                                                color="error"
                                                onClick={() => handleOpenDeleteConfirmation(company)}
                                                sx={{ ml: 1 }}
                                                disabled={isDeleting}
                                            >
                                                <DeleteIcon />
                                            </IconButton>
                                        </Tooltip>
                                    </TableCell>
                                </TableRow>
                            );
                        })
                    )}
                </TableBody>
            </Table>
        </TableContainer>
    );
};

export default CompanyListTable;