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
import LocationCityIcon from '@mui/icons-material/LocationCity';
import CloseIcon from '@mui/icons-material/Close';
import { DataAPICitiesService } from '@data/Cities/Data';
import { useTranslation } from 'react-i18next';
import { ShowMessage } from '@helpers/NotificationService';
import ConfirmationModal from '@layout/ConfirmationModal';
import CityFormModal from '@views/cities/CityFormModal';
import CityCardList from '@views/cities/CityCardList';
import CityListTable from '@views/cities/CityTableList';

function Index() {
    const { t } = useTranslation();
    const cityDataService = DataAPICitiesService();
    const [cities, setCities] = useState([]);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(5);
    const [totalCities, setTotalCities] = useState(0);

    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(searchTerm);
    const [isSearchExpanded, setIsSearchExpanded] = useState(false);
    const searchInputRef = useRef(null);

    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedCity, setSelectedCity] = useState(null);
    const [isEditing, setIsEditing] = useState(false);

    const [isConfirmDeleteModalOpen, setIsConfirmDeleteModalOpen] = useState(false);
    const [cityToDelete, setCityToDelete] = useState(null);

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
        const loadCities = async () => {
            try {
                setLoading(true);
                const response = await cityDataService.getDataPagination(page + 1, rowsPerPage, debouncedSearchTerm);
                setCities(response.data.data);
                setTotalCities(response.data.totalCount);
            } catch (error) {
                console.error("Error loading cities:", error);
            } finally {
                setLoading(false);
            }
        };

        loadCities();
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

    const handleToggleCityStatus = async (city) => {
        const isActiveNow = city.isActive;

        try {
            let dataResult;
            if (isActiveNow) {
                dataResult = await cityDataService.disableData(city.idCity);
                if (dataResult.success) {
                    ShowMessage(t('recordDisabled'), 'success');
                }
            } else {
                dataResult = await cityDataService.enableData(city.idCity);
                if (dataResult.success) {
                    ShowMessage(t('recordEnabled'), 'success');
                }
            }

            if (dataResult.success) {
                setCities(prevCities =>
                    prevCities.map(u =>
                        u.idCity === city.idCity ? { ...u, isActive: !isActiveNow } : u
                    )
                );
            }
        } catch (error) {
            ShowMessage(t('error'), 'error');
            console.error("Error toggling city status:", error);
        }
    };

    const handleOpenDeleteConfirmation = (city) => {
        setCityToDelete(city);
        setIsConfirmDeleteModalOpen(true);
    };

    const handleDeleteCity = async () => {
        setIsConfirmDeleteModalOpen(false);

        if (!cityToDelete) return;

        const idToDelete = cityToDelete.idCity;

        try {
            setDeletingId(idToDelete);

            const dataResult = await cityDataService.deleteData(idToDelete);

            if (dataResult.success) {
                ShowMessage(t('recordDeleted'), 'success');

                setTimeout(() => {
                    setCities(prevCities => prevCities.filter(c => c.idCity !== idToDelete));
                    setDeletingId(null);
                    setPage(0);
                }, ANIMATION_DURATION);

            } else {
                ShowMessage(dataResult.message || t('errorDeletingRecord'), 'error');
                setDeletingId(null);
            }
        } catch (error) {
            ShowMessage(t('error'), 'error');
            console.error("Error deleting city:", error);
            setDeletingId(null);
        } finally {
            setCityToDelete(null);
        }
    };

    const handleCloseDeleteConfirmation = () => {
        setIsConfirmDeleteModalOpen(false);
        setCityToDelete(null);
    };


    const handleOpenAddCity = () => {
        setSelectedCity(null);
        setIsEditing(false);
        setIsModalOpen(true);
    };

    const handleOpenEditCity = (city) => {
        setSelectedCity(city);
        setIsEditing(true);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
    };

    const commonListProps = {
        cities,
        loading,
        t,
        handleOpenEditCity,
        handleToggleCityStatus,
        handleOpenDeleteConfirmation,
        setSelectedCity,
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
                    <Avatar sx={{ bgcolor: 'primary.light', color: 'white', width: 45, height: 45, borderRadius: 2 }}><LocationCityIcon /></Avatar>
                    <Box>
                        <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1.2 }}>{t('cities')}</Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ display: { xs: 'none', sm: 'block' } }}>
                            {t('cities_description')}
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
                        onClick={handleOpenAddCity}
                        sx={{ whiteSpace: 'nowrap', ml: 1 }}
                    >
                        {t('add')}
                    </Button>
                </Box>
            </Paper>

            {loading && <LinearProgress sx={{ mb: 2, borderRadius: 1 }} />}

            {isSmallScreen ? <CityCardList {...commonListProps} /> : <CityListTable {...commonListProps} />}

            <TablePagination
                rowsPerPageOptions={[5, 10, 25]}
                component="div"
                count={totalCities}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handlePageChange}
                onRowsPerPageChange={handleRowsPerPageChange}
                labelRowsPerPage={t('rows_perPage')}
                labelDisplayedRows={({ from, to, count }) =>
                    `${from}-${to} ${t('of')} ${count !== -1 ? count : `${t('moreThan')} ${to}`}`
                }
            />

            <CityFormModal
                open={isModalOpen}
                handleClose={handleCloseModal}
                data={selectedCity}
                isEditing={isEditing}
                setData={setCities}
            />

            <ConfirmationModal
                open={isConfirmDeleteModalOpen}
                onClose={handleCloseDeleteConfirmation}
                onConfirm={handleDeleteCity}
                title={t('city_delete')}
                message={t('question_areYouSureDeleteCity', { cityName: cityToDelete?.description || '' })}
                confirmText={t('delete')}
                cancelText={t('cancel')}
                type="danger"
            />
        </Box>
    );
}

export default Index;