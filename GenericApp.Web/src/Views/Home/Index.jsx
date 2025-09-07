import React, { useState } from 'react';
import { Row, Col, Card, Alert, ProgressBar, Table, Pagination } from 'react-bootstrap';

// Datos de ejemplo para la paginación
const mockData = [
    { id: 1, firstName: 'Juan', lastName: 'Pérez', username: '@jperez' },
    { id: 2, firstName: 'María', lastName: 'García', username: '@mgarcia' },
    { id: 3, firstName: 'Carlos', lastName: 'Rodríguez', username: '@crodriguez' },
    { id: 4, firstName: 'Ana', lastName: 'López', username: '@alopez' },
    { id: 5, firstName: 'Luis', lastName: 'Hernández', username: '@lhernandez' },
    { id: 6, firstName: 'Sofía', lastName: 'Díaz', username: '@sdiaz' },
    { id: 7, firstName: 'Jorge', lastName: 'Sánchez', username: '@jsanchez' },
    { id: 8, firstName: 'Lucía', lastName: 'Ramírez', username: '@lramirez' },
    { id: 9, firstName: 'Pedro', lastName: 'Torres', username: '@ptorres' },
    { id: 10, firstName: 'Valeria', lastName: 'Vázquez', username: '@vvazquez' },
    { id: 11, firstName: 'Javier', lastName: 'Gómez', username: '@jgomez' },
    { id: 12, firstName: 'Elena', lastName: 'Flores', username: '@eflores' },
    { id: 13, firstName: 'Ricardo', lastName: 'Morales', username: '@rmorales' },
    { id: 14, firstName: 'Isabel', lastName: 'Jiménez', username: '@ijimenez' },
    { id: 15, firstName: 'Gabriel', lastName: 'Castro', username: '@gcastro' },
];

function Home() {
    // Estados para la paginación
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(5); // Define la cantidad de elementos por página

    // Lógica para calcular las páginas
    const totalPages = Math.ceil(mockData.length / itemsPerPage);
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = mockData.slice(indexOfFirstItem, indexOfLastItem);

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    return (
        <div className="p-4">
            <h1 className="mb-4">Dashboard de Estadísticas</h1>

            {/* Sección de tarjetas con estadísticas */}
            <Row className="g-4 mb-4">
                <Col md={6} lg={3}>
                    <Card bg="primary" text="white" className="h-100">
                        <Card.Header>Usuarios Activos</Card.Header>
                        <Card.Body>
                            <Card.Title>1,250</Card.Title>
                            <Card.Text>Nuevos usuarios en el último mes</Card.Text>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={6} lg={3}>
                    <Card bg="success" text="white" className="h-100">
                        <Card.Header>Ventas Totales</Card.Header>
                        <Card.Body>
                            <Card.Title>$55,400</Card.Title>
                            <Card.Text>Meta de ventas alcanzada en un 80%</Card.Text>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={6} lg={3}>
                    <Card bg="warning" text="dark" className="h-100">
                        <Card.Header>Proyectos Pendientes</Card.Header>
                        <Card.Body>
                            <Card.Title>15</Card.Title>
                            <Card.Text>Proyectos en revisión o por iniciar</Card.Text>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={6} lg={3}>
                    <Card bg="info" text="white" className="h-100">
                        <Card.Header>Tasa de Crecimiento</Card.Header>
                        <Card.Body>
                            <Card.Title>+12.5%</Card.Title>
                            <Card.Text>Crecimiento anual en comparación</Card.Text>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            {/* Sección de progreso o detalles */}
            <Row className="g-4 mb-4">
                <Col lg={8}>
                    <Card className="h-100">
                        <Card.Header>Progreso de Proyectos</Card.Header>
                        <Card.Body>
                            <Card.Text>Diseño de Interfaz</Card.Text>
                            <ProgressBar animated now={75} variant="primary" label="75%" className="mb-3" />
                            <Card.Text>Desarrollo Backend</Card.Text>
                            <ProgressBar animated now={50} variant="success" label="50%" className="mb-3" />
                            <Card.Text>Implementación de API</Card.Text>
                            <ProgressBar animated now={25} variant="info" label="25%" className="mb-3" />
                        </Card.Body>
                    </Card>
                </Col>
                <Col lg={4}>
                    <Card className="h-100">
                        <Card.Header>Actividad Reciente</Card.Header>
                        <Card.Body>
                            <Alert variant="info">
                                Nuevo usuario 'John Doe' se ha registrado.
                            </Alert>
                            <Alert variant="success">
                                La factura #1012 ha sido pagada.
                            </Alert>
                            <Alert variant="danger">
                                El servidor 12.34.56.78 está caído.
                            </Alert>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            {/* Sección de la tabla de ejemplo con paginación */}
            <h2 className="mt-5 mb-3">Ejemplo de Tabla con Paginación</h2>
            <Card>
                <Card.Body>
                    <Table striped bordered hover responsive>
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>Nombre</th>
                                <th>Apellido</th>
                                <th>Usuario</th>
                            </tr>
                        </thead>
                        <tbody>
                            {currentItems.map((item) => (
                                <tr key={item.id}>
                                    <td>{item.id}</td>
                                    <td>{item.firstName}</td>
                                    <td>{item.lastName}</td>
                                    <td>{item.username}</td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                    <div className="d-flex justify-content-center">
                        <Pagination>
                            {Array.from({ length: totalPages }, (_, index) => (
                                <Pagination.Item
                                    key={index + 1}
                                    active={index + 1 === currentPage}
                                    onClick={() => paginate(index + 1)}
                                >
                                    {index + 1}
                                </Pagination.Item>
                            ))}
                        </Pagination>
                    </div>
                </Card.Body>
            </Card>
        </div>
    );
}

export default Home;