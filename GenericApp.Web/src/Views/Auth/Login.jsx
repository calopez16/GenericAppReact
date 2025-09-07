import React, { useContext, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Form, Button, Container, Row, Col, Card, Spinner } from 'react-bootstrap'; // Se quita 'Alert' de la importación
import { AppContext } from '@helpers/AppContext';
import { AuthenticationAPIService } from '@data/Auth/Authentication';
import { useAlert } from '@helpers/AlertContext'; // Importa el hook para las alertas personalizadas
import '@styles/App.css'

function LoginPage() {
    const { t } = useTranslation();
    const { setAccessToken, setUserRole, setUserName } = useContext(AppContext);
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    // Ahora usamos el hook useAlert para gestionar las notificaciones
    const { addAlert } = useAlert();

    const handleLogin = async (event) => {
        event.preventDefault();

        if (!email || !password) {
            // Muestra una alerta de error usando el nuevo sistema
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

                // Muestra una alerta de éxito y navega
                addAlert(t('login_exitoso'), 'success');
                navigate('/');
            } else {
                // Muestra una alerta de error para credenciales inválidas
                addAlert(t('error_credenciales_invalidas'), 'danger');
            }
        } catch (err) {
            // Muestra una alerta de error de conexión o del servidor
            addAlert(t('error_conexion'), 'danger');
            console.error('Error de login:', err);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '100vh' }}>
            <Row className="w-100">
                <Col md={{ span: 6, offset: 3 }} lg={{ span: 4, offset: 4 }}>
                    <Card className="p-4 shadow-sm">
                        <Card.Body>
                            <h2 className="text-center mb-4">{t('login_titulo')}</h2>
                            {/* La alerta de error local se ha eliminado, ahora el contexto la maneja */}
                            <Form onSubmit={handleLogin}>
                                <Form.Group className="mb-3" controlId="formBasicEmail">
                                    <Form.Label>{t('correo_electronico')}</Form.Label>
                                    <Form.Control
                                        type="email"
                                        placeholder={t('placeholder_email')}
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                    />
                                </Form.Group>
                                <Form.Group className="mb-3" controlId="formBasicPassword">
                                    <Form.Label>{t('contrasena')}</Form.Label>
                                    <Form.Control
                                        type="password"
                                        placeholder={t('placeholder_password')}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                    />
                                </Form.Group>
                                <div className="d-grid gap-2">
                                    <Button variant="primary" type="submit" disabled={isLoading}>
                                        {isLoading ? (
                                            <>
                                                <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" />
                                                {' '} {t('autenticando')}
                                            </>
                                        ) : (
                                            t('entrar')
                                        )}
                                    </Button>
                                </div>
                            </Form>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
}

export default LoginPage;