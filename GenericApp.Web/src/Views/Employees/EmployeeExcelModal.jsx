import React, { useState, useRef, useCallback, useMemo } from 'react';
import {
    Dialog, DialogTitle, DialogContent, DialogActions,
    Button, Box, Typography, IconButton, Divider, TextField,
    LinearProgress, Paper, Table, TableBody, TableCell,
    TableContainer, TableHead, TableRow, Chip, Tooltip, CircularProgress, Badge
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import TableViewIcon from '@mui/icons-material/TableView';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import SaveIcon from '@mui/icons-material/Save';
import ErrorIcon from '@mui/icons-material/Error';
import WarningIcon from '@mui/icons-material/Warning';
import DeleteSweepIcon from '@mui/icons-material/DeleteSweep';
import { useTranslation } from 'react-i18next';
import { ShowMessage } from '@helpers/NotificationService';
import { DataAPIEmployeesService } from '@data/Employees/Data';
import ConfirmationDialog from '@components/ConfirmationDialog';

const PREVIEW_COLUMNS = [
    { key: 'rowNumber', labelKey: 'col_rowNumber', width: 60 },
    { key: 'clave', labelKey: 'col_clave' },
    { key: 'apellidoPaterno', labelKey: 'col_apellidoPaterno' },
    { key: 'apellidoMaterno', labelKey: 'col_apellidoMaterno' },
    { key: 'nombre', labelKey: 'col_nombre' },
    { key: 'rfc', labelKey: 'col_rfc' },
    { key: 'curp', labelKey: 'col_curp' },
    { key: 'imss', labelKey: 'col_imss' },
    { key: 'sexo', labelKey: 'col_sexo' },
    { key: 'puesto', labelKey: 'col_puesto' },
    { key: 'estadoCivil', labelKey: 'col_estadoCivil' },
    { key: 'fechaNacimiento', labelKey: 'col_fechaNacimiento' },
    { key: 'fechaIngreso', labelKey: 'col_fechaIngreso' },
    { key: 'fechaBaja', labelKey: 'col_fechaBaja' },
    { key: 'causaBaja', labelKey: 'col_causaBaja' },
    { key: 'activo', labelKey: 'col_activo' },
    { key: 'salarioDiario', labelKey: 'col_salarioDiario' },
    { key: 'salarioIntegrado', labelKey: 'col_salarioIntegrado' },
    { key: 'formaDePago', labelKey: 'col_formaDePago' },
    { key: 'lugarNacimiento', labelKey: 'col_lugarNacimiento' },
    { key: 'direccion', labelKey: 'col_direccion' },
    { key: 'telefono', labelKey: 'col_telefono' },
    { key: 'ciudad', labelKey: 'col_ciudad' },
    { key: 'estado', labelKey: 'col_estado' },
    { key: 'codigoPostal', labelKey: 'col_codigoPostal' },
    { key: 'correoElectronico', labelKey: 'col_correoElectronico' },
    { key: 'celularTrabajador', labelKey: 'col_celularTrabajador' },
    { key: 'beneficiario1', labelKey: 'col_beneficiario1' },
    { key: 'parentesco1', labelKey: 'col_parentesco1' },
    { key: 'porcentaje1', labelKey: 'col_porcentaje1' },
    { key: 'beneficiario2', labelKey: 'col_beneficiario2' },
    { key: 'parentesco2', labelKey: 'col_parentesco2' },
    { key: 'porcentaje2', labelKey: 'col_porcentaje2' },
    { key: 'beneficiario3', labelKey: 'col_beneficiario3' },
    { key: 'parentesco3', labelKey: 'col_parentesco3' },
    { key: 'porcentaje3', labelKey: 'col_porcentaje3' },
    { key: 'conyugue', labelKey: 'col_conyugue' },
    { key: 'conyugueFechaNacimiento', labelKey: 'col_conyugueFechaNacimiento' },
    { key: 'conyugeVive', labelKey: 'col_conyugeVive' },
    { key: 'hijo1', labelKey: 'col_hijo1' },
    { key: 'hijo1FechaNacimiento', labelKey: 'col_hijo1FechaNacimiento' },
    { key: 'hijo1Sexo', labelKey: 'col_hijo1Sexo' },
    { key: 'hijo2', labelKey: 'col_hijo2' },
    { key: 'hijo2FechaNacimiento', labelKey: 'col_hijo2FechaNacimiento' },
    { key: 'hijo2Sexo', labelKey: 'col_hijo2Sexo' },
    { key: 'hijo3', labelKey: 'col_hijo3' },
    { key: 'hijo3FechaNacimiento', labelKey: 'col_hijo3FechaNacimiento' },
    { key: 'hijo3Sexo', labelKey: 'col_hijo3Sexo' },
    { key: 'hijo4', labelKey: 'col_hijo4' },
    { key: 'hijo4FechaNacimiento', labelKey: 'col_hijo4FechaNacimiento' },
    { key: 'hijo4Sexo', labelKey: 'col_hijo4Sexo' },
    { key: 'hijo5', labelKey: 'col_hijo5' },
    { key: 'hijo5FechaNacimiento', labelKey: 'col_hijo5FechaNacimiento' },
    { key: 'hijo5Sexo', labelKey: 'col_hijo5Sexo' },
    { key: 'hijo6', labelKey: 'col_hijo6' },
    { key: 'hijo6FechaNacimiento', labelKey: 'col_hijo6FechaNacimiento' },
    { key: 'hijo6Sexo', labelKey: 'col_hijo6Sexo' },
    { key: 'padre', labelKey: 'col_padre' },
    { key: 'fechaNacimientoPadre', labelKey: 'col_fechaNacimientoPadre' },
    { key: 'padreVive', labelKey: 'col_padreVive' },
    { key: 'madre', labelKey: 'col_madre' },
    { key: 'fechaNacimientoMadre', labelKey: 'col_fechaNacimientoMadre' },
    { key: 'madreVive', labelKey: 'col_madreVive' },
    { key: 'contactoEmergencia', labelKey: 'col_contactoEmergencia' },
    { key: 'parentescoContacto', labelKey: 'col_parentescoContacto' },
    { key: 'celularContacto', labelKey: 'col_celularContacto' },
    { key: 'fechaInicioContrato', labelKey: 'col_fechaInicioContrato' },
    { key: 'fechaVencimientoContrato', labelKey: 'col_fechaVencimientoContrato' },
];

const EmployeeExcelModal = ({ open, handleClose, idCompany }) => {
    const { t } = useTranslation();
    const service = DataAPIEmployeesService();
    const fileInputRef = useRef(null);

    const [file, setFile] = useState(null);
    const [dataStartRow, setDataStartRow] = useState(() => {
        const saved = localStorage.getItem('employee_excel_dataStartRow');
        return saved ? parseInt(saved) : 7;
    });
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
        const saved = localStorage.getItem('employee_excel_dataStartRow');
        setDataStartRow(saved ? parseInt(saved) : 7);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const handleModalClose = () => {
        handleReset();
        handleClose();
    };

    const [saving, setSaving] = useState(false);
    const [showConfirmDialog, setShowConfirmDialog] = useState(false);

    const getErrorsForField = useCallback((row, fieldKey) => {
        if (!row.errores || !Array.isArray(row.errores)) return [];
        return row.errores.filter(err => {
            const field = err.field?.toLowerCase();
            const key = fieldKey.toLowerCase();
            return field === key || field === key.replace(/[0-9]/g, '');
        });
    }, []);

    const rowsWithErrors = useMemo(() => {
        if (!previewData) return [];
        return previewData.filter(row => row.errores && row.errores.length > 0);
    }, [previewData]);

    const totalErrors = useMemo(() => {
        if (!previewData) return 0;
        return previewData.reduce((sum, row) => sum + (row.errores?.length || 0), 0);
    }, [previewData]);

    const handleDiscardErrorRows = () => {
        if (!previewData) return;
        const validRows = previewData.filter(row => !row.errores || row.errores.length === 0);
        setPreviewData(validRows);
        ShowMessage(t('excel_discardedRows', { count: rowsWithErrors.length }), 'info');
    };

    const handleSaveClick = () => {
        if (!previewData?.length) return;
        if (rowsWithErrors.length > 0) {
            setShowConfirmDialog(true);
            return;
        }
        handleSave();
    };

    const handleSave = async () => {
        setShowConfirmDialog(false);
        setSaving(true);
        try {
            const result = await service.importExcel({ idCompany, rows: previewData });
            if (result?.success !== false) {
                const data = result?.data ?? {};
                const inserted = data.inserted || data.Inserted || 0;
                const updated = data.updated || data.Updated || 0;
                const errors = data.errors || data.Errors || 0;

                if (errors > 0) {
                    ShowMessage(t('excel_importPartialSuccess', { inserted, updated, errors }), 'warning');
                } else {
                    ShowMessage(t('excel_importSuccess', { inserted, updated }), 'success');
                }
                handleModalClose();
            } else {
                ShowMessage(t('error'), 'error');
            }
        } catch {
            ShowMessage(t('error'), 'error');
        } finally {
            setSaving(false);
        }
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
                        <>
                            <Chip
                                size="small"
                                color="success"
                                icon={<CheckCircleIcon />}
                                label={`${previewData.length} ${t('excel_rowsFound')}`}
                            />
                            {totalErrors > 0 && (
                                <Chip
                                    size="small"
                                    color="error"
                                    icon={<WarningIcon />}
                                    label={`${totalErrors} ${t('excel_errorsFound')} ${t('excel_inRowsCount', { count: rowsWithErrors.length })}`}
                                />
                            )}
                        </>
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
                                onChange={e => {
                                    const val = Math.max(1, parseInt(e.target.value) || 1);
                                    setDataStartRow(val);
                                    localStorage.setItem('employee_excel_dataStartRow', val);
                                }}
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
                                                {t(col.labelKey)}
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {previewData.map((row, idx) => {
                                        const hasErrors = row.errores && row.errores.length > 0;

                                        return (
                                            <Tooltip
                                                key={idx}
                                                title={
                                                    hasErrors ? (
                                                        <Box sx={{ maxWidth: 500 }}>
                                                            <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1, fontSize: '0.9rem' }}>
                                                                {t('excel_row_errors', { row: row.rowNumber })}
                                                            </Typography>
                                                            {row.errores.map((err, errIdx) => (
                                                                <Box key={errIdx} sx={{ mb: 1, pb: 1, borderBottom: errIdx < row.errores.length - 1 ? '1px solid rgba(255,255,255,0.2)' : 'none' }}>
                                                                    <Typography variant="caption" sx={{ fontWeight: 'bold', display: 'block' }}>
                                                                        {t(err.errorCode)}
                                                                    </Typography>
                                                                    <Typography variant="caption" display="block" sx={{ pl: 1.5 }}>
                                                                        {t('excel_error_field')}: <strong>{err.field}</strong>
                                                                    </Typography>
                                                                    <Typography variant="caption" display="block" sx={{ pl: 1.5 }}>
                                                                        {t('excel_error_value')}: {err.value || t('excel_error_empty')}
                                                                    </Typography>
                                                                </Box>
                                                            ))}
                                                        </Box>
                                                    ) : ''
                                                }
                                                arrow
                                                followCursor
                                                placement="right"
                                                disableHoverListener={!hasErrors}
                                            >
                                                <TableRow 
                                                    hover
                                                    sx={{
                                                        bgcolor: hasErrors ? 'error.light' : 'inherit',
                                                        '&:hover': {
                                                            bgcolor: hasErrors ? 'error.main' : 'action.hover'
                                                        },
                                                        cursor: hasErrors ? 'help' : 'default'
                                                    }}
                                                >
                                                    {PREVIEW_COLUMNS.map(col => {
                                                        const fieldErrors = getErrorsForField(row, col.key);
                                                        const hasFieldError = fieldErrors.length > 0;

                                                        return (
                                                            <TableCell 
                                                                key={col.key} 
                                                                sx={{ 
                                                                    whiteSpace: 'nowrap',
                                                                    bgcolor: hasFieldError ? 'error.dark' : 'inherit',
                                                                    color: hasFieldError ? 'error.contrastText' : 'inherit',
                                                                    fontWeight: hasFieldError ? 'bold' : 'normal',
                                                                    position: 'relative'
                                                                }}
                                                            >
                                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                                    {hasFieldError ? (
                                                                        <Tooltip 
                                                                            title={
                                                                                <Box>
                                                                                    {fieldErrors.map((err, errIdx) => (
                                                                                        <Box key={errIdx} sx={{ mb: 0.5 }}>
                                                                                            <Typography variant="caption" sx={{ fontWeight: 'bold' }}>
                                                                                                {t(err.errorCode)}
                                                                                            </Typography>
                                                                                            <Typography variant="caption" display="block">
                                                                                                {t('excel_error_field')}: {err.field}
                                                                                            </Typography>
                                                                                            <Typography variant="caption" display="block">
                                                                                                {t('excel_error_value')}: {err.value || t('excel_error_empty')}
                                                                                            </Typography>
                                                                                        </Box>
                                                                                    ))}
                                                                                </Box>
                                                                            }
                                                                            arrow
                                                                            placement="top"
                                                                            enterDelay={100}
                                                                        >
                                                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, cursor: 'help' }}>
                                                                                <ErrorIcon sx={{ fontSize: 16 }} />
                                                                                <span>{row[col.key] ?? ''}</span>
                                                                            </Box>
                                                                        </Tooltip>
                                                                    ) : (
                                                                        <span>{row[col.key] ?? ''}</span>
                                                                    )}
                                                                </Box>
                                                            </TableCell>
                                                        );
                                                    })}
                                                </TableRow>
                                            </Tooltip>
                                        );
                                    })}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Box>
                )}
            </DialogContent>

            <Divider />
            <DialogActions sx={{ px: 3, py: 2, gap: 1, justifyContent: 'space-between' }}>
                <Box sx={{ display: 'flex', gap: 1 }}>
                    {previewData && rowsWithErrors.length > 0 && (
                        <Button 
                            variant="outlined" 
                            color="error"
                            startIcon={<DeleteSweepIcon />}
                            onClick={handleDiscardErrorRows} 
                            disabled={saving}
                        >
                            {t('excel_discardErrors')}
                        </Button>
                    )}
                </Box>
                <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button variant="outlined" onClick={handleModalClose} disabled={saving}>
                        {t('cancel')}
                    </Button>
                    {previewData && (
                        <Button variant="contained" disableElevation onClick={handleReset} disabled={saving}>
                            {t('excel_loadAnother')}
                        </Button>
                    )}
                    {previewData && (
                        <Button variant="contained" disableElevation color="success"
                            endIcon={saving ? <CircularProgress size={16} color="inherit" /> : <SaveIcon />}
                            onClick={handleSaveClick} disabled={saving}>
                            {saving ? t('loading') : t('excel_saveData')}
                        </Button>
                    )}
                </Box>
            </DialogActions>

            <ConfirmationDialog
                open={showConfirmDialog}
                title={t('excel_confirmTitle')}
                message={t('excel_confirmMessage', { count: rowsWithErrors.length, total: previewData?.length || 0 })}
                confirmText={t('excel_confirmSave')}
                cancelText={t('cancel')}
                onConfirm={handleSave}
                onCancel={() => setShowConfirmDialog(false)}
                severity="warning"
            />
        </Dialog>
    );
};

export default EmployeeExcelModal;
