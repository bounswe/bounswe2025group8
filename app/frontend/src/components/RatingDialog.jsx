import { useState } from "react";
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
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import StarIcon from "@mui/icons-material/Star";

/**
 * RatingDialog component for rating volunteers after task completion
 *
 * @param {Object} props - Component props
 * @param {boolean} props.open - Controls whether the dialog is open
 * @param {Function} props.onClose - Function called when dialog is closed without submitting
 * @param {Function} props.onSubmit - Function called when rating is submitted with rating value and review text
 * @param {Object} props.volunteer - Volunteer object to be rated
 */
const RatingDialog = ({ open, onClose, onSubmit, volunteer }) => {
  // Default to 4.5 stars as shown in the design
  const [value, setValue] = useState(4.5);
  const [review, setReview] = useState("");

  // Handle volunteer selection
  const handleVolunteerChange = (event) => {
    console.log("Selected volunteer:", event.target.value);
  };

  // Handle rating submission
  const handleSubmit = () => {
    onSubmit({
      rating: value,
      review,
      volunteer: volunteer ? volunteer.name : "Elizabeth Bailey",
    });
  };

  // Define the empty icon for the rating component
  const emptyIcon = <StarIcon fontSize="inherit" />;

  return (
    <Dialog
      open={open}
      onClose={onClose}
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
        onClick={onClose}
        sx={{
          position: "absolute",
          right: 10,
          top: 10,
          color: "#000",
        }}
      >
        <CloseIcon />
      </IconButton>

      {/* User information with avatar */}
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          pt: 3,
        }}
      >
        <Avatar
          alt="Ashley Robinson"
          src="/path/to/avatar.png"
          sx={{
            width: 60,
            height: 60,
            bgcolor: "#E7E9F8",
          }}
        >
          A
        </Avatar>
        <Typography variant="h6" sx={{ mt: 1 }}>
          Ashley Robinson
        </Typography>
      </Box>

      <DialogContent
        sx={{ display: "flex", flexDirection: "column", pt: 2, px: 3 }}
      >
        {/* Volunteer selection dropdown */}
        <FormControl
          fullWidth
          variant="outlined"
          sx={{
            mb: 3,
            "& .MuiOutlinedInput-root": {
              borderRadius: "8px",
              backgroundColor: "#f7f7f7",
            },
          }}
        >
          <Select
            value={volunteer?.name || "Elizabeth Bailey"}
            onChange={handleVolunteerChange}
            IconComponent={KeyboardArrowDownIcon}
            displayEmpty
            sx={{
              height: "44px",
              "& .MuiSelect-select": {
                paddingY: "10px",
              },
            }}
          >
            <MenuItem value="Elizabeth Bailey">Elizabeth Bailey</MenuItem>
          </Select>
        </FormControl>

        {/* Star rating */}
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            mb: 3,
          }}
        >
          <Typography variant="subtitle1" gutterBottom>
            Rate the volunteer
          </Typography>
          <Rating
            name="rating"
            value={value}
            precision={0.5}
            onChange={(event, newValue) => {
              setValue(newValue);
            }}
            emptyIcon={emptyIcon}
            sx={{
              fontSize: "2rem",
              "& .MuiRating-iconEmpty": {
                color: "#D1D5DBFF",
              },
              "& .MuiRating-iconFilled": {
                color: "#E15B97",
              },
              "& .MuiRating-iconHover": {
                color: "#D04D89",
              },
            }}
          />
        </Box>

        {/* Review text field */}
        <TextField
          label="Write your review"
          multiline
          rows={4}
          value={review}
          onChange={(e) => setReview(e.target.value)}
          fullWidth
          variant="outlined"
          placeholder="Tell us about your experience with this volunteer..."
          sx={{
            "& .MuiOutlinedInput-root": {
              borderRadius: "12px",
              fontFamily: "Inter",
            },
          }}
        />
      </DialogContent>

      <DialogActions
        sx={{ px: 3, pb: 3, pt: 1, justifyContent: "space-between" }}
      >
        <Button
          onClick={onClose}
          sx={{
            fontFamily: "Inter",
            fontSize: "16px",
            fontWeight: 400,
            textTransform: "none",
            color: "#515866FF",
            "&:hover": {
              backgroundColor: "#F3F4F6FF",
            },
          }}
        >
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={value === 0}
          sx={{
            fontFamily: "Inter",
            fontSize: "16px",
            fontWeight: 400,
            textTransform: "none",
            borderRadius: "22px",
            height: "44px",
            paddingX: "24px",
            backgroundColor: "#E15B97",
            "&:hover": {
              backgroundColor: "#D04D89", // Darker pink on hover
            },
            "&:disabled": {
              opacity: 0.4,
            },
          }}
        >
          Submit Review
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default RatingDialog;
