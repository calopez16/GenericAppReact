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
import { DataAPIShippingCompaniesService } from '@data/ShippingCompanies/Data';
import { useTranslation } from 'react-i18next';
import { ShowMessage } from '@helpers/NotificationService';
import ConfirmationModal from '@layout/ConfirmationModal';
import ShippingCompanyFormModal from '@views/ShippingCompanies/ShippingCompanyFormModal';
import ShippingCompanyCardList from '@views/ShippingCompanies/ShippingCompanyCardList';
import ShippingCompanyListTable from '@views/ShippingCompanies/ShippingCompanyTableList';

function Index() {
    const { t } = useTranslation();
    const shippingCompanyDataService = DataAPIShippingCompaniesService();
    const [shippingCompanies, setShippingCompanies] = useState([]);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [totalShippingCompanies, setTotalShippingCompanies] = useState(0);

    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(searchTerm);

    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedShippingCompany, setSelectedShippingCompany] = useState(null);
    const [isEditing, setIsEditing] = useState(false);

    const [isConfirmDeleteModalOpen, setIsConfirmDeleteModalOpen] = useState(false);
    const [shippingCompanyToDelete, setShippingCompanyToDelete] = useState(null);

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
        const loadShippingCompanies = async () => {
            try {
                setLoading(true);
                const response = await shippingCompanyDataService.getDataPagination(page + 1, rowsPerPage, debouncedSearchTerm);
                setShippingCompanies(response.data.data);
                setTotalShippingCompanies(response.data.totalCount);
            } catch (error) {
                console.error("Error loading shippingCompanies:", error);
            } finally {
                setLoading(false);
            }
        };

        loadShippingCompanies();
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

    const handleToggleShippingCompanyStatus = async (shippingCompany) => {
        const isActiveNow = shippingCompany.isActive;

        try {
            let dataResult;
            if (isActiveNow) {
                dataResult = await shippingCompanyDataService.disableData(shippingCompany.idShippingCompany);
                if (dataResult.success) {
                    ShowMessage(t('recordDisabled'), 'success');
                }
            } else {
                dataResult = await shippingCompanyDataService.enableData(shippingCompany.idShippingCompany);
                if (dataResult.success) {
                    ShowMessage(t('recordEnabled'), 'success');
                }
            }

            if (dataResult.success) {
                setShippingCompanies(prevShippingCompanies =>
                    prevShippingCompanies.map(u =>
                        u.idShippingCompany === shippingCompany.idShippingCompany ? { ...u, isActive: !isActiveNow } : u
                    )
                );
            }
        } catch (error) {
            ShowMessage(t('error'), 'error');
            console.error("Error toggling shippingCompany status:", error);
        }
    };

    const handleOpenDeleteConfirmation = (shippingCompany) => {
        setShippingCompanyToDelete(shippingCompany);
        setIsConfirmDeleteModalOpen(true);
    };

    const handleDeleteShippingCompany = async () => {
        setIsConfirmDeleteModalOpen(false);

        if (!shippingCompanyToDelete) return;

        try {
            setLoading(true);

            const dataResult = await shippingCompanyDataService.deleteData(shippingCompanyToDelete.idShippingCompany);

            if (dataResult.success) {
                ShowMessage(t('recordDeleted'), 'success');
                setShippingCompanies(prevShippingCompanies => prevShippingCompanies.filter(c => c.idShippingCompany !== shippingCompanyToDelete.idShippingCompany));
                setPage(0);
            } else {
                ShowMessage(dataResult.message || t('errorDeletingRecord'), 'error');
            }
        } catch (error) {
            ShowMessage(t('error'), 'error');
            console.error("Error deleting shippingCompany:", error);
        } finally {
            setShippingCompanyToDelete(null);
            setLoading(false);
        }
    };

    const handleCloseDeleteConfirmation = () => {
        setIsConfirmDeleteModalOpen(false);
        setShippingCompanyToDelete(null);
    };


    const handleOpenAddShippingCompany = () => {
        setSelectedShippingCompany(null);
        setIsEditing(false);
        setIsModalOpen(true);
    };

    const handleOpenEditShippingCompany = (shippingCompany) => {
        setSelectedShippingCompany(shippingCompany);
        setIsEditing(true);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
    };

    const commonListProps = {
        shippingCompanies,
        loading,
        t,
        handleOpenEditShippingCompany,
        handleToggleShippingCompanyStatus,
        handleOpenDeleteConfirmation,
        setSelectedShippingCompany
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
                    {t('shippingCompanies')}
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
                        onClick={handleOpenAddShippingCompany}
                        fullWidth={isSmallScreen}
                    >
                        {t('add')}
                    </Button>
                </Box>
            </Box>

            {loading && <LinearProgress />}

            {isSmallScreen ? (
                <ShippingCompanyCardList {...commonListProps} />
            ) : (
                <ShippingCompanyListTable {...commonListProps} />
            )}

            <TablePagination
                rowsPerPageOptions={[5, 10, 25]}
                component="div"
                count={totalShippingCompanies}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handlePageChange}
                onRowsPerPageChange={handleRowsPerPageChange}
                labelRowsPerPage={t('rows_perPage')}
                labelDisplayedRows={({ from, to, count }) =>
                    `${from}-${to} ${t('of')} ${count !== -1 ? count : `${t('moreThan')} ${to}`}`
                }
            />

            <ShippingCompanyFormModal
                open={isModalOpen}
                handleClose={handleCloseModal}
                data={selectedShippingCompany}
                isEditing={isEditing}
                setData={setShippingCompanies}
            />

            <ConfirmationModal
                open={isConfirmDeleteModalOpen}
                onClose={handleCloseDeleteConfirmation}
                onConfirm={handleDeleteShippingCompany}
                title={t('deleteShippingCompany')}
                message={t('question_areYouSureDeleteShippingCompany', { shippingCompanyName: shippingCompanyToDelete?.name || '' })}
                confirmText={t('delete')}
                cancelText={t('cancel')}
            />
        </Box>
    );
}

export default Index;