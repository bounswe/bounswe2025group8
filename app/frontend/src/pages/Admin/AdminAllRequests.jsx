import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useSearchParams } from 'react-router-dom';
import useAuth from '../../features/authentication/hooks/useAuth';
import { useTheme } from '../../hooks/useTheme';
import {
  Container,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Box,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  TextField,
  Alert,
  CircularProgress,
  Pagination,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import {
  fetchAllAdminRequests,
  deleteTaskThunk,
  clearError,
  clearSuccess,
} from '../../features/admin/store/adminSlice';

const AdminAllRequests = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { userRole } = useAuth();
  const { colors } = useTheme();

  const {
    allRequests,
    pagination,
    loading,
    actionLoading,
    error,
    successMessage,
  } = useSelector((state) => state.admin);

  const currentPage = parseInt(searchParams.get('page') || '1', 10);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [deleteReason, setDeleteReason] = useState('');

  // Check admin access
  useEffect(() => {
    if (userRole !== 'admin') {
      navigate('/');
    }
  }, [userRole, navigate]);

  // Fetch requests
  useEffect(() => {
    dispatch(fetchAllAdminRequests({ page: currentPage }));
  }, [dispatch, currentPage]);

  // Clear messages after 3 seconds
  useEffect(() => {
    if (error || successMessage) {
      const timer = setTimeout(() => {
        dispatch(clearError());
        dispatch(clearSuccess());
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [error, successMessage, dispatch]);

  const handlePageChange = (event, value) => {
    setSearchParams({ page: value.toString() });
  };

  const handleDeleteClick = (task) => {
    setSelectedTask(task);
    setDeleteReason('');
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (selectedTask) {
      dispatch(deleteTaskThunk({ taskId: selectedTask.id, reason: deleteReason }));
      setDeleteDialogOpen(false);
      setSelectedTask(null);
      setDeleteReason('');
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setSelectedTask(null);
    setDeleteReason('');
  };

  const getStatusColor = (status) => {
    const statusColors = {
      POSTED: 'primary',
      IN_PROGRESS: 'warning',
      COMPLETED: 'success',
      CANCELLED: 'error',
      EXPIRED: 'default',
    };
    return statusColors[status] || 'default';
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (userRole !== 'admin') {
    return null;
  }

  return (
    <Box sx={{ backgroundColor: colors.background.primary, minHeight: '100vh', py: 4 }}>
      <Container maxWidth="lg">
        {/* Header */}
        <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ color: colors.text.primary, marginBottom: '8px' }}>All Requests</h1>
            <p style={{ color: colors.text.secondary, fontSize: '14px' }}>
              Total requests: {pagination.totalItems}
            </p>
          </div>
          <Button
            variant="outlined"
            onClick={() => navigate('/admin')}
            sx={{ color: colors.brand.primary, borderColor: colors.brand.primary }}
          >
            Back to Dashboard
          </Button>
        </Box>

        {/* Alerts */}
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {typeof error === 'string' ? error : 'An error occurred'}
          </Alert>
        )}
        {successMessage && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {successMessage}
          </Alert>
        )}

        {/* Loading State */}
        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        )}

        {/* Table */}
        {!loading && (
          <TableContainer
            component={Paper}
            sx={{
              backgroundColor: colors.background.elevated,
              color: colors.text.primary,
              '& .MuiTable-root': {
                backgroundColor: colors.background.elevated,
              },
              '& .MuiTableCell-root': {
                backgroundColor: colors.background.elevated,
                color: colors.text.primary,
              },
            }}
          >
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: colors.brand.primary }}>
                  <TableCell sx={{ color: colors.text.inverse, fontWeight: 'bold' }}>ID</TableCell>
                  <TableCell sx={{ color: colors.text.inverse, fontWeight: 'bold' }}>Title</TableCell>
                  <TableCell sx={{ color: colors.text.inverse, fontWeight: 'bold' }}>Creator</TableCell>
                  <TableCell sx={{ color: colors.text.inverse, fontWeight: 'bold' }}>Status</TableCell>
                  <TableCell sx={{ color: colors.text.inverse, fontWeight: 'bold' }}>Created</TableCell>
                  <TableCell sx={{ color: colors.text.inverse, fontWeight: 'bold' }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {allRequests.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ py: 3, color: colors.text.secondary }}>
                      No requests found
                    </TableCell>
                  </TableRow>
                ) : (
                  allRequests.map((task) => (
                    <TableRow
                      key={task.id}
                      hover
                      sx={{
                        '&:hover': { backgroundColor: colors.interactive.hover },
                        borderBottom: `1px solid ${colors.border.secondary}`,
                      }}
                    >
                      <TableCell sx={{ color: colors.text.primary }}>{task.id}</TableCell>
                      <TableCell sx={{ color: colors.text.primary, maxWidth: 200 }}>
                        <div style={{ whiteSpace: 'normal', wordBreak: 'break-word' }}>
                          {task.title}
                        </div>
                      </TableCell>
                      <TableCell sx={{ color: colors.text.primary }}>
                        {task.creator?.name} {task.creator?.surname}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={task.status_display || task.status}
                          color={getStatusColor(task.status)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell sx={{ color: colors.text.primary }}>
                        {formatDate(task.created_at)}
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <Button
                            size="small"
                            startIcon={<VisibilityIcon />}
                            onClick={() => navigate(`/requests/${task.id}`)}
                          >
                            View
                          </Button>
                          <Button
                            size="small"
                            color="error"
                            startIcon={<DeleteIcon />}
                            onClick={() => handleDeleteClick(task)}
                          >
                            Delete
                          </Button>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        {/* Pagination */}
        {!loading && pagination.totalPages > 1 && (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
            <Pagination
              count={pagination.totalPages}
              page={currentPage}
              onChange={handlePageChange}
              color="primary"
            />
          </Box>
        )}
      </Container>

      {/* Delete Dialog */}
      <Dialog open={deleteDialogOpen} onClose={handleDeleteCancel} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ color: colors.text.primary }}>Delete Request</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ color: colors.text.secondary, mb: 2 }}>
            Are you sure you want to delete this request? This action cannot be undone.
          </DialogContentText>
          {selectedTask && (
            <div style={{ marginBottom: '16px', color: colors.text.primary }}>
              <strong>{selectedTask.title}</strong>
            </div>
          )}
          <TextField
            fullWidth
            multiline
            rows={3}
            label="Reason for deletion (optional)"
            value={deleteReason}
            onChange={(e) => setDeleteReason(e.target.value)}
            placeholder="Explain why this request is being deleted..."
            sx={{
              '& .MuiOutlinedInput-root': {
                color: colors.text.primary,
              },
              '& .MuiInputBase-input::placeholder': {
                color: colors.text.secondary,
                opacity: 0.7,
              },
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel}>Cancel</Button>
          <Button
            onClick={handleDeleteConfirm}
            color="error"
            variant="contained"
            disabled={actionLoading}
          >
            {actionLoading ? <CircularProgress size={24} /> : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminAllRequests;
