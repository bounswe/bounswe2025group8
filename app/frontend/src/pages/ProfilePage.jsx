import React, { useState, useEffect, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  Box,
  Container,
  Typography,
  Button,
  Tab,
  Tabs,
  Avatar,
  Paper,
  Grid,
  Rating,
  Chip,
  IconButton,
  Badge as MuiBadge,
  Divider,
  CircularProgress,
  Pagination,
} from "@mui/material";
import {
  Edit,
  Notifications,
  Settings,
  ArrowBack,
  People,
  EmojiEvents,
  Flag as FlagIcon,
  PersonAdd,
  PersonRemove,
} from "@mui/icons-material";
import {
  fetchUserProfile,
  fetchUserReviews,
  fetchUserCreatedRequests,
  fetchUserVolunteeredRequests,

  fetchUserBadges,
  fetchAllBadges,
  uploadProfilePicture,
  clearUpdateSuccess,
  clearUploadSuccess,
} from "../features/profile/store/profileSlice";
import {
  selectUpdateSuccess,
  clearSuccess as clearEditProfileSuccess,
  fetchCurrentUserProfile,
  updateUserLocally,
  selectUploadSuccess as selectEditUploadSuccess,
} from "../features/profile/store/editProfileSlice";
import { updateUserProfile as updateAuthUser } from "../features/authentication/store/authSlice";
import RequestCard from "../components/RequestCard";
import ReviewCard from "../components/ReviewCard";
import Badge from "../components/Badge";
import EditProfileDialog from "../components/EditProfileDialog";
import RatingCategoriesModal from "../components/RatingCategoriesModal";
import UserReportModal from "../components/UserReportModal";
import { useTheme } from "../hooks/useTheme";
import { toAbsoluteUrl } from "../utils/url";
import userService from "../services/userService";
// No need for CSS module import as we're using Material UI's sx prop
import { checkBadges } from "../features/badges/services/badgeService";

const safeJSONParse = (str) => {
  try {
    return str ? JSON.parse(str) : null;
  } catch (e) {
    console.error("Error parsing JSON from localStorage:", e);
    return null;
  }
};

