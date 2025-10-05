import React, { useState, useMemo } from 'react';
import { Button, Box, Typography, Paper } from '@mui/material';
import { ArrowForward } from '@mui/icons-material';
import { API_BASE_URL } from '@config';
import { DataAPIParametersService } from '@data/Parameters/Data';
import { ShowMessage } from '@helpers/NotificationService';
import { useTranslation } from 'react-i18next';

const AppLoginBackgroundEditor = () => {
    const { t } = useTranslation();
    const [selectedFile, setSelectedFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const userParametersService = DataAPIParametersService();
    // Nota: Eliminé el estado [loading, setLoading] ya que no se estaba usando para la carga de la imagen.
    const [reloadKey, setReloadKey] = useState("1");

    const LOGO_URL = useMemo(() =>
        API_BASE_URL + '/img/login_background.png?key=' + reloadKey,
        [API_BASE_URL, reloadKey]
    );

    // ... (handleFileChange y handleCancel se mantienen iguales)
    const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            setSelectedFile(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const handleCancel = () => {
        setSelectedFile(null);
        setPreviewUrl(null);
        document.getElementById('file-upload-button-login-background').value = '';
    };

    const handleUpload = async () => {
        if (!selectedFile) {
            ShowMessage(t('error'), 'error');
            return;
        }

        try {
            const dataToSend = new FormData();
            dataToSend.append('file', selectedFile);

            const response = await userParametersService.setLoginBackground(dataToSend);

            if (response.success) {
                ShowMessage(t('parameters_AppLogoUpdated'), 'success');
                setSelectedFile(null);
                setPreviewUrl(null);
                setReloadKey(Date.now().toString(36));
                document.getElementById('file-upload-button-login-background').value = '';
            } else {
                ShowMessage(t('error'), 'error');
            }
        } catch (error) {
            console.error("Error uploading logo:", error);
            ShowMessage(t('error'), 'error');
        }
    };

    return (
        <Paper elevation={3} sx={{ p: { xs: 2, md: 4 }, margin: '0 auto' ,marginBottom:'20px' }}>
            <Typography variant="h5" gutterBottom>
                {t('parameters_editAppLogo')}
            </Typography>

            <Box
                sx={{
                    my: 3,
                    display: 'flex',
                    flexDirection: { xs: 'column', md: 'row' },
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: { xs: 2, md: 3 }
                }}
            >
                {/* 1. Logo Actual (AQUÍ SE APLICÓ loading="lazy") */}
                <Box
                    sx={{
                        flex: '1 1 45%',
                        textAlign: 'center',
                        maxWidth: { xs: '100%', md: '45%' }
                    }}
                >
                    <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 'bold' }}>
                        {t('parameters_currentAppLogo')}
                    </Typography>
                    <img
                        key={reloadKey}
                        src={LOGO_URL}
                        alt={t('parameters_currentAppLogo')}
                        // ⭐️ Agregamos el atributo loading="lazy" ⭐️
                        loading="lazy"
                        style={{
                            width: '100%',
                            height: 'auto',
                            maxHeight: '500px',
                            objectFit: 'contain',
                            border: '2px solid #ccc',
                            padding: '4px',
                            borderRadius: '4px'
                        }}
                    />
                </Box>

                {/* 2. Indicador de Cambio (sin cambios) */}
                {previewUrl && (
                    <Box
                        sx={{
                            flex: '0 0 auto',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            transform: { xs: 'rotate(90deg)', md: 'rotate(0deg)' },
                            color: 'primary.main',
                            fontSize: { xs: '2rem', md: '3rem' }
                        }}
                    >
                        <Typography
                            variant="caption"
                            sx={{ display: { xs: 'block', md: 'none' }, mb: 1, color: 'primary.main' }}
                        >
                        </Typography>
                        <ArrowForward sx={{ fontSize: 'inherit' }} />
                    </Box>
                )}

                {/* 3. Previsualización del Nuevo Logo (sin cambios) */}
                {previewUrl && (
                    <Box
                        sx={{
                            flex: '1 1 45%',
                            textAlign: 'center',
                            maxWidth: { xs: '100%', md: '45%' }
                        }}
                    >
                        <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 'bold', color: 'primary.main' }}>
                            {t('parameters_newAppLogoPreview', { defaultValue: 'Nuevo Logo (Previsualización)' })}
                        </Typography>
                        <img
                            src={previewUrl}
                            alt={t('parameters_newAppLogoPreview')}
                            style={{
                                width: '100%',
                                height: 'auto',
                                maxHeight: '500px',
                                objectFit: 'contain',
                                border: '2px solid',
                                borderColor: 'primary.main',
                                padding: '4px',
                                borderRadius: '4px'
                            }}
                        />
                    </Box>
                )}
            </Box>

            {/* ... (Controles se mantienen iguales) ... */}
            <Box sx={{ mt: 3, textAlign: 'center' }}>
                <input
                    accept="image/*"
                    style={{ display: 'none' }}
                    id="file-upload-button-login-background"
                    type="file"
                    onChange={handleFileChange}
                />

                {!selectedFile && (
                    <label htmlFor="file-upload-button-login-background">
                        <Button
                            variant="contained"
                            component="span"
                            color="primary"
                        >
                            {t('parameters_selectNewAppLogo')}
                        </Button>
                    </label>
                )}

                {selectedFile && (
                    <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mt: 2 }}>
                        <Button
                            variant="outlined"
                            color="error"
                            onClick={handleCancel}
                        >
                            {t('cancel', { defaultValue: 'Cancelar' })}
                        </Button>

                        <Button
                            color="primary" variant="contained"
                            onClick={handleUpload}
                            disabled={!selectedFile}
                        >
                            {t('confirm')}
                        </Button>
                    </Box>
                )}
            </Box>
        </Paper>
    );
};

export default AppLoginBackgroundEditor;