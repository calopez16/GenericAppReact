import React from 'react';
import ConfirmationModal from '../Views/Layout/ConfirmationModal';

const ConfirmationDialog = ({
    open,
    title,
    message,
    confirmText,
    cancelText,
    onConfirm,
    onCancel,
    severity = 'info'
}) => {
    const typeMap = {
        warning: 'warning',
        error: 'danger',
        info: 'info',
        success: 'success'
    };

    return (
        <ConfirmationModal
            open={open}
            onClose={onCancel}
            onConfirm={onConfirm}
            title={title}
            message={message}
            confirmText={confirmText}
            cancelText={cancelText}
            type={typeMap[severity] || 'info'}
        />
    );
};

export default ConfirmationDialog;
