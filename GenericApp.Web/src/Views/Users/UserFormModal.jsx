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
import CancelIcon from '@mui/icons-material/CancelSharp';
import SaveIcon from '@mui/icons-material/Save';
import AddIcon from '@mui/icons-material/Add';
import { DataAPIUsersService } from '@data/Users/Data';
import { useTranslation } from 'react-i18next';
import { ShowMessage } from '@helpers/NotificationService';
import Tooltip from '@mui/material/Tooltip';

// Componente para el modal de la contraseña
const PasswordModal = ({ open, onClose, password }) => {
    const { t } = useTranslation();
    const [snackbarOpen, setSnackbarOpen] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(password);
        setSnackbarOpen(true);
        ShowMessage(t('textCopiedOnClipboard'), 'info');
    };

    const handleCloseSnackbar = () => {
        setSnackbarOpen(false);
    };

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
            <DialogTitle>{t('userPassword')}</DialogTitle>
            <DialogContent>
                <Typography variant="body1" sx={{ mb: 2 }}>
                    {t('newUserPasswordIs')}
                </Typography>
                <TextField
                    fullWidth
                    value={password}
                    InputProps={{
                        readOnly: true,
                        endAdornment: (
                            <InputAdornment position="end">
                                <Tooltip title={t('copy')}>
                                    <IconButton onClick={handleCopy} edge="end">
                                        <FileCopyIcon />
                                    </IconButton>
                                </Tooltip>
                            </InputAdornment>
                        ),
                    }}
                />
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>{t('close')}</Button>
            </DialogActions>
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
    const [isLoading, setIsLoading] = useState(false);

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

    useEffect(() => {
        if (isEditing && user) {
            setFormData({
                userName: user.userName,
                email: user.email,
                roles: user.roles?.map(role => role) || [],
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

        try {
            setIsLoading(true);
            const userPayload = {
                userName: formData.userName,
                email: formData.email,
                roles: formData.roles,
            };

            let response;
            let messageKey;
            let newPassword = null;

            if (isEditing) {
                response = await service.editData(userPayload);
                messageKey = 'recordEditedSuccessPlural';
            } else {
                response = await service.addData(userPayload, true);
                messageKey = 'recordAddedSuccessPlural';
                newPassword = response.data?.newPassword;
            }

            if (response.responseCode == 409) {
                ShowMessage(t('daraAlreadyExists') + ": " + response.data.conflict, 'warning');
                return;
            }

            handleClose();
            if (newPassword) {
                setAssignedPassword(newPassword);
                setPasswordModalOpen(true);
            }
            ShowMessage(t(messageKey), 'success');
        } catch (error) {
            console.error("Error saving user:", error);
        } finally {
            setIsLoading(false);
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
                    <Button color="error" variant="outlined" endIcon={<CancelIcon />} onClick={handleClose}>
                        {t('cancel')}
                    </Button>
                    <Button color="primary" variant="contained" endIcon={isEditing ? <SaveIcon /> : <AddIcon />} onClick={handleSubmit} loading={isLoading}>
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