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
import { DataAPILabelsService } from '@data/Labels/Data'; // CAMBIO: Importar servicio de Labels
import { useTranslation } from 'react-i18next';
import { ShowMessage } from '@helpers/NotificationService';
import ConfirmationModal from '@layout/ConfirmationModal';
import LabelFormModal from './LabelFormModal'; // CAMBIO: Importar LabelFormModal
import LabelCardList from './LabelCardList'; // CAMBIO: Importar LabelCardList
import LabelListTable from './LabelTableList'; // CAMBIO: Importar LabelListTable


function Index() {
    const { t } = useTranslation();
    const labelDataService = DataAPILabelsService(); // CAMBIO: Servicio de Labels
    const [labels, setLabels] = useState([]); // CAMBIO: drivers -> labels
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [totalLabels, setTotalLabels] = useState(0); // CAMBIO: Drivers -> Labels

    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(searchTerm);

    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedLabel, setSelectedLabel] = useState(null); // CAMBIO: selectedDriver -> selectedLabel
    const [isEditing, setIsEditing] = useState(false);

    const [isConfirmDeleteModalOpen, setIsConfirmDeleteModalOpen] = useState(false);
    const [labelToDelete, setLabelToDelete] = useState(null); // CAMBIO: driverToDelete -> labelToDelete

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
        const loadLabels = async () => { // CAMBIO: loadDrivers -> loadLabels
            try {
                setLoading(true);
                const response = await labelDataService.getDataPagination(page + 1, rowsPerPage, debouncedSearchTerm);
                setLabels(response.data.data); // CAMBIO: setDrivers -> setLabels
                setTotalLabels(response.data.totalCount); // CAMBIO: setTotalDrivers -> setTotalLabels
            } catch (error) {
                console.error("Error loading labels:", error); // CAMBIO: drivers -> labels
            } finally {
                setLoading(false);
            }
        };

        loadLabels(); // CAMBIO: loadDrivers -> loadLabels
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

    const handleToggleLabelStatus = async (label) => { // CAMBIO: Driver -> Label
        const isActiveNow = label.isActive;

        try {
            let dataResult;
            if (isActiveNow) {
                dataResult = await labelDataService.disableData(label.idLabel); // CAMBIO: idDriver -> idLabel
                if (dataResult.success) {
                    ShowMessage(t('recordDisabled'), 'success');
                }
            } else {
                dataResult = await labelDataService.enableData(label.idLabel); // CAMBIO: idDriver -> idLabel
                if (dataResult.success) {
                    ShowMessage(t('recordEnabled'), 'success');
                }
            }

            if (dataResult.success) {
                setLabels(prevLabels => // CAMBIO: setDrivers -> setLabels
                    prevLabels.map(u =>
                        u.idLabel === label.idLabel ? { ...u, isActive: !isActiveNow } : u // CAMBIO: idDriver -> idLabel
                    )
                );
            }
        } catch (error) {
            ShowMessage(t('error'), 'error');
            console.error("Error toggling label status:", error); // CAMBIO: driver -> label
        }
    };

    const handleOpenDeleteConfirmation = (label) => { // CAMBIO: Driver -> Label
        setLabelToDelete(label); // CAMBIO: setDriverToDelete -> setLabelToDelete
        setIsConfirmDeleteModalOpen(true);
    };

    const handleDeleteLabel = async () => { // CAMBIO: handleDeleteDriver -> handleDeleteLabel
        setIsConfirmDeleteModalOpen(false);

        if (!labelToDelete) return; // CAMBIO: driverToDelete -> labelToDelete

        try {
            setLoading(true);

            const dataResult = await labelDataService.deleteData(labelToDelete.idLabel); // CAMBIO: idDriver -> idLabel

            if (dataResult.success) {
                ShowMessage(t('recordDeleted'), 'success');
                setLabels(prevLabels => prevLabels.filter(c => c.idLabel !== labelToDelete.idLabel)); // CAMBIO: idDriver -> idLabel
                setPage(0);
            } else {
                ShowMessage(dataResult.message || t('errorDeletingRecord'), 'error');
            }
        } catch (error) {
            ShowMessage(t('error'), 'error');
            console.error("Error deleting label:", error); // CAMBIO: driver -> label
        } finally {
            setLabelToDelete(null); // CAMBIO: setDriverToDelete -> setLabelToDelete
            setLoading(false);
        }
    };

    const handleCloseDeleteConfirmation = () => {
        setIsConfirmDeleteModalOpen(false);
        setLabelToDelete(null); // CAMBIO: setDriverToDelete -> setLabelToDelete
    };


    const handleOpenAddLabel = () => { // CAMBIO: Driver -> Label
        setSelectedLabel(null); // CAMBIO: setSelectedDriver -> setSelectedLabel
        setIsEditing(false);
        setIsModalOpen(true);
    };

    const handleOpenEditLabel = (label) => { // CAMBIO: Driver -> Label
        setSelectedLabel(label); // CAMBIO: setSelectedDriver -> setSelectedLabel
        setIsEditing(true);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
    };

    const commonListProps = {
        labels: labels, // CAMBIO: drivers -> labels
        loading,
        t,
        handleOpenEditLabel: handleOpenEditLabel, // CAMBIO: Driver -> Label
        handleToggleLabelStatus: handleToggleLabelStatus, // CAMBIO: Driver -> Label
        handleOpenDeleteConfirmation,
        setSelectedLabel: setSelectedLabel // CAMBIO: setSelectedDriver -> setSelectedLabel
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
                        onClick={handleOpenAddLabel} // CAMBIO: Driver -> Label
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
                count={totalLabels} // CAMBIO: totalDrivers -> totalLabels
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handlePageChange}
                onRowsPerPageChange={handleRowsPerPageChange}
                labelRowsPerPage={t('rows_perPage')}
                labelDisplayedRows={({ from, to, count }) =>
                    `${from}-${to} ${t('of')} ${count !== -1 ? count : `${t('moreThan')} ${to}`}`
                }
            />

            <LabelFormModal // CAMBIO: Componente Label
                open={isModalOpen}
                handleClose={handleCloseModal}
                data={selectedLabel} // CAMBIO: selectedDriver -> selectedLabel
                isEditing={isEditing}
                setData={setLabels} // CAMBIO: setDrivers -> setLabels
            />

            <ConfirmationModal
                open={isConfirmDeleteModalOpen}
                onClose={handleCloseDeleteConfirmation}
                onConfirm={handleDeleteLabel} // CAMBIO: handleDeleteDriver -> handleDeleteLabel
                title={t('deleteLabel')} // CAMBIO: Driver -> Label
                message={t('question_areYouSureDeleteLabel', { labelName: labelToDelete?.description || '' })} // CAMBIO: driverToDelete?.description
                confirmText={t('delete')}
                cancelText={t('cancel')}
            />
        </Box>
    );
}

export default Index;