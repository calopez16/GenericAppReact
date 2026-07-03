import React, { useState, useEffect, useRef, useContext } from 'react';
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
import ArticleIcon from '@mui/icons-material/Article';
import CloseIcon from '@mui/icons-material/Close';
import { AppContext } from '@helpers/AppContext';
import { DataAPIContractsService } from '@data/Contracts/Data';
import { useTranslation } from 'react-i18next';
import { ShowMessage } from '@helpers/NotificationService';
import ConfirmationModal from '@layout/ConfirmationModal';
import ContractsCardList from '@views/Contracts/ContractsCardList';
import ContractsTableList from '@views/Contracts/ContractsTableList';
import ContractWizardModal from '@views/Contracts/ContractWizardModal';

function ContractsIndex() {
    const { t } = useTranslation();
    const { companySelected } = useContext(AppContext);
    const contractDataService = DataAPIContractsService();

    const [contracts, setContracts] = useState([]);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(5);
    const [totalContracts, setTotalContracts] = useState(0);

    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(searchTerm);
    const [isSearchExpanded, setIsSearchExpanded] = useState(false);
    const searchInputRef = useRef(null);

    const [loading, setLoading] = useState(true);
    const [isWizardOpen, setIsWizardOpen] = useState(false);

    const [isConfirmDeleteModalOpen, setIsConfirmDeleteModalOpen] = useState(false);
    const [contractToDelete, setContractToDelete] = useState(null);

    const [deletingId, setDeletingId] = useState(null);
    const ANIMATION_DURATION = 500;

    const [isPdfLoading, setIsPdfLoading] = useState(false);

    const theme = useTheme();
    const isSmallScreen = useMediaQuery(theme.breakpoints.down('md'));

    useEffect(() => {
        const timerId = setTimeout(() => {
            setDebouncedSearchTerm(searchTerm);
        }, 500);
        return () => clearTimeout(timerId);
    }, [searchTerm]);

    useEffect(() => {
        const loadContracts = async () => {
            if (!companySelected?.idCompany) return;
            try {
                setLoading(true);
                const response = await contractDataService.getDataPagination(
                    page + 1, 
                    rowsPerPage, 
                    debouncedSearchTerm, 
                    companySelected.idCompany
                );
                setContracts(response.data.data);
                setTotalContracts(response.data.totalCount);
            } catch (error) {
                console.error('Error loading contracts:', error);
            } finally {
                setLoading(false);
            }
        };
        loadContracts();
    }, [page, rowsPerPage, debouncedSearchTerm, companySelected]);

    const handlePageChange = (event, newPage) => setPage(newPage);

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
        if (searchTerm === '') setIsSearchExpanded(false);
    };

    const handleToggleContractStatus = async (contract) => {
        const isActiveNow = contract.isActive;
        try {
            let dataResult;
            if (isActiveNow) {
                dataResult = await contractDataService.disableData(contract.idContract);
                if (dataResult.success) ShowMessage(t('recordDisabled'), 'success');
            } else {
                dataResult = await contractDataService.enableData(contract.idContract);
                if (dataResult.success) ShowMessage(t('recordEnabled'), 'success');
            }
            if (dataResult.success) {
                setContracts(prev =>
                    prev.map(item =>
                        item.idContract === contract.idContract ? { ...item, isActive: !isActiveNow } : item
                    )
                );
            }
        } catch (error) {
            ShowMessage(t('error'), 'error');
            console.error('Error toggling contract status:', error);
        }
    };

    const handleOpenDeleteConfirmation = (contract) => {
        setContractToDelete(contract);
        setIsConfirmDeleteModalOpen(true);
    };

    const handleDeleteContract = async () => {
        setIsConfirmDeleteModalOpen(false);
        if (!contractToDelete) return;

        const idToDelete = contractToDelete.idContract;
        try {
            setDeletingId(idToDelete);
            const dataResult = await contractDataService.deleteData(idToDelete);

            if (dataResult.success) {
                ShowMessage(t('recordDeleted'), 'success');
                setTimeout(() => {
                    setContracts(prev => prev.filter(item => item.idContract !== idToDelete));
                    setDeletingId(null);
                    setPage(0);
                }, ANIMATION_DURATION);
            } else {
                ShowMessage(dataResult.message || t('errorDeletingRecord'), 'error');
                setDeletingId(null);
            }
        } catch (error) {
            ShowMessage(t('error'), 'error');
            console.error('Error deleting contract:', error);
            setDeletingId(null);
        } finally {
            setContractToDelete(null);
        }
    };

    const handleCloseDeleteConfirmation = () => {
        setIsConfirmDeleteModalOpen(false);
        setContractToDelete(null);
    };

    const handleOpenWizard = () => {
        setIsWizardOpen(true);
    };

    const handleCloseWizard = () => {
        setIsWizardOpen(false);
    };

    const handleWizardComplete = (data) => {
        console.log('Wizard completed with data:', data);
        ShowMessage(t('contractWizardCompleted') || 'Datos recopilados correctamente', 'success');
        setPage(0);
    };

    const handleOpenPdf = async (contract) => {
        try {
            setIsPdfLoading(true);
            ShowMessage(t('generatingPdf'), 'info');
            const response = await contractDataService.getPdfById(contract.idContract);
            const fileData = response.data ? response.data : response;
            const blob = new Blob([fileData], { type: 'application/pdf' });
            const pdfUrl = window.URL.createObjectURL(blob);
            window.open(pdfUrl, '_blank');
        } catch (error) {
            ShowMessage(t('error'), 'error');
            console.error('Error generating contract PDF:', error);
        } finally {
            setIsPdfLoading(false);
        }
    };

    const commonListProps = {
        contracts,
        loading: loading || isPdfLoading,
        t,
        handleToggleContractStatus,
        handleOpenDeleteConfirmation,
        handleOpenPreview: handleOpenPdf,
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
                    <Avatar sx={{ bgcolor: 'primary.light', color: 'white', width: 45, height: 45, borderRadius: 2 }}>
                        <ArticleIcon />
                    </Avatar>
                    <Box>
                        <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
                            {t('contracts')}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ display: { xs: 'none', sm: 'block' } }}>
                            {t('contracts_description')}
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
                        onClick={handleOpenWizard}
                        sx={{ whiteSpace: 'nowrap', ml: 1 }}
                    >
                        {t('newContract')}
                    </Button>
                </Box>
            </Paper>

            {loading && <LinearProgress sx={{ mb: 2, borderRadius: 1 }} />}

            {isSmallScreen
                ? <ContractsCardList {...commonListProps} />
                : <ContractsTableList {...commonListProps} />
            }

            <TablePagination
                rowsPerPageOptions={[5, 10, 25]}
                component="div"
                count={totalContracts}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handlePageChange}
                onRowsPerPageChange={handleRowsPerPageChange}
                labelRowsPerPage={t('rows_perPage')}
                labelDisplayedRows={({ from, to, count }) =>
                    `${from}-${to} ${t('of')} ${count !== -1 ? count : `${t('moreThan')} ${to}`}`
                }
            />

            <ConfirmationModal
                open={isConfirmDeleteModalOpen}
                onClose={handleCloseDeleteConfirmation}
                onConfirm={handleDeleteContract}
                title={t('contract_delete')}
                message={t('question_areYouSureDeleteContract', { contractName: contractToDelete?.documentName || '' })}
                confirmText={t('delete')}
                cancelText={t('cancel')}
                type="danger"
            />

            <ContractWizardModal
                open={isWizardOpen}
                onClose={handleCloseWizard}
                onComplete={handleWizardComplete}
            />
        </Box>
    );
}

export default ContractsIndex;
