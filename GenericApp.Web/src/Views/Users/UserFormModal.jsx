import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Button,
    Box,
    Typography,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    OutlinedInput,
    Checkbox,
    ListItemText,
    FormHelperText,
    Avatar,
    IconButton,
    Divider,
    Tooltip  
} from '@mui/material';
import CancelIcon from '@mui/icons-material/Clear';
import SaveIcon from '@mui/icons-material/Save';
import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import EditIcon from '@mui/icons-material/Edit';
import { DataAPIUsersService } from '@data/Users/Data';
import { useTranslation } from 'react-i18next';
import { ShowMessage } from '@helpers/NotificationService';
import PasswordModal from './PasswordModal';
import { DataAPICompaniesService } from '@data/Companies/Data';

const UserFormModal = ({ open, handleClose, data, isEditing, setData }) => {
    const { t } = useTranslation();
    const service = DataAPIUsersService();
    const cityDataCompanies = DataAPICompaniesService();

    const [companies, setCompanies] = useState([]);

    const [formData, setFormData] = useState({
        userName: '',
        email: '',
        roles: [],
        idCompany: ''
    });

    const [roles, setRoles] = useState([]);
    const [passwordModalOpen, setPasswordModalOpen] = useState(false);
    const [assignedPassword, setAssignedPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const [validationErrors, setValidationErrors] = useState({
        userName: false,
        email: false,
        roles: false,
        idCompany: false
    });
    const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState(false);

    useEffect(() => {
        const fetchCompanies = async () => {
            try {
                const response = await cityDataCompanies.getDataActive();
                if (response.success && Array.isArray(response.data)) {
                    setCompanies(response.data);
                }
            } catch (error) {
                console.error("Error al cargar las compañías:", error);
            }
        };

        const loadRoles = async () => {
            try {
                const response = await service.getRoles();
                setRoles(response.data);
            } catch (error) {
                console.error(t('error_loadingRoles'), error);
            }
        };

        fetchCompanies();
        loadRoles();
    }, []);

    useEffect(() => {
        if (open) {
            if (isEditing && data) {
                setFormData({
                    userName: data.userName,
                    email: data.email,
                    roles: data.roles?.map(role => role) || [],
                    idCompany: data.idCompany || '',
                });
            } else {
                setFormData({
                    userName: '',
                    email: '',
                    roles: [],
                    idCompany: companies.length > 0 ? companies[0].id : '',
                });
            }
            setValidationErrors({ userName: false, email: false, roles: false, idCompany: false });
            setHasAttemptedSubmit(false);
        }
    }, [open, isEditing, data, companies]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));

        if (hasAttemptedSubmit) {
            setValidationErrors(prev => ({
                ...prev,
                [name]: value.trim() === '',
            }));
        }
    };

    const handleCompanyChange = (e) => {
        const { value } = e.target;
        setFormData(prev => ({ ...prev, idCompany: value }));

        if (hasAttemptedSubmit) {
            setValidationErrors(prev => ({
                ...prev,
                idCompany: !value,
            }));
        }
    };

    const handleRoleChange = (e) => {
        const { value } = e.target;
        const newRoles = typeof value === 'string' ? value.split(',') : value;
        setFormData(prev => ({ ...prev, roles: newRoles }));

        if (hasAttemptedSubmit) {
            setValidationErrors(prev => ({
                ...prev,
                roles: newRoles.length === 0,
            }));
        }
    };

    const validateForm = () => {
        const errors = {
            userName: !formData.userName.trim(),
            email: !formData.email.trim(),
            roles: formData.roles.length === 0,
            idCompany: !formData.idCompany,
        };
        setValidationErrors(errors);
        return !errors.userName && !errors.email && !errors.roles && !errors.idCompany;
    };

    const handleSubmit = async (event) => {
        if (event) event.preventDefault();
        setHasAttemptedSubmit(true);

        if (!validateForm()) {
            ShowMessage(t('emptyFields') || 'Por favor, rellene todos los campos obligatorios.', 'warning');
            return;
        }

        try {
            setIsLoading(true);
            const userPayload = {
                userNameId: data?.userNameId,
                userName: formData.userName,
                email: formData.email,
                roles: formData.roles,
                idCompany: formData.idCompany,
            };

            let response;
            let messageKey;
            let newPassword = null;

            if (isEditing) {
                response = await service.editData(userPayload, true);
                messageKey = 'recordEditedSuccessPlural';
            } else {
                response = await service.addData(userPayload, true);
                messageKey = 'recordAddedSuccessPlural';
                newPassword = response.data?.newPassword;
            }

            if (response.responseCode == 409) {
                ShowMessage(t('dataAlreadyExists') + ": " + response.conflict, 'warning');
                return;
            }

            if (response.success) {
                if (isEditing) {
                    setData(prevData =>
                        prevData.map(d =>
                            d.userNameId === userPayload.userNameId ? { ...d, ...userPayload, userNameId: userPayload.userName } : d
                        )
                    );
                } else {
                    setData(prevData => [...prevData, userPayload]);
                }
            } else {
                ShowMessage(t('error'), 'error');
            }

            handleClose();
            if (newPassword) {
                setAssignedPassword(newPassword);
                setPasswordModalOpen(true);
            }
            ShowMessage(t(messageKey), 'success');
        } catch (error) {
            ShowMessage(t('error'), 'error');
            console.error("Error saving user:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handlePasswordModalClose = () => {
        setPasswordModalOpen(false);
        setAssignedPassword('');
    };

    const requiredErrorText = t('requiredField') || 'Este campo es obligatorio.';

    return (
        <>
            <Dialog
                open={open}
                onClose={handleClose}
                fullWidth
                maxWidth="sm"
                PaperProps={{ sx: { borderRadius: 3 } }}
            >
                <Box component="form" onSubmit={handleSubmit} noValidate>
                    <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', py: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Avatar sx={{ bgcolor: 'primary.light', color: 'white', width: 42, height: 42, borderRadius: 2 }}>
                                {isEditing ? <EditIcon /> : <PersonAddIcon />}
                            </Avatar>
                            <Box>
                                <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
                                    {isEditing ? t('editUser') : t('addUser')}
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
                        <TextField
                            margin="normal"
                            required
                            fullWidth
                            label={t('userName')}
                            name="userName"
                            value={formData.userName}
                            onChange={handleChange}
                            error={validationErrors.userName}
                            helperText={validationErrors.userName ? requiredErrorText : ''}
                        />
                        <TextField
                            margin="normal"
                            required
                            fullWidth
                            label={t('email')}
                            name="email"
                            type="email"
                            value={formData.email}
                            onChange={handleChange}
                            error={validationErrors.email}
                            helperText={validationErrors.email ? requiredErrorText : ''}
                        />

                        <FormControl
                            fullWidth
                            margin="normal"
                            required
                            error={validationErrors.idCompany}
                        >
                            <InputLabel id="company-select-label">{t('company')}</InputLabel>
                            <Select
                                labelId="company-select-label"
                                name="idCompany"
                                value={formData.idCompany ?? ''}
                                onChange={handleCompanyChange}
                                label={t('company')}
                            >
                                {companies.map((company) => (
                                    <MenuItem key={company.idCompany} value={company.idCompany}>
                                        {company.name}
                                    </MenuItem>
                                ))}
                            </Select>
                            {validationErrors.idCompany && (
                                <FormHelperText>{requiredErrorText}</FormHelperText>
                            )}
                        </FormControl>

                        <FormControl
                            fullWidth
                            margin="normal"
                            required
                            error={validationErrors.roles}
                        >
                            <InputLabel id="roles-label">{t('roles')}</InputLabel>
                            <Select
                                labelId="roles-label"
                                multiple
                                value={formData.roles}
                                onChange={handleRoleChange}
                                input={<OutlinedInput label={t('roles')} />}
                                renderValue={(selected) => selected.join(', ')}
                            >
                                {roles.map((role) => (
                                    <MenuItem key={role.id} value={role.name}>
                                        <Checkbox checked={formData.roles.indexOf(role.name) > -1} />
                                        <ListItemText primary={role.name} />
                                    </MenuItem>
                                ))}
                            </Select>
                            {validationErrors.roles && (
                                <FormHelperText color="error">{requiredErrorText}</FormHelperText>
                            )}
                        </FormControl>
                    </DialogContent>

                    <Divider />

                    <DialogActions sx={{ p: 2.5 }}>
                        <Button
                            onClick={handleClose}
                            color="error"
                            variant="outlined"
                            endIcon={<CancelIcon />}
                        >
                            {t('cancel')}
                        </Button>
                        <Button
                            type="submit"
                            color="primary"
                            variant="contained"
                            disableElevation
                            disabled={isLoading}
                            endIcon={isEditing ? <SaveIcon /> : <AddIcon />}
                        >
                            {isEditing ? t('save') : t('add')}
                        </Button>
                    </DialogActions>
                </Box>
            </Dialog>

            <PasswordModal
                open={passwordModalOpen}
                onClose={handlePasswordModalClose}
                password={assignedPassword}
            />
        </>
    );
};

export default UserFormModal;