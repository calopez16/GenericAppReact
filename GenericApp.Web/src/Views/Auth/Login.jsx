import React, { useContext, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '@helpers/AppContext';
import { AuthenticationAPIService } from '@data/Auth/Authentication';
import { useAlert } from '@helpers/AlertContext';
import '@styles/App.css'

// MUI Imports
import { Box, Container, Typography, TextField, Button, CircularProgress, Card, CardContent } from '@mui/material';

function LoginPage() {
    const { t } = useTranslation();
    const { setAccessToken, setUserRole, setUserName } = useContext(AppContext);
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const { addAlert } = useAlert();

    const handleLogin = async (event) => {
        event.preventDefault();

        if (!email || !password) {
            addAlert(t('error_campos_vacios'), 'danger');
            return;
        }

        setIsLoading(true);

        try {
            const authService = AuthenticationAPIService();
            const response = await authService.authenticate({ email, password });

            if (response && response.success) {
                const { token, roleName, userName } = response.data;
                setAccessToken(token);
                setUserRole(roleName);
                setUserName(userName);

                addAlert(t('login_exitoso'), 'success');
                navigate('/');
            } else {
                addAlert(t('error_credenciales_invalidas'), 'danger');
            }
        } catch (err) {
            addAlert(t('error_conexion'), 'danger');
            console.error('Error de login:', err);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Container component="main" maxWidth="xs" sx={{ display: 'flex', alignItems: 'center', minHeight: '100vh', justifyContent: 'center' }}>
            <Card sx={{ p: 4, width: '100%' }}>
                <CardContent>
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <Typography component="h1" variant="h5" sx={{ mb: 4 }}>
                            {t('login_titulo')}
                        </Typography>
                        <Box component="form" onSubmit={handleLogin} noValidate sx={{ width: '100%' }}>
                            <TextField
                                margin="normal"
                                required
                                fullWidth
                                id="email"
                                label={t('correo_electronico')}
                                name="email"
                                autoComplete="email"
                                autoFocus
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                            <TextField
                                margin="normal"
                                required
                                fullWidth
                                name="password"
                                label={t('contrasena')}
                                type="password"
                                id="password"
                                autoComplete="current-password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                            <Button
                                type="submit"
                                fullWidth
                                variant="contained"
                                sx={{ mt: 3, mb: 2 }}
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <CircularProgress size={24} color="inherit" />
                                ) : (
                                    t('entrar')
                                )}
                            </Button>
                        </Box>
                    </Box>
                </CardContent>
            </Card>
        </Container>
    );
}

export default LoginPage;