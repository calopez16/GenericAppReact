import React, { useState, useEffect, useContext } from 'react';
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
import { AppContext } from '@helpers/AppContext';

function ShipmentsIndex() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const shipmentDataService = dataApiShipmentsService();
    const manifestDataService = dataApiManifestsService();
    const { setLoading, companySelected } = useContext(AppContext);

    const [shipments, setShipments] = useState([]);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(5);
    const [totalShipments, setTotalShipments] = useState(0);
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(searchTerm);
    const [pageLoading, setPageLoading] = useState(true);
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
                setPageLoading(true);
                const response = await manifestDataService.getDataCompanyPagination(companySelected.idCompany, page + 1, rowsPerPage, debouncedSearchTerm);
                if (response.data) {
                    setShipments(response.data.data || []);
                    setTotalShipments(response.data.totalCount || 0);
                }
            } catch (error) {
                ShowMessage(t('error'), 'error');
            } finally {
                setPageLoading(false);
            }
        };
        loadShipments();
    }, [page, rowsPerPage, debouncedSearchTerm,companySelected]);

    const handleViewDetails = (shipment) => navigate(`/shipments/details/${shipment.idShipment}`);

    const handleExportManifest = async (shipment) => {
        try {
            setLoading(true);
            ShowMessage(`${t('exportingManifest')}...`, 'info');
            // 1. Llamada al servicio
            // Asumimos que getManifestPdfById está configurado en axios con responseType: 'blob' o 'arraybuffer'
            const response = await shipmentDataService.getManifestPdfById(shipment.idShipment);

            // 2. Validar y Crear el Blob
            // Algunos servicios devuelven el archivo en 'response.data', otros directamente en 'response'.
            // Ajusta esto según tu configuración de Axios.
            const fileData = response.data ? response.data : response;

            const blob = new Blob([fileData], { type: 'application/pdf' });

            // 3. Crear URL temporal y abrir en nueva pestaña
            const pdfUrl = window.URL.createObjectURL(blob);
            window.open(pdfUrl, '_blank');

        } catch (error) {
            console.error("Error exportando manifiesto:", error);
            ShowMessage(t('error'), 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleExportRemision = async (shipment) => {
        try {
            setLoading(true);
            ShowMessage(`${t('exportingRemision')}...`, 'info');
            // 1. Llamada al servicio
            // Asumimos que getManifestPdfById está configurado en axios con responseType: 'blob' o 'arraybuffer'
            const response = await shipmentDataService.getRemisionPdfById(shipment.idShipment);

            // 2. Validar y Crear el Blob
            // Algunos servicios devuelven el archivo en 'response.data', otros directamente en 'response'.
            // Ajusta esto según tu configuración de Axios.
            const fileData = response.data ? response.data : response;

            const blob = new Blob([fileData], { type: 'application/pdf' });

            // 3. Crear URL temporal y abrir en nueva pestaña
            const pdfUrl = window.URL.createObjectURL(blob);
            window.open(pdfUrl, '_blank');

        } catch (error) {
            console.error("Error exportando manifiesto:", error);
            ShowMessage(t('error'), 'error');
        } finally {
            setLoading(false);
        }
    };
    // ---------------------------------------

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
        shipments, pageLoading, t,
        handleOpenEditShipment,
        handleDeleteShipment: handleOpenDeleteConfirmation,
        handleViewDetails,
        // Pasamos las dos nuevas funciones en lugar de la genérica
        handleExportManifest,
        handleExportRemision
    };

    return (
        <Box sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', flexDirection: isSmallScreen ? 'column' : 'row', justifyContent: 'space-between', mb: 2, gap: 2 }}>
                <Typography variant="h4">{t('shipments')}</Typography>
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

            {pageLoading && <LinearProgress sx={{ mb: 2 }} />}

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
                title={t('deleteManifest')}
                message={t('question_areYouSureDeleteManifest', { manifestNumber: shipmentToDelete?.idShipment })}
            />
        </Box>
    );
}

export default ShipmentsIndex;