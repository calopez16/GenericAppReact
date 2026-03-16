import React from 'react';
import {
    Dialog,
    DialogContent,
    IconButton,
    Tooltip,
    Box,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { useTranslation } from 'react-i18next';
import ClinicalHistoryWizard from '@views/ClinicalHistory/ClinicalHistoryWizard';

const ClinicalHistoryModal = ({ open, handleClose, client }) => {
    const { t } = useTranslation();

    return (
        <Dialog
            open={open}
            onClose={handleClose}
            maxWidth="lg"
            fullWidth
            PaperProps={{ sx: { borderRadius: 3, minHeight: '80vh' } }}
        >
            <Box sx={{ position: 'absolute', top: 8, right: 8, zIndex: 1 }}>
                <Tooltip title={t('close')}>
                    <IconButton onClick={handleClose} size="small" sx={{ color: 'text.secondary' }}>
                        <CloseIcon />
                    </IconButton>
                </Tooltip>
            </Box>
            <DialogContent sx={{ p: 3 }}>
                {client && (
                    <ClinicalHistoryWizard client={client} onClose={handleClose} />
                )}
            </DialogContent>
        </Dialog>
    );
};

export default ClinicalHistoryModal;
