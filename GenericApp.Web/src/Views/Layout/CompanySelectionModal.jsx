import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '@config';
import { useTranslation } from 'react-i18next';

// MUI Imports
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import ListItemText from '@mui/material/ListItemText';
import Avatar from '@mui/material/Avatar';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';

// Icons
import BusinessIcon from '@mui/icons-material/Business';
import CloseIcon from '@mui/icons-material/Close';

// Servicio
import { DataAPICompaniesService } from '@data/Companies/Data';

const CompanySelectionModal = ({ open, onClose, onSelectCompany, selectedCompanyId, forceSelection }) => {
    const [companies, setCompanies] = useState([]);
    const [loading, setLoading] = useState(false);
    const { t } = useTranslation();

    const cityDataCompanies = DataAPICompaniesService();

    // Lógica de carga y limpieza con timeout
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

    // --- MANEJADOR DE CIERRE DEL DIÁLOGO ---
    const handleDialogClose = (event, reason) => {
        // Si la selección es forzosa, ignoramos clic afuera (backdropClick) o tecla ESC (escapeKeyDown)
        if (forceSelection && (reason === 'backdropClick' || reason === 'escapeKeyDown')) {
            return;
        }
        // Si no es forzosa, ejecutamos la función onClose del padre
        onClose();
    };

    return (
        <Dialog
            open={open}
            onClose={handleDialogClose} // Usamos nuestro handler interceptor
            fullWidth
            maxWidth="xs"
            disableEscapeKeyDown={forceSelection} // Deshabilitamos ESC visualmente también
        >
            <DialogTitle sx={{ m: 0, p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h6">
                    {t('selectCompany')}
                </Typography>

                {/* Ocultamos el botón X si la selección es obligatoria */}
                {!forceSelection && (
                    <IconButton
                        aria-label="close"
                        onClick={onClose}
                        sx={{ color: (theme) => theme.palette.grey[500] }}
                    >
                        <CloseIcon />
                    </IconButton>
                )}
            </DialogTitle>

            <DialogContent dividers>
                {loading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                        <CircularProgress />
                    </Box>
                ) : (
                    <List sx={{ pt: 0 }}>
                        {companies.length > 0 ? (
                            companies.map((company) => (
                                <ListItem disableGutters key={company.idCompany}>
                                    <ListItemButton
                                        onClick={() => onSelectCompany(company)}
                                        selected={selectedCompanyId === company.idCompany}
                                        sx={{ borderRadius: 1, py: 1.5 }}
                                    >
                                        <ListItemAvatar sx={{ mr: 2 }}>
                                            <Avatar
                                                src={API_BASE_URL + "/img/logos/" + company?.logoName}
                                                alt={company.name}
                                                sx={{ width: 64, height: 64 }}
                                            >
                                                <BusinessIcon sx={{ fontSize: 36 }} />
                                            </Avatar>
                                        </ListItemAvatar>
                                        <ListItemText
                                            primary={company.name}
                                            secondary={company.rfc || null}
                                            primaryTypographyProps={{ variant: 'subtitle1', fontWeight: 'medium' }}
                                        />
                                    </ListItemButton>
                                </ListItem>
                            ))
                        ) : (
                            <Typography align="center" sx={{ p: 2, color: 'text.secondary' }}>
                                {t('noCompaniesFound')}
                            </Typography>
                        )}
                    </List>
                )}
            </DialogContent>
        </Dialog>
    );
};

export default CompanySelectionModal;