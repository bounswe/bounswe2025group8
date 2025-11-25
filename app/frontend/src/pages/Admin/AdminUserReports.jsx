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
  DialogActions,
  TextField,
  Alert,
  CircularProgress,
  Pagination,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import BlockIcon from '@mui/icons-material/Block';
import {
  fetchUserReports,
  updateReportStatusThunk,
  banUserThunk,
  clearError,
  clearSuccess,
} from '../../features/admin/store/adminSlice';
import DeleteIcon from '@mui/icons-material/Delete';

const AdminUserReports = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { userRole } = useAuth();
  const { colors } = useTheme();

  const { userReports, pagination, loading, actionLoading, error, successMessage } = useSelector(
    (state) => state.admin
  );

  const currentPage = parseInt(searchParams.get('page') || '1', 10);
  const statusFilter = searchParams.get('status') || null;

  const [dismissDialogOpen, setDismissDialogOpen] = useState(false);
  const [banDialogOpen, setBanDialogOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const [banReason, setBanReason] = useState('');

  // Check admin access
  useEffect(() => {
    if (userRole !== 'admin') {
      navigate('/');
    }
  }, [userRole, navigate]);

  // Fetch reports
  useEffect(() => {
    dispatch(fetchUserReports({ status: statusFilter, page: currentPage }));
  }, [dispatch, currentPage, statusFilter]);

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
    setSearchParams({ page: value.toString(), ...(statusFilter && { status: statusFilter }) });
  };

  const handleStatusFilterChange = (status) => {
    setSearchParams({ page: '1', ...(status && { status }) });
  };

  const handleDismissClick = (report) => {
    setSelectedReport(report);
    setDismissDialogOpen(true);
  };

  const handleBanClick = (report) => {
    setSelectedReport(report);
    setBanReason('');
    setBanDialogOpen(true);
  };

  const handleDismissConfirm = () => {
    if (selectedReport) {
      dispatch(
        updateReportStatusThunk({
          reportType: 'user',
          reportId: selectedReport.id,
          status: 'DISMISSED',
          notes: 'Report dismissed by admin',
        })
      );
      setDismissDialogOpen(false);
      setSelectedReport(null);
      // Refetch reports after dismiss
      setTimeout(() => {
        dispatch(fetchUserReports({ status: statusFilter, page: currentPage }));
      }, 500);
    }
  };

  const handleBanConfirm = async () => {
    if (selectedReport && selectedReport.user) {
      dispatch(
        banUserThunk({
          userId: selectedReport.user.id,
          reason: banReason,
        })
      );
      setBanDialogOpen(false);
      setSelectedReport(null);
      setBanReason('');
      // Refetch reports after ban
      setTimeout(() => {
        dispatch(fetchUserReports({ status: statusFilter, page: currentPage }));
      }, 500);
    }
  };

  const handleDialogCancel = () => {
    setDismissDialogOpen(false);
    setBanDialogOpen(false);
    setSelectedReport(null);
    setBanReason('');
  };

  const getStatusColor = (status) => {
    const statusColors = {
      PENDING: 'warning',
      UNDER_REVIEW: 'info',
      RESOLVED: 'success',
      DISMISSED: 'error',
    };
    return statusColors[status] || 'default';
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
    <Box sx={{ backgroundColor: colors.background, minHeight: '100vh', py: 4 }}>
      <Container maxWidth="lg">
        {/* Header */}
        <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ color: colors.text, marginBottom: '8px' }}>User Reports</h1>
            <p style={{ color: colors.textSecondary, fontSize: '14px' }}>
              Total reports: {pagination.totalItems}
            </p>
          </div>
          <Button variant="outlined" onClick={() => navigate('/admin')}>
            Back to Dashboard
          </Button>
        </Box>

        {/* Filters */}
        <Box sx={{ mb: 3 }}>
          <FormControl sx={{ minWidth: 200 }}>
            <InputLabel>Filter by Status</InputLabel>
            <Select
              value={statusFilter || ''}
              label="Filter by Status"
              onChange={(e) => handleStatusFilterChange(e.target.value || null)}
              sx={{ backgroundColor: colors.card, color: colors.text }}
            >
              <MenuItem value="">All Statuses</MenuItem>
              <MenuItem value="PENDING">Pending</MenuItem>
              <MenuItem value="UNDER_REVIEW">Under Review</MenuItem>
              <MenuItem value="RESOLVED">Resolved</MenuItem>
              <MenuItem value="DISMISSED">Dismissed</MenuItem>
            </Select>
          </FormControl>
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
          <TableContainer component={Paper} sx={{ backgroundColor: colors.card }}>
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: colors.primary }}>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>ID</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Reported User</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Report Type</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Reported By</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Status</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Created</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {userReports.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      align="center"
                      sx={{ py: 3, color: colors.textSecondary }}
                    >
                      No reports found
                    </TableCell>
                  </TableRow>
                ) : (
                  userReports.map((report) => (
                    <TableRow
                      key={report.id}
                      hover
                      sx={{
                        '&:hover': { backgroundColor: colors.hover },
                        borderBottom: `1px solid ${colors.border}`,
                      }}
                    >
                      <TableCell sx={{ color: colors.text }}>{report.id}</TableCell>
                      <TableCell sx={{ color: colors.text }}>
                        {report.user ? (
                          <div>
                            {report.user.name} {report.user.surname}
                          </div>
                        ) : (
                          'User Deleted'
                        )}
                      </TableCell>
                      <TableCell sx={{ color: colors.text }}>
                        {report.report_type || 'N/A'}
                      </TableCell>
                      <TableCell sx={{ color: colors.text }}>
                        {report.reporter?.name} {report.reporter?.surname}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={report.status}
                          color={getStatusColor(report.status)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell sx={{ color: colors.text }}>
                        {formatDate(report.created_at)}
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                          {report.user && (
                            <Button
                              size="small"
                              startIcon={<VisibilityIcon />}
                              variant="outlined"
                              onClick={() => navigate(`/profile/${report.user.id}`)}
                            >
                              View
                            </Button>
                          )}
                          <Button
                            size="small"
                            color="warning"
                            variant="outlined"
                            onClick={() => handleDismissClick(report)}
                          >
                            Dismiss
                          </Button>
                          {report.user && (
                            <Button
                              size="small"
                              color="error"
                              variant="outlined"
                              startIcon={<BlockIcon />}
                              onClick={() => handleBanClick(report)}
                            >
                              Ban
                            </Button>
                          )}
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
        <DialogTitle sx={{ color: colors.text }}>Dismiss Report</DialogTitle>
        <DialogContent>
          {selectedReport && (
            <Box sx={{ mb: 2 }}>
              <div style={{ marginBottom: '16px', color: colors.text }}>
                <p>
                  <strong>Reported User:</strong>{' '}
                  {selectedReport.user
                    ? `${selectedReport.user.name} ${selectedReport.user.surname}`
                    : 'User Deleted'}
                </p>
                <p>
                  <strong>Report Type:</strong> {selectedReport.report_type}
                </p>
                {selectedReport.description && (
                  <p>
                    <strong>Description:</strong> {selectedReport.description}
                  </p>
                )}
                <p style={{ marginTop: '16px', fontStyle: 'italic', color: colors.textSecondary }}>
                  This report will be marked as dismissed.
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
            {actionLoading ? <CircularProgress size={24} /> : 'Dismiss Report'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Ban Dialog */}
      <Dialog open={banDialogOpen} onClose={handleDialogCancel} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ color: colors.text }}>Ban User</DialogTitle>
        <DialogContent>
          {selectedReport && selectedReport.user && (
            <Box sx={{ mb: 2 }}>
              <Alert severity="warning" sx={{ mb: 2 }}>
                You are about to ban {selectedReport.user.name} {selectedReport.user.surname}.
                This user will no longer be able to access their account.
              </Alert>
              <div style={{ marginBottom: '16px', color: colors.text }}>
                <p>
                  <strong>User:</strong> {selectedReport.user.name} {selectedReport.user.surname}
                </p>
                <p>
                  <strong>Email:</strong> {selectedReport.user.email}
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
                color: colors.text,
              },
              '& .MuiInputBase-input::placeholder': {
                color: colors.textSecondary,
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
    </Box>
  );
};

export default AdminUserReports;
