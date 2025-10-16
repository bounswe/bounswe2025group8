import React, { useState, useEffect } from "react";
import {
  Typography,
  Box,
  Card,
  CardContent,
  Avatar,
  Button,
  IconButton,
  Chip,
  CircularProgress,
  Grid,
  useTheme,
} from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import StarIcon from "@mui/icons-material/Star";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import RadioButtonUncheckedIcon from "@mui/icons-material/RadioButtonUnchecked";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import { useAppSelector } from "../store/hooks";
import {
  selectCurrentUser,
  selectIsAuthenticated,
} from "../features/authentication/store/authSlice";
import {
  getTaskById,
  getTaskVolunteers,
  assignVolunteers,
  getMockTaskById,
  getMockTaskVolunteers,
} from "../features/request/services/requestService";
import Sidebar from "../components/Sidebar";

const SelectVolunteer = () => {
  const { requestId } = useParams();
  const theme = useTheme();
  const navigate = useNavigate();

  // Authentication state
  const currentUser = useAppSelector(selectCurrentUser);
  const isAuthenticated = useAppSelector(selectIsAuthenticated);

  // State
  const [task, setTask] = useState(null);
  const [volunteers, setVolunteers] = useState([]);
  const [selectedVolunteers, setSelectedVolunteers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch task and volunteers data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch task data
        let taskData;
        try {
          taskData = await getTaskById(requestId);
        } catch (taskError) {
          console.warn("Task API failed, using mock data:", taskError);
          taskData = getMockTaskById(requestId);
        }

        // Fetch volunteers data (people who have volunteered for this task)
        let volunteersData;
        try {
          volunteersData = await getTaskVolunteers(requestId);
          // Transform volunteer records to user data for display
          if (volunteersData && Array.isArray(volunteersData)) {
            volunteersData = volunteersData.map((volunteer) => ({
              id: volunteer.id,
              name: volunteer.user?.name || volunteer.name,
              surname: volunteer.user?.surname || volunteer.surname,
              rating: volunteer.user?.rating || volunteer.rating || 0,
              reviewCount:
                volunteer.user?.completed_task_count ||
                volunteer.completedTasks ||
                0,
              avatar:
                volunteer.user?.avatar ||
                volunteer.avatar ||
                `https://ui-avatars.com/api/?name=${
                  volunteer.user?.name || volunteer.name
                }&background=random`,
              skills: volunteer.skills || ["Volunteering"],
              completedTasks:
                volunteer.user?.completed_task_count ||
                volunteer.completedTasks ||
                0,
              user: volunteer.user || volunteer,
              volunteerRecord: volunteer,
            }));
          }
        } catch (volunteersError) {
          console.warn(
            "Volunteers API failed, using mock data:",
            volunteersError
          );
          volunteersData = getMockTaskVolunteers(requestId);
        }

        setTask(taskData);
        setVolunteers(volunteersData);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError(err.message || "Failed to fetch data");
      } finally {
        setLoading(false);
      }
    };

    if (requestId) {
      fetchData();
    }
  }, [requestId]);

  // Permission check
  const isTaskCreator =
    currentUser && task && currentUser.id === task.creator?.id;
  const maxVolunteers = task?.volunteer_number || 0;

  // Redirect if not task creator
  useEffect(() => {
    if (task && !isTaskCreator) {
      navigate(`/requests/${requestId}`, { replace: true });
    }
  }, [task, isTaskCreator, navigate, requestId]);

  // Handle volunteer selection
  const handleVolunteerSelect = (volunteerId) => {
    if (!isTaskCreator) return;

    setSelectedVolunteers((prev) => {
      const isSelected = prev.includes(volunteerId);

      if (isSelected) {
        // Remove from selection
        return prev.filter((id) => id !== volunteerId);
      } else {
        // Add to selection if under limit
        if (prev.length < maxVolunteers) {
          return [...prev, volunteerId];
        }
        return prev;
      }
    });
  };

  // Handle final selection
  const handleSelectVolunteers = async () => {
    if (selectedVolunteers.length === 0) {
      alert("Please select at least one volunteer");
      return;
    }

    try {
      console.log("Selected volunteers:", selectedVolunteers);

      // Call API to assign volunteers
      await assignVolunteers(requestId, selectedVolunteers);

      alert(
        `Successfully assigned ${selectedVolunteers.length} volunteer(s) to this task`
      );
      navigate(`/requests/${requestId}`);
    } catch (error) {
      console.error("Error assigning volunteers:", error);
      alert("Failed to assign volunteers. Please try again.");
    }
  };

  // Loading state
  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "50vh",
          flexDirection: "column",
          gap: 2,
        }}
      >
        <CircularProgress />
        <Typography variant="body1" color="text.secondary">
          Loading volunteers...
        </Typography>
      </Box>
    );
  }

  // Error state
  if (error) {
    return (
      <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: "#f5f5f5" }}>
        <Sidebar />
        <Box
          sx={{
            flexGrow: 1,
            p: 3,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Box sx={{ textAlign: "center", maxWidth: 400 }}>
            <Typography variant="h5" color="error" gutterBottom>
              Error loading volunteers
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph>
              {error}
            </Typography>
            <Button
              startIcon={<ArrowBackIcon />}
              onClick={() => navigate(`/requests/${requestId}`)}
              sx={{ mt: 2 }}
            >
              Back to Request
            </Button>
          </Box>
        </Box>
      </Box>
    );
  }

  // Not authorized
  if (!isTaskCreator) {
    return (
      <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: "#f5f5f5" }}>
        <Sidebar />
        <Box
          sx={{
            flexGrow: 1,
            p: 3,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Box sx={{ textAlign: "center", maxWidth: 400 }}>
            <Typography variant="h5" gutterBottom>
              Access Denied
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph>
              Only the task creator can select volunteers.
            </Typography>
            <Button
              startIcon={<ArrowBackIcon />}
              onClick={() => navigate(`/requests/${requestId}`)}
              sx={{ mt: 2 }}
            >
              Back to Request
            </Button>
          </Box>
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: "#f5f5f5" }}>
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <Box sx={{ flexGrow: 1, p: 3 }}>
        {/* Header */}
        <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
          <IconButton
            onClick={() => navigate(`/requests/${requestId}`)}
            sx={{ mr: 2, color: "text.secondary" }}
          >
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h4" sx={{ flexGrow: 1, fontWeight: "bold" }}>
            Select Volunteer
          </Typography>
          <IconButton>
            <MoreVertIcon />
          </IconButton>
        </Box>

        {/* Selection Info */}
        <Box
          sx={{ mb: 3, p: 2, bgcolor: "white", borderRadius: 2, boxShadow: 1 }}
        >
          <Typography variant="body1" color="text.secondary">
            <strong>{volunteers.length}</strong> people have volunteered for
            this task
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Select up to <strong>{maxVolunteers}</strong> volunteer
            {maxVolunteers > 1 ? "s" : ""} to assign
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Currently selected: <strong>{selectedVolunteers.length}</strong> of{" "}
            {maxVolunteers}
          </Typography>
        </Box>

        {/* Volunteers Grid */}
        {volunteers.length === 0 ? (
          <Box
            sx={{
              textAlign: "center",
              py: 8,
              bgcolor: "white",
              borderRadius: 2,
              boxShadow: 1,
              mb: 3,
            }}
          >
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No volunteers yet
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Wait for people to volunteer for this task before you can select
              them.
            </Typography>
          </Box>
        ) : (
          <Grid container spacing={2} sx={{ mb: 3 }}>
            {volunteers.map((volunteer) => {
              const isSelected = selectedVolunteers.includes(volunteer.id);
              const canSelect =
                selectedVolunteers.length < maxVolunteers || isSelected;

              return (
                <Grid item xs={12} sm={6} md={4} key={volunteer.id}>
                  <Card
                    sx={{
                      cursor: canSelect ? "pointer" : "not-allowed",
                      opacity: canSelect ? 1 : 0.6,
                      border: isSelected
                        ? "2px solid #7c4dff"
                        : "1px solid #e0e0e0",
                      transition: "all 0.2s ease-in-out",
                      "&:hover": canSelect
                        ? {
                            transform: "translateY(-2px)",
                            boxShadow: 3,
                          }
                        : {},
                    }}
                    onClick={() =>
                      canSelect && handleVolunteerSelect(volunteer.id)
                    }
                  >
                    <CardContent sx={{ p: 3, textAlign: "center" }}>
                      {/* Avatar and Selection Indicator */}
                      <Box sx={{ position: "relative", mb: 2 }}>
                        <Avatar
                          src={volunteer.avatar}
                          sx={{
                            width: 80,
                            height: 80,
                            mx: "auto",
                            border: isSelected
                              ? "3px solid #7c4dff"
                              : "3px solid transparent",
                          }}
                        />
                        {/* Selection Circle */}
                        <Box
                          sx={{
                            position: "absolute",
                            top: -5,
                            right: "50%",
                            transform: "translateX(50%)",
                            bgcolor: "white",
                            borderRadius: "50%",
                            p: 0.5,
                          }}
                        >
                          {isSelected ? (
                            <CheckCircleIcon
                              sx={{ color: "#7c4dff", fontSize: 24 }}
                            />
                          ) : (
                            <RadioButtonUncheckedIcon
                              sx={{ color: "#ccc", fontSize: 24 }}
                            />
                          )}
                        </Box>
                      </Box>

                      {/* Name */}
                      <Typography variant="h6" fontWeight="medium" gutterBottom>
                        {volunteer.name} {volunteer.surname}
                      </Typography>

                      {/* Rating */}
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          mb: 2,
                        }}
                      >
                        <StarIcon
                          sx={{ color: "#ffc107", fontSize: 20, mr: 0.5 }}
                        />
                        <Typography variant="body2" color="text.secondary">
                          {volunteer.rating} ({volunteer.reviewCount} reviews)
                        </Typography>
                      </Box>

                      {/* Skills */}
                      <Box
                        sx={{
                          display: "flex",
                          flexWrap: "wrap",
                          gap: 0.5,
                          justifyContent: "center",
                          mb: 2,
                        }}
                      >
                        {volunteer.skills.map((skill, index) => (
                          <Chip
                            key={index}
                            label={skill}
                            size="small"
                            sx={{
                              fontSize: "0.75rem",
                              height: 24,
                              bgcolor: "#f0f0f0",
                              color: "text.secondary",
                            }}
                          />
                        ))}
                      </Box>

                      {/* Completed Tasks */}
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ mb: 2 }}
                      >
                        {volunteer.completedTasks} tasks completed
                      </Typography>

                      {/* View Details Arrow */}
                      <Box sx={{ display: "flex", justifyContent: "center" }}>
                        <ChevronRightIcon sx={{ color: "text.secondary" }} />
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              );
            })}
          </Grid>
        )}

        {/* Action Button */}
        <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
          <Button
            variant="contained"
            size="large"
            onClick={handleSelectVolunteers}
            disabled={selectedVolunteers.length === 0}
            sx={{
              px: 4,
              py: 1.5,
              textTransform: "none",
              fontWeight: 500,
              fontSize: "1rem",
              bgcolor: "#7c4dff",
              "&:hover": {
                bgcolor: "#6a3de8",
              },
              "&:disabled": {
                bgcolor: "#ccc",
                color: "#666",
              },
            }}
          >
            Select{" "}
            {selectedVolunteers.length > 0
              ? `(${selectedVolunteers.length})`
              : ""}
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default SelectVolunteer;
