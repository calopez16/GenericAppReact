import React from 'react';
import { Box, Button, Typography, Container } from '@mui/material';
import { Link } from 'react-router-dom';
import ReportProblemIcon from '@mui/icons-material/ReportProblem'; // Un ícono para darle más énfasis visual
import { useTranslation } from 'react-i18next';

function Unauthorize() {

    const { t } = useTranslation();

    return (
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                textAlign: 'center',
            }}
        >
            <ReportProblemIcon sx={{ fontSize: '6rem', color: 'primary.main', mb: 2 }} />

            <Typography
                variant="h1"
                component="h1"
                sx={{
                    fontWeight: 'bold',
                    color: 'primary.main',
                    fontSize: { xs: '6rem', sm: '8rem' } // Tamaño de fuente responsivo
                }}
            >
                403
            </Typography>

            <Typography
                variant="h4"
                component="h2"
                gutterBottom // Agrega un margen inferior
            >
                {t('pageUnauthorized')}
            </Typography>

            <Typography
                variant="body1"
                color="text.secondary" // Usa los colores del tema para consistencia
                sx={{ mb: 4, maxWidth: '500px' }} // Margen inferior y un ancho máximo
            >
                {t('pageUnauthorized_Message')}
            </Typography>

            <Button
                variant="contained" // Estilo de botón principal de MUI
                component={Link}    // Le decimos al botón que se comporte como un Link de React Router
                to="/"              // La ruta a la que debe navegar
                size="large"
            >
                {t('backToHome')}
            </Button>
        </Box>
    );
}

export default Unauthorize;