import React, { useState } from 'react';
import {
    TableContainer,
    Paper,
    Table,
    TableHead,
    TableRow,
    TableCell,
    TableBody,
    Typography,
    Box,
    Skeleton,
    IconButton,
    Tooltip,
    Collapse,
    Chip
} from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import NoteAddIcon from '@mui/icons-material/NoteAdd';
import EmptyData from '@layout/EmptyData';

const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleString('es-ES', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hour12: true });
};

function EmployeeRow({ employee, t, onOpenPdf, onNewContract }) {
    const [open, setOpen] = useState(false);
    const contracts = [...(employee.contracts || [])].sort((a, b) => new Date(b.signatureDate) - new Date(a.signatureDate));

    return (
        <>
            <TableRow sx={{ '& > *': { borderBottom: 'unset' } }}>
                <TableCell sx={{ width: 48 }}>
                    <Tooltip title={t('contractHistory') || 'Historial de contratos'}>
                        <IconButton size="small" onClick={() => setOpen(o => !o)}>
                            {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
                        </IconButton>
                    </Tooltip>
                </TableCell>
                <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {`${employee.nombre || ''} ${employee.apellidoPaterno || ''} ${employee.apellidoMaterno || ''}`.trim()}
                    </Typography>
                    {employee.clave && (
                        <Typography variant="caption" color="text.secondary">
                            {employee.clave}
                        </Typography>
                    )}
                </TableCell>
                <TableCell>
                    <Typography variant="body2" color="text.secondary">
                        {employee.position || '-'}
                    </Typography>
                </TableCell>
                <TableCell align="center">
                    {contracts.length === 0
                        ? <Chip label={t('noContracts') || 'Sin contratos'} size="small" color="warning" variant="outlined" />
                        : <Chip label={`${contracts.length} ${contracts.length === 1 ? (t('contract') || 'contrato') : (t('contracts') || 'contratos')}`} size="small" color="success" variant="outlined" />
                    }
                </TableCell>
                <TableCell align="center">
                    {onNewContract && (
                        <Tooltip title={t('newContract') || 'Nuevo contrato'}>
                            <IconButton
                                size="small"
                                onClick={() => onNewContract(employee)}
                                sx={{ color: 'white', bgcolor: 'primary.main', '&:hover': { bgcolor: 'primary.dark' } }}
                            >
                                <NoteAddIcon fontSize="small" />
                            </IconButton>
                        </Tooltip>
                    )}
                </TableCell>
            </TableRow>
            <TableRow>
                <TableCell colSpan={5} sx={{ py: 0, bgcolor: 'action.hover' }}>
                    <Collapse in={open} timeout="auto" unmountOnExit>
                        <Box sx={{ py: 1, px: 2 }}>
                            <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 700 }}>
                                {t('contractHistory') || 'Historial de contratos'}
                            </Typography>
                            {contracts.length === 0 ? (
                                <Typography variant="body2" color="text.secondary" sx={{ py: 1 }}>
                                    {t('no_contracts_yet') || 'No hay contratos registrados'}
                                </Typography>
                            ) : (
                                <Table size="small">
                                    <TableHead>
                                        <TableRow>
                                            <TableCell sx={{ fontWeight: 'bold' }}>{t('documentName') || 'Documento'}</TableCell>
                                            <TableCell sx={{ fontWeight: 'bold' }} align="center">{t('signatureDate') || 'Fecha de firma'}</TableCell>
                                            <TableCell sx={{ fontWeight: 'bold' }} align="center">{t('actions') || 'Acciones'}</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {contracts.map((c, idx) => (
                                            <TableRow key={c.idContract ?? idx}>
                                                <TableCell>
                                                    <Typography variant="body2">{c.documentName || '-'}</Typography>
                                                </TableCell>
                                                <TableCell align="center">
                                                    <Typography variant="body2">{formatDate(c.signatureDate)}</Typography>
                                                </TableCell>
                                                <TableCell align="center">
                                                    <Tooltip title={t('preview') || 'Ver PDF'}>
                                                        <IconButton
                                                            size="small"
                                                            onClick={() => onOpenPdf(c)}
                                                            sx={{ color: 'white', bgcolor: 'info.main', '&:hover': { bgcolor: 'info.dark' } }}
                                                        >
                                                            <VisibilityIcon fontSize="small" />
                                                        </IconButton>
                                                    </Tooltip>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            )}
                        </Box>
                    </Collapse>
                </TableCell>
            </TableRow>
        </>
    );
}

const EmployeeContractsTableList = ({
    employees,
    loading,
    t,
    rowsPerPage = 10,
    isSearch = false,
    onOpenPdf,
    onNewContract
}) => {
    const colSpan = 5;
    const rowHeight = 65;
    const emptyRows = !loading && employees?.length > 0
        ? Math.max(0, rowsPerPage - employees.length)
        : 0;

    return (
        <TableContainer
            component={Paper}
            elevation={0}
            sx={{ overflowX: 'auto', border: '1px solid', borderColor: 'divider', borderRadius: 2 }}
        >
            <Table sx={{ minWidth: 600 }}>
                <TableHead sx={{ bgcolor: 'action.hover' }}>
                    <TableRow>
                        <TableCell sx={{ width: 48 }} />
                        <TableCell sx={{ fontWeight: 'bold' }}>{t('employeeName') || 'Empleado'}</TableCell>
                        <TableCell sx={{ fontWeight: 'bold' }}>{t('position') || 'Puesto'}</TableCell>
                        <TableCell sx={{ fontWeight: 'bold' }} align="center">{t('contracts') || 'Contratos'}</TableCell>
                        <TableCell sx={{ fontWeight: 'bold' }} align="center">{t('actions') || 'Acciones'}</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {loading ? (
                        Array.from(new Array(rowsPerPage)).map((_, i) => (
                            <TableRow key={`sk-${i}`} style={{ height: rowHeight }}>
                                <TableCell><Skeleton variant="circular" width={28} height={28} /></TableCell>
                                <TableCell><Skeleton variant="text" width="60%" /></TableCell>
                                <TableCell><Skeleton variant="text" width="40%" /></TableCell>
                                <TableCell align="center"><Skeleton variant="text" width="50%" sx={{ mx: 'auto' }} /></TableCell>
                                <TableCell align="center"><Skeleton variant="circular" width={28} height={28} sx={{ mx: 'auto' }} /></TableCell>
                            </TableRow>
                        ))
                    ) : employees?.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={colSpan + 1} sx={{ border: 'none', py: 4 }}>
                                <EmptyData
                                    message={isSearch ? t('no_results_found') : t('no_employees_yet') || 'Sin empleados'}
                                    description={isSearch ? t('try_another_search_term') : ''}
                                />
                            </TableCell>
                        </TableRow>
                    ) : (
                        <>
                            {employees.map((emp) => (
                                <EmployeeRow
                                    key={emp.idEmployee}
                                    employee={emp}
                                    t={t}
                                    onOpenPdf={onOpenPdf}
                                    onNewContract={onNewContract}
                                />
                            ))}
                            {emptyRows > 0 && Array.from(new Array(emptyRows)).map((_, i) => (
                                    <TableRow key={`empty-${i}`} style={{ height: rowHeight }}>
                                        <TableCell colSpan={colSpan + 1} sx={{ border: 'none' }} />
                                </TableRow>
                            ))}
                        </>
                    )}
                </TableBody>
            </Table>
        </TableContainer>
    );
};

export default EmployeeContractsTableList;
