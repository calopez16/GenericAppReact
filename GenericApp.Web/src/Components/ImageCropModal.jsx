import React, { useState, useRef, useEffect } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Box,
    IconButton,
    Typography,
    Slider,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import CropIcon from '@mui/icons-material/Crop';
import RotateLeftIcon from '@mui/icons-material/RotateLeft';
import RotateRightIcon from '@mui/icons-material/RotateRight';
import ZoomInIcon from '@mui/icons-material/ZoomIn';
import ZoomOutIcon from '@mui/icons-material/ZoomOut';
import CenterFocusStrongIcon from '@mui/icons-material/CenterFocusStrong';
import { useTranslation } from 'react-i18next';

function ImageCropModal({ open, onClose, imageUrl, onCropComplete }) {
    const { t } = useTranslation();
    const canvasRef = useRef(null);
    const imageRef = useRef(null);
    const containerRef = useRef(null);

    const [image, setImage] = useState(null);
    const [crop, setCrop] = useState({ x: 150, y: 100, width: 300, height: 150 });
    const [scale, setScale] = useState(1);
    const [rotation, setRotation] = useState(0);
    const [isDraggingImage, setIsDraggingImage] = useState(false);
    const [isDraggingCrop, setIsDraggingCrop] = useState(false);
    const [isResizing, setIsResizing] = useState(false);
    const [resizeHandle, setResizeHandle] = useState(null);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
    const [imagePosition, setImagePosition] = useState({ x: 0, y: 0 });
    const [cropDragStart, setCropDragStart] = useState({ x: 0, y: 0 });

    useEffect(() => {
        if (open && imageUrl) {
            const img = new Image();
            img.crossOrigin = 'anonymous';
            img.onload = () => {
                setImage(img);

                // Calculate initial scale to fit image in canvas
                const canvas = canvasRef.current || { width: 600, height: 400 };
                const containerWidth = containerRef.current?.clientWidth || 600;
                const containerHeight = 400;

                // Calculate scale to fit image with some padding
                const scaleX = (containerWidth * 0.8) / img.width;
                const scaleY = (containerHeight * 0.8) / img.height;
                const initialScale = Math.min(scaleX, scaleY, 1); // Don't scale up, only down

                setScale(initialScale);
                setRotation(0);
                setImagePosition({ x: 0, y: 0 });

                // Set crop area to center with reasonable size
                const cropWidth = Math.min(300, containerWidth * 0.5);
                const cropHeight = Math.min(150, containerHeight * 0.4);
                const centerX = (containerWidth - cropWidth) / 2;
                const centerY = (containerHeight - cropHeight) / 2;

                setCrop({
                    x: centerX,
                    y: centerY,
                    width: cropWidth,
                    height: cropHeight
                });
            };
            img.src = imageUrl;
        }
    }, [open, imageUrl]);

    useEffect(() => {
        if (image && canvasRef.current) {
            drawCanvas();
        }
    }, [image, crop, scale, rotation, imagePosition]);

    const getResizeHandle = (mouseX, mouseY) => {
        const canvas = canvasRef.current;
        if (!canvas) return null;

        const rect = canvas.getBoundingClientRect();
        const x = mouseX - rect.left;
        const y = mouseY - rect.top;

        const handleSize = 10;
        const { x: cropX, y: cropY, width, height } = crop;

        // Check corners
        if (Math.abs(x - cropX) < handleSize && Math.abs(y - cropY) < handleSize) return 'nw';
        if (Math.abs(x - (cropX + width)) < handleSize && Math.abs(y - cropY) < handleSize) return 'ne';
        if (Math.abs(x - cropX) < handleSize && Math.abs(y - (cropY + height)) < handleSize) return 'sw';
        if (Math.abs(x - (cropX + width)) < handleSize && Math.abs(y - (cropY + height)) < handleSize) return 'se';

        // Check edges
        if (Math.abs(x - cropX) < handleSize && y > cropY && y < cropY + height) return 'w';
        if (Math.abs(x - (cropX + width)) < handleSize && y > cropY && y < cropY + height) return 'e';
        if (Math.abs(y - cropY) < handleSize && x > cropX && x < cropX + width) return 'n';
        if (Math.abs(y - (cropY + height)) < handleSize && x > cropX && x < cropX + width) return 's';

        return null;
    };

    const isInsideCropArea = (mouseX, mouseY) => {
        const canvas = canvasRef.current;
        if (!canvas) return false;

        const rect = canvas.getBoundingClientRect();
        const x = mouseX - rect.left;
        const y = mouseY - rect.top;

        const { x: cropX, y: cropY, width, height } = crop;
        return x > cropX && x < cropX + width && y > cropY && y < cropY + height;
    };

    const getCursorStyle = () => {
        if (isDraggingImage) return 'grabbing';
        if (isDraggingCrop) return 'move';
        if (isResizing) {
            const cursors = {
                'nw': 'nw-resize',
                'ne': 'ne-resize',
                'sw': 'sw-resize',
                'se': 'se-resize',
                'n': 'n-resize',
                's': 's-resize',
                'e': 'e-resize',
                'w': 'w-resize'
            };
            return cursors[resizeHandle] || 'default';
        }
        return 'grab';
    };

    const drawCanvas = () => {
        const canvas = canvasRef.current;
        if (!canvas || !image) return;

        const ctx = canvas.getContext('2d');
        const containerWidth = containerRef.current?.clientWidth || 600;
        const containerHeight = 400;

        canvas.width = containerWidth;
        canvas.height = containerHeight;

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Save context state
        ctx.save();

        // Center the image in the canvas
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;

        // Apply transformations
        ctx.translate(centerX + imagePosition.x, centerY + imagePosition.y);
        ctx.rotate((rotation * Math.PI) / 180);
        ctx.scale(scale, scale);

        // Draw image centered
        ctx.drawImage(image, -image.width / 2, -image.height / 2, image.width, image.height);

        // Restore context
        ctx.restore();

        // Draw semi-transparent overlay on everything EXCEPT the crop area
        const { x: cropX, y: cropY, width, height } = crop;

        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';

        // Top rectangle
        ctx.fillRect(0, 0, canvas.width, cropY);

        // Bottom rectangle
        ctx.fillRect(0, cropY + height, canvas.width, canvas.height - cropY - height);

        // Left rectangle
        ctx.fillRect(0, cropY, cropX, height);

        // Right rectangle
        ctx.fillRect(cropX + width, cropY, canvas.width - cropX - width, height);

        // Draw crop border
        ctx.strokeStyle = '#1976d2';
        ctx.lineWidth = 2;
        ctx.strokeRect(cropX, cropY, width, height);

        // Draw grid lines (rule of thirds)
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.lineWidth = 1;
        for (let i = 1; i < 3; i++) {
            // Vertical lines
            ctx.beginPath();
            ctx.moveTo(cropX + (width / 3) * i, cropY);
            ctx.lineTo(cropX + (width / 3) * i, cropY + height);
            ctx.stroke();

            // Horizontal lines
            ctx.beginPath();
            ctx.moveTo(cropX, cropY + (height / 3) * i);
            ctx.lineTo(cropX + width, cropY + (height / 3) * i);
            ctx.stroke();
        }

        // Draw resize handles
        const handleSize = 8;
        const handles = [
            { x: cropX, y: cropY }, // nw
            { x: cropX + width, y: cropY }, // ne
            { x: cropX, y: cropY + height }, // sw
            { x: cropX + width, y: cropY + height }, // se
            { x: cropX + width / 2, y: cropY }, // n
            { x: cropX + width / 2, y: cropY + height }, // s
            { x: cropX, y: cropY + height / 2 }, // w
            { x: cropX + width, y: cropY + height / 2 }, // e
        ];

        ctx.fillStyle = '#1976d2';
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        handles.forEach(handle => {
            ctx.fillRect(handle.x - handleSize / 2, handle.y - handleSize / 2, handleSize, handleSize);
            ctx.strokeRect(handle.x - handleSize / 2, handle.y - handleSize / 2, handleSize, handleSize);
        });
    };

    const handleMouseDown = (e) => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const rect = canvas.getBoundingClientRect();
        const mouseX = e.clientX;
        const mouseY = e.clientY;
        const canvasX = mouseX - rect.left;
        const canvasY = mouseY - rect.top;

        // Check if clicking on a resize handle
        const handle = getResizeHandle(mouseX, mouseY);
        if (handle) {
            setIsResizing(true);
            setResizeHandle(handle);
            setCropDragStart({ x: canvasX, y: canvasY });
            return;
        }

        // Check if clicking inside crop area
        if (isInsideCropArea(mouseX, mouseY)) {
            setIsDraggingCrop(true);
            setCropDragStart({
                x: canvasX - crop.x,
                y: canvasY - crop.y
            });
            return;
        }

        // Otherwise, drag the image
        setIsDraggingImage(true);
        setDragStart({
            x: e.clientX - imagePosition.x,
            y: e.clientY - imagePosition.y
        });
    };

    const handleMouseMove = (e) => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const rect = canvas.getBoundingClientRect();
        const canvasX = e.clientX - rect.left;
        const canvasY = e.clientY - rect.top;

        if (isDraggingImage) {
            setImagePosition({
                x: e.clientX - dragStart.x,
                y: e.clientY - dragStart.y
            });
        } else if (isDraggingCrop) {
            const newX = Math.max(0, Math.min(canvas.width - crop.width, canvasX - cropDragStart.x));
            const newY = Math.max(0, Math.min(canvas.height - crop.height, canvasY - cropDragStart.y));
            setCrop(prev => ({
                ...prev,
                x: newX,
                y: newY
            }));
        } else if (isResizing && resizeHandle) {
            const dx = canvasX - cropDragStart.x;
            const dy = canvasY - cropDragStart.y;

            setCrop(prev => {
                let newCrop = { ...prev };
                const minSize = 50;

                switch (resizeHandle) {
                    case 'se': // Southeast (bottom-right)
                        newCrop.width = Math.max(minSize, prev.width + dx);
                        newCrop.height = Math.max(minSize, prev.height + dy);
                        break;
                    case 'sw': // Southwest (bottom-left)
                        newCrop.width = Math.max(minSize, prev.width - dx);
                        newCrop.height = Math.max(minSize, prev.height + dy);
                        newCrop.x = prev.x + (prev.width - newCrop.width);
                        break;
                    case 'ne': // Northeast (top-right)
                        newCrop.width = Math.max(minSize, prev.width + dx);
                        newCrop.height = Math.max(minSize, prev.height - dy);
                        newCrop.y = prev.y + (prev.height - newCrop.height);
                        break;
                    case 'nw': // Northwest (top-left)
                        newCrop.width = Math.max(minSize, prev.width - dx);
                        newCrop.height = Math.max(minSize, prev.height - dy);
                        newCrop.x = prev.x + (prev.width - newCrop.width);
                        newCrop.y = prev.y + (prev.height - newCrop.height);
                        break;
                    case 'e': // East (right)
                        newCrop.width = Math.max(minSize, prev.width + dx);
                        break;
                    case 'w': // West (left)
                        newCrop.width = Math.max(minSize, prev.width - dx);
                        newCrop.x = prev.x + (prev.width - newCrop.width);
                        break;
                    case 's': // South (bottom)
                        newCrop.height = Math.max(minSize, prev.height + dy);
                        break;
                    case 'n': // North (top)
                        newCrop.height = Math.max(minSize, prev.height - dy);
                        newCrop.y = prev.y + (prev.height - newCrop.height);
                        break;
                }

                // Ensure crop stays within canvas bounds
                newCrop.x = Math.max(0, Math.min(canvas.width - newCrop.width, newCrop.x));
                newCrop.y = Math.max(0, Math.min(canvas.height - newCrop.height, newCrop.y));
                newCrop.width = Math.min(canvas.width - newCrop.x, newCrop.width);
                newCrop.height = Math.min(canvas.height - newCrop.y, newCrop.height);

                return newCrop;
            });

            setCropDragStart({ x: canvasX, y: canvasY });
        }
    };

    const handleMouseUp = () => {
        setIsDraggingImage(false);
        setIsDraggingCrop(false);
        setIsResizing(false);
        setResizeHandle(null);
    };

    // Touch event handlers
    const handleTouchStart = (e) => {
        if (e.touches.length === 1) {
            const touch = e.touches[0];
            handleMouseDown({ clientX: touch.clientX, clientY: touch.clientY });
            e.preventDefault();
        }
    };

    const handleTouchMove = (e) => {
        if (e.touches.length === 1) {
            const touch = e.touches[0];
            handleMouseMove({ clientX: touch.clientX, clientY: touch.clientY });
            e.preventDefault();
        }
    };

    const handleTouchEnd = () => {
        handleMouseUp();
    };

    const handleRotateLeft = () => {
        setRotation((prev) => (prev - 90) % 360);
    };

    const handleRotateRight = () => {
        setRotation((prev) => (prev + 90) % 360);
    };

    const handleZoomIn = () => {
        setScale((prev) => Math.min(prev + 0.1, 3));
    };

    const handleZoomOut = () => {
        setScale((prev) => Math.max(prev - 0.1, 0.5));
    };

    const handleResetView = () => {
        if (!image) return;

        const containerWidth = containerRef.current?.clientWidth || 600;
        const containerHeight = 400;

        // Calculate scale to fit image with some padding
        const scaleX = (containerWidth * 0.8) / image.width;
        const scaleY = (containerHeight * 0.8) / image.height;
        const initialScale = Math.min(scaleX, scaleY, 1);

        setScale(initialScale);
        setRotation(0);
        setImagePosition({ x: 0, y: 0 });
    };

    const handleCrop = () => {
        if (!image) return;

        // Create a temporary canvas for the final cropped image
        const tempCanvas = document.createElement('canvas');
        const tempCtx = tempCanvas.getContext('2d');

        // Get the actual crop dimensions
        const { x: cropX, y: cropY, width: cropWidth, height: cropHeight } = crop;

        // Set canvas size to crop dimensions
        tempCanvas.width = cropWidth;
        tempCanvas.height = cropHeight;

        // Create an intermediate canvas for the transformed image
        const transformCanvas = document.createElement('canvas');
        const transformCtx = transformCanvas.getContext('2d');

        // Get main canvas dimensions
        const canvas = canvasRef.current;
        const canvasCenterX = canvas.width / 2;
        const canvasCenterY = canvas.height / 2;

        // Calculate transformed image dimensions
        const isRotated90 = Math.abs(rotation % 180) === 90;
        const transformWidth = isRotated90 ? image.height * scale : image.width * scale;
        const transformHeight = isRotated90 ? image.width * scale : image.height * scale;

        transformCanvas.width = transformWidth;
        transformCanvas.height = transformHeight;

        // Apply transformations to the intermediate canvas
        transformCtx.save();
        transformCtx.translate(transformWidth / 2, transformHeight / 2);
        transformCtx.rotate((rotation * Math.PI) / 180);
        transformCtx.scale(scale, scale);
        transformCtx.drawImage(image, -image.width / 2, -image.height / 2);
        transformCtx.restore();

        // Calculate where the transformed image is positioned on the canvas
        const transformedImageX = canvasCenterX + imagePosition.x - transformWidth / 2;
        const transformedImageY = canvasCenterY + imagePosition.y - transformHeight / 2;

        // Calculate the source position on the transformed canvas
        const sourceX = cropX - transformedImageX;
        const sourceY = cropY - transformedImageY;

        // Draw the cropped portion
        tempCtx.drawImage(
            transformCanvas,
            sourceX,
            sourceY,
            cropWidth,
            cropHeight,
            0,
            0,
            cropWidth,
            cropHeight
        );

        // Convert to blob and call callback
        tempCanvas.toBlob((blob) => {
            const file = new File([blob], 'cropped-signature.png', { type: 'image/png' });
            const url = URL.createObjectURL(blob);
            onCropComplete({ file, url });
            handleClose();
        }, 'image/png');
    };

    const handleClose = () => {
        setImage(null);
        const containerWidth = containerRef.current?.clientWidth || 600;
        const containerHeight = 400;
        const cropWidth = Math.min(300, containerWidth * 0.5);
        const cropHeight = Math.min(150, containerHeight * 0.4);
        const centerX = (containerWidth - cropWidth) / 2;
        const centerY = (containerHeight - cropHeight) / 2;

        setCrop({ x: centerX, y: centerY, width: cropWidth, height: cropHeight });
        setScale(1);
        setRotation(0);
        setImagePosition({ x: 0, y: 0 });
        setIsDraggingImage(false);
        setIsDraggingCrop(false);
        setIsResizing(false);
        setResizeHandle(null);
        onClose();
    };

    return (
        <Dialog
            open={open}
            onClose={handleClose}
            maxWidth="md"
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
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CropIcon color="primary" />
                    <Typography variant="h6" component="div" sx={{ fontWeight: 600 }}>
                        {t('cropImage') || 'Recortar Imagen'}
                    </Typography>
                </Box>
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
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {/* Canvas */}
                    <Box
                        ref={containerRef}
                        sx={{
                            width: '100%',
                            height: 400,
                            bgcolor: '#f5f5f5',
                            borderRadius: 1,
                            overflow: 'hidden',
                            cursor: getCursorStyle(),
                            position: 'relative',
                            userSelect: 'none',
                            touchAction: 'none'
                        }}
                        onMouseDown={handleMouseDown}
                        onMouseMove={handleMouseMove}
                        onMouseUp={handleMouseUp}
                        onMouseLeave={handleMouseUp}
                        onTouchStart={handleTouchStart}
                        onTouchMove={handleTouchMove}
                        onTouchEnd={handleTouchEnd}
                    >
                        <canvas
                            ref={canvasRef}
                            style={{
                                display: 'block',
                                width: '100%',
                                height: '100%'
                            }}
                        />
                    </Box>

                    {/* Controls */}
                    {/*<Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>*/}
                    {/*    */}{/* Rotation Controls */}
                    {/*    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>*/}
                    {/*        <Typography variant="body2" sx={{ minWidth: 100 }}>*/}
                    {/*            {t('rotation') || 'Rotación'}:*/}
                    {/*        </Typography>*/}
                    {/*        <IconButton onClick={handleRotateLeft} size="small">*/}
                    {/*            <RotateLeftIcon />*/}
                    {/*        </IconButton>*/}
                    {/*        <Typography variant="body2" sx={{ minWidth: 50, textAlign: 'center' }}>*/}
                    {/*            {rotation}°*/}
                    {/*        </Typography>*/}
                    {/*        <IconButton onClick={handleRotateRight} size="small">*/}
                    {/*            <RotateRightIcon />*/}
                    {/*        </IconButton>*/}
                    {/*    </Box>*/}

                    {/*    */}{/* Zoom Controls */}
                    {/*    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>*/}
                    {/*        <Typography variant="body2" sx={{ minWidth: 100 }}>*/}
                    {/*            {t('zoom') || 'Zoom'}:*/}
                    {/*        </Typography>*/}
                    {/*        <IconButton onClick={handleZoomOut} size="small" disabled={scale <= 0.5}>*/}
                    {/*            <ZoomOutIcon />*/}
                    {/*        </IconButton>*/}
                    {/*        <Slider*/}
                    {/*            value={scale}*/}
                    {/*            onChange={(e, value) => setScale(value)}*/}
                    {/*            min={0.5}*/}
                    {/*            max={3}*/}
                    {/*            step={0.1}*/}
                    {/*            sx={{ flex: 1 }}*/}
                    {/*        />*/}
                    {/*        <IconButton onClick={handleZoomIn} size="small" disabled={scale >= 3}>*/}
                    {/*            <ZoomInIcon />*/}
                    {/*        </IconButton>*/}
                    {/*        <Typography variant="body2" sx={{ minWidth: 50, textAlign: 'center' }}>*/}
                    {/*            {Math.round(scale * 100)}%*/}
                    {/*        </Typography>*/}
                    {/*    </Box>*/}

                    {/*    */}{/* Crop Size Display */}
                    {/*    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, justifyContent: 'center' }}>*/}
                    {/*        <Typography variant="body2" color="text.secondary">*/}
                    {/*            {t('cropSize') || 'Tamaño del recorte'}: {Math.round(crop.width)} × {Math.round(crop.height)} px*/}
                    {/*        </Typography>*/}
                    {/*        <Button */}
                    {/*            size="small" */}
                    {/*            variant="outlined" */}
                    {/*            startIcon={<CenterFocusStrongIcon />}*/}
                    {/*            onClick={handleResetView}*/}
                    {/*            sx={{ ml: 2 }}*/}
                    {/*        >*/}
                    {/*            {t('resetView') || 'Ajustar'}*/}
                    {/*        </Button>*/}
                    {/*    </Box>*/}
                    {/*</Box>*/}

                    <Typography variant="caption" color="text.secondary" sx={{ textAlign: 'center' }}>
                        {t('cropInstructionsDynamic') || 'Arrastra la imagen de fondo para posicionarla. Arrastra el área de recorte para moverla. Usa las esquinas y bordes para redimensionar.'}
                    </Typography>
                </Box>
            </DialogContent>

            <DialogActions sx={{ px: 3, py: 2 }}>
                <Button
                    onClick={handleClose}
                    variant="outlined"
                >
                    {t('cancel') || 'Cancelar'}
                </Button>
                <Button
                    onClick={handleCrop}
                    variant="contained"
                    startIcon={<CropIcon />}
                    disabled={!image}
                >
                    {t('crop') || 'Recortar'}
                </Button>
            </DialogActions>
        </Dialog>
    );
}

export default ImageCropModal;
