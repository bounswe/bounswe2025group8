import React from "react";
import { Box, Typography, Avatar, Rating, Paper, Chip } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { formatDate } from "../utils/dateUtils";
import { useTheme } from "../hooks/useTheme";
import { toAbsoluteUrl } from "../utils/url";

const ReviewCard = ({ review }) => {
  const { colors } = useTheme();
  const navigate = useNavigate();

  // Get reviewer photo using the same pattern as Sidebar
  const reviewerPhoto = toAbsoluteUrl(
    review.reviewer?.profile_photo ||
      review.reviewer?.profilePhoto ||
      review.reviewer?.profilePicture ||
      review.reviewer?.avatar
  );

  // Get initials for fallback avatar
  const getInitials = () => {
    const name = review.reviewer?.name || "";
    const surname = review.reviewer?.surname || "";

    if (name && surname) {
      return `${name.charAt(0)}${surname.charAt(0)}`.toUpperCase();
    } else if (name) {
      return name.charAt(0).toUpperCase();
    } else if (review.reviewer?.username) {
      return review.reviewer.username.charAt(0).toUpperCase();
    }
    return "?";
  };

  const handleProfileClick = () => {
    if (review.reviewer?.id) {
      navigate(`/profile/${review.reviewer.id}`);
    }
  };

  // Define categories based on reviewee role
  const getCategories = () => {
    const role = review.reviewee_role || review.role || "volunteer";

    if (role === "volunteer") {
      return [
        { key: "reliability", label: "Reliability" },
        { key: "task_completion", label: "Task Completion" },
        { key: "communication", label: "Communication" },
        { key: "safety", label: "Safety & Respect" },
      ];
    } else {
      return [
        { key: "accuracy", label: "Accuracy" },
        { key: "communication", label: "Communication" },
        { key: "safety", label: "Safety & Preparedness" },
      ];
    }
  };

  // Get rating for a category with proper rounding to 1 decimal
  const getCategoryRating = (categoryKey) => {
    const rating = review.rating_breakdown?.[categoryKey] || review.score || 0;
    return Math.round(rating * 10) / 10;
  };

  const categories = getCategories();

  return (
    <Paper
      elevation={0}
      sx={{
        p: 2,
        mb: 2,
        borderRadius: 2,
        border: `1px solid ${colors.border.primary}`,
        backgroundColor: colors.background.elevated,
      }}
    >
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          mb: 1,
        }}
      >
        {/* Left side: Avatar and Name */}
        <Box
          sx={{
            display: "flex",
            alignItems: "flex-start",
            gap: 1.5,
            cursor: review.reviewer?.id ? "pointer" : "default",
            "&:hover": review.reviewer?.id
              ? {
                  opacity: 0.8,
                }
              : {},
            minWidth: "fit-content",
          }}
          onClick={handleProfileClick}
        >
          <Avatar
            src={reviewerPhoto || undefined}
            alt={review.reviewer?.name || "User"}
            sx={{
              border: `2px solid ${colors.border.primary}`,
              width: 40,
              height: 40,
              backgroundColor: !reviewerPhoto
                ? colors.brand.primary
                : undefined,
              color: !reviewerPhoto ? colors.text.inverse : undefined,
            }}
          >
            {!reviewerPhoto && getInitials()}
          </Avatar>
          <Box>
            <Typography
              variant="subtitle2"
              fontWeight="bold"
              sx={{
                color: colors.text.primary,
                "&:hover": review.reviewer?.id
                  ? {
                      textDecoration: "underline",
                    }
                  : {},
              }}
            >
              {review.reviewer?.name || "Anonymous User"}
            </Typography>
          </Box>
        </Box>

        {/* Center: Rating Categories */}
        <Box
          sx={{
            display: "flex",
            flexWrap: "wrap",
            gap: 1.5,
            flex: 1,
            mx: 2,
            alignItems: "center",
          }}
        >
          {categories.map((category) => {
            const rating = getCategoryRating(category.key);
            return (
              <Box
                key={category.key}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 0.5,
                }}
              >
                <Typography
                  variant="caption"
                  sx={{
                    color: colors.text.secondary,
                    fontWeight: 500,
                    whiteSpace: "nowrap",
                  }}
                >
                  {category.label}:
                </Typography>
                <Rating
                  value={rating}
                  readOnly
                  size="small"
                  precision={0.5}
                  sx={{
                    "& .MuiRating-iconFilled": {
                      color: colors.semantic.warning,
                    },
                    "& .MuiRating-iconEmpty": {
                      color: colors.border.secondary,
                    },
                    "& .MuiRating-icon": {
                      fontSize: "1rem",
                    },
                  }}
                />
                <Typography
                  variant="caption"
                  sx={{
                    color: colors.text.secondary,
                    fontWeight: 600,
                  }}
                >
                  {rating.toFixed(1)}
                </Typography>
              </Box>
            );
          })}
        </Box>

        {/* Right side: Date */}
        <Typography
          variant="caption"
          sx={{
            color: colors.text.secondary,
            whiteSpace: "nowrap",
            minWidth: "fit-content",
          }}
        >
          {review.timestamp ? formatDate(review.timestamp) : "N/A"}
        </Typography>
      </Box>

      {/* Comment section below */}
      <Typography
        variant="body2"
        sx={{
          mt: 1,
          color: colors.text.primary,
        }}
      >
        {review.comment || "No comment provided"}
      </Typography>
    </Paper>
  );
};

export default ReviewCard;
