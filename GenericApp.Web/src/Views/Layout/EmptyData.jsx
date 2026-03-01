import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import SearchOffIcon from '@mui/icons-material/SearchOff';
import InboxIcon from '@mui/icons-material/Inbox';
import AddIcon from '@mui/icons-material/Add';

const EmptyState = ({
    isSearch = false,
    onAction,
    title,
    description,
    actionLabel
}) => {
    return (
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                p: 6,
                textAlign: 'center',
                minHeight: 300,
                borderRadius: 4,
                bgcolor: 'background.paper',
                borderColor: 'divider',
            }}
        >
            <Box
                sx={{
                    mb: 2,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 80,
                    height: 80,
                    borderRadius: '50%',
                    bgcolor: isSearch ? 'action.hover' : 'primary.lighter',
                    color: isSearch ? 'text.secondary' : 'primary.main',
                }}
            >
                {isSearch ? (
                    <SearchOffIcon sx={{ fontSize: 40 }} />
                ) : (
                    <InboxIcon sx={{ fontSize: 40 }} />
                )}
            </Box>

            <Typography variant="h6" sx={{ fontWeight: 600, mb: 1, color: 'text.primary' }}>
                {title}
            </Typography>

            <Typography variant="body2" sx={{ color: 'text.secondary', maxWidth: 300, mb: 3 }}>
                {description}
            </Typography>

            {onAction && (
                <Button
                    variant="outlined"
                    startIcon={<AddIcon />}
                    onClick={onAction}
                    sx={{ textTransform: 'none', borderRadius: 2 }}
                >
                    {actionLabel}
                </Button>
            )}
        </Box>
    );
};

export default EmptyState;