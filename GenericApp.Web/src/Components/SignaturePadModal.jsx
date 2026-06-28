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
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord';
import { useTranslation } from 'react-i18next';

const CANVAS_WIDTH = 500;
const CANVAS_HEIGHT = 150;

function SignaturePadModal({ open, onClose, onSave, autoStart = false }) {
    const { t } = useTranslation();
    const canvasRef = useRef(null);
    const timerRef = useRef(null);

    const [padActive, setPadActive] = useState(false);
    const [sigwebReady, setSigwebReady] = useState(false);
    const [error, setError] = useState('');
    const autoStarted = useRef(false);

    useEffect(() => {
        if (!open) {
            autoStarted.current = false;
            return;
        }

        setError('');
        setPadActive(false);

        const installed = typeof window.IsSigWebInstalled === 'function'
            ? window.IsSigWebInstalled()
            : typeof window.SetTabletState === 'function';

        if (!installed) {
            setError(
                t('sigweb_notAvailable') ||
                'SigWeb no está disponible. Verifique que el servicio esté instalado y ejecutándose en https://localhost:47290/SigWeb/'
            );
            setSigwebReady(false);
        } else {
            setSigwebReady(true);
        }
    }, [open, t]);

    useEffect(() => {
        if (open && sigwebReady && autoStart && !autoStarted.current) {
            autoStarted.current = true;
            setTimeout(() => {
                startPad();
            }, 100);
        }
    }, [open, sigwebReady, autoStart]);

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

        window.ClearTablet();
        window.NumPointsLastTime = 0;
        ctx2d.clearRect(0, 0, canvas.width, canvas.height);

        window.SetImageXSize(CANVAS_WIDTH);
        window.SetImageYSize(CANVAS_HEIGHT);

        const timer = window.SetTabletState(1, ctx2d);
        timerRef.current = timer;
        setPadActive(true);
    };

    const stopPad = () => {
        window.SetTabletState(0, timerRef.current);
        timerRef.current = null;
        setPadActive(false);
    };

    const clearSignature = () => {
        if (!padActive) return;

        window.ClearTablet();
        window.NumPointsLastTime = 0;

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

        if (padActive) stopPad();

        window.SetImageXSize(CANVAS_WIDTH);
        window.SetImageYSize(CANVAS_HEIGHT);

        window.GetSigImageB64((base64Image) => {
            const sigString = window.GetSigString ? window.GetSigString() : null;
            onSave?.({ base64: base64Image, sigString });
        });
        handleClose();
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
                </Box>
            </DialogContent>

            <DialogActions sx={{ px: 3, py: 2 }}>
                <Button
                    variant="outlined"
                    color="secondary"
                    startIcon={<DeleteOutlineIcon />}
                    onClick={clearSignature}
                    disabled={!padActive}
                >
                    {t('sigweb_clear') || 'Limpiar'}
                </Button>
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
