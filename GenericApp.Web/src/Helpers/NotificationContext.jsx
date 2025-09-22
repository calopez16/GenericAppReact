import React, { useState, useEffect } from 'react';
import { Snackbar, Alert } from '@mui/material';
// 👇 Importamos nuestro nuevo servicio de alertas
import notificationService from '@helpers/NotificationService'; // Asegúrate de que la ruta sea correcta

export const NotificationContext = ({ children }) => {
    const [snackPack, setSnackPack] = useState([]);
    const [currentSnack, setCurrentSnack] = useState(undefined);
    const [open, setOpen] = useState(false);

    // ✅ Usamos useEffect para suscribirnos a los eventos cuando el componente se monta.
    useEffect(() => {
        // La función que se ejecutará cuando se emita el evento 'show-alert'
        const handleShowAlert = ({ message, severity }) => {
            setSnackPack((prev) => [...prev, { message, severity, key: new Date().getTime() }]);
        };

        // La función que se ejecutará para ocultar la alerta
        const handleHideAlert = () => {
            setOpen(false);
        };

        // Nos suscribimos a ambos eventos
        notificationService.on('show-alert', handleShowAlert);
        notificationService.on('hide-alert', handleHideAlert);

        // Es MUY importante desuscribirse cuando el componente se desmonte para evitar fugas de memoria.
        return () => {
            notificationService.off('show-alert', handleShowAlert);
            notificationService.off('hide-alert', handleHideAlert);
        };
    }, []); // El array vacío asegura que esto solo se ejecute una vez (al montar)

    useEffect(() => {
        if (snackPack.length && !currentSnack) {
            setCurrentSnack({ ...snackPack[0] });
            setSnackPack((prev) => prev.slice(1));
            setOpen(true);
        } else if (snackPack.length && currentSnack && open) {
            setOpen(false);
        }
    }, [snackPack, currentSnack, open]);

    const handleClose = (event, reason) => {
        if (reason === 'clickaway') return;
        setOpen(false);
    };

    const handleExited = () => {
        setCurrentSnack(undefined);
    };

    return (
        <>
            {children}
            <Snackbar
                key={currentSnack ? currentSnack.key : undefined}
                open={open}
                autoHideDuration={(currentSnack?.severity === "error" ? 15000 : 5000)}
                onClose={handleClose}
                TransitionProps={{ onExited: handleExited }}
                anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
            >
                {currentSnack && (
                    <Alert
                        onClose={handleClose}
                        severity={currentSnack.severity}
                        sx={{ width: '100%' }}
                        variant="filled"
                    >
                        {currentSnack.message}
                    </Alert>
                )}
            </Snackbar>
        </>
    );
};