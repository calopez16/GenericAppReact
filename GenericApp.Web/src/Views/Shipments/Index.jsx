import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Box, Typography, TextField, InputAdornment, Button,
    TablePagination, useMediaQuery, useTheme, LinearProgress
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import { dataApiShipmentsService } from '@data/Shipments/Data';
import { dataApiManifestsService } from '@data/Manifests/Data';
import { useTranslation } from 'react-i18next';
import { ShowMessage } from '@helpers/NotificationService';
import ConfirmationModal from '@layout/ConfirmationModal';
import ShipmentCardList from './ShipmentCardList';
import ShipmentListTable from './ShipmentTableList';

function ShipmentsIndex() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const shipmentDataService = dataApiShipmentsService();
    const manifestDataService = dataApiManifestsService();

    const [shipments, setShipments] = useState([]);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(5);
    const [totalShipments, setTotalShipments] = useState(0);
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(searchTerm);
    const [loading, setLoading] = useState(true);
    const [isConfirmDeleteModalOpen, setIsConfirmDeleteModalOpen] = useState(false);
    const [shipmentToDelete, setShipmentToDelete] = useState(null);

    const theme = useTheme();
    const isSmallScreen = useMediaQuery(theme.breakpoints.down('xl'));

    useEffect(() => {
        const timerId = setTimeout(() => setDebouncedSearchTerm(searchTerm), 500);
        return () => clearTimeout(timerId);
    }, [searchTerm]);

    useEffect(() => {
        const loadShipments = async () => {
            try {
                setLoading(true);
                const response = await manifestDataService.getDataPagination(page + 1, rowsPerPage, debouncedSearchTerm);
                if (response.data) {
                    setShipments(response.data.data || []);
                    setTotalShipments(response.data.totalCount || 0);
                }
            } catch (error) {
                ShowMessage(t('error_fetching_data'), 'error');
            } finally {
                setLoading(false);
            }
        };
        loadShipments();
    }, [page, rowsPerPage, debouncedSearchTerm]);

    const handleViewDetails = (shipment) => navigate(`/shipments/details/${shipment.idShipment}`);
    const handleExportDocument = (shipment) => {
        ShowMessage(t('exporting_document'), 'info');
        // Lógica de exportación aquí
    };
    const handleOpenAddShipment = () => navigate('/shipments/add');
    const handleOpenEditShipment = (shipment) => navigate(`/shipments/edit/${shipment.idShipment}`);

    const handleOpenDeleteConfirmation = (shipment) => {
        setShipmentToDelete(shipment);
        setIsConfirmDeleteModalOpen(true);
    };

    const handleDeleteShipment = async () => {
        if (!shipmentToDelete) return;
        try {
            const res = await shipmentDataService.deleteData(shipmentToDelete.idShipment);
            if (res.isSuccess || res.success) {
                ShowMessage(t('recordDeleted'), 'success');
                setShipments(prev => prev.filter(s => s.idShipment !== shipmentToDelete.idShipment));
            }
        } catch (error) {
            ShowMessage(t('error'), 'error');
        } finally {
            setIsConfirmDeleteModalOpen(false);
            setShipmentToDelete(null);
        }
    };

    const commonListProps = {
        shipments, loading, t,
        handleOpenEditShipment,
        handleDeleteShipment: handleOpenDeleteConfirmation,
        handleViewDetails,
        handleExportDocument
    };

    return (
        <Box sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', flexDirection: isSmallScreen ? 'column' : 'row', justifyContent: 'space-between', mb: 2, gap: 2 }}>
                <Typography variant="h4">{t('Shipments')}</Typography>
                <Box sx={{ display: 'flex', gap: 1, flexGrow: 1, justifyContent: 'flex-end' }}>
                    <TextField
                        size="small"
                        placeholder={t('search')}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment> }}
                    />
                    <Button variant="contained" startIcon={<AddIcon />} onClick={handleOpenAddShipment}>{t('add')}</Button>
                </Box>
            </Box>

            {loading && <LinearProgress sx={{ mb: 2 }} />}

            {isSmallScreen ? <ShipmentCardList {...commonListProps} /> : <ShipmentListTable {...commonListProps} />}

            <TablePagination
                component="div"
                count={totalShipments}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={(e, p) => setPage(p)}
                onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
            />

            <ConfirmationModal
                open={isConfirmDeleteModalOpen}
                onClose={() => setIsConfirmDeleteModalOpen(false)}
                onConfirm={handleDeleteShipment}
                title={t('Delete Shipment')}
                message={t('question_areYouSureDeleteRecord', { name: shipmentToDelete?.idShipment })}
            />
        </Box>
    );
}

export default ShipmentsIndex;