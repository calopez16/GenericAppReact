import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    TextField,
    InputAdornment,
    Button,
    TablePagination,
    useMediaQuery,
    useTheme,
    LinearProgress
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
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

    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedCompany, setSelectedCompany] = useState(null);
    const [isEditing, setIsEditing] = useState(false);

    const [isConfirmDeleteModalOpen, setIsConfirmDeleteModalOpen] = useState(false);
    const [companyToDelete, setCompanyToDelete] = useState(null);

    const [deletingId, setDeletingId] = useState(null);
    const ANIMATION_DURATION = 500;

    const theme = useTheme();
    const isSmallScreen = useMediaQuery(theme.breakpoints.down('xl'));

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
    };

    return (
        <Box sx={{ p: 3 }}>
            <Box sx={{
                display: 'flex',
                flexDirection: isSmallScreen ? 'column' : 'row',
                justifyContent: 'space-between',
                alignItems: isSmallScreen ? 'stretch' : 'center',
                gap: isSmallScreen ? 1 : 2,
                mb: 2,
            }}>
                <Typography variant="h4" component="h1">
                    {t('companies')}
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: isSmallScreen ? 'column' : 'row', gap: 1, flexGrow: 1, justifyContent: 'flex-end' }}>
                    <TextField
                        label={t('search') + "..."}
                        variant="outlined"
                        size="small"
                        value={searchTerm}
                        onChange={handleSearchChange}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SearchIcon />
                                </InputAdornment>
                            ),
                        }}
                        fullWidth={isSmallScreen}
                        sx={{ flexShrink: 1 }}
                    />
                    <Button
                        variant="contained"
                        endIcon={<AddIcon />}
                        onClick={handleOpenAddCompany}
                        fullWidth={isSmallScreen}
                    >
                        {t('add')}
                    </Button>
                </Box>
            </Box>

            {loading && <LinearProgress />}

            {isSmallScreen ? (
                <CompanyCardList {...commonListProps} />
            ) : (
                <CompanyListTable {...commonListProps} />
            )}

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