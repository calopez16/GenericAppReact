import React, { useState, useEffect } from 'react';
import {
    Dialog, DialogTitle, DialogContent, DialogActions,
    TextField, Button, Box, Typography, IconButton, Divider,
    Grid, MenuItem, Select, FormControl, InputLabel, Tab, Tabs,
    Table, TableBody, TableCell, TableHead, TableRow, TableContainer, Checkbox,
    FormControlLabel, Paper, Tooltip, Autocomplete, CircularProgress
} from '@mui/material';
import CancelIcon from '@mui/icons-material/Clear';
import SaveIcon from '@mui/icons-material/Save';
import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import PersonIcon from '@mui/icons-material/Person';
import FamilyRestroomIcon from '@mui/icons-material/FamilyRestroom';
import PeopleIcon from '@mui/icons-material/People';
import ContactPhoneIcon from '@mui/icons-material/ContactPhone';
import { useTranslation } from 'react-i18next';
import { ShowMessage } from '@helpers/NotificationService';
import { DataAPIEmployeesService } from '@data/Employees/Data';
import EmptyData from '@layout/EmptyData';

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
    employeeWorkInformations: [],
    beneficiaries: [],
    dependents: [],
    employeeEmergencyContacts: [],
};

const INITIAL_WORK_INFO = {
    idEmployeeWorkInformation: null,
    dailySalary: '',
    integralSalary: '',
    payType: '',
    initialDate: '',
    contractExpiration: '',
    isActive: true,
    isDeleted: false,
};

const INITIAL_BENEFICIARY = { idEmployeeBeneficiarie: null, name: '', idEmployeeRelationshipType: '', percentage: '', isActive: true, isDeleted: false };
const INITIAL_DEPENDENT = { idEmployeeDependents: null, name: '', lastName: '', birthDate: '', idEmployeeRelationshipType: '', isAlive: true, isActive: true, isDeleted: false };
const INITIAL_EMERGENCY = { idEmployeeEmergencyContact: null, name: '', relationship: '', phone: '', birthDate: '', isActive: true, isDeleted: false };

