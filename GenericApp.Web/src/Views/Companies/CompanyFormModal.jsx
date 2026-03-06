import React, { useState, useEffect, useRef } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Button,
    Box,
    Typography,
    Grid,
    IconButton,
    Avatar,
    Divider,
    Tooltip,
    CircularProgress
} from '@mui/material';
import CancelIcon from '@mui/icons-material/Clear';
import SaveIcon from '@mui/icons-material/Save';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import CloseIcon from '@mui/icons-material/Close';
import BusinessIcon from '@mui/icons-material/Business';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';

import { DataAPICompaniesService } from '@data/Companies/Data';
import { useTranslation } from 'react-i18next';
import { ShowMessage } from '@helpers/NotificationService';
import { API_BASE_URL } from '@config';

const CompanyFormModal = ({ open, handleClose, data, isEditing, setData }) => {
    const { t } = useTranslation();
    const dataService = DataAPICompaniesService();

    const nameRef = useRef(null);
    const fileInputRef = useRef(null);

    const initialFormState = {
        idCompany: 0,
        name: '',
        rfc: '',
        address: '',
        postalCode: '',
        razonSocial: '',
        phone: '',
        notes: '',
        regFdaNo: '',
        empaque: '',
        gnnNumber: '',
        logoName: '',
        logo: null
    };

    const [formData, setFormData] = useState(initialFormState);
    const [isLoading, setIsLoading] = useState(false);
    const [originalLogoUrl, setOriginalLogoUrl] = useState(null);
    const [newLogoPreview, setNewLogoPreview] = useState(null);
    const [validationErrors, setValidationErrors] = useState({ name: false });
    const [showErrors, setShowErrors] = useState(false);

    useEffect(() => {
        if (open) {
            if (isEditing && data) {
                setFormData({
                    idCompany: data.idCompany || 0,
                    name: data.name || '',
                    rfc: data.rfc || '',
                    address: data.address || '',
                    razonSocial: data.razonSocial || '',
                    postalCode: data.postalCode || '',
                    phone: data.phone || '',
                    notes: data.notes || '',
                    regFdaNo: data.regFdaNo || '',
                    empaque: data.empaque || '',
                    gnnNumber: data.gnnNumber || '',
                    logoName: data.logoName || '',
                    logo: null
                });
                setOriginalLogoUrl(data.logoName ? `${API_BASE_URL}/img/logos/${data.logoName}` : null);
            } else {
                setFormData(initialFormState);
                setOriginalLogoUrl(null);
            }
            setNewLogoPreview(null);
            setValidationErrors({ name: !isEditing || !data?.name });
            setShowErrors(false);
            setTimeout(() => { if (nameRef.current) nameRef.current.focus(); }, 100);
        }
    }, [open, isEditing, data]);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFormData(prev => ({ ...prev, logo: file }));
            const objectUrl = URL.createObjectURL(file);
            setNewLogoPreview(objectUrl);
        }
    };

    const handleCancelLogoEdit = () => {
        setFormData(prev => ({ ...prev, logo: null }));
        if (newLogoPreview) URL.revokeObjectURL(newLogoPreview);
        setNewLogoPreview(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    const handleSubmit = async (e) => {
        if (e) e.preventDefault();
        setShowErrors(true);
        if (!formData.name.trim()) {
            setValidationErrors({ name: true });
            ShowMessage(t('emptyFields'), 'warning');
            return;
        }

        try {
            setIsLoading(true);
            const dataToSend = new FormData();
            Object.keys(formData).forEach(key => {
                if (key === 'logo') {
                    if (formData.logo) dataToSend.append('Logo', formData.logo);
                } else {
                    dataToSend.append(key.charAt(0).toUpperCase() + key.slice(1), formData[key]);
                }
            });

            const response = isEditing ? await dataService.editData(dataToSend, true) : await dataService.addData(dataToSend, true);

            if (response.responseCode == 409) {
                ShowMessage(t('dataAlreadyExists') + ": " + response.conflict, 'warning');
                return;
            }

            if (response.success) {
                if (isEditing) {
                    setData(prev => prev.map(item => item.idCompany === formData.idCompany ? { ...item, ...formData, logoName: response.data?.logoName || item.logoName } : item));
                } else {
                    setData(prev => [...prev, response.data]);
                }
                handleClose();
                ShowMessage(t(isEditing ? 'recordEditedSuccessPlural' : 'recordAddedSuccessPlural'), 'success');
            } else {
                ShowMessage(response.message || t('error'), 'error');
            }
        } catch (error) {
            ShowMessage(t('error'), 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const renderLogoBox = (src, label, isEditable = true, isNew = false) => (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
            <Typography variant="caption" fontWeight="bold" color="textSecondary">{label}</Typography>
            <Box sx={{ position: 'relative' }}>
                <Box
                    sx={{
                        width: 130, height: 130, borderRadius: 2, overflow: 'hidden', border: '2px dashed',
                        borderColor: isNew ? 'primary.main' : 'divider', display: 'flex', justifyContent: 'center',
                        alignItems: 'center', bgcolor: '#f9f9f9', cursor: isEditable ? 'pointer' : 'default',
                        transition: 'all 0.2s', '&:hover': { borderColor: isEditable ? 'primary.main' : 'divider' }
                    }}
                    onClick={isEditable ? () => fileInputRef.current.click() : undefined}
                >
                    {src ? <img src={src} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'contain' }} /> :
                        <Typography variant="caption" sx={{ p: 1, textAlign: 'center' }}>{t('no_logo')}</Typography>}
                    {isEditable && <Box sx={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', bgcolor: 'rgba(0,0,0,0.4)', display: 'flex', justifyContent: 'center', alignItems: 'center', opacity: 0, transition: 'opacity 0.2s', color: 'white', '&:hover': { opacity: 1 } }}><EditIcon /></Box>}
                </Box>
                {isNew && (
                    <IconButton size="small" color="error" onClick={(e) => { e.stopPropagation(); handleCancelLogoEdit(); }} sx={{ position: 'absolute', top: -10, right: -10, bgcolor: 'white', boxShadow: 1 }}>
                        <CancelIcon fontSize="small" />
                    </IconButton>
                )}
            </Box>
        </Box>
    );

    return (
        <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
            <form onSubmit={handleSubmit} noValidate>
                <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', py: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Avatar sx={{ bgcolor: 'primary.light', color: 'white', width: 42, height: 42, borderRadius: 2 }}>
                            {isEditing ? <EditIcon /> : <BusinessIcon />}
                        </Avatar>
                        <Box>
                            <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
                                {isEditing ? t('edit_company') : t('add_company')}
                            </Typography>
                        </Box>
                    </Box>
                    <Tooltip title={t('close')}>
                        <IconButton onClick={handleClose} size="small" sx={{ color: 'text.secondary' }}>
                            <CloseIcon />
                        </IconButton>
                    </Tooltip>
                </DialogTitle>

                <Divider />

                <DialogContent>
                    <Box sx={{ mt: 1 }}>
                        <Grid container spacing={3}>
                            {/* LOGO */}
                            <Grid item size={{ xs: 12 }} sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                                <input type="file" accept="image/*" hidden ref={fileInputRef} onChange={handleFileChange} />
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 2, sm: 5 } }}>
                                    {newLogoPreview ? (
                                        <>
                                            {renderLogoBox(originalLogoUrl, t('current_logo'), false)}
                                            <ArrowForwardIcon color="disabled" sx={{ fontSize: 30 }} />
                                            {renderLogoBox(newLogoPreview, t('new_logo'), true, true)}
                                        </>
                                    ) : (
                                        renderLogoBox(originalLogoUrl, t('company_logo'), true)
                                    )}
                                </Box>
                            </Grid>

                            {/* CAMPOS PRINCIPALES */}
                            <Grid item size={{ xs: 12 }}>
                                <TextField label={t('name')} name="name" value={formData.name}
                                    onChange={(e) => {
                                        setFormData({ ...formData, name: e.target.value });
                                        setValidationErrors({ name: !e.target.value.trim() });
                                    }}
                                    fullWidth required inputRef={nameRef}
                                    error={showErrors && validationErrors.name}
                                    helperText={showErrors && validationErrors.name ? t('requiredField') : ''}
                                    inputProps={{ maxLength: 150 }}
                                />
                            </Grid>
                            <Grid item size={{ xs: 12 }}>
                                <TextField label={t('socialReason')} name="razonSocial" value={formData.razonSocial} onChange={(e) => setFormData({ ...formData, razonSocial: e.target.value })} fullWidth inputProps={{ maxLength: 250 }} />
                            </Grid>
                            <Grid item size={{ xs: 12, md: 6 }}>
                                <TextField label={t('rfc')} name="rfc" value={formData.rfc} onChange={(e) => setFormData({ ...formData, rfc: e.target.value })} fullWidth inputProps={{ maxLength: 13 }} />
                            </Grid>

                            <Grid item size={{ xs: 12, md: 6 }}>
                                <TextField label={t('phone')} name="phone" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} fullWidth inputProps={{ maxLength: 25 }} />
                            </Grid>

                            <Grid item size={{ xs: 12 }}>
                                <TextField label={t('address')} name="address" value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} fullWidth inputProps={{ maxLength: 250 }} />
                            </Grid>

                            <Grid item size={{ xs: 12, md: 4 }}>
                                <TextField label={t('postal_code')} name="postalCode" value={formData.postalCode} onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })} fullWidth inputProps={{ maxLength: 50 }} />
                            </Grid>

                            <Grid item size={{ xs: 12, md: 4 }}>
                                <TextField label={t('reg_fda_no')} name="regFdaNo" value={formData.regFdaNo} onChange={(e) => setFormData({ ...formData, regFdaNo: e.target.value })} fullWidth inputProps={{ maxLength: 50 }} />
                            </Grid>

                            <Grid item size={{ xs: 12, md: 4 }}>
                                <TextField label={t('empaque')} name="empaque" value={formData.empaque} onChange={(e) => setFormData({ ...formData, empaque: e.target.value })} fullWidth inputProps={{ maxLength: 80 }} />
                            </Grid>

                            <Grid item size={{ xs: 12, md: 4 }}>
                                <TextField label={t('gnnNumber')} name="gnnNumber" value={formData.gnnNumber} onChange={(e) => setFormData({ ...formData, gnnNumber: e.target.value })} fullWidth inputProps={{ maxLength: 150 }} />
                            </Grid>

                            <Grid item size={{ xs: 12 }}>
                                <TextField
                                    label={t('notes')} name="notes" value={formData.notes}
                                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                    fullWidth multiline rows={3} inputProps={{ maxLength: 250 }}
                                />
                            </Grid>
                        </Grid>
                    </Box>
                </DialogContent>

                <Divider />

                <DialogActions sx={{ p: 2.5 }}>
                    <Button color="error" variant="outlined" endIcon={<CancelIcon />} onClick={handleClose}>
                        {t('cancel')}
                    </Button>
                    <Button
                        type="submit" color="primary" variant="contained" disableElevation
                        disabled={isLoading}
                        endIcon={isLoading
                            ? <CircularProgress size={18} color="inherit" />
                            : isEditing ? <SaveIcon /> : <AddIcon />
                        }
                    >
                        {isEditing ? t('save') : t('add')}
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    );
};

export default CompanyFormModal;