const ProfilePage = () => {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const { userId } = useParams();
  const navigate = useNavigate();

  // Get logged-in user data from localStorage and Redux store
  const loggedInUserId = localStorage.getItem("userId");
  const loggedInUserData = safeJSONParse(localStorage.getItem("user"));
  const authState = useSelector((state) => state.auth);

  // Debug helper function - call this in the browser console to see all auth-related info
  window.debugAuthState = () => {
    console.group("=== AUTH DEBUG INFO ===");
    console.log("URL userId param:", userId);
    console.log("localStorage userId:", localStorage.getItem("userId"));
    console.log("localStorage user:", localStorage.getItem("user"));
    console.log("localStorage token:", localStorage.getItem("token"));
    console.log("localStorage role:", localStorage.getItem("role"));
    console.log("Redux auth state:", authState);
    console.groupEnd();
    return "Auth debug info logged above ☝️";
  };

  console.log("DEBUGGING USER INFO:");
  console.log("Current profile userId from URL:", userId);
  console.log("Logged-in userId from localStorage:", loggedInUserId);
  console.log("Logged-in user object:", loggedInUserData);
  console.log("Auth state from Redux:", authState);
  console.log(
    "Condition check for Edit button:",
    userId === "current" ||
    userId === "me" ||
    !userId ||
    userId === loggedInUserId
  );

  const dispatch = useDispatch();
  const {
    user,
    reviews,
    createdRequests,
    volunteeredRequests,
    badges = [],
    allBadges = [],
    loading,
    error,
  } = useSelector((state) => state.profile || {});

  const auth = useSelector((s) => s.auth);
  const authUserId = auth?.user?.id != null ? String(auth.user.id) : null;
  const lsUserObj = safeJSONParse(localStorage.getItem("user"));
  const lsUserId = lsUserObj?.id != null ? String(lsUserObj.id) : null;
  const lsUserIdSimple = localStorage.getItem("userId");
  const effectiveLoggedInId = authUserId ?? lsUserId ?? lsUserIdSimple ?? null;

  // Resolve profile being viewed
  const paramId = userId; // param from useParams
  const effectiveProfileId =
    paramId === "current" || paramId === "me" || !paramId
      ? effectiveLoggedInId
      : String(paramId);

  const canEdit =
    Boolean(auth?.isAuthenticated) &&
    effectiveLoggedInId &&
    effectiveProfileId &&
    String(effectiveLoggedInId) === String(effectiveProfileId);

  const [roleTab, setRoleTab] = useState(0); // 0 for Volunteer, 1 for Requester
  const [requestsTab, setRequestsTab] = useState(0); // 0 for Active, 1 for Past
  const [reviewPage, setReviewPage] = useState(1);
  const [reviewsPerPage] = useState(5);
  const [refreshData, setRefreshData] = useState(false);
  const [editProfileOpen, setEditProfileOpen] = useState(false);
  const [ratingCategoriesOpen, setRatingCategoriesOpen] = useState(false); // Empty array for badges since we'll use API data
  const [userReportDialogOpen, setUserReportDialogOpen] = useState(false);
  const [mockBadges] = useState([]);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);

  // Placeholder handlers for future implementation
  const handleFollowersClick = () => {
    console.log("Followers clicked");
  };

  const handleFollowingClick = () => {
    console.log("Following clicked");
  };

  const loadProfileData = useCallback(async () => {
    try {
      // Get user ID from multiple possible sources
      const loggedInUserId = localStorage.getItem("userId");
      const loggedInUserObj = safeJSONParse(localStorage.getItem("user"));
      const loggedInUserIdFromObj = loggedInUserObj?.id;
      const effectiveLoggedInUserId = loggedInUserId || loggedInUserIdFromObj;

      // If we have a URL userId parameter, use it, otherwise fall back to the logged-in user's ID
      const currentId =
        userId === "current"
          ? effectiveLoggedInUserId
          : userId || effectiveLoggedInUserId;

      console.log("loadProfileData - DEBUGGING:");
      console.log("- Profile userId param:", userId);
      console.log("- Logged-in userId from localStorage:", loggedInUserId);
      console.log(
        "- Logged-in userId from user object:",
        loggedInUserIdFromObj
      );
      console.log("- ID actually used for API calls:", currentId);

      if (!currentId) {
        console.error("No user ID available - unable to load profile data");
        return;
      }

      await dispatch(fetchUserProfile(currentId)).unwrap();

      // Use object parameter for reviews to pass pagination info
      // Determine role based on roleTab: 0 = volunteer, 1 = requester
      const reviewRole = roleTab === 0 ? "volunteer" : "requester";
      await dispatch(
        fetchUserReviews({
          userId: currentId,
          page: reviewPage,
          limit: reviewsPerPage,
          role: reviewRole,
        })
      ).unwrap();
      // For requester tab (roleTab = 1), fetch created tasks with appropriate status
      if (roleTab === 1) {
        // Determine which status to request based on the active/past tab
        const status = requestsTab === 0 ? "active" : "COMPLETED";

        await dispatch(
          fetchUserCreatedRequests({
            userId: currentId,
            page: 1,
            limit: 10,
            status: status,
          })
        ).unwrap();
      }

      // For volunteer tab (roleTab = 0), fetch volunteered tasks
      // For volunteer tab, we also need to handle active vs completed tasks
      if (roleTab === 0) {
        // Determine task status filter based on active/past tab
        const taskStatus = requestsTab === 0 ? "active" : "COMPLETED";

        await dispatch(
          fetchUserVolunteeredRequests({
            userId: currentId,
            page: 1,
            limit: 10,
            taskStatus: taskStatus, // Pass the taskStatus parameter for volunteered tasks
          })
        ).unwrap();
      }



      // Fetch user badges AND all available badges
      await dispatch(fetchUserBadges(currentId)).unwrap();
      await dispatch(fetchAllBadges()).unwrap();
    } catch (err) {
      console.error("Failed to fetch profile data:", err);
    }
  }, [dispatch, userId, reviewPage, reviewsPerPage, roleTab, requestsTab]);
  useEffect(() => {
    loadProfileData();
  }, [
    loadProfileData,
    refreshData,
    reviewPage,
    reviewsPerPage,
    roleTab,
    requestsTab,
  ]);

  // Reset data refresh flag after loading completes
  useEffect(() => {
    if (!loading && refreshData) {
      setRefreshData(false);
    }
  }, [loading, refreshData]);

  // Close edit profile dialog and refresh data when update is successful
  const { updateSuccess } = useSelector((state) => state.profile);
  const editProfileUpdateSuccess = useSelector(selectUpdateSuccess);
  const editProfileUploadSuccess = useSelector(selectEditUploadSuccess);
  const profileUploadSuccess = useSelector(
    (state) => state.profile?.uploadSuccess
  );

  useEffect(() => {
    if (updateSuccess) {
      setEditProfileOpen(false);
      setRefreshData(true);
      dispatch(clearUpdateSuccess());
    }
  }, [updateSuccess, dispatch]);

  // Handle edit profile dialog success
  useEffect(() => {
    if (editProfileUpdateSuccess) {
      setEditProfileOpen(false);
      setRefreshData(true);
      dispatch(clearEditProfileSuccess());
    }
  }, [editProfileUpdateSuccess, dispatch]);

  // Refresh profile when profile photo upload succeeds (either from profile or edit dialog)
  useEffect(() => {
    if (editProfileUploadSuccess || profileUploadSuccess) {
      const refreshId =
        effectiveProfileId ||
        effectiveLoggedInId ||
        localStorage.getItem("userId");
      if (refreshId) {
        dispatch(fetchUserProfile(refreshId));
        dispatch(fetchCurrentUserProfile());
      }
      if (profileUploadSuccess) {
        dispatch(clearUploadSuccess());
      }
      if (editProfileUploadSuccess) {
        dispatch(clearEditProfileSuccess());
      }
    }
  }, [
    editProfileUploadSuccess,
    profileUploadSuccess,
    dispatch,
    effectiveProfileId,
    effectiveLoggedInId,
  ]);

  // Update review page when user changes
  useEffect(() => {
    if (userId) {
      setReviewPage(1); // Reset to first page when user changes
    }
  }, [userId]);

  // Update follow state when user data changes
  useEffect(() => {
    if (user) {
      setIsFollowing(user.is_following || false);
      setFollowersCount(user.followers_count || 0);
      setFollowingCount(user.following_count || 0);
    }
  }, [user]);

  // Sync user data with editProfile slice when user data changes
  useEffect(() => {
    if (user && canEdit) {
      dispatch(updateUserLocally(user));
    }
  }, [user, canEdit, dispatch]);

  // Sync new profile photo into auth slice so sidebar/footer avatar updates without refresh
  useEffect(() => {
    if (!canEdit) return;
    const newPhoto =
      user?.profile_photo || user?.profilePhoto || user?.profilePicture;
    if (!newPhoto) return;
    const authPhoto =
      auth?.user?.profile_photo ||
      auth?.user?.profilePhoto ||
      auth?.user?.profilePicture;
    if (newPhoto !== authPhoto) {
      dispatch(
        updateAuthUser({
          profile_photo: newPhoto,
          profilePhoto: newPhoto,
          profilePicture: newPhoto,
        })
      );
    }
  }, [
    canEdit,
    user?.profile_photo,
    user?.profilePhoto,
    user?.profilePicture,
    auth?.user,
    dispatch,
  ]);
  const handleRoleChange = (event, newValue) => {
    setRoleTab(newValue);
    setRequestsTab(0); // Reset to active requests whenever role changes
    setReviewPage(1); // Reset to first page of reviews when role changes
    // No need to trigger data reload here, as the effect hook will handle it
  };

  const handleRequestTabChange = (tabIndex) => {
    setRequestsTab(tabIndex);
    // Data reload will be handled by the effect hook
  };

  const handleReviewPageChange = (event, value) => {
    setReviewPage(value);

    // Fetch new page of reviews
    const currentId = userId || localStorage.getItem("userId");

    if (currentId) {
      const reviewRole = roleTab === 0 ? "volunteer" : "requester";
      dispatch(
        fetchUserReviews({
          userId: currentId,
          page: value,
          limit: reviewsPerPage,
          role: reviewRole,
        })
      );
    } else {
      console.error("No user ID available for fetching reviews");
    }
  };
  const getCurrentRequests = () => {
    const requests = roleTab === 0 ? volunteeredRequests : createdRequests;
    if (!requests) return [];

    let dataArray = [];

    if (Array.isArray(requests)) {
      dataArray = requests;
    } else if (requests.tasks) {
      dataArray = requests.tasks;
    } else if (requests.items) {
      dataArray = requests.items;
    } else if (requests.data) {
      dataArray = requests.data;
    }

    // For volunteer tab, we need to extract tasks from volunteer objects
    if (roleTab === 0) {
      return dataArray
        .filter((item) => item.task) // Only include items that have a task
        .map((item) => {
          const task = item.task;
          // Process image URL similar to Home page
          const photoFromList =
            task.photos?.[0]?.url ||
            task.photos?.[0]?.image ||
            task.photos?.[0]?.photo_url;
          const preferred = task.primary_photo_url || photoFromList || null;
          return {
            ...task,
            imageUrl: toAbsoluteUrl(preferred),
            volunteerStatus: item.status,
            volunteerId: item.id,
            // Ensure we only show tasks where this user is actually a volunteer
            isVolunteer: true,
          };
        });
    }

    // For requester tab, process images for created requests
    return dataArray.map((task) => {
      const photoFromList =
        task.photos?.[0]?.url ||
        task.photos?.[0]?.image ||
        task.photos?.[0]?.photo_url;
      const preferred = task.primary_photo_url || photoFromList || null;
      return {
        ...task,
        imageUrl: toAbsoluteUrl(preferred),
      };
    });
  };
  // Get current requests based on the selected tab
  // The API call already filters by active/completed status based on requestsTab
  const currentRequests = getCurrentRequests();

  // No need for client-side pagination since we're using server pagination now

  // Handle badge manuall check
  const handleCheckBadges = async () => {
    try {
      await checkBadges();
      setRefreshData(true); // Trigger reload to get new badges
      alert(t("profile.badges.checkSuccess") || "Badges refreshed successfully!");
    } catch (error) {
      console.error("Error checking badges:", error);
    }
  };

  // Get earned and in-progress badges
  // badges = UserBadge objects { id, user_id, badge: {}, earned_at }
  // allBadges = BadgeDefinition objects { id, badge_type, ... }

  // If badges array is empty but we have allBadges, it means user has 0 badges
  // If both are empty, we might be loading or failed
  // Ensure badges is an array before mapping
  // Handle pagination in badges/allBadges if present
  const safeBadges = Array.isArray(badges) ? badges : (badges?.results || badges?.data || []);
  const safeAllBadges = Array.isArray(allBadges) ? allBadges : (allBadges?.results || allBadges?.data || []);

  const earnedBadges = safeBadges.map(userBadge => ({
    ...(userBadge.badge || userBadge), // Handle if badge is nested or flat
    earned_at: userBadge.earned_at || userBadge.earnedDate, // Add earned date
    user_badge_id: userBadge.id,
    earned: true
  }));

  const earnedBadgeIds = new Set(earnedBadges.map(b => b.id));

  // In progress = All badges that are NOT in earned badges
  const inProgressBadges = safeAllBadges
    .filter(badge => !earnedBadgeIds.has(badge.id))
    .map(badge => ({
      ...badge,
      earned: false
    }));

  // Check if the profile being viewed belongs to a banned user
  const isUserBanned = user?.name === "*deleted";

  // Get initials from name and surname for fallback avatar
  const getInitials = () => {
    const name = user?.name || "";
    const surname = user?.surname || "";

    if (name && surname) {
      return `${name.charAt(0)}${surname.charAt(0)}`.toUpperCase();
    } else if (name) {
      return name.charAt(0).toUpperCase();
    } else if (user?.username) {
      return user.username.charAt(0).toUpperCase();
    }
    return "U";
  };

  // Handler for profile picture upload
  const handleProfilePictureUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      dispatch(uploadProfilePicture(file));
    }
  };

  // Handler for user report
  const handleUserReport = () => {
    if (canEdit) {
      // Don't allow users to report themselves
      return;
    }
    setUserReportDialogOpen(true);
  };

  const handleUserReportSuccess = () => {
    alert(t("profile.report.successMessage"));
  };

  // Handler for follow/unfollow
  const handleFollowToggle = async () => {
    if (followLoading) return;

    setFollowLoading(true);
    try {
      if (isFollowing) {
        await userService.unfollowUser(effectiveProfileId);
        setIsFollowing(false);
        setFollowersCount((prev) => Math.max(0, prev - 1));
      } else {
        await userService.followUser(effectiveProfileId);
        setIsFollowing(true);
        setFollowersCount((prev) => prev + 1);
      }
    } catch (error) {
      console.error("Error toggling follow:", error);
      alert(error?.message || "Failed to update follow status");
    } finally {
      setFollowLoading(false);
    }
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          backgroundColor: colors.background.primary,
        }}
        role="status"
        aria-live="polite"
        aria-busy="true"
      >
        <CircularProgress sx={{ color: colors.brand.primary }} />
      </Box>
    );
  }

  if (error) {
    return (
      <Box
        sx={{
          p: 3,
          textAlign: "center",
          backgroundColor: colors.background.primary,
          minHeight: "100vh",
        }}
        role="alert"
        aria-live="assertive"
      >
        <Typography
          variant="h6"
          gutterBottom
          sx={{ color: colors.semantic.error }}
        >
          {t("profile.error.failedToLoad")}
        </Typography>
        <Typography paragraph sx={{ color: colors.text.secondary }}>
          {error}
        </Typography>
        <Button
          variant="contained"
          onClick={() => setRefreshData(true)}
          sx={{
            mt: 2,
            backgroundColor: colors.brand.primary,
            color: colors.text.inverse,
            "&:hover": {
              backgroundColor: colors.brand.secondary,
            },
          }}
          aria-label={t("profile.actions.retryLoading")}
        >
          {t("common.retry")}
        </Button>
      </Box>
    );
  }
  if (!user) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          backgroundColor: colors.background.primary,
        }}
        role="status"
        aria-live="polite"
        aria-busy="true"
      >
        <CircularProgress sx={{ color: colors.brand.primary }} />
      </Box>
    );
  }

  return (
    <Box
      sx={{
        display: "flex",
        backgroundColor: colors.background.primary,
        minHeight: "100vh",
      }}
    >
      {/* Main content */}
      <Box
        component="main"
        role="main"
        aria-labelledby="profile-page-title"
        sx={{ flexGrow: 1, p: 3, overflow: "auto" }}
      >
        <Container maxWidth="lg">
          {/* Profile header */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              mb: 3,
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <Box sx={{ position: "relative" }}>
                {toAbsoluteUrl(
                  user.profile_photo || user.profilePhoto || user.profilePicture
                ) ? (
                  <Avatar
                    src={toAbsoluteUrl(
                      user.profile_photo ||
                      user.profilePhoto ||
                      user.profilePicture
                    )}
                    alt={user.name}
                    sx={{ width: 80, height: 80 }}
                  />
                ) : (
                  <Avatar
                    sx={{
                      width: 80,
                      height: 80,
                      backgroundColor: isUserBanned
                        ? colors.text.tertiary
                        : colors.brand.primary,
                      fontSize: "2rem",
                      fontWeight: "semibold",
                    }}
                  >
                    {getInitials()}
                  </Avatar>
                )}
                {/* Only show edit button for current user's profile */}
                {(() => {
                  // Get logged-in user ID with fallback to user object if direct ID is not available
                  const loggedInUserId = localStorage.getItem("userId");
                  const loggedInUserObj = localStorage.getItem("user")
                    ? JSON.parse(localStorage.getItem("user"))
                    : null;
                  const loggedInUserIdFromObj = loggedInUserObj?.id;
                  const effectiveLoggedInUserId =
                    loggedInUserId || loggedInUserIdFromObj;

                  // Check if viewing own profile through multiple possible conditions
                  const isOwnProfile =
                    userId === "current" ||
                    userId === "me" ||
                    !userId ||
                    (effectiveLoggedInUserId &&
                      userId === effectiveLoggedInUserId) ||
                    // Also handle the case where no userId is directly available but user is authenticated
                    (!effectiveLoggedInUserId && authState?.isAuthenticated);
                  console.log("Profile pic edit button check:", {
                    userId,
                    loggedInUserId,
                    isOwnProfile,
                  });
                  return isOwnProfile ? (
                    <IconButton
                      component="label"
                      sx={{
                        position: "absolute",
                        bottom: 0,
                        right: 0,
                        backgroundColor: "rgba(255,255,255,0.8)",
                        "&:hover": { backgroundColor: "rgba(255,255,255,0.9)" },
                      }}
                      aria-label={t("profile.actions.uploadProfilePicture")}
                    >
                      <input
                        type="file"
                        accept="image/*"
                        hidden
                        onChange={handleProfilePictureUpload}
                      />
                      <Edit fontSize="small" />
                    </IconButton>
                  ) : null;
                })()}
              </Box>
              <Box>
                <Typography
                  variant="h5"
                  component="h1"
                  sx={{
                    textAlign: "left",
                    color: isUserBanned
                      ? colors.text.tertiary
                      : colors.text.primary,
                  }}
                  id="profile-page-title"
                >
                  {user.name} {user.surname}
                </Typography>

                {/* Followers and Following counts */}
                <Box
                  sx={{ display: "flex", alignItems: "center", gap: 2, mb: 1 }}
                >
                  <Box
                    onClick={handleFollowersClick}
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      cursor: "pointer",
                      "&:hover": {
                        opacity: 0.7,
                      },
                    }}
                  >
                    <Typography
                      variant="body2"
                      sx={{ color: colors.text.secondary }}
                    >
                      <strong>{followersCount}</strong> followers
                    </Typography>
                  </Box>
                  <Box
                    onClick={handleFollowingClick}
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      cursor: "pointer",
                      "&:hover": {
                        opacity: 0.7,
                      },
                    }}
                  >
                    <Typography
                      variant="body2"
                      sx={{ color: colors.text.secondary }}
                    >
                      <strong>{followingCount}</strong> following
                    </Typography>
                  </Box>
                </Box>

                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Rating
                    value={user.rating}
                    precision={0.1}
                    readOnly
                    sx={{
                      "& .MuiRating-iconFilled": {
                        color: colors.semantic.warning,
                      },
                      "& .MuiRating-iconEmpty": {
                        color: colors.border.secondary,
                      },
                    }}
                  />
                  <Chip
                    label={`${(
                      Math.round((user.rating || 0) * 10) / 10
                    ).toFixed(1)} (${user.reviewCount || reviews?.reviews?.length || 0
                      } ${t("profile.reviews.title")})`}
                    onClick={() => setRatingCategoriesOpen(true)}
                    sx={{
                      backgroundColor: colors.brand.primary,
                      color: colors.text.inverse,
                      "& .MuiChip-label": { px: 2 },
                      cursor: "pointer",
                      "&:hover": {
                        backgroundColor: colors.brand.secondary,
                      },
                    }}
                  />
                </Box>

                {/* Follow/Unfollow and Report buttons - only show for other users */}
                {!canEdit && !isUserBanned && (
                  <Box sx={{ display: "flex", gap: 1, mt: 1 }}>
                    <Button
                      onClick={handleFollowToggle}
                      disabled={followLoading}
                      startIcon={isFollowing ? <PersonRemove /> : <PersonAdd />}
                      variant={isFollowing ? "outlined" : "contained"}
                      sx={{
                        textTransform: "none",
                        borderRadius: "20px",
                        px: 3,
                        ...(isFollowing
                          ? {
                            color: colors.brand.primary,
                            borderColor: colors.brand.primary,
                            "&:hover": {
                              backgroundColor: `${colors.brand.primary}0A`,
                              borderColor: colors.brand.secondary,
                            },
                          }
                          : {
                            backgroundColor: colors.brand.primary,
                            color: colors.text.inverse,
                            "&:hover": {
                              backgroundColor: colors.brand.secondary,
                            },
                          }),
                      }}
                    >
                      {followLoading
                        ? "..."
                        : isFollowing
                          ? "Unfollow"
                          : "Follow"}
                    </Button>
                    <Button
                      onClick={handleUserReport}
                      startIcon={<FlagIcon />}
                      sx={{
                        color: colors.semantic.error,
                        borderColor: colors.semantic.error,
                        textTransform: "none",
                        borderRadius: "20px",
                        "&:hover": {
                          backgroundColor: `${colors.semantic.error}15`,
                          borderColor: colors.semantic.error,
                        },
                      }}
                      variant="outlined"
                    >
                      {t("profile.actions.report")}
                    </Button>
                  </Box>
                )}
              </Box>
            </Box>
            {/* Edit Profile Button - Only show for current user */}
            {canEdit && (
              <Button
                variant="outlined"
                startIcon={<Edit sx={{ color: colors.brand.primary }} />}
                onClick={() => setEditProfileOpen(true)}
                sx={{
                  borderRadius: "20px",
                  borderColor: colors.brand.primary,
                  color: colors.brand.primary,
                  "&:hover": {
                    borderColor: colors.brand.secondary,
                    backgroundColor: `${colors.brand.primary}0A`,
                  },
                  px: 3,
                  py: 1,
                  textTransform: "none",
                  fontWeight: 500,
                }}
                aria-label={t("profile.actions.editProfile")}
              >
                {t("profile.actions.editProfile")}
              </Button>
            )}
          </Box>
          {/* Badges section */}
          <Paper
            elevation={0}
            sx={{
              p: 2,
              mb: 4,
              borderRadius: 2,
              border: `1px solid ${colors.border.primary}`,
              backgroundColor: colors.background.secondary,
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
              <EmojiEvents sx={{ color: colors.semantic.warning, mr: 1 }} />
              <Typography
                variant="h6"
                component="h2"
                sx={{ fontWeight: "bold", color: colors.text.primary }}
              >
                {t("profile.badges.title")}
              </Typography>
              <MuiBadge
                badgeContent={earnedBadges.length}
                sx={{
                  ml: 4,
                  "& .MuiBadge-badge": {
                    backgroundColor: colors.brand.primary,
                    color: colors.text.inverse,
                  },
                }}
                aria-label={`${t("profile.badges.earned")}: ${earnedBadges.length
                  }`}
              />
              {/* Manual Check Button - Only for own profile */}
              {canEdit && (
                <Button
                  size="small"
                  variant="outlined"
                  onClick={handleCheckBadges}
                  sx={{ ml: 'auto' }}
                >
                  {t("profile.badges.refreshBadges")}
                </Button>
              )}
            </Box>

            {/* Earned badges */}
            <Box>
              <Typography
                variant="subtitle2"
                sx={{ mb: 1, color: colors.text.secondary }}
              >
                {t("profile.badges.earnedAchievements")}
              </Typography>
              <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", mb: 2 }}>
                {earnedBadges.length > 0 ? (
                  earnedBadges.map((badge) => (
                    <Badge key={badge.id} badge={badge} />
                  ))
                ) : (
                  <Typography
                    variant="body2"
                    sx={{ color: colors.text.secondary }}
                  >
                    {t("profile.badges.noBadgesYet")}
                  </Typography>
                )}
              </Box>
            </Box>

            {/* Divider if there are in-progress badges */}
            {inProgressBadges.length > 0 && (
              <Divider sx={{ my: 2, borderColor: colors.border.secondary }} />
            )}

            {/* In-progress badges */}
            {inProgressBadges.length > 0 && (
              <Box>
                <Typography
                  variant="subtitle2"
                  sx={{ mb: 1, color: colors.text.secondary }}
                >
                  {t("profile.badges.inProgress")}
                </Typography>
                <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
                  {inProgressBadges.map((badge) => (
                    <Badge key={badge.id} badge={badge} />
                  ))}
                </Box>
              </Box>
            )}
          </Paper>
          {/* Role tabs */}
          <Box sx={{ width: "100%", mb: 4 }}>
            <Box
              sx={{
                borderBottom: 0,
                display: "flex",
                "& .MuiTabs-flexContainer": {
                  justifyContent: "center",
                  width: "100%",
                  gap: 2,
                },
              }}
            >
              <Tabs
                value={roleTab}
                onChange={handleRoleChange}
                centered
                sx={{ width: "100%" }}
                TabIndicatorProps={{ style: { display: "none" } }}
              >
                <Tab
                  label={t("profile.tabs.volunteer")}
                  sx={{
                    borderRadius: "4px",
                    backgroundColor:
                      roleTab === 0 ? colors.brand.primary : "transparent",
                    color: roleTab === 0 ? "#FFFFFF" : colors.text.primary,
                    width: "50%",
                    "&.Mui-selected": {
                      color: "#FFFFFF",
                    },
                    "&:focus": {
                      color: "#FFFFFF",
                    },
                    "&:hover": {
                      backgroundColor:
                        roleTab === 0
                          ? colors.brand.secondary
                          : colors.background.tertiary,
                    },
                  }}
                />
                <Tab
                  label={t("profile.tabs.requester")}
                  sx={{
                    borderRadius: "4px",
                    backgroundColor:
                      roleTab === 1 ? colors.brand.primary : "transparent",
                    color: roleTab === 1 ? "#FFFFFF" : colors.text.primary,
                    width: "50%",
                    "&.Mui-selected": {
                      color: "#FFFFFF",
                    },
                    "&:focus": {
                      color: "#FFFFFF",
                    },
                    "&:hover": {
                      backgroundColor:
                        roleTab === 1
                          ? colors.brand.secondary
                          : colors.background.tertiary,
                    },
                  }}
                />
              </Tabs>
            </Box>
          </Box>
          {/* Requests section */}
          <Box sx={{ mb: 4 }}>
            {/* Active/Past Requests Header */}{" "}
            <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
              {requestsTab === 1 && (
                <IconButton
                  onClick={() => handleRequestTabChange(0)}
                  sx={{ mr: -1 }}
                  aria-label={t("profile.actions.backToActiveRequests")}
                >
                  <ArrowBack fontSize="small" />
                </IconButton>
              )}
              <Typography
                variant="h6"
                component="h2"
                onClick={() => handleRequestTabChange(0)}
                sx={{
                  cursor: "pointer",
                  fontWeight: requestsTab === 0 ? "bold" : "normal",
                  mr: 4,
                  color:
                    requestsTab === 0
                      ? colors.text.primary
                      : colors.text.secondary,
                  "&:hover": {
                    color: colors.text.primary,
                  },
                }}
              >
                {roleTab === 0
                  ? t("profile.requests.activeVolunteering")
                  : t("profile.requests.activeRequests")}
              </Typography>
              <Typography
                variant="h6"
                component="h2"
                onClick={() => handleRequestTabChange(1)}
                sx={{
                  cursor: "pointer",
                  fontWeight: requestsTab === 1 ? "bold" : "normal",
                  color:
                    requestsTab === 1
                      ? colors.text.primary
                      : colors.text.secondary,
                  "&:hover": {
                    color: colors.text.primary,
                  },
                }}
              >
                {roleTab === 0
                  ? t("profile.requests.pastVolunteering")
                  : t("profile.requests.pastRequests")}
              </Typography>
            </Box>
            {/* Requester-specific instructions when no requests */}
            {roleTab === 1 &&
              currentRequests.length === 0 &&
              requestsTab === 0 && (
                <Box sx={{ textAlign: "center", py: 4, mb: 2 }}>
                  <Typography
                    variant="h6"
                    gutterBottom
                    sx={{ color: colors.text.secondary }}
                  >
                    {t("profile.requests.noRequestsYet")}
                  </Typography>
                  <Button
                    variant="contained"
                    sx={{
                      mt: 2,
                      borderRadius: "20px",
                      px: 3,
                      py: 1,
                      backgroundColor: colors.brand.primary,
                      color: colors.text.inverse,
                      "&:hover": {
                        backgroundColor: colors.brand.secondary,
                      },
                    }}
                    href="/create-request"
                  >
                    {t("profile.requests.createNewRequest")}
                  </Button>
                </Box>
              )}
            {/* Volunteer-specific instructions when no volunteering */}
            {roleTab === 0 &&
              currentRequests.length === 0 &&
              requestsTab === 0 && (
                <Box sx={{ textAlign: "center", py: 4, mb: 2 }}>
                  <Typography
                    variant="h6"
                    gutterBottom
                    sx={{ color: colors.text.secondary }}
                  >
                    {t("profile.requests.noVolunteeringYet")}
                  </Typography>
                  <Button
                    variant="contained"
                    sx={{
                      mt: 2,
                      borderRadius: "20px",
                      px: 3,
                      py: 1,
                      backgroundColor: colors.brand.primary,
                      color: colors.text.inverse,
                      "&:hover": {
                        backgroundColor: colors.brand.secondary,
                      },
                    }}
                    href="/requests"
                  >
                    {t("profile.requests.findTasks")}
                  </Button>
                </Box>
              )}
            {/* Current Requests Grid Layout */}
            <Box sx={{ mb: 4 }}>
              <Grid container spacing={2} sx={{ justifyContent: "center" }}>
                {currentRequests.length > 0 ? (
                  currentRequests.map((request) => (
                    <Grid
                      sx={{ gridColumn: { xs: "span 12", sm: "span 6" } }}
                      key={request.id}
                    >
                      <RequestCard
                        request={request}
                        userRole={roleTab === 0 ? "volunteer" : "requester"}
                        onUpdate={() => setRefreshData(true)}
                        onClick={() => navigate(`/requests/${request.id}`)}
                      />
                    </Grid>
                  ))
                ) : (
                  <Grid item xs={12}>
                    {requestsTab === 1 && (
                      <Typography
                        align="center"
                        sx={{ mb: 4, mt: 2, color: colors.text.secondary }}
                      >
                        {roleTab === 0
                          ? t("profile.requests.noPastVolunteering")
                          : t("profile.requests.noPastRequests")}
                      </Typography>
                    )}
                  </Grid>
                )}
              </Grid>
            </Box>
          </Box>{" "}
          {/* Reviews section */}
          <Box>
            <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
              <Typography
                variant="h6"
                component="h2"
                sx={{ fontWeight: "bold", mr: 2, color: colors.text.primary }}
              >
                {t("profile.reviews.title")}
              </Typography>
              <Chip
                label={`${(Math.round((user.rating || 0) * 10) / 10).toFixed(
                  1
                )} (${reviews?.reviews?.length || 0} ${t(
                  "profile.reviews.title"
                )})`}
                size="small"
                sx={{
                  backgroundColor: colors.brand.primary,
                  color: colors.text.inverse,
                  "& .MuiChip-label": { px: 1 },
                }}
              />
            </Box>
            <Box>
              {reviews && reviews.reviews && reviews.reviews.length > 0 ? (
                <>
                  {reviews.reviews.map((review) => (
                    <Box key={review.id} sx={{ mb: 2 }}>
                      <ReviewCard review={review} />
                    </Box>
                  ))}
                  {/* Pagination controls for reviews */}
                  {reviews.pagination && reviews.pagination.total_pages > 1 && (
                    <Box
                      sx={{ display: "flex", justifyContent: "center", mt: 3 }}
                    >
                      <Pagination
                        count={reviews.pagination.total_pages}
                        page={reviewPage}
                        onChange={handleReviewPageChange}
                        sx={{
                          "& .MuiPaginationItem-root": {
                            color: colors.text.primary,
                            borderColor: colors.border.primary,
                            "&:hover": {
                              backgroundColor: colors.background.tertiary,
                            },
                          },
                          "& .Mui-selected": {
                            backgroundColor: `${colors.brand.primary} !important`,
                            color: `${colors.text.inverse} !important`,
                            "&:hover": {
                              backgroundColor: `${colors.brand.secondary} !important`,
                            },
                          },
                        }}
                      />
                    </Box>
                  )}
                </>
              ) : (
                <Typography sx={{ color: colors.text.secondary }}>
                  {t("profile.reviews.noReviewsYet")}
                </Typography>
              )}
            </Box>
          </Box>
        </Container>
      </Box>

      {/* Edit Profile Dialog */}
      <EditProfileDialog
        open={editProfileOpen}
        onClose={() => setEditProfileOpen(false)}
        onSuccess={() => {
          // Refresh profile data after successful update
          setRefreshData(true);
        }}
        user={user}
      />

      {/* Rating Categories Modal */}
      <RatingCategoriesModal
        open={ratingCategoriesOpen}
        onClose={() => setRatingCategoriesOpen(false)}
        user={user}
        role={roleTab === 0 ? "volunteer" : "requester"}
      />
      {/* User Report Dialog */}
      <UserReportModal
        open={userReportDialogOpen}
        onClose={() => setUserReportDialogOpen(false)}
        user={user}
        currentUser={loggedInUserData}
        onSubmitSuccess={handleUserReportSuccess}
      />
    </Box>
  );
};

export default ProfilePage;
