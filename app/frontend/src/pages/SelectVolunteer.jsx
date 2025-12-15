import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
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
  Tooltip,
} from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import StarIcon from "@mui/icons-material/Star";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import RadioButtonUncheckedIcon from "@mui/icons-material/RadioButtonUnchecked";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import PersonIcon from "@mui/icons-material/Person";
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
import { toAbsoluteUrl } from "../utils/url";
import { useTheme } from "../hooks/useTheme";

const SelectVolunteer = () => {
  const { requestId } = useParams();
  const { colors } = useTheme();
  const navigate = useNavigate();
  const { t } = useTranslation();

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
                toAbsoluteUrl(
                  volunteer.user?.profile_photo ||
                    volunteer.user?.profilePhoto ||
                    volunteer.user?.profilePicture ||
                    volunteer.user?.avatar ||
                    volunteer.avatar
                ) ||
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

        // Pre-select volunteers who are already accepted for this task
        if (volunteersData && Array.isArray(volunteersData)) {
          const alreadyAcceptedVolunteers = volunteersData
            .filter(
              (volunteer) => volunteer.volunteerRecord?.status === "ACCEPTED"
            )
            .map((volunteer) => volunteer.id);

          if (alreadyAcceptedVolunteers.length > 0) {
            console.log(
              "Pre-selecting already accepted volunteers:",
              alreadyAcceptedVolunteers
            );
            setSelectedVolunteers(alreadyAcceptedVolunteers);
          }
        }
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
      alert(t("selectVolunteer.messages.selectAtLeastOne"));
      return;
    }

    try {
      console.log("Selected volunteers:", selectedVolunteers);

      // Call API to assign volunteers
      await assignVolunteers(requestId, selectedVolunteers);

      const message =
        task?.status === "ASSIGNED"
          ? t("selectVolunteer.messages.updateSuccess", {
              count: selectedVolunteers.length,
            })
          : t("selectVolunteer.messages.assignSuccess", {
              count: selectedVolunteers.length,
            });
      alert(message);
      navigate(`/requests/${requestId}`);
    } catch (error) {
      console.error("Error assigning volunteers:", error);
      alert(t("selectVolunteer.messages.assignFailed"));
    }
  };

  // Handle view volunteer profile
  const handleViewProfile = (volunteerId, event) => {
    event.stopPropagation();
    navigate(`/profile/${volunteerId}`);
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
          bgcolor: colors.background.primary,
        }}
        role="status"
        aria-live="polite"
        aria-busy="true"
      >
        <CircularProgress sx={{ color: colors.brand.primary }} />
        <Typography variant="body1" sx={{ color: colors.text.secondary }}>
          {t("selectVolunteer.loading")}
        </Typography>
      </Box>
    );
  }

  // Error state
  if (error) {
    return (
      <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: colors.background.primary }}>
        <Sidebar />
        <Box
          sx={{
            flexGrow: 1,
            p: 3,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            bgcolor: colors.background.primary,
          }}
          role="alert"
          aria-live="assertive"
        >
          <Box sx={{ textAlign: "center", maxWidth: 400 }}>
            <Typography variant="h5" sx={{ color: colors.semantic.error }} gutterBottom>
              {t("selectVolunteer.errorLoading")}
            </Typography>
            <Typography variant="body1" sx={{ color: colors.text.secondary }} paragraph>
              {error}
            </Typography>
            <Button
              startIcon={<ArrowBackIcon />}
              onClick={() => navigate(`/requests/${requestId}`)}
              sx={{ 
                mt: 2,
                bgcolor: colors.brand.primary,
                color: '#ffffff',
                '&:hover': {
                  bgcolor: colors.brand.primaryHover || colors.brand.primary,
                }
              }}
              aria-label={t("selectVolunteer.aria.backToRequest")}
            >
              {t("selectVolunteer.backToRequest")}
            </Button>
          </Box>
        </Box>
      </Box>
    );
  }

  // Not authorized
  if (!isTaskCreator) {
    return (
      <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: colors.background.primary }}>
        <Sidebar />
        <Box
          sx={{
            flexGrow: 1,
            p: 3,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            bgcolor: colors.background.primary,
          }}
        >
          <Box sx={{ textAlign: "center", maxWidth: 400 }}>
            <Typography variant="h5" sx={{ color: colors.text.primary }} gutterBottom>
              {t("selectVolunteer.accessDenied")}
            </Typography>
            <Typography variant="body1" sx={{ color: colors.text.secondary }} paragraph>
              {t("selectVolunteer.onlyCreatorCanSelect")}
            </Typography>
            <Button
              startIcon={<ArrowBackIcon />}
              onClick={() => navigate(`/requests/${requestId}`)}
              sx={{ 
                mt: 2,
                bgcolor: colors.brand.primary,
                color: '#ffffff',
                '&:hover': {
                  bgcolor: colors.brand.primaryHover || colors.brand.primary,
                }
              }}
            >
              {t("selectVolunteer.backToRequest")}
            </Button>
          </Box>
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: colors.background.primary }}>
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <Box
        sx={{ flexGrow: 1, p: 3, bgcolor: colors.background.primary }}
        component="main"
        role="main"
        aria-labelledby="select-volunteer-title"
      >
        {/* Header */}
        <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
          <IconButton
            onClick={() => navigate(`/requests/${requestId}`)}
            sx={{ mr: 2, color: colors.text.secondary }}
            aria-label={t("selectVolunteer.aria.backToRequest")}
          >
            <ArrowBackIcon />
          </IconButton>
          <Typography
            id="select-volunteer-title"
            variant="h4"
            sx={{ flexGrow: 1, fontWeight: "bold", color: colors.text.primary }}
          >
            {t("selectVolunteer.title")}
          </Typography>
          <IconButton 
            aria-label={t("selectVolunteer.moreOptions")}
            sx={{ color: colors.text.secondary }}
          >
            <MoreVertIcon />
          </IconButton>
        </Box>

        {/* Selection Info */}
        <Box
          sx={{ 
            mb: 3, 
            p: 2, 
            bgcolor: colors.background.secondary, 
            borderRadius: 2, 
            border: `1px solid ${colors.border.primary}`,
          }}
        >
          <Typography variant="body1" sx={{ color: colors.text.secondary }}>
            {t("selectVolunteer.info.peopleVolunteered", {
              count: volunteers.length,
            })}
          </Typography>
          <Typography variant="body1" sx={{ color: colors.text.secondary }}>
            {t("selectVolunteer.info.selectUpTo", {
              max: maxVolunteers,
              count: maxVolunteers,
            })}
          </Typography>
          <Typography variant="body2" sx={{ color: colors.text.secondary }}>
            {t("selectVolunteer.info.currentlySelecting", {
              selected: selectedVolunteers.length,
              max: maxVolunteers,
            })}
          </Typography>
          <Typography
            variant="body2"
            sx={{ mt: 1, fontStyle: "italic", color: colors.text.secondary }}
          >
            {t("selectVolunteer.info.selectedBadgeNote")}
          </Typography>
        </Box>

        {/* Volunteers Grid */}
        {volunteers.length === 0 ? (
          <Box
            sx={{
              textAlign: "center",
              py: 8,
              bgcolor: colors.background.secondary,
              borderRadius: 2,
              border: `1px solid ${colors.border.primary}`,
              mb: 3,
            }}
            role="status"
            aria-live="polite"
          >
            <Typography variant="h6" sx={{ color: colors.text.secondary }} gutterBottom>
              {t("selectVolunteer.empty.noVolunteers")}
            </Typography>
            <Typography variant="body2" sx={{ color: colors.text.secondary }}>
              {t("selectVolunteer.empty.waitForVolunteers")}
            </Typography>
          </Box>
        ) : (
          <Grid container spacing={2} sx={{ mb: 3 }}>
            {volunteers.map((volunteer) => {
              const isSelected = selectedVolunteers.includes(volunteer.id);
              // Check if volunteer is banned (name shows as *deleted)
              const isVolunteerBanned = volunteer.name === "*deleted";
              const canSelect =
                (selectedVolunteers.length < maxVolunteers || isSelected) &&
                !isVolunteerBanned; // Banned volunteers cannot be selected
              const isCurrentlyAccepted =
                volunteer.volunteerRecord?.status === "ACCEPTED";
              const isCurrentlyRejected =
                volunteer.volunteerRecord?.status === "REJECTED";

              return (
                <Grid item xs={12} sm={6} md={4} key={volunteer.id}>
                  <Card
                    sx={{
                      cursor: canSelect ? "pointer" : "not-allowed",
                      opacity: canSelect ? 1 : 0.6,
                      bgcolor: colors.background.secondary,
                      border: isSelected
                        ? `2px solid ${colors.brand.primary}`
                        : `1px solid ${colors.border.primary}`,
                      transition: "all 0.2s ease-in-out",
                      position: "relative",
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
                    role="checkbox"
                    aria-checked={isSelected}
                    tabIndex={0}
                    aria-label={t("selectVolunteer.volunteer.ariaLabel", {
                      name: volunteer.name,
                      surname: volunteer.surname,
                      rating: volunteer.rating,
                      tasks: volunteer.completedTasks,
                    })}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        if (canSelect) handleVolunteerSelect(volunteer.id);
                      }
                    }}
                  >
                    {/* Status Badges */}
                    {isCurrentlyAccepted && (
                      <Chip
                        label={t("selectVolunteer.badges.selected")}
                        size="small"
                        sx={{
                          position: "absolute",
                          top: 8,
                          right: 8,
                          bgcolor: colors.semantic.success,
                          color: "white",
                          fontSize: "0.7rem",
                          height: 20,
                          zIndex: 1,
                        }}
                      />
                    )}
                    {isCurrentlyRejected && (
                      <Chip
                        label={t("selectVolunteer.badges.previouslyRejected")}
                        size="small"
                        sx={{
                          position: "absolute",
                          top: 8,
                          right: 8,
                          bgcolor: colors.semantic.warning,
                          color: "white",
                          fontSize: "0.7rem",
                          height: 20,
                          zIndex: 1,
                        }}
                      />
                    )}
                    <CardContent sx={{ p: 3, textAlign: "center" }}>
                      {/* Avatar and Selection Indicator */}
                      <Box sx={{ position: "relative", mb: 2 }}>
                        <Avatar
                          src={
                            !isVolunteerBanned ? volunteer.avatar : undefined
                          }
                          sx={{
                            width: 80,
                            height: 80,
                            mx: "auto",
                            border: isSelected
                              ? `3px solid ${colors.brand.primary}`
                              : "3px solid transparent",
                            bgcolor: isVolunteerBanned ? colors.text.disabled : undefined,
                          }}
                        >
                          {isVolunteerBanned && "*"}
                        </Avatar>
                        {/* Selection Circle */}
                        <Box
                          sx={{
                            position: "absolute",
                            top: -5,
                            right: "50%",
                            transform: "translateX(50%)",
                            bgcolor: colors.background.secondary,
                            borderRadius: "50%",
                            p: 0.5,
                          }}
                        >
                          {isSelected ? (
                            <CheckCircleIcon
                              sx={{ color: colors.brand.primary, fontSize: 24 }}
                            />
                          ) : (
                            <RadioButtonUncheckedIcon
                              sx={{ color: colors.border.secondary, fontSize: 24 }}
                            />
                          )}
                        </Box>
                      </Box>

                      {/* Name */}
                      <Typography
                        variant="h6"
                        fontWeight="medium"
                        gutterBottom
                        sx={{
                          color: isVolunteerBanned
                            ? colors.text.disabled
                            : colors.text.primary,
                        }}
                      >
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
                          sx={{ color: colors.semantic.warning, fontSize: 20, mr: 0.5 }}
                        />
                        <Typography variant="body2" sx={{ color: colors.text.secondary }}>
                          {(
                            Math.round((volunteer.rating || 0) * 10) / 10
                          ).toFixed(1)}{" "}
                          ({volunteer.reviewCount} reviews)
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
                              bgcolor: colors.background.elevated,
                              color: colors.text.secondary,
                              border: `1px solid ${colors.border.secondary}`,
                            }}
                          />
                        ))}
                      </Box>

                      {/* Completed Tasks */}
                      <Typography
                        variant="body2"
                        sx={{ mb: 2, color: colors.text.secondary }}
                      >
                        {t("selectVolunteer.volunteer.tasksCompleted", {
                          count: volunteer.completedTasks,
                        })}
                      </Typography>

                      {/* View Profile Button */}
                      <Tooltip
                        title={t("selectVolunteer.volunteer.viewFullProfile")}
                        arrow
                      >
                        <Button
                          variant="outlined"
                          size="small"
                          startIcon={<PersonIcon />}
                          onClick={(e) =>
                            handleViewProfile(
                              volunteer.user?.id || volunteer.id,
                              e
                            )
                          }
                          sx={{
                            mt: 1,
                            textTransform: "none",
                            borderColor: colors.brand.primary,
                            color: colors.brand.primary,
                            "&:hover": {
                              borderColor: colors.brand.primaryHover || colors.brand.primary,
                              bgcolor: `${colors.brand.primary}10`,
                            },
                          }}
                          aria-label={t(
                            "selectVolunteer.volunteer.viewProfileOf",
                            {
                              name: volunteer.name,
                              surname: volunteer.surname,
                            }
                          )}
                        >
                          {t("selectVolunteer.volunteer.viewProfile")}
                        </Button>
                      </Tooltip>
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
              bgcolor: colors.brand.primary,
              color: '#ffffff',
              "&:hover": {
                bgcolor: colors.brand.primaryHover || colors.brand.primary,
              },
              "&:disabled": {
                bgcolor: colors.text.disabled,
                color: colors.background.secondary,
              },
            }}
            aria-disabled={selectedVolunteers.length === 0}
            aria-label={
              task?.status === "ASSIGNED"
                ? t("selectVolunteer.buttons.updateSelectionCount", {
                    count: selectedVolunteers.length,
                  })
                : t("selectVolunteer.buttons.assignVolunteersCount", {
                    count: selectedVolunteers.length,
                  })
            }
          >
            {task?.status === "ASSIGNED"
              ? t("selectVolunteer.buttons.updateSelection")
              : t("selectVolunteer.buttons.assignVolunteers")}{" "}
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
