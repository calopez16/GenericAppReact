import React, { useState, useEffect, useRef, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
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
import DrawIcon from '@mui/icons-material/Draw';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CloseIcon from '@mui/icons-material/Close';
import { AppContext } from '@helpers/AppContext';
import { DataAPIContractSignsService } from '@data/ContractSigns/Data';
import { useTranslation } from 'react-i18next';
import { ShowMessage } from '@helpers/NotificationService';
import ConfirmationModal from '@layout/ConfirmationModal';
import ContractSignFormModal from '@views/ContractSigns/ContractSignFormModal';
import ContractSignCardList from '@views/ContractSigns/ContractSignCardList';
import ContractSignTableList from '@views/ContractSigns/ContractSignTableList';

function ContractSignsIndex() {
    const { t } = useTranslation();
    const { companySelected } = useContext(AppContext);
    const signDataService = DataAPIContractSignsService();
    const navigate = useNavigate();

    const [signs, setSigns] = useState([]);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(5);
    const [totalSigns, setTotalSigns] = useState(0);

    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(searchTerm);
    const [isSearchExpanded, setIsSearchExpanded] = useState(false);
    const searchInputRef = useRef(null);

    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedSign, setSelectedSign] = useState(null);
    const [isEditing, setIsEditing] = useState(false);

    const [isConfirmDeleteModalOpen, setIsConfirmDeleteModalOpen] = useState(false);
    const [signToDelete, setSignToDelete] = useState(null);

    const [deletingId, setDeletingId] = useState(null);
    const ANIMATION_DURATION = 500;

    const theme = useTheme();
    const isSmallScreen = useMediaQuery(theme.breakpoints.down('md'));

    useEffect(() => {
        const timerId = setTimeout(() => {
            setDebouncedSearchTerm(searchTerm);
        }, 500);
        return () => clearTimeout(timerId);
    }, [searchTerm]);

    useEffect(() => {
        const loadSigns = async () => {
            if (!companySelected?.idCompany) return;

            try {
                setLoading(true);
                const response = await signDataService.getDataPagination(
                    page + 1, 
                    rowsPerPage, 
                    debouncedSearchTerm + `&idCompany=${companySelected.idCompany}`
                );
                setSigns(response.data.data);
                setTotalSigns(response.data.totalCount);
            } catch (error) {
                console.error('Error loading contract signs:', error);
            } finally {
                setLoading(false);
            }
        };
        loadSigns();
    }, [page, rowsPerPage, debouncedSearchTerm, companySelected?.idCompany]);

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

    const handleToggleSignStatus = async (sign) => {
        const isActiveNow = sign.isActive;
        try {
            let dataResult;
            if (isActiveNow) {
                dataResult = await signDataService.disableData(sign.idContractSign);
                if (dataResult.success) ShowMessage(t('recordDisabled'), 'success');
            } else {
                dataResult = await signDataService.enableData(sign.idContractSign);
                if (dataResult.success) ShowMessage(t('recordEnabled'), 'success');
            }
            if (dataResult.success) {
                setSigns(prev =>
                    prev.map(item =>
                        item.idContractSign === sign.idContractSign ? { ...item, isActive: !isActiveNow } : item
                    )
                );
            }
        } catch (error) {
            ShowMessage(t('error'), 'error');
            console.error('Error toggling sign status:', error);
        }
    };

    const handleOpenDeleteConfirmation = (sign) => {
        setSignToDelete(sign);
        setIsConfirmDeleteModalOpen(true);
    };

    const handleDeleteSign = async () => {
        setIsConfirmDeleteModalOpen(false);
        if (!signToDelete) return;

        const idToDelete = signToDelete.idContractSign;
        try {
            setDeletingId(idToDelete);
            const dataResult = await signDataService.deleteData(idToDelete);

            if (dataResult.success) {
                ShowMessage(t('recordDeleted'), 'success');
                setTimeout(() => {
                    setSigns(prev => prev.filter(item => item.idContractSign !== idToDelete));
                    setDeletingId(null);
                    setPage(0);
                }, ANIMATION_DURATION);
            } else {
                ShowMessage(dataResult.message || t('errorDeletingRecord'), 'error');
                setDeletingId(null);
            }
        } catch (error) {
            ShowMessage(t('error'), 'error');
            console.error('Error deleting contract sign:', error);
            setDeletingId(null);
        } finally {
            setSignToDelete(null);
        }
    };

    const handleCloseDeleteConfirmation = () => {
        setIsConfirmDeleteModalOpen(false);
        setSignToDelete(null);
    };

    const handleOpenAddSign = () => {
        setSelectedSign(null);
        setIsEditing(false);
        setIsModalOpen(true);
    };

    const handleOpenEditSign = (sign) => {
        setSelectedSign(sign);
        setIsEditing(true);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
    };

    const commonListProps = {
        signs,
        loading,
        t,
        handleOpenEditSign,
        handleToggleSignStatus,
        handleOpenDeleteConfirmation,
        setSelectedSign,
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
                        <DrawIcon />
                    </Avatar>
                    <Box>
                        <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
                            {t('contractSigns')}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ display: { xs: 'none', sm: 'block' } }}>
                            {t('contractSigns_description')}
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
                        onClick={() => navigate('/contract-templates')}
                        variant="contained"
                        startIcon={<ArrowBackIcon />}
                        sx={{ whiteSpace: 'nowrap', ml: 1 }}
                    >
                        {t('return')}
                    </Button>
                    <Button
                        variant="contained"
                        disableElevation
                        startIcon={<AddIcon />}
                        onClick={handleOpenAddSign}
                        sx={{ whiteSpace: 'nowrap', ml: 1 }}
                    >
                        {t('add')}
                    </Button>
                </Box>
            </Paper>

            {loading && <LinearProgress sx={{ mb: 2, borderRadius: 1 }} />}

            {isSmallScreen
                ? <ContractSignCardList {...commonListProps} />
                : <ContractSignTableList {...commonListProps} />
            }

            <TablePagination
                rowsPerPageOptions={[5, 10, 25]}
                component="div"
                count={totalSigns}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handlePageChange}
                onRowsPerPageChange={handleRowsPerPageChange}
                labelRowsPerPage={t('rows_perPage')}
                labelDisplayedRows={({ from, to, count }) =>
                    `${from}-${to} ${t('of')} ${count !== -1 ? count : `${t('moreThan')} ${to}`}`
                }
            />

            <ContractSignFormModal
                open={isModalOpen}
                handleClose={handleCloseModal}
                data={selectedSign}
                isEditing={isEditing}
                setData={setSigns}
            />

            <ConfirmationModal
                open={isConfirmDeleteModalOpen}
                onClose={handleCloseDeleteConfirmation}
                onConfirm={handleDeleteSign}
                title={t('contractSign_delete')}
                message={t('question_areYouSureDeleteContractSign', { signName: signToDelete?.name || '' })}
                confirmText={t('delete')}
                cancelText={t('cancel')}
                type="danger"
            />
        </Box>
    );
}

export default ContractSignsIndex;
