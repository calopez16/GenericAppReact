import React, { useState, useEffect, useContext } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    Box,
    IconButton,
    Typography,
    Paper
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import DrawIcon from '@mui/icons-material/Draw';
import ImageIcon from '@mui/icons-material/Image';
import DeleteIcon from '@mui/icons-material/Delete';
import { useTranslation } from 'react-i18next';
import { ShowMessage } from '@helpers/NotificationService';
import { DataAPIContractSignsService } from '@data/ContractSigns/Data';
import { AppContext } from '@helpers/AppContext';
import { apiBaseUrl } from '@/runtimeConfig';
import SignaturePadModal from '@/Components/SignaturePadModal';
import ImageCropModal from '@/Components/ImageCropModal';

function ContractSignFormModal({ open, handleClose, data, isEditing, setData }) {
    const { t } = useTranslation();
    const { companySelected } = useContext(AppContext);
    const signDataService = DataAPIContractSignsService();

    const [formData, setFormData] = useState({
        name: '',
        signFile: null,
        signPreview: null
    });
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [isSignaturePadOpen, setIsSignaturePadOpen] = useState(false);
    const [isCropModalOpen, setIsCropModalOpen] = useState(false);
    const [tempImageUrl, setTempImageUrl] = useState(null);

    useEffect(() => {
        if (data && isEditing) {
            setFormData({
                name: data.name || '',
                signFile: null,
                signPreview: data.signFileName ? `${apiBaseUrl}/img/signs/${companySelected?.idCompany}/${data.signFileName}` : null
            });
        } else {
            setFormData({
                name: '',
                signFile: null,
                signPreview: null
            });
        }
        setErrors({});
    }, [data, isEditing, open, companySelected]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (!file.type.startsWith('image/')) {
                ShowMessage(t('onlyImagesAllowed'), 'error');
                return;
            }
            const imageUrl = URL.createObjectURL(file);
            setTempImageUrl(imageUrl);
            setIsCropModalOpen(true);
        }
    };

    const handleSignatureFromPad = ({ base64 }) => {
        if (!base64) return;

        const img = base64.startsWith('data:') ? base64 : `data:image/png;base64,${base64}`;
        setTempImageUrl(img);
        setIsCropModalOpen(true);
    };

    const handleRemoveSign = () => {
        setFormData(prev => ({
            ...prev,
            signFile: null,
            signPreview: null
        }));
    };

    const handleCropComplete = ({ file, url }) => {
        setFormData(prev => ({
            ...prev,
            signFile: file,
            signPreview: url
        }));
        if (tempImageUrl) {
            URL.revokeObjectURL(tempImageUrl);
            setTempImageUrl(null);
        }
    };

    const handleCloseCropModal = () => {
        setIsCropModalOpen(false);
        if (tempImageUrl) {
            URL.revokeObjectURL(tempImageUrl);
            setTempImageUrl(null);
        }
    };

    const validate = () => {
        const newErrors = {};
        if (!formData.name.trim()) {
            newErrors.name = t('fieldRequired');
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async () => {
        if (!validate()) return;

        setLoading(true);
        try {
            const submitData = new FormData();

            if (isEditing) {
                submitData.append('IdContractSign', data.idContractSign);
            }

            submitData.append('Name', formData.name.trim());
            submitData.append('IdCompany', companySelected?.idCompany || 0);
            submitData.append('IsActive', true);

            if (formData.signFile) {
                submitData.append('Sign', formData.signFile);
            } else if (isEditing && data.signFileName && !formData.signPreview) {
                submitData.append('RemoveSign', true);
            }

            const response = isEditing
                ? await signDataService.editData(submitData, true)
                : await signDataService.addData(submitData, true);

            if (response.success) {
                ShowMessage(isEditing ? t('recordUpdated') : t('recordAdded'), 'success');
                setData(prev => {
                    if (isEditing) {
                        return prev.map(item =>
                            item.idContractSign === data.idContractSign
                                ? { ...item, ...response.data }
                                : item
                        );
                    } else {
                        return [response.data, ...prev];
                    }
                });
                handleClose();
            } else {
                ShowMessage(response.message || t('error'), 'error');
            }
        } catch (error) {
            console.error('Error saving contract sign:', error);
            ShowMessage(t('error'), 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Dialog
                open={open}
                onClose={handleClose}
                maxWidth="sm"
                fullWidth
                PaperProps={{
                    sx: {
                        borderRadius: 2,
                        boxShadow: 24
                    }
                }}
            >
                <DialogTitle sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    pb: 1
                }}>
                    <Typography variant="h6" component="div" sx={{ fontWeight: 600 }}>
                        {isEditing ? t('contractSign_edit') : t('contractSign_add')}
                    </Typography>
                    <IconButton
                        edge="end"
                        color="inherit"
                        onClick={handleClose}
                        aria-label="close"
                        size="small"
                    >
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>

                <DialogContent dividers>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                        <TextField
                            fullWidth
                            label={t('name')}
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            error={!!errors.name}
                            helperText={errors.name}
                            inputProps={{ maxLength: 150 }}
                            required
                        />
                        <Box>
                            <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                                {t('signature')}
                            </Typography>

                            {formData.signPreview ? (
                                <Paper
                                    elevation={0}
                                    sx={{
                                        p: 2,
                                        border: '2px dashed',
                                        borderColor: 'divider',
                                        borderRadius: 2,
                                        position: 'relative',
                                        textAlign: 'center'
                                    }}
                                >
                                    <img
                                        src={formData.signPreview}
                                        alt="Signature preview"
                                        style={{
                                            maxWidth: '100%',
                                            maxHeight: '150px',
                                            objectFit: 'contain'
                                        }}
                                    />
                                    <IconButton
                                        onClick={handleRemoveSign}
                                        sx={{
                                            position: 'absolute',
                                            top: 8,
                                            right: 8,
                                            bgcolor: 'background.paper',
                                            '&:hover': { bgcolor: 'error.light', color: 'white' }
                                        }}
                                        size="small"
                                    >
                                        <DeleteIcon fontSize="small" />
                                    </IconButton>
                                </Paper>
                            ) : (
                                <Box sx={{ display: 'flex', gap: 2 }}>
                                    <Button
                                        variant="contained"
                                        component="label"
                                        startIcon={<ImageIcon />}
                                        fullWidth
                                    >
                                        {t('uploadImage')}
                                        <input
                                            type="file"
                                            hidden
                                            accept="image/*"
                                            onChange={handleFileChange}
                                        />
                                    </Button>
                                    <Button
                                        variant="contained"
                                        startIcon={<DrawIcon />}
                                        onClick={() => setIsSignaturePadOpen(true)}
                                        fullWidth
                                    >
                                        {t('drawSignature')}
                                    </Button>
                                </Box>
                            )}
                        </Box>
                    </Box>
                </DialogContent>

                <DialogActions sx={{ px: 3, py: 2 }}>
                    <Button
                        onClick={handleClose}
                        variant="outlined"
                        disabled={loading}
                    >
                        {t('cancel')}
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        variant="contained"
                        disabled={loading}
                    >
                        {loading ? t('saving') : t('save')}
                    </Button>
                </DialogActions>
            </Dialog>

            <SignaturePadModal
                open={isSignaturePadOpen}
                onClose={() => setIsSignaturePadOpen(false)}
                onSave={handleSignatureFromPad}
                autoStart={true}
            />

            <ImageCropModal
                open={isCropModalOpen}
                onClose={handleCloseCropModal}
                imageUrl={tempImageUrl}
                onCropComplete={handleCropComplete}
            />
        </>
    );
}

export default ContractSignFormModal;
