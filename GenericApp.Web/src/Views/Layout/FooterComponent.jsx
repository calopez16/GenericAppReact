import React, { useContext } from 'react';
import { Box, Typography } from '@mui/material';
import { AppContext } from '@helpers/AppContext';

const FooterComponent = () => {
    const { companySelected } = useContext(AppContext);

    return (
        <Box
            component="footer"
            sx={{
                backgroundColor: 'background.paper',
                color: 'text.primary',
                textAlign: 'center',
                p: 1,
                mt: 'auto',
                width: '100%',
                position: 'fixed',
                bottom: 0
            }}
        >
            <Typography variant="body2" component="p">
                &copy; {companySelected.name } {new Date().getFullYear()}.
            </Typography>
        </Box>
    );
};

export default FooterComponent;
