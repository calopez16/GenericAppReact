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
import CloseIcon from '@mui/icons-material/Close';
import ViewInArIcon from '@mui/icons-material/ViewInAr';
import { DataAPITrailerBoxTypesService } from '@data/TrailerBoxTypes/Data';
import { useTranslation } from 'react-i18next';
import { ShowMessage } from '@helpers/NotificationService';
import ConfirmationModal from '@layout/ConfirmationModal';
import TrailerBoxTypeFormModal from '@views/TrailerBoxTypes/TrailerBoxTypeFormModal';
import TrailerBoxTypeCardList from '@views/TrailerBoxTypes/TrailerBoxTypeCardList';
import TrailerBoxTypeListTable from '@views/TrailerBoxTypes/TrailerBoxTypeTableList';

function Index() {
    const { t } = useTranslation();
    const trailerBoxTypeDataService = DataAPITrailerBoxTypesService();
    const [trailerBoxTypes, setTrailerBoxTypes] = useState([]);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(5);
    const [totalTrailerBoxTypes, setTotalTrailerBoxTypes] = useState(0);

    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(searchTerm);
    const [isSearchExpanded, setIsSearchExpanded] = useState(false);
    const searchInputRef = useRef(null);

    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedTrailerBoxType, setSelectedTrailerBoxType] = useState(null);
    const [isEditing, setIsEditing] = useState(false);

    const [isConfirmDeleteModalOpen, setIsConfirmDeleteModalOpen] = useState(false);
    const [trailerBoxTypeToDelete, setTrailerBoxTypeToDelete] = useState(null);

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
        const loadTrailerBoxTypes = async () => {
            try {
                setLoading(true);
                const response = await trailerBoxTypeDataService.getDataPagination(page + 1, rowsPerPage, debouncedSearchTerm);
                if (response.success) {
                    setTrailerBoxTypes(response.data.data);
                    setTotalTrailerBoxTypes(response.data.totalCount);
                } else {
                    setTrailerBoxTypes([]);
                }
            } catch (error) {
                console.error("Error loading trailerBoxTypes:", error);
                setTrailerBoxTypes([]);
            } finally {
                setLoading(false);
            }
        };

        loadTrailerBoxTypes();
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

    const handleToggleTrailerBoxTypeStatus = async (trailerBoxType) => {
        const isActiveNow = trailerBoxType.isActive;

        try {
            let dataResult;
            if (isActiveNow) {
                dataResult = await trailerBoxTypeDataService.disableData(trailerBoxType.idTrailerBoxType);
                if (dataResult.success) {
                    ShowMessage(t('recordDisabled'), 'success');
                }
            } else {
                dataResult = await trailerBoxTypeDataService.enableData(trailerBoxType.idTrailerBoxType);
                if (dataResult.success) {
                    ShowMessage(t('recordEnabled'), 'success');
                }
            }

            if (dataResult.success) {
                setTrailerBoxTypes(prevTrailerBoxTypes =>
                    prevTrailerBoxTypes.map(u =>
                        u.idTrailerBoxType === trailerBoxType.idTrailerBoxType ? { ...u, isActive: !isActiveNow } : u
                    )
                );
            }
        } catch (error) {
            ShowMessage(t('error'), 'error');
            console.error("Error toggling trailerBoxType status:", error);
        }
    };

    const handleOpenDeleteConfirmation = (trailerBoxType) => {
        setTrailerBoxTypeToDelete(trailerBoxType);
        setIsConfirmDeleteModalOpen(true);
    };

    const handleDeleteTrailerBoxType = async () => {
        setIsConfirmDeleteModalOpen(false);

        if (!trailerBoxTypeToDelete) return;

        const idToDelete = trailerBoxTypeToDelete.idTrailerBoxType;

        try {
            setDeletingId(idToDelete);

            const dataResult = await trailerBoxTypeDataService.deleteData(idToDelete);

            if (dataResult.success) {
                ShowMessage(t('recordDeleted'), 'success');

                setTimeout(() => {
                    setTrailerBoxTypes(prevTrailerBoxTypes => prevTrailerBoxTypes.filter(c => c.idTrailerBoxType !== idToDelete));
                    setDeletingId(null);
                    setPage(0);
                }, ANIMATION_DURATION);

            } else {
                ShowMessage(dataResult.message || t('errorDeletingRecord'), 'error');
                setDeletingId(null);
            }
        } catch (error) {
            ShowMessage(t('error'), 'error');
            console.error("Error deleting trailerBoxType:", error);
            setDeletingId(null);
        } finally {
            setTrailerBoxTypeToDelete(null);
        }
    };

    const handleCloseDeleteConfirmation = () => {
        setIsConfirmDeleteModalOpen(false);
        setTrailerBoxTypeToDelete(null);
    };


    const handleOpenAddTrailerBoxType = () => {
        setSelectedTrailerBoxType(null);
        setIsEditing(false);
        setIsModalOpen(true);
    };

    const handleOpenEditTrailerBoxType = (trailerBoxType) => {
        setSelectedTrailerBoxType(trailerBoxType);
        setIsEditing(true);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
    };

    const commonListProps = {
        trailerBoxTypes,
        loading,
        t,
        handleOpenEditTrailerBoxType,
        handleToggleTrailerBoxTypeStatus,
        handleOpenDeleteConfirmation,
        setSelectedTrailerBoxType,
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
                    <Avatar sx={{ bgcolor: 'primary.light', color: 'white', width: 45, height: 45, borderRadius: 2 }}><ViewInArIcon /></Avatar>
                    <Box>
                        <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1.2 }}>{t('trailerBoxTypes')}</Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ display: { xs: 'none', sm: 'block' } }}>
                            {t('trailerBoxTypes_description')}
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
                        onClick={handleOpenAddTrailerBoxType}
                        sx={{ whiteSpace: 'nowrap', ml: 1 }}
                    >
                        {t('add')}
                    </Button>
                </Box>
            </Paper>

            {loading && <LinearProgress sx={{ mb: 2, borderRadius: 1 }} />}

            {isSmallScreen ? <TrailerBoxTypeCardList {...commonListProps} /> : <TrailerBoxTypeListTable {...commonListProps} />}

            <TablePagination
                rowsPerPageOptions={[5, 10, 25]}
                component="div"
                count={totalTrailerBoxTypes}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handlePageChange}
                onRowsPerPageChange={handleRowsPerPageChange}
                labelRowsPerPage={t('rows_perPage')}
                labelDisplayedRows={({ from, to, count }) =>
                    `${from}-${to} ${t('of')} ${count !== -1 ? count : `${t('moreThan')} ${to}`}`
                }
            />

            <TrailerBoxTypeFormModal
                open={isModalOpen}
                handleClose={handleCloseModal}
                data={selectedTrailerBoxType}
                isEditing={isEditing}
                setData={setTrailerBoxTypes}
            />

            <ConfirmationModal
                open={isConfirmDeleteModalOpen}
                onClose={handleCloseDeleteConfirmation}
                onConfirm={handleDeleteTrailerBoxType}
                title={t('trailerBoxType_delete')}
                message={t('question_areYouSureDeleteTrailerBoxType', { trailerBoxType: trailerBoxTypeToDelete?.description || '' })}
                confirmText={t('delete')}
                cancelText={t('cancel')}
                type="danger"
            />
        </Box>
    );
}

export default Index;