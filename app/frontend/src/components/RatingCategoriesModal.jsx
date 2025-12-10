import React from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  Box,
  Typography,
  IconButton,
  Rating,
  Divider,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { useTranslation } from "react-i18next";
import { useTheme } from "../hooks/useTheme";

/**
 * RatingCategoriesModal Component
 * Displays detailed rating breakdown by categories for volunteers and requesters
 */
const RatingCategoriesModal = ({ open, onClose, user, role = "volunteer" }) => {
  const { t } = useTranslation();
  const { colors } = useTheme();

  // Define all 7 rating dimensions from Review interface
  const allCategories = [
    // Requester -> Volunteer ratings (when user is volunteer)
    {
      key: "reliability",
      labelKey: "ratingCategoriesModal.reliability",
      descriptionKey: "ratingCategoriesModal.reliabilityDesc",
      section: "As Volunteer",
    },
    {
      key: "task_completion",
      labelKey: "ratingCategoriesModal.taskCompletion",
      descriptionKey: "ratingCategoriesModal.taskCompletionDesc",
      section: "As Volunteer",
    },
    {
      key: "communication_requester_to_volunteer",
      labelKey: "ratingCategoriesModal.communicationFromRequesters",
      descriptionKey: "ratingCategoriesModal.communicationFromRequestersDesc",
      section: "As Volunteer",
    },
    {
      key: "safety_and_respect",
      labelKey: "ratingCategoriesModal.safetyAndRespect",
      descriptionKey: "ratingCategoriesModal.safetyAndRespectDesc",
      section: "As Volunteer",
    },
    // Volunteer -> Requester ratings (when user is requester)
    {
      key: "accuracy_of_request",
      labelKey: "ratingCategoriesModal.accuracyOfRequest",
      descriptionKey: "ratingCategoriesModal.accuracyOfRequestDesc",
      section: "As Requester",
    },
    {
      key: "communication_volunteer_to_requester",
      labelKey: "ratingCategoriesModal.communicationFromVolunteers",
      descriptionKey: "ratingCategoriesModal.communicationFromVolunteersDesc",
      section: "As Requester",
    },
    {
      key: "safety_and_preparedness",
      labelKey: "ratingCategoriesModal.safetyAndPreparedness",
      descriptionKey: "ratingCategoriesModal.safetyAndPreparednessDesc",
      section: "As Requester",
    },
  ];

  // Get rating value for a category
  const getCategoryRating = (categoryKey) => {
    // Try to get from user's rating breakdown if available
    let rating = 0;
    if (user?.rating_breakdown && user.rating_breakdown[categoryKey] != null) {
      rating = user.rating_breakdown[categoryKey];
    }
    // Round to 1 decimal place
    return Math.round(rating * 10) / 10;
  };

  // Calculate overall rating from all available dimensions
  const calculateOverallRating = () => {
    let rating = 0;
    if (user?.rating_breakdown) {
      const values = allCategories
        .map((cat) => user.rating_breakdown[cat.key])
        .filter((val) => val != null && val > 0);
      if (values.length > 0) {
        rating = values.reduce((sum, val) => sum + val, 0) / values.length;
      }
    } else {
      rating = user?.rating || 0;
    }
    // Round to 1 decimal place
    return Math.round(rating * 10) / 10;
  };

  const overallRating = calculateOverallRating();

  // Group categories by section (As Volunteer / As Requester)
  const volunteerCategories = allCategories.filter(
    (cat) => cat.section === "As Volunteer"
  );
  const requesterCategories = allCategories.filter(
    (cat) => cat.section === "As Requester"
  );

  return (
    <Dialog
      open={open}
      onClose={onClose}
      aria-labelledby="rating-categories-title"
      PaperProps={{
        sx: {
          borderRadius: "16px",
          width: "450px",
          maxWidth: "calc(100% - 32px)",
          margin: "16px auto",
          backgroundColor: colors.background.secondary,
        },
      }}
    >
      {/* Header */}
      <DialogTitle
        id="rating-categories-title"
        sx={{ pb: 1, pr: 6, color: colors.text.primary }}
      >
        <Typography variant="h6" component="div" sx={{ fontWeight: 600 }}>
          {t("ratingCategoriesModal.title")}
        </Typography>
        <IconButton
          onClick={onClose}
          sx={{
            position: "absolute",
            right: 8,
            top: 8,
            color: colors.text.secondary,
          }}
          aria-label={t("ratingCategoriesModal.close")}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ pt: 2, pb: 3 }}>
        {/* Overall Rating Section */}
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            mb: 3,
            p: 2,
            backgroundColor: colors.background.elevated,
            borderRadius: 2,
            border: `1px solid ${colors.border.primary}`,
          }}
        >
          <Typography
            variant="subtitle2"
            sx={{ mb: 1, color: colors.text.secondary }}
          >
            {t("ratingCategoriesModal.overallRating")}
          </Typography>
          <Typography
            variant="h2"
            sx={{ fontWeight: 700, color: colors.brand.primary, mb: 1 }}
          >
            {overallRating.toFixed(1)}
          </Typography>
          <Rating
            value={overallRating}
            precision={0.1}
            readOnly
            size="large"
            sx={{
              "& .MuiRating-iconFilled": {
                color: colors.semantic.warning,
              },
              "& .MuiRating-iconEmpty": {
                color: colors.border.secondary,
              },
            }}
          />
          <Typography
            variant="caption"
            sx={{ mt: 1, color: colors.text.secondary }}
          >
            {t("ratingCategoriesModal.basedOnReviews", {
              count: user?.reviewCount || 0,
            })}
          </Typography>
        </Box>

        <Divider sx={{ mb: 3, borderColor: colors.border.secondary }} />

        {/* All 7 Rating Dimensions */}

        {/* As Volunteer Section */}
        {volunteerCategories.some((cat) => getCategoryRating(cat.key) > 0) && (
          <>
            <Typography
              variant="subtitle2"
              sx={{ mb: 2, fontWeight: 600, color: colors.text.primary }}
            >
              {t("ratingCategoriesModal.performanceAsVolunteer")}
            </Typography>

            <Box
              sx={{ display: "flex", flexDirection: "column", gap: 2.5, mb: 3 }}
            >
              {volunteerCategories.map((category) => {
                const categoryRating = getCategoryRating(category.key);
                if (categoryRating === 0) return null; // Skip if no rating
                return (
                  <Box key={category.key}>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                        mb: 0.5,
                      }}
                    >
                      <Box sx={{ flex: 1 }}>
                        <Typography
                          variant="body2"
                          sx={{ fontWeight: 600, color: colors.text.primary }}
                        >
                          {t(category.labelKey)}
                        </Typography>
                        <Typography
                          variant="caption"
                          sx={{ color: colors.text.secondary }}
                        >
                          {t(category.descriptionKey)}
                        </Typography>
                      </Box>
                      <Typography
                        variant="body1"
                        sx={{
                          fontWeight: 700,
                          color: colors.brand.primary,
                          minWidth: "40px",
                          textAlign: "right",
                        }}
                      >
                        {categoryRating.toFixed(1)}
                      </Typography>
                    </Box>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <Rating
                        value={categoryRating}
                        precision={0.1}
                        readOnly
                        size="small"
                        sx={{
                          "& .MuiRating-iconFilled": {
                            color: colors.semantic.warning,
                          },
                          "& .MuiRating-iconEmpty": {
                            color: colors.border.secondary,
                          },
                        }}
                      />
                    </Box>
                  </Box>
                );
              })}
            </Box>
          </>
        )}

        {/* As Requester Section */}
        {requesterCategories.some((cat) => getCategoryRating(cat.key) > 0) && (
          <>
            <Typography
              variant="subtitle2"
              sx={{ mb: 2, fontWeight: 600, color: colors.text.primary }}
            >
              {t("ratingCategoriesModal.performanceAsRequester")}
            </Typography>

            <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
              {requesterCategories.map((category) => {
                const categoryRating = getCategoryRating(category.key);
                if (categoryRating === 0) return null; // Skip if no rating
                return (
                  <Box key={category.key}>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                        mb: 0.5,
                      }}
                    >
                      <Box sx={{ flex: 1 }}>
                        <Typography
                          variant="body2"
                          sx={{ fontWeight: 600, color: colors.text.primary }}
                        >
                          {t(category.labelKey)}
                        </Typography>
                        <Typography
                          variant="caption"
                          sx={{ color: colors.text.secondary }}
                        >
                          {t(category.descriptionKey)}
                        </Typography>
                      </Box>
                      <Typography
                        variant="body1"
                        sx={{
                          fontWeight: 700,
                          color: colors.brand.primary,
                          minWidth: "40px",
                          textAlign: "right",
                        }}
                      >
                        {categoryRating.toFixed(1)}
                      </Typography>
                    </Box>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <Rating
                        value={categoryRating}
                        precision={0.1}
                        readOnly
                        size="small"
                        sx={{
                          "& .MuiRating-iconFilled": {
                            color: colors.semantic.warning,
                          },
                          "& .MuiRating-iconEmpty": {
                            color: colors.border.secondary,
                          },
                        }}
                      />
                    </Box>
                  </Box>
                );
              })}
            </Box>
          </>
        )}

        {/* Info Text */}
        <Typography
          variant="caption"
          sx={{
            display: "block",
            textAlign: "center",
            mt: 3,
            color: colors.text.secondary,
            fontStyle: "italic",
          }}
        >
          {t("ratingCategoriesModal.categoryRatingsInfo")}
        </Typography>
      </DialogContent>
    </Dialog>
  );
};

export default RatingCategoriesModal;
