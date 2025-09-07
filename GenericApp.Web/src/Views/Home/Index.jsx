import React, { useState, useContext, useEffect } from 'react';
import { useTranslation } from 'react-i18next'; // Importa el hook
import { Row, Col, Card, Alert, ProgressBar, Table, Pagination, Button } from 'react-bootstrap';
import { AppContext } from '@helpers/AppContext';

const mockData = [
    // ... tus datos de ejemplo
    { id: 1, firstName: 'Juan', lastName: 'Pérez', username: '@jperez' },
    // ...
];

function Home() {
    const { t } = useTranslation();
    const { setLoading } = useContext(AppContext);

    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(5);
    const totalPages = Math.ceil(mockData.length / itemsPerPage);
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = mockData.slice(indexOfFirstItem, indexOfLastItem);
    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    const handleRefreshData = () => {
        setLoading(true); // Activa el loader para esta acción específica
        // Simula la llamada a una API
        setTimeout(() => {
            // Lógica para actualizar los datos aquí
            setLoading(false); // Desactiva el loader al finalizar
        }, 1500);
    };

    return (
        <div className="p-4">
            <h1 className="mb-4">{t('dashboard_stats')}</h1>

            {/* Resto de tu código del dashboard */}

            <h2 className="mt-5 mb-3">
                {t('ejemplo_tabla')}
                <Button variant="outline-primary" size="sm" className="ms-3" onClick={handleRefreshData}>
                    Recargar Datos
                </Button>
            </h2>
            <Card>
                <Card.Body>
                    <Table striped bordered hover responsive>
                        <thead>
                            <tr>
                                <th>{t('id')}</th>
                                <th>{t('nombre')}</th>
                                <th>{t('apellido')}</th>
                                <th>{t('usuario')}</th>
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