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
import EventIcon from '@mui/icons-material/Event';
import { DataAPISeasonsService } from '@data/Seasons/Data';
import { useTranslation } from 'react-i18next';
import { ShowMessage } from '@helpers/NotificationService';
import ConfirmationModal from '@layout/ConfirmationModal';
import SeasonFormModal from '@views/Seasons/SeasonFormModal';
import SeasonCardList from '@views/Seasons/SeasonCardList';
import SeasonListTable from '@views/Seasons/SeasonTableList';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';

function Index() {
    const { t } = useTranslation();
    const seasonDataService = DataAPISeasonsService();
    const [seasons, setSeasons] = useState([]);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(5);
    const [totalSeasons, setTotalSeasons] = useState(0);

    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(searchTerm);
    const [isSearchExpanded, setIsSearchExpanded] = useState(false);
    const searchInputRef = useRef(null);

    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedSeason, setSelectedSeason] = useState(null);
    const [isEditing, setIsEditing] = useState(false);

    const [isConfirmDeleteModalOpen, setIsConfirmDeleteModalOpen] = useState(false);
    const [seasonToDelete, setSeasonToDelete] = useState(null);

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
        const loadSeasons = async () => {
            try {
                setLoading(true);
                const response = await seasonDataService.getDataPagination(page + 1, rowsPerPage, debouncedSearchTerm);
                setSeasons(response.data.data);
                setTotalSeasons(response.data.totalCount);
            } catch (error) {
                console.error("Error loading seasons:", error);
            } finally {
                setLoading(false);
            }
        };

        loadSeasons();
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

    const handleToggleSeasonStatus = async (season) => {
        const isActiveNow = season.isActive;

        try {
            let dataResult;
            if (isActiveNow) {
                dataResult = await seasonDataService.disableData(season.idSeason);
                if (dataResult.success) {
                    ShowMessage(t('recordDisabled'), 'success');
                }
            } else {
                dataResult = await seasonDataService.enableData(season.idSeason);
                if (dataResult.success) {
                    ShowMessage(t('recordEnabled'), 'success');
                }
            }

            if (dataResult.success) {
                setSeasons(prevSeasons =>
                    prevSeasons.map(u =>
                        u.idSeason === season.idSeason ? { ...u, isActive: !isActiveNow } : u
                    )
                );
            }
        } catch (error) {
            ShowMessage(t('error'), 'error');
            console.error("Error toggling season status:", error);
        }
    };

    const handleOpenDeleteConfirmation = (season) => {
        setSeasonToDelete(season);
        setIsConfirmDeleteModalOpen(true);
    };

    const handleDeleteSeason = async () => {
        setIsConfirmDeleteModalOpen(false);

        if (!seasonToDelete) return;

        const idToDelete = seasonToDelete.idSeason;

        try {
            setDeletingId(idToDelete);

            const dataResult = await seasonDataService.deleteData(idToDelete);

            if (dataResult.success) {
                ShowMessage(t('recordDeleted'), 'success');

                setTimeout(() => {
                    setSeasons(prevSeasons => prevSeasons.filter(c => c.idSeason !== idToDelete));
                    setDeletingId(null);
                    setPage(0);
                }, ANIMATION_DURATION);

            } else {
                ShowMessage(dataResult.message || t('errorDeletingRecord'), 'error');
                setDeletingId(null);
            }
        } catch (error) {
            ShowMessage(t('error'), 'error');
            console.error("Error deleting season:", error);
            setDeletingId(null);
        } finally {
            setSeasonToDelete(null);
        }
    };

    const handleCloseDeleteConfirmation = () => {
        setIsConfirmDeleteModalOpen(false);
        setSeasonToDelete(null);
    };


    const handleOpenAddSeason = () => {
        setSelectedSeason(null);
        setIsEditing(false);
        setIsModalOpen(true);
    };

    const handleOpenEditSeason = (season) => {
        setSelectedSeason(season);
        setIsEditing(true);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
    };

    const commonListProps = {
        seasons,
        loading,
        t,
        handleOpenEditSeason,
        handleToggleSeasonStatus,
        handleOpenDeleteConfirmation,
        setSelectedSeason,
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
                    <Avatar sx={{ bgcolor: 'primary.light', color: 'white', width: 45, height: 45, borderRadius: 2 }}><EventIcon /></Avatar>
                    <Box>
                        <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1.2 }}>{t('seasons')}</Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ display: { xs: 'none', sm: 'block' } }}>
                            {t('seasons_description')}
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
                        onClick={handleOpenAddSeason}
                        sx={{ whiteSpace: 'nowrap', ml: 1 }}
                    >
                        {t('add')}
                    </Button>
                </Box>
            </Paper>

            {loading && <LinearProgress sx={{ mb: 2, borderRadius: 1 }} />}

            {isSmallScreen ? (
                <SeasonCardList {...commonListProps} />
            ) : (
                <SeasonListTable {...commonListProps} />
            )}

            <TablePagination
                rowsPerPageOptions={[5, 10, 25]}
                component="div"
                count={totalSeasons}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handlePageChange}
                onRowsPerPageChange={handleRowsPerPageChange}
                labelRowsPerPage={t('rows_perPage')}
                labelDisplayedRows={({ from, to, count }) =>
                    `${from}-${to} ${t('of')} ${count !== -1 ? count : `${t('moreThan')} ${to}`}`
                }
            />

            <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="es">
                <SeasonFormModal
                    open={isModalOpen}
                    handleClose={handleCloseModal}
                    data={selectedSeason}
                    isEditing={isEditing}
                    setData={setSeasons}
                />
            </LocalizationProvider>

            <ConfirmationModal
                open={isConfirmDeleteModalOpen}
                onClose={handleCloseDeleteConfirmation}
                onConfirm={handleDeleteSeason}
                title={t('season_delete')}
                message={t('question_areYouSureDeleteSeason', { seasonName: seasonToDelete?.description || '' })}
                confirmText={t('delete')}
                cancelText={t('cancel')}
                type="danger"
            />
        </Box>
    );
}

export default Index;