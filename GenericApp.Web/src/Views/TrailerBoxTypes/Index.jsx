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

    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedTrailerBoxType, setSelectedTrailerBoxType] = useState(null);
    const [isEditing, setIsEditing] = useState(false);

    const [isConfirmDeleteModalOpen, setIsConfirmDeleteModalOpen] = useState(false);
    const [trailerBoxTypeToDelete, setTrailerBoxTypeToDelete] = useState(null);

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
        const loadTrailerBoxTypes = async () => {
            try {
                setLoading(true);
                const response = await trailerBoxTypeDataService.getDataPagination(page + 1, rowsPerPage, debouncedSearchTerm);
                setTrailerBoxTypes(response.data.data);
                setTotalTrailerBoxTypes(response.data.totalCount);
            } catch (error) {
                console.error("Error loading trailerBoxTypes:", error);
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

    const handleSetTrailerBoxTypes = (data) => {
        setTrailerBoxTypes(data);
    };

    const commonListProps = {
        trailerBoxTypes,
        loading,
        t,
        handleOpenEditTrailerBoxType,
        handleToggleTrailerBoxTypeStatus,
        handleOpenDeleteConfirmation,
        setSelectedTrailerBoxType,
        deletingId
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
                    {t('trailerBoxTypes')}
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
                        onClick={handleOpenAddTrailerBoxType}
                        fullWidth={isSmallScreen}
                    >
                        {t('add')}
                    </Button>
                </Box>
            </Box>

            {loading && <LinearProgress />}

            {isSmallScreen ? (
                <TrailerBoxTypeCardList {...commonListProps} />
            ) : (
                <TrailerBoxTypeListTable {...commonListProps} />
            )}

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
                message={t('question_areYouSureDeleteTrailerBoxType', { trailerBoxType : trailerBoxTypeToDelete?.description || '' })}
                confirmText={t('delete')}
                cancelText={t('cancel')}
            />
        </Box>
    );
}

export default Index;