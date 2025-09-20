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
import FileCopyIcon from '@mui/icons-material/FileCopy';
import { DataAPIUsersService } from '@data/Users/Data';
import { useTranslation } from 'react-i18next';

// Componente para el modal de la contraseña
const PasswordModal = ({ open, onClose, password }) => {
    const [snackbarOpen, setSnackbarOpen] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(password);
        setSnackbarOpen(true);
    };

    const handleCloseSnackbar = () => {
        setSnackbarOpen(false);
    };

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
            <DialogTitle>Contraseña de Usuario</DialogTitle>
            <DialogContent>
                <Typography variant="body1" sx={{ mb: 2 }}>
                    La contraseña asignada al nuevo usuario es:
                </Typography>
                <TextField
                    fullWidth
                    value={password}
                    InputProps={{
                        readOnly: true,
                        endAdornment: (
                            <InputAdornment position="end">
                                <IconButton onClick={handleCopy} edge="end">
                                    <FileCopyIcon />
                                </IconButton>
                            </InputAdornment>
                        ),
                    }}
                />
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Cerrar</Button>
            </DialogActions>
            <Snackbar open={snackbarOpen} autoHideDuration={3000} onClose={handleCloseSnackbar}>
                <Alert onClose={handleCloseSnackbar} severity="success" sx={{ width: '100%' }}>
                    Contraseña copiada al portapapeles.
                </Alert>
            </Snackbar>
        </Dialog>
    );
};

const UserFormModal = ({ open, handleClose, user, isEditing }) => {
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

    useEffect(() => {
        const loadRoles = async () => {
            try {
                const response = await service.getRoles();
                setRoles(response.data);
            } catch (error) {
                console.error("Error loading roles:", error);
            }
        };
        loadRoles();
    }, []);

    useEffect(() => {
        if (isEditing && user) {
            setFormData({
                userName: user.userName,
                email: user.email,
                roles: user.roles?.map(role => role) || [], // Corregido: mapea a 'role.name'
            });
        } else {
            setFormData({
                userName: '',
                email: '',
                roles: [],
            });
        }
    }, [open, isEditing, user]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleRoleChange = (e) => {
        const { value } = e.target;
        setFormData(prev => ({
            ...prev,
            roles: typeof value === 'string' ? value.split(',') : value,
        }));
    };

    const handleSubmit = async () => {
        if (isEditing) {
            alert("Functionality to update a user is not implemented yet in the API service.");
            return;
        }

        const userPayload = {
            userName: formData.userName,
            email: formData.email,
            roles: formData.roles,
        };

        try {
            // Lógica para agregar usuario (simulada)
            const response = await service.addData(userPayload, true);
            const newPassword = response.data.newPassword;

            handleClose();
            setAssignedPassword(newPassword);
            setPasswordModalOpen(true);
        } catch (error) {
            console.error("Error saving user:", error);
            alert(t('error'));
        }
    };

    const handlePasswordModalClose = () => {
        setPasswordModalOpen(false);
        setAssignedPassword('');
    };

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
                            disabled={isEditing}
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
                        />
                        <FormControl fullWidth margin="normal" required>
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
                        </FormControl>
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose} color="primary">
                        {t('cancel')}
                    </Button>
                    <Button onClick={handleSubmit} color="primary" variant="contained">
                        {isEditing ? t('save') : t('add')}
                    </Button>
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