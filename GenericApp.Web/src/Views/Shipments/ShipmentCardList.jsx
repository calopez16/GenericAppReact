import React, { useState } from 'react';
import {
    Box, Typography, Paper, IconButton, Divider,
    Avatar, Chip, Skeleton, Menu, MenuItem, ListItemIcon, ListItemText
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteForeverIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import ReceiptIcon from '@mui/icons-material/Receipt';
import DescriptionIcon from '@mui/icons-material/Description';
import FactCheckIcon from '@mui/icons-material/FactCheck';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import EmptyData from '@layout/EmptyData';

const ShipmentCardList = ({
    shipments,
    pageLoading,
    t,
    handleOpenEditShipment,
    handleDeleteShipment,
    handleViewDetails,
    handleExportManifest,
    handleExportRemision,
    handleOpenBitacoraModal,
    isSearch = false,
    rowsPerPage = 5
}) => {
    const formatRemision = (id) => id ? id.toString().padStart(4, '0') : '-';
    const formatDate = (dateString) => dateString ? new Date(dateString).toLocaleDateString() : '-';

    const MobileShipmentCard = ({ shipment }) => {
        const [anchorEl, setAnchorEl] = useState(null);
        const menuOpen = Boolean(anchorEl);

        const handleOpenMenu = (e) => setAnchorEl(e.currentTarget);
        const handleCloseMenu = () => setAnchorEl(null);

        const handleAction = (action) => {
            handleCloseMenu();
            action(shipment);
        };

        const menuItems = [
            { label: t('edit'),            icon: <EditIcon fontSize="small" />,         color: 'primary.main',   action: handleOpenEditShipment },
            { label: t('generateManifest'),icon: <DescriptionIcon fontSize="small" />, color: 'primary.main',   action: handleExportManifest },
            { label: t('generateRemision'),icon: <ReceiptIcon fontSize="small" />,     color: 'success.main',   action: handleExportRemision },
            { label: t('bitacoraSellos'),  icon: <FactCheckIcon fontSize="small" />,   color: 'secondary.main', action: handleOpenBitacoraModal },
            { label: t('details'),         icon: <VisibilityIcon fontSize="small" />,  color: 'info.main',      action: handleViewDetails },
            { label: t('delete'),          icon: <DeleteForeverIcon fontSize="small" />,color: 'error.main',    action: handleDeleteShipment, divider: true },
        ];

        return (
            <Paper
                elevation={0}
                sx={{
                    p: 2, mb: 2, borderRadius: 3, border: '1px solid', borderColor: 'divider',
                    transition: '0.3s', '&:hover': { boxShadow: '0 4px 20px 0 rgba(0,0,0,0.05)' }
                }}
            >
                {/* Header */}
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Avatar
                        variant="rounded"
                        sx={{ width: 42, height: 42, mr: 2, flexShrink: 0, bgcolor: 'primary.main' }}
                    >
                        <LocalShippingIcon sx={{ color: 'white', fontSize: 22 }} />
                    </Avatar>
                    <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
                            {t('remisionNo')}: {formatRemision(shipment.shipmentNo)}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" noWrap>
                            {shipment.idDriverNavigation?.name || '-'}
                        </Typography>
                    </Box>

                    {/* Botón 3 puntos */}
                    <IconButton size="small" onClick={handleOpenMenu} sx={{ ml: 1, flexShrink: 0 }}>
                        <MoreVertIcon />
                    </IconButton>
                    <Menu
                        anchorEl={anchorEl}
                        open={menuOpen}
                        onClose={handleCloseMenu}
                        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                        slotProps={{ paper: { elevation: 2, sx: { borderRadius: 2, minWidth: 200 } } }}
                    >
                        {menuItems.map((item, i) => (
                            <span key={i}>
                                {item.divider && <Divider sx={{ my: 0.5 }} />}
                                <MenuItem onClick={() => handleAction(item.action)} dense>
                                    <ListItemIcon sx={{ color: item.color }}>
                                        {item.icon}
                                    </ListItemIcon>
                                    <ListItemText
                                        primary={item.label}
                                        primaryTypographyProps={{ variant: 'body2', color: item.color === 'error.main' ? 'error' : 'text.primary' }}
                                    />
                                </MenuItem>
                            </span>
                        ))}
                    </Menu>
                </Box>

                <Divider sx={{ mb: 1.5, borderStyle: 'dashed' }} />

                {/* Detalle */}
                <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1, mb: 1.5 }}>
                    <Box>
                        <Typography variant="caption" color="text.secondary">{t('regFdaNo')}</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>{shipment.regFdaNo || '-'}</Typography>
                    </Box>
                    <Box>
                        <Typography variant="caption" color="text.secondary">{t('shipmentDate')}</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>{formatDate(shipment.idShipmentNavigation?.shipmentDate)}</Typography>
                    </Box>
                    <Box sx={{ gridColumn: 'span 2' }}>
                        <Typography variant="caption" color="text.secondary">{t('trailerPlate')}</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>{shipment.trailerBoxPlate || '-'}</Typography>
                    </Box>
                </Box>

                <Divider sx={{ mb: 1.5, borderStyle: 'dashed' }} />

                <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <Chip
                        label={`${t('manifestNo')}: ${formatRemision(shipment.shipmentNo)}`}
                        size="small"
                        color="primary"
                        variant="outlined"
                        sx={{ height: 24, fontSize: '0.75rem', fontWeight: 'bold', borderRadius: 1.5 }}
                    />
                </Box>
            </Paper>
        );
    };

    if (pageLoading) {
        return (
            <Box sx={{ mt: 2 }}>
                {Array.from(new Array(rowsPerPage)).map((_, index) => (
                    <Paper key={index} elevation={0} sx={{ p: 2, mb: 2, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                            <Skeleton variant="rounded" width={42} height={42} sx={{ mr: 2, flexShrink: 0 }} />
                            <Box sx={{ flexGrow: 1 }}>
                                <Skeleton width="50%" />
                                <Skeleton width="35%" />
                            </Box>
                            <Skeleton variant="circular" width={30} height={30} sx={{ ml: 1 }} />
                        </Box>
                        <Divider sx={{ mb: 1.5 }} />
                        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1, mb: 1.5 }}>
                            <Skeleton width="80%" />
                            <Skeleton width="80%" />
                            <Skeleton width="60%" sx={{ gridColumn: 'span 2' }} />
                        </Box>
                        <Divider sx={{ mb: 1.5 }} />
                        <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                            <Skeleton variant="rounded" width={120} height={24} />
                        </Box>
                    </Paper>
                ))}
            </Box>
        );
    }

    if ((shipments?.length ?? 0) === 0) {
        return (
            <Box sx={{ mt: 2 }}>
                <EmptyData
                    isSearch={isSearch}
                    title={isSearch ? t('records_notFound') : t('no_results_found')}
                    description={isSearch ? t('try_another_search_term') : t('shipments_description')}
                />
            </Box>
        );
    }

    return (
        <Box sx={{ mt: 2 }}>
            {shipments.map((shipment, index) => (
                <MobileShipmentCard key={shipment.idShipment || index} shipment={shipment} />
            ))}
        </Box>
    );
};

export default ShipmentCardList;