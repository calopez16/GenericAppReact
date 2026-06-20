import { useMemo } from 'react';
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
    Chip,
    useTheme,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import VisibilityIcon from '@mui/icons-material/Visibility';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import { useTranslation } from 'react-i18next';
import { AVAILABLE_VARIABLES, applyPreviewData } from '@data/ContractTemplates/Variables';

// ---------------------------------------------------------------------------
// ContractTemplatePreviewModal
// Opens a read-only dialog that renders the Tiptap HTML with sample values
// substituted for every {{variable}} placeholder.
// ---------------------------------------------------------------------------
const ContractTemplatePreviewModal = ({ open, onClose, template }) => {
    const { t } = useTranslation();
    const theme = useTheme();

    // Replace all placeholders with sample data — memoised on template.content
    const previewHtml = useMemo(() => {
        if (!template?.content) return '';
        return applyPreviewData(template.content);
    }, [template?.content]);

    if (!template) return null;

    // Prose styles that give a clean document feel, neutral across light/dark
    const proseContainerSx = {
        p: { xs: 2, sm: 3 },
        borderRadius: 2,
        border: '1px solid',
        borderColor: 'divider',
        bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.03)' : '#fafafa',
        minHeight: 200,
        fontSize: '0.9375rem',
        lineHeight: 1.75,
        color: 'text.primary',
        fontFamily: 'inherit',
        // Tiptap-generated HTML elements
        '& p': { margin: '0 0 0.6em' },
        '& ul, & ol': { pl: '1.5em', mb: '0.6em' },
        '& li': { mb: '0.15em' },
        '& strong': { fontWeight: 700 },
        '& em': { fontStyle: 'italic' },
        '& code': {
            fontFamily: 'monospace',
            fontSize: '0.85em',
            bgcolor: 'action.hover',
            px: '4px',
            borderRadius: '3px',
        },
        '& h1, & h2, & h3': { fontWeight: 700, mb: '0.4em', mt: '0.8em' },
        // Highlight any atom-node spans that were NOT substituted (edge cases)
        '& span[data-variable]': {
            bgcolor: 'warning.light',
            color: 'warning.contrastText',
            px: '4px',
            borderRadius: '3px',
            fontSize: '0.82em',
            fontFamily: 'monospace',
        },
    };

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="md"
            fullWidth
            PaperProps={{ sx: { borderRadius: 3 } }}
        >
            {/* ?? Title ?? */}
            <DialogTitle sx={{ pb: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar sx={{ bgcolor: 'info.light', color: 'white', borderRadius: 2 }}>
                        <VisibilityIcon />
                    </Avatar>
                    <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                        <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1.2 }} noWrap>
                            {t('contractTemplate_preview')}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" noWrap>
                            {template.name}
                        </Typography>
                    </Box>
                    <Tooltip title={t('close')}>
                        <IconButton onClick={onClose} size="small">
                            <CloseIcon />
                        </IconButton>
                    </Tooltip>
                </Box>
            </DialogTitle>

            <Divider />

            {/* ?? Sample-data banner ?? */}
            <Box
                sx={{
                    mx: 3,
                    mt: 2,
                    mb: 0,
                    p: 1.5,
                    borderRadius: 2,
                    bgcolor: theme.palette.mode === 'dark'
                        ? 'rgba(255,193,7,0.10)'
                        : 'rgba(255,193,7,0.12)',
                    border: '1px solid',
                    borderColor: theme.palette.mode === 'dark'
                        ? 'rgba(255,193,7,0.30)'
                        : 'rgba(255,193,7,0.45)',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 1,
                }}
            >
                <InfoOutlinedIcon sx={{ fontSize: 18, color: 'warning.main', mt: 0.1, flexShrink: 0 }} />
                <Box>
                    <Typography variant="caption" sx={{ fontWeight: 600, display: 'block', color: 'warning.main' }}>
                        {t('contractTemplate_preview_sampleBanner')}
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 0.75 }}>
                        {AVAILABLE_VARIABLES.map((v) => (
                            <Chip
                                key={v.key}
                                label={`${v.label} ? ${v.sample}`}
                                size="small"
                                variant="outlined"
                                sx={{
                                    height: 22,
                                    fontSize: '0.7rem',
                                    fontFamily: 'monospace',
                                    borderColor: 'warning.main',
                                    color: 'warning.main',
                                }}
                            />
                        ))}
                    </Box>
                </Box>
            </Box>

            {/* ?? Rendered HTML ?? */}
            <DialogContent sx={{ pt: 2 }}>
                {previewHtml ? (
                    <Box
                        className="tiptap-preview"
                        sx={proseContainerSx}
                        dangerouslySetInnerHTML={{ __html: previewHtml }}
                    />
                ) : (
                    <Box
                        sx={{
                            ...proseContainerSx,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'text.disabled',
                            fontStyle: 'italic',
                        }}
                    >
                        {t('contractTemplate_preview_empty')}
                    </Box>
                )}
            </DialogContent>

            <Divider />

            {/* ?? Footer ?? */}
            <DialogActions sx={{ px: 3, py: 2 }}>
                <Button
                    variant="outlined"
                    color="inherit"
                    startIcon={<CloseIcon />}
                    onClick={onClose}
                >
                    {t('close')}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default ContractTemplatePreviewModal;
