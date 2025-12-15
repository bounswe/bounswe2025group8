import React from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    IconButton,
    Box,
    Typography,
    CircularProgress
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import UserCard from './UserCard';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../hooks/useTheme';
import { useNavigate } from 'react-router-dom';

const UserListModal = ({ open, onClose, title, users, loading }) => {
    const { t } = useTranslation();
    const { colors } = useTheme();
    const navigate = useNavigate();

    const handleUserClick = (user) => {
        onClose(); // Close modal first
        navigate(`/profile/${user.id}`);
    };

    return (
        <Dialog
            open={open}
            onClose={onClose}
            fullWidth
            maxWidth="sm"
            PaperProps={{
                sx: {
                    backgroundColor: colors.background.secondary,
                    borderRadius: 2,
                },
            }}
        >
            <DialogTitle
                sx={{
                    m: 0,
                    p: 2,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    color: colors.text.primary,
                }}
            >
                <Typography variant="h6" component="div" fontWeight="bold">
                    {title}
                </Typography>
                <IconButton
                    aria-label="close"
                    onClick={onClose}
                    sx={{
                        color: colors.text.secondary,
                    }}
                >
                    <CloseIcon />
                </IconButton>
            </DialogTitle>
            <DialogContent dividers sx={{ borderColor: colors.border.primary }}>
                {loading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                        <CircularProgress sx={{ color: colors.brand.primary }} />
                    </Box>
                ) : users && users.length > 0 ? (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        {users.map((user) => (
                            <UserCard
                                key={user.id}
                                user={user}
                                onClick={handleUserClick}
                            />
                        ))}
                    </Box>
                ) : (
                    <Box sx={{ py: 4, textAlign: 'center', color: colors.text.secondary }}>
                        <Typography>
                            {t('common.noResults') !== 'common.noResults' ? t('common.noResults') : 'No users found'}
                        </Typography>
                    </Box>
                )}
            </DialogContent>
        </Dialog>
    );
};

export default UserListModal;
