import React from 'react';
import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    Box,
    Typography,
    Avatar,
    IconButton,
    Divider,
    keyframes
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import CancelIcon from '@mui/icons-material/Clear';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded';
import ErrorOutlineRoundedIcon from '@mui/icons-material/ErrorOutlineRounded';
import CheckCircleOutlineRoundedIcon from '@mui/icons-material/CheckCircleOutlineRounded';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import ChatBubbleOutlineRoundedIcon from '@mui/icons-material/ChatBubbleOutlineRounded';

// Animación de pulso más pronunciada
const pulsate = keyframes`
  0% {
    transform: scale(1);
    filter: drop-shadow(0 0 0px rgba(0,0,0,0));
  }
  50% {
    transform: scale(1.15);
    filter: drop-shadow(0 0 15px rgba(0,0,0,0.1));
  }
  100% {
    transform: scale(1);
    filter: drop-shadow(0 0 0px rgba(0,0,0,0));
  }
`;

const ConfirmationModal = ({
    open,
    onClose,
    onConfirm,
    title,
    message,
    confirmText,
    cancelText,
    type = 'info' // 'success' | 'danger' | 'warning' | 'info' | 'message'
}) => {
    const { t } = useTranslation();

    const getTypeConfig = () => {
        switch (type) {
            case 'success':
                return {
                    color: 'success.main',
                    lightColor: 'success.light',
                    icon: <CheckCircleOutlineRoundedIcon fontSize="inherit" />,
                    confirmColor: 'success'
                };
            case 'danger':
                return {
                    color: 'error.main',
                    lightColor: 'error.light',
                    icon: <ErrorOutlineRoundedIcon fontSize="inherit" />,
                    confirmColor: 'error'
                };
            case 'info':
                return {
                    color: 'info.main',
                    lightColor: 'info.light',
                    icon: <InfoOutlinedIcon fontSize="inherit" />,
                    confirmColor: 'info'
                };
            case 'message':
                return {
                    color: 'primary.main',
                    lightColor: 'primary.light',
                    icon: <ChatBubbleOutlineRoundedIcon fontSize="inherit" />,
                    confirmColor: 'primary'
                };
            default:
                return {
                    color: 'warning.main',
                    lightColor: 'warning.light',
                    icon: <WarningAmberRoundedIcon fontSize="inherit" />,
                    confirmColor: 'warning'
                };
        }
    };

    const config = getTypeConfig();

    return (
        <Dialog
            open={open}
            onClose={onClose}
            fullWidth
            maxWidth="xs"
            PaperProps={{ sx: { borderRadius: 3 } }}
        >
            <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', py: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar
                        sx={{
                            bgcolor: config.lightColor,
                            color: 'white',
                            width: 42,
                            height: 42,
                            borderRadius: 2
                        }}
                    >
                        {/* El icono del header se mantiene pequeño/proporcional */}
                        <Box sx={{ fontSize: '1.5rem', display: 'flex' }}>
                            {config.icon}
                        </Box>
                    </Avatar>
                    <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
                        {title ? title : t('confirmAction')}
                    </Typography>
                </Box>
                <IconButton onClick={onClose} size="small" sx={{ color: 'text.secondary' }}>
                    <CloseIcon />
                </IconButton>
            </DialogTitle>

            <Divider />

            <DialogContent sx={{ py: 5, pt: 2, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                {/* ICONO CENTRAL MUCHO MÁS GRANDE */}
                <Box
                    sx={{
                        color: config.color,
                        fontSize: '6rem', // Aumentado a 6rem
                        display: 'flex',
                        mb: 3,
                        animation: `${pulsate} 2.5s infinite ease-in-out`
                    }}
                >
                    {config.icon}
                </Box>

                <DialogContentText
                    sx={{
                        color: 'text.primary',
                        textAlign: 'center',
                        fontSize: '1.1rem', // Texto un poco más grande para acompañar al icono
                        px: 2
                    }}
                >
                    {message ? message : t('question_areYouSure')}
                </DialogContentText>
            </DialogContent>

            <Divider />

            <DialogActions sx={{ p: 2.5, justifyContent: 'center', gap: 2 }}>
                <Button
                    onClick={onClose}
                    variant="outlined"
                    color="inherit"
                    endIcon={<CancelIcon />}
                >
                    {cancelText ? cancelText : t('cancel')}
                </Button>
                <Button
                    onClick={onConfirm}
                    variant="contained"
                    color={config.confirmColor}
                    disableElevation
                    endIcon={<CheckIcon />}
                >
                    {confirmText ? confirmText : t('confirm')}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default ConfirmationModal;