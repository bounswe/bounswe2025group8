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
import { submitReport } from "../services/reportService";

/**
 * ReportModal Component
 * Modal for reporting tasks/volunteers with reason and optional comments
 */
const ReportModal = ({ open, onClose, task, currentUser, onSubmitSuccess }) => {
  // State for form
  const [reportType, setReportType] = useState("");
  const [description, setDescription] = useState("");

  // State for UI
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  // Report type options matching backend
  const reportTypes = [
    { value: "SPAM", label: "Spam" },
    { value: "INAPPROPRIATE_CONTENT", label: "Inappropriate Content" },
    { value: "HARASSMENT", label: "Harassment" },
    { value: "FRAUD", label: "Fraud" },
    { value: "FAKE_REQUEST", label: "Fake Request" },
    { value: "NO_SHOW", label: "No Show" },
    { value: "SAFETY_CONCERN", label: "Safety Concern" },
    { value: "OTHER", label: "Other" },
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
      setError("Please select a reason for reporting");
      return;
    }

    if (!description.trim()) {
      setError("Please provide details about your report");
      return;
    }

    if (description.trim().length < 10) {
      setError("Please provide at least 10 characters in your report");
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
        "Failed to submit report. Please try again.";

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
          Report This Task
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
            Report submitted successfully! Thank you for helping keep our
            community safe.
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
            Reason for Report <span style={{ color: "red" }}>*</span>
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
                  Select a reason for reporting
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
            Details <span style={{ color: "red" }}>*</span>
          </Typography>
          <TextField
            multiline
            rows={4}
            fullWidth
            placeholder="Please explain why you're reporting this task. Provide specific details to help us review your report (minimum 10 characters)..."
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
            {description.length} characters
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
              Submitting Report...
            </Box>
          ) : success ? (
            "Report Submitted!"
          ) : (
            "Submit Report"
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
          Your report helps us maintain a safe and trustworthy community
        </Typography>
      </DialogContent>
    </Dialog>
  );
};

export default ReportModal;
