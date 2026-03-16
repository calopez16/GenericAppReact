import React, { useContext } from 'react';
import { Box, Typography } from '@mui/material';
import { AppContext } from '@helpers/AppContext';

const FooterComponent = () => {
    const { companySelected } = useContext(AppContext);
    const FOOTER_HEIGHT = 64; // px - spacer to avoid overlapping content

    return (
        <>
            {/* Spacer to push content above the fixed footer */}
            <Box sx={{ height: `${FOOTER_HEIGHT}px`, width: '100%' }} />

            <Box
                component="footer"
                sx={{
                    backgroundColor: 'background.paper',
                    color: 'text.primary',
                    textAlign: 'center',
                    p: 1,
                    width: '100%',
                    position: 'fixed',
                    bottom: 0,
                    height: `${FOOTER_HEIGHT}px`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 10,
                }}
            >
                <Typography variant="body2" component="p">
                    &copy; {companySelected.name } {new Date().getFullYear()}.
                </Typography>
            </Box>
        </>
    );
};

export default FooterComponent;
