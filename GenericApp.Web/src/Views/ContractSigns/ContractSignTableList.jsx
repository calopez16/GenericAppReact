import React, { useContext } from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    IconButton,
    Switch,
    Chip,
    Box,
    Avatar,
    Tooltip,
    Typography,
    Skeleton
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ImageIcon from '@mui/icons-material/Image';
import { AppContext } from '@helpers/AppContext';
import EmptyData from '@layout/EmptyData';
import { API_BASE_URL } from '@config';

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

function ContractSignTableList({
    signs,
    loading,
    t,
    handleOpenEditSign,
    handleToggleSignStatus,
    handleOpenDeleteConfirmation,
    deletingId,
    isSearch = false,
    rowsPerPage = 5
}) {
    const { companySelected } = useContext(AppContext);

    const rowHeight = 65;
    const colSpan = 4;

    const emptyRows = !loading && signs?.length > 0
        ? Math.max(0, rowsPerPage - signs.length)
        : 0;

    return (
        <TableContainer
            component={Paper}
            elevation={0}
            sx={{
                overflowX: 'auto',
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 2
            }}
        >
            <Table sx={{ minWidth: 600 }}>
                <TableHead sx={{ bgcolor: 'action.hover' }}>
                    <TableRow>
                        <TableCell sx={{ fontWeight: 'bold', width: 10 }} align="center">{t('status')}</TableCell>
                        <TableCell sx={{ fontWeight: 700, width: 120 }}>{t('signature')}</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>{t('name')}</TableCell>
                        <TableCell sx={{ fontWeight: 700, width: 180 }} align="center">{t('actions')}</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {loading ? (
                        Array.from(new Array(rowsPerPage)).map((_, index) => (
                            <TableRow key={`skeleton-${index}`}>
                                <TableCell align="center">
                                    <Skeleton variant="rectangular" width={40} height={20} sx={{ mx: 'auto', borderRadius: 1 }} />
                                </TableCell>
                                <TableCell>
                                    <Skeleton variant="rectangular" width={80} height={50} sx={{ borderRadius: 1 }} />
                                </TableCell>
                                <TableCell align="center">
                                    <Skeleton variant="rounded" width={60} height={24} sx={{ mx: 'auto' }} />
                                </TableCell>
                                <TableCell align="center">
                                    <Box sx={{ display: 'flex', justifyContent: 'center', gap: 0.5 }}>
                                        <Skeleton variant="circular" width={32} height={32} />
                                        <Skeleton variant="circular" width={32} height={32} />
                                    </Box>
                                </TableCell>
                            </TableRow>
                        ))
                    ) : signs?.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={colSpan} sx={{ border: 'none' }}>
                                <EmptyData
                                    iconComponent={ImageIcon}
                                    title={isSearch ? t('no_results_found') : t('noRecordsFound')}
                                    subtitle={isSearch ? t('try_another_search_term') : t('contractSigns_description')}
                                />
                            </TableCell>
                        </TableRow>
                    ) : (
                        <>
                            {signs.map((sign) => {
                                const isDeleting = deletingId === sign.idContractSign;
                                return (
                                    <TableRow
                                        key={sign.idContractSign}
                                        hover
                                        sx={isDeleting ? deletingRowStyle : normalRowStyle}
                                    >
                                        <TableCell align="center">
                                            <Switch
                                                checked={sign.isActive ?? false}
                                                onChange={() => handleToggleSignStatus(sign)}
                                                size="small"
                                                disabled={isDeleting}
                                            />
                                        </TableCell>
                                        <TableCell>
                                            {sign.signFileName ? (
                                                <Avatar
                                                    variant="rounded"
                                                    src={`${API_BASE_URL}/img/signs/${companySelected?.idCompany}/${sign.signFileName}`}
                                                    sx={{ width: 80, height: 50 }}
                                                >
                                                    <ImageIcon />
                                                </Avatar>
                                            ) : (
                                                <Avatar variant="rounded" sx={{ width: 80, height: 50, bgcolor: 'action.hover' }}>
                                                    <ImageIcon />
                                                </Avatar>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <Typography variant="body2" fontWeight={500}>
                                                {sign.name}
                                            </Typography>
                                        </TableCell>
                                        <TableCell align="center">
                                            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 0.5 }}>
                                                <Tooltip title={t('edit')}>
                                                    <IconButton
                                                        size="small"
                                                        onClick={() => handleOpenEditSign(sign)}
                                                        disabled={isDeleting}
                                                        sx={{ color: 'white', bgcolor: 'primary.main', '&:hover': { bgcolor: 'primary.dark' } }}
                                                    >
                                                        <EditIcon fontSize="small" />
                                                    </IconButton>
                                                </Tooltip>
                                                <Tooltip title={t('delete')}>
                                                    <IconButton
                                                        size="small"
                                                        onClick={() => handleOpenDeleteConfirmation(sign)}
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
                            {emptyRows > 0 && (
                                <TableRow style={{ height: rowHeight * emptyRows }}>
                                    <TableCell colSpan={colSpan} sx={{ border: 'none' }} />
                                </TableRow>
                            )}
                        </>
                    )}
                </TableBody>
            </Table>
        </TableContainer>
    );
}

export default ContractSignTableList;
