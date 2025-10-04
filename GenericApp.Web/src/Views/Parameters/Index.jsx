import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    TextField,
    Button,
    Card,
    CardContent,
    Grid,
    CircularProgress,
    InputLabel,
    Input,
    Divider // Importamos Divider para separar mejor las secciones si es necesario
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import FileUploadIcon from '@mui/icons-material/FileUpload';
import { useTranslation } from 'react-i18next';
import logoImage from '@images/logo.png'
import login_backgroundImage from '@images/logo_background.png'

// Asegúrate de que este helper esté disponible o reemplázalo
// import { ShowMessage } from '@helpers/NotificationService'; 

// --- SIMULACIÓN DE DATOS/SERVICIO ---
const MOCK_API_DATA = {
    systemName: 'Mi Aplicación (Beta)',
    systemLogoUrl: 'https://via.placeholder.com/150x50?text=Logo+Actual',
    loginImageUrl: 'https://via.placeholder.com/800x600?text=Login+Background'
};

function SystemParametersIndex() {
    const { t } = useTranslation();

    // --- ESTADOS DE LOS PARÁMETROS DEL SISTEMA ---
    const [systemName, setSystemName] = useState('');
    const [currentLogoUrl, setCurrentLogoUrl] = useState('');
    const [currentLoginImageUrl, setCurrentLoginImageUrl] = useState('');
    const [newLogoFile, setNewLogoFile] = useState(null);
    const [newLoginImageFile, setNewLoginImageFile] = useState(null);

    const [loading, setLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    // Simula la carga inicial de datos (GET)
    const loadParameters = async () => {
        setLoading(true);
        try {
            // SIMULACIÓN DE CARGA DE DATOS EXISTENTES
            await new Promise(resolve => setTimeout(resolve, 800));

            setSystemName(MOCK_API_DATA.systemName);
            setCurrentLogoUrl(MOCK_API_DATA.systemLogoUrl);
            setCurrentLoginImageUrl(MOCK_API_DATA.loginImageUrl);

        } catch (error) {
            console.error("Error al cargar parámetros:", error);
            // ShowMessage(t('errorLoadingParameters'), 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadParameters();
    }, []);

    // Simula la función de guardar (POST/PUT)
    const handleSave = async () => {
        if (!systemName.trim()) {
            // ShowMessage(t('systemNameRequired'), 'warning');
            alert(t('systemNameIsRequired') || 'El nombre del sistema es obligatorio.');
            return;
        }

        setIsSaving(true);
        try {
            // SIMULACIÓN DE GUARDADO
            console.log('--- Datos a enviar al Backend ---');
            console.log('Nombre del Sistema:', systemName);
            console.log('Nuevo Logo (File):', newLogoFile ? newLogoFile.name : 'No change');
            console.log('Nueva Imagen Login (File):', newLoginImageFile ? newLoginImageFile.name : 'No change');

            await new Promise(resolve => setTimeout(resolve, 1500));

            if (newLogoFile) {
                // Generar URL temporal para la previsualización
                setCurrentLogoUrl(URL.createObjectURL(newLogoFile));
                setNewLogoFile(null);
            }
            if (newLoginImageFile) {
                // Generar URL temporal para la previsualización
                setCurrentLoginImageUrl(URL.createObjectURL(newLoginImageFile));
                setNewLoginImageFile(null);
            }

            // ShowMessage(t('parametersSaved'), 'success');
            alert(t('parametersSaved') || 'Parámetros guardados con éxito.');


        } catch (error) {
            console.error("Error al guardar parámetros:", error);
            // ShowMessage(t('errorSavingParameters'), 'error');
            alert(t('errorSavingParameters') || 'Error al guardar los parámetros.');
        } finally {
            setIsSaving(false);
        }
    };

    // Función que maneja la selección de archivos
    const handleFileChange = (event, fileSetter) => {
        const file = event.target.files[0];
        if (file) {
            fileSetter(file);
        }
    };

    // Nombre de archivo a mostrar en el botón
    const getFileName = (file, currentUrl) => {
        if (file) return file.name;
        if (currentUrl) return currentUrl.substring(currentUrl.lastIndexOf('/') + 1);
        return t('noFileSelected');
    };


    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h4" component="h1" gutterBottom>
                {t('systemParameters') || 'Parámetros del Sistema'}
            </Typography>

            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 4, mt: 3 }}>
                    <CircularProgress />
                </Box>
            ) : (
                <Box component="form" onSubmit={(e) => { e.preventDefault(); handleSave(); }} sx={{ mt: 3 }}>

                    {/* 1. CARD: Nombre del Sistema */}
                    <Card sx={{ mb: 4 }}>
                        <CardContent>
                            <Typography variant="h6" gutterBottom color="primary">
                                {t('systemNameTitle') || 'Modificar Nombre del Sistema'}
                            </Typography>
                            <TextField
                                fullWidth
                                label={t('name')}
                                variant="outlined"
                                value={systemName}
                                onChange={(e) => setSystemName(e.target.value)}
                                helperText={t('helpTextSystemName') || 'Nombre que aparece en la cabecera y título de la aplicación.'}
                                required
                            />
                        </CardContent>
                    </Card>

                    {/* 2. CARD: Logo del Sistema */}
                    <Card sx={{ mb: 4 }}>
                        <CardContent>
                            <Typography variant="h6" gutterBottom color="primary">
                                {t('systemLogoTitle') || 'Modificar Logo del Sistema'}
                            </Typography>

                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                {/* Muestra el logo actual o el nuevo */}
                                <img
                                    src={newLogoFile ? URL.createObjectURL(newLogoFile) : currentLogoUrl}
                                    alt={t('currentLogo')}
                                    style={{ height: 50, marginRight: 16, border: '1px solid #ccc', objectFit: 'contain' }}
                                />
                                <Typography variant="body2" color="textSecondary">
                                    {t('currentFile') || 'Archivo actual'}: **{getFileName(newLogoFile, currentLogoUrl)}**
                                </Typography>
                            </Box>

                            <InputLabel htmlFor="logo-upload-button" sx={{ display: 'block' }}>
                                <Input
                                    accept="image/*"
                                    style={{ display: 'none' }}
                                    id="logo-upload-button"
                                    type="file"
                                    onChange={(e) => handleFileChange(e, setNewLogoFile)}
                                />
                                <Button variant="outlined" component="span" startIcon={<FileUploadIcon />}>
                                    {t('uploadNewLogo') || 'Subir Nuevo Logo'}
                                </Button>
                            </InputLabel>
                        </CardContent>
                    </Card>

                    {/* 3. CARD: Imagen del Login */}
                    <Card sx={{ mb: 4 }}>
                        <CardContent>
                            <Typography variant="h6" gutterBottom color="primary">
                                {t('loginImageTitle') || 'Modificar Imagen de Login'}
                            </Typography>

                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                {/* Muestra la imagen de login actual o la nueva */}
                                <img
                                    src={newLoginImageFile ? URL.createObjectURL(newLoginImageFile) : currentLoginImageUrl}
                                    alt={t('currentLoginImage')}
                                    style={{ width: 150, height: 50, marginRight: 16, border: '1px solid #ccc', objectFit: 'cover' }}
                                />
                                <Typography variant="body2" color="textSecondary">
                                    {t('currentFile') || 'Archivo actual'}: **{getFileName(newLoginImageFile, currentLoginImageUrl)}**
                                </Typography>
                            </Box>

                            <InputLabel htmlFor="login-image-upload-button" sx={{ display: 'block' }}>
                                <Input
                                    accept="image/*"
                                    style={{ display: 'none' }}
                                    id="login-image-upload-button"
                                    type="file"
                                    onChange={(e) => handleFileChange(e, setNewLoginImageFile)}
                                />
                                <Button variant="outlined" component="span" startIcon={<FileUploadIcon />}>
                                    {t('uploadNewImage') || 'Subir Nueva Imagen'}
                                </Button>
                            </InputLabel>
                        </CardContent>
                    </Card>

                    {/* Botón de Guardar para todos los Cards */}
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3, pb: 3 }}>
                        <Button
                            variant="contained"
                            color="primary"
                            startIcon={<SaveIcon />}
                            type="submit"
                            disabled={isSaving}
                        >
                            {isSaving ? <CircularProgress size={24} color="inherit" /> : t('saveChanges') || 'Guardar Cambios'}
                        </Button>
                    </Box>
                </Box>
            )}
        </Box>
    );
}

export default SystemParametersIndex;