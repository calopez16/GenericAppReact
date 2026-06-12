import React from 'react';
import {
    TableContainer, Paper, Table, TableHead, TableRow, TableCell,
    TableBody, Switch, IconButton, Tooltip, Typography, Avatar, Box, Skeleton
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import EmptyData from '@layout/EmptyData';

const EmployeeTableList = ({
    employees,
    loading,
    t,
    handleOpenEditEmployee,
    handleToggleEmployeeStatus,
    setIsConfirmDeleteModalOpen,
    setSelectedEmployee,
    isSearch = false,
    rowsPerPage = 5
}) => {
    const rowHeight = 65;
    const emptyRows = !loading && employees?.length > 0
        ? Math.max(0, rowsPerPage - employees.length)
        : 0;

    return (
        <TableContainer
            component={Paper}
            elevation={0}
            sx={{ overflowX: 'auto', border: '1px solid', borderColor: 'divider', borderRadius: 2 }}
        >
            <Table sx={{ minWidth: 750 }} aria-label="employees table">
                <TableHead sx={{ bgcolor: 'action.hover' }}>
                    <TableRow>
                        <TableCell sx={{ fontWeight: 'bold', width: 80 }} align="center">{t('status')}</TableCell>
                        <TableCell sx={{ fontWeight: 'bold' }}>{t('employee_clave')}</TableCell>
                        <TableCell sx={{ fontWeight: 'bold' }}>{t('employee_name')}</TableCell>
                        <TableCell sx={{ fontWeight: 'bold' }}>{t('employee_rfc')}</TableCell>
                        <TableCell sx={{ fontWeight: 'bold' }}>{t('employee_position')}</TableCell>
                        <TableCell sx={{ fontWeight: 'bold', width: 120 }} align="center">{t('actions')}</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {loading ? (
                        Array.from(new Array(rowsPerPage)).map((_, index) => (
                            <TableRow key={`skeleton-${index}`} style={{ height: rowHeight }}>
                                <TableCell align="center"><Skeleton variant="rectangular" width={40} height={20} sx={{ mx: 'auto' }} /></TableCell>
                                <TableCell><Skeleton width="60%" /></TableCell>
                                <TableCell>
                                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                        <Skeleton variant="circular" width={36} height={36} sx={{ mr: 1.5 }} />
                                        <Skeleton width="70%" />
                                    </Box>
                                </TableCell>
                                <TableCell><Skeleton width="60%" /></TableCell>
                                <TableCell><Skeleton width="60%" /></TableCell>
                                <TableCell align="center"><Skeleton variant="circular" width={30} height={30} sx={{ mx: 'auto' }} /></TableCell>
                            </TableRow>
                        ))
                    ) : (
                        <>
                            {employees?.map((employee) => {
                                const fullName = `${employee?.nombre ?? ''} ${employee?.apellidoPaterno ?? ''} ${employee?.apellidoMaterno ?? ''}`.trim();
                                const initials = (employee?.nombre?.charAt(0) ?? '') + (employee?.apellidoPaterno?.charAt(0) ?? '');
                                return (
                                    <TableRow
                                        key={employee?.idEmployee}
                                        hover
                                        sx={{ '&:last-child td, &:last-child th': { border: 0 }, height: rowHeight }}
                                    >
                                        <TableCell align="center">
                                            <Switch
                                                size="medium"
                                                checked={employee?.isActive ?? false}
                                                onChange={() => handleToggleEmployeeStatus(employee)}
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                                {employee?.clave}
                                            </Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                <Avatar
                                                    sx={{
                                                        bgcolor: employee?.isActive ? 'primary.main' : 'grey.400',
                                                        mr: 1.5, width: 36, height: 36, fontSize: '0.85rem'
                                                    }}
                                                >
                                                    {initials.toUpperCase()}
                                                </Avatar>
                                                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                                    {fullName}
                                                </Typography>
                                            </Box>
                                        </TableCell>
                                        <TableCell>
                                            <Typography variant="body2" color="text.secondary">
                                                {employee?.rfc ?? '—'}
                                            </Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Typography variant="body2" color="text.secondary">
                                                {employee?.position ?? '—'}
                                            </Typography>
                                        </TableCell>
                                        <TableCell align="center">
                                            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 0.5 }}>
                                                <Tooltip title={t('edit')}>
                                                    <IconButton
                                                        onClick={() => handleOpenEditEmployee(employee)}
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
                                                <Tooltip title={t('delete')}>
                                                    <IconButton
                                                        onClick={() => { setSelectedEmployee(employee); setIsConfirmDeleteModalOpen(true); }}
                                                        sx={{ color: 'white', bgcolor: 'error.main', '&:hover': { bgcolor: 'error.dark' }}}>
                                                        <DeleteIcon fontSize="small" />
                                                    </IconButton>
                                                </Tooltip>                                               
                                            </Box>
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                            {emptyRows > 0 && (
                                <TableRow style={{ height: rowHeight * emptyRows }}>
                                    <TableCell colSpan={6} />
                                </TableRow>
                            )}
                        </>  
                    )}
                </TableBody>
            </Table>

            {!loading && employees?.length === 0 && (
                <Box sx={{ mt: 2 }}>
                    <EmptyData
                        isSearch={isSearch}
                        title={isSearch ? t('records_notFound') : t('no_employees_yet')}
                        description={isSearch ? t('try_another_search_term') : t('start_by_adding_employee')}
                        actionLabel={t('add')}
                    />
                </Box>
            )}
        </TableContainer>
    );
};

export default EmployeeTableList;
