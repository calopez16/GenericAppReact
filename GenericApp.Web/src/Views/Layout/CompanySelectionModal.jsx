import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '@config';
import { useTranslation } from 'react-i18next';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    List,
    ListItem,
    ListItemButton,
    ListItemAvatar,
    ListItemText,
    Avatar,
    IconButton,
    Button,
    Chip,
    Typography,
    Box,
    CircularProgress,
    Paper,
    Divider,
    Tooltip
} from '@mui/material';
import BusinessIcon from '@mui/icons-material/Business';
import CloseIcon from '@mui/icons-material/Close';
import { DataAPICompaniesService } from '@data/Companies/Data';

const CompanySelectionModal = ({ open, onClose, onSelectCompany, selectedCompanyId, forceSelection }) => {
    const [companies, setCompanies] = useState([]);
    const [loading, setLoading] = useState(false);
    const { t } = useTranslation();

    const cityDataCompanies = DataAPICompaniesService();

    useEffect(() => {
        let timeoutId;
        if (open) {
            const fetchCompanies = async () => {
                setLoading(true);
                try {
                    const response = await cityDataCompanies.getDataActive();
                    if (response.success && Array.isArray(response.data)) {
                        setCompanies(response.data);
                    }
                } catch (error) {
                    console.error("Error al cargar las compañías:", error);
                } finally {
                    setLoading(false);
                }
            };
            fetchCompanies();
        } else {
            timeoutId = setTimeout(() => { setCompanies([]); }, 1000);
        }
        return () => { if (timeoutId) clearTimeout(timeoutId); };
    }, [open]);

    const handleDialogClose = (event, reason) => {
        if (forceSelection && (reason === 'backdropClick' || reason === 'escapeKeyDown')) {
            return;
        }
        onClose();
    };

    return (
        <Dialog
            open={open}
            onClose={handleDialogClose}
            fullWidth
            maxWidth="xs"
            disableEscapeKeyDown={forceSelection}
            PaperProps={{ sx: { borderRadius: 3 } }}
        >
            <DialogTitle sx={{ p: 0 }}>
                <Paper
                    elevation={0}
                    sx={{
                        px: 2.5,
                        py: 2,
                        borderRadius: 0,
                        borderBottom: '1px solid',
                        borderColor: 'divider',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        gap: 2
                    }}
                >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Avatar sx={{ bgcolor: 'primary.light', color: 'white', width: 45, height: 45, borderRadius: 2 }}>
                            <BusinessIcon />
                        </Avatar>
                        <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
                            {t('selectCompany')}
                        </Typography>
                    </Box>

                    {!forceSelection && (
                        <Tooltip title={t('close')}>
                            <IconButton onClick={onClose} size="small" sx={{ color: 'text.secondary' }}>
                                <CloseIcon />
                            </IconButton>
                        </Tooltip>
                    )}
                </Paper>
            </DialogTitle>

            <DialogContent sx={{ p: 0 }}>
                {loading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                        <CircularProgress />
                    </Box>
                ) : (
                    <List disablePadding>
                        {companies.length > 0 ? (
                            companies.map((company, index) => (
                                <React.Fragment key={company.idCompany}>
                                    <ListItem disableGutters>
                                        <ListItemButton
                                            onClick={() => onSelectCompany(company)}
                                            selected={selectedCompanyId === company.idCompany}
                                            sx={{
                                                px: 2.5,
                                                py: 1.5,
                                                borderLeft: '3px solid transparent',
                                                borderRight: '3px solid transparent',
                                                ...(selectedCompanyId === company.idCompany && {
                                                    borderLeftColor: 'primary.main',
                                                    borderRightColor: 'primary.main',
                                                })
                                            }}
                                        >
                                            <ListItemAvatar sx={{ mr: 1.5 }}>
                                                <Avatar
                                                    src={API_BASE_URL + "/img/logos/" + company?.logoName}
                                                    alt={company.name}
                                                    sx={{ width: 68, height: 68, borderRadius: 2 }}
                                                >
                                                    <BusinessIcon sx={{ fontSize: 40 }} />
                                                </Avatar>
                                            </ListItemAvatar>
                                            <ListItemText
                                                primary={company.name}
                                                secondary={company.rfc || null}
                                                primaryTypographyProps={{ variant: 'subtitle1', fontWeight: 600 }}
                                            />
                                            {selectedCompanyId === company.idCompany && (
                                                <Chip
                                                    label={t('selected')}
                                                    size="small"
                                                    color="primary"
                                                    variant="filled"
                                                    sx={{ ml: 1, fontWeight: 600 }}
                                                />
                                            )}
                                        </ListItemButton>
                                    </ListItem>
                                    {index < companies.length - 1 && <Divider component="li" />}
                                </React.Fragment>
                            ))
                        ) : (
                            <Typography align="center" sx={{ p: 3, color: 'text.secondary' }}>
                                {t('noCompaniesFound')}
                            </Typography>
                        )}
                    </List>
                )}
            </DialogContent>

            <Divider />

            <DialogActions sx={{ p: 2, justifyContent: 'flex-end' }}>
                {!forceSelection && (
                    <Button
                        variant="outlined"
                        color="inherit"
                        startIcon={<CloseIcon />}
                        onClick={onClose}
                    >
                        {t('close')}
                    </Button>
                )}
            </DialogActions>
        </Dialog>
    );
};

export default CompanySelectionModal;