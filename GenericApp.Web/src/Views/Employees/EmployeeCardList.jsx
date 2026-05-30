import React from 'react';
import {
    Box, Typography, Paper, Switch, IconButton, Tooltip, Avatar, Divider
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import BadgeIcon from '@mui/icons-material/Badge';
import WorkIcon from '@mui/icons-material/Work';
import EmptyData from '@layout/EmptyData';

const EmployeeCardList = ({
    employees,
    loading,
    t,
    handleOpenEditEmployee,
    handleToggleEmployeeStatus,
    setIsConfirmDeleteModalOpen,
    setSelectedEmployee,
    isSearch = false,
}) => {
    if (!loading && (!employees || employees.length === 0)) {
        return <EmptyData isSearch={isSearch} />;
    }

    const MobileEmployeeCard = ({ employee }) => {
        const fullName = `${employee.nombre ?? ''} ${employee.apellidoPaterno ?? ''} ${employee.apellidoMaterno ?? ''}`.trim();
        const initials = (employee.nombre?.charAt(0) ?? '') + (employee.apellidoPaterno?.charAt(0) ?? '');

        return (
            <Paper
                elevation={0}
                sx={{
                    p: 2, mb: 2, borderRadius: 3, border: '1px solid', borderColor: 'divider',
                    transition: '0.3s', '&:hover': { boxShadow: '0 4px 20px 0 rgba(0,0,0,0.05)' }
                }}
            >
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
                    <Avatar sx={{ bgcolor: employee.isActive ? 'primary.main' : 'grey.400', mr: 2, width: 44, height: 44 }}>
                        {initials.toUpperCase()}
                    </Avatar>
                    <Box sx={{ flexGrow: 1 }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
                            {fullName}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                            {t('employee_clave')}: {employee.clave}
                        </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                        <Tooltip title={t('edit')}>
                            <IconButton onClick={() => handleOpenEditEmployee(employee)}
                                sx={{ color: 'white', bgcolor: 'primary.main', '&:hover': { bgcolor: 'primary.dark' }, p: 1 }}>
                                <EditIcon fontSize="small" />
                            </IconButton>
                        </Tooltip>
                        <Tooltip title={t('delete')}>
                            <IconButton
                                onClick={() => { setSelectedEmployee(employee); setIsConfirmDeleteModalOpen(true); }}
                                sx={{ color: 'white', bgcolor: 'error.main', '&:hover': { bgcolor: 'error.dark' }, p: 1 }}>
                                <DeleteIcon fontSize="small" />
                            </IconButton>
                        </Tooltip>
                    </Box>
                </Box>

                <Divider sx={{ my: 1 }} />

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                    <BadgeIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                    <Typography variant="body2" color="text.secondary">
                        {t('employee_rfc')}: {employee.rfc ?? '—'}
                    </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                    <WorkIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                    <Typography variant="body2" color="text.secondary">
                        {employee.position ?? '—'}
                    </Typography>
                </Box>

                <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', mt: 1.5 }}>
                    <Typography variant="caption" color="text.secondary" sx={{ mr: 1 }}>
                        {employee.isActive ? t('active') : t('disabled')}
                    </Typography>
                    <Switch
                        size="small"
                        checked={employee.isActive ?? false}
                        onChange={() => handleToggleEmployeeStatus(employee)}
                    />
                </Box>
            </Paper>
        );
    };

    return (
        <Box>
            {employees?.map((employee) => (
                <MobileEmployeeCard key={employee.idEmployee} employee={employee} />
            ))}
        </Box>
    );
};

export default EmployeeCardList;
