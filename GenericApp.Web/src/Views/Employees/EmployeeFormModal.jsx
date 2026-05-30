import React, { useState, useEffect } from 'react';
import {
    Dialog, DialogTitle, DialogContent, DialogActions,
    TextField, Button, Box, Typography, IconButton, Divider,
    Grid, MenuItem, Select, FormControl, InputLabel
} from '@mui/material';
import CancelIcon from '@mui/icons-material/Clear';
import SaveIcon from '@mui/icons-material/Save';
import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';
import EditIcon from '@mui/icons-material/Edit';
import { useTranslation } from 'react-i18next';
import { ShowMessage } from '@helpers/NotificationService';
import { DataAPIEmployeesService } from '@data/Employees/Data';

const INITIAL_FORM = {
    idEmployee: null,
    clave: '',
    nombre: '',
    apellidoPaterno: '',
    apellidoMaterno: '',
    address: '',
    rfc: '',
    curp: '',
    imss: '',
    genre: '',
    civilStatus: '',
    position: '',
    birthDate: '',
    isActive: true,
    isDeleted: false,
    idCompany: null,
};

const EmployeeFormModal = ({ open, handleClose, data, isEditing, setData, idCompany }) => {
    const { t } = useTranslation();
    const service = DataAPIEmployeesService();
    const [formData, setFormData] = useState(INITIAL_FORM);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (open) {
            if (isEditing && data) {
                setFormData({
                    idEmployee: data.idEmployee,
                    clave: data.clave ?? '',
                    nombre: data.nombre ?? '',
                    apellidoPaterno: data.apellidoPaterno ?? '',
                    apellidoMaterno: data.apellidoMaterno ?? '',
                    address: data.address ?? '',
                    rfc: data.rfc ?? '',
                    curp: data.curp ?? '',
                    imss: data.imss ?? '',
                    genre: data.genre ?? '',
                    civilStatus: data.civilStatus ?? '',
                    position: data.position ?? '',
                    birthDate: data.birthDate ? data.birthDate.substring(0, 10) : '',
                    isActive: data.isActive ?? true,
                    isDeleted: data.isDeleted ?? false,
                    idCompany: data.idCompany ?? idCompany,
                });
            } else {
                setFormData({ ...INITIAL_FORM, idCompany });
            }
        }
    }, [open, data, isEditing, idCompany]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async () => {
        if (!formData.nombre?.trim() || !formData.apellidoPaterno?.trim()) {
            ShowMessage(t('requiredFields'), 'warning');
            return;
        }
        setLoading(true);
        try {
            const payload = {
                ...formData,
                clave: formData.clave ? Number(formData.clave) : 0,
                birthDate: formData.birthDate || null,
            };
            const result = isEditing
                ? await service.updateEmployee(payload)
                : await service.addEmployee(payload);

            if (result.success) {
                ShowMessage(t(isEditing ? 'recordUpdated' : 'recordAdded'), 'success');
                setData(prev => isEditing
                    ? prev.map(e => e.idEmployee === formData.idEmployee ? result.data : e)
                    : [result.data, ...prev]
                );
                handleClose();
            } else if (result.conflict) {
                ShowMessage(`${t('dataAlreadyExists')}: ${result.conflict}`, 'warning');
            } else {
                ShowMessage(t('error'), 'error');
            }
        } catch {
            ShowMessage(t('error'), 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onClose={handleClose} fullScreen>
            <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pb: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {isEditing ? <EditIcon color="primary" /> : <AddIcon color="primary" />}
                    <Typography variant="h6" sx={{ fontWeight: 700 }}>
                        {t(isEditing ? 'employee_edit' : 'employee_add')}
                    </Typography>
                </Box>
                <IconButton onClick={handleClose} size="small"><CloseIcon /></IconButton>
            </DialogTitle>
            <Divider />
            <DialogContent>
                <Grid container spacing={{ xs: 2, md: 3 }} columns={{ xs: 4, sm: 8, md: 12 }} sx={{ mt: 0.5 }}>
                    <Grid size={{ xs: 4, sm: 4, md: 4 }}>
                        <TextField fullWidth label={t('employee_clave')} name="clave" value={formData.clave}
                            onChange={handleChange} type="number" size="small" />
                    </Grid>
                    <Grid size={{ xs: 4, sm: 4, md: 4 }}>
                        <TextField fullWidth required label={t('employee_nombre')} name="nombre" value={formData.nombre}
                            onChange={handleChange} size="small" />
                    </Grid>
                    <Grid size={{ xs: 4, sm: 4, md: 4 }}>
                        <TextField fullWidth required label={t('employee_apellidoPaterno')} name="apellidoPaterno"
                            value={formData.apellidoPaterno} onChange={handleChange} size="small" />
                    </Grid>
                    <Grid size={{ xs: 4, sm: 4, md: 4 }}>
                        <TextField fullWidth label={t('employee_apellidoMaterno')} name="apellidoMaterno"
                            value={formData.apellidoMaterno} onChange={handleChange} size="small" />
                    </Grid>
                    <Grid size={{ xs: 4, sm: 4, md: 4 }}>
                        <TextField fullWidth label={t('employee_rfc')} name="rfc" value={formData.rfc}
                            onChange={handleChange} size="small" inputProps={{ maxLength: 13 }} />
                    </Grid>
                    <Grid size={{ xs: 4, sm: 4, md: 4 }}>
                        <TextField fullWidth label={t('employee_curp')} name="curp" value={formData.curp}
                            onChange={handleChange} size="small" inputProps={{ maxLength: 18 }} />
                    </Grid>
                    <Grid size={{ xs: 4, sm: 4, md: 4 }}>
                        <TextField fullWidth label={t('employee_imss')} name="imss" value={formData.imss}
                            onChange={handleChange} size="small" inputProps={{ maxLength: 11 }} />
                    </Grid>
                    <Grid size={{ xs: 4, sm: 4, md: 4 }}>
                        <FormControl fullWidth size="small">
                            <InputLabel>{t('employee_genre')}</InputLabel>
                            <Select name="genre" value={formData.genre} label={t('employee_genre')} onChange={handleChange}>
                                <MenuItem value="M">{t('employee_genre_m')}</MenuItem>
                                <MenuItem value="F">{t('employee_genre_f')}</MenuItem>
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid size={{ xs: 4, sm: 4, md: 4 }}>
                        <TextField fullWidth label={t('employee_civilStatus')} name="civilStatus"
                            value={formData.civilStatus} onChange={handleChange} size="small" />
                    </Grid>
                    <Grid size={{ xs: 4, sm: 4, md: 4 }}>
                        <TextField fullWidth label={t('employee_position')} name="position"
                            value={formData.position} onChange={handleChange} size="small" />
                    </Grid>
                    <Grid size={{ xs: 4, sm: 4, md: 4 }}>
                        <TextField fullWidth label={t('employee_birthDate')} name="birthDate"
                            value={formData.birthDate} onChange={handleChange} size="small" type="date"
                            InputLabelProps={{ shrink: true }} />
                    </Grid>
                    <Grid size={{ xs: 4, sm: 8, md: 12 }}>
                        <TextField fullWidth label={t('address')} name="address" value={formData.address}
                            onChange={handleChange} size="small" />
                    </Grid>
                </Grid>
            </DialogContent>
            <Divider />
            <DialogActions sx={{ px: 3, py: 2, gap: 1 }}>
                <Button variant="outlined" startIcon={<CancelIcon />} onClick={handleClose} disabled={loading}>
                    {t('cancel')}
                </Button>
                <Button variant="contained" disableElevation startIcon={<SaveIcon />} onClick={handleSubmit} disabled={loading}>
                    {t(isEditing ? 'update' : 'save')}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default EmployeeFormModal;
