import React, { useContext, useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '@helpers/AppContext';
import { AuthenticationAPIService } from '@data/Auth/Authentication';
import { ShowMessage, HideMessage } from '@helpers/NotificationService';
import {
    Box,
    Container,
    Typography,
    TextField,
    Button,
    CircularProgress,
    Card,
    CardContent,
    Grid
} from '@mui/material';
import LoginIcon from '@mui/icons-material/Login';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import Logo from '@images/logo.png';

const formTransition = {
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 },
    transition: { duration: 0.3 }
};

function LoginPage() {
    const { t } = useTranslation();
    const { setAccessToken, setUserRoles, setUserName, setCompanySelected } = useContext(AppContext);
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
                const { token, roles, userName, isChangePasswordNeeded, company } = response.data;
                setAccessToken(token);
                if (isChangePasswordNeeded) {
                    setIsRestartPasswordNeeded(true);
                    ShowMessage(t('changePasswordNeeded'), 'info');
                } else {
                    setUserRoles(roles);
                    setUserName(userName);
                    setCompanySelected(company);
                    navigate('/');
                }
            } else {
                ShowMessage(t('invalidCredentials'), 'error');
            }
        } catch (err) {
            ShowMessage(t('error'), 'error');
        } finally {
            setIsLoading(false);
            HideMessage();
        }
    };

    const handlePasswordChange = async (event) => {
        event.preventDefault();
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
                ShowMessage(t('passwordChanged'), 'success');
                navigate('/');
            }
        } catch (err) {
            ShowMessage(t('conectionError'), 'error');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Box sx={{
            backgroundColor: 'primary.main',
            color: 'white',
            minHeight: '100vh',
            width: '100vw',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
            position: 'relative',
        }}>
            <Container maxWidth="lg">
                <Grid
                    container
                    spacing={4}
                    alignItems="center"
                    justifyContent="center"
                    sx={{
                        mt: { xs: -5, md: -10 } // Eleva el formulario
                    }}
                >
                    {/* COLUMNA BRANDING */}
                    <Grid item xs={12} md={6} sx={{ textAlign: 'center', order: { xs: 1, md: 2 } }}>
                        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                            <Box component="img" src={Logo} sx={{ maxWidth: { xs: 130, md: 180 }, mb: 2 }} />

                            <Typography variant="overline" color="secondary.main" fontWeight="bold" letterSpacing={1}>
                                {"MAGNOLIA'S INCOME TAX SERVICE"}
                            </Typography>

                            <Typography
                                variant="h2"
                                fontWeight={800}
                                sx={{
                                    mb: 1,
                                    background: (theme) => `linear-gradient(45deg, ${theme.palette.secondary.main} 30%, #ffffff 90%)`,
                                    WebkitBackgroundClip: 'text',
                                    WebkitTextFillColor: 'transparent',
                                    fontSize: { xs: '2rem', md: '3rem' },
                                    lineHeight: 1.2
                                }}
                            >
                                {t('welcomeMessage') || 'Bienvenido'}
                            </Typography>

                            <Typography variant="body2" sx={{ opacity: 0.8, fontWeight: 400, maxWidth: '400px' }}>
                                {t('loginDescription') || 'Accede a tu cuenta para gestionar tus procesos de manera eficiente.'}
                            </Typography>
                        </Box>
                    </Grid>

                    {/* COLUMNA FORMULARIO */}
                    <Grid item xs={12} md={6} sx={{ order: { xs: 2, md: 1 } }}>
                        <Box sx={{ maxWidth: 400, mx: 'auto' }}>
                            <Card sx={{
                                borderRadius: 4,
                                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                                backdropFilter: 'blur(10px)',
                                border: '1px solid rgba(255, 255, 255, 0.1)',
                                color: 'white',
                                boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.37)'
                            }}>
                                <CardContent sx={{ p: { xs: 3, md: 4 } }}>
                                    <AnimatePresence mode="wait">
                                        {!isRestartPasswordNeeded ? (
                                            <motion.div key="login-form" {...formTransition}>
                                                <Typography variant="h5" fontWeight="700" gutterBottom sx={{ textAlign: 'center', mb: 2 }}>
                                                    {t('login')}
                                                </Typography>
                                                <Box component="form" onSubmit={handleLogin} noValidate>
                                                    <TextField
                                                        margin="dense" fullWidth label={t('userName')} autoFocus value={email} onChange={(e) => setEmail(e.target.value)}
                                                        sx={{ input: { color: 'white' }, '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.7)' }, '& .MuiOutlinedInput-root': { '& fieldset': { borderColor: 'rgba(255,255,255,0.3)' } } }}
                                                    />
                                                    <TextField
                                                        margin="dense" fullWidth label={t('password')} type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                                                        sx={{ input: { color: 'white' }, '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.7)' }, '& .MuiOutlinedInput-root': { '& fieldset': { borderColor: 'rgba(255,255,255,0.3)' } } }}
                                                    />
                                                    <Button
                                                        type="submit" fullWidth variant="contained" color="secondary"
                                                        disabled={isLoading} endIcon={!isLoading && <LoginIcon />}
                                                        sx={{ mt: 3, py: 1.2, fontWeight: 'bold', borderRadius: '30px' }}
                                                    >
                                                        {isLoading ? <CircularProgress size={24} color="inherit" /> : t('login')}
                                                    </Button>
                                                </Box>
                                            </motion.div>
                                        ) : (
                                            <motion.div key="reset-form" {...formTransition}>
                                                <Typography variant="h5" fontWeight="700" gutterBottom sx={{ textAlign: 'center' }}>
                                                    {t('changePassword')}
                                                </Typography>
                                                <Box component="form" onSubmit={handlePasswordChange} noValidate sx={{ mt: 1 }}>
                                                    <TextField
                                                        inputRef={newPasswordRef} margin="dense" fullWidth label={t('newPassword')} type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)}
                                                        sx={{ input: { color: 'white' }, '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.7)' } }}
                                                    />
                                                    <TextField
                                                        margin="dense" fullWidth label={t('confirmPassword')} type="password" value={confirmNewPassword} onChange={(e) => setConfirmNewPassword(e.target.value)}
                                                        sx={{ input: { color: 'white' }, '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.7)' } }}
                                                    />
                                                    <Button type="submit" fullWidth variant="contained" color="secondary" sx={{ mt: 3, py: 1.2, borderRadius: '30px' }} disabled={isLoading}>
                                                        {isLoading ? <CircularProgress size={24} color="inherit" /> : t('changePassword')}
                                                    </Button>
                                                    <Button fullWidth startIcon={<ArrowBackIcon />} sx={{ mt: 1, color: 'white', textTransform: 'none' }} onClick={() => setIsRestartPasswordNeeded(false)}>
                                                        {t('goBack')}
                                                    </Button>
                                                </Box>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </CardContent>
                            </Card>
                        </Box>
                    </Grid>
                </Grid>
            </Container>
        </Box>
    );
}

export default LoginPage;