import React, { useState, useEffect, useRef } from 'react';
import {
    Box,
    Typography,
    TextField,
    Button,
    TablePagination,
    useMediaQuery,
    useTheme,
    LinearProgress,
    Paper,
    Avatar,
    IconButton,
    ClickAwayListener,
    Tooltip
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import BusinessIcon from '@mui/icons-material/Business';
import CloseIcon from '@mui/icons-material/Close';
import { DataAPICompaniesService } from '@data/Companies/Data';
import { useTranslation } from 'react-i18next';
import { ShowMessage } from '@helpers/NotificationService';
import ConfirmationModal from '@layout/ConfirmationModal';
import CompanyFormModal from '@views/companies/CompanyFormModal';
import CompanyCardList from '@views/companies/CompanyCardList';
import CompanyListTable from '@views/companies/CompanyTableList';

function Index() {
    const { t } = useTranslation();
    const companyDataService = DataAPICompaniesService();
    const [companies, setCompanies] = useState([]);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(5);
    const [totalCompanies, setTotalCompanies] = useState(0);

    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(searchTerm);
    const [isSearchExpanded, setIsSearchExpanded] = useState(false);
    const searchInputRef = useRef(null);

    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedCompany, setSelectedCompany] = useState(null);
    const [isEditing, setIsEditing] = useState(false);

    const [isConfirmDeleteModalOpen, setIsConfirmDeleteModalOpen] = useState(false);
    const [companyToDelete, setCompanyToDelete] = useState(null);

    const [deletingId, setDeletingId] = useState(null);
    const ANIMATION_DURATION = 500;

    const theme = useTheme();
    const isSmallScreen = useMediaQuery(theme.breakpoints.down('md'));

    useEffect(() => {
        const timerId = setTimeout(() => {
            setDebouncedSearchTerm(searchTerm);
        }, 500);
        return () => {
            clearTimeout(timerId);
        };
    }, [searchTerm]);

    useEffect(() => {
        const loadCompanies = async () => {
            try {
                setLoading(true);
                const response = await companyDataService.getDataPagination(page + 1, rowsPerPage, debouncedSearchTerm);
                if (response.success) {
                    setCompanies(response.data.data);
                    setTotalCompanies(response.data.totalCount);
                } else {
                    setCompanies([]);
                }
            } catch (error) {
                console.error("Error loading companies:", error);
                setCompanies([]);
            } finally {
                setLoading(false);
            }
        };

        loadCompanies();
    }, [page, rowsPerPage, debouncedSearchTerm]);


    const handlePageChange = (event, newPage) => {
        setPage(newPage);
    };

    const handleRowsPerPageChange = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const handleSearchChange = (event) => {
        setSearchTerm(event.target.value);
        setPage(0);
    };

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
        if (searchTerm === '') {
            setIsSearchExpanded(false);
        }
    };

    const handleToggleCompanyStatus = async (company) => {
        const isActiveNow = company.isActive;

        try {
            let dataResult;
            if (isActiveNow) {
                dataResult = await companyDataService.disableData(company.idCompany);
                if (dataResult.success) {
                    ShowMessage(t('recordDisabled'), 'success');
                }
            } else {
                dataResult = await companyDataService.enableData(company.idCompany);
                if (dataResult.success) {
                    ShowMessage(t('recordEnabled'), 'success');
                }
            }

            if (dataResult.success) {
                setCompanies(prevCompanies =>
                    prevCompanies.map(c =>
                        c.idCompany === company.idCompany ? { ...c, isActive: !isActiveNow } : c
                    )
                );
            }
        } catch (error) {
            ShowMessage(t('error'), 'error');
            console.error("Error toggling company status:", error);
        }
    };

    const handleOpenDeleteConfirmation = (company) => {
        setCompanyToDelete(company);
        setIsConfirmDeleteModalOpen(true);
    };

    const handleDeleteCompany = async () => {
        setIsConfirmDeleteModalOpen(false);

        if (!companyToDelete) return;

        const idToDelete = companyToDelete.idCompany;

        try {
            setDeletingId(idToDelete);

            const dataResult = await companyDataService.deleteData(idToDelete);

            if (dataResult.success) {
                ShowMessage(t('recordDeleted'), 'success');

                setTimeout(() => {
                    setCompanies(prevCompanies => prevCompanies.filter(c => c.idCompany !== idToDelete));
                    setDeletingId(null);
                    setPage(0);
                }, ANIMATION_DURATION);

            } else {
                ShowMessage(dataResult.message || t('errorDeletingRecord'), 'error');
                setDeletingId(null);
            }
        } catch (error) {
            ShowMessage(t('error'), 'error');
            console.error("Error deleting company:", error);
            setDeletingId(null);
        } finally {
            setCompanyToDelete(null);
        }
    };

    const handleCloseDeleteConfirmation = () => {
        setIsConfirmDeleteModalOpen(false);
        setCompanyToDelete(null);
    };

    const handleOpenAddCompany = () => {
        setSelectedCompany(null);
        setIsEditing(false);
        setIsModalOpen(true);
    };

    const handleOpenEditCompany = (company) => {
        setSelectedCompany(company);
        setIsEditing(true);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        // Opcional: Recargar datos aquí si el modal no actualiza el estado directamente
    };

    const commonListProps = {
        companies,
        loading,
        t,
        handleOpenEditCompany,
        handleToggleCompanyStatus,
        handleOpenDeleteConfirmation,
        setSelectedCompany,
        deletingId,
        isSearch: searchTerm !== '',
        rowsPerPage
    };

    return (
        <Box>
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
                    <Avatar sx={{ bgcolor: 'primary.light', color: 'white', width: 45, height: 45, borderRadius: 2 }}><BusinessIcon /></Avatar>
                    <Box>
                        <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1.2 }}>{t('companies')}</Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ display: { xs: 'none', sm: 'block' } }}>
                            {t('companies_description')}
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
                            width: isSearchExpanded
                                ? (isSmallScreen ? '100%' : '300px')
                                : '42px',
                            height: '42px',
                            transition: !isSmallScreen ? 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)' : '',
                            border: '1px solid',
                            borderColor: isSearchExpanded ? 'primary.main' : 'transparent',
                            overflow: 'hidden'
                        }}>
                            <Tooltip title={isSearchExpanded && searchTerm === '' ? t('closeSearch') : t('search')}>
                                <IconButton
                                    onClick={toggleSearch}
                                    size="small"
                                    sx={{
                                        color: isSearchExpanded ? 'primary.main' : 'text.secondary',
                                        flexShrink: 0,
                                        width: '42px',
                                        height: '42px'
                                    }}
                                >
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
                                        ml: 1,
                                        fontSize: '0.9rem',
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
                        endIcon={<AddIcon />}
                        onClick={handleOpenAddCompany}
                        sx={{ whiteSpace: 'nowrap', ml: 1 }}
                    >
                        {t('add')}
                    </Button>
                </Box>
            </Paper>

            {loading && <LinearProgress sx={{ mb: 2, borderRadius: 1 }} />}

            {isSmallScreen ? <CompanyCardList {...commonListProps} /> : <CompanyListTable {...commonListProps} />}

            <TablePagination
                rowsPerPageOptions={[5, 10, 25]}
                component="div"
                count={totalCompanies}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handlePageChange}
                onRowsPerPageChange={handleRowsPerPageChange}
                labelRowsPerPage={t('rows_perPage')}
                labelDisplayedRows={({ from, to, count }) =>
                    `${from}-${to} ${t('of')} ${count !== -1 ? count : `${t('moreThan')} ${to}`}`
                }
            />

            <CompanyFormModal
                open={isModalOpen}
                handleClose={handleCloseModal}
                data={selectedCompany}
                isEditing={isEditing}
                setData={setCompanies}
            />

            <ConfirmationModal
                open={isConfirmDeleteModalOpen}
                onClose={handleCloseDeleteConfirmation}
                onConfirm={handleDeleteCompany}
                title={t('company_delete')}
                message={t('question_areYouSureDeleteCompany', { companyName: companyToDelete?.name || '' })}
                confirmText={t('delete')}
                cancelText={t('cancel')}
            />
        </Box>
    );
}

export default Index;