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
    Tooltip,
    Tabs,
    Tab,
    FormControlLabel,
    Checkbox,
    Stack,
    Collapse
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import ArticleIcon from '@mui/icons-material/Article';
import CloseIcon from '@mui/icons-material/Close';
import FilterListIcon from '@mui/icons-material/FilterList';
import PeopleIcon from '@mui/icons-material/People';
import DescriptionIcon from '@mui/icons-material/Description';
import FolderZipIcon from '@mui/icons-material/FolderZip';
import { AppContext } from '@helpers/AppContext';
import { DataAPIContractsService } from '@data/Contracts/Data';
import { useTranslation } from 'react-i18next';
import { ShowMessage } from '@helpers/NotificationService';
import ConfirmationModal from '@layout/ConfirmationModal';
import ContractsCardList from '@views/Contracts/ContractsCardList';
import ContractsTableList from '@views/Contracts/ContractsTableList';
import ContractWizardModal from '@views/Contracts/ContractWizardModal';
import EmployeeContractsTableList from '@views/Contracts/EmployeeContractsTableList';

const EMP_CACHE_KEY = 'contracts_emp_filters';
const CONTRACT_CACHE_KEY = 'contracts_tab_filters';

const getDefaultDateFrom = () => {
    const d = new Date();
    d.setFullYear(d.getFullYear() - 1);
    return d.toISOString().split('T')[0];
};
const getDefaultDateTo = () => new Date().toISOString().split('T')[0];

