import React, { useContext, useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '@helpers/AppContext';
import { AuthenticationAPIService } from '@data/Auth/Authentication';
import { ShowMessage, HideMessage } from '@helpers/NotificationService';
import '@styles/App.css';
import '@styles/Login.css';
import LoginIcon from '@mui/icons-material/Login';

import { Box, Container, Typography, TextField, Button, CircularProgress, Card, CardContent } from '@mui/material';

function LoginPage() {
    const { t } = useTranslation();
    const { setAccessToken, setUserRole, setUserName } = useContext(AppContext);
    const navigate = useNavigate();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmNewPassword, setConfirmNewPassword] = useState('');

    const [isLoading, setIsLoading] = useState(false);
    const [isRestartPasswordNeeded, setIsRestartPasswordNeeded] = useState(false);

    const authService = AuthenticationAPIService();

    const newPasswordRef = useRef(null);

    useEffect(() => {
        if (isRestartPasswordNeeded && newPasswordRef.current) {
            newPasswordRef.current.focus();
        }
    }, [isRestartPasswordNeeded]);

    const handleLogin = async (event) => {
        event.preventDefault();

        if (!email || !password) {
            ShowMessage(t('emptyFields'), 'warning');
            return;
        }
        setIsLoading(true);

        try {
            const response = await authService.authenticate({ email, password });

            if (response && response.success) {
                const { token, roleName, userName, isChangePasswordNeeded } = response.data;

                if (isChangePasswordNeeded) {
                    setAccessToken(token);
                    setIsRestartPasswordNeeded(true);
                    setNewPassword('');
                    setConfirmNewPassword('');
                    ShowMessage(t('changePasswordNeeded'), 'info');
                } else {
                    setAccessToken(token);
                    setUserRole(roleName);
                    setUserName(userName);
                    navigate('/');
                }
            } else {
                ShowMessage(t('invalidCredentials'), 'error');
            }
        } catch (err) {
            ShowMessage(t('conectionError'), 'error');
            console.error('Error de login:', err);
        } finally {
            setIsLoading(false);
            HideMessage();
        }
    };

    const handlePasswordChange = async (event) => {
        event.preventDefault();

        if (!newPassword || !confirmNewPassword) {
            ShowMessage(t('emptyFields'), 'error');
            return;
        }
        if (newPassword !== confirmNewPassword) {
            ShowMessage(t('passwordsDontMatch'), 'error');
            return;
        }

        setIsLoading(true);

        try {
            const response = await authService.passwordRestart(newPassword);

            if (response && response.success) {
                const { token, roleName, userName } = response.data;
                setAccessToken(token);
                setUserRole(roleName);
                setUserName(userName);
                ShowMessage(t('passwordChanged'), 'success');
                navigate('/');
            } else {
                ShowMessage(t('error'), 'error');
            }
        } catch (err) {
            ShowMessage(t('conectionError'), 'error');
        } finally {
            setIsLoading(false);
        }
    };

    // Manejador para el botón de regresar (sin animación de salida)
    const handleGoBack = () => {
        setIsRestartPasswordNeeded(false);
    };

    return (
        <Container component="main" maxWidth="xs" sx={{ display: 'flex', alignItems: 'center', minHeight: '100vh', justifyContent: 'center' }}>
            <Card sx={{ p: 4, width: '100%' }} className="">
                <CardContent>
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative', transition: "2s ease-in-out;" }}>
                        <Typography component="h1" variant="h5" sx={{ mb: 4 }}>
                            {isRestartPasswordNeeded ? t('changePassword') : t('login')}
                        </Typography>

                        {/* Formulario de login normal: se oculta sin transición */}
                        <div className={`form-container ${isRestartPasswordNeeded ? 'hidden' : 'visible'}`}>
                            <Box component="form" onSubmit={handleLogin} noValidate sx={{ width: '100%' }}>
                                <TextField
                                    margin="normal"
                                    required
                                    fullWidth
                                    id="username"
                                    label={t('username')}
                                    name="username"
                                    autoComplete="username"
                                    autoFocus
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                                <TextField
                                    margin="normal"
                                    required
                                    fullWidth
                                    name="password"
                                    label={t('password')}
                                    type="password"
                                    id="password"
                                    autoComplete="current-password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />

                                <Button
                                    type="submit"
                                    variant="contained"
                                    fullWidth
                                    endIcon={<LoginIcon />}
                                    loading={isLoading}
                                    sx={{ mt: 3, mb: 2 }}
                                >

                                    {t('login')}
                                </Button>
                            </Box>
                        </div>

                        {/* Formulario de cambio de contraseña: aparece con transición */}
                        <div className={`form-container ${isRestartPasswordNeeded ? 'visible' : 'hidden'}`}>
                            <Box component="form" onSubmit={handlePasswordChange} noValidate sx={{ width: '100%' }}>
                                <TextField
                                    ref={newPasswordRef}
                                    margin="normal"
                                    required
                                    fullWidth
                                    name="newPassword"
                                    label={t('newPassword')}
                                    type="password"
                                    id="newPassword"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                />
                                <TextField
                                    margin="normal"
                                    required
                                    fullWidth
                                    name="confirmNewPassword"
                                    label={t('confirmPassword')}
                                    type="password"
                                    id="confirmNewPassword"
                                    value={confirmNewPassword}
                                    onChange={(e) => setConfirmNewPassword(e.target.value)}
                                />
                                <Button
                                    type="submit"
                                    fullWidth
                                    variant="contained"
                                    sx={{ mt: 3, mb: 2 }}
                                    disabled={isLoading}
                                >
                                    {isLoading ? <CircularProgress size={24} color="inherit" /> : t('changePassword')}
                                </Button>
                                <Button
                                    fullWidth
                                    variant="outlined"
                                    sx={{ mt: 1, mb: 2 }}
                                    onClick={handleGoBack}
                                    disabled={isLoading}
                                >
                                    {t('goBack')}
                                </Button>
                            </Box>
                        </div>
                    </Box>
                </CardContent>
            </Card>
        </Container>
    );
}

export default LoginPage;