import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
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
  Alert,
  CircularProgress,
  Pagination,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Chip,
} from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import BlockIcon from '@mui/icons-material/Block';
import { banUserThunk } from '../../features/admin/store/adminSlice';
import adminService from '../../features/admin/services/adminService';

const AdminReportedUsers = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { userRole } = useAuth();
  const { colors } = useTheme();

  const [reportedUsers, setReportedUsers] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    totalPages: 1,
    totalItems: 0,
    hasNextPage: false,
    hasPreviousPage: false,
  });
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [dismissDialogOpen, setDismissDialogOpen] = useState(false);
  const [banDialogOpen, setBanDialogOpen] = useState(false);
  const [reportsDialogOpen, setReportsDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedUserReports, setSelectedUserReports] = useState([]);
  const [banReason, setBanReason] = useState('');
  const [reportsLoading, setReportsLoading] = useState(false);

  // Check admin access
  useEffect(() => {
    if (userRole !== 'admin') {
      navigate('/');
    }
  }, [userRole, navigate]);

  // Fetch reported users
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await adminService.getReportedUsers(currentPage);
        setReportedUsers(response.users || []);
        setPagination(response.pagination || {});
      } catch (err) {
        console.error('Error fetching reported users:', err);
        setError(err.message || 'Failed to fetch reported users');
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [currentPage]);

  // Clear messages after 3 seconds
  useEffect(() => {
    if (error || successMessage) {
      const timer = setTimeout(() => {
        setError(null);
        setSuccessMessage(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [error, successMessage]);

  const handlePageChange = (event, value) => {
    setCurrentPage(value);
  };

  const handleViewClick = async (user) => {
    setSelectedUser(user);
    setReportsLoading(true);
    try {
      // Fetch user reports to show descriptions
      const response = await adminService.getUserReports(null, 1);
      // Filter reports for this specific user
      const userReports = response.reports.filter(
        (report) => report.reported_user?.id === user.user_id
      );
      setSelectedUserReports(userReports);
      setReportsDialogOpen(true);
    } catch (err) {
      setError('Failed to fetch reports');
    } finally {
      setReportsLoading(false);
    }
  };

  const handleDismissClick = (user) => {
    setSelectedUser(user);
    setDismissDialogOpen(true);
  };

  const handleDismissConfirm = async () => {
    if (selectedUser) {
      try {
        setActionLoading(true);
        setError(null);
        // Call dismiss endpoint - mark all reports against this user as dismissed
        await adminService.dismissUserReports(selectedUser.user_id);
        setSuccessMessage('Reports dismissed successfully');
        setDismissDialogOpen(false);
        setSelectedUser(null);
        // Refetch users
        setTimeout(() => {
          const fetchUsers = async () => {
            try {
              const response = await adminService.getReportedUsers(currentPage);
              setReportedUsers(response.users || []);
              setPagination(response.pagination || {});
            } catch (err) {
              setError(err.message || 'Failed to fetch users');
            }
          };
          fetchUsers();
        }, 500);
      } catch (err) {
        setError(err.message || 'Failed to dismiss reports');
      } finally {
        setActionLoading(false);
      }
    }
  };

  const handleBanClick = (user) => {
    setSelectedUser(user);
    setBanReason('');
    setBanDialogOpen(true);
  };

  const handleBanConfirm = async () => {
    if (selectedUser && selectedUser.user_id) {
      try {
        setActionLoading(true);
        setError(null);
        dispatch(
          banUserThunk({
            userId: selectedUser.user_id,
            reason: banReason,
          })
        );
        setSuccessMessage('User banned successfully');
        setBanDialogOpen(false);
        setSelectedUser(null);
        setBanReason('');
        // Refetch users
        setTimeout(() => {
          const fetchUsers = async () => {
            try {
              const response = await adminService.getReportedUsers(currentPage);
              setReportedUsers(response.users || []);
              setPagination(response.pagination || {});
            } catch (err) {
              setError(err.message || 'Failed to fetch users');
            }
          };
          fetchUsers();
        }, 500);
      } catch (err) {
        setError(err.message || 'Failed to ban user');
      } finally {
        setActionLoading(false);
      }
    }
  };

  const handleDialogCancel = () => {
    setDismissDialogOpen(false);
    setBanDialogOpen(false);
    setReportsDialogOpen(false);
    setSelectedUser(null);
    setBanReason('');
    setSelectedUserReports([]);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
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
            <h1 style={{ color: colors.text.primary, marginBottom: '8px' }}>Reported Users</h1>
            <p style={{ color: colors.text.secondary, fontSize: '14px' }}>
              Total reported users: {pagination.totalItems}
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
            {error}
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
                  <TableCell sx={{ color: colors.text.inverse, fontWeight: 'bold' }}>Username</TableCell>
                  <TableCell sx={{ color: colors.text.inverse, fontWeight: 'bold' }}>Email</TableCell>
                  <TableCell sx={{ color: colors.text.inverse, fontWeight: 'bold' }}>Report Count</TableCell>
                  <TableCell sx={{ color: colors.text.inverse, fontWeight: 'bold' }}>Last Report</TableCell>
                  <TableCell sx={{ color: colors.text.inverse, fontWeight: 'bold' }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {reportedUsers.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      align="center"
                      sx={{ py: 3, color: colors.text.secondary }}
                    >
                      No reported users found
                    </TableCell>
                  </TableRow>
                ) : (
                  reportedUsers.map((user) => (
                    <TableRow
                      key={user.user_id}
                      hover
                      sx={{
                        '&:hover': { backgroundColor: colors.interactive.hover },
                        borderBottom: `1px solid ${colors.border.secondary}`,
                      }}
                    >
                      <TableCell sx={{ color: colors.text.primary }}>{user.user_id}</TableCell>
                      <TableCell>
                        <Button
                          sx={{
                            color: colors.brand.primary,
                            textTransform: 'none',
                            padding: 0,
                            justifyContent: 'flex-start',
                            '&:hover': {
                              textDecoration: 'underline',
                            },
                          }}
                          onClick={() => navigate(`/profile/${user.user_id}`)}
                        >
                          {user.username}
                        </Button>
                      </TableCell>
                      <TableCell sx={{ color: colors.text.primary }}>{user.email}</TableCell>
                      <TableCell sx={{ color: colors.text.primary }}>{user.report_count || 0}</TableCell>
                      <TableCell sx={{ color: colors.text.primary }}>
                        {user.last_reported_at ? formatDate(user.last_reported_at) : 'N/A'}
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                          <Button
                            size="small"
                            startIcon={<VisibilityIcon />}
                            variant="outlined"
                            onClick={() => handleViewClick(user)}
                          >
                            View
                          </Button>
                          <Button
                            size="small"
                            color="warning"
                            variant="outlined"
                            onClick={() => handleDismissClick(user)}
                          >
                            Dismiss
                          </Button>
                          <Button
                            size="small"
                            color="error"
                            variant="outlined"
                            startIcon={<BlockIcon />}
                            onClick={() => handleBanClick(user)}
                          >
                            Ban
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

      {/* Dismiss Dialog */}
      <Dialog open={dismissDialogOpen} onClose={handleDialogCancel} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ color: colors.text.primary }}>Dismiss Reports</DialogTitle>
        <DialogContent>
          {selectedUser && (
            <Box sx={{ mb: 2 }}>
              <div style={{ marginBottom: '16px', color: colors.text.primary }}>
                <p>
                  <strong>User:</strong> {selectedUser.username}
                </p>
                <p>
                  <strong>Email:</strong> {selectedUser.email}
                </p>
                <p>
                  <strong>Reports:</strong> {selectedUser.report_count}
                </p>
                <p style={{ marginTop: '16px', fontStyle: 'italic', color: colors.text.secondary }}>
                  All reports against this user will be marked as dismissed.
                </p>
              </div>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogCancel}>Cancel</Button>
          <Button
            onClick={handleDismissConfirm}
            color="warning"
            variant="contained"
            disabled={actionLoading}
          >
            {actionLoading ? <CircularProgress size={24} /> : 'Dismiss Reports'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Ban Dialog */}
      <Dialog open={banDialogOpen} onClose={handleDialogCancel} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ color: colors.text.primary }}>Ban User</DialogTitle>
        <DialogContent>
          {selectedUser && (
            <Box sx={{ mb: 2 }}>
              <Alert severity="warning" sx={{ mb: 2 }}>
                You are about to ban {selectedUser.username}. This user will no longer be able to
                access their account.
              </Alert>
              <div style={{ marginBottom: '16px', color: colors.text.primary }}>
                <p>
                  <strong>User:</strong> {selectedUser.username}
                </p>
                <p>
                  <strong>Email:</strong> {selectedUser.email}
                </p>
              </div>
            </Box>
          )}

          <TextField
            fullWidth
            multiline
            rows={3}
            label="Ban Reason"
            value={banReason}
            onChange={(e) => setBanReason(e.target.value)}
            placeholder="Explain why this user is being banned..."
            required
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
          <Button onClick={handleDialogCancel}>Cancel</Button>
          <Button
            onClick={handleBanConfirm}
            color="error"
            variant="contained"
            disabled={actionLoading || !banReason.trim()}
          >
            {actionLoading ? <CircularProgress size={24} /> : 'Ban User'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Reports Dialog */}
      <Dialog open={reportsDialogOpen} onClose={handleDialogCancel} maxWidth="md" fullWidth>
        <DialogTitle sx={{ color: colors.text.primary }}>
          Reports Against {selectedUser?.username}
        </DialogTitle>
        <DialogContent sx={{ backgroundColor: colors.background.primary, py: 0, px: 0 }}>
          {reportsLoading && (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
              <CircularProgress />
            </Box>
          )}
          {!reportsLoading && selectedUserReports.length === 0 && (
            <Alert severity="info">No reports found for this user.</Alert>
          )}
          {!reportsLoading && selectedUserReports.length > 0 && (
            <Box sx={{ maxHeight: '400px', overflowY: 'auto', p: 2 }}>
              {selectedUserReports.map((report, index) => (
                <Paper
                  key={report.id}
                  sx={{
                    p: 2,
                    mb: 2,
                    backgroundColor: colors.background.secondary,
                    borderLeft: `4px solid ${colors.brand.primary}`,
                  }}
                >
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 1 }}>
                    <div>
                      <p style={{ color: colors.text.primary, margin: '0 0 8px 0', fontWeight: 'bold' }}>
                        Report #{report.id}
                      </p>
                      <Chip
                        label={report.status}
                        size="small"
                        color={
                          report.status === 'PENDING'
                            ? 'warning'
                            : report.status === 'UNDER_REVIEW'
                            ? 'info'
                            : report.status === 'RESOLVED'
                            ? 'success'
                            : 'error'
                        }
                      />
                    </div>
                    <p style={{ color: colors.text.secondary, fontSize: '12px', margin: 0 }}>
                      {formatDate(report.created_at)}
                    </p>
                  </Box>
                  <p style={{ color: colors.text.primary, margin: '8px 0', fontSize: '14px' }}>
                    <strong>Type:</strong> {report.report_type_display || report.report_type}
                  </p>
                  {report.description && (
                    <p style={{ color: colors.text.primary, margin: '8px 0', fontSize: '14px' }}>
                      <strong>Description:</strong> {report.description}
                    </p>
                  )}
                  <p style={{ color: colors.text.secondary, fontSize: '12px', margin: '8px 0' }}>
                    <strong>Reported by:</strong> {report.reporter}
                  </p>
                </Paper>
              ))}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogCancel}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminReportedUsers;
