import { useState, useEffect, useContext, useRef } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Box,
    Avatar,
    Typography,
    IconButton,
    Tooltip,
    Divider,
    Stepper,
    Step,
    StepLabel,
    TextField,
    Autocomplete,
    CircularProgress,
    List,
    ListItem,
    ListItemText,
    ListItemButton,
    Checkbox,
    Chip,
    Paper,
    useTheme,
    Alert,
    FormControlLabel,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import PersonSearchIcon from '@mui/icons-material/PersonSearch';
import ArticleIcon from '@mui/icons-material/Article';
import EditDocumentIcon from '@mui/icons-material/EditDocument';
import VisibilityIcon from '@mui/icons-material/Visibility';
import DrawIcon from '@mui/icons-material/Draw';
import RefreshIcon from '@mui/icons-material/Refresh';
import { useTranslation } from 'react-i18next';
import { AppContext } from '@helpers/AppContext';
import { DataAPIEmployeesService } from '@data/Employees/Data';
import { DataAPIContractTemplatesService } from '@data/ContractTemplates/Data';
import { DataAPIContractsService } from '@data/Contracts/Data';
import { ShowMessage } from '@helpers/NotificationService';
import SignaturePadModal from '@/Components/SignaturePadModal';
import PowerSettingsNewIcon from '@mui/icons-material/PowerSettingsNew';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord';

const CACHE_KEY_SELECTED_TEMPLATES = 'contracts_wizard_selected_templates';
const CACHE_KEY_SHOW_PREVIEW = 'contracts_wizard_show_preview';
const ENABLE_TEMPLATE_SELECTION = true;
const CANVAS_WIDTH = 500;
const CANVAS_HEIGHT = 150;

