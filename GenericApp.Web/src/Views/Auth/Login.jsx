import React, { useContext, useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '@helpers/AppContext';
import { AuthenticationAPIService } from '@data/Auth/Authentication';
import { ShowMessage, HideMessage } from '@helpers/NotificationService';
import '@styles/Login.css';
import LoginIcon from '@mui/icons-material/Login';
import espanishFlag from '@images/lang/es-flag.png';
import englishFlag from '@images/lang/en-flag.png';

import { Box, Container, Typography, TextField, Button, CircularProgress, Card, CardContent } from '@mui/material';
// IconButton ya no es necesario, pero lo dejamos por si lo usas en otro lado
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Avatar from '@mui/material/Avatar';
import Tooltip from '@mui/material/Tooltip';
import Check from '@mui/icons-material/Check';

function LoginPage() {
    const { t, i18n } = useTranslation();
    const { setAccessToken, setUserRoles, setUserName, setCompanySelected, loadAppConfig } = useContext(AppContext);
    const navigate = useNavigate();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmNewPassword, setConfirmNewPassword] = useState('');

    const [isLoading, setIsLoading] = useState(false);
    const [isRestartPasswordNeeded, setIsRestartPasswordNeeded] = useState(false);
    const [anchorEl, setAnchorEl] = React.useState(null);
    const open = Boolean(anchorEl);

    const authService = AuthenticationAPIService();

    const newPasswordRef = useRef(null);

    const langFlags = {
        'es': espanishFlag,
        'en': englishFlag
    };

    useEffect(() => {
        if (isRestartPasswordNeeded && newPasswordRef.current) {
            newPasswordRef.current.focus();
        }
    }, [isRestartPasswordNeeded]);

    useEffect(() => {
        document.body.classList.add('login-background');

        return () => {
            document.body.classList.remove('login-background');
        };
    }, []);

    const handleClick = (event) => {
        setAnchorEl(event.currentTarget);
    };
    const handleClose = () => {
        setAnchorEl(null);
    };
    const changeLanguage = (lng) => {
        i18n.changeLanguage(lng);
    };

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
                const { token, roles, userName, isChangePasswordNeeded, company } = response.data;

                if (isChangePasswordNeeded) {
                    setAccessToken(token);
                    setIsRestartPasswordNeeded(true);
                    setNewPassword('');
                    setConfirmNewPassword('');
                    ShowMessage(t('changePasswordNeeded'), 'info');
                } else {
                    setAccessToken(token);
                    setUserRoles(roles);
                    setUserName(userName);
                    setCompanySelected(company);
                    await loadAppConfig(i18n);
                    navigate('/');

                }
            } else {
                ShowMessage(t('invalidCredentials'), 'error');
            }
        } catch (err) {
            ShowMessage(t('error'), 'error');
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

        const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+[\]{};':"\\|,.<>/?]).{8,}$/;

        if (!passwordRegex.test(newPassword)) {
            ShowMessage(t('passwordRequirementsMessage') , 'error');
            return;
        }
        // ---------------------------------------------------

        if (newPassword !== confirmNewPassword) {
            ShowMessage(t('passwordsDontMatch'), 'error');
            return;
        }

        setIsLoading(true);

        try {
            const response = await authService.passwordRestart(newPassword);

            if (response && response.success) {
                const { token, roles, userName, company } = response.data;
                setAccessToken(token);
                setUserRoles(roles);
                setUserName(userName);
                setCompanySelected(company);
                await loadAppConfig(i18n);
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

    const handleGoBack = () => {
        setIsRestartPasswordNeeded(false);
    };

    return (
        <Container component="main" maxWidth="xs" sx={{ display: 'flex', alignItems: 'center', minHeight: '100vh', justifyContent: 'center' }}>
            <Card sx={{ p: { xs: 2, sm: 4 }, width: '100%' }}>
                <CardContent>
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative' }}>
                        <Typography component="h1" variant="h5" sx={{ mb: 4 }}>
                            {isRestartPasswordNeeded ? t('changePassword') : t('login')}
                        </Typography>

                        {/* Formulario de login normal */}
                        <div className={`form-container ${isRestartPasswordNeeded ? 'hidden' : 'visible'}`}>
                            <Box component="form" onSubmit={handleLogin} noValidate sx={{ width: '100%' }}>
                                <TextField
                                    margin="normal"
                                    required
                                    fullWidth
                                    id="username"
                                    label={t('userName')}
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
                                    endIcon={!isLoading && <LoginIcon />}
                                    disabled={isLoading}
                                    sx={{ mt: 3, mb: 2 }}
                                >
                                    {isLoading ? <CircularProgress size={24} color="inherit" /> : t('login')}
                                </Button>
                            </Box>
                        </div>

                        {/* Formulario de cambio de contraseña */}
                        <div className={`form-container ${isRestartPasswordNeeded ? 'visible' : 'hidden'}`}>
                            <Box component="form" onSubmit={handlePasswordChange} noValidate sx={{ width: '100%' }}>
                                <TextField
                                    inputRef={newPasswordRef}
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

                    {/* --- SECCIÓN DE IDIOMA MODIFICADA --- */}
                    <Box sx={{
                        width: '100%',
                        //display: 'flex',
                        display: 'none',
                        justifyContent: 'center',
                        alignItems: 'center',
                    }}>
                        <Tooltip title={t('select_language')}>
                            <Button
                                aria-label="language selector"
                                aria-controls={open ? 'language-menu' : undefined}
                                aria-haspopup="true"
                                aria-expanded={open ? 'true' : undefined}
                                onClick={handleClick}
                                variant="text"
                                sx={{ textTransform: 'none', color: 'text.secondary' }}
                                startIcon={
                                    <Avatar
                                        src={langFlags[i18n.language]}
                                        alt={t('current_language')}
                                        sx={{ width: 30, height: 30 }}
                                    />
                                }
                            >
                                {t('language_selected')}
                            </Button>
                        </Tooltip>
                        <Menu
                            id="language-menu"
                            anchorEl={anchorEl}
                            open={open}
                            onClose={handleClose}
                            MenuListProps={{
                                'aria-labelledby': 'language-selector',
                            }}
                        >
                            <MenuItem onClick={() => { changeLanguage('es'); handleClose(); }}>
                                <Avatar src={espanishFlag} sx={{ width: 20, height: 20, mr: 1 }} />
                                {t('language_spanish')}
                            </MenuItem>
                            <MenuItem onClick={() => { changeLanguage('en'); handleClose(); }}>
                                <Avatar src={englishFlag} sx={{ width: 20, height: 20, mr: 1 }} />
                                {t('language_english')}
                            </MenuItem>
                        </Menu>
                    </Box>
                </CardContent>
            </Card>
        </Container>
    );
}

export default LoginPage;