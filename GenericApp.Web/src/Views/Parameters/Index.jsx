import {
    Typography
} from '@mui/material';
import { useTranslation } from 'react-i18next';

import AppLogo from './AppLogo'
import AppLoginBackground from './AppLoginBackground'

const Parameters = () => {
    const { t } = useTranslation();

    return (
        <>
            <Typography variant="h4" component="h1" sx={{ marginBottom: '20px' }}>
                {t('parameters')}
            </Typography>
        </>
    );
};

export default Parameters;