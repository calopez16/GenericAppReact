import { useEffect, useRef, useState } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Box,
    Typography,
    IconButton,
    Alert,
    Chip,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import DrawIcon from '@mui/icons-material/Draw';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import SaveIcon from '@mui/icons-material/Save';
import PowerSettingsNewIcon from '@mui/icons-material/PowerSettingsNew';
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord';
import { useTranslation } from 'react-i18next';

const CANVAS_WIDTH = 500;
const CANVAS_HEIGHT = 150;

function SignaturePadModal({ open, onClose, onSave }) {
    const { t } = useTranslation();
    const canvasRef = useRef(null);
    // timerRef guarda el interval devuelto por SetTabletState(1, ctx)
    const timerRef = useRef(null);

    const [padActive, setPadActive] = useState(false);
    const [sigwebReady, setSigwebReady] = useState(false);
    const [error, setError] = useState('');

    // Al abrir el modal: verificar disponibilidad de SigWeb y limpiar estado
    useEffect(() => {
        if (!open) return;

        setError('');
        setPadActive(false);

        const installed = typeof window.IsSigWebInstalled === 'function'
            ? window.IsSigWebInstalled()
            : typeof window.SetTabletState === 'function';

        if (!installed) {
            setError(
                t('sigweb_notAvailable') ||
                'SigWeb no está disponible. Verifique que el servicio está instalado y ejecutándose en https://localhost:47290/SigWeb/'
            );
            setSigwebReady(false);
        } else {
            setSigwebReady(true);
        }
    }, [open]);

    // Cleanup: apagar el pad si el modal se desmonta mientras está activo
    useEffect(() => {
        return () => {
            if (timerRef.current !== null) {
                window.SetTabletState(0, timerRef.current);
                timerRef.current = null;
            }
        };
    }, []);

    const startPad = () => {
        if (!sigwebReady || !canvasRef.current) return;
        setError('');

        const canvas = canvasRef.current;
        const ctx2d = canvas.getContext('2d');

        // Limpiar historial anterior antes de iniciar una nueva captura
        window.ClearTablet();
        window.NumPointsLastTime = 0;
        ctx2d.clearRect(0, 0, canvas.width, canvas.height);

        // Configurar tamaño de imagen de captura igual al canvas
        window.SetImageXSize(CANVAS_WIDTH);
        window.SetImageYSize(CANVAS_HEIGHT);

        // Retorna el timer del setInterval interno de SigWebRefresh
        const timer = window.SetTabletState(1, ctx2d);
        timerRef.current = timer;
        setPadActive(true);
    };

    const stopPad = () => {
        // SetTabletState(0, timer) hace clearInterval del timer devuelto al activar
        window.SetTabletState(0, timerRef.current);
        timerRef.current = null;
        setPadActive(false);
    };

    const clearSignature = () => {
        if (!padActive) return;

        // ClearTablet() llama al endpoint ClearSignature ? borra todos los
        // puntos de la firma de la memoria del servicio SigWeb.
        // ClearSigWindow(1) solo limpia la visualización, no los datos.
        window.ClearTablet();

        // Resetear el contador global del SDK para que SigWebRefresh detecte
        // el cambio (0 puntos) y dibuje el canvas vacío en el próximo tick.
        window.NumPointsLastTime = 0;

        // Limpiar el canvas de React de forma inmediata sin esperar al refresh
        const canvas = canvasRef.current;
        if (canvas) {
            canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
        }
    };

    const handleSave = () => {
        const points = window.NumberOfTabletPoints
            ? parseInt(window.NumberOfTabletPoints(), 10)
            : 0;

        if (points === 0) {
            setError(t('sigweb_noSignature') || 'Por favor, firme en el pad antes de guardar.');
            return;
        }

        setError('');

        // Detener el pad antes de capturar la imagen final
        if (padActive) stopPad();

        // Configurar tamaño de imagen de salida y obtener en base64
        window.SetImageXSize(CANVAS_WIDTH);
        window.SetImageYSize(CANVAS_HEIGHT);

        window.GetSigImageB64((base64Image) => {
            const sigString = window.GetSigString ? window.GetSigString() : null;
            onSave?.({ base64: base64Image, sigString });
            onClose();
        });
    };

    const handleClose = () => {
        if (padActive) stopPad();
        onClose();
    };

    return (
        <Dialog
            open={open}
            onClose={handleClose}
            maxWidth="sm"
            fullWidth
            PaperProps={{ sx: { borderRadius: 2 } }}
        >
            <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pb: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <DrawIcon color="primary" />
                    <Typography variant="h6" fontWeight={700}>
                        {t('signatureTopaz') || 'Firma Topaz'}
                    </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Chip
                        icon={<FiberManualRecordIcon sx={{ fontSize: 12 }} />}
                        label={
                            padActive
                                ? (t('sigweb_active') || 'Activo')
                                : sigwebReady
                                    ? (t('sigweb_ready') || 'Listo')
                                    : (t('sigweb_disconnected') || 'Sin conexión')
                        }
                        size="small"
                        color={padActive ? 'success' : sigwebReady ? 'default' : 'error'}
                        variant="outlined"
                    />
                    <IconButton onClick={handleClose} size="small">
                        <CloseIcon />
                    </IconButton>
                </Box>
            </DialogTitle>

            <DialogContent dividers>
                {error && (
                    <Alert severity="warning" sx={{ mb: 2 }} onClose={() => setError('')}>
                        {error}
                    </Alert>
                )}

                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                    {/* Canvas donde SigWebRefresh dibujará en tiempo real */}
                    <canvas
                        ref={canvasRef}
                        width={CANVAS_WIDTH}
                        height={CANVAS_HEIGHT}
                        style={{
                            border: '2px solid',
                            borderColor: padActive ? '#1976d2' : '#bdbdbd',
                            borderRadius: 6,
                            backgroundColor: '#fafafa',
                            maxWidth: '100%',
                            cursor: padActive ? 'crosshair' : 'default',
                            transition: 'border-color 0.3s',
                            display: 'block',
                        }}
                    />

                    <Typography variant="caption" color="text.secondary">
                        {padActive
                            ? (t('sigweb_instruction') || 'Firme en el pad Topaz. La firma aparecerá en tiempo real.')
                            : (t('sigweb_instructionIdle') || 'Presione "Encender Pad" para iniciar la captura.')}
                    </Typography>

                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', justifyContent: 'center' }}>
                        <Button
                            variant={padActive ? 'contained' : 'outlined'}
                            color={padActive ? 'error' : 'primary'}
                            startIcon={<PowerSettingsNewIcon />}
                            onClick={padActive ? stopPad : startPad}
                            disabled={!sigwebReady}
                        >
                            {padActive
                                ? (t('sigweb_stopPad') || 'Apagar Pad')
                                : (t('sigweb_startPad') || 'Encender Pad')}
                        </Button>

                        <Button
                            variant="outlined"
                            color="secondary"
                            startIcon={<DeleteOutlineIcon />}
                            onClick={clearSignature}
                            disabled={!padActive}
                        >
                            {t('sigweb_clear') || 'Limpiar'}
                        </Button>
                    </Box>
                </Box>
            </DialogContent>

            <DialogActions sx={{ px: 3, py: 2 }}>
                <Button onClick={handleClose} startIcon={<CloseIcon />}>
                    {t('cancel') || 'Cancelar'}
                </Button>
                <Button
                    variant="contained"
                    onClick={handleSave}
                    startIcon={<SaveIcon />}
                    disableElevation
                    disabled={!sigwebReady}
                >
                    {t('save') || 'Guardar'}
                </Button>
            </DialogActions>
        </Dialog>
    );
}

export default SignaturePadModal;
