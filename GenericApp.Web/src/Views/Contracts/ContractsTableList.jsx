import React from 'react';
import {
    TableContainer,
    Paper,
    Table,
    TableHead,
    TableRow,
    TableCell,
    TableBody,
    Switch,
    IconButton,
    Tooltip,
    Typography,
    Box,
    Skeleton,
    Checkbox
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import EmptyData from '@layout/EmptyData';

const ANIMATION_DURATION = 500;

const deletingRowStyle = {
    transition: `all ${ANIMATION_DURATION}ms ease-out`,
    transform: 'translateX(-100%)',
    opacity: 0,
    height: 0,
    padding: 0,
    overflow: 'hidden',
};

const normalRowStyle = {
    transition: `all ${ANIMATION_DURATION}ms ease-out`,
    transform: 'translateX(0)',
    opacity: 1,
};

const ContractsTableList = ({
    contracts,
    loading,
    t,
    handleToggleContractStatus,
    handleOpenDeleteConfirmation,
    handleOpenPreview,
    deletingId,
    isSearch = false,
    rowsPerPage = 5,
    selectedIds = [],
    onToggleSelect,
    onToggleSelectAll
}) => {

    const rowHeight = 65;
    const colSpan = 7;

    const allSelected = contracts?.length > 0 && contracts.every(c => selectedIds.includes(c.idContract));
    const someSelected = contracts?.some(c => selectedIds.includes(c.idContract)) && !allSelected;

    const emptyRows = !loading && contracts?.length > 0
        ? Math.max(0, rowsPerPage - contracts.length)
        : 0;

    const formatDate = (dateString) => {
        if (!dateString) return '-';
        const date = new Date(dateString);
        return date.toLocaleString('es-ES', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hour12: true });
    };

    return (
        <TableContainer
            component={Paper}
            elevation={0}
            sx={{ overflowX: 'auto', border: '1px solid', borderColor: 'divider', borderRadius: 2 }}
        >
            <Table sx={{ minWidth: 600 }}>
                <TableHead sx={{ bgcolor: 'action.hover' }}>
                    <TableRow>
                        <TableCell padding="checkbox">
                            <Checkbox
                                size="small"
                                checked={allSelected}
                                indeterminate={someSelected}
                                onChange={e => onToggleSelectAll && onToggleSelectAll(e.target.checked)}
                                disabled={loading || contracts?.length === 0}
                            />
                        </TableCell>
                        <TableCell sx={{ fontWeight: 'bold' }}>{t('employeeName')}</TableCell>
                        <TableCell sx={{ fontWeight: 'bold' }}>{t('documentName')}</TableCell>
                        <TableCell sx={{ fontWeight: 'bold', width: 210 }} align="center">{t('signatureDate')}</TableCell>
                        <TableCell sx={{ fontWeight: 'bold', width: 100 }} align="center">{t('actions')}</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {loading ? (
                        Array.from(new Array(rowsPerPage)).map((_, index) => (
                            <TableRow key={`skeleton-${index}`} style={{ height: rowHeight }}>
                                <TableCell padding="checkbox"><Skeleton variant="circular" width={20} height={20} sx={{ mx: 'auto' }} /></TableCell>
                                <TableCell><Skeleton variant="text" width="70%" /></TableCell>
                                <TableCell><Skeleton variant="text" width="60%" /></TableCell>
                                <TableCell align="center"><Skeleton variant="text" width="80%" sx={{ mx: 'auto' }} /></TableCell>
                                <TableCell align="center">
                                    <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
                                        <Skeleton variant="circular" width={30} height={30} />
                                    </Box>
                                </TableCell>
                            </TableRow>
                        ))
                    ) : contracts?.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={colSpan} sx={{ border: 'none', py: 4 }}>
                                <EmptyData
                                    message={isSearch ? t('no_results_found') : t('no_contracts_yet')}
                                    description={isSearch ? t('try_another_search_term') : t('start_by_adding_contract')}
                                />
                            </TableCell>
                        </TableRow>
                    ) : (
                        <>
                            {contracts.map((contract) => {
                                const isDeleting = contract.idContract === deletingId;
                                return (
                                    <TableRow
                                        key={contract.idContract}
                                        style={isDeleting ? deletingRowStyle : normalRowStyle}
                                        sx={{ '&:last-child td': { borderBottom: 0 }, cursor: 'pointer' }}
                                        onClick={() => onToggleSelect && onToggleSelect(contract.idContract)}
                                    >
                                        <TableCell padding="checkbox" onClick={e => e.stopPropagation()}>
                                            <Checkbox
                                                size="small"
                                                checked={selectedIds.includes(contract.idContract)}
                                                onChange={() => onToggleSelect && onToggleSelect(contract.idContract)}
                                                disabled={isDeleting}
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <Typography variant="body2" color="text.secondary">
                                                {contract.idEmployeeNavigation.nombre || t('noEmployee')}
                                            </Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                                {contract.documentName || t('noDocumentName')}
                                            </Typography>
                                        </TableCell>
                                        <TableCell align="center">
                                            <Typography variant="body2">
                                                {formatDate(contract.signatureDate)}
                                            </Typography>
                                        </TableCell>
                                        <TableCell align="center" onClick={e => e.stopPropagation()}>
                                            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 0.5 }}>
                                                <Tooltip title={t('preview')}>
                                                    <IconButton
                                                        size="small"
                                                        onClick={() => handleOpenPreview(contract)}
                                                        disabled={isDeleting}
                                                        sx={{ color: 'white', bgcolor: 'info.main', '&:hover': { bgcolor: 'info.dark' } }}
                                                    >
                                                        <VisibilityIcon fontSize="small" />
                                                    </IconButton>
                                                </Tooltip>
                                                <Tooltip title={t('delete')}>
                                                    <IconButton
                                                        size="small"
                                                        onClick={() => handleOpenDeleteConfirmation(contract)}
                                                        disabled={isDeleting}
                                                        sx={{ color: 'white', bgcolor: 'error.main', '&:hover': { bgcolor: 'error.dark' } }}
                                                    >
                                                        <DeleteIcon fontSize="small" />
                                                    </IconButton>
                                                </Tooltip>
                                            </Box>
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                            {emptyRows > 0 &&
                                Array.from(new Array(emptyRows)).map((_, index) => (
                                    <TableRow key={`empty-${index}`} style={{ height: rowHeight }}>
                                        <TableCell colSpan={colSpan} sx={{ border: 'none' }} />
                                    </TableRow>
                                ))
                            }
                        </>
                    )}
                </TableBody>
            </Table>
        </TableContainer>
    );
};

export default ContractsTableList;

