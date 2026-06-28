import { useState, useEffect, useContext } from 'react';
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

const CACHE_KEY_SELECTED_TEMPLATES = 'contracts_wizard_selected_templates';
const CACHE_KEY_SHOW_PREVIEW = 'contracts_wizard_show_preview';

const ContractWizardModal = ({ open, onClose, onComplete }) => {
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

    const steps = showPreview 
        ? [
            t('selectEmployee') || 'Seleccionar Empleado',
            t('selectTemplates') || 'Seleccionar Plantillas',
            t('preview') || 'Previsualizar',
            t('sign') || 'Firmar'
        ]
        : [
            t('selectEmployee') || 'Seleccionar Empleado',
            t('selectTemplates') || 'Seleccionar Plantillas',
            t('sign') || 'Firmar'
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
        }
    }, [open]);

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
                setTemplates(response.data || []);
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
    }, [activeStep, companySelected, open]);

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
        if (!signatureData || !selectedEmployee || selectedTemplates.length === 0) {
            ShowMessage(t('error') || 'Error', 'error');
            return;
        }

        try {
            setIsSaving(true);

            const payload = {
                idEmployee: selectedEmployee.idEmployee,
                idCompany: companySelected.idCompany,
                templateIds: selectedTemplates.map(t => t.idTemplate),
                signatureBase64: signatureData.base64,
                signatureString: signatureData.sigString
            };

            const result = await contractService.addData(payload, true);

            if (result.success) {
                ShowMessage(t('contractSaved') || 'Contrato guardado exitosamente', 'success');
                if (onComplete) {
                    onComplete({
                        employee: selectedEmployee,
                        templates: selectedTemplates,
                        signature: signatureData
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
                    return signatureData !== null;
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
                    return signatureData !== null;
                default:
                    return false;
            }
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
                                {t('searchEmployee') || 'Buscar Empleado'}
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
                                {t('selectContractTemplates') || 'Seleccionar Plantillas de Contrato'}
                            </Typography>
                        </Box>
                        {loadingTemplates ? (
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
                                    {t('previewTemplate') || 'Previsualizar plantilla'}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                    {t('previewTemplateDescription') || 'Mostrar vista previa del documento antes de firmar'}
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
                    <Box>
                        <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                            <DrawIcon sx={{ color: 'primary.main' }} />
                            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                                {t('digitalSignature') || 'Firma Digital'}
                            </Typography>
                        </Box>

                        {signatureData ? (
                            <Paper
                                elevation={0}
                                sx={{
                                    p: 2,
                                    border: '1px solid',
                                    borderColor: 'success.main',
                                    borderRadius: 2,
                                    bgcolor: 'success.lighter'
                                }}
                            >
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                                    <DrawIcon sx={{ color: 'success.main' }} />
                                    <Typography variant="subtitle2" sx={{ fontWeight: 600, color: 'success.main' }}>
                                        {t('signatureCaptured') || 'Firma Capturada'}
                                    </Typography>
                                </Box>
                                <Box
                                    component="img"
                                    src={`data:image/png;base64,${signatureData.base64}`}
                                    alt="Signature"
                                    sx={{
                                        width: '100%',
                                        maxWidth: 500,
                                        height: 'auto',
                                        border: '1px solid',
                                        borderColor: 'divider',
                                        borderRadius: 1,
                                        bgcolor: 'white',
                                        display: 'block',
                                        mx: 'auto'
                                    }}
                                />
                                <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}>
                                    <Button
                                        variant="outlined"
                                        size="small"
                                        onClick={handleOpenSignature}
                                        startIcon={<DrawIcon />}
                                    >
                                        {t('retakeSignature') || 'Capturar Nuevamente'}
                                    </Button>
                                </Box>
                            </Paper>
                        ) : (
                            <Paper
                                elevation={0}
                                sx={{
                                    p: 4,
                                    border: '2px dashed',
                                    borderColor: 'divider',
                                    borderRadius: 2,
                                    textAlign: 'center'
                                }}
                            >
                                <DrawIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
                                <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
                                    {t('signatureRequired') || 'Es necesario capturar la firma digital'}
                                </Typography>
                                <Button
                                    variant="contained"
                                    size="large"
                                    onClick={handleOpenSignature}
                                    startIcon={<DrawIcon />}
                                >
                                    {t('captureSignature') || 'Capturar Firma'}
                                </Button>
                            </Paper>
                        )}

                        <Box
                            sx={{
                                mt: 3,
                                p: 2,
                                borderRadius: 2,
                                bgcolor: 'info.lighter',
                                border: '1px solid',
                                borderColor: 'info.main'
                            }}
                        >
                            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1, color: 'info.main' }}>
                                {t('contractSummary') || 'Resumen del Contrato'}
                            </Typography>
                            <Typography variant="body2">
                                <strong>{t('employee') || 'Empleado'}:</strong> {selectedEmployee?.nombre} {selectedEmployee?.apellidoPaterno} {selectedEmployee?.apellidoMaterno}
                            </Typography>
                            <Typography variant="body2">
                                <strong>{t('templates') || 'Plantillas'}:</strong> {selectedTemplates.map(t => t.name).join(', ')}
                            </Typography>
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
                        <ArticleIcon />
                    </Avatar>
                    <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                        <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1.2 }} noWrap>
                            {t('newContract') || 'Nuevo Contrato'}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" noWrap>
                            {t('contractWizard_subtitle') || 'Asistente de creación de contratos'}
                        </Typography>
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

        <SignaturePadModal
            open={isSignatureModalOpen}
            onClose={() => setIsSignatureModalOpen(false)}
            onSave={handleSignatureSave}
            autoStart={true}
        />
        </>
    );
};

export default ContractWizardModal;