const EmployeeFormModal = ({ open, handleClose, data, isEditing, setData, idCompany }) => {
    const { t } = useTranslation();
    const service = DataAPIEmployeesService();
    const [formData, setFormData] = useState(INITIAL_FORM);
    const [loading, setLoading] = useState(false);
    const [tab, setTab] = useState(0);
    const [relationshipTypes, setRelationshipTypes] = useState([]);

    useEffect(() => {
        if (open) {
            service.getRelationshipTypes().then(r => { if (r?.success) setRelationshipTypes(r.data ?? []); });
            setTab(0);
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
                    employeeWorkInformations: data.employeeWorkInformations?.length
                        ? [{ ...data.employeeWorkInformations[0], initialDate: data.employeeWorkInformations[0].initialDate?.substring(0, 10) ?? '', contractExpiration: data.employeeWorkInformations[0].contractExpiration?.substring(0, 10) ?? '' }]
                        : [],
                    beneficiaries: data.beneficiaries ?? [],
                    dependents: data.dependents?.map(d => ({ ...d, birthDate: d.birthDate?.substring(0, 10) ?? '' })) ?? [],
                    employeeEmergencyContacts: data.employeeEmergencyContacts?.map(e => ({ ...e, birthDate: e.birthDate?.substring(0, 10) ?? '' })) ?? [],
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

    const handleWorkInfoChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            employeeWorkInformations: [{ ...(prev.employeeWorkInformations[0] ?? INITIAL_WORK_INFO), [name]: value }]
        }));
    };

    const handleListAdd = (field, initial) =>
        setFormData(prev => ({ ...prev, [field]: [...prev[field], { ...initial }] }));

    const handleListChange = (field, index, e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => {
            const list = [...prev[field]];
            list[index] = { ...list[index], [name]: type === 'checkbox' ? checked : value };
            return { ...prev, [field]: list };
        });
    };

    const handleListRemove = (field, index) =>
        setFormData(prev => ({ ...prev, [field]: prev[field].filter((_, i) => i !== index) }));

    const handleRelationshipTypeCreate = async (inputValue, field, index) => {
        const result = await service.addRelationshipType({ description: inputValue, isActive: true, isDeleted: false });
        if (result?.success) {
            const newType = result.data;
            setRelationshipTypes(prev => [...prev, newType]);
            setFormData(prev => {
                const list = [...prev[field]];
                list[index] = { ...list[index], idEmployeeRelationshipType: newType.idEmployeeRelationshipType };
                return { ...prev, [field]: list };
            });
        } else {
            ShowMessage(t('error'), 'error');
        }
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

    const workInfo = formData.employeeWorkInformations[0] ?? INITIAL_WORK_INFO;

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
            <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ px: 3, borderBottom: 1, borderColor: 'divider' }}>
                <Tab icon={<PersonIcon />} iconPosition="start" label={t('employee_tab_general')} />
                <Tab icon={<FamilyRestroomIcon />} iconPosition="start" label={t('employee_tab_beneficiaries')} />
                <Tab icon={<PeopleIcon />} iconPosition="start" label={t('employee_tab_dependents')} />
                <Tab icon={<ContactPhoneIcon />} iconPosition="start" label={t('employee_tab_emergencyContacts')} />
            </Tabs>
            <DialogContent>

                {/* TAB 0 – Datos Generales */}
                {tab === 0 && (
                    <>
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

                    {/* Sección – Información Laboral */}
                    <Box sx={{ mt: 3, mb: 1 }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                            {t('employee_workInfo')}
                        </Typography>
                        <Divider sx={{ mb: 2 }} />
                    </Box>
                    <Grid container spacing={{ xs: 2, md: 3 }} columns={{ xs: 4, sm: 8, md: 12 }}>
                        <Grid size={{ xs: 4, sm: 4, md: 4 }}>
                            <TextField fullWidth label={t('employee_dailySalary')} name="dailySalary"
                                value={workInfo.dailySalary} onChange={handleWorkInfoChange} size="small" type="number" />
                        </Grid>
                        <Grid size={{ xs: 4, sm: 4, md: 4 }}>
                            <TextField fullWidth label={t('employee_integralSalary')} name="integralSalary"
                                value={workInfo.integralSalary} onChange={handleWorkInfoChange} size="small" type="number" />
                        </Grid>
                        <Grid size={{ xs: 4, sm: 4, md: 4 }}>
                            <TextField fullWidth label={t('employee_payType')} name="payType"
                                value={workInfo.payType} onChange={handleWorkInfoChange} size="small" />
                        </Grid>
                        <Grid size={{ xs: 4, sm: 4, md: 4 }}>
                            <TextField fullWidth label={t('employee_initialDate')} name="initialDate"
                                value={workInfo.initialDate} onChange={handleWorkInfoChange} size="small" type="date"
                                InputLabelProps={{ shrink: true }} />
                        </Grid>
                        <Grid size={{ xs: 4, sm: 4, md: 4 }}>
                            <TextField fullWidth label={t('employee_contractExpiration')} name="contractExpiration"
                                value={workInfo.contractExpiration} onChange={handleWorkInfoChange} size="small" type="date"
                                InputLabelProps={{ shrink: true }} />
                        </Grid>
                    </Grid>
                    </>
                )}

                {/* TAB 1 – Beneficiarios */}
                {tab === 1 && (
                    <Box sx={{ mt: 1 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 1 }}>
                            <Button size="small" startIcon={<AddIcon />} variant="outlined"
                                onClick={() => handleListAdd('beneficiaries', INITIAL_BENEFICIARY)}>
                                {t('add')}
                            </Button>
                        </Box>
                        <TableContainer component={Paper} elevation={0}
                            sx={{ overflowX: 'auto', border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
                            <Table size="small" aria-label="beneficiaries table">
                                <TableHead sx={{ bgcolor: 'action.hover' }}>
                                    <TableRow>
                                        <TableCell sx={{ fontWeight: 'bold' }}>{t('employee_beneficiary_name')}</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold' }}>{t('employee_relationshipType')}</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold' }}>{t('employee_beneficiary_percentage')}</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold', width: 100 }} align="center">{t('actions')}</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {formData.beneficiaries.map((b, i) => (
                                        <TableRow key={i}>
                                            <TableCell>
                                                <TextField size="small" name="name" value={b.name}
                                                    placeholder={t('employee_beneficiary_name')}
                                                    onChange={e => handleListChange('beneficiaries', i, e)} fullWidth />
                                            </TableCell>
                                            <TableCell>
                                                <Autocomplete
                                                    size="small"
                                                    options={relationshipTypes}
                                                    getOptionLabel={o => o.description ?? ''}
                                                    isOptionEqualToValue={(o, v) => o.idEmployeeRelationshipType === v.idEmployeeRelationshipType}
                                                    value={relationshipTypes.find(r => r.idEmployeeRelationshipType === b.idEmployeeRelationshipType) ?? null}
                                                    onChange={(_, newVal) => {
                                                        if (newVal?.inputValue) {
                                                            handleRelationshipTypeCreate(newVal.inputValue, 'beneficiaries', i);
                                                        } else {
                                                            handleListChange('beneficiaries', i, { target: { name: 'idEmployeeRelationshipType', value: newVal?.idEmployeeRelationshipType ?? '', type: 'text' } });
                                                        }
                                                    }}
                                                    filterOptions={(options, params) => {
                                                        const filtered = options.filter(o => o.description?.toLowerCase().includes(params.inputValue.toLowerCase()));
                                                        if (params.inputValue !== '' && !filtered.length) {
                                                            filtered.push({ inputValue: params.inputValue, description: `${t('add')}: "${params.inputValue}"` });
                                                        }
                                                        return filtered;
                                                    }}
                                                    renderInput={params => <TextField {...params} placeholder={t('employee_relationshipType')} />}
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <TextField size="small" name="percentage" value={b.percentage}
                                                    placeholder="0"
                                                    onChange={e => handleListChange('beneficiaries', i, e)} type="number" fullWidth />
                                            </TableCell>
                                            <TableCell align="center">
                                                <Tooltip title={t('delete')}>
                                                    <IconButton size="small" color="error" onClick={() => handleListRemove('beneficiaries', i)}>
                                                        <DeleteIcon fontSize="small" />
                                                    </IconButton>
                                                </Tooltip>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                        {formData.beneficiaries.length === 0 && (
                            <EmptyData title={t('noRecords')} />
                        )}
                    </Box>
                )}

                {/* TAB 2 – Dependientes */}
                {tab === 2 && (
                    <Box sx={{ mt: 1 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 1 }}>
                            <Button size="small" startIcon={<AddIcon />} variant="outlined"
                                onClick={() => handleListAdd('dependents', INITIAL_DEPENDENT)}>
                                {t('add')}
                            </Button>
                        </Box>
                        <TableContainer component={Paper} elevation={0}
                            sx={{ overflowX: 'auto', border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
                            <Table size="small" aria-label="dependents table">
                                <TableHead sx={{ bgcolor: 'action.hover' }}>
                                    <TableRow>
                                        <TableCell sx={{ fontWeight: 'bold' }}>{t('employee_dependent_name')}</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold' }}>{t('employee_dependent_lastName')}</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold' }}>{t('employee_dependent_birthDate')}</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold' }}>{t('employee_relationshipType')}</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold' }}>{t('employee_dependent_isAlive')}</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold', width: 100 }} align="center">{t('actions')}</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {formData.dependents.map((d, i) => (
                                        <TableRow key={i}>
                                            <TableCell>
                                                <TextField size="small" name="name" value={d.name}
                                                    placeholder={t('employee_dependent_name')}
                                                    onChange={e => handleListChange('dependents', i, e)} fullWidth />
                                            </TableCell>
                                            <TableCell>
                                                <TextField size="small" name="lastName" value={d.lastName}
                                                    placeholder={t('employee_dependent_lastName')}
                                                    onChange={e => handleListChange('dependents', i, e)} fullWidth />
                                            </TableCell>
                                            <TableCell>
                                                <TextField size="small" name="birthDate" value={d.birthDate} type="date"
                                                    InputLabelProps={{ shrink: true }}
                                                    onChange={e => handleListChange('dependents', i, e)} fullWidth />
                                            </TableCell>
                                            <TableCell>
                                                <Autocomplete
                                                    size="small"
                                                    options={relationshipTypes}
                                                    getOptionLabel={o => o.description ?? ''}
                                                    isOptionEqualToValue={(o, v) => o.idEmployeeRelationshipType === v.idEmployeeRelationshipType}
                                                    value={relationshipTypes.find(r => r.idEmployeeRelationshipType === d.idEmployeeRelationshipType) ?? null}
                                                    onChange={(_, newVal) => {
                                                        if (newVal?.inputValue) {
                                                            handleRelationshipTypeCreate(newVal.inputValue, 'dependents', i);
                                                        } else {
                                                            handleListChange('dependents', i, { target: { name: 'idEmployeeRelationshipType', value: newVal?.idEmployeeRelationshipType ?? '', type: 'text' } });
                                                        }
                                                    }}
                                                    filterOptions={(options, params) => {
                                                        const filtered = options.filter(o => o.description?.toLowerCase().includes(params.inputValue.toLowerCase()));
                                                        if (params.inputValue !== '' && !filtered.length) {
                                                            filtered.push({ inputValue: params.inputValue, description: `${t('add')}: "${params.inputValue}"` });
                                                        }
                                                        return filtered;
                                                    }}
                                                    renderInput={params => <TextField {...params} placeholder={t('employee_relationshipType')} />}
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <Checkbox name="isAlive" checked={!!d.isAlive}
                                                    onChange={e => handleListChange('dependents', i, e)} size="small" />
                                            </TableCell>
                                            <TableCell align="center">
                                                <Tooltip title={t('delete')}>
                                                    <IconButton size="small" color="error" onClick={() => handleListRemove('dependents', i)}>
                                                        <DeleteIcon fontSize="small" />
                                                    </IconButton>
                                                </Tooltip>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                        {formData.dependents.length === 0 && (
                            <EmptyData title={t('noRecords')} />
                        )}
                    </Box>
                )}

                {/* TAB 3 – Contactos de Emergencia */}
                {tab === 3 && (
                    <Box sx={{ mt: 1 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 1 }}>
                            <Button size="small" startIcon={<AddIcon />} variant="outlined"
                                onClick={() => handleListAdd('employeeEmergencyContacts', INITIAL_EMERGENCY)}>
                                {t('add')}
                            </Button>
                        </Box>
                        <TableContainer component={Paper} elevation={0}
                            sx={{ overflowX: 'auto', border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
                            <Table size="small" aria-label="emergency contacts table">
                                <TableHead sx={{ bgcolor: 'action.hover' }}>
                                    <TableRow>
                                        <TableCell sx={{ fontWeight: 'bold' }}>{t('employee_emergencyContact_name')}</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold' }}>{t('employee_emergencyContact_relationship')}</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold' }}>{t('employee_emergencyContact_phone')}</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold' }}>{t('employee_emergencyContact_birthDate')}</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold', width: 100 }} align="center">{t('actions')}</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {formData.employeeEmergencyContacts.map((ec, i) => (
                                        <TableRow key={i}>
                                            <TableCell>
                                                <TextField size="small" name="name" value={ec.name}
                                                    placeholder={t('employee_emergencyContact_name')}
                                                    onChange={e => handleListChange('employeeEmergencyContacts', i, e)} fullWidth />
                                            </TableCell>
                                            <TableCell>
                                                <TextField size="small" name="relationship" value={ec.relationship}
                                                    placeholder={t('employee_emergencyContact_relationship')}
                                                    onChange={e => handleListChange('employeeEmergencyContacts', i, e)} fullWidth />
                                            </TableCell>
                                            <TableCell>
                                                <TextField size="small" name="phone" value={ec.phone}
                                                    placeholder={t('employee_emergencyContact_phone')}
                                                    onChange={e => handleListChange('employeeEmergencyContacts', i, e)} fullWidth />
                                            </TableCell>
                                            <TableCell>
                                                <TextField size="small" name="birthDate" value={ec.birthDate} type="date"
                                                    InputLabelProps={{ shrink: true }}
                                                    onChange={e => handleListChange('employeeEmergencyContacts', i, e)} fullWidth />
                                            </TableCell>
                                            <TableCell align="center">
                                                <Tooltip title={t('delete')}>
                                                    <IconButton size="small" color="error" onClick={() => handleListRemove('employeeEmergencyContacts', i)}>
                                                        <DeleteIcon fontSize="small" />
                                                    </IconButton>
                                                </Tooltip>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                        {formData.employeeEmergencyContacts.length === 0 && (
                            <EmptyData title={t('noRecords')} />
                        )}
                    </Box>
                )}

            </DialogContent>
            <Divider />
            <DialogActions sx={{ px: 3, py: 2, gap: 1, justifyContent: 'flex-end' }}>
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
