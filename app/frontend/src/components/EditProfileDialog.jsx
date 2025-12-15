import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Typography,
  CircularProgress,
  Avatar,
  IconButton,
  Grid,
} from "@mui/material";
import { Close, PhotoCamera } from "@mui/icons-material";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import {
  updateUserProfile,
  uploadProfilePicture,
  fetchCurrentUserProfile,
  clearError,
  clearSuccess,
  selectIsUpdating,
  selectIsUploading,
  selectError,
  selectValidationErrors,
  selectUpdateSuccess,
  selectUser,
  selectUploadSuccess,
} from "../features/profile/store/editProfileSlice";
import { updateUserProfile as updateAuthUser } from "../features/authentication/store/authSlice";
import { useTheme } from "../hooks/useTheme";
import { toAbsoluteUrl } from "../utils/url";

const EditProfileDialog = ({ open, onClose, onSuccess, user }) => {
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const { colors } = useTheme();

  // Use the new editProfile selectors
  const updating = useSelector(selectIsUpdating);
  const uploading = useSelector(selectIsUploading);
  const error = useSelector(selectError);
  const validationErrors = useSelector(selectValidationErrors);
  const updateSuccess = useSelector(selectUpdateSuccess);
  const editProfileUser = useSelector(selectUser);
  const uploadSuccess = useSelector(selectUploadSuccess);

  const loading = updating || uploading;
  const MAX_PHOTO_SIZE_BYTES = 5 * 1024 * 1024; // 5MB

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    surname: "",
    username: "",
    email: "",
    phone: "",
  });
  const [photoPreview, setPhotoPreview] = useState(null);
  const [selectedPhotoFile, setSelectedPhotoFile] = useState(null);
  const [photoError, setPhotoError] = useState(null);

  // Fetch current user profile when dialog opens
  useEffect(() => {
    if (open) {
      dispatch(fetchCurrentUserProfile());
    }
  }, [open, dispatch]);

  // Initialize form with user data from editProfile slice or props
  useEffect(() => {
    const userData =
      editProfileUser && Object.keys(editProfileUser).length > 0
        ? editProfileUser
        : user;

    if (userData && open) {
      console.log(
        "EditProfileDialog - User data source:",
        editProfileUser && Object.keys(editProfileUser).length > 0
          ? "editProfile slice"
          : "props"
      );
      console.log("EditProfileDialog - User data:", userData);
      console.log("EditProfileDialog - Phone number:", userData.phone);
      console.log("EditProfileDialog - All user keys:", Object.keys(userData));

      setFormData({
        name: userData.name || "",
        surname: userData.surname || "",
        username: userData.username || "",
        email: userData.email || "",
        phone: userData.phone || userData.phone_number || "",
      });
    }
  }, [user, editProfileUser, open]);

  // Clear local photo preview when the source photo changes or dialog closes
  useEffect(() => {
    if (!open) {
      if (photoPreview) {
        URL.revokeObjectURL(photoPreview);
      }
      setPhotoPreview(null);
      setSelectedPhotoFile(null);
      setPhotoError(null);
      return;
    }

    const latestPhoto =
      editProfileUser?.profile_photo ||
      editProfileUser?.profilePhoto ||
      editProfileUser?.profilePicture;
    if (latestPhoto && photoPreview) {
      URL.revokeObjectURL(photoPreview);
      setPhotoPreview(null);
      setSelectedPhotoFile(null);
      setPhotoError(null);
    }
  }, [
    open,
    photoPreview,
    editProfileUser?.profile_photo,
    editProfileUser?.profilePhoto,
    editProfileUser?.profilePicture,
  ]);

  // Close dialog when update is successful
  useEffect(() => {
    if (updateSuccess) {
      // Update the auth slice with the new user data to update sidebar immediately
      const updatedUserData = {
        name: formData.name,
        surname: formData.surname,
        username: formData.username,
        // Keep existing email and phone as they are read-only
      };

      console.log(
        "EditProfileDialog - Updating auth user with:",
        updatedUserData
      );
      console.log(
        "EditProfileDialog - Current auth user before update:",
        editProfileUser
      );
      dispatch(updateAuthUser(updatedUserData));
      console.log(
        "EditProfileDialog - Auth user updated, sidebar should refresh automatically"
      );
    }
  }, [updateSuccess, onClose, onSuccess, dispatch, formData]);

  // Propagate uploaded profile picture to auth slice and parent
  useEffect(() => {
    if (!uploadSuccess) return;

    const latestPhoto =
      editProfileUser?.profile_photo ||
      editProfileUser?.profilePhoto ||
      editProfileUser?.profilePicture;

    if (latestPhoto) {
      dispatch(
        updateAuthUser({
          profile_photo: latestPhoto,
          profilePhoto: latestPhoto,
          profilePicture: latestPhoto,
        })
      );
    }
  }, [
    uploadSuccess,
    editProfileUser?.profile_photo,
    editProfileUser?.profilePhoto,
    editProfileUser?.profilePicture,
    dispatch,
    onSuccess,
  ]);

  // Clear errors when dialog closes
  useEffect(() => {
    if (!open) {
      dispatch(clearError());
    }
  }, [open, dispatch]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Only send editable fields to the backend
    const editableData = {
      name: formData.name,
      surname: formData.surname,
      username: formData.username,
      // Exclude email and phone as they are read-only
    };

    console.log(
      "EditProfileDialog - Submitting editable data only:",
      editableData
    );
    const tasks = [];
    tasks.push(dispatch(updateUserProfile(editableData)).unwrap());
    if (selectedPhotoFile) {
      tasks.push(dispatch(uploadProfilePicture(selectedPhotoFile)).unwrap());
    }

    try {
      await Promise.all(tasks);
      dispatch(clearSuccess());
      setSelectedPhotoFile(null);
      setPhotoPreview(null);
      if (onSuccess) {
        onSuccess();
      }
      onClose();
    } catch (err) {
      console.error("EditProfileDialog - submit failed:", err);
    }
  };

  const handleProfilePictureUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      if (file.size > MAX_PHOTO_SIZE_BYTES) {
        setPhotoError(t("profilePictureTooLarge"));
        return;
      }
      setPhotoError(null);
      if (photoPreview) {
        URL.revokeObjectURL(photoPreview);
      }
      setSelectedPhotoFile(file);
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  const resolvedUser =
    editProfileUser && Object.keys(editProfileUser).length > 0
      ? editProfileUser
      : user;
  const resolvedPhoto = toAbsoluteUrl(
    photoPreview ||
      resolvedUser?.profile_photo ||
      resolvedUser?.profilePhoto ||
      resolvedUser?.profilePicture
  );

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      aria-labelledby="edit-profile-title"
      PaperProps={{
        sx: {
          borderRadius: 2,
          backgroundColor: colors.background.elevated,
          border: `1px solid ${colors.border.primary}`,
        },
      }}
    >
      <DialogTitle id="edit-profile-title" sx={{ pb: 0 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography
            variant="h6"
            fontWeight="bold"
            sx={{ color: colors.text.primary }}
          >
            {t("editProfileDialog.title")}
          </Typography>
          <IconButton
            onClick={onClose}
            aria-label={t("editProfileDialog.closeDialog")}
            sx={{
              color: colors.text.secondary,
              "&:hover": {
                backgroundColor: colors.interactive.hover,
              },
            }}
          >
            <Close />
          </IconButton>
        </Box>
      </DialogTitle>

      <form onSubmit={handleSubmit}>
        <DialogContent>
          {/* Profile Picture Upload */}
          <Box display="flex" flexDirection="column" alignItems="center" mb={3}>
            <Box position="relative">
              <Avatar
                src={resolvedPhoto}
                alt={
                  resolvedUser?.name ||
                  `${resolvedUser?.name || ""} ${
                    resolvedUser?.surname || ""
                  }` ||
                  "User"
                }
                sx={{
                  width: 100,
                  height: 100,
                  mb: 1,
                  border: `3px solid ${colors.border.primary}`,
                }}
              />
              {uploading && (
                <CircularProgress
                  size={88}
                  sx={{
                    color: colors.brand.primary,
                    position: "absolute",
                    top: 6,
                    left: 6,
                  }}
                />
              )}
              <IconButton
                component="label"
                sx={{
                  position: "absolute",
                  bottom: 0,
                  right: 0,
                  backgroundColor: colors.background.elevated,
                  border: `2px solid ${colors.border.primary}`,
                  boxShadow: colors.shadow.md,
                  "&:hover": {
                    backgroundColor: colors.interactive.hover,
                  },
                  color: colors.brand.primary,
                }}
                aria-label={t("editProfileDialog.uploadProfilePicture")}
              >
                <input
                  type="file"
                  accept="image/*"
                  hidden
                  onChange={handleProfilePictureUpload}
                  aria-label={t("editProfileDialog.chooseProfilePicture")}
                />
                <PhotoCamera />
              </IconButton>
            </Box>
            <Typography variant="caption" sx={{ color: colors.text.secondary }}>
              {t("editProfileDialog.profilePictureClick")}
            </Typography>
            {photoError && (
              <Typography
                variant="caption"
                sx={{
                  mt: 1,
                  color: colors.semantic.error,
                }}
              >
                {photoError}
              </Typography>
            )}
          </Box>

          {/* Error message */}
          {error && (
            <Typography
              variant="body2"
              sx={{
                mb: 2,
                color: colors.semantic.error,
                backgroundColor: `${colors.semantic.error}10`,
                padding: "8px 12px",
                borderRadius: "8px",
                border: `1px solid ${colors.semantic.error}`,
              }}
            >
              {typeof error === "string"
                ? error
                : "An error occurred while updating your profile"}
            </Typography>
          )}

          {/* Validation errors */}
          {validationErrors && (
            <Box sx={{ mb: 2 }}>
              {Object.entries(validationErrors).map(([field, message]) => (
                <Typography
                  key={field}
                  variant="body2"
                  sx={{
                    mb: 1,
                    color: colors.semantic.error,
                    backgroundColor: `${colors.semantic.error}10`,
                    padding: "6px 10px",
                    borderRadius: "6px",
                  }}
                >
                  {typeof message === "string"
                    ? message
                    : t("editProfileDialog.errorUpdatingProfile")}
                </Typography>
              ))}
            </Box>
          )}

          {/* Form Fields */}
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <TextField
                name="name"
                label={t("editProfileDialog.firstName")}
                value={formData.name}
                onChange={handleChange}
                fullWidth
                variant="outlined"
                error={validationErrors?.name}
                helperText={validationErrors?.name}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    backgroundColor: colors.background.secondary,
                    "& fieldset": {
                      borderColor: colors.border.primary,
                    },
                    "&:hover fieldset": {
                      borderColor: colors.border.secondary,
                    },
                    "&.Mui-focused fieldset": {
                      borderColor: colors.brand.primary,
                    },
                  },
                  "& .MuiInputLabel-root": {
                    color: colors.text.secondary,
                  },
                  "& .MuiInputBase-input": {
                    color: colors.text.primary,
                  },
                }}
              />
            </Grid>

            <Grid item xs={6}>
              <TextField
                name="surname"
                label={t("editProfileDialog.lastName")}
                value={formData.surname}
                onChange={handleChange}
                fullWidth
                variant="outlined"
                error={validationErrors?.surname}
                helperText={validationErrors?.surname}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    backgroundColor: colors.background.secondary,
                    "& fieldset": {
                      borderColor: colors.border.primary,
                    },
                    "&:hover fieldset": {
                      borderColor: colors.border.secondary,
                    },
                    "&.Mui-focused fieldset": {
                      borderColor: colors.brand.primary,
                    },
                  },
                  "& .MuiInputLabel-root": {
                    color: colors.text.secondary,
                  },
                  "& .MuiInputBase-input": {
                    color: colors.text.primary,
                  },
                }}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                name="username"
                label={t("username")}
                value={formData.username}
                onChange={handleChange}
                fullWidth
                variant="outlined"
                error={validationErrors?.username}
                helperText={validationErrors?.username}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    backgroundColor: colors.background.secondary,
                    "& fieldset": {
                      borderColor: colors.border.primary,
                    },
                    "&:hover fieldset": {
                      borderColor: colors.border.secondary,
                    },
                    "&.Mui-focused fieldset": {
                      borderColor: colors.brand.primary,
                    },
                  },
                  "& .MuiInputLabel-root": {
                    color: colors.text.secondary,
                  },
                  "& .MuiInputBase-input": {
                    color: colors.text.primary,
                  },
                }}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                name="email"
                label={t("email")}
                value={formData.email}
                fullWidth
                variant="outlined"
                type="email"
                InputProps={{
                  readOnly: true,
                }}
                sx={{
                  "& .MuiInputBase-input": {
                    backgroundColor: colors.background.tertiary,
                    color: colors.text.tertiary,
                  },
                  "& .MuiOutlinedInput-root": {
                    "& fieldset": {
                      borderColor: colors.border.secondary,
                    },
                  },
                  "& .MuiInputLabel-root": {
                    color: colors.text.secondary,
                  },
                  "& .MuiFormHelperText-root": {
                    color: colors.text.tertiary,
                  },
                }}
                helperText={t("editProfileDialog.emailCannotBeChanged")}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                name="phone"
                label={t("editProfileDialog.phoneNumber")}
                value={formData.phone}
                fullWidth
                variant="outlined"
                InputProps={{
                  readOnly: true,
                }}
                sx={{
                  "& .MuiInputBase-input": {
                    backgroundColor: colors.background.tertiary,
                    color: colors.text.tertiary,
                  },
                  "& .MuiOutlinedInput-root": {
                    "& fieldset": {
                      borderColor: colors.border.secondary,
                    },
                  },
                  "& .MuiInputLabel-root": {
                    color: colors.text.secondary,
                  },
                  "& .MuiFormHelperText-root": {
                    color: colors.text.tertiary,
                  },
                }}
                helperText={t("editProfileDialog.phoneCannotBeChanged")}
              />
            </Grid>
          </Grid>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button
            onClick={onClose}
            sx={{
              borderRadius: "20px",
              px: 3,
              color: colors.text.secondary,
              "&:hover": {
                backgroundColor: colors.interactive.hover,
              },
            }}
          >
            {t("cancel")}
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={loading}
            sx={{
              borderRadius: "20px",
              px: 3,
              backgroundColor: colors.brand.primary,
              color: "#FFFFFF",
              "&:hover": {
                backgroundColor: colors.brand.primaryHover,
              },
              "&:disabled": {
                backgroundColor: colors.interactive.disabled,
                color: colors.text.tertiary,
              },
            }}
          >
            {loading ? (
              <CircularProgress size={24} sx={{ color: colors.text.inverse }} />
            ) : (
              t("editProfileDialog.saveChanges")
            )}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default EditProfileDialog;
