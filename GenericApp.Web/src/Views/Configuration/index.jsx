import { useContext, useEffect, useState } from 'react';
import {
    Box,
    Typography,
    Paper,
    Avatar,
    Switch,
    FormControlLabel,
    Select,
    MenuItem,
    FormControl,
    Divider,
    Button,
    useTheme,
    LinearProgress,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { AppContext } from '@helpers/AppContext';
import { ShowMessage } from '@helpers/NotificationService';
import SettingsIcon from '@mui/icons-material/Settings';
import LanguageIcon from '@mui/icons-material/Language';
import PaletteIcon from '@mui/icons-material/Palette';
import WbSunnyIcon from '@mui/icons-material/WbSunny';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import SaveIcon from '@mui/icons-material/Save';
import { DataAPIConfigurationService } from '@data/Configuration/Data';


const ConfigurationPage = () => {
    const { t, i18n } = useTranslation();
    const { themeMode, setThemeMode } = useContext(AppContext);
    const theme = useTheme();
    const configService = DataAPIConfigurationService();

    const [pageLoading, setPageLoading] = useState(true);
    const [allowLanguage, setAllowLanguage] = useState(true);
    const [defaultLanguage, setDefaultLanguage] = useState('es');
    const [allowTheme, setAllowTheme] = useState(true);
    const [defaultTheme, setDefaultTheme] = useState('dark');

    useEffect(() => {
        const loadConfiguration = async () => {
            try {
                setPageLoading(true);
                const response = await configService.getData();
                if (response?.data) {
                    const data = response.data;
                    setAllowLanguage(data.isMultilaguageEnable ?? true);
                    setDefaultLanguage(data.defaultLanguage ?? 'es');
                    setAllowTheme(data.isChooseThemeEnable ?? true);
                    setDefaultTheme(data.defaultTheme ?? 'dark');
                }
            } catch {
                ShowMessage(t('error'), 'error');
            } finally {
                setPageLoading(false);
            }
        };
        loadConfiguration();
    }, []);

    const handleSave = async () => {
        try {
            const payload = {
                isMultilaguageEnable: allowLanguage,
                defaultLanguage,
                isChooseThemeEnable: allowTheme,
                defaultTheme,
            };
            const response = await configService.editData(payload);
            if (response?.isSuccess || response?.success) {
                i18n.changeLanguage(defaultLanguage);
                setThemeMode(defaultTheme);
                ShowMessage(t('config_saved'), 'success');
            } else {
                ShowMessage(t('error'), 'error');
            }
        } catch (ex){
            ShowMessage(t('error'), 'error');
        }
    };

    return (
        <Box>
            {/* Header */}
            <Paper
                elevation={0}
                sx={{
                    p: 2,
                    mb: 2,
                    borderRadius: 2,
                    border: '1px solid',
                    borderColor: 'divider',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: 2,
                }}
            >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar sx={{ bgcolor: 'primary.light', color: 'white', width: 45, height: 45, borderRadius: 2 }}>
                        <SettingsIcon />
                    </Avatar>
                    <Box>
                        <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
                            {t('configuration')}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ display: { xs: 'none', sm: 'block' } }}>
                            {t('configuration_description')}
                        </Typography>
                    </Box>
                </Box>
            </Paper>

            {pageLoading && <LinearProgress sx={{ mb: 2, borderRadius: 1 }} />}

            {/* Sección Idioma */}
            <Paper
                elevation={0}
                sx={{ borderRadius: 2, border: '1px solid', borderColor: 'divider', mb: 2, overflow: 'hidden' }}
            >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, px: 2.5, py: 1.5, bgcolor: 'action.hover' }}>
                    <LanguageIcon color="primary" fontSize="small" />
                    <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                        {t('config_language_section')}
                    </Typography>
                </Box>
                <Divider />

                {/* Permitir selección de idioma */}
                <Box sx={{ px: 2.5, py: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2 }}>
                    <Box>
                        <Typography variant="body1" sx={{ fontWeight: 600 }}>
                            {t('config_language_allow')}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                            {t('config_language_allow_desc')}
                        </Typography>
                    </Box>
                    <FormControlLabel
                        control={
                            <Switch
                                checked={allowLanguage}
                                onChange={(e) => setAllowLanguage(e.target.checked)}
                                color="primary"
                            />
                        }
                        label=""
                        sx={{ m: 0 }}
                    />
                </Box>
                <Divider />

                {/* Idioma por defecto */}
                <Box sx={{ px: 2.5, py: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2 }}>
                    <Box>
                        <Typography variant="body1" sx={{ fontWeight: 600 }}>
                            {t('config_language_default')}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                            {t('config_language_default_desc')}
                        </Typography>
                    </Box>
                    <FormControl size="small" sx={{ minWidth: 160 }}>
                        <Select
                            value={defaultLanguage}
                            onChange={(e) => setDefaultLanguage(e.target.value)}
                        >
                            <MenuItem value="es">{t('language_spanish')}</MenuItem>
                            <MenuItem value="en">{t('language_english')}</MenuItem>
                        </Select>
                    </FormControl>
                </Box>
            </Paper>

            {/* Sección Tema */}
            <Paper
                elevation={0}
                sx={{ borderRadius: 2, border: '1px solid', borderColor: 'divider', overflow: 'hidden', mb: 12 }}
            >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, px: 2.5, py: 1.5, bgcolor: 'action.hover' }}>
                    <PaletteIcon color="primary" fontSize="small" />
                    <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                        {t('config_theme_section')}
                    </Typography>
                </Box>
                <Divider />

                {/* Permitir selección de tema */}
                <Box sx={{ px: 2.5, py: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2 }}>
                    <Box>
                        <Typography variant="body1" sx={{ fontWeight: 600 }}>
                            {t('config_theme_allow')}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                            {t('config_theme_allow_desc')}
                        </Typography>
                    </Box>
                    <FormControlLabel
                        control={
                            <Switch
                                checked={allowTheme}
                                onChange={(e) => setAllowTheme(e.target.checked)}
                                color="primary"
                            />
                        }
                        label=""
                        sx={{ m: 0 }}
                    />
                </Box>
                <Divider />

                {/* Tema por defecto */}
                <Box sx={{ px: 2.5, py: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2 }}>
                    <Box>
                        <Typography variant="body1" sx={{ fontWeight: 600 }}>
                            {t('config_theme_default')}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                            {t('config_theme_default_desc')}
                        </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                        <Box
                            onClick={() => setDefaultTheme('light')}
                            sx={{
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                gap: 0.5,
                                py: 1,
                                px: 2,
                                borderRadius: 2,
                                cursor: 'pointer',
                                border: '2px solid',
                                borderColor: defaultTheme === 'light' ? 'primary.main' : 'divider',
                                bgcolor: defaultTheme === 'light' ? 'primary.main' : 'transparent',
                                color: defaultTheme === 'light' ? '#fff' : 'text.secondary',
                                transition: 'all 0.2s',
                                '&:hover': {
                                    borderColor: 'primary.main',
                                    bgcolor: defaultTheme === 'light' ? 'primary.dark' : 'action.hover',
                                },
                            }}
                        >
                            <WbSunnyIcon fontSize="small" />
                            <Typography variant="caption" sx={{ fontWeight: defaultTheme === 'light' ? 700 : 400 }}>
                                {t('select_theme_light')}
                            </Typography>
                        </Box>
                        <Box
                            onClick={() => setDefaultTheme('dark')}
                            sx={{
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                gap: 0.5,
                                py: 1,
                                px: 2,
                                borderRadius: 2,
                                cursor: 'pointer',
                                border: '2px solid',
                                borderColor: defaultTheme === 'dark' ? 'primary.main' : 'divider',
                                bgcolor: defaultTheme === 'dark' ? 'primary.main' : 'transparent',
                                color: defaultTheme === 'dark' ? '#fff' : 'text.secondary',
                                transition: 'all 0.2s',
                                '&:hover': {
                                    borderColor: 'primary.main',
                                    bgcolor: defaultTheme === 'dark' ? 'primary.dark' : 'action.hover',
                                },
                            }}
                        >
                            <DarkModeIcon fontSize="small" />
                            <Typography variant="caption" sx={{ fontWeight: defaultTheme === 'dark' ? 700 : 400 }}>
                                {t('select_theme_dark')}
                            </Typography>
                        </Box>
                    </Box>
                </Box>
            </Paper>
            <Paper
                elevation={4}
                sx={{
                    position: 'fixed',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    p: 2,
                    backgroundColor: theme.palette.background.paper,
                    borderTop: `1px solid ${theme.palette.divider}`,
                    display: 'flex',
                    justifyContent: 'flex-end',
                    alignItems: 'center',
                    gap: 2,
                    zIndex: 1100,
                }}
            >
                <Button
                    variant="contained"
                    disableElevation
                    endIcon={<SaveIcon />}
                    onClick={handleSave}
                >
                    {t('save')}
                </Button>
            </Paper>
        </Box>
    );
};

export default ConfigurationPage;
