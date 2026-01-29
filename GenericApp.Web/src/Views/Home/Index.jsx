import React from 'react';
import {
    Box,
    Container,
    Typography,
    Button,
    Grid,
    Stack
} from '@mui/material';
import { motion } from 'framer-motion';

// Íconos
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';

// Importa tu logo real
import Logo from '@images/logo.png';

const COMPANY_NAME = "Magnolia's Income Tax Service";

// Datos de Servicios
const servicesList = [
    "Preparación de Income tax",
    "Servicio electronico gratis",
    "Permisos para carros para viajar a México",
    "Asistencia en el llenado de sus formas de Inmigración",
    "Fotos para mica y pasaporte",
    "Desempleos"
];

// Variantes de animación
const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { duration: 0.8, ease: "easeOut", when: "beforeChildren", staggerChildren: 0.1 }
    }
};

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
};

const Index = () => {
    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            style={{ overflowX: 'hidden', height: '100%' }}
        >
            {/* --- SECCIÓN HERO ÚNICA --- */}
            <Box sx={{
                backgroundColor: '#101828',
                color: 'white',
                minHeight: '90vh',
                display: 'flex',
                alignItems: 'center',
                pt: { xs: 4, md: 0 },
                pb: { xs: 8, md: 0 }
            }}>
                <Container maxWidth="lg">
                    <Grid container spacing={6} alignItems="center">

                        {/* IZQUIERDA: Información y Listado (Orden 2 en móvil, 1 en escritorio) */}
                        <Grid size={{ xs: 12, md: 6 }} sx={{ order: { xs: 2, md: 1 } }}>
                            <motion.div variants={itemVariants}>
                                <Typography
                                    variant="h6"
                                    color="#FCD462"
                                    fontWeight="bold"
                                    letterSpacing={1}
                                    gutterBottom
                                    sx={{ textAlign: { xs: 'center', md: 'left' } }} // Centrado en móvil
                                >
                                    {COMPANY_NAME.toUpperCase()}
                                </Typography>

                                <Typography
                                    variant="h2"
                                    fontWeight={800}
                                    sx={{
                                        mb: 2,
                                        background: 'linear-gradient(45deg, #FCD462 30%, #ffffff 90%)',
                                        WebkitBackgroundClip: 'text',
                                        WebkitTextFillColor: 'transparent',
                                        fontSize: { xs: '2.5rem', md: '3.75rem' },
                                        textAlign: { xs: 'center', md: 'left' } // Centrado en móvil
                                    }}
                                >
                                    Seguimiento de procesos migratorios
                                </Typography>

                                <Typography
                                    variant="h6"
                                    sx={{
                                        mb: 4,
                                        opacity: 0.9,
                                        fontWeight: 400,
                                        maxWidth: '95%',
                                        fontSize: { xs: '1rem', md: '1.25rem' },
                                        textAlign: { xs: 'center', md: 'left' }, // Centrado en móvil
                                        mx: { xs: 'auto', md: 0 } // Asegura centrado con maxWidth
                                    }}
                                >
                                    Te ayudamos con la documentacion de procesos migratorios y administrativos.
                                </Typography>

                                {/* LISTADO DE SERVICIOS */}
                                <Box sx={{ mb: 5 }}>
                                    <Typography
                                        variant="subtitle1"
                                        fontWeight="bold"
                                        sx={{
                                            mb: 2,
                                            color: '#FCD462',
                                        }}
                                    >
                                        Nuestros Servicios:
                                    </Typography>
                                    <Grid container spacing={2}>
                                        {servicesList.map((service, index) => (
                                            <Grid key={index} size={{ xs: 12, sm: 6 }}>
                                                <Stack
                                                    direction="row"
                                                    alignItems="center"
                                                    spacing={1.5}
                                                >
                                                    <CheckCircleIcon sx={{ color: '#FCD462', fontSize: 20 }} />
                                                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                                                        {service}
                                                    </Typography>
                                                </Stack>
                                            </Grid>
                                        ))}
                                    </Grid>
                                </Box>

                                {/* BOTÓN FORMULARIO */}
                                <Box sx={{ textAlign: { xs: 'center', md: 'left' } }}>
                                    <Button
                                        variant="contained"
                                        size="large"
                                        endIcon={<ArrowForwardIcon />}
                                        sx={{
                                            bgcolor: '#FCD462',
                                            color: '#101828',
                                            fontWeight: 'bold',
                                            px: 5, py: 1.5,
                                            borderRadius: '30px',
                                            fontSize: '1.1rem',
                                            width: { xs: '100%', sm: 'auto' },
                                            '&:hover': { bgcolor: '#e0bd55' }
                                        }}
                                        onClick={() => alert("Abrir Modal de Formulario")}
                                    >
                                        Llenar formulario
                                    </Button>
                                </Box>
                            </motion.div>
                        </Grid>

                        {/* DERECHA: Logo Grande (Orden 1 en móvil, 2 en escritorio) */}
                        <Grid
                            size={{ xs: 12, md: 6 }}
                            sx={{
                                textAlign: 'center',
                                display: 'flex',
                                justifyContent: 'center',
                                order: { xs: 1, md: 2 },
                                mb: { xs: 2, md: 0 } // CAMBIO: Menos margen en móvil para acercarlo al texto
                            }}
                        >
                            <motion.div variants={itemVariants} >
                                <Box
                                    component="img"
                                    src={Logo}
                                    alt="Logo Empresa"
                                    sx={{
                                        maxWidth: { xs: '50%', md: '90%' },
                                        height: 'auto',
                                        filter: 'drop-shadow(0px 10px 30px rgba(0,0,0,0.5))',
                                        transform: 'rotateY(-10deg) rotateX(5deg)',
                                        marginBottom: { xs: -8 },
                                        marginTop: { xs: -1 }
                                    }}
                                />
                            </motion.div>
                        </Grid>
                    </Grid>
                </Container>
            </Box>
        </motion.div>
    );
};

export default Index;