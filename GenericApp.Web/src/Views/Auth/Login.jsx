import React, { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Form, Button, Container, Row, Col, Card } from 'react-bootstrap';
import { AppContext } from '@helpers/AppContext';

function LoginPage() {
    const { setAccessToken, setUserRole, setUserName } = useContext(AppContext);
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleLogin = (event) => {
        event.preventDefault(); // Previene el comportamiento por defecto del formulario

        // Simula la validación y obtención de datos de un inicio de sesión
        // Puedes reemplazar esta lógica con tu llamada a la API
        if (email && password) {
            const fakeToken = 'secret-jwt-token-12345';
            const userRole = 'admin';
            const fakeUserName = 'Usuario Demo';

            // Asigna los valores al estado global
            setAccessToken(fakeToken);
            setUserRole(userRole);
            setUserName(fakeUserName);

            // Redirige al usuario a la página principal
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
                            <h2 className="text-center mb-4">Iniciar Sesión</h2>
                            <Form onSubmit={handleLogin}>
                                <Form.Group className="mb-3" controlId="formBasicEmail">
                                    <Form.Label>Correo electrónico</Form.Label>
                                    <Form.Control
                                        type="email"
                                        placeholder="Ingresa tu correo"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                    />
                                </Form.Group>

                                <Form.Group className="mb-3" controlId="formBasicPassword">
                                    <Form.Label>Contraseña</Form.Label>
                                    <Form.Control
                                        type="password"
                                        placeholder="Contraseña"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                    />
                                </Form.Group>

                                <div className="d-grid gap-2">
                                    <Button variant="primary" type="submit">
                                        Entrar
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