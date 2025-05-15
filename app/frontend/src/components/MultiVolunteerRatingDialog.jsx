import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Rating,
  TextField,
  IconButton,
  Avatar,
  Select,
  MenuItem,
  FormControl,
  CircularProgress,
  Chip,
  Divider,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import StarIcon from "@mui/icons-material/Star";
import { useDispatch, useSelector } from "react-redux";
import {
  closeReviewDialog,
  selectVolunteer,
  fetchVolunteersForTask,
  submitReview,
  addReview,
} from "../store/slices/reviewSlice";

/**
 * MultiVolunteerRatingDialog component for rating multiple volunteers after task completion
 *
 * @param {Object} props - Component props
 * @param {boolean} props.open - Controls whether the dialog is open
 * @param {Function} props.onClose - Function called when dialog is closed without submitting
 * @param {Function} props.onSubmit - Function called when rating is submitted
 * @param {string} props.taskId - The ID of the task being rated
 */
const MultiVolunteerRatingDialog = ({ onClose, onSubmit }) => {
  const dispatch = useDispatch();
  const {
    isDialogOpen,
    taskId,
    volunteers,
    selectedVolunteer,
    loading,
    reviews,
    submittedReviews,
  } = useSelector((state) => state.review);

  // Rating state
  const [rating, setRating] = useState(4.5);
  const [review, setReview] = useState("");

  // Fetch volunteers when dialog is opened
  useEffect(() => {
    if (isDialogOpen && taskId) {
      dispatch(fetchVolunteersForTask(taskId));
    }
  }, [isDialogOpen, taskId, dispatch]);

  // Reset rating and review when changing volunteer
  useEffect(() => {
    if (selectedVolunteer) {
      // If there's an existing review for this volunteer, use that
      if (reviews[selectedVolunteer.id]) {
        setRating(reviews[selectedVolunteer.id].rating);
        setReview(reviews[selectedVolunteer.id].reviewText);
      } else {
        // Otherwise reset to default
        setRating(4.5);
        setReview("");
      }
    }
  }, [selectedVolunteer, reviews]);

  // Handle volunteer selection change
  const handleVolunteerChange = (event) => {
    const selectedId = event.target.value;
    const volunteer = volunteers.find((v) => v.id === selectedId);
    if (volunteer) {
      dispatch(selectVolunteer(volunteer));
    }
  };

  // Handle rating submission
  const handleSubmit = () => {
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

      // If all volunteers have been reviewed, close the dialog
      if (submittedReviews.length >= volunteers.length - 1) {
        handleClose();
        if (onSubmit) onSubmit();
      } else {
        // Move to the next unreviewed volunteer
        const nextVolunteer = volunteers.find(
          (v) =>
            !submittedReviews.includes(v.id) && v.id !== selectedVolunteer.id
        );
        if (nextVolunteer) {
          dispatch(selectVolunteer(nextVolunteer));
        }

        // Clear the form
        setRating(4.5);
        setReview("");
      }
    }
  };

  // Handle dialog close
  const handleClose = () => {
    dispatch(closeReviewDialog());
    if (onClose) onClose();
  };

  // Define the empty icon for the rating component
  const emptyIcon = <StarIcon fontSize="inherit" />;

  // Function to get the first letter of a name for avatar
  const getInitial = (name) => {
    return name ? name.charAt(0).toUpperCase() : "?";
  };

  return (
    <Dialog
      open={isDialogOpen}
      onClose={handleClose}
      PaperProps={{
        sx: {
          borderRadius: "16px",
          width: "340px",
          margin: "auto",
          overflow: "visible",
        },
      }}
    >
      {/* Close button in top right corner */}
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

      {/* User selection dropdown */}
      <Box sx={{ p: 3, pt: 5, pb: 2 }}>
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
                  {submittedReviews.includes(selectedVolunteer.id) && (
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

      <Typography
        variant="h6"
        sx={{
          textAlign: "center",
          fontWeight: 500,
          fontSize: "18px",
          mb: 1,
        }}
      >
        Rate & Review
      </Typography>

      <DialogContent sx={{ pt: 0 }}>
        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", p: 3 }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            {/* Star rating component */}
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                my: 2,
              }}
            >
              <Rating
                name="volunteer-rating"
                value={rating}
                precision={0.5}
                onChange={(event, newValue) => {
                  setRating(newValue);
                }}
                emptyIcon={emptyIcon}
                sx={{
                  fontSize: "2rem",
                  color: "#E15B97",
                  "& .MuiRating-iconEmpty": {
                    color: "#EAECF0",
                  },
                }}
              />
            </Box>

            {/* Review text field */}
            <TextField
              placeholder="Input text"
              multiline
              rows={4}
              value={review}
              onChange={(e) => setReview(e.target.value)}
              variant="outlined"
              fullWidth
              sx={{
                mt: 2,
                "& .MuiOutlinedInput-root": {
                  borderRadius: "8px",
                  backgroundColor: "#F9FAFB",
                },
              }}
            />
          </>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 2, justifyContent: "center" }}>
        <Button
          onClick={handleSubmit}
          disabled={loading || !selectedVolunteer}
          sx={{
            width: "100%",
            height: "44px",
            borderRadius: "22px",
            bgcolor: "#E15B97",
            color: "#FFF",
            textTransform: "none",
            fontWeight: 500,
            "&:hover": {
              bgcolor: "#D04D89",
            },
            "&:disabled": {
              opacity: 0.6,
              color: "#FFF",
            },
          }}
        >
          {submittedReviews.length === volunteers.length - 1 &&
          submittedReviews.includes(selectedVolunteer?.id)
            ? "Finish"
            : "Submit Review"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default MultiVolunteerRatingDialog;
