import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import useAuth from "../../features/authentication/hooks/useAuth";
import { useTheme } from "../../hooks/useTheme";
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
} from "@mui/material";
import VisibilityIcon from "@mui/icons-material/Visibility";
import BlockIcon from "@mui/icons-material/Block";
import {
  fetchUserReports,
  updateReportStatusThunk,
  banUserThunk,
  clearError,
  clearSuccess,
} from "../../features/admin/store/adminSlice";
import DeleteIcon from "@mui/icons-material/Delete";

const AdminUserReports = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { userRole } = useAuth();
  const { colors } = useTheme();
  const { t } = useTranslation();

  const {
    userReports,
    pagination,
    loading,
    actionLoading,
    error,
    successMessage,
  } = useSelector((state) => state.admin);

  const currentPage = parseInt(searchParams.get("page") || "1", 10);
  const statusFilter = searchParams.get("status") || null;

  const [dismissDialogOpen, setDismissDialogOpen] = useState(false);
  const [banDialogOpen, setBanDialogOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const [banReason, setBanReason] = useState("");

  // Check admin access
  useEffect(() => {
    if (userRole !== "admin") {
      navigate("/");
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
    setSearchParams({
      page: value.toString(),
      ...(statusFilter && { status: statusFilter }),
    });
  };

  const handleStatusFilterChange = (status) => {
    setSearchParams({ page: "1", ...(status && { status }) });
  };

  const handleDismissClick = (report) => {
    setSelectedReport(report);
    setDismissDialogOpen(true);
  };

  const handleBanClick = (report) => {
    setSelectedReport(report);
    setBanReason("");
    setBanDialogOpen(true);
  };

  const handleDismissConfirm = () => {
    if (selectedReport) {
      dispatch(
        updateReportStatusThunk({
          reportType: "user",
          reportId: selectedReport.id,
          status: "DISMISSED",
          notes: "Report dismissed by admin",
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
      setBanReason("");
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
    setBanReason("");
  };

  const getStatusColor = (status) => {
    const statusColors = {
      PENDING: "warning",
      UNDER_REVIEW: "info",
      RESOLVED: "success",
      DISMISSED: "error",
    };
    return statusColors[status] || "default";
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (userRole !== "admin") {
    return null;
  }

  return (
    <Box
      sx={{
        backgroundColor: colors.background.primary,
        minHeight: "100vh",
        py: 4,
      }}
    >
      <Container maxWidth="lg">
        {/* Header */}
        <Box
          sx={{
            mb: 4,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div>
            <h1 style={{ color: colors.text.primary, marginBottom: "8px" }}>
              {t("adminUserReports.title")}
            </h1>
            <p style={{ color: colors.text.secondary, fontSize: "14px" }}>
              {t("adminUserReports.totalReports", {
                count: pagination.totalItems,
              })}
            </p>
          </div>
          <Button
            variant="outlined"
            onClick={() => navigate(-1)}
            sx={{
              color: colors.brand.primary,
              borderColor: colors.brand.primary,
            }}
          >
            {t("adminUserReports.backToDashboard")}
          </Button>
        </Box>

        {/* Filters */}
        <Box sx={{ mb: 3 }}>
          <FormControl sx={{ minWidth: 200 }} variant="outlined">
            <InputLabel
              sx={{
                color: colors.brand.primary,
                "&.Mui-focused": {
                  color: colors.brand.primary,
                },
              }}
            >
              {t("adminUserReports.filterByStatus")}
            </InputLabel>
            <Select
              value={statusFilter || ""}
              label={t("adminUserReports.filterByStatus")}
              onChange={(e) => handleStatusFilterChange(e.target.value || null)}
              sx={{
                color: colors.text.primary,
                "& .MuiOutlinedInput-notchedOutline": {
                  borderColor: colors.brand.primary,
                },
                "&:hover .MuiOutlinedInput-notchedOutline": {
                  borderColor: colors.brand.primary,
                },
                "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                  borderColor: colors.brand.primary,
                },
              }}
            >
              <MenuItem value="">{t("adminUserReports.allStatuses")}</MenuItem>
              <MenuItem value="PENDING">
                {t("adminUserReports.pending")}
              </MenuItem>
              <MenuItem value="UNDER_REVIEW">
                {t("adminUserReports.underReview")}
              </MenuItem>
              <MenuItem value="RESOLVED">
                {t("adminUserReports.resolved")}
              </MenuItem>
              <MenuItem value="DISMISSED">
                {t("adminUserReports.dismissed")}
              </MenuItem>
            </Select>
          </FormControl>
        </Box>

        {/* Alerts */}
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {typeof error === "string" ? error : "An error occurred"}
          </Alert>
        )}
        {successMessage && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {successMessage}
          </Alert>
        )}

        {/* Loading State */}
        {loading && (
          <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
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
              "& .MuiTable-root": {
                backgroundColor: colors.background.elevated,
              },
              "& .MuiTableCell-root": {
                backgroundColor: colors.background.elevated,
                color: colors.text.primary,
              },
            }}
          >
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: colors.brand.primary }}>
                  <TableCell
                    sx={{ color: colors.text.inverse, fontWeight: "bold" }}
                  >
                    {t("adminUserReports.table.id")}
                  </TableCell>
                  <TableCell
                    sx={{ color: colors.text.inverse, fontWeight: "bold" }}
                  >
                    {t("adminUserReports.table.reportedUser")}
                  </TableCell>
                  <TableCell
                    sx={{ color: colors.text.inverse, fontWeight: "bold" }}
                  >
                    {t("adminUserReports.table.reportType")}
                  </TableCell>
                  <TableCell
                    sx={{ color: colors.text.inverse, fontWeight: "bold" }}
                  >
                    {t("adminUserReports.table.reportedBy")}
                  </TableCell>
                  <TableCell
                    sx={{ color: colors.text.inverse, fontWeight: "bold" }}
                  >
                    {t("adminUserReports.table.status")}
                  </TableCell>
                  <TableCell
                    sx={{ color: colors.text.inverse, fontWeight: "bold" }}
                  >
                    {t("adminUserReports.table.created")}
                  </TableCell>
                  <TableCell
                    sx={{ color: colors.text.inverse, fontWeight: "bold" }}
                  >
                    {t("adminUserReports.table.actions")}
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {userReports.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      align="center"
                      sx={{ py: 3, color: colors.text.secondary }}
                    >
                      {t("adminUserReports.noReportsFound")}
                    </TableCell>
                  </TableRow>
                ) : (
                  userReports.map((report) => (
                    <TableRow
                      key={report.id}
                      hover
                      sx={{
                        "&:hover": {
                          backgroundColor: colors.interactive.hover,
                        },
                        borderBottom: `1px solid ${colors.border.secondary}`,
                      }}
                    >
                      <TableCell sx={{ color: colors.text.primary }}>
                        {report.id}
                      </TableCell>
                      <TableCell sx={{ color: colors.text.primary }}>
                        {report.user ? (
                          <div>
                            {report.user.name} {report.user.surname}
                          </div>
                        ) : (
                          t("adminUserReports.userDeleted")
                        )}
                      </TableCell>
                      <TableCell sx={{ color: colors.text.primary }}>
                        {report.report_type || "N/A"}
                      </TableCell>
                      <TableCell sx={{ color: colors.text.primary }}>
                        {report.reporter?.name} {report.reporter?.surname}
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
                        <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                          {report.user && (
                            <Button
                              size="small"
                              startIcon={<VisibilityIcon />}
                              variant="outlined"
                              onClick={() =>
                                navigate(`/profile/${report.user.id}`)
                              }
                            >
                              {t("adminUserReports.actions.view")}
                            </Button>
                          )}
                          <Button
                            size="small"
                            color="warning"
                            variant="outlined"
                            onClick={() => handleDismissClick(report)}
                          >
                            {t("adminUserReports.actions.dismiss")}
                          </Button>
                          {report.user && (
                            <Button
                              size="small"
                              color="error"
                              variant="outlined"
                              startIcon={<BlockIcon />}
                              onClick={() => handleBanClick(report)}
                            >
                              {t("adminUserReports.actions.ban")}
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
          <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
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
      <Dialog
        open={dismissDialogOpen}
        onClose={handleDialogCancel}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ color: colors.text.primary }}>
          {t("adminUserReports.dismissDialog.title")}
        </DialogTitle>
        <DialogContent>
          {selectedReport && (
            <Box sx={{ mb: 2 }}>
              <div style={{ marginBottom: "16px", color: colors.text.primary }}>
                <p>
                  <strong>
                    {t("adminUserReports.dismissDialog.reportedUser")}
                  </strong>{" "}
                  {selectedReport.user
                    ? `${selectedReport.user.name} ${selectedReport.user.surname}`
                    : t("adminUserReports.userDeleted")}
                </p>
                <p>
                  <strong>
                    {t("adminUserReports.dismissDialog.reportType")}
                  </strong>{" "}
                  {selectedReport.report_type}
                </p>
                {selectedReport.description && (
                  <p>
                    <strong>
                      {t("adminUserReports.dismissDialog.description")}
                    </strong>{" "}
                    {selectedReport.description}
                  </p>
                )}
                <p
                  style={{
                    marginTop: "16px",
                    fontStyle: "italic",
                    color: colors.text.secondary,
                  }}
                >
                  {t("adminUserReports.dismissDialog.message")}
                </p>
              </div>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogCancel}>
            {t("adminUserReports.dismissDialog.cancel")}
          </Button>
          <Button
            onClick={handleDismissConfirm}
            color="warning"
            variant="contained"
            disabled={actionLoading}
          >
            {actionLoading ? (
              <CircularProgress size={24} />
            ) : (
              t("adminUserReports.dismissDialog.confirm")
            )}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Ban Dialog */}
      <Dialog
        open={banDialogOpen}
        onClose={handleDialogCancel}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ color: colors.text.primary }}>
          {t("adminUserReports.banDialog.title")}
        </DialogTitle>
        <DialogContent>
          {selectedReport && selectedReport.user && (
            <Box sx={{ mb: 2 }}>
              <Alert severity="warning" sx={{ mb: 2 }}>
                {t("adminUserReports.banDialog.warning", {
                  name: `${selectedReport.user.name} ${selectedReport.user.surname}`,
                })}
              </Alert>
              <div style={{ marginBottom: "16px", color: colors.text.primary }}>
                <p>
                  <strong>{t("adminUserReports.banDialog.user")}</strong>{" "}
                  {selectedReport.user.name} {selectedReport.user.surname}
                </p>
                <p>
                  <strong>{t("adminUserReports.banDialog.email")}</strong>{" "}
                  {selectedReport.user.email}
                </p>
              </div>
            </Box>
          )}

          <TextField
            fullWidth
            multiline
            rows={3}
            label={t("adminUserReports.banDialog.reasonLabel")}
            value={banReason}
            onChange={(e) => setBanReason(e.target.value)}
            placeholder={t("adminUserReports.banDialog.reasonPlaceholder")}
            required
            sx={{
              "& .MuiOutlinedInput-root": {
                color: colors.text.primary,
              },
              "& .MuiInputBase-input::placeholder": {
                color: colors.text.secondary,
                opacity: 0.7,
              },
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogCancel}>
            {t("adminUserReports.banDialog.cancel")}
          </Button>
          <Button
            onClick={handleBanConfirm}
            color="error"
            variant="contained"
            disabled={actionLoading || !banReason.trim()}
          >
            {actionLoading ? (
              <CircularProgress size={24} />
            ) : (
              t("adminUserReports.banDialog.confirm")
            )}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminUserReports;
