import React, { createContext, useState, useContext } from 'react';
import { Box, Alert, IconButton, Collapse } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

// 1. Crear el Contexto
export const AlertContext = createContext();

// 2. Crear el Proveedor (Provider)
export const AlertProvider = ({ children }) => {
    const [alerts, setAlerts] = useState([]);

    // Función para agregar una nueva alerta
    const addAlert = (message, variant = 'success') => {
        const newAlert = {
            id: Date.now(), // Un ID único para cada alerta
            message,
            variant,
        };
        setAlerts((prevAlerts) => [...prevAlerts, newAlert]);

        // Eliminar la alerta automáticamente después de 5 segundos
        setTimeout(() => {
            setAlerts((prevAlerts) => prevAlerts.filter((alert) => alert.id !== newAlert.id));
        }, 5000);
    };

    // Función para eliminar una alerta manualmente
    const removeAlert = (id) => {
        setAlerts((prevAlerts) => prevAlerts.filter((alert) => alert.id !== id));
    };

    return (
        <AlertContext.Provider value={{ addAlert, removeAlert }}>
            {children}
            {/* Aquí se renderizarán las alertas */}
            <Box
                sx={{
                    position: 'fixed',
                    top: '1rem',
                    right: '1rem',
                    zIndex: 1050,
                    maxWidth: '300px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 1, // Espacio entre alertas
                }}
            >
                {alerts.map((alert) => (
                    <Collapse key={alert.id} in={true}>
                        <Alert
                            severity={alert.variant}
                            action={
                                <IconButton
                                    aria-label="close"
                                    color="inherit"
                                    size="small"
                                    onClick={() => removeAlert(alert.id)}
                                >
                                    <CloseIcon fontSize="inherit" />
                                </IconButton>
                            }
                        >
                            {alert.message}
                        </Alert>
                    </Collapse>
                ))}
            </Box>
        </AlertContext.Provider>
    );
};

// 3. Crear un hook para usar el contexto fácilmente
export const useAlert = () => useContext(AlertContext);
