import React from 'react';
import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import CancelIcon from '@mui/icons-material/Clear';
import CheckIcon from '@mui/icons-material/Check';
// Define las props que el componente aceptará
const ConfirmationModal = ({
    open,
    onClose,
    onConfirm,
    title,
    message,
    confirmText,
    cancelText
}) => {
    const { t } = useTranslation();

    return (
        <Dialog
            open={open}
            onClose={onClose}
            aria-labelledby="confirmation-modal-title"
            aria-describedby="confirmation-modal-description"
        >
            <DialogTitle id="confirmation-modal-title">
                {title ? title : t('confirmAction')}
            </DialogTitle>

            <DialogContent>
                <DialogContentText id="confirmation-modal-description">
                    {message ? message : t('question_areYouSure')}
                </DialogContentText>
            </DialogContent>

            <DialogActions>
                <Button color="error" variant="outlined" endIcon={<CancelIcon />} onClick={onClose}>
                    {cancelText ? cancelText : t('cancel')}
                </Button>
                <Button color="primary" variant="contained" endIcon={<CheckIcon /> } onClick={onConfirm} >
                    {confirmText ? confirmText : t('confirm')}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default ConfirmationModal;