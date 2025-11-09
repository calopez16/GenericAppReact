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
    Typography
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

const ANIMATION_DURATION = 500;

const deletingRowStyle = {
    transition: `all ${ANIMATION_DURATION}ms ease-out`,
    transform: 'translateX(-100%)', // Deslizar fuera de la vista a la izquierda
    opacity: 0,
    height: 0,
    padding: 0,
    overflow: 'hidden',
};

const normalRowStyle = {
    transition: `all ${ANIMATION_DURATION}ms ease-out`,
    transform: 'translateX(0)',
    opacity: 1,
    maxHeight: '1000px',
};


const ShippingCompanyListTable = ({
    shippingCompanies,
    loading,
    t,
    handleOpenEditShippingCompany,
    handleToggleShippingCompanyStatus,
    handleOpenDeleteConfirmation,
    deletingId // RECIBIR LA PROP DE ANIMACIÓN
}) => {

    const minTableWidth = 900;

    return (
        <TableContainer component={Paper} sx={{ overflowX: 'auto' }}>
            <Table sx={{ minWidth: minTableWidth }}>
                <TableHead>
                    <TableRow>
                        <TableCell>{t('active')}</TableCell>
                        <TableCell>{t('name')}</TableCell>
                        <TableCell align="right">{t('actions')}</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {loading ? (
                        <TableRow>
                            <TableCell colSpan={4} align="center">
                                {t('loading')}...
                            </TableCell>
                        </TableRow>
                    ) : (shippingCompanies?.length ?? 0) === 0 ? (
                        <TableRow>
                            <TableCell colSpan={4} align="center"> {t('records_notFound')}.</TableCell>
                        </TableRow>
                    ) : (
                        shippingCompanies.map((shippingCompany) => {
                            const isDeleting = shippingCompany.idShippingCompany === deletingId;

                            // Aplicar estilos condicionales
                            const rowCurrentStyle = isDeleting ? deletingRowStyle : normalRowStyle;

                            return (
                                <TableRow
                                    key={shippingCompany.idShippingCompany}
                                    sx={rowCurrentStyle}
                                >
                                    <TableCell>
                                        <Tooltip title={shippingCompany.isActive ? t('disable') : t('enable')}>
                                            <Switch
                                                checked={shippingCompany.isActive}
                                                onChange={() => handleToggleShippingCompanyStatus(shippingCompany)}
                                                color="primary"
                                                disabled={isDeleting}
                                            />
                                        </Tooltip>
                                    </TableCell>
                                    <TableCell>
                                        <Tooltip title={`ID: ${shippingCompany.idShippingCompany}`}>
                                            <Typography>{shippingCompany.name}</Typography>
                                        </Tooltip>
                                    </TableCell>
                                    <TableCell align="right">
                                        <Tooltip title={t('edit')}>
                                            <IconButton
                                                color="primary"
                                                onClick={() => handleOpenEditShippingCompany(shippingCompany)}
                                                disabled={isDeleting}
                                            >
                                                <EditIcon />
                                            </IconButton>
                                        </Tooltip>
                                        <Tooltip title={t('delete')}>
                                            <IconButton
                                                color="error"
                                                onClick={() => handleOpenDeleteConfirmation(shippingCompany)}
                                                sx={{ ml: 1 }}
                                                disabled={isDeleting}
                                            >
                                                <DeleteIcon />
                                            </IconButton>
                                        </Tooltip>
                                    </TableCell>
                                </TableRow>
                            );
                        })
                    )}
                </TableBody>
            </Table>
        </TableContainer>
    );
};

export default ShippingCompanyListTable;