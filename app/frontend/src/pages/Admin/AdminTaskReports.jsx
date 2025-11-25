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
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import {
  fetchTaskReports,
  updateReportStatusThunk,
  deleteTaskThunk,
  clearError,
  clearSuccess,
} from '../../features/admin/store/adminSlice';

const AdminTaskReports = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { userRole } = useAuth();
  const { colors } = useTheme();

  const { taskReports, pagination, loading, actionLoading, error, successMessage } = useSelector(
    (state) => state.admin
  );

  const currentPage = parseInt(searchParams.get('page') || '1', 10);
  const statusFilter = searchParams.get('status') || null;

  const [dismissDialogOpen, setDismissDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [reportDetailsDialogOpen, setReportDetailsDialogOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);

  // Check admin access
  useEffect(() => {
    if (userRole !== 'admin') {
      navigate('/');
    }
  }, [userRole, navigate]);

  // Fetch reports
  useEffect(() => {
    dispatch(fetchTaskReports({ status: statusFilter, page: currentPage }));
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

  const handleViewReportDetails = (report) => {
    setSelectedReport(report);
    setReportDetailsDialogOpen(true);
  };

  const handleDismissClick = (report) => {
    setSelectedReport(report);
    setDismissDialogOpen(true);
  };

  const handleDismissConfirm = () => {
    if (selectedReport) {
      dispatch(
        updateReportStatusThunk({
          reportType: 'task',
          reportId: selectedReport.id,
          status: 'DISMISSED',
          notes: 'Report dismissed by admin',
        })
      );
      setDismissDialogOpen(false);
      setSelectedReport(null);
      // Refetch reports after dismiss
      setTimeout(() => {
        dispatch(fetchTaskReports({ status: statusFilter, page: currentPage }));
      }, 500);
    }
  };

  const handleDeleteClick = (report) => {
    setSelectedReport(report);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (selectedReport && selectedReport.task) {
      dispatch(deleteTaskThunk({ taskId: selectedReport.task.id, reason: 'Removed as per report' }));
      setDeleteDialogOpen(false);
      setSelectedReport(null);
      // Refetch reports after deletion
      setTimeout(() => {
        dispatch(fetchTaskReports({ status: statusFilter, page: currentPage }));
      }, 500);
    }
  };

  const handleDialogCancel = () => {
    setDismissDialogOpen(false);
    setDeleteDialogOpen(false);
    setReportDetailsDialogOpen(false);
    setSelectedReport(null);
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
    <Box sx={{ backgroundColor: colors.background.primary, minHeight: '100vh', py: 4 }}>
      <Container maxWidth="lg">
        {/* Header */}
        <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ color: colors.text.primary, marginBottom: '8px' }}>Task Reports</h1>
            <p style={{ color: colors.text.secondary, fontSize: '14px' }}>
              Total reports: {pagination.totalItems}
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

        {/* Filters */}
        <Box sx={{ mb: 3 }}>
          <FormControl sx={{ minWidth: 200 }} variant="outlined">
            <InputLabel
              sx={{
                color: colors.brand.primary,
                '&.Mui-focused': {
                  color: colors.brand.primary,
                }
              }}
            >
              Filter by Status
            </InputLabel>
            <Select
              value={statusFilter || ''}
              label="Filter by Status"
              onChange={(e) => handleStatusFilterChange(e.target.value || null)}
              sx={{
                color: colors.text.primary,
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: colors.brand.primary,
                },
                '&:hover .MuiOutlinedInput-notchedOutline': {
                  borderColor: colors.brand.primary,
                },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                  borderColor: colors.brand.primary,
                },
              }}
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
                  <TableCell sx={{ color: colors.text.inverse, fontWeight: 'bold' }}>Request</TableCell>
                  <TableCell sx={{ color: colors.text.inverse, fontWeight: 'bold' }}>Report Type</TableCell>
                  <TableCell sx={{ color: colors.text.inverse, fontWeight: 'bold' }}>Reported By</TableCell>
                  <TableCell sx={{ color: colors.text.inverse, fontWeight: 'bold' }}>Status</TableCell>
                  <TableCell sx={{ color: colors.text.inverse, fontWeight: 'bold' }}>Created</TableCell>
                  <TableCell sx={{ color: colors.text.inverse, fontWeight: 'bold' }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {taskReports.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      align="center"
                      sx={{ py: 3, color: colors.text.secondary }}
                    >
                      No reports found
                    </TableCell>
                  </TableRow>
                ) : (
                  taskReports.map((report) => (
                    <TableRow
                      key={report.id}
                      hover
                      sx={{
                        '&:hover': { backgroundColor: colors.interactive.hover },
                        borderBottom: `1px solid ${colors.border.secondary}`,
                      }}
                    >
                      <TableCell sx={{ color: colors.text.primary }}>{report.id}</TableCell>
                      <TableCell sx={{ maxWidth: 200 }}>
                        {report.task ? (
                          <Button
                            sx={{
                              color: colors.brand.primary,
                              textTransform: 'none',
                              padding: 0,
                              justifyContent: 'flex-start',
                              whiteSpace: 'normal',
                              wordBreak: 'break-word',
                              '&:hover': {
                                textDecoration: 'underline',
                              },
                            }}
                            onClick={() => navigate(`/requests/${report.task.id}`)}
                          >
                            {report.task.title}
                          </Button>
                        ) : (
                          <span style={{ color: colors.text.primary }}>Task Deleted</span>
                        )}
                      </TableCell>
                      <TableCell sx={{ color: colors.text.primary }}>
                        {report.report_type || 'N/A'}
                      </TableCell>
                      <TableCell sx={{ color: colors.text.primary }}>
                        {typeof report.reporter === 'string'
                          ? report.reporter
                          : report.reporter?.name && report.reporter?.surname
                          ? `${report.reporter.name} ${report.reporter.surname}`
                          : report.reporter?.username || report.reporter?.email || 'Unknown'}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={report.status}
                          color={getStatusColor(report.status)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell sx={{ color: colors.text.primary }}>
                        {formatDate(report.created_at)}
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                          <Button
                            size="small"
                            startIcon={<VisibilityIcon />}
                            variant="outlined"
                            onClick={() => handleViewReportDetails(report)}
                          >
                            View
                          </Button>
                          {report.task && (
                            <Button
                              size="small"
                              color="error"
                              variant="outlined"
                              onClick={() => handleDeleteClick(report)}
                            >
                              Delete
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
        <DialogTitle sx={{ color: colors.text.primary }}>Dismiss Report</DialogTitle>
        <DialogContent>
          {selectedReport && (
            <Box sx={{ mb: 2 }}>
              <div style={{ marginBottom: '16px', color: colors.text.primary }}>
                <p>
                  <strong>Request:</strong> {selectedReport.task?.title || 'Task Deleted'}
                </p>
                <p>
                  <strong>Report Type:</strong> {selectedReport.report_type}
                </p>
                {selectedReport.description && (
                  <p>
                    <strong>Description:</strong> {selectedReport.description}
                  </p>
                )}
                <p style={{ marginTop: '16px', fontStyle: 'italic', color: colors.text.secondary }}>
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

      {/* Delete Dialog */}
      <Dialog open={deleteDialogOpen} onClose={handleDialogCancel} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ color: colors.text.primary }}>Delete Task</DialogTitle>
        <DialogContent>
          {selectedReport && (
            <Box sx={{ mb: 2 }}>
              <div style={{ marginBottom: '16px', color: colors.text.primary }}>
                <p>
                  <strong>Request:</strong> {selectedReport.task?.title || 'Task Deleted'}
                </p>
                <p style={{ marginTop: '16px', color: colors.semantic.error }}>
                  Are you sure you want to delete this task? This action cannot be undone.
                </p>
              </div>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogCancel}>Cancel</Button>
          <Button
            onClick={handleDeleteConfirm}
            color="error"
            variant="contained"
            disabled={actionLoading}
          >
            {actionLoading ? <CircularProgress size={24} /> : 'Delete Task'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Report Details Dialog */}
      <Dialog open={reportDetailsDialogOpen} onClose={handleDialogCancel} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ color: colors.text.primary }}>Report Details</DialogTitle>
        <DialogContent sx={{ backgroundColor: colors.background.primary, py: 0, px: 0 }}>
          {selectedReport && (
            <Box
              sx={{
                p: 2,
                backgroundColor: colors.background.secondary,
                borderRadius: 1,
                borderLeft: `4px solid ${colors.brand.primary}`,
              }}
            >
              <div style={{ color: colors.text.primary }}>
                <p style={{ margin: '0 0 8px 0' }}>
                  <strong>Report ID:</strong> {selectedReport.id}
                </p>
                <p style={{ margin: '0 0 8px 0' }}>
                  <strong>Request:</strong> {selectedReport.task?.title || 'Task Deleted'}
                </p>
                <p style={{ margin: '0 0 8px 0' }}>
                  <strong>Report Type:</strong> {selectedReport.report_type_display || selectedReport.report_type}
                </p>
                <p style={{ margin: '0 0 8px 0' }}>
                  <strong>Status:</strong> <Chip label={selectedReport.status} size="small" color={getStatusColor(selectedReport.status)} />
                </p>
                <p style={{ margin: '0 0 8px 0' }}>
                  <strong>Reported By:</strong>{' '}
                  {typeof selectedReport.reporter === 'string'
                    ? selectedReport.reporter
                    : selectedReport.reporter?.name && selectedReport.reporter?.surname
                    ? `${selectedReport.reporter.name} ${selectedReport.reporter.surname}`
                    : selectedReport.reporter?.username || selectedReport.reporter?.email || 'Unknown'}
                </p>
                <p style={{ margin: '0 0 16px 0' }}>
                  <strong>Created:</strong> {formatDate(selectedReport.created_at)}
                </p>
                {selectedReport.description && (
                  <Box sx={{ p: 1.5, backgroundColor: colors.background.primary, borderRadius: 1 }}>
                    <p style={{ margin: '0 0 8px 0', color: colors.text.primary }}>
                      <strong>Description:</strong>
                    </p>
                    <p style={{ margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-word', color: colors.text.secondary }}>
                      {selectedReport.description}
                    </p>
                  </Box>
                )}
              </div>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogCancel}>Close</Button>
          {selectedReport?.task && (
            <Button
              onClick={() => {
                navigate(`/requests/${selectedReport.task.id}`);
                handleDialogCancel();
              }}
              color="primary"
              variant="contained"
              endIcon={<OpenInNewIcon />}
            >
              View Request
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminTaskReports;
