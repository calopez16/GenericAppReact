import React, { useState, useEffect, useRef, useContext } from 'react';
import {
    Box, Typography, TextField, Button, TablePagination,
    useMediaQuery, useTheme, LinearProgress, Paper, Avatar,
    IconButton, ClickAwayListener, Tooltip
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import BadgeIcon from '@mui/icons-material/Badge';
import CloseIcon from '@mui/icons-material/Close';
import TableViewIcon from '@mui/icons-material/TableView';
import { useTranslation } from 'react-i18next';
import { ShowMessage } from '@helpers/NotificationService';
import { AppContext } from '@helpers/AppContext';
import { DataAPIEmployeesService } from '@data/Employees/Data';
import ConfirmationModal from '@views/Layout/ConfirmationModal';
import EmployeeFormModal from './EmployeeFormModal';
import EmployeeCardList from './EmployeeCardList';
import EmployeeTableList from './EmployeeTableList';
import EmployeeExcelModal from './EmployeeExcelModal';

function Index() {
    const { t } = useTranslation();
    const { companySelected } = useContext(AppContext);
    const service = DataAPIEmployeesService();

    const [employees, setEmployees] = useState([]);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [totalEmployees, setTotalEmployees] = useState(0);

    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
    const [isSearchExpanded, setIsSearchExpanded] = useState(false);
    const searchInputRef = useRef(null);

    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedEmployee, setSelectedEmployee] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [isConfirmDeleteModalOpen, setIsConfirmDeleteModalOpen] = useState(false);
    const [isExcelModalOpen, setIsExcelModalOpen] = useState(false);

    const theme = useTheme();
    const isSmallScreen = useMediaQuery(theme.breakpoints.down('md'));

    useEffect(() => {
        const timerId = setTimeout(() => {
            setDebouncedSearchTerm(searchTerm);
            setPage(0);
        }, 500);
        return () => clearTimeout(timerId);
    }, [searchTerm]);

    useEffect(() => {
        if (!companySelected?.idCompany) return;
        const loadEmployees = async () => {
            try {
                setLoading(true);
                const response = await service.getEmployeesPagination(
                    companySelected.idCompany, page + 1, rowsPerPage, debouncedSearchTerm
                );
                if (response.success) {
                    setEmployees(response.data.data ?? []);
                    setTotalEmployees(response.data.totalCount ?? 0);
                }
            } catch (error) {
                console.error('Error loading employees:', error);
            } finally {
                setLoading(false);
            }
        };
        loadEmployees();
    }, [page, rowsPerPage, debouncedSearchTerm, companySelected]);

    const handlePageChange = (_, newPage) => setPage(newPage);
    const handleRowsPerPageChange = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const handleSearchChange = (event) => setSearchTerm(event.target.value);

    const toggleSearch = () => {
        if (!isSearchExpanded) {
            setIsSearchExpanded(true);
            setTimeout(() => searchInputRef.current?.focus(), 100);
        } else if (searchTerm !== '') {
            setSearchTerm('');
        } else {
            setIsSearchExpanded(false);
        }
    };

    const handleCloseSearch = () => {
        if (searchTerm === '') setIsSearchExpanded(false);
    };

    const handleToggleEmployeeStatus = async (employee) => {
        try {
            const result = employee.isActive
                ? await service.disableEmployee(employee.idEmployee)
                : await service.enableEmployee(employee.idEmployee);

            if (result.success) {
                ShowMessage(t(employee.isActive ? 'recordDisabled' : 'recordEnabled'), 'success');
                setEmployees(prev =>
                    prev.map(e => e.idEmployee === employee.idEmployee ? { ...e, isActive: !e.isActive } : e)
                );
            }
        } catch {
            ShowMessage(t('error'), 'error');
        }
    };

    const handleDeleteEmployee = async () => {
        try {
            setIsConfirmDeleteModalOpen(false);
            const result = await service.deleteEmployee(selectedEmployee.idEmployee);
            if (result.success) {
                ShowMessage(t('recordDeleted'), 'success');
                setEmployees(prev => prev.filter(e => e.idEmployee !== selectedEmployee.idEmployee));
                setTotalEmployees(prev => prev - 1);
            } else {
                ShowMessage(t('error'), 'error');
            }
        } catch {
            ShowMessage(t('error'), 'error');
        }
    };

    const handleOpenAdd = () => { setSelectedEmployee(null); setIsEditing(false); setIsModalOpen(true); };
    const handleOpenEdit = (employee) => { setSelectedEmployee(employee); setIsEditing(true); setIsModalOpen(true); };
    const handleCloseModal = () => setIsModalOpen(false);

    const commonListProps = {
        employees, loading, t,
        handleOpenEditEmployee: handleOpenEdit,
        handleToggleEmployeeStatus,
        setIsConfirmDeleteModalOpen,
        setSelectedEmployee,
        isSearch: searchTerm !== '',
        rowsPerPage
    };

    return (
        <Box>
            {/* Header */}
            <Paper
                elevation={0}
                sx={{
                    p: 2,
                    mb: isSmallScreen && isSearchExpanded ? 10 : 2,
                    borderRadius: 2,
                    border: '1px solid',
                    borderColor: 'divider',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: 2,
                    position: 'relative',
                    transition: 'margin 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                }}
            >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar sx={{ bgcolor: 'primary.light', color: 'white', width: 45, height: 45, borderRadius: 2 }}>
                        <BadgeIcon />
                    </Avatar>
                    <Box>
                        <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1.2 }}>{t('employees')}</Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ display: { xs: 'none', sm: 'block' } }}>
                            {t('employees_description')}
                        </Typography>
                    </Box>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <ClickAwayListener onClickAway={handleCloseSearch}>
                        <Box sx={{
                            display: 'flex',
                            flexDirection: 'row-reverse',
                            alignItems: 'center',
                            bgcolor: isSearchExpanded ? 'action.hover' : 'transparent',
                            borderRadius: isSmallScreen && isSearchExpanded ? 2 : 10,
                            px: isSearchExpanded ? 1 : 0,
                            position: isSmallScreen && isSearchExpanded ? 'absolute' : 'relative',
                            top: isSmallScreen && isSearchExpanded ? '110%' : 'auto',
                            left: isSmallScreen && isSearchExpanded ? 0 : 'auto',
                            right: isSmallScreen && isSearchExpanded ? 0 : 'auto',
                            zIndex: 10,
                            boxShadow: isSmallScreen && isSearchExpanded ? theme.shadows[4] : 'none',
                            width: isSearchExpanded ? (isSmallScreen ? '100%' : '300px') : '42px',
                            height: '42px',
                            transition: !isSmallScreen ? 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)' : '',
                            border: '1px solid',
                            borderColor: isSearchExpanded ? 'primary.main' : 'transparent',
                            overflow: 'hidden'
                        }}>
                            <Tooltip title={isSearchExpanded && searchTerm === '' ? t('closeSearch') : t('search')}>
                                <IconButton onClick={toggleSearch} size="small"
                                    sx={{ color: isSearchExpanded ? 'primary.main' : 'text.secondary', flexShrink: 0, width: '42px', height: '42px' }}>
                                    {isSearchExpanded && searchTerm !== '' ? <CloseIcon /> : <SearchIcon />}
                                </IconButton>
                            </Tooltip>
                            <TextField
                                inputRef={searchInputRef}
                                placeholder={t('search')}
                                variant="standard"
                                fullWidth
                                value={searchTerm}
                                onChange={handleSearchChange}
                                InputProps={{
                                    disableUnderline: true,
                                    sx: {
                                        ml: 1, fontSize: '0.9rem',
                                        visibility: isSearchExpanded ? 'visible' : 'hidden',
                                        opacity: isSearchExpanded ? 1 : 0,
                                        transition: 'opacity 0.2s ease-in-out'
                                    }
                                }}
                            />
                        </Box>
                    </ClickAwayListener>

                    <Button
                        variant="contained"
                        disableElevation
                        endIcon={<TableViewIcon />}
                        onClick={() => setIsExcelModalOpen(true)}
                        color="success"
                        sx={{ whiteSpace: 'nowrap', ml: 1 }}
                    >
                        {t('excel_load')}
                    </Button>
                    <Button
                        variant="contained"
                        disableElevation
                        endIcon={<AddIcon />}
                        onClick={handleOpenAdd}
                        sx={{ whiteSpace: 'nowrap', ml: 1 }}
                    >
                        {t('add')}
                    </Button>
                </Box>
            </Paper>

            {loading && <LinearProgress sx={{ mb: 2, borderRadius: 1 }} />}

            {isSmallScreen
                ? <EmployeeCardList {...commonListProps} />
                : <EmployeeTableList {...commonListProps} />
            }

            <TablePagination
                rowsPerPageOptions={[5, 10, 25]}
                component="div"
                count={totalEmployees}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handlePageChange}
                onRowsPerPageChange={handleRowsPerPageChange}
                labelRowsPerPage={t('rows_perPage')}
                labelDisplayedRows={({ from, to, count }) =>
                    `${from}-${to} ${t('of')} ${count !== -1 ? count : `${t('moreThan')} ${to}`}`
                }
            />

            <EmployeeFormModal
                open={isModalOpen}
                handleClose={handleCloseModal}
                data={selectedEmployee}
                isEditing={isEditing}
                setData={setEmployees}
                idCompany={companySelected?.idCompany}
            />

            <ConfirmationModal
                open={isConfirmDeleteModalOpen}
                type="error"
                onClose={() => setIsConfirmDeleteModalOpen(false)}
                onConfirm={handleDeleteEmployee}
                title={t('delete')}
                message={t('question_areYouSureDelete')}
            />

            <EmployeeExcelModal
                open={isExcelModalOpen}
                handleClose={() => setIsExcelModalOpen(false)}
            />
        </Box>
    );
}

export default Index;
