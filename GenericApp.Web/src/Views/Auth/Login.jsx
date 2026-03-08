import React, { useContext, useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '@helpers/AppContext';
import { lightTheme, darkTheme } from '@helpers/ThemeHelper';
import { AuthenticationAPIService } from '@data/Auth/Authentication';
import { ShowMessage, HideMessage } from '@helpers/NotificationService';
import '@styles/Login.css';
import LoginIcon from '@mui/icons-material/Login';
import LockResetIcon from '@mui/icons-material/LockReset';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import espanishFlag from '@images/lang/es-flag.png';
import englishFlag from '@images/lang/en-flag.png';
import loginBackground from '@images/login_background.png';

import {
    Box, Container, Typography, TextField, Button, CircularProgress,
    Card, InputAdornment, IconButton,
} from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import LockIcon from '@mui/icons-material/Lock';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';

function LoginPage() {
    const { t, i18n } = useTranslation();
    const { setAccessToken, setUserRoles, setUserName, setCompanySelected, loadAppConfig, themeMode, appConfig } = useContext(AppContext);
    const navigate = useNavigate();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmNewPassword, setConfirmNewPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const [isLoading, setIsLoading] = useState(false);
    const [isRestartPasswordNeeded, setIsRestartPasswordNeeded] = useState(false);
    const allowLanguage = appConfig?.isMultilaguageEnable === true;

    const authService = AuthenticationAPIService();
    const newPasswordRef = useRef(null);

    useEffect(() => {
        if (isRestartPasswordNeeded && newPasswordRef.current) {
            newPasswordRef.current.focus();
        }
    }, [isRestartPasswordNeeded]);

    useEffect(() => {
        loadAppConfig(i18n);
    }, []);

    useEffect(() => {
        document.body.classList.add('login-background');
        return () => {
            document.body.classList.remove('login-background');
        };
    }, []);

    useEffect(() => {
        const isLight = themeMode === 'light';
        const theme = isLight ? lightTheme : darkTheme;
        const cls = isLight ? 'theme-light' : 'theme-dark';
        const opposite = isLight ? 'theme-dark' : 'theme-light';
        document.body.classList.add(cls);
        document.body.classList.remove(opposite);

        const { palette } = theme;
        const root = document.documentElement;
        root.style.setProperty('--login-bg-image', `url(${loginBackground})`);
        if (isLight) {
            root.style.setProperty('--login-bg-from', palette.primary.dark);
            root.style.setProperty('--login-bg-mid', palette.primary.main);
            root.style.setProperty('--login-bg-to', palette.primary.light);
            root.style.setProperty('--login-panel-bg', palette.background.paper);
            root.style.setProperty('--login-shadow-color', 'rgba(27, 58, 24, 0.45)');
        } else {
            root.style.setProperty('--login-bg-from', palette.background.default);
            root.style.setProperty('--login-bg-mid', '#161b22');
            root.style.setProperty('--login-bg-to', palette.background.paper);
            root.style.setProperty('--login-panel-bg', palette.background.paper);
            root.style.setProperty('--login-shadow-color', 'rgba(0, 0, 0, 0.6)');
        }

        return () => {
            document.body.classList.remove(cls);
        };
    }, [themeMode]);

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
            ShowMessage(t('passwordRequirementsMessage'), 'error');
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

    const inputVariant = 'outlined';

    return (
        <Container
            component="main"
            maxWidth="xs"
            sx={{ display: 'flex', alignItems: 'center', height: '100vh', justifyContent: 'center', overflow: 'hidden', px: { xs: 2, sm: 3 } }}
        >
            <Card className="login-card" sx={{ width: '100%', bgcolor: 'transparent', border: 'none' }}>

                {/* ── Panel formulario ── */}
                <Box className="login-form-panel" sx={{ bgcolor: 'background.paper' }}>

                    {/* Header del formulario */}
                    <Box sx={{ mb: 4 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
                            {isRestartPasswordNeeded
                                ? <LockResetIcon sx={{ color: 'primary.main', fontSize: 28 }} />
                                : <LoginIcon sx={{ color: 'primary.main', fontSize: 28 }} />
                            }
                            <Typography variant="h5" sx={{ fontWeight: 800, color: 'text.primary', letterSpacing: '-0.3px' }}>
                                {isRestartPasswordNeeded ? t('changePassword') : t('login')}
                            </Typography>
                        </Box>
                        <Typography variant="body2" sx={{ color: 'text.secondary', ml: 0.5 }}>
                            {isRestartPasswordNeeded
                                ? t('login_change_password_hint', { defaultValue: 'Establece una nueva contraseña segura para continuar.' })
                                : t('login_subtitle', { defaultValue: 'Ingresa tus credenciales para acceder al sistema.' })
                            }
                        </Typography>
                    </Box>

                    {/* Formulario de login */}
                    <div className={`form-container ${isRestartPasswordNeeded ? 'hidden' : 'visible'}`}>
                        <Box component="form" onSubmit={handleLogin} noValidate>
                            <TextField
                                margin="normal"
                                required
                                fullWidth
                                id="username"
                                label={t('userName')}
                                name="username"
                                autoComplete="username"
                                autoFocus
                                variant={inputVariant}
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                slotProps={{
                                    input: {
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <PersonIcon fontSize="small" sx={{ color: 'text.secondary' }} />
                                            </InputAdornment>
                                        ),
                                    }
                                }}
                                sx={{ mb: 1 }}
                            />
                            <TextField
                                margin="normal"
                                required
                                fullWidth
                                name="password"
                                label={t('password')}
                                type={showPassword ? 'text' : 'password'}
                                id="password"
                                autoComplete="current-password"
                                variant={inputVariant}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                slotProps={{
                                    input: {
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <LockIcon fontSize="small" sx={{ color: 'text.secondary' }} />
                                            </InputAdornment>
                                        ),
                                        endAdornment: (
                                            <InputAdornment position="end">
                                                <IconButton size="small" onClick={() => setShowPassword(!showPassword)} edge="end">
                                                    {showPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                                                </IconButton>
                                            </InputAdornment>
                                        ),
                                    }
                                }}
                                sx={{ mb: 1 }}
                            />
                            <Button
                                type="submit"
                                variant="contained"
                                fullWidth
                                size="large"
                                endIcon={!isLoading && <LoginIcon />}
                                disabled={isLoading}
                                sx={{ mt: 2.5, mb: 1, py: 1.4, fontWeight: 700, fontSize: '0.95rem' }}
                            >
                                {isLoading ? <CircularProgress size={22} color="inherit" /> : t('login')}
                            </Button>
                        </Box>
                    </div>

                    {/* Formulario de cambio de contraseña */}
                    <div className={`form-container ${isRestartPasswordNeeded ? 'visible' : 'hidden'}`}>
                        <Box component="form" onSubmit={handlePasswordChange} noValidate>
                            <TextField
                                inputRef={newPasswordRef}
                                margin="normal"
                                required
                                fullWidth
                                name="newPassword"
                                label={t('newPassword')}
                                type={showNewPassword ? 'text' : 'password'}
                                id="newPassword"
                                variant={inputVariant}
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                slotProps={{
                                    input: {
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <LockIcon fontSize="small" sx={{ color: 'text.secondary' }} />
                                            </InputAdornment>
                                        ),
                                        endAdornment: (
                                            <InputAdornment position="end">
                                                <IconButton size="small" onClick={() => setShowNewPassword(!showNewPassword)} edge="end">
                                                    {showNewPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                                                </IconButton>
                                            </InputAdornment>
                                        ),
                                    }
                                }}
                                sx={{ mb: 1 }}
                            />
                            <TextField
                                margin="normal"
                                required
                                fullWidth
                                name="confirmNewPassword"
                                label={t('confirmPassword')}
                                type={showConfirmPassword ? 'text' : 'password'}
                                id="confirmNewPassword"
                                variant={inputVariant}
                                value={confirmNewPassword}
                                onChange={(e) => setConfirmNewPassword(e.target.value)}
                                slotProps={{
                                    input: {
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <LockIcon fontSize="small" sx={{ color: 'text.secondary' }} />
                                            </InputAdornment>
                                        ),
                                        endAdornment: (
                                            <InputAdornment position="end">
                                                <IconButton size="small" onClick={() => setShowConfirmPassword(!showConfirmPassword)} edge="end">
                                                    {showConfirmPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                                                </IconButton>
                                            </InputAdornment>
                                        ),
                                    }
                                }}
                                sx={{ mb: 1 }}
                            />
                            <Button
                                type="submit"
                                fullWidth
                                variant="contained"
                                size="large"
                                disabled={isLoading}
                                sx={{ mt: 2.5, mb: 1.5, py: 1.4, fontWeight: 700, fontSize: '0.95rem' }}
                            >
                                {isLoading ? <CircularProgress size={22} color="inherit" /> : t('changePassword')}
                            </Button>
                            <Button
                                fullWidth
                                variant="outlined"
                                size="large"
                                startIcon={<ArrowBackIcon />}
                                onClick={handleGoBack}
                                disabled={isLoading}
                                sx={{ py: 1.2 }}
                            >
                                {t('goBack')}
                            </Button>
                        </Box>
                    </div>

                    {/* Footer del formulario */}
                    <Box sx={{ mt: 4, pt: 3, borderTop: '1px solid', borderColor: 'divider', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2 }}>
                        {allowLanguage && (
                            <Box sx={{ display: 'flex', gap: 1 }}>
                                <Box
                                    onClick={() => i18n.changeLanguage('es')}
                                    sx={{
                                        width: 28, height: 28, borderRadius: '50%', overflow: 'hidden',
                                        cursor: 'pointer', opacity: i18n.language === 'es' ? 1 : 0.4,
                                        border: i18n.language === 'es' ? '2px solid' : '2px solid transparent',
                                        borderColor: i18n.language === 'es' ? 'primary.main' : 'transparent',
                                        transition: 'all 0.2s',
                                        '&:hover': { opacity: 1 },
                                    }}
                                >
                                    <img src={espanishFlag} alt="ES" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                </Box>
                                <Box
                                    onClick={() => i18n.changeLanguage('en')}
                                    sx={{
                                        width: 28, height: 28, borderRadius: '50%', overflow: 'hidden',
                                        cursor: 'pointer', opacity: i18n.language === 'en' ? 1 : 0.4,
                                        border: i18n.language === 'en' ? '2px solid' : '2px solid transparent',
                                        borderColor: i18n.language === 'en' ? 'primary.main' : 'transparent',
                                        transition: 'all 0.2s',
                                        '&:hover': { opacity: 1 },
                                    }}
                                >
                                    <img src={englishFlag} alt="EN" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                </Box>
                            </Box>
                        )}
                        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                            © {new Date().getFullYear()} {t('app_name')}
                        </Typography>
                    </Box>
                </Box>
            </Card>
        </Container>
    );
}

export default LoginPage;