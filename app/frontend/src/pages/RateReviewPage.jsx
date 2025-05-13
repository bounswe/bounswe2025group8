import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
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
  Chip,
  Dialog,
} from "@mui/material";
import StarIcon from "@mui/icons-material/Star";
import CloseIcon from "@mui/icons-material/Close";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import {
  fetchVolunteersForTask,
  submitReview,
  selectVolunteer,
  addReview,
} from "../store/slices/reviewSlice";

const RateReviewPage = () => {
  const { taskId } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { volunteers, selectedVolunteer, submittedReviews, loading } =
    useSelector((state) => state.review);

  const [rating, setRating] = useState(4.5);
  const [review, setReview] = useState("");
  const [reviewedLabel, setReviewedLabel] = useState(false);

  // Fetch volunteers when the component mounts
  useEffect(() => {
    if (taskId) {
      dispatch(fetchVolunteersForTask(taskId));
    }
  }, [taskId, dispatch]);
  // Get all reviews from the Redux store
  const reviews = useSelector((state) => state.review.reviews);

  // Reset form when a different volunteer is selected
  useEffect(() => {
    if (selectedVolunteer) {
      const isReviewed = submittedReviews.includes(selectedVolunteer.id);
      setReviewedLabel(isReviewed);

      if (isReviewed && reviews[selectedVolunteer.id]) {
        // If this volunteer has been reviewed, show their previous review
        const previousReview = reviews[selectedVolunteer.id];
        setRating(previousReview.rating || 4.5);
        setReview(previousReview.reviewText || "");
      } else {
        // Reset form for new volunteer
        setRating(4.5);
        setReview("");
      }
    }
  }, [selectedVolunteer, submittedReviews, reviews]);

  // Handle volunteer selection
  const handleVolunteerChange = (event) => {
    const selectedId = event.target.value;
    const volunteer = volunteers.find((v) => v.id === selectedId);
    if (volunteer) {
      dispatch(selectVolunteer(volunteer));
    }
  };

  // Handle review submission
  const handleSubmitReview = () => {
    if (selectedVolunteer) {
      // Store the review in Redux
      dispatch(
        addReview({
          volunteerId: selectedVolunteer.id,
          rating,
          reviewText: review,
        })
      );

      // Submit to backend
      dispatch(
        submitReview({
          taskId,
          volunteerId: selectedVolunteer.id,
          rating,
          reviewText: review,
        })
      );

      // Set the reviewed label
      setReviewedLabel(true);
    }
  };

  // Handle dialog close
  const handleClose = () => {
    navigate(`/tasks/${taskId}`);
  };

  // Function to get initial of name for Avatar
  const getInitial = (name) => {
    return name ? name.charAt(0).toUpperCase() : "?";
  };
  return (
    <Dialog
      open={true}
      onClose={handleClose}
      PaperProps={{
        sx: {
          borderRadius: "16px",
          width: "340px",
          maxWidth: "calc(100% - 32px)",
          margin: "16px auto",
          overflow: "visible",
          boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.1)",
        },
      }}
    >
      {/* Close button */}
      <IconButton
        onClick={handleClose}
        sx={{
          position: "absolute",
          right: 10,
          top: 10,
          color: "#000",
        }}
      >
        <CloseIcon />
      </IconButton>
      {/* Ashley Robinson avatar & info - this is static as per the design */}{" "}
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          pt: 3,
          pb: 2,
        }}
      >
        <Avatar
          alt="Ashley Robinson"
          src="/path/to/ashley.png"
          sx={{
            width: 60,
            height: 60,
            bgcolor: "#E7E9F8",
            fontSize: "1.5rem",
          }}
        >
          A
        </Avatar>
        <Typography variant="h6" sx={{ mt: 1, fontWeight: 500 }}>
          Ashley Robinson
        </Typography>
      </Box>
      {/* Volunteer selection dropdown */}
      <Box sx={{ px: 3, pb: 2 }}>
        <FormControl fullWidth>
          <Select
            value={selectedVolunteer?.id || ""}
            onChange={handleVolunteerChange}
            displayEmpty
            IconComponent={KeyboardArrowDownIcon}
            sx={{
              height: 54,
              bgcolor: "#F9FAFB",
              borderRadius: 2,
              "&:focus": {
                bgcolor: "#F9FAFB",
              },
              "& .MuiOutlinedInput-notchedOutline": {
                borderColor: "#F3F4F6",
              },
            }}
            renderValue={(selected) => {
              if (!selectedVolunteer) {
                return (
                  <Typography color="text.secondary">
                    Select volunteer
                  </Typography>
                );
              }
              return (
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <Avatar
                    sx={{
                      width: 24,
                      height: 24,
                      bgcolor: "#E7E9F8",
                      fontSize: "0.8rem",
                      marginRight: 1,
                    }}
                  >
                    {getInitial(selectedVolunteer.name)}
                  </Avatar>
                  {selectedVolunteer.name}
                  {reviewedLabel && (
                    <Chip
                      size="small"
                      label="Reviewed"
                      sx={{
                        ml: 1,
                        bgcolor: "#E6F7ED",
                        color: "#18794E",
                        height: 20,
                      }}
                    />
                  )}
                </Box>
              );
            }}
          >
            {volunteers.map((volunteer) => (
              <MenuItem key={volunteer.id} value={volunteer.id}>
                <Box
                  sx={{ display: "flex", alignItems: "center", width: "100%" }}
                >
                  <Avatar
                    sx={{
                      width: 24,
                      height: 24,
                      bgcolor: "#E7E9F8",
                      fontSize: "0.8rem",
                      marginRight: 1,
                    }}
                  >
                    {getInitial(volunteer.name)}
                  </Avatar>
                  <Typography>{volunteer.name}</Typography>
                  {submittedReviews.includes(volunteer.id) && (
                    <Chip
                      size="small"
                      label="Reviewed"
                      sx={{
                        ml: "auto",
                        bgcolor: "#E6F7ED",
                        color: "#18794E",
                        height: 20,
                      }}
                    />
                  )}
                </Box>
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>
      {/* Rate & Review heading */}
      <Typography
        variant="h6"
        sx={{
          textAlign: "center",
          fontWeight: 500,
          fontSize: "18px",
          mb: 2,
        }}
      >
        Rate & Review
      </Typography>
      {/* Star rating */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          mb: 2,
        }}
      >
        <Rating
          name="volunteer-rating"
          value={rating}
          precision={0.5}
          onChange={(event, newValue) => {
            setRating(newValue);
          }}
          icon={<StarIcon fontSize="inherit" sx={{ color: "#E15B97" }} />}
          emptyIcon={<StarIcon fontSize="inherit" sx={{ color: "#EAECF0" }} />}
          sx={{
            fontSize: "2rem",
          }}
        />
      </Box>
      {/* Review text field */}
      <Box sx={{ px: 3, mb: 2 }}>
        <TextField
          placeholder="Input text"
          multiline
          rows={4}
          value={review}
          onChange={(e) => setReview(e.target.value)}
          variant="outlined"
          fullWidth
          sx={{
            "& .MuiOutlinedInput-root": {
              borderRadius: "8px",
              backgroundColor: "#F9FAFB",
            },
          }}
        />
      </Box>
      {/* Submit button */}
      <Box sx={{ px: 3, pb: 3 }}>
        <Button
          fullWidth
          onClick={handleSubmitReview}
          disabled={loading || !selectedVolunteer || reviewedLabel}
          sx={{
            height: 44,
            borderRadius: 22,
            bgcolor: "#E15B97",
            color: "#fff",
            textTransform: "none",
            fontWeight: 500,
            fontSize: "16px",
            "&:hover": {
              bgcolor: "#D04D89",
            },
            "&:disabled": {
              bgcolor: "#F3F4F6",
              color: "#9095A0",
            },
          }}
        >
          Submit Review
        </Button>
      </Box>
    </Dialog>
  );
};

export default RateReviewPage;
