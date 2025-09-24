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
    Snackbar,
    Alert,
} from '@mui/material';
import FileCopyIcon from '@mui/icons-material/FileCopy';
import { useTranslation } from 'react-i18next';
import { ShowMessage } from '@helpers/NotificationService';
import Tooltip from '@mui/material/Tooltip';

const PasswordModal = ({ open, onClose, password }) => {
    const { t } = useTranslation();
    const [snackbarOpen, setSnackbarOpen] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(password);
        setSnackbarOpen(true);
        ShowMessage(t('textCopiedOnClipboard'), 'info');
    };

    const handleCloseSnackbar = () => {
        setSnackbarOpen(false);
    };

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
            <DialogTitle>{t('userPassword')}</DialogTitle>
            <DialogContent>
                <Typography variant="body1" sx={{ mb: 2 }}>
                    {t('newUserPasswordIs')}
                </Typography>
                <TextField
                    fullWidth
                    value={password}
                    InputProps={{
                        readOnly: true,
                        endAdornment: (
                            <InputAdornment position="end">
                                <Tooltip title={t('copy')}>
                                    <IconButton onClick={handleCopy} edge="end">
                                        <FileCopyIcon />
                                    </IconButton>
                                </Tooltip>
                            </InputAdornment>
                        ),
                    }}
                />
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>{t('close')}</Button>
            </DialogActions>
        </Dialog>
    );
};

export default PasswordModal;