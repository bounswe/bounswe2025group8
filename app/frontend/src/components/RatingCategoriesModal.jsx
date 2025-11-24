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
import { useTheme } from "../hooks/useTheme";

/**
 * RatingCategoriesModal Component
 * Displays detailed rating breakdown by categories for volunteers and requesters
 */
const RatingCategoriesModal = ({ open, onClose, user, role = "volunteer" }) => {
  const { colors } = useTheme();

  // Define categories for volunteers
  const volunteerCategories = [
    {
      key: "reliability",
      label: "Reliability",
      description: "Arrives at agreed-upon time",
    },
    {
      key: "task_completion",
      label: "Task Completion",
      description: "Completes assigned tasks",
    },
    {
      key: "communication",
      label: "Communication",
      description: "Clear and polite communication",
    },
    {
      key: "safety",
      label: "Safety & Respect",
      description: "Respectful and safe interactions",
    },
  ];

  // Define categories for requesters
  const requesterCategories = [
    {
      key: "accuracy",
      label: "Accuracy of Request",
      description: "Task matches description",
    },
    {
      key: "communication",
      label: "Communication",
      description: "Easy to communicate with",
    },
    {
      key: "safety",
      label: "Safety & Preparedness",
      description: "Safe location and prepared",
    },
  ];

  // Choose categories based on role
  const categories =
    role === "volunteer" ? volunteerCategories : requesterCategories;

  // Get rating value for a category (with fallback to overall rating)
  const getCategoryRating = (categoryKey) => {
    // Try to get from user's rating breakdown if available
    if (user?.rating_breakdown && user.rating_breakdown[categoryKey]) {
      return user.rating_breakdown[categoryKey];
    }
    // Fallback to overall rating
    return user?.rating || 0;
  };

  // Calculate overall average from categories
  const calculateOverallRating = () => {
    if (user?.rating_breakdown) {
      const values = categories
        .map((cat) => user.rating_breakdown[cat.key])
        .filter((val) => val != null);
      if (values.length > 0) {
        return values.reduce((sum, val) => sum + val, 0) / values.length;
      }
    }
    return user?.rating || 0;
  };

  const overallRating = calculateOverallRating();

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
          Rating Breakdown
        </Typography>
        <IconButton
          onClick={onClose}
          sx={{
            position: "absolute",
            right: 8,
            top: 8,
            color: colors.text.secondary,
          }}
          aria-label="Close"
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
            Overall Rating
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
            Based on {user?.reviewCount || 0} reviews
          </Typography>
        </Box>

        <Divider sx={{ mb: 3, borderColor: colors.border.secondary }} />

        {/* Category Ratings */}
        <Typography
          variant="subtitle2"
          sx={{ mb: 2, fontWeight: 600, color: colors.text.primary }}
        >
          {role === "volunteer" ? "Volunteer" : "Requester"} Performance
        </Typography>

        <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
          {categories.map((category) => {
            const categoryRating = getCategoryRating(category.key);
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
                      {category.label}
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{ color: colors.text.secondary }}
                    >
                      {category.description}
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
          Category ratings are based on individual review feedback
        </Typography>
      </DialogContent>
    </Dialog>
  );
};

export default RatingCategoriesModal;
