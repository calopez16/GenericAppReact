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
import { DataAPILabelsService } from '@data/Labels/Data';
import { useTranslation } from 'react-i18next';
import { ShowMessage } from '@helpers/NotificationService';
import ConfirmationModal from '@layout/ConfirmationModal';
import LabelFormModal from '@views/Labels/LabelFormModal';
import LabelCardList from '@views/Labels/LabelCardList';
import LabelListTable from '@views/Labels/LabelTableList';

function Index() {
    const { t } = useTranslation();
    const labelDataService = DataAPILabelsService();
    const [labels, setLabels] = useState([]);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [totalLabels, setTotalLabels] = useState(0);

    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(searchTerm);

    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedLabel, setSelectedLabel] = useState(null);
    const [isEditing, setIsEditing] = useState(false);

    const [isConfirmDeleteModalOpen, setIsConfirmDeleteModalOpen] = useState(false);
    const [labelToDelete, setLabelToDelete] = useState(null);

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
        const loadLabels = async () => {
            try {
                setLoading(true);
                const response = await labelDataService.getDataPagination(page + 1, rowsPerPage, debouncedSearchTerm);
                setLabels(response.data.data);
                setTotalLabels(response.data.totalCount);
            } catch (error) {
                console.error("Error loading labels:", error);
            } finally {
                setLoading(false);
            }
        };

        loadLabels();
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

    const handleToggleLabelStatus = async (label) => {
        const isActiveNow = label.isActive;

        try {
            let dataResult;
            if (isActiveNow) {
                dataResult = await labelDataService.disableData(label.idLabel);
                if (dataResult.success) {
                    ShowMessage(t('recordDisabled'), 'success');
                }
            } else {
                dataResult = await labelDataService.enableData(label.idLabel);
                if (dataResult.success) {
                    ShowMessage(t('recordEnabled'), 'success');
                }
            }

            if (dataResult.success) {
                setLabels(prevLabels =>
                    prevLabels.map(u =>
                        u.idLabel === label.idLabel ? { ...u, isActive: !isActiveNow } : u
                    )
                );
            }
        } catch (error) {
            ShowMessage(t('error'), 'error');
            console.error("Error toggling label status:", error);
        }
    };

    const handleOpenDeleteConfirmation = (label) => {
        setLabelToDelete(label);
        setIsConfirmDeleteModalOpen(true);
    };

    const handleDeleteLabel = async () => {
        setIsConfirmDeleteModalOpen(false);

        if (!labelToDelete) return;

        const idToDelete = labelToDelete.idLabel;

        try {
            setDeletingId(idToDelete);

            const dataResult = await labelDataService.deleteData(idToDelete);

            if (dataResult.success) {
                ShowMessage(t('recordDeleted'), 'success');

                setTimeout(() => {
                    setLabels(prevLabels => prevLabels.filter(c => c.idLabel !== idToDelete));
                    setDeletingId(null);
                    setPage(0);
                }, ANIMATION_DURATION);

            } else {
                ShowMessage(dataResult.message || t('errorDeletingRecord'), 'error');
                setDeletingId(null);
            }
        } catch (error) {
            ShowMessage(t('error'), 'error');
            console.error("Error deleting label:", error);
            setDeletingId(null);
        } finally {
            setLabelToDelete(null);
        }
    };

    const handleCloseDeleteConfirmation = () => {
        setIsConfirmDeleteModalOpen(false);
        setLabelToDelete(null);
    };


    const handleOpenAddLabel = () => {
        setSelectedLabel(null);
        setIsEditing(false);
        setIsModalOpen(true);
    };

    const handleOpenEditLabel = (label) => {
        setSelectedLabel(label);
        setIsEditing(true);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
    };

    const commonListProps = {
        labels: labels,
        loading,
        t,
        handleOpenEditLabel: handleOpenEditLabel,
        handleToggleLabelStatus: handleToggleLabelStatus,
        handleOpenDeleteConfirmation,
        setSelectedLabel: setSelectedLabel,
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
                    {t('labels')}
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
                        onClick={handleOpenAddLabel}
                        fullWidth={isSmallScreen}
                    >
                        {t('add')}
                    </Button>
                </Box>
            </Box>

            {loading && <LinearProgress />}

            {isSmallScreen ? (
                <LabelCardList {...commonListProps} />
            ) : (
                <LabelListTable {...commonListProps} />
            )}

            <TablePagination
                rowsPerPageOptions={[5, 10, 25]}
                component="div"
                count={totalLabels}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handlePageChange}
                onRowsPerPageChange={handleRowsPerPageChange}
                labelRowsPerPage={t('rows_perPage')}
                labelDisplayedRows={({ from, to, count }) =>
                    `${from}-${to} ${t('of')} ${count !== -1 ? count : `${t('moreThan')} ${to}`}`
                }
            />

            <LabelFormModal
                open={isModalOpen}
                handleClose={handleCloseModal}
                data={selectedLabel}
                isEditing={isEditing}
                setData={setLabels}
            />

            <ConfirmationModal
                open={isConfirmDeleteModalOpen}
                onClose={handleCloseDeleteConfirmation}
                onConfirm={handleDeleteLabel}
                title={t('label_delete')}
                message={t('question_areYouSureDeleteLabel', { labelName: labelToDelete?.description || '' })}
                confirmText={t('delete')}
                cancelText={t('cancel')}
            />
        </Box>
    );
}

export default Index;