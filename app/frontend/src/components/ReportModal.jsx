import React, { useState } from "react";
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
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { useTranslation } from "react-i18next";
import { submitReport } from "../services/reportService";

/**
 * ReportModal Component
 * Modal for reporting tasks/volunteers with reason and optional comments
 */
const ReportModal = ({ open, onClose, task, currentUser, onSubmitSuccess }) => {
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
    { value: "SPAM", labelKey: "reportModal.spam" },
    {
      value: "INAPPROPRIATE_CONTENT",
      labelKey: "reportModal.inappropriateContent",
    },
    { value: "HARASSMENT", labelKey: "reportModal.harassment" },
    { value: "FRAUD", labelKey: "reportModal.fraud" },
    { value: "FAKE_REQUEST", labelKey: "reportModal.fakeRequest" },
    { value: "NO_SHOW", labelKey: "reportModal.noShow" },
    { value: "SAFETY_CONCERN", labelKey: "reportModal.safetyConcern" },
    { value: "OTHER", labelKey: "reportModal.other" },
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
      setError(t("reportModal.pleaseSelectReason"));
      return;
    }

    if (!description.trim()) {
      setError(t("reportModal.pleaseProvideDetails"));
      return;
    }

    if (description.trim().length < 10) {
      setError(t("reportModal.pleaseProvideAtLeast10Chars"));
      return;
    }

    try {
      setLoading(true);
      setError(null);

      await submitReport(task.id, reportType, description.trim());

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
      console.error("Error submitting report:", err);

      const errorMessage =
        err.response?.data?.message ||
        err.response?.data?.error ||
        (err.response?.data?.errors &&
          Object.values(err.response.data.errors).flat().join(", ")) ||
        err.message ||
        t("reportModal.failedToSubmit");

      setError(errorMessage);
    } finally {
      setLoading(false);
    }
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
          {t("reportModal.title")}
        </Typography>
        <IconButton
          onClick={onClose}
          sx={{
            position: "absolute",
            right: 8,
            top: 8,
            color: "text.secondary",
          }}
          aria-label={t("reportModal.close")}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ pt: 1 }}>
        {/* Success Message */}
        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {t("reportModal.reportSubmittedSuccess")}
          </Alert>
        )}

        {/* Error Message */}
        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {/* Report Type Selection */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 500 }}>
            {t("reportModal.reasonForReport")}{" "}
            <span style={{ color: "red" }}>*</span>
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
                  {t("reportModal.selectReason")}
                </Typography>
              </MenuItem>
              {reportTypes.map((type) => (
                <MenuItem key={type.value} value={type.value}>
                  {t(type.labelKey)}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>

        {/* Description */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 500 }}>
            {t("reportModal.details")} <span style={{ color: "red" }}>*</span>
          </Typography>
          <TextField
            multiline
            rows={4}
            fullWidth
            placeholder={t("reportModal.detailsPlaceholder")}
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
            {t("reportModal.charactersCount", { count: description.length })}
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
              {t("reportModal.submittingReport")}
            </Box>
          ) : success ? (
            t("reportModal.reportSubmitted")
          ) : (
            t("reportModal.submitReport")
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
          {t("reportModal.reportHelpsInfo")}
        </Typography>
      </DialogContent>
    </Dialog>
  );
};

export default ReportModal;