const ContractWizardModal = ({ open, onClose, onComplete, initialEmployee = null, initialStep = 0 }) => {
    const { t } = useTranslation();
    const theme = useTheme();
    const { companySelected } = useContext(AppContext);
    const employeeService = DataAPIEmployeesService();
    const templateService = DataAPIContractTemplatesService();
    const contractService = DataAPIContractsService();

    const [activeStep, setActiveStep] = useState(0);
    const [selectedEmployee, setSelectedEmployee] = useState(null);
    const [selectedTemplates, setSelectedTemplates] = useState([]);
    const [signatureData, setSignatureData] = useState(null);
    const [isSignatureModalOpen, setIsSignatureModalOpen] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [showPreview, setShowPreview] = useState(true);

    const [employeeSearchTerm, setEmployeeSearchTerm] = useState('');
    const [employees, setEmployees] = useState([]);
    const [loadingEmployees, setLoadingEmployees] = useState(false);

    const [templates, setTemplates] = useState([]);
    const [loadingTemplates, setLoadingTemplates] = useState(false);

    const [pdfPreviewUrl, setPdfPreviewUrl] = useState(null);
    const [loadingPreview, setLoadingPreview] = useState(false);
    const [enableTemplateSelection, setEnableTemplateSelection] = useState(ENABLE_TEMPLATE_SELECTION);

    const canvasRef = useRef(null);
    const timerRef = useRef(null);

    const [padActive, setPadActive] = useState(false);
    const [sigwebReady, setSigwebReady] = useState(false);
    const [sigwebError, setSigwebError] = useState('');
    const [hasSignatureData, setHasSignatureData] = useState(false);

    // Determinar el índice dinámico del step de firmas
    const signatureStepIndex = showPreview ? 3 : 2;


    const steps = showPreview 
        ? [
            t('selectEmployee') ,
            t('contractsToSign'),
            t('preview'),
            t('sign')
        ]
        : [
            t('selectEmployee'),
            t('contractsToSign'),
            t('sign')
        ];

    useEffect(() => {
        if (open) {
            const cachedTemplates = localStorage.getItem(CACHE_KEY_SELECTED_TEMPLATES);
            if (cachedTemplates) {
                try {
                    const parsedTemplates = JSON.parse(cachedTemplates);
                    setSelectedTemplates(parsedTemplates);
                } catch (error) {
                    console.error('Error loading cached templates:', error);
                }
            }

            const cachedShowPreview = localStorage.getItem(CACHE_KEY_SHOW_PREVIEW);
            if (cachedShowPreview !== null) {
                try {
                    setShowPreview(JSON.parse(cachedShowPreview));
                } catch (error) {
                    console.error('Error loading cached preview setting:', error);
                }
            }

            if (initialEmployee) {
                setSelectedEmployee(initialEmployee);
                setActiveStep(initialStep);
            } else {
                setActiveStep(0);
            }
        }
    }, [open]);

    useEffect(() => {
        // 1. Limpieza de seguridad: Si sale del step de firma, apagar el hardware inmediatamente
        if (!open || activeStep !== signatureStepIndex) {
            if (timerRef.current !== null) {
                window.SetTabletState?.(0, timerRef.current);
                timerRef.current = null;
            }
            return;
        }

        // 2. Preparar el entorno al entrar al step de firma
        setSigwebError('');
        setHasSignatureData(false); // Reiniciar estado de validación

        const installed = typeof window.IsSigWebInstalled === 'function'
            ? window.IsSigWebInstalled()
            : typeof window.SetTabletState === 'function';

        if (!installed) {
            setSigwebError(
                t('sigweb_notAvailable') ||
                'SigWeb no está disponible. Verifique que el servicio está instalado y ejecutándose.'
            );
            setSigwebReady(false);
            return;
        }

        setSigwebReady(true);

        // 3. Ejecutar el encendido y reinicio automático del lienzo
        setTimeout(() => {
            if (typeof window.SetTabletState !== 'function' || !canvasRef.current) return;

            const canvas = canvasRef.current;
            canvas.width = CANVAS_WIDTH;
            canvas.height = CANVAS_HEIGHT;

            const ctx2d = canvas.getContext('2d');

            if (timerRef.current !== null) {
                window.SetTabletState(0, timerRef.current);
                timerRef.current = null;
            }

            window.ClearTablet?.();
            window.NumPointsLastTime = 0;
            ctx2d.clearRect(0, 0, canvas.width, canvas.height);

            window.SetImageXSize?.(CANVAS_WIDTH);
            window.SetImageYSize?.(CANVAS_HEIGHT);

            timerRef.current = window.SetTabletState(1, ctx2d);

            // --- FUNCIÓN DE ESCUCHA EXTRAÍDA ---
            window.startPointsCheck = () => {
                const checkPointsInterval = setInterval(() => {
                    if (!open || activeStep !== signatureStepIndex) {
                        clearInterval(checkPointsInterval);
                        return;
                    }
                    if (typeof window.NumberOfTabletPoints === 'function') {
                        const points = parseInt(window.NumberOfTabletPoints(), 10);
                        if (points > 0) {
                            setHasSignatureData(true);
                            clearInterval(checkPointsInterval); // Se apaga al detectar firma
                        }
                    }
                }, 300);
            };

            // Iniciar la escucha inicial
            window.startPointsCheck();

        }, 150);
    }, [open, activeStep, signatureStepIndex]);

    // Desmontaje total del componente (Cierre del Modal)
    useEffect(() => {
        return () => {
            if (timerRef.current !== null) {
                window.SetTabletState?.(0, timerRef.current);
                timerRef.current = null;
            }
        };
    }, []);
    useEffect(() => {
        if (selectedTemplates.length > 0) {
            localStorage.setItem(CACHE_KEY_SELECTED_TEMPLATES, JSON.stringify(selectedTemplates));
        }
    }, [selectedTemplates]);

    useEffect(() => {
        localStorage.setItem(CACHE_KEY_SHOW_PREVIEW, JSON.stringify(showPreview));
    }, [showPreview]);

    useEffect(() => {
        const loadEmployees = async () => {
            if (!companySelected?.idCompany || !open || activeStep !== 0) return;
            try {
                setLoadingEmployees(true);
                const response = await employeeService.getEmployeesPagination(
                    companySelected.idCompany,
                    1,
                    100,
                    employeeSearchTerm
                );
                setEmployees(response.data.data || []);
            } catch (error) {
                console.error('Error loading employees:', error);
                setEmployees([]);
            } finally {
                setLoadingEmployees(false);
            }
        };

        const timerId = setTimeout(loadEmployees, 300);
        return () => clearTimeout(timerId);
    }, [employeeSearchTerm, companySelected, open, activeStep]);

    useEffect(() => {
        const loadTemplates = async () => {
            if (!companySelected?.idCompany || !open || activeStep !== 1) return;
            try {
                setLoadingTemplates(true);
                const response = await templateService.getDataActive();
                const data = response.data || [];
                setTemplates(data);
                if (!enableTemplateSelection) {
                    setSelectedTemplates(data);
                }
            } catch (error) {
                console.error('Error loading templates:', error);
                setTemplates([]);
            } finally {
                setLoadingTemplates(false);
            }
        };

        if (activeStep === 1) {
            loadTemplates();
        }
    }, [activeStep, companySelected, open, enableTemplateSelection]);

    useEffect(() => {
        const loadPreview = async () => {
            const currentPreviewStep = showPreview ? 2 : -1;
            if (activeStep !== currentPreviewStep || !selectedEmployee || selectedTemplates.length === 0) return;

            try {
                setLoadingPreview(true);

                // Clean up previous preview URL
                if (pdfPreviewUrl) {
                    URL.revokeObjectURL(pdfPreviewUrl);
                    setPdfPreviewUrl(null);
                }

                const payload = {
                    idEmployee: selectedEmployee.idEmployee,
                    idCompany: companySelected.idCompany,
                    templateIds: selectedTemplates.map(t => t.idTemplate)
                };

                const response = await contractService.getPreview(payload);
                const blob = new Blob([response.data], { type: 'application/pdf' });
                const url = URL.createObjectURL(blob);
                setPdfPreviewUrl(url);
            } catch (error) {
                console.error('Error loading preview:', error);
                ShowMessage(t('errorLoadingPreview') || 'Error al cargar la vista previa', 'error');
            } finally {
                setLoadingPreview(false);
            }
        };

        if (showPreview && activeStep === 2) {
            loadPreview();
        }

        // Cleanup on unmount
        return () => {
            if (pdfPreviewUrl) {
                URL.revokeObjectURL(pdfPreviewUrl);
            }
        };
    }, [activeStep, selectedEmployee, selectedTemplates, showPreview]);

    const handleNext = () => {
        setActiveStep((prev) => prev + 1);
    };

    const handleBack = () => {
        setActiveStep((prev) => prev - 1);
    };

    const handleClose = () => {
        setActiveStep(0);
        setSelectedEmployee(null);
        setEmployeeSearchTerm('');
        setSignatureData(null);
        setIsSaving(false);
        if (pdfPreviewUrl) {
            URL.revokeObjectURL(pdfPreviewUrl);
            setPdfPreviewUrl(null);
        }
        onClose();
    };

    const handleRefreshPreview = async () => {
        if (!selectedEmployee || selectedTemplates.length === 0) return;

        try {
            setLoadingPreview(true);

            // Clean up previous preview URL
            if (pdfPreviewUrl) {
                URL.revokeObjectURL(pdfPreviewUrl);
                setPdfPreviewUrl(null);
            }

            const payload = {
                idEmployee: selectedEmployee.idEmployee,
                idCompany: companySelected.idCompany,
                templateIds: selectedTemplates.map(t => t.idTemplate)
            };

            const response = await contractService.getPreview(payload);
            const blob = new Blob([response.data], { type: 'application/pdf' });
            const url = URL.createObjectURL(blob);
            setPdfPreviewUrl(url);
            ShowMessage(t('previewRefreshed') || 'Vista previa actualizada', 'success');
        } catch (error) {
            console.error('Error refreshing preview:', error);
            ShowMessage(t('errorLoadingPreview') || 'Error al cargar la vista previa', 'error');
        } finally {
            setLoadingPreview(false);
        }
    };

    const handleComplete = async () => {
        if (!selectedEmployee || selectedTemplates.length === 0) {
            ShowMessage(t('error') || 'Error', 'error');
            return;
        }

        const points = window.NumberOfTabletPoints
            ? parseInt(window.NumberOfTabletPoints(), 10)
            : 0;

        if (points === 0) {
            setSigwebError(t('sigweb_noSignature') || 'Por favor, firme en el pad antes de guardar.');
            return;
        }

        setSigwebError('');

        // Apagar periférico antes del volcado de bytes
        if (timerRef.current !== null) {
            window.SetTabletState?.(0, timerRef.current);
            timerRef.current = null;
            setPadActive(false);
        }

        window.SetImageXSize?.(CANVAS_WIDTH);
        window.SetImageYSize?.(CANVAS_HEIGHT);

        // Obtener imagen en base64 de forma asíncrona mediante el callback del SDK
        window.GetSigImageB64(async (base64Image) => {
            const sigString = window.GetSigString ? window.GetSigString() : null;

            try {
                setIsSaving(true);
                const payload = {
                    idEmployee: selectedEmployee.idEmployee,
                    idCompany: companySelected.idCompany,
                    templateIds: selectedTemplates.map(t => t.idTemplate),
                    signatureBase64: base64Image, // Enviado directamente
                    signatureString: sigString
                };

                const result = await contractService.addData(payload, true);
                if (result.success) {
                    ShowMessage(t('contractSaved') || 'Contrato guardado exitosamente', 'success');
                    if (onComplete) {
                        onComplete({
                            employee: selectedEmployee,
                            templates: selectedTemplates,
                            signature: { base64: base64Image, sigString }
                        });
                    }
                    handleClose();
                } else {
                    ShowMessage(result.message || t('error'), 'error');
                }
            } catch (error) {
                console.error('Error saving contract:', error);
                ShowMessage(t('error') || 'Error al guardar el contrato', 'error');
            } finally {
                setIsSaving(false);
            }
        });
    };
    const handleOpenSignature = () => {
        setIsSignatureModalOpen(true);
    };

    const handleSignatureSave = (data) => {
        setSignatureData(data);
        setIsSignatureModalOpen(false);
        ShowMessage(t('signatureSaved') || 'Firma capturada correctamente', 'success');
    };

    const handleToggleTemplate = (template) => {
        setSelectedTemplates(prev => {
            const exists = prev.find(t => t.idTemplate === template.idTemplate);
            if (exists) {
                return prev.filter(t => t.idTemplate !== template.idTemplate);
            } else {
                return [...prev, template];
            }
        });
    };

    const isStepValid = () => {
        if (showPreview) {
            switch (activeStep) {
                case 0:
                    return selectedEmployee !== null;
                case 1:
                    return selectedTemplates.length > 0;
                case 2:
                    return true;
                case 3:
                    return hasSignatureData; // Habilita el botón al firmar
                default:
                    return false;
            }
        } else {
            switch (activeStep) {
                case 0:
                    return selectedEmployee !== null;
                case 1:
                    return selectedTemplates.length > 0;
                case 2:
                    return hasSignatureData; // Habilita el botón al firmar
                default:
                    return false;
            }
        }
    };

    const startPadInstance = () => {
        if (typeof window.SetTabletState !== 'function' || !canvasRef.current) return;
        setSigwebError('');

        const canvas = canvasRef.current;
        const ctx2d = canvas.getContext('2d');

        window.ClearTablet?.();
        window.NumPointsLastTime = 0;
        ctx2d.clearRect(0, 0, canvas.width, canvas.height);

        window.SetImageXSize?.(CANVAS_WIDTH);
        window.SetImageYSize?.(CANVAS_HEIGHT);

        const timer = window.SetTabletState(1, ctx2d);
        timerRef.current = timer;
        setPadActive(true);
    };

    const stopPadInstance = () => {
        if (timerRef.current !== null) {
            window.SetTabletState?.(0, timerRef.current);
            timerRef.current = null;
        }
        setPadActive(false);
    };

    const clearPadSignature = () => {
        if (typeof window.ClearTablet !== 'function') return;
        window.ClearTablet();
        window.NumPointsLastTime = 0;

        const canvas = canvasRef.current;
        if (canvas) {
            canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
        }
    };

    const renderStepContent = () => {
        const signStep = showPreview ? 3 : 2;

        switch (activeStep) {
            case 0:
                return (
                    <Box>
                        <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                            <PersonSearchIcon sx={{ color: 'primary.main' }} />
                            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                                {t('searchEmployee')}
                            </Typography>
                        </Box>
                        <Autocomplete
                            options={employees}
                            getOptionLabel={(option) => 
                                `${option.nombre || ''} ${option.apellidoPaterno || ''} ${option.apellidoMaterno || ''} - ${option.rfc || ''}`.trim()
                            }
                            loading={loadingEmployees}
                            value={selectedEmployee}
                            onChange={(event, newValue) => setSelectedEmployee(newValue)}
                            onInputChange={(event, newInputValue) => setEmployeeSearchTerm(newInputValue)}
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    label={t('employee') || 'Empleado'}
                                    placeholder={t('searchByNameOrDocument') || 'Buscar por nombre o documento'}
                                    InputProps={{
                                        ...params.InputProps,
                                        endAdornment: (
                                            <>
                                                {loadingEmployees ? <CircularProgress color="inherit" size={20} /> : null}
                                                {params.InputProps.endAdornment}
                                            </>
                                        ),
                                    }}
                                />
                            )}
                            renderOption={(props, option) => {
                                const { key, ...otherProps } = props;
                                return (
                                    <Box component="li" key={key} {...otherProps}>
                                        <Box>
                                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                                {`${option.nombre || ''} ${option.apellidoPaterno || ''} ${option.apellidoMaterno || ''}`.trim()}
                                            </Typography>
                                            <Typography variant="caption" color="text.secondary">
                                                {option.rfc || ''} - {option.imss || ''}
                                            </Typography>
                                        </Box>
                                    </Box>
                                );
                            }}
                            noOptionsText={t('noEmployeesFound') || 'No se encontraron empleados'}
                        />
                        {selectedEmployee && (
                            <Paper
                                elevation={0}
                                sx={{
                                    mt: 2,
                                    p: 2,
                                    border: '1px solid',
                                    borderColor: 'divider',
                                    borderRadius: 2,
                                    bgcolor: 'action.hover'
                                }}
                            >
                                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                                    {t('selectedEmployee') || 'Empleado Seleccionado'}
                                </Typography>
                                <Typography variant="body2">
                                    <strong>{t('name') || 'Nombre'}:</strong> {selectedEmployee.nombre} {selectedEmployee.apellidoPaterno} {selectedEmployee.apellidoMaterno}
                                </Typography>
                                <Typography variant="body2">
                                    <strong>{t('rfc') || 'RFC'}:</strong> {selectedEmployee.rfc}
                                </Typography>
                                <Typography variant="body2">
                                    <strong>{t('imss') || 'IMSS'}:</strong> {selectedEmployee.imss}
                                </Typography>
                            </Paper>
                        )}
                    </Box>
                );

            case 1:
                return (
                    <Box>
                        <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                            <ArticleIcon sx={{ color: 'primary.main' }} />
                            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                                {t('contractsToSign')}
                            </Typography>
                        </Box>
                        {/*<Box*/}
                        {/*    sx={{*/}
                        {/*        mb: 2,*/}
                        {/*        p: 2,*/}
                        {/*        border: '1px solid',*/}
                        {/*        borderColor: 'divider',*/}
                        {/*        borderRadius: 2,*/}
                        {/*        bgcolor: 'action.hover',*/}
                        {/*        display: 'flex',*/}
                        {/*        alignItems: 'center',*/}
                        {/*        gap: 2*/}
                        {/*    }}*/}
                        {/*>*/}
                        {/*    <Checkbox*/}
                        {/*        checked={enableTemplateSelection}*/}
                        {/*        onChange={(e) => {*/}
                        {/*            const enabled = e.target.checked;*/}
                        {/*            setEnableTemplateSelection(enabled);*/}
                        {/*            if (!enabled) {*/}
                        {/*                setSelectedTemplates(templates);*/}
                        {/*            }*/}
                        {/*        }}*/}
                        {/*        color="primary"*/}
                        {/*    />*/}
                        {/*    <Box>*/}
                        {/*        <Typography variant="body2" sx={{ fontWeight: 600 }}>*/}
                        {/*            {t('enableTemplateSelection') || 'Seleccionar plantillas manualmente'}*/}
                        {/*        </Typography>*/}
                        {/*        <Typography variant="caption" color="text.secondary">*/}
                        {/*            {t('enableTemplateSelectionDescription') || 'Por defecto se incluyen todas las plantillas activas'}*/}
                        {/*        </Typography>*/}
                        {/*    </Box>*/}
                        {/*</Box>*/}

                        {enableTemplateSelection && (
                            loadingTemplates ? (
                                <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                                    <CircularProgress />
                                </Box>
                            ) : templates.length === 0 ? (
                                <Box
                                    sx={{
                                        py: 4,
                                        textAlign: 'center',
                                        color: 'text.secondary'
                                    }}
                                >
                                    <Typography variant="body2">
                                        {t('noTemplatesAvailable') || 'No hay plantillas disponibles'}
                                    </Typography>
                                </Box>
                            ) : (
                                <List sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
                                    {templates.map((template, index) => {
                                        const isSelected = selectedTemplates.some(t => t.idTemplate === template.idTemplate);
                                        return (
                                            <ListItem
                                                key={template.idTemplate}
                                                disablePadding
                                                divider={index < templates.length - 1}
                                            >
                                                <ListItemButton onClick={() => handleToggleTemplate(template)}>
                                                    <Checkbox
                                                        edge="start"
                                                        checked={isSelected}
                                                        tabIndex={-1}
                                                        disableRipple
                                                    />
                                                    <ListItemText
                                                        primary={template.name}
                                                        secondary={template.description}
                                                        primaryTypographyProps={{ fontWeight: 600 }}
                                                    />
                                                </ListItemButton>
                                            </ListItem>
                                        );
                                    })}
                                </List>
                            )
                        )}

                        {!enableTemplateSelection && (
                            loadingTemplates ? (
                                <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                                    <CircularProgress />
                                </Box>
                            ) : templates.length === 0 ? (
                                <Box sx={{ py: 4, textAlign: 'center', color: 'text.secondary' }}>
                                    <Typography variant="body2">
                                        {t('noContractsAvailable') || 'No hay contratos disponibles'}
                                    </Typography>
                                </Box>
                            ) : (
                                <Box>
                                    {/*<Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>*/}
                                    {/*    {t('contractsToSign') || `Contratos a firmar (${templates.length})`}*/}
                                    {/*</Typography>*/}
                                    <List sx={{ border: '1px solid', borderColor: 'success.light', borderRadius: 2 }}>
                                        {templates.map((template, index) => (
                                            <ListItem
                                                key={template.idTemplate}
                                                divider={index < templates.length - 1}
                                                sx={{ gap: 1 }}
                                            >
                                                <EditDocumentIcon sx={{ color: 'success.main', fontSize: 40, flexShrink: 0 }} />
                                                <ListItemText
                                                    primary={template.name}
                                                    secondary={template.description}
                                                    primaryTypographyProps={{ fontWeight: 600 }}
                                                />
                                            </ListItem>
                                        ))}
                                    </List>
                                </Box>
                            )
                        )}
                       
                        <Box
                            sx={{
                                mt: 2,
                                p: 2,
                                border: '1px solid',
                                borderColor: 'divider',
                                borderRadius: 2,
                                bgcolor: 'action.hover',
                                display: 'flex',
                                alignItems: 'center',
                                gap: 2
                            }}
                        >
                            <Checkbox
                                checked={showPreview}
                                onChange={(e) => setShowPreview(e.target.checked)}
                                color="primary"
                            />
                            <Box>
                                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                    {t('previewContract')}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                    {t('previewContractDescription') }
                                </Typography>
                            </Box>
                        </Box>
                    </Box>
                );

            case 2:
                if (showPreview) {
                    return (
                        <Box>
                            <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <VisibilityIcon sx={{ color: 'primary.main' }} />
                                    <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                                        {t('preview') || 'Vista Previa del Contrato'}
                                    </Typography>
                                </Box>
                                <Button
                                    variant="outlined"
                                    size="small"
                                    startIcon={<RefreshIcon />}
                                    onClick={handleRefreshPreview}
                                    disabled={loadingPreview}
                                >
                                    {t('refresh') || 'Actualizar'}
                                </Button>
                            </Box>


                            {loadingPreview ? (
                                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 500 }}>
                                    <CircularProgress />
                                </Box>
                            ) : pdfPreviewUrl ? (
                                <Paper
                                    elevation={3}
                                    sx={{
                                        borderRadius: 2,
                                        overflow: 'hidden',
                                        border: '1px solid',
                                        borderColor: 'divider'
                                    }}
                                >
                                    <iframe
                                        src={pdfPreviewUrl}
                                        style={{
                                            width: '100%',
                                            height: '600px',
                                            border: 'none',
                                            display: 'block'
                                        }}
                                        title="Contract Preview"
                                    />
                                </Paper>
                            ) : (
                                <Paper
                                    elevation={0}
                                    sx={{
                                        p: 4,
                                        border: '2px dashed',
                                        borderColor: 'divider',
                                        borderRadius: 2,
                                        textAlign: 'center',
                                        minHeight: 300,
                                        display: 'flex',
                                        flexDirection: 'column',
                                        justifyContent: 'center',
                                        alignItems: 'center'
                                    }}
                                >
                                    <VisibilityIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
                                    <Typography variant="body1" color="text.secondary">
                                        {t('noPreviewAvailable') || 'No se pudo cargar la vista previa'}
                                    </Typography>
                                </Paper>
                            )}
                        </Box>
                    );
                }
                // If showPreview is false, fall through to sign step

            case signStep:
                return (
                    <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 3 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Typography variant="subtitle1" fontWeight={600}>
                                {t('signContract') || 'Firmar Contrato'}
                            </Typography>
                            <Chip
                                icon={<FiberManualRecordIcon sx={{ fontSize: 12 }} />}
                                label={
                                    sigwebReady
                                        ? (t('sigweb_active') || 'Pad Conectado e Inicializado')
                                        : (t('sigweb_disconnected') || 'Sin conexión')
                                }
                                size="small"
                                color={sigwebReady ? 'success' : 'error'}
                                variant="outlined"
                            />
                        </Box>

                        {sigwebError && (
                            <Alert severity="warning" onClose={() => setSigwebError('')}>
                                {sigwebError}
                            </Alert>
                        )}

                        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                            {/* Lienzo del Canvas interactivo */}
                            <canvas
                                ref={canvasRef}
                                width={CANVAS_WIDTH}
                                height={CANVAS_HEIGHT}
                                style={{
                                    border: '2px solid',
                                    borderColor: theme.palette.primary.main,
                                    borderRadius: 8,
                                    backgroundColor: '#fafafa',
                                    maxWidth: '100%',
                                    cursor: 'crosshair',
                                    display: 'block',
                                }}
                            />

                            <Typography variant="caption" color="text.secondary">
                                {t('sigweb_instruction') || 'El Pad Topaz está listo. Puede firmar directamente sobre el dispositivo periférico.'}
                            </Typography>

                            <Box sx={{ display: 'flex', gap: 1 }}>
                                <Button
                                    variant="outlined"
                                    color="secondary"
                                    startIcon={<DeleteOutlineIcon />}
                                    onClick={() => {
                                        if (typeof window.ClearTablet !== 'function') return;
                                        window.ClearTablet();
                                        window.NumPointsLastTime = 0;
                                        setHasSignatureData(false); // Bloquea el botón de guardar nuevamente

                                        if (canvasRef.current) {
                                            canvasRef.current.getContext('2d').clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
                                        }

                                        // --- RE-EN CENDER LA ESCUCHA TRAS LIMPIAR ---
                                        if (typeof window.startPointsCheck === 'function') {
                                            window.startPointsCheck();
                                        }
                                    }}
                                    disabled={!sigwebReady}
                                >
                                    {t('sigweb_clear') || 'Limpiar Firma'}
                                </Button>
                            </Box>
                        </Box>
                    </Box>
                );
            default:
                return null;
        }
    };

    return (
        <>
            <Dialog
                open={open}
                onClose={handleClose}
                maxWidth="md"
                fullScreen
                PaperProps={{ sx: { borderRadius: 3, minHeight: '60vh' } }}
            >
            <DialogTitle sx={{ pb: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar sx={{ bgcolor: 'primary.light', color: 'white', borderRadius: 2 }}>
                        <EditDocumentIcon />
                    </Avatar>
                    <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                        <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1.2 }} noWrap>
                            {t('newContract')}
                        </Typography>
                        {selectedEmployee ? (
                            <Typography variant="caption" color="text.secondary" noWrap>
                                {`${selectedEmployee.nombre || ''} ${selectedEmployee.apellidoPaterno || ''} ${selectedEmployee.apellidoMaterno || ''}`.trim()}
                                {selectedEmployee.rfc ? ` - ${selectedEmployee.rfc}` : ''}
                            </Typography>
                        ) : (
                            <Typography variant="caption" color="text.secondary" noWrap>
                                {t('contractWizard_subtitle') || 'Asistente de creación de contratos'}
                            </Typography>
                        )}
                    </Box>
                    <Tooltip title={t('close')}>
                        <IconButton onClick={handleClose} size="small">
                            <CloseIcon />
                        </IconButton>
                    </Tooltip>
                </Box>
            </DialogTitle>

            <Divider />

            <Box sx={{ px: 3, pt: 3, pb: 2 }}>
                <Stepper activeStep={activeStep}>
                    {steps.map((label) => (
                        <Step key={label}>
                            <StepLabel>{label}</StepLabel>
                        </Step>
                    ))}
                </Stepper>
            </Box>

            <DialogContent sx={{ pt: 2, minHeight: 300 }}>
                {renderStepContent()}
            </DialogContent>

            <Divider />

            <DialogActions sx={{ px: 3, py: 2, justifyContent: 'space-between' }}>
                <Button
                    variant="outlined"
                    color="inherit"
                    onClick={handleClose}
                    startIcon={<CloseIcon />}
                >
                    {t('cancel') || 'Cancelar'}
                </Button>
                <Box sx={{ display: 'flex', gap: 1 }}>
                    {activeStep > 0 && (
                        <Button
                            variant="outlined"
                            onClick={handleBack}
                            startIcon={<ArrowBackIcon />}
                        >
                            {t('back') || 'Atrás'}
                        </Button>
                    )}
                    {activeStep < steps.length - 1 ? (
                        <Button
                            variant="contained"
                            onClick={handleNext}
                            disabled={!isStepValid()}
                            endIcon={<ArrowForwardIcon />}
                        >
                            {t('next') || 'Siguiente'}
                        </Button>
                    ) : (
                        <Button
                            variant="contained"
                            onClick={handleComplete}
                            disabled={!isStepValid() || isSaving}
                            color="success"
                            startIcon={isSaving ? <CircularProgress size={20} /> : null}
                        >
                            {isSaving ? (t('saving') || 'Guardando...') : (t('saveContract') || 'Guardar Contrato')}
                        </Button>
                    )}
                </Box>
            </DialogActions>
        </Dialog>

       
        </>
    );
};

export default ContractWizardModal;
