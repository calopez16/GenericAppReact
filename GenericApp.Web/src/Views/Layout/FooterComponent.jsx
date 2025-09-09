import React from 'react';
import { Box, Typography } from '@mui/material';

const FooterComponent = () => {
    return (
        <Box
            component="footer"
            sx={{
                backgroundColor: 'background.paper',
                color: 'text.primary',
                textAlign: 'center',
                p: 3,
                mt: 'auto',
                width: '100%',
                position: 'fixed',
                bottom: 0
            }}
        >
            <Typography variant="body2" component="p">
                &copy; {new Date().getFullYear()} Mi Sistema. Todos los derechos reservados.
            </Typography>
        </Box>
    );
};

export default FooterComponent;
