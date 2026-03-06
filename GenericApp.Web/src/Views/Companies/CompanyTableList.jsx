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
import DeleteIcon from '@mui/icons-material/Delete';
import { API_BASE_URL } from '@config';
import EmptyData from '@layout/EmptyData';

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
};

const CompanyListTable = ({
    companies,
    loading,
    t,
    handleOpenEditCompany,
    handleToggleCompanyStatus,
    handleOpenDeleteConfirmation,
    deletingId,
    isSearch = false,
    rowsPerPage = 5
}) => {

    const rowHeight = 65;
    const colSpan = 6;

    const emptyRows = !loading && companies?.length > 0
        ? Math.max(0, rowsPerPage - companies.length)
        : 0;

    return (
        <TableContainer
            component={Paper}
            elevation={0}
            sx={{ overflowX: 'auto', border: '1px solid', borderColor: 'divider', borderRadius: 2 }}
        >
            <Table sx={{ minWidth: 900 }}>
                <TableHead sx={{ bgcolor: 'action.hover' }}>
                    <TableRow>
                        <TableCell sx={{ fontWeight: 'bold', width: 10 }} align="center">{t('status')}</TableCell>
                        <TableCell sx={{ fontWeight: 'bold' }}>{t('logo')}</TableCell>
                        <TableCell sx={{ fontWeight: 'bold' }}>{t('name')}</TableCell>
                        <TableCell sx={{ fontWeight: 'bold' }}>{t('address')}</TableCell>
                        <TableCell sx={{ fontWeight: 'bold' }}>{t('reg_fda_no')}</TableCell>
                        <TableCell sx={{ fontWeight: 'bold', width: 200 }} align="center">{t('actions')}</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {loading ? (
                        Array.from(new Array(rowsPerPage)).map((_, index) => (
                            <TableRow key={`skeleton-${index}`} style={{ height: rowHeight }}>
                                <TableCell align="center">
                                    <Skeleton variant="rectangular" width={40} height={20} sx={{ mx: 'auto', borderRadius: 1 }} />
                                </TableCell>
                                <TableCell>
                                    <Skeleton variant="rounded" width={40} height={40} />
                                </TableCell>
                                <TableCell><Skeleton width="70%" /></TableCell>
                                <TableCell><Skeleton width="60%" /></TableCell>
                                <TableCell><Skeleton width="50%" /></TableCell>
                                <TableCell align="center">
                                    <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
                                        <Skeleton variant="circular" width={30} height={30} />
                                        <Skeleton variant="circular" width={30} height={30} />
                                    </Box>
                                </TableCell>
                            </TableRow>
                        ))
                    ) : (
                        <>
                            {companies?.map((company) => {
                                const isDeleting = deletingId === company.idCompany;
                                const logoSrc = company.logoName ? `${API_BASE_URL}/img/logos/${company.logoName}` : null;

                                return (
                                    <TableRow
                                        key={company.idCompany}
                                        hover
                                        sx={isDeleting ? deletingRowStyle : { ...normalRowStyle, '&:last-child td, &:last-child th': { border: 0 }, height: rowHeight }}
                                    >
                                        <TableCell align="center">
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
                                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                                {company.name}
                                            </Typography>
                                        </TableCell>

                                        <TableCell>
                                            <Typography variant="body2">{company.address}</Typography>
                                            <Typography variant="caption" color="text.secondary">{company.postalCode}</Typography>
                                        </TableCell>

                                        <TableCell>
                                            <Typography variant="body2" color="text.secondary">
                                                {company.regFdaNo || '-'}
                                            </Typography>
                                        </TableCell>

                                        <TableCell align="center">
                                            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
                                                <Tooltip title={t('edit')}>
                                                    <IconButton
                                                        onClick={() => handleOpenEditCompany(company)}
                                                        disabled={isDeleting}
                                                        sx={{ color: 'white', bgcolor: 'primary.main', '&:hover': { bgcolor: 'primary.dark' }, p: 1 }}
                                                    >
                                                        <EditIcon fontSize="small" />
                                                    </IconButton>
                                                </Tooltip>
                                                <Tooltip title={t('delete')}>
                                                    <IconButton
                                                        onClick={() => handleOpenDeleteConfirmation(company)}
                                                        disabled={isDeleting}
                                                        sx={{ color: 'white', bgcolor: 'error.main', '&:hover': { bgcolor: 'error.dark' }, p: 1 }}
                                                    >
                                                        <DeleteIcon fontSize="small" />
                                                    </IconButton>
                                                </Tooltip>
                                            </Box>
                                        </TableCell>
                                    </TableRow>
                                );
                            })}

                            {emptyRows > 0 && (
                                Array.from(new Array(emptyRows)).map((_, index) => (
                                    <TableRow key={`empty-${index}`} style={{ height: rowHeight }}>
                                        <TableCell colSpan={colSpan} sx={{ borderBottom: index === emptyRows - 1 ? 'none' : '1px solid rgba(224, 224, 224, 0.4)' }} />
                                    </TableRow>
                                ))
                            )}
                        </>
                    )}
                </TableBody>
            </Table>

            {!loading && (companies?.length ?? 0) === 0 && (
                <Box sx={{ mt: 2 }}>
                    <EmptyData
                        isSearch={isSearch}
                        title={isSearch ? t('records_notFound') : t('no_companies_yet')}
                        description={isSearch ? t('try_another_search_term') : t('start_by_adding_company')}
                    />
                </Box>
            )}
        </TableContainer>
    );
};

export default CompanyListTable;