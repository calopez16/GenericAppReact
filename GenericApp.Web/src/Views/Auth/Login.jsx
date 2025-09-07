import React, { useContext, useState } from 'react';
import { useTranslation } from 'react-i18next'; // Importa el hook
import { useNavigate } from 'react-router-dom';
import { Form, Button, Container, Row, Col, Card } from 'react-bootstrap';
import { AppContext } from '@helpers/AppContext';

function LoginPage() {
    const { t } = useTranslation(); // Usa el hook
    const { setAccessToken, setUserRole, setUserName } = useContext(AppContext);
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleLogin = (event) => {
        event.preventDefault();
        if (email && password) {
            const fakeToken = 'secret-jwt-token-12345';
            const userRole = 'admin';
            const fakeUserName = 'Usuario Demo';
            setAccessToken(fakeToken);
            setUserRole(userRole);
            setUserName(fakeUserName);
            navigate('/');
        } else {
            alert('Por favor, ingresa tu correo y contraseña.');
        }
    };

    return (
        <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '100vh' }}>
            <Row className="w-100">
                <Col md={{ span: 6, offset: 3 }} lg={{ span: 4, offset: 4 }}>
                    <Card className="p-4 shadow-sm">
                        <Card.Body>
                            <h2 className="text-center mb-4">{t('login_titulo')}</h2>
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
                                    <Button variant="primary" type="submit">
                                        {t('entrar')}
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