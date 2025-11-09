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
import { DataAPISeasonsService } from '@data/Seasons/Data';
import { useTranslation } from 'react-i18next';
import { ShowMessage } from '@helpers/NotificationService';
import ConfirmationModal from '@layout/ConfirmationModal';
import SeasonFormModal from '@views/Seasons/SeasonFormModal';
import SeasonCardList from '@views/Seasons/SeasonCardList';
import SeasonListTable from '@views/Seasons/SeasonTableList';

// Importar los componentes necesarios para el DatePicker de MUI X
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';

function Index() {
    const { t } = useTranslation();
    const clientDataService = DataAPISeasonsService();
    const [seasons, setSeasons] = useState([]);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [totalSeasons, setTotalSeasons] = useState(0);

    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(searchTerm);

    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedSeason, setSelectedSeason] = useState(null);
    const [isEditing, setIsEditing] = useState(false);

    const [isConfirmDeleteModalOpen, setIsConfirmDeleteModalOpen] = useState(false);
    const [clientToDelete, setSeasonToDelete] = useState(null);

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
        const loadSeasons = async () => {
            try {
                setLoading(true);
                const response = await clientDataService.getDataPagination(page + 1, rowsPerPage, debouncedSearchTerm);
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

    const handleToggleSeasonStatus = async (client) => {
        const isActiveNow = client.isActive;

        try {
            let dataResult;
            if (isActiveNow) {
                dataResult = await clientDataService.disableData(client.idSeason);
                if (dataResult.success) {
                    ShowMessage(t('recordDisabled'), 'success');
                }
            } else {
                dataResult = await clientDataService.enableData(client.idSeason);
                if (dataResult.success) {
                    ShowMessage(t('recordEnabled'), 'success');
                }
            }

            if (dataResult.success) {
                setSeasons(prevSeasons =>
                    prevSeasons.map(u =>
                        u.idSeason === client.idSeason ? { ...u, isActive: !isActiveNow } : u
                    )
                );
            }
        } catch (error) {
            ShowMessage(t('error'), 'error');
            console.error("Error toggling client status:", error);
        }
    };

    const handleOpenDeleteConfirmation = (client) => {
        setSeasonToDelete(client);
        setIsConfirmDeleteModalOpen(true);
    };

    const handleDeleteSeason = async () => {
        setIsConfirmDeleteModalOpen(false);

        if (!clientToDelete) return;

        try {
            setLoading(true);

            const dataResult = await clientDataService.deleteData(clientToDelete.idSeason);

            if (dataResult.success) {
                ShowMessage(t('recordDeleted'), 'success');
                setSeasons(prevSeasons => prevSeasons.filter(c => c.idSeason !== clientToDelete.idSeason));
                setPage(0);
            } else {
                ShowMessage(dataResult.message || t('errorDeletingRecord'), 'error');
            }
        } catch (error) {
            ShowMessage(t('error'), 'error');
            console.error("Error deleting client:", error);
        } finally {
            setSeasonToDelete(null);
            setLoading(false);
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

    const handleOpenEditSeason = (client) => {
        setSelectedSeason(client);
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
        setSelectedSeason
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
                    {t('seasons')}
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
                        onClick={handleOpenAddSeason}
                        fullWidth={isSmallScreen}
                    >
                        {t('add')}
                    </Button>
                </Box>
            </Box>

            {loading && <LinearProgress />}

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

            {/* SOLUCIÓN: Envolver el modal con LocalizationProvider */}
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
                title={t('deleteSeason')}
                message={t('question_areYouSureDeleteSeason', { clientName: clientToDelete?.description || '' })}
                confirmText={t('delete')}
                cancelText={t('cancel')}
            />
        </Box>
    );
}

export default Index;