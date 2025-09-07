// src/components/LoaderComponent.js
import React from 'react';
import { Spinner } from 'react-bootstrap';

const LoaderComponent = () => {
    return (
        <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '100vh' }}>
            <Spinner animation="border" role="status" variant="primary">
                <span className="visually-hidden">Cargando...</span>
            </Spinner>
        </div>
    );
};

export default LoaderComponent;