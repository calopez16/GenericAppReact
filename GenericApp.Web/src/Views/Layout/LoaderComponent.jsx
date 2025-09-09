// src/components/LoaderComponent.jsx
import React from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';

const LoaderComponent = () => {
    return (
        <Box
            sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: '100vh',
                flexDirection: 'column',
                marginLeft: '0px'
            }}
        >
            <CircularProgress color="primary" sx={{ mb: 2 }} />
            <Typography variant="srOnly">Cargando...</Typography>
        </Box>
    );
};

export default LoaderComponent;