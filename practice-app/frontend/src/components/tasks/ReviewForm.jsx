import { useState } from "react";
import {
  Box,
  Typography,
  Rating,
  TextField,
  Button,
  Stack,
  Paper,
  IconButton,
} from "@mui/material";
import {
  Star as StarIcon,
  StarBorder as StarBorderIcon,
} from "@mui/icons-material";

const ReviewForm = ({
  initialRating = 0,
  initialComment = "",
  onSubmit,
  readOnly = false,
  submitLabel = "Submit Review",
  allowEdit = false,
  onEdit = () => {},
}) => {
  const [rating, setRating] = useState(initialRating);
  const [comment, setComment] = useState(initialComment);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!readOnly) {
      onSubmit({ rating, comment });
    }
  };

  return (
    <Paper elevation={readOnly ? 0 : 2} sx={{ p: 3, borderRadius: 2 }}>
      <form onSubmit={handleSubmit}>
        <Stack spacing={3}>
          <Typography variant="h6" align="center" fontWeight={600}>
            {readOnly ? "Rating & Review" : "Rate & Review"}
          </Typography>

          <Box display="flex" flexDirection="column" alignItems="center">
            <Rating
              name="task-rating"
              value={rating}
              precision={1}
              onChange={(_, newValue) => {
                if (!readOnly) setRating(newValue);
              }}
              size="large"
              readOnly={readOnly}
              icon={
                <StarIcon
                  fontSize="inherit"
                  sx={{ color: "#FF69B4", fontSize: "2rem" }}
                />
              }
              emptyIcon={
                <StarBorderIcon fontSize="inherit" sx={{ fontSize: "2rem" }} />
              }
              sx={{
                "& .MuiRating-iconFilled": {
                  color: "#FF69B4",
                },
                "& .MuiRating-iconHover": {
                  color: "#FF69B4",
                },
                fontSize: "2rem",
              }}
            />
            <Box mt={1}>
              <Typography variant="body2" color="text.secondary">
                {rating > 0 ? `${rating}/5 stars` : "Tap to rate"}
              </Typography>
            </Box>
          </Box>

          <TextField
            fullWidth
            multiline
            rows={4}
            placeholder="Your feedback about the service (optional)"
            value={comment}
            onChange={(e) => !readOnly && setComment(e.target.value)}
            variant="outlined"
            InputProps={{ readOnly }}
          />

          {!readOnly && (
            <Button
              type="submit"
              variant="contained"
              sx={{
                bgcolor: "#FF69B4",
                "&:hover": { bgcolor: "#E45D9F" },
                borderRadius: 28,
                py: 1.5,
              }}
            >
              {submitLabel}
            </Button>
          )}

          {readOnly && allowEdit && (
            <Button
              variant="outlined"
              sx={{
                borderRadius: 28,
                py: 1.5,
                color: "#FF69B4",
                borderColor: "#FF69B4",
                "&:hover": {
                  borderColor: "#E45D9F",
                  bgcolor: "rgba(255, 105, 180, 0.04)",
                },
              }}
              startIcon={
                <span role="img" aria-label="Edit">
                  ✏️
                </span>
              }
              onClick={onEdit}
            >
              Edit Review
            </Button>
          )}
        </Stack>
      </form>
    </Paper>
  );
};

export default ReviewForm;
