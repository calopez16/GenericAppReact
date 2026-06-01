import React, { useState, useRef, useCallback } from 'react';
import {
    Dialog, DialogTitle, DialogContent, DialogActions,
    Button, Box, Typography, IconButton, Divider, TextField,
    LinearProgress, Paper, Table, TableBody, TableCell,
    TableContainer, TableHead, TableRow, Chip, Tooltip
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import TableViewIcon from '@mui/icons-material/TableView';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { useTranslation } from 'react-i18next';
import { ShowMessage } from '@helpers/NotificationService';
import { DataAPIEmployeesService } from '@data/Employees/Data';

const PREVIEW_COLUMNS = [
    { key: 'rowNumber', label: '#Fila', width: 60 },
    { key: 'clave', label: 'Clave' },
    { key: 'apellidoPaterno', label: 'Paterno' },
    { key: 'apellidoMaterno', label: 'Materno' },
    { key: 'nombre', label: 'Nombre' },
    { key: 'rfc', label: 'RFC' },
    { key: 'curp', label: 'CURP' },
    { key: 'imss', label: 'IMSS' },
    { key: 'sexo', label: 'Sexo' },
    { key: 'puesto', label: 'Puesto' },
    { key: 'estadoCivil', label: 'Edo. Civil' },
    { key: 'fechaNacimiento', label: 'F. Nacimiento' },
    { key: 'fechaIngreso', label: 'F. Ingreso' },
    { key: 'salarioDiario', label: 'Sal. Diario' },
    { key: 'salarioIntegrado', label: 'Sal. Integrado' },
    { key: 'formaDePago', label: 'Forma Pago' },
    { key: 'direccion', label: 'Dirección' },
    { key: 'ciudad', label: 'Ciudad' },
    { key: 'estado', label: 'Estado' },
    { key: 'codigoPostal', label: 'C.P.' },
    { key: 'correoElectronico', label: 'Correo' },
    { key: 'celularTrabajador', label: 'Celular' },
    { key: 'beneficiario1', label: 'Beneficiario 1' },
    { key: 'parentesco1', label: 'Parentesco 1' },
    { key: 'porcentaje1', label: '%1' },
    { key: 'beneficiario2', label: 'Beneficiario 2' },
    { key: 'parentesco2', label: 'Parentesco 2' },
    { key: 'porcentaje2', label: '%2' },
    { key: 'beneficiario3', label: 'Beneficiario 3' },
    { key: 'parentesco3', label: 'Parentesco 3' },
    { key: 'porcentaje3', label: '%3' },
    { key: 'contactoEmergencia', label: 'Contacto Emerg.' },
    { key: 'parentescoContacto', label: 'Parentesco Emerg.' },
    { key: 'celularContacto', label: 'Cel. Emerg.' },
    { key: 'fechaInicioContrato', label: 'Inicio Contrato' },
    { key: 'fechaVencimientoContrato', label: 'Venc. Contrato' },
];

const EmployeeExcelModal = ({ open, handleClose }) => {
    const { t } = useTranslation();
    const service = DataAPIEmployeesService();
    const fileInputRef = useRef(null);

    const [file, setFile] = useState(null);
    const [dataStartRow, setDataStartRow] = useState(2);
    const [dragging, setDragging] = useState(false);
    const [loading, setLoading] = useState(false);
    const [previewData, setPreviewData] = useState(null);

    const handleUpload = async (selectedFile, startRow) => {
        if (!selectedFile) return;
        setLoading(true);
        try {
            const formData = new FormData();
            formData.append('file', selectedFile);
            formData.append('dataStartRow', startRow);
            const result = await service.uploadExcel(formData);
            if (result?.success !== false && result?.data) {
                setPreviewData(result.data);
                if (!result.data.length) ShowMessage(t('excel_noRows'), 'info');
            } else {
                ShowMessage(t('error'), 'error');
            }
        } catch {
            ShowMessage(t('error'), 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleFileSelect = (selectedFile) => {
        if (!selectedFile) return;
        const ext = selectedFile.name.split('.').pop().toLowerCase();
        if (!['xlsx', 'xls'].includes(ext)) {
            ShowMessage(t('excel_invalidFile'), 'warning');
            return;
        }
        setFile(selectedFile);
        setPreviewData(null);
        handleUpload(selectedFile, dataStartRow);
    };

    const handleDrop = useCallback((e) => {
        e.preventDefault();
        setDragging(false);
        const dropped = e.dataTransfer.files[0];
        if (dropped) handleFileSelect(dropped);
    }, [dataStartRow]);

    const handleDragOver = (e) => { e.preventDefault(); setDragging(true); };
    const handleDragLeave = () => setDragging(false);

    const handleReset = () => {
        setFile(null);
        setPreviewData(null);
        setDataStartRow(2);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const handleModalClose = () => {
        handleReset();
        handleClose();
    };

    return (
        <Dialog open={open} onClose={handleModalClose} fullScreen>
            <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pb: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <TableViewIcon color="primary" />
                    <Typography variant="h6" sx={{ fontWeight: 700 }}>
                        {t('excel_loadTitle')}
                    </Typography>
                    {previewData && (
                        <Chip
                            size="small"
                            color="success"
                            icon={<CheckCircleIcon />}
                            label={`${previewData.length} ${t('excel_rowsFound')}`}
                        />
                    )}
                </Box>
                <IconButton onClick={handleModalClose} size="small"><CloseIcon /></IconButton>
            </DialogTitle>
            <Divider />

            <DialogContent>
                {/* Upload zone */}
                {!previewData && (
                    <Box sx={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 130px)', gap: 2 }}>
                        {/* Data start row field at top */}
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, pt: 1 }}>
                            <TextField
                                label={t('excel_dataStartRow')}
                                type="number"
                                size="small"
                                value={dataStartRow}
                                onChange={e => setDataStartRow(Math.max(1, parseInt(e.target.value) || 1))}
                                inputProps={{ min: 1 }}
                                sx={{ width: 180 }}
                                helperText={t('excel_dataStartRowHint')}
                            />
                        </Box>

                        {loading && <LinearProgress sx={{ borderRadius: 1 }} />}

                        {/* Drop zone – fills remaining space */}
                        <Paper
                            elevation={0}
                            onDrop={handleDrop}
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            onClick={() => !loading && fileInputRef.current?.click()}
                            sx={{
                                flex: 1,
                                border: '2px dashed',
                                borderColor: dragging ? 'primary.main' : 'divider',
                                borderRadius: 3,
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                textAlign: 'center',
                                cursor: loading ? 'default' : 'pointer',
                                bgcolor: dragging ? 'action.hover' : 'background.paper',
                                transition: 'all 0.2s ease',
                                '&:hover': !loading ? { borderColor: 'primary.main', bgcolor: 'action.hover' } : {}
                            }}
                        >
                            <UploadFileIcon sx={{ fontSize: 80, color: dragging ? 'primary.main' : 'text.disabled', mb: 2 }} />
                            <Typography variant="h6" fontWeight={600} color={dragging ? 'primary.main' : 'text.secondary'}>
                                {file ? file.name : t('excel_dropZone')}
                            </Typography>
                            <Typography variant="body2" color="text.disabled" sx={{ mt: 0.5 }}>
                                {file ? `${(file.size / 1024).toFixed(1)} KB` : t('excel_dropZoneHint')}
                            </Typography>
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept=".xlsx,.xls"
                                style={{ display: 'none' }}
                                onChange={e => handleFileSelect(e.target.files[0])}
                            />
                        </Paper>
                    </Box>
                )}

                {/* Preview table */}
                {previewData && (
                    <Box sx={{ mt: 1 }}>
                        <TableContainer component={Paper} elevation={0}
                            sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2, maxHeight: 'calc(100vh - 220px)' }}>
                            <Table size="small" stickyHeader>
                                <TableHead>
                                    <TableRow>
                                        {PREVIEW_COLUMNS.map(col => (
                                            <TableCell
                                                key={col.key}
                                                sx={{ fontWeight: 'bold', bgcolor: 'action.hover', whiteSpace: 'nowrap', minWidth: col.width ?? 120 }}
                                            >
                                                {col.label}
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {previewData.map((row, idx) => (
                                        <TableRow key={idx} hover>
                                            {PREVIEW_COLUMNS.map(col => (
                                                <TableCell key={col.key} sx={{ whiteSpace: 'nowrap' }}>
                                                    {row[col.key] ?? ''}
                                                </TableCell>
                                            ))}
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Box>
                )}
            </DialogContent>

            <Divider />
            <DialogActions sx={{ px: 3, py: 2, gap: 1, justifyContent: 'flex-end' }}>
                {previewData && (
                    <Button variant="outlined" onClick={handleReset}>
                        {t('excel_loadAnother')}
                    </Button>
                )}
                <Button variant="outlined" onClick={handleModalClose}>
                    {t('cancel')}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default EmployeeExcelModal;
