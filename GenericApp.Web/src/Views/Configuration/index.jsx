import { Container, Typography, Paper } from '@mui/material';
import { useTranslation } from 'react-i18next';
import SettingsIcon from '@mui/icons-material/Settings';

const ConfigurationPage = () => {
    const { t } = useTranslation();

    return (
        <Container maxWidth="xl" sx={{ mt: 2, mb: 2 }}>
            <Paper elevation={3} sx={{ p: 2.5, borderRadius: 2, mb: 2, display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <SettingsIcon color="primary" />
                <Typography variant="h5" component="h1" sx={{ fontWeight: 'bold' }}>
                    {t('configuration')}
                </Typography>
            </Paper>
        </Container>
    );
};

export default ConfigurationPage;
