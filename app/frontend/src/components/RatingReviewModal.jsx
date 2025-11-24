import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  Box,
  Typography,
  Rating,
  TextField,
  Button,
  Avatar,
  IconButton,
  Select,
  MenuItem,
  FormControl,
  CircularProgress,
  Alert,
  Chip,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import StarIcon from "@mui/icons-material/Star";
import {
  submitReview,
  getReviewableUsersAsync,
  getAllRevieweesWithStatus,
} from "../services/reviewService";

/**
 * RatingReviewModal Component
 * Modal for rating and reviewing task participants after task completion
 */
const RatingReviewModal = ({
  open,
  onClose,
  task,
  currentUser,
  onSubmitSuccess,
}) => {
  // State for form
  const [selectedUser, setSelectedUser] = useState(null);
  const [rating, setRating] = useState(3.0);
  const [comment, setComment] = useState("");
  // Per-dimension ratings (frontend-only). Keys populated depending on reviewer role.
  const [dimensionRatings, setDimensionRatings] = useState({});
  // Private feedback (frontend-only) stored in localStorage — not sent to backend
  const [privateFeedback, setPrivateFeedback] = useState("");

  // State for UI
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [reviewableUsers, setReviewableUsers] = useState([]);
  const [allUsersWithStatus, setAllUsersWithStatus] = useState([]);

  // Get reviewable users when modal opens
  useEffect(() => {
    if (open && task && currentUser) {
      console.log("RatingReviewModal opened with:", {
        taskId: task.id,
        taskStatus: task.status,
        currentUserId: currentUser.id,
        currentUserName: currentUser.name,
        taskCreator: task.creator,
      });

      // Fetch all users with their review status
      const fetchUsersWithStatus = async () => {
        try {
          const allUsersWithStatus = await getAllRevieweesWithStatus(
            task,
            currentUser
          );
          console.log("All users with status:", allUsersWithStatus);
          setAllUsersWithStatus(allUsersWithStatus);

          // Filter to get only unreviewed users
          const unreviewedUsers = allUsersWithStatus.filter(
            (user) => !user.reviewed
          );
          console.log("Unreviewed users:", unreviewedUsers);
          setReviewableUsers(unreviewedUsers);

          // Auto-select if only one user can be reviewed
          if (unreviewedUsers.length === 1) {
            console.log(
              "Auto-selecting single unreviewed user:",
              unreviewedUsers[0]
            );
            setSelectedUser(unreviewedUsers[0]);
          } else if (
            unreviewedUsers.length === 0 &&
            allUsersWithStatus.length > 0
          ) {
            console.log("All users have been reviewed");
            setError("All users for this task have already been reviewed.");
          } else if (allUsersWithStatus.length === 0) {
            console.log("No users available to review");
            setError("No users available to review for this task.");
          }
        } catch (err) {
          console.error("Error fetching users with status:", err);

          // Fallback to old method
          console.log("Falling back to old getReviewableUsersAsync method");
          try {
            const users = await getReviewableUsersAsync(task, currentUser);
            console.log("Fallback reviewable users found:", users);

            setReviewableUsers(users);
            setAllUsersWithStatus(
              users.map((user) => ({ ...user, reviewed: false }))
            );

            // Auto-select if only one user can be reviewed
            if (users.length === 1) {
              console.log("Auto-selecting single fallback user:", users[0]);
              setSelectedUser(users[0]);
            } else if (users.length === 0) {
              console.error("No reviewable users found!");
              setError("No users available to review for this task.");
            }
          } catch (fallbackErr) {
            console.error("Fallback method also failed:", fallbackErr);
            setError("Could not load reviewable users. Please try again.");
          }
        }
      };

      fetchUsersWithStatus();
    }
  }, [open, task, currentUser]);

  // Reset form when modal closes
  useEffect(() => {
    if (!open) {
      setSelectedUser(null);
      setRating(3.0);
      setComment("");
      setDimensionRatings({});
      setPrivateFeedback("");
      setError(null);
      setSuccess(false);
      setLoading(false);
      setReviewableUsers([]);
      setAllUsersWithStatus([]);
    }
  }, [open]);

  // Handle form submission
  const handleSubmit = async () => {
    if (!selectedUser || !task) {
      setError("Please select a user to review");
      return;
    }

    // Validate that comment is not empty
    const publicComment = comment?.trim() ?? "";
    if (!publicComment) {
      setError("Please write a review comment. Your feedback is valuable!");
      return;
    }

    // Build score: if per-dimension ratings provided, average them; otherwise fall back to single rating
    let finalScore = null;
    const dims = Object.values(dimensionRatings || {});
    if (dims.length > 0) {
      const sum = dims.reduce((s, v) => s + Number(v || 0), 0);
      finalScore = Math.max(1, Math.min(5, sum / dims.length));
    } else {
      finalScore = Math.max(1, Math.min(5, Number(rating || 3)));
    }

    try {
      setLoading(true);
      setError(null);

      console.log("Submitting review (frontend-aggregated):", {
        taskId: task.id,
        selectedUserId: selectedUser.id,
        selectedUserName: getUserFullName(selectedUser),
        finalScore,
        publicComment,
        dimensionRatings,
        privateFeedbackNote: !!privateFeedback,
      });

      // Submit aggregated score and public comment to backend
      await submitReview(task.id, selectedUser.id, finalScore, publicComment);

      // Save private feedback locally (frontend-only) keyed by task and users
      if (privateFeedback && privateFeedback.trim()) {
        try {
          const key = `privateFeedback:task:${task.id}:reviewer:${currentUser.id}:reviewee:${selectedUser.id}`;
          const payload = {
            taskId: task.id,
            reviewerId: currentUser.id,
            revieweeId: selectedUser.id,
            feedback: privateFeedback.trim(),
            timestamp: new Date().toISOString(),
          };
          localStorage.setItem(key, JSON.stringify(payload));
          console.log("Saved private feedback to localStorage", key);
        } catch (lsErr) {
          console.warn("Could not save private feedback locally:", lsErr);
        }
      }

      setSuccess(true);

      // Mark the user as reviewed in our local state
      setAllUsersWithStatus((prevUsers) =>
        prevUsers.map((user) =>
          user.id === selectedUser.id ? { ...user, reviewed: true } : user
        )
      );

      // Update reviewable users to exclude the newly reviewed user
      setReviewableUsers((prevUsers) =>
        prevUsers.filter((user) => user.id !== selectedUser.id)
      );

      // Clear selected user and form fields
      const reviewed = selectedUser;
      setSelectedUser(null);
      setRating(3.0);
      setComment("");
      setDimensionRatings({});
      setPrivateFeedback("");

      // Call success callback if provided
      if (onSubmitSuccess) {
        onSubmitSuccess(reviewed, finalScore, publicComment);
      }

      // Show success briefly then reset
      setTimeout(() => {
        setSuccess(false);

        const remainingUsers = allUsersWithStatus.filter(
          (user) => user.id !== reviewed.id && !user.reviewed
        );
        if (remainingUsers.length === 0) {
          // Close the modal after all users have been reviewed
          onClose();
        } else {
          // Auto-select next user if available
          const nextUser = remainingUsers[0];
          if (nextUser) {
            setSelectedUser(nextUser);
          }
        }
      }, 1500);
    } catch (err) {
      console.error("Error submitting review (aggregated):", err);
      const errorMessage =
        err.response?.data?.message ||
        err.response?.data?.error ||
        (err.response?.data?.errors &&
          Object.values(err.response.data.errors).flat().join(", ")) ||
        err.message ||
        "Failed to submit review. Please try again.";

      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Get user initials for avatar
  const getUserInitials = (user) => {
    if (!user) return "?";
    const firstName = user.name || "";
    const lastName = user.surname || "";
    return (firstName.charAt(0) + lastName.charAt(0)).toUpperCase();
  };

  // Get user full name
  const getUserFullName = (user) => {
    if (!user) return "Unknown User";
    const firstName = user.name || "";
    const lastName = user.surname || "";
    return `${firstName} ${lastName}`.trim() || "Unknown User";
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      aria-labelledby="rating-review-title"
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
      <DialogTitle id="rating-review-title" sx={{ pb: 1, pr: 6 }}>
        <Typography variant="h6" component="div" sx={{ fontWeight: 600 }}>
          Rate & Review
        </Typography>
        <IconButton
          onClick={onClose}
          sx={{
            position: "absolute",
            right: 8,
            top: 8,
            color: "text.secondary",
          }}
          aria-label="Close"
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ pt: 1 }}>
        {/* Success Message */}
        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            Review submitted successfully!
          </Alert>
        )}

        {/* Error Message */}
        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {/* User Selection */}
        {allUsersWithStatus.length > 1 && (
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 500 }}>
              Select User to Review
            </Typography>
            <FormControl fullWidth>
              <Select
                value={selectedUser?.id || ""}
                onChange={(e) => {
                  const user = allUsersWithStatus.find(
                    (u) => u.id === e.target.value && !u.reviewed
                  );
                  setSelectedUser(user);
                }}
                displayEmpty
                aria-label="Select user to review"
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "8px",
                  },
                }}
              >
                <MenuItem value="" disabled>
                  <Typography color="text.secondary">
                    Choose a user to review
                  </Typography>
                </MenuItem>
                {allUsersWithStatus.map((user) => (
                  <MenuItem
                    key={user.id}
                    value={user.reviewed ? "" : user.id}
                    disabled={user.reviewed}
                    sx={{
                      opacity: user.reviewed ? 0.6 : 1,
                    }}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1.5,
                        width: "100%",
                        justifyContent: "space-between",
                      }}
                    >
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 1.5 }}
                      >
                        <Avatar
                          sx={{
                            width: 32,
                            height: 32,
                            bgcolor: user.reviewed
                              ? "grey.400"
                              : "primary.main",
                            fontSize: "0.8rem",
                          }}
                        >
                          {getUserInitials(user)}
                        </Avatar>
                        <Box>
                          <Typography variant="body2">
                            {getUserFullName(user)}
                          </Typography>
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 1,
                            }}
                          >
                            <Chip
                              label={
                                user.role === "volunteer"
                                  ? "Volunteer"
                                  : "Requester"
                              }
                              size="small"
                              color={
                                user.role === "volunteer"
                                  ? "success"
                                  : "primary"
                              }
                              sx={{ height: 20, fontSize: "0.7rem" }}
                            />
                          </Box>
                        </Box>
                      </Box>
                      {user.reviewed && (
                        <Chip
                          label="Reviewed"
                          size="small"
                          color="default"
                          variant="outlined"
                          sx={{
                            height: 20,
                            fontSize: "0.7rem",
                            color: "text.secondary",
                          }}
                        />
                      )}
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        )}

        {/* Selected User Display (for single user or after selection) */}
        {selectedUser && (
          <Box sx={{ mb: 3, p: 2, bgcolor: "grey.50", borderRadius: 2 }}>
            <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 500 }}>
              Reviewing
            </Typography>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
              <Avatar
                sx={{
                  width: 40,
                  height: 40,
                  bgcolor: "primary.main",
                }}
              >
                {getUserInitials(selectedUser)}
              </Avatar>
              <Box>
                <Typography variant="body1" sx={{ fontWeight: 500 }}>
                  {getUserFullName(selectedUser)}
                </Typography>
                <Chip
                  label={
                    selectedUser.role === "volunteer"
                      ? "Volunteer"
                      : "Requester"
                  }
                  size="small"
                  color={
                    selectedUser.role === "volunteer" ? "success" : "primary"
                  }
                  sx={{ height: 20, fontSize: "0.7rem" }}
                />
              </Box>
            </Box>
          </Box>
        )}

        {/* Rating / Per-dimension Ratings */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 500 }}>
            Rating
          </Typography>

          {selectedUser ? (
            (() => {
              // Define dimensions depending on role
              const dims =
                selectedUser.role === "volunteer"
                  ? [
                      {
                        key: "reliability",
                        label: "Reliability",
                        hint: "Did the volunteer arrive at the agreed-upon time?",
                      },
                      {
                        key: "task_completion",
                        label: "Task Completion",
                        hint: "Did the volunteer complete the task?",
                      },
                      {
                        key: "communication",
                        label: "Communication",
                        hint: "How clear and polite was the volunteer's communication?",
                      },
                      {
                        key: "safety",
                        label: "Safety & Respect",
                        hint: "Did you feel safe and respected during the interaction?",
                      },
                    ]
                  : [
                      {
                        key: "accuracy",
                        label: "Accuracy of Request",
                        hint: "Was the task as described in the post?",
                      },
                      {
                        key: "communication",
                        label: "Communication",
                        hint: "Was the requester easy to communicate with?",
                      },
                      {
                        key: "safety",
                        label: "Safety & Preparedness",
                        hint: "Did you feel safe at the location? Was the requester prepared for your arrival?",
                      },
                    ];

              return (
                <Box>
                  {dims.map((d) => (
                    <Box key={d.key} sx={{ mb: 2 }}>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {d.label}
                      </Typography>
                      <Typography
                        variant="caption"
                        sx={{
                          display: "block",
                          color: "text.secondary",
                          mb: 1,
                        }}
                      >
                        {d.hint}
                      </Typography>
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 2 }}
                      >
                        <Rating
                          name={`dim-${d.key}`}
                          value={Number(dimensionRatings[d.key] ?? 3)}
                          precision={1}
                          onChange={(e, v) => {
                            setDimensionRatings((prev) => ({
                              ...prev,
                              [d.key]: v,
                            }));
                          }}
                        />
                        <Typography variant="body2">
                          {Number(dimensionRatings[d.key] ?? 3)} / 5
                        </Typography>
                      </Box>
                    </Box>
                  ))}
                  <Box sx={{ mt: 1 }}>
                    <Typography
                      variant="caption"
                      sx={{ color: "text.secondary" }}
                    >
                      The final score will be the average of the selected
                      categories.
                    </Typography>
                  </Box>
                </Box>
              );
            })()
          ) : (
            <Box sx={{ display: "flex", justifyContent: "center", mb: 1 }}>
              <Rating
                name="user-rating"
                value={rating}
                precision={0.5}
                onChange={(event, newValue) => {
                  if (newValue !== null) {
                    setRating(newValue);
                  }
                }}
                icon={<StarIcon fontSize="large" />}
                emptyIcon={<StarIcon fontSize="large" />}
                sx={{
                  fontSize: "2.5rem",
                  "& .MuiRating-iconFilled": {
                    color: "#E15B97",
                  },
                  "& .MuiRating-iconEmpty": {
                    color: "#E0E0E0",
                  },
                }}
              />
            </Box>
          )}
        </Box>

        {/* Comment */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 500 }}>
            Review Comment <span style={{ color: "#E15B97" }}>*</span>
          </Typography>
          <TextField
            multiline
            rows={4}
            fullWidth
            required
            placeholder="Share your experience working with this person..."
            value={comment}
            onChange={(e) => {
              setComment(e.target.value);
              // Clear error when user starts typing
              if (error && error.includes("review comment")) {
                setError(null);
              }
            }}
            variant="outlined"
            error={error && error.includes("review comment")}
            helperText={error && error.includes("review comment") ? error : ""}
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: "8px",
              },
            }}
          />
        </Box>

        {/* Submit Button */}
        <Button
          fullWidth
          variant="contained"
          onClick={() => {
            console.log("Submit button clicked with state:", {
              selectedUser: selectedUser,
              loading: loading,
              success: success,
              rating: rating,
              comment: comment,
              buttonDisabled: !selectedUser || loading || success,
            });
            handleSubmit();
          }}
          disabled={!selectedUser || loading || success}
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
              Submitting Review...
            </Box>
          ) : success ? (
            "Review Submitted!"
          ) : (
            "Submit Review"
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
          Reviews help build trust in our community
        </Typography>
      </DialogContent>
    </Dialog>
  );
};

export default RatingReviewModal;
