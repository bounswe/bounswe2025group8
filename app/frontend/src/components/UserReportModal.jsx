import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  Box,
  Typography,
  TextField,
  Button,
  IconButton,
  Select,
  MenuItem,
  FormControl,
  CircularProgress,
  Alert,
  Avatar,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { submitUserReport } from "../services/reportService";

/**
 * UserReportModal Component
 * Modal for reporting users with reason and optional comments
 */
const UserReportModal = ({
  open,
  onClose,
  user,
  currentUser,
  onSubmitSuccess,
}) => {
  const { t } = useTranslation();
  // State for form
  const [reportType, setReportType] = useState("");
  const [description, setDescription] = useState("");

  // State for UI
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  // Report type options matching backend
  const reportTypes = [
    { value: "SPAM", label: t("userReportModal.spam") },
    {
      value: "INAPPROPRIATE_CONTENT",
      label: t("userReportModal.inappropriateContent"),
    },
    { value: "HARASSMENT", label: t("userReportModal.harassment") },
    { value: "FRAUD", label: t("userReportModal.fraud") },
    { value: "FAKE_REQUEST", label: t("userReportModal.fakeRequest") },
    { value: "NO_SHOW", label: t("userReportModal.noShow") },
    { value: "SAFETY_CONCERN", label: t("userReportModal.safetyConcern") },
    { value: "OTHER", label: t("userReportModal.other") },
  ];

  // Reset form when modal closes
  React.useEffect(() => {
    if (!open) {
      setReportType("");
      setDescription("");
      setError(null);
      setSuccess(false);
      setLoading(false);
    }
  }, [open]);

  // Handle form submission
  const handleSubmit = async () => {
    if (!reportType) {
      setError(t("userReportModal.selectReasonError"));
      return;
    }

    if (!description.trim()) {
      setError(t("userReportModal.provideDetailsError"));
      return;
    }

    if (description.trim().length < 10) {
      setError(t("userReportModal.minCharactersError"));
      return;
    }

    try {
      setLoading(true);
      setError(null);

      await submitUserReport(user.id, reportType, description.trim());

      setSuccess(true);

      // Call success callback if provided
      if (onSubmitSuccess) {
        onSubmitSuccess();
      }

      // Close modal after success
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (err) {
      console.error("Error submitting user report:", err);

      const errorMessage =
        err.response?.data?.message ||
        err.response?.data?.error ||
        (err.response?.data?.errors &&
          Object.values(err.response.data.errors).flat().join(", ")) ||
        err.message ||
        t("userReportModal.submitFailedError");

      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Get user display name
  const getUserDisplayName = () => {
    if (!user) return t("userReportModal.unknownUser");
    const firstName = user.name || "";
    const lastName = user.surname || "";
    return (
      `${firstName} ${lastName}`.trim() ||
      user.username ||
      t("userReportModal.unknownUser")
    );
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          borderRadius: "16px",
          width: "400px",
          maxWidth: "calc(100% - 32px)",
          margin: "16px auto",
        },
      }}
    >
      {/* Header */}
      <DialogTitle sx={{ pb: 1, pr: 6 }}>
        <Typography variant="h6" component="div" sx={{ fontWeight: 600 }}>
          {t("userReportModal.reportUser")}
        </Typography>
        <IconButton
          onClick={onClose}
          sx={{
            position: "absolute",
            right: 8,
            top: 8,
            color: "text.secondary",
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ pt: 1 }}>
        {/* Success Message */}
        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {t("userReportModal.reportSubmittedSuccess")}
          </Alert>
        )}

        {/* Error Message */}
        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {/* User Information Display */}
        {user && (
          <Box sx={{ mb: 3, p: 2, bgcolor: "grey.50", borderRadius: 2 }}>
            <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 500 }}>
              {t("userReportModal.reportingUser")}
            </Typography>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
              <Avatar
                sx={{
                  width: 40,
                  height: 40,
                  bgcolor: "primary.main",
                }}
              >
                {(user.name?.charAt(0) || "") + (user.surname?.charAt(0) || "")}
              </Avatar>
              <Box>
                <Typography variant="body1" sx={{ fontWeight: 500 }}>
                  {getUserDisplayName()}
                </Typography>
                {user.username && (
                  <Typography
                    variant="caption"
                    sx={{ color: "text.secondary" }}
                  >
                    @{user.username}
                  </Typography>
                )}
              </Box>
            </Box>
          </Box>
        )}

        {/* Report Type Selection */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 500 }}>
            {t("userReportModal.reasonForReport")}{" "}
            <span style={{ color: "red" }}>
              {t("userReportModal.required")}
            </span>
          </Typography>
          <FormControl fullWidth>
            <Select
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
              displayEmpty
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: "8px",
                },
              }}
            >
              <MenuItem value="" disabled>
                <Typography color="text.secondary">
                  {t("userReportModal.selectReason")}
                </Typography>
              </MenuItem>
              {reportTypes.map((type) => (
                <MenuItem key={type.value} value={type.value}>
                  {type.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>

        {/* Description */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 500 }}>
            {t("userReportModal.details")}{" "}
            <span style={{ color: "red" }}>
              {t("userReportModal.required")}
            </span>
          </Typography>
          <TextField
            multiline
            rows={4}
            fullWidth
            placeholder={t("userReportModal.detailsPlaceholder")}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            variant="outlined"
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: "8px",
              },
            }}
          />
          <Typography
            variant="caption"
            sx={{
              display: "block",
              mt: 1,
              color: "text.secondary",
            }}
          >
            {t("userReportModal.characters", { count: description.length })}
          </Typography>
        </Box>

        {/* Submit Button */}
        <Button
          fullWidth
          variant="contained"
          onClick={handleSubmit}
          disabled={loading || success}
          sx={{
            height: 48,
            borderRadius: 3,
            bgcolor: "#E15B97",
            fontSize: "1rem",
            fontWeight: 500,
            textTransform: "none",
            "&:hover": {
              bgcolor: "#D04D89",
            },
            "&:disabled": {
              bgcolor: "grey.300",
            },
          }}
        >
          {loading ? (
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <CircularProgress size={20} color="inherit" />
              {t("userReportModal.submittingReport")}
            </Box>
          ) : success ? (
            t("userReportModal.reportSubmitted")
          ) : (
            t("userReportModal.submitReport")
          )}
        </Button>

        {/* Info Text */}
        <Typography
          variant="caption"
          sx={{
            display: "block",
            textAlign: "center",
            mt: 2,
            color: "text.secondary",
          }}
        >
          {t("userReportModal.infoText")}
        </Typography>
      </DialogContent>
    </Dialog>
  );
};

export default UserReportModal;
