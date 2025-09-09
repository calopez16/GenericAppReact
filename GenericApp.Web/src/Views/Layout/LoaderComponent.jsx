import React, { useContext } from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next'; 

const LoaderComponent = () => {
    const { t } = useTranslation();

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
            <Typography variant="srOnly">{t('loading')}...</Typography>
        </Box>
    );
};

export default LoaderComponent;