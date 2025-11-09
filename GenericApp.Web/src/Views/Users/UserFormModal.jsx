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
    IconButton,
    InputAdornment,
    Snackbar,
    Alert,
} from '@mui/material';
import CancelIcon from '@mui/icons-material/Clear';
import SaveIcon from '@mui/icons-material/Save';
import AddIcon from '@mui/icons-material/Add';
import { DataAPIUsersService } from '@data/Users/Data';
import { useTranslation } from 'react-i18next';
import { ShowMessage } from '@helpers/NotificationService';
import Tooltip from '@mui/material/Tooltip';
import PasswordModal from './PasswordModal';

// Componente principal de la vista
const UserFormModal = ({ open, handleClose, data, isEditing, setData }) => {
    const { t } = useTranslation();
    const service = DataAPIUsersService();

    const [formData, setFormData] = useState({
        userName: '',
        email: '',
        roles: [],
    });

    const [roles, setRoles] = useState([]);
    const [passwordModalOpen, setPasswordModalOpen] = useState(false);
    const [assignedPassword, setAssignedPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    // NUEVO ESTADO: Para controlar los errores de validación después de un intento de submit
    const [validationErrors, setValidationErrors] = useState({
        userName: false,
        email: false,
        roles: false,
    });
    // NUEVO ESTADO: Bandera para saber si ya se intentó hacer submit
    const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState(false);


    // --- Efecto para cargar Roles (Se mantiene igual) ---
    useEffect(() => {
        const loadRoles = async () => {
            try {
                const response = await service.getRoles();
                setRoles(response.data);
            } catch (error) {
                console.error(t('error_loadingRoles'), error);
            }
        };
        loadRoles();
    }, []);

    // --- Efecto para inicializar el formulario (Modificado para resetear la validación) ---
    useEffect(() => {
        if (open) { // Solo inicializar cuando el modal está abierto
            if (isEditing && data) {
                setFormData({
                    userName: data.userName,
                    email: data.email,
                    roles: data.roles?.map(role => role) || [],
                });
            } else {
                setFormData({
                    userName: '',
                    email: '',
                    roles: [],
                });
            }
            // Resetear la validación al abrir el modal de nuevo
            setValidationErrors({ userName: false, email: false, roles: false });
            setHasAttemptedSubmit(false);
        }
    }, [open, isEditing, data]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));

        // Resetear el error tan pronto como el usuario escribe (solo si ya se intentó hacer submit)
        if (hasAttemptedSubmit) {
            setValidationErrors(prev => ({
                ...prev,
                [name]: value.length === 0,
            }));
        }
    };

    const handleRoleChange = (e) => {
        const { value } = e.target;
        const newRoles = typeof value === 'string' ? value.split(',') : value;
        setFormData(prev => ({
            ...prev,
            roles: newRoles,
        }));

        // Resetear el error de roles tan pronto como se selecciona algo
        if (hasAttemptedSubmit) {
            setValidationErrors(prev => ({
                ...prev,
                roles: newRoles.length === 0,
            }));
        }
    };

    // --- NUEVA FUNCIÓN DE VALIDACIÓN ---
    const validateForm = () => {
        const errors = {
            userName: !formData.userName.trim(),
            email: !formData.email.trim(),
            roles: formData.roles.length === 0,
        };

        setValidationErrors(errors);

        return !errors.userName && !errors.email && !errors.roles;
    };

    // --- FUNCIÓN DE SUBMIT MODIFICADA ---
    const handleSubmit = async () => {
        setHasAttemptedSubmit(true); // Marcar que se intentó enviar

        if (!validateForm()) {
            ShowMessage(t('FillRequiredFields') || 'Por favor, rellene todos los campos obligatorios.', 'warning');
            return;
        }

        try {
            setIsLoading(true);
            const userPayload = {
                userNameId: data?.userNameId,
                userName: formData.userName,
                email: formData.email,
                roles: formData.roles,
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
                ShowMessage(t('daraAlreadyExists') + ": " + response.conflict, 'warning');
                return;
            }

            if (response.success) {
                if (isEditing) {
                    setData(prevData =>
                        prevData.map(data =>
                            data.userNameId === userPayload.userNameId ? { ...data, ...userPayload, userNameId: userPayload.userName } : data
                        )
                    );
                } else {
                    setData(prevData => [...prevData, userPayload]);
                }
            }

            // Cerrar el modal principal y mostrar el modal de contraseña si aplica
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

    // --- RENDER ---

    const requiredErrorText = t('ThisFieldIsRequired') || 'Este campo es obligatorio.';

    return (
        <>
            <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
                <DialogTitle>
                    {isEditing ? t('editUser') : t('addUser')}
                </DialogTitle>
                <DialogContent>
                    <Box component="form" noValidate sx={{ mt: 2 }}>
                        <TextField
                            margin="normal"
                            required
                            fullWidth
                            label={t('userName')}
                            name="userName"
                            value={formData.userName}
                            onChange={handleChange}
                            // CONTROL DE ERROR: Usar el estado de validación
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
                            // CONTROL DE ERROR: Usar el estado de validación
                            error={validationErrors.email}
                            helperText={validationErrors.email ? requiredErrorText : ''}
                        />
                        <FormControl
                            fullWidth
                            margin="normal"
                            required
                            // CONTROL DE ERROR: En FormControl
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
                            {/* Mostrar helperText para errores de Select */}
                            {validationErrors.roles && (
                                <Typography variant="caption" color="error" sx={{ ml: 2, mt: 0.5 }}>
                                    {requiredErrorText}
                                </Typography>
                            )}
                        </FormControl>
                    </Box>
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
                        <Button color="error" sx={{ mr: { xs: 0, sm: 1 } }} variant="outlined" endIcon={<CancelIcon />} onClick={handleClose}>
                            {t('cancel')}
                        </Button>
                        <Button color="primary" variant="contained" endIcon={isEditing ? <SaveIcon /> : <AddIcon />} onClick={handleSubmit} disabled={isLoading}>
                            {isEditing ? t('save') : t('add')}
                        </Button>
                    </Box>
                </DialogActions>
               
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