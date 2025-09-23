import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate, Link, useParams } from "react-router-dom";
import {
  Box,
  Typography,
  IconButton,
  Button,
  styled,
  Paper,
  InputBase,
  Avatar,
} from "@mui/material";
import {
  Search as SearchIcon,
  ArrowBack as ArrowBackIcon,
  MoreVert as MoreVertIcon,
  Star as StarIcon,
  CheckCircle as CheckCircleIcon,
} from "@mui/icons-material";
import {
  setSelectedVolunteer,
  setStatus,
} from "../store/slices/taskDetailSlice";
import SelectVolunteerCard from "../components/SelectVolunteerCard";

// Main container
const PageContainer = styled(Box)({
  maxWidth: "428px",
  width: "100%",
  margin: "0 auto",
  minHeight: "100vh",
  backgroundColor: "#FFFFFF",
  display: "flex",
  flexDirection: "column",
});

// Search bar at the top
const SearchContainer = styled(Paper)({
  padding: "8px",
  display: "flex",
  alignItems: "center",
  borderRadius: "22px",
  margin: "12px 16px",
  boxShadow: "none",
  border: "1px solid #E5E7EB",
});

const SearchInput = styled(InputBase)({
  marginLeft: 8,
  flex: 1,
  fontFamily: "Inter",
  fontSize: "16px",
  color: "#9095A0",
  "& ::placeholder": {
    color: "#9095A0",
    opacity: 1,
  },
});

const PageHeader = styled(Box)({
  display: "flex",
  alignItems: "center",
  padding: "12px 16px",
  justifyContent: "space-between",
});

const PageTitle = styled(Typography)({
  fontSize: "18px",
  fontWeight: 500,
  fontFamily: "Inter",
  marginLeft: "8px",
});

const VolunteerList = styled(Box)({
  flex: 1,
  overflowY: "auto",
  padding: "0 0 80px 0", // Add bottom padding to make space for the action button
});

const ActionButtonContainer = styled(Box)({
  padding: "16px",
  position: "sticky",
  bottom: 0,
  width: "100%",
  backgroundColor: "#FFFFFF",
  boxShadow: "0px -4px 10px rgba(0, 0, 0, 0.05)",
});

const ActionButton = styled(Button)({
  fontFamily: "Inter",
  fontSize: "16px",
  backgroundColor: "#636AE8",
  color: "#FFFFFF",
  borderRadius: "22px",
  padding: "10px 24px",
  textTransform: "none",
  width: "100%",
  boxShadow: "0px 4px 10px rgba(99, 106, 232, 0.3)",
  "&:hover": {
    backgroundColor: "#4850E4",
  },
  "&:disabled": {
    backgroundColor: "rgba(99, 106, 232, 0.5)",
  },
});

const SelectVolunteerPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { taskId } = useParams();
  const [selectedVolunteers, setSelectedVolunteers] = useState({}); // Mock data for volunteers that matches the image
  const volunteers = [
    {
      id: 1,
      name: "Anthony Moore",
      avatar: "https://i.pravatar.cc/150?img=8",
      rating: 4.8,
      reviewCount: 9,
      phone: "+1 121 542 593", // Added phone number to match the image
    },
    {
      id: 2,
      name: "Elizabeth Bailey",
      avatar: "https://i.pravatar.cc/150?img=5",
      rating: 4.4,
      reviewCount: 5,
      phone: "+1 121 542 593",
    },
    {
      id: 3,
      name: "Ashley Robinson",
      avatar: "https://i.pravatar.cc/150?img=3",
      rating: 4.1,
      reviewCount: 7,
      phone: "+1 121 542 593",
    },
  ];

  const handleVolunteerSelect = (volunteer) => {
    setSelectedVolunteers((prev) => {
      const newSelected = { ...prev };

      // Toggle selection
      if (newSelected[volunteer.id]) {
        delete newSelected[volunteer.id];
      } else {
        newSelected[volunteer.id] = volunteer;
      }

      return newSelected;
    });
  };
  const handleConfirmSelection = () => {
    // Get the first selected volunteer (or modify as needed for multiple selection)
    const selectedVolunteer = Object.values(selectedVolunteers)[0];
    if (selectedVolunteer) {
      // First update the selected volunteer in the store
      dispatch(setSelectedVolunteer(selectedVolunteer));

      // Also assign the volunteer to the task
      dispatch(setStatus("assigned"));

      // Finally navigate to the task detail page
      // Use navigate instead of window.location to avoid a full page refresh
      navigate(`/tasks/${taskId}`);
    }
  };
  return (
    <Box sx={{ maxWidth: "600px", mx: "auto" }}>
      {/* Page header */}
      <PageHeader>
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <IconButton
            onClick={() => navigate(`/tasks/${taskId}`)}
            color="inherit"
          >
            <ArrowBackIcon />
          </IconButton>
          <PageTitle>Select Volunteer</PageTitle>
        </Box>
        <IconButton>
          <MoreVertIcon />
        </IconButton>
      </PageHeader>
      {/* Search bar */}
      <SearchContainer>
        <SearchIcon sx={{ color: "#636AE8", ml: 1 }} />
        <SearchInput
          placeholder="What do you need help with"
          inputProps={{ "aria-label": "search" }}
        />
      </SearchContainer>
      {/* Volunteer Cards */}
      <VolunteerList>
        {volunteers.map((volunteer) => (
          <SelectVolunteerCard
            key={volunteer.id}
            volunteer={volunteer}
            selected={Boolean(selectedVolunteers[volunteer.id])}
            onSelect={handleVolunteerSelect}
          />
        ))}
      </VolunteerList>{" "}
      {/* Action button */}
      <ActionButtonContainer>
        <ActionButton
          disabled={Object.keys(selectedVolunteers).length === 0}
          onClick={handleConfirmSelection}
          variant="contained"
        >
          Select
        </ActionButton>
      </ActionButtonContainer>
    </Box>
  );
};

export default SelectVolunteerPage;