function ContractsIndex() {
    const { t } = useTranslation();
    const { companySelected } = useContext(AppContext);
    const contractDataService = DataAPIContractsService();

    const [activeTab, setActiveTab] = useState(0);

    // --- Tab 1: Employees ---
    const [employees, setEmployees] = useState([]);
    const [empPage, setEmpPage] = useState(0);
    const [empRowsPerPage, setEmpRowsPerPage] = useState(() => {
        try { return JSON.parse(localStorage.getItem(EMP_CACHE_KEY))?.rowsPerPage ?? 10; } catch { return 10; }
    });
    const [empTotal, setEmpTotal] = useState(0);
    const [empSearchTerm, setEmpSearchTerm] = useState(() => {
        try { return JSON.parse(localStorage.getItem(EMP_CACHE_KEY))?.searchTerm ?? ''; } catch { return ''; }
    });
    const [empDebouncedSearch, setEmpDebouncedSearch] = useState(empSearchTerm);
    const [empDateFrom, setEmpDateFrom] = useState(() => {
        try { return JSON.parse(localStorage.getItem(EMP_CACHE_KEY))?.dateFrom ?? getDefaultDateFrom(); } catch { return getDefaultDateFrom(); }
    });
    const [empDateTo, setEmpDateTo] = useState(() => {
        try { return JSON.parse(localStorage.getItem(EMP_CACHE_KEY))?.dateTo ?? getDefaultDateTo(); } catch { return getDefaultDateTo(); }
    });
    const [empShowNoContract, setEmpShowNoContract] = useState(() => {
        try {
            const cached = JSON.parse(localStorage.getItem(EMP_CACHE_KEY));
            return cached?.showNoContract ?? true;
        } catch { return true; }
    });
    const [empLoading, setEmpLoading] = useState(true);
    const [empRefreshKey, setEmpRefreshKey] = useState(0);
    const [empIsSearchExpanded, setEmpIsSearchExpanded] = useState(empSearchTerm !== '');
    const empSearchInputRef = useRef(null);
    const [wizardEmployee, setWizardEmployee] = useState(null);
    const [wizardInitialStep, setWizardInitialStep] = useState(0);

    // --- Tab 2: Contracts ---
    const [contracts, setContracts] = useState([]);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [totalContracts, setTotalContracts] = useState(0);
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(searchTerm);
    const [isSearchExpanded, setIsSearchExpanded] = useState(false);
    const [contractDateFrom, setContractDateFrom] = useState(() => {
        try { return JSON.parse(localStorage.getItem(CONTRACT_CACHE_KEY))?.dateFrom ?? ''; } catch { return ''; }
    });
    const [contractDateTo, setContractDateTo] = useState(() => {
        try { return JSON.parse(localStorage.getItem(CONTRACT_CACHE_KEY))?.dateTo ?? ''; } catch { return ''; }
    });
    const searchInputRef = useRef(null);
    const [loading, setLoading] = useState(true);
    const [isWizardOpen, setIsWizardOpen] = useState(false);
    const [isConfirmDeleteModalOpen, setIsConfirmDeleteModalOpen] = useState(false);
    const [contractToDelete, setContractToDelete] = useState(null);
    const [deletingId, setDeletingId] = useState(null);
    const ANIMATION_DURATION = 500;
    const [isPdfLoading, setIsPdfLoading] = useState(false);
    const [refreshKey, setRefreshKey] = useState(0);
    const [selectedContractIds, setSelectedContractIds] = useState([]);
    const [isZipLoading, setIsZipLoading] = useState(false);

    const theme = useTheme();
    const isSmallScreen = useMediaQuery(theme.breakpoints.down('md'));

    // Persist contracts tab filters
    useEffect(() => {
        localStorage.setItem(CONTRACT_CACHE_KEY, JSON.stringify({
            dateFrom: contractDateFrom,
            dateTo: contractDateTo,
        }));
    }, [contractDateFrom, contractDateTo]);

    // Persist employee filters
    useEffect(() => {
        localStorage.setItem(EMP_CACHE_KEY, JSON.stringify({
            searchTerm: empSearchTerm,
            dateFrom: empDateFrom,
            dateTo: empDateTo,
            showNoContract: empShowNoContract,
            rowsPerPage: empRowsPerPage,
        }));
    }, [empSearchTerm, empDateFrom, empDateTo, empShowNoContract, empRowsPerPage]);

    // Debounce search terms
    useEffect(() => {
        const id = setTimeout(() => setDebouncedSearchTerm(searchTerm), 500);
        return () => clearTimeout(id);
    }, [searchTerm]);

    useEffect(() => {
        const id = setTimeout(() => setEmpDebouncedSearch(empSearchTerm), 500);
        return () => clearTimeout(id);
    }, [empSearchTerm]);

    // Load contracts (tab 2)
    useEffect(() => {
        const load = async () => {
            if (!companySelected?.idCompany) return;
            try {
                setLoading(true);
                const response = await contractDataService.getDataPagination(
                    page + 1, rowsPerPage, debouncedSearchTerm,
                    companySelected.idCompany,
                    contractDateFrom || null,
                    contractDateTo || null
                );
                setContracts(response.data.data);
                setTotalContracts(response.data.totalCount);
                setSelectedContractIds([]);
            } catch (error) {
                console.error('Error loading contracts:', error);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [page, rowsPerPage, debouncedSearchTerm, companySelected, refreshKey, contractDateFrom, contractDateTo]);

    // Load employees (tab 1)
    useEffect(() => {
        const load = async () => {
            if (!companySelected?.idCompany) return;
            try {
                setEmpLoading(true);
                const response = await contractDataService.getEmployeePagination(
                    empPage + 1, empRowsPerPage, empDebouncedSearch,
                    companySelected.idCompany,
                    empDateFrom || null,
                    empDateTo || null,
                    empShowNoContract
                );
                setEmployees(response.data.data);
                setEmpTotal(response.data.totalCount);
            } catch (error) {
                console.error('Error loading employees:', error);
            } finally {
                setEmpLoading(false);
            }
        };
        load();
    }, [empPage, empRowsPerPage, empDebouncedSearch, companySelected, empRefreshKey, empDateFrom, empDateTo, empShowNoContract]);

    const handlePageChange = (event, newPage) => setPage(newPage);
    const handleRowsPerPageChange = (event) => { setRowsPerPage(parseInt(event.target.value, 10)); setPage(0); };
    const handleSearchChange = (event) => { setSearchTerm(event.target.value); setPage(0); };

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

    const handleCloseSearch = () => { if (searchTerm === '') setIsSearchExpanded(false); };

    const toggleEmpSearch = () => {
        if (!empIsSearchExpanded) {
            setEmpIsSearchExpanded(true);
            setTimeout(() => empSearchInputRef.current?.focus(), 100);
        } else if (empSearchTerm !== '') {
            setEmpSearchTerm('');
            setEmpPage(0);
        } else {
            setEmpIsSearchExpanded(false);
        }
    };

    const handleCloseEmpSearch = () => { if (empSearchTerm === '') setEmpIsSearchExpanded(false); };

    const handleOpenWizardForEmployee = (employee) => {
        setWizardEmployee(employee);
        setWizardInitialStep(1);
        setIsWizardOpen(true);
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
        }
    };

    const handleOpenDeleteConfirmation = (contract) => { setContractToDelete(contract); setIsConfirmDeleteModalOpen(true); };

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
            setDeletingId(null);
        } finally {
            setContractToDelete(null);
        }
    };

    const handleCloseDeleteConfirmation = () => { setIsConfirmDeleteModalOpen(false); setContractToDelete(null); };

    const handleOpenWizard = () => { setWizardEmployee(null); setWizardInitialStep(0); setIsWizardOpen(true); };
    const handleCloseWizard = () => { setIsWizardOpen(false); setWizardEmployee(null); setWizardInitialStep(0); };

    const handleWizardComplete = () => {
        ShowMessage(t('contractWizardCompleted') || 'Datos recopilados correctamente', 'success');
        setPage(0);
        setRefreshKey(prev => prev + 1);
        setEmpRefreshKey(prev => prev + 1);
    };

    const handleOpenPdf = async (contract) => {
        try {
            setIsPdfLoading(true);
            ShowMessage(t('generatingPdf'), 'info');
            const response = await contractDataService.getPdfById(contract.idContract);
            const fileData = response.data ? response.data : response;
            const blob = new Blob([fileData], { type: 'application/pdf' });
            window.open(window.URL.createObjectURL(blob), '_blank');
        } catch (error) {
            ShowMessage(t('error'), 'error');
        } finally {
            setIsPdfLoading(false);
        }
    };

    const handleToggleSelect = (idContract) => {
        setSelectedContractIds(prev =>
            prev.includes(idContract) ? prev.filter(id => id !== idContract) : [...prev, idContract]
        );
    };

    const handleToggleSelectAll = (checked) => {
        if (checked) {
            setSelectedContractIds(contracts.map(c => c.idContract));
        } else {
            setSelectedContractIds([]);
        }
    };

    const handleDownloadZip = async () => {
        if (selectedContractIds.length === 0) return;
        try {
            setIsZipLoading(true);
            const response = await contractDataService.downloadZip(selectedContractIds);
            const fileData = response.data ? response.data : response;
            const blob = new Blob([fileData], { type: 'application/zip' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `Contratos_${crypto.randomUUID()}.zip`;
            a.click();
            window.URL.revokeObjectURL(url);
        } catch (error) {
            ShowMessage(t('error'), 'error');
        } finally {
            setIsZipLoading(false);
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
        rowsPerPage,
        selectedIds: selectedContractIds,
        onToggleSelect: handleToggleSelect,
        onToggleSelectAll: handleToggleSelectAll
    };

    return (
        <Box>
            <Paper
                elevation={0}
                sx={{
                    p: 2,
                    mb: 2,
                    borderRadius: 2,
                    border: '1px solid',
                    borderColor: 'divider',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: 2,
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
                <Button
                    variant="contained"
                    disableElevation
                    endIcon={<AddIcon />}
                    onClick={handleOpenWizard}
                    sx={{ whiteSpace: 'nowrap' }}
                >
                    {t('newContract')}
                </Button>
            </Paper>

            <Paper elevation={0} sx={{ borderRadius: 2, border: '1px solid', borderColor: 'divider', mb: 2 }}>
                <Tabs value={activeTab} onChange={(_, v) => setActiveTab(v)} sx={{ borderBottom: '1px solid', borderColor: 'divider', px: 2 }}>
                    <Tab icon={<PeopleIcon fontSize="small" />} iconPosition="start" label={t('employees')} />
                    <Tab icon={<DescriptionIcon fontSize="small" />} iconPosition="start" label={t('sigened_contracts') } />
                </Tabs>

                {/* TAB 1: EMPLOYEES */}
                {activeTab === 0 && (
                    <Box sx={{ p: 2 }}>
                        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ sm: 'center' }} sx={{ mb: 2 }} flexWrap="wrap">
                            <ClickAwayListener onClickAway={handleCloseEmpSearch}>
                                <Box sx={{
                                    display: 'flex',
                                    flexDirection: 'row-reverse',
                                    alignItems: 'center',
                                    bgcolor: empIsSearchExpanded ? 'action.hover' : 'transparent',
                                    borderRadius: 10,
                                    px: empIsSearchExpanded ? 1 : 0,
                                    width: empIsSearchExpanded ? '260px' : '42px',
                                    height: '42px',
                                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                    border: '1px solid',
                                    borderColor: empIsSearchExpanded ? 'primary.main' : 'transparent',
                                    overflow: 'hidden'
                                }}>
                                    <Tooltip title={empIsSearchExpanded && empSearchTerm === '' ? t('closeSearch') : t('search')}>
                                        <IconButton onClick={toggleEmpSearch} size="small" sx={{ color: empIsSearchExpanded ? 'primary.main' : 'text.secondary', flexShrink: 0, width: '42px', height: '42px' }}>
                                            {empIsSearchExpanded && empSearchTerm !== '' ? <CloseIcon /> : <SearchIcon />}
                                        </IconButton>
                                    </Tooltip>
                                    <TextField
                                        inputRef={empSearchInputRef}
                                        placeholder={t('search')}
                                        variant="standard"
                                        fullWidth
                                        value={empSearchTerm}
                                        onChange={e => { setEmpSearchTerm(e.target.value); setEmpPage(0); }}
                                        InputProps={{
                                            disableUnderline: true,
                                            sx: { ml: 1, fontSize: '0.9rem', visibility: empIsSearchExpanded ? 'visible' : 'hidden', opacity: empIsSearchExpanded ? 1 : 0, transition: 'opacity 0.2s ease-in-out' }
                                        }}
                                    />
                                </Box>
                            </ClickAwayListener>
                            <TextField
                                size="small"
                                type="date"
                                label={t('dateFrom') || 'Fecha desde'}
                                InputLabelProps={{ shrink: true }}
                                value={empDateFrom}
                                onChange={e => { setEmpDateFrom(e.target.value); setEmpPage(0); }}
                                sx={{ minWidth: 160 }}
                            />
                            <TextField
                                size="small"
                                type="date"
                                label={t('dateTo') || 'Fecha hasta'}
                                InputLabelProps={{ shrink: true }}
                                value={empDateTo}
                                onChange={e => { setEmpDateTo(e.target.value); setEmpPage(0); }}
                                sx={{ minWidth: 160 }}
                            />
                            <FormControlLabel
                                control={
                                    <Checkbox
                                        checked={empShowNoContract}
                                        onChange={e => { setEmpShowNoContract(e.target.checked); setEmpPage(0); }}
                                        size="small"
                                    />
                                }
                                label={
                                    <Typography variant="body2">
                                        {(empDateFrom || empDateTo)
                                            ? (t('showNoContractInRange') || 'Sin contrato en el rango')
                                            : (t('showNoContract') || 'Sin contrato firmado')}
                                    </Typography>
                                }
                            />
                        </Stack>

                        {empLoading && <LinearProgress sx={{ mb: 2, borderRadius: 1 }} />}

                        <EmployeeContractsTableList
                            employees={employees}
                            loading={empLoading}
                            t={t}
                            rowsPerPage={empRowsPerPage}
                            isSearch={empSearchTerm !== ''}
                            onOpenPdf={handleOpenPdf}
                            onNewContract={handleOpenWizardForEmployee}
                        />

                        <TablePagination
                            rowsPerPageOptions={[5, 10, 25]}
                            component="div"
                            count={empTotal}
                            rowsPerPage={empRowsPerPage}
                            page={empPage}
                            onPageChange={(_, p) => setEmpPage(p)}
                            onRowsPerPageChange={e => { setEmpRowsPerPage(parseInt(e.target.value, 10)); setEmpPage(0); }}
                            labelRowsPerPage={t('rows_perPage')}
                            labelDisplayedRows={({ from, to, count }) =>
                                `${from}-${to} ${t('of')} ${count !== -1 ? count : `${t('moreThan')} ${to}`}`
                            }
                        />
                    </Box>
                )}

                {/* TAB 2: CONTRACTS */}
                {activeTab === 1 && (
                    <Box sx={{ p: 2 }}>
                        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ sm: 'center' }} justifyContent="space-between" sx={{ mb: 2 }}>
                            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ sm: 'center' }}>
                            <ClickAwayListener onClickAway={handleCloseSearch}>
                                <Box sx={{
                                    display: 'flex',
                                    flexDirection: 'row-reverse',
                                    alignItems: 'center',
                                    bgcolor: isSearchExpanded ? 'action.hover' : 'transparent',
                                    borderRadius: 10,
                                    px: isSearchExpanded ? 1 : 0,
                                    width: isSearchExpanded ? '260px' : '42px',
                                    height: '42px',
                                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                    border: '1px solid',
                                    borderColor: isSearchExpanded ? 'primary.main' : 'transparent',
                                    overflow: 'hidden'
                                }}>
                                    <Tooltip title={isSearchExpanded && searchTerm === '' ? t('closeSearch') : t('search')}>
                                        <IconButton onClick={toggleSearch} size="small" sx={{ color: isSearchExpanded ? 'primary.main' : 'text.secondary', flexShrink: 0, width: '42px', height: '42px' }}>
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
                                            sx: { ml: 1, fontSize: '0.9rem', visibility: isSearchExpanded ? 'visible' : 'hidden', opacity: isSearchExpanded ? 1 : 0, transition: 'opacity 0.2s ease-in-out' }
                                        }}
                                    />
                                </Box>
                            </ClickAwayListener>
                            <TextField
                                size="small"
                                type="date"
                                label={t('dateFrom') || 'Fecha desde'}
                                InputLabelProps={{ shrink: true }}
                                value={contractDateFrom}
                                onChange={e => { setContractDateFrom(e.target.value); setPage(0); }}
                                sx={{ minWidth: 160 }}
                            />
                            <TextField
                                size="small"
                                type="date"
                                label={t('dateTo') || 'Fecha hasta'}
                                InputLabelProps={{ shrink: true }}
                                value={contractDateTo}
                                onChange={e => { setContractDateTo(e.target.value); setPage(0); }}
                                sx={{ minWidth: 160 }}
                            />
                            </Stack>
                            <Button
                                variant="contained"
                                disableElevation
                                color="success"
                                endIcon={<FolderZipIcon />}
                                onClick={handleDownloadZip}
                                disabled={isZipLoading || selectedContractIds.length === 0}
                                sx={{ whiteSpace: 'nowrap' }}
                            >
                                {isZipLoading
                                    ? t('downloading')
                                    : selectedContractIds.length > 0
                                        ? `${t('downloadContracts')} (${selectedContractIds.length})`
                                        : t('downloadContracts')}
                            </Button>
                        </Stack>

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
                    </Box>
                )}
            </Paper>

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
                initialEmployee={wizardEmployee}
                initialStep={wizardInitialStep}
            />
        </Box>
    );
}

export default ContractsIndex;

