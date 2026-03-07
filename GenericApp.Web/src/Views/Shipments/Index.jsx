import React, { useState, useEffect, useContext, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Box, Typography, TextField, Button,
    TablePagination, useMediaQuery, useTheme, LinearProgress,
    Paper, Avatar, IconButton, ClickAwayListener, Tooltip
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
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
    const [isSearchExpanded, setIsSearchExpanded] = useState(false);
    const searchInputRef = useRef(null);
    const [pageLoading, setPageLoading] = useState(true);
    const [isConfirmDeleteModalOpen, setIsConfirmDeleteModalOpen] = useState(false);
    const [shipmentToDelete, setShipmentToDelete] = useState(null);
    const [isBitacoraModalOpen, setIsBitacoraModalOpen] = useState(false);
    const [selectedShipmentForBitacora, setSelectedShipmentForBitacora] = useState(null);
    const [closingTime, setClosingTime] = useState("");
    const [closingTimeError, setClosingTimeError] = useState(false);

    const theme = useTheme();
    const isSmallScreen = useMediaQuery(theme.breakpoints.down('md'));

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

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
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

    const handleExportBitacora = async () => {
        if (!closingTime) {
            setClosingTimeError(true);
            return;
        }
        try {
            setLoading(true);
            ShowMessage(`${t('exportingBitacora')}...`, 'info');
            const response = await shipmentDataService.getBitacoraSellosPdfById(selectedShipmentForBitacora.idShipment, closingTime);
            const fileData = response.data ? response.data : response;
            const blob = new Blob([fileData], { type: 'application/pdf' });
            const pdfUrl = window.URL.createObjectURL(blob);
            window.open(pdfUrl, '_blank');
            setIsBitacoraModalOpen(false);
            setClosingTime("");
            setClosingTimeError(false);
        } catch (error) {
            ShowMessage(t('error'), 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleOpenBitacoraModal = (shipment) => {
        setSelectedShipmentForBitacora(shipment);
        setIsBitacoraModalOpen(true);
    };

    const commonListProps = {
        shipments, pageLoading, t,
        handleOpenEditShipment,
        handleDeleteShipment: handleOpenDeleteConfirmation,
        handleViewDetails,
        handleExportManifest,
        handleExportRemision,
        handleOpenBitacoraModal,
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
                        <LocalShippingIcon />
                    </Avatar>
                    <Box>
                        <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1.2 }}>{t('shipments')}</Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ display: { xs: 'none', sm: 'block' } }}>
                            {t('shipments_description')}
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
                            width: isSearchExpanded ? (isSmallScreen ? '100%' : '300px') : '42px',
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
                        onClick={handleOpenAddShipment}
                        sx={{ whiteSpace: 'nowrap', ml: 1 }}
                    >
                        {t('add')}
                    </Button>
                </Box>
            </Paper>

            {pageLoading && <LinearProgress sx={{ mb: 2, borderRadius: 1 }} />}

            {isSmallScreen ? <ShipmentCardList {...commonListProps} /> : <ShipmentListTable {...commonListProps} />}

            <TablePagination
                rowsPerPageOptions={[5, 10, 25]}
                component="div"
                count={totalShipments}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={(e, p) => setPage(p)}
                onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
                labelRowsPerPage={t('rows_perPage')}
                labelDisplayedRows={({ from, to, count }) =>
                    `${from}-${to} ${t('of')} ${count !== -1 ? count : `${t('moreThan')} ${to}`}`
                }
            />

            <ConfirmationModal
                open={isConfirmDeleteModalOpen}
                onClose={() => setIsConfirmDeleteModalOpen(false)}
                onConfirm={handleDeleteShipment}
                title={t('deleteManifest')}
                message={t('question_areYouSureDeleteManifest', { manifestNumber: shipmentToDelete?.idShipment })}
                confirmText={t('delete')}
                cancelText={t('cancel')}
                type="danger"
            />

            <ConfirmationModal
                open={isBitacoraModalOpen}
                onClose={() => {
                    setIsBitacoraModalOpen(false);
                    setClosingTimeError(false); // Limpiar error al cerrar
                }}
                onConfirm={handleExportBitacora}
                title={t('generateBitacora')}
                message={
                    <Box sx={{ mt: 2 }}>
                        <Typography variant="body2" sx={{ mb: 2 }}>
                            {t('enterClosingTimeBitacora')}
                        </Typography>
                        <TextField
                            fullWidth
                            label={t('closingTime')}
                            type="time"
                            value={closingTime}
                            error={closingTimeError} // Activa el borde rojo
                            helperText={closingTimeError ? t('field_required') : ''} // Texto descriptivo en rojo
                            onChange={(e) => {
                                setClosingTime(e.target.value);
                                if (e.target.value) setClosingTimeError(false); // Quita el rojo al escribir
                            }}
                            InputLabelProps={{ shrink: true }}
                            inputProps={{ step: 300 }}
                        />
                    </Box>
                }
                confirmText={t('generate')}
            />
        </Box>
    );
}

export default ShipmentsIndex;