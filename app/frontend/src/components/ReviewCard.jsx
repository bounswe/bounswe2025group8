import React from "react";
import { Box, Typography, Avatar, Rating, Paper } from "@mui/material";
import { formatDate } from "../utils/dateUtils";
import { useTheme } from "../hooks/useTheme";
import { toAbsoluteUrl } from "../utils/url";

const ReviewCard = ({ review }) => {
  const { colors } = useTheme();
  const reviewerPhoto =
    toAbsoluteUrl(
      review.reviewer?.profile_photo ||
        review.reviewer?.profilePhoto ||
        review.reviewer?.profilePicture ||
        review.reviewer?.photo ||
        review.reviewer?.avatar
    ) ||
    `https://randomuser.me/api/portraits/men/${Math.floor(
      Math.random() * 100
    )}.jpg`;

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
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Avatar
            src={reviewerPhoto}
            alt={review.reviewer?.name || "User"}
            sx={{
              border: `2px solid ${colors.border.primary}`,
            }}
          />
          <Box>
            <Typography
              variant="subtitle2"
              fontWeight="bold"
              sx={{ color: colors.text.primary }}
            >
              {review.reviewer?.name || "Anonymous User"}
            </Typography>
            <Rating
              value={review.score || 0}
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
        <Typography variant="caption" sx={{ color: colors.text.secondary }}>
          {review.timestamp ? formatDate(review.timestamp) : "N/A"}
        </Typography>
      </Box>
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
