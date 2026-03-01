import React, { useState } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Button,
    Typography,
    IconButton,
    InputAdornment,
    Box,
    Avatar,
    Divider
} from '@mui/material';
import FileCopyIcon from '@mui/icons-material/FileCopy';
import KeyIcon from '@mui/icons-material/Key';
import CloseIcon from '@mui/icons-material/Close';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import { useTranslation } from 'react-i18next';
import { ShowMessage } from '@helpers/NotificationService';
import Tooltip from '@mui/material/Tooltip';

const PasswordModal = ({ open, onClose, password }) => {
    const { t } = useTranslation();
    const [showPassword, setShowPassword] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(password);
        ShowMessage(t('textCopiedOnClipboard'), 'info');
    };

    const handleClickShowPassword = () => {
        setShowPassword(!showPassword);
    };

    return (
        <Dialog
            open={open}
            onClose={onClose}
            fullWidth
            maxWidth="sm"
            PaperProps={{ sx: { borderRadius: 3 } }}
        >
            <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', py: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar sx={{ bgcolor: 'warning.light', color: 'white', width: 42, height: 42, borderRadius: 2 }}>
                        <KeyIcon />
                    </Avatar>
                    <Box>
                        <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
                            {t('userPassword')}
                        </Typography>
                    </Box>
                </Box>
                <IconButton onClick={onClose} size="small" sx={{ color: 'text.secondary' }}>
                    <CloseIcon />
                </IconButton>
            </DialogTitle>

            <Divider />

            <DialogContent sx={{ py: 2 }}>
                <Typography variant="body2" sx={{ mb: 2, color: 'text.secondary' }}>
                    {t('copyPasswordInstruction')}
                    <Divider sx={{ mt: 2, mb: 2 }} />
                    {t('newUserPasswordIs')}
                </Typography>
                <TextField
                    fullWidth
                    value={password}
                    type={showPassword ? 'text' : 'password'}
                    variant="outlined"
                    InputProps={{
                        readOnly: true,
                        sx: {
                            borderRadius: 2,
                            bgcolor: 'action.hover',
                            fontSize: '1.1rem',
                            fontWeight: 600,
                            letterSpacing: showPassword ? '1px' : '4px'
                        },
                        endAdornment: (
                            <InputAdornment position="end">
                                <Tooltip title={showPassword ? t('hide') : t('show')}>
                                    <IconButton onClick={handleClickShowPassword} color="primary">
                                        {showPassword ? <VisibilityOff /> : <Visibility />}
                                    </IconButton>
                                </Tooltip>
                                <Tooltip title={t('copy')}>
                                    <IconButton onClick={handleCopy} edge="end" color="primary">
                                        <FileCopyIcon />
                                    </IconButton>
                                </Tooltip>
                            </InputAdornment>
                        ),
                    }}
                />
            </DialogContent>

            <Divider />

            <DialogActions sx={{ p: 2.5 }}>
                <Button
                    onClick={onClose}
                    disableElevation
                    color="light"
                    variant="outlined"
                    endIcon={<CloseIcon />}
                >
                    {t('close')}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default PasswordModal;