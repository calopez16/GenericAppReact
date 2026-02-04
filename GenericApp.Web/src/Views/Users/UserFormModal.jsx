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
    FormHelperText
} from '@mui/material';
import CancelIcon from '@mui/icons-material/Clear';
import SaveIcon from '@mui/icons-material/Save';
import AddIcon from '@mui/icons-material/Add';
import { DataAPIUsersService } from '@data/Users/Data';
import { useTranslation } from 'react-i18next';
import { ShowMessage } from '@helpers/NotificationService';
import PasswordModal from './PasswordModal';
import { DataAPICompaniesService } from '@data/Companies/Data';

const UserFormModal = ({ open, handleClose, data, isEditing, setData }) => {
    const { t } = useTranslation();
    const service = DataAPIUsersService();
    const cityDataCompanies = DataAPICompaniesService();

    // Estado para almacenar la lista de compañías
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

    // Carga inicial de datos
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

    // Inicialización del formulario
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
                    // Seleccionar la primera compañía por defecto si existe
                    idCompany: companies.length > 0 ? companies[0].id : '',
                });
            }
            setValidationErrors({ userName: false, email: false, roles: false, idCompany: false });
            setHasAttemptedSubmit(false);
        }
    }, [open, isEditing, data, companies]);

    // 1. Manejador para Inputs de Texto (UserName, Email)
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));

        if (hasAttemptedSubmit) {
            setValidationErrors(prev => ({
                ...prev,
                [name]: value.trim() === '', // Validación simple de texto
            }));
        }
    };

    // 2. Manejador específico para Compañía (Dropdown simple)
    const handleCompanyChange = (e) => {
        const { value } = e.target;
        setFormData(prev => ({
            ...prev,
            idCompany: value
        }));

        if (hasAttemptedSubmit) {
            setValidationErrors(prev => ({
                ...prev,
                idCompany: !value, // Error si no hay valor seleccionado
            }));
        }
    };

    // 3. Manejador específico para Roles (Dropdown múltiple)
    const handleRoleChange = (e) => {
        const { value } = e.target;
        const newRoles = typeof value === 'string' ? value.split(',') : value;
        setFormData(prev => ({
            ...prev,
            roles: newRoles,
        }));

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
            <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
                <DialogTitle>
                    {isEditing ? t('editUser') : t('addUser')}
                </DialogTitle>
                <Box component="form" onSubmit={handleSubmit} noValidate>
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

                        {/* --- DROPDOWN DE COMPAÑÍA --- */}
                        <FormControl
                            fullWidth
                            margin="normal"
                            required
                            error={validationErrors.idCompany}
                        >
                            <InputLabel id="company-select-label">{t('company') || 'Compañía'}</InputLabel>
                            <Select
                                labelId="company-select-label"
                                id="company-select"
                                name="idCompany"
                                value={formData.idCompany ?? ''}
                                onChange={handleCompanyChange} // <--- USANDO LA NUEVA FUNCIÓN
                                label={t('company') || 'Compañía'}
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
                            <InputLabel>{t('roles')}</InputLabel>
                            <Select
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
                                <Typography variant="caption" color="error" sx={{ ml: 2, mt: 0.5 }}>
                                    {requiredErrorText}
                                </Typography>
                            )}
                        </FormControl>
                    </DialogContent>
                    <DialogActions
                        sx={{
                            flexDirection: { xs: 'column', sm: 'row' },
                            justifyContent: 'flex-end',
                            p: 3
                        }}
                    >
                        <Box
                            sx={{
                                width: { xs: '100%', sm: 'auto' },
                                display: 'flex',
                                justifyContent: { xs: 'space-between', sm: 'flex-end' },
                            }}
                        >
                            <Button type="button" color="error" sx={{ mr: { xs: 0, sm: 1 } }} variant="outlined" endIcon={<CancelIcon />} onClick={handleClose}>
                                {t('cancel')}
                            </Button>
                            <Button type="submit" color="primary" variant="contained" endIcon={isEditing ? <SaveIcon /> : <AddIcon />} disabled={isLoading}>
                                {isEditing ? t('save') : t('add')}
                            </Button>
                        </Box>
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