import React, { useState, useEffect, useRef } from 'react';
import {
    Box,
    Typography,
    TextField,
    Button,
    TablePagination,
    useMediaQuery,
    useTheme,
    LinearProgress,
    Paper,
    Avatar,
    IconButton,
    ClickAwayListener,
    Tooltip
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import PeopleIcon from '@mui/icons-material/People';
import CloseIcon from '@mui/icons-material/Close';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import { DataAPIUsersService } from '@data/Users/Data';
import { useTranslation } from 'react-i18next';
import { ShowMessage } from '@helpers/NotificationService';
import ConfirmationResetPasswordModal from '@views/Layout/ConfirmationModal';
import PasswordModal from './PasswordModal';
import UserFormModal from './UserFormModal';
import UserCardList from './UserCardList';
import UserListTable from './UserTableList';

function Index() {
    const { t } = useTranslation();
    const userDataService = DataAPIUsersService();
    const [users, setUsers] = useState([]);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(5);
    const [totalUsers, setTotalUsers] = useState(0);

    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(searchTerm);
    const [isSearchExpanded, setIsSearchExpanded] = useState(false);
    const searchInputRef = useRef(null);

    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [isConfirmResetPasswordModalOpen, setIsConfirmResetPasswordModalOpen] = useState(false);
    const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
    const [assignedPassword, setAssignedPassword] = useState('');

    const theme = useTheme();
    const isSmallScreen = useMediaQuery(theme.breakpoints.down('md'));

    useEffect(() => {
        const timerId = setTimeout(() => {
            setDebouncedSearchTerm(searchTerm);
        }, 500);
        return () => clearTimeout(timerId);
    }, [searchTerm]);

    useEffect(() => {
        const loadUsers = async () => {
            try {
                setLoading(true);
                const response = await userDataService.getUsersPagination(page + 1, rowsPerPage, debouncedSearchTerm);
                setUsers(response.data.users);
                setTotalUsers(response.data.totalCount);
            } catch (error) {
                console.error("Error loading users:", error);
            } finally {
                setLoading(false);
            }
        };
        loadUsers();
    }, [page, rowsPerPage, debouncedSearchTerm]);

    const handlePageChange = (event, newPage) => setPage(newPage);
    const handleRowsPerPageChange = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const handleSearchChange = (event) => {
        setSearchTerm(event.target.value);
        setPage(0);
    };

    const toggleSearch = () => {
        if (!isSearchExpanded) {
            setIsSearchExpanded(true);
            setTimeout(() => searchInputRef.current?.focus(), 100);
        } else if (searchTerm !== '') {
            setSearchTerm('');
        } else {
            setIsSearchExpanded(false);
        }
    };

    const handleCloseSearch = () => {
        if (searchTerm === '') {
            setIsSearchExpanded(false);
        }
    };

    const handleToggleUserStatus = async (user) => {
        try {
            const isEnabled = !user.isDisabled;
            let dataResult = isEnabled
                ? await userDataService.disableUser(user.userName)
                : await userDataService.enableUser(user.userName);

            if (dataResult.success) {
                ShowMessage(t(isEnabled ? 'recordDisabled' : 'recordEnabled'), 'success');
                setUsers(prev => prev.map(u => u.userName === user.userName ? { ...u, isDisabled: !u.isDisabled } : u));
            }
        } catch (error) {
            ShowMessage(t('error'), 'error');
        }
    };

    const handleResetPassword = async (user) => {
        try {
            setIsConfirmResetPasswordModalOpen(false);
            const response = await userDataService.resetPassword(user.userName);
            if (response.success) {
                setAssignedPassword(response.data.newPassword);
                setIsPasswordModalOpen(true);
                ShowMessage(t('passwordChanged'), 'success');
            }
        } catch (error) {
            ShowMessage(t('error'), 'error');
        }
    };

    const handleOpenAddUser = () => { setSelectedUser(null); setIsEditing(false); setIsModalOpen(true); };
    const handleOpenEditUser = (user) => { setSelectedUser(user); setIsEditing(true); setIsModalOpen(true); };
    const handleCloseModal = () => setIsModalOpen(false);

    const commonListProps = { users, loading, t, handleOpenEditUser, handleToggleUserStatus, setIsConfirmResetPasswordModalOpen, setSelectedUser, isSearch: searchTerm !== '' };

    return (
        <Box>
            <Paper
                elevation={0}
                sx={{
                    p: 2,
                    mb: isSmallScreen && isSearchExpanded ? 10 : 2,
                    borderRadius: 2,
                    border: '1px solid',
                    borderColor: 'divider',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: 2,
                    position: 'relative',
                    transition: 'margin 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                }}
            >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar sx={{ bgcolor: 'primary.light', color: 'white', width: 45, height: 45, borderRadius: 2 }}><PeopleIcon /></Avatar>
                    <Box>
                        <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1.2 }}>{t('users')}</Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ display: { xs: 'none', sm: 'block' } }}>
                            {t('manage_users_description')}
                        </Typography>
                    </Box>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <ClickAwayListener onClickAway={handleCloseSearch}>
                        <Box sx={{
                            display: 'flex',
                            flexDirection: 'row-reverse',
                            alignItems: 'center',
                            bgcolor: isSearchExpanded ? 'action.hover' : 'transparent',
                            borderRadius: isSmallScreen && isSearchExpanded ? 2 : 10,
                            px: isSearchExpanded ? 1 : 0,

                            // Lógica Unificada de Posicionamiento
                            position: isSmallScreen && isSearchExpanded ? 'absolute' : 'relative',
                            top: isSmallScreen && isSearchExpanded ? '110%' : 'auto',
                            left: isSmallScreen && isSearchExpanded ? 0 : 'auto',
                            right: isSmallScreen && isSearchExpanded ? 0 : 'auto',
                            zIndex: 10,
                            boxShadow: isSmallScreen && isSearchExpanded ? theme.shadows[4] : 'none',

                            width: isSearchExpanded
                                ? (isSmallScreen ? '100%' : '300px')
                                : '42px',
                            height: '42px',
                            transition: !isSmallScreen ? 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)' : '',
                            border: '1px solid',
                            borderColor: isSearchExpanded ? 'primary.main' : 'transparent',
                            overflow: 'hidden'
                        }}>
                            <Tooltip title={isSearchExpanded && searchTerm === '' ? t('closeSearch') : t('search') }>
                                <IconButton
                                    onClick={toggleSearch}
                                    size="small"
                                    sx={{
                                        color: isSearchExpanded ? 'primary.main' : 'text.secondary',
                                        flexShrink: 0,
                                        width: '42px',
                                        height: '42px'
                                    }}
                                >
                                    {isSearchExpanded && searchTerm !== '' ? <CloseIcon /> : <SearchIcon />}
                                </IconButton>
                            </Tooltip>
                            <TextField
                                inputRef={searchInputRef}
                                placeholder={t('search')}
                                variant="standard"
                                fullWidth
                                value={searchTerm}
                                onChange={handleSearchChange}
                                InputProps={{
                                    disableUnderline: true,
                                    sx: {
                                        ml: 1,
                                        fontSize: '0.9rem',
                                        visibility: isSearchExpanded ? 'visible' : 'hidden',
                                        opacity: isSearchExpanded ? 1 : 0,
                                        transition: 'opacity 0.2s ease-in-out'
                                    }
                                }}
                            />
                        </Box>
                    </ClickAwayListener>

                    <Button
                        variant="contained"
                        disableElevation
                        endIcon={<PersonAddIcon />}
                        onClick={handleOpenAddUser}
                        sx={{
                            whiteSpace: 'nowrap',
                            ml: 1
                        }}
                    >
                        {t('add')}
                    </Button>
                </Box>
            </Paper>

            {loading && <LinearProgress sx={{ mb: 2, borderRadius: 1 }} />}

            {isSmallScreen ? <UserCardList {...commonListProps} /> : <UserListTable {...commonListProps} />}

            <TablePagination
                rowsPerPageOptions={[5, 10, 25]}
                component="div"
                count={totalUsers}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handlePageChange}
                onRowsPerPageChange={handleRowsPerPageChange}
                labelRowsPerPage={t('rows_perPage')}
                labelDisplayedRows={({ from, to, count }) => `${from}-${to} ${t('of')} ${count !== -1 ? count : `${t('moreThan')} ${to}`}`}
            />

            <UserFormModal open={isModalOpen} handleClose={handleCloseModal} data={selectedUser} isEditing={isEditing} setData={setUsers} />
            <PasswordModal open={isPasswordModalOpen} onClose={() => setIsPasswordModalOpen(false)} password={assignedPassword} />
            <ConfirmationResetPasswordModal open={isConfirmResetPasswordModalOpen} type="danger" onClose={() => setIsConfirmResetPasswordModalOpen(false)} onConfirm={() => handleResetPassword(selectedUser)} title={t("resetPassword")} message={t("question_areYouSureResetPassword")} />
        </Box>
    );
}

export default Index;