import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Container,
  Typography,
  CircularProgress,
  IconButton,
  Avatar,
  Paper,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Pagination,
  Button,
} from "@mui/material";
import { ArrowBack } from "@mui/icons-material";
import { useTheme } from "../hooks/useTheme";
import userService from "../services/userService";
import { toAbsoluteUrl } from "../utils/url";

const FollowingPage = () => {
  const { colors } = useTheme();
  const { userId } = useParams();
  const navigate = useNavigate();

  const [following, setFollowing] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const itemsPerPage = 20;

  useEffect(() => {
    const fetchFollowing = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await userService.getFollowing(
          userId,
          page,
          itemsPerPage
        );
        console.log("Following API response:", response);

        // Backend returns format: {status, message, data: [...]}
        // OR paginated: {status, message, results: [...], count: X, next, previous}
        let followingData = [];
        let count = 0;

        if (response.data) {
          // Check if it's a paginated response (has results field)
          if (response.data.results) {
            followingData = response.data.results;
            count = response.data.count || followingData.length;
          } else if (Array.isArray(response.data)) {
            // Direct array in data field
            followingData = response.data;
            count = followingData.length;
          } else {
            // Might be wrapped in another data field
            followingData = response.data.data || [];
            count = followingData.length;
          }
        } else if (response.results) {
          // Paginated at top level
          followingData = response.results;
          count = response.count || followingData.length;
        } else if (Array.isArray(response)) {
          // Direct array response
          followingData = response;
          count = followingData.length;
        }

        console.log("Processed following data:", followingData);
        setFollowing(followingData);
        setTotalCount(count);
        setTotalPages(Math.ceil(count / itemsPerPage) || 1);
      } catch (err) {
        console.error("Error fetching following:", err);
        setError(err.message || "Failed to load following");
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchFollowing();
    }
  }, [userId, page]);

  const handlePageChange = (event, value) => {
    setPage(value);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleUserClick = (followingId) => {
    navigate(`/profile/${followingId}`);
  };

  const getInitials = (name, surname) => {
    if (name && surname) {
      return `${name.charAt(0)}${surname.charAt(0)}`.toUpperCase();
    } else if (name) {
      return name.charAt(0).toUpperCase();
    }
    return "U";
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
      >
        <Typography
          variant="h6"
          gutterBottom
          sx={{ color: colors.semantic.error }}
        >
          Error loading following
        </Typography>
        <Typography paragraph sx={{ color: colors.text.secondary }}>
          {error}
        </Typography>
        <Button
          variant="contained"
          onClick={() => navigate(-1)}
          sx={{
            mt: 2,
            backgroundColor: colors.brand.primary,
            color: colors.text.inverse,
            "&:hover": {
              backgroundColor: colors.brand.secondary,
            },
          }}
        >
          Go Back
        </Button>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        backgroundColor: colors.background.primary,
        minHeight: "100vh",
        py: 3,
      }}
    >
      <Container maxWidth="md">
        {/* Header */}
        <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
          <IconButton
            onClick={() => navigate(-1)}
            sx={{ mr: 2, color: colors.text.primary }}
            aria-label="Go back"
          >
            <ArrowBack />
          </IconButton>
          <Box>
            <Typography
              variant="h5"
              component="h1"
              sx={{ color: colors.text.primary, fontWeight: "bold" }}
            >
              Following
            </Typography>
            <Typography variant="body2" sx={{ color: colors.text.secondary }}>
              {totalCount} following
            </Typography>
          </Box>
        </Box>

        {/* Following List */}
        {following.length === 0 ? (
          <Paper
            elevation={0}
            sx={{
              p: 4,
              textAlign: "center",
              borderRadius: 2,
              border: `1px solid ${colors.border.primary}`,
              backgroundColor: colors.background.secondary,
            }}
          >
            <Typography sx={{ color: colors.text.secondary }}>
              Not following anyone yet
            </Typography>
          </Paper>
        ) : (
          <Paper
            elevation={0}
            sx={{
              borderRadius: 2,
              border: `1px solid ${colors.border.primary}`,
              backgroundColor: colors.background.secondary,
            }}
          >
            <List>
              {following.map((user, index) => (
                <ListItem
                  key={user.id}
                  button
                  onClick={() => handleUserClick(user.id)}
                  sx={{
                    borderBottom:
                      index < following.length - 1
                        ? `1px solid ${colors.border.secondary}`
                        : "none",
                    "&:hover": {
                      backgroundColor: colors.background.tertiary,
                    },
                    cursor: "pointer",
                  }}
                >
                  <ListItemAvatar>
                    {user.profile_photo ? (
                      <Avatar
                        src={toAbsoluteUrl(user.profile_photo)}
                        alt={user.username}
                        sx={{ width: 48, height: 48 }}
                      />
                    ) : (
                      <Avatar
                        sx={{
                          width: 48,
                          height: 48,
                          backgroundColor: colors.brand.primary,
                          color: colors.text.inverse,
                        }}
                      >
                        {getInitials(user.name, user.surname)}
                      </Avatar>
                    )}
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Typography
                        variant="body1"
                        sx={{ color: colors.text.primary, fontWeight: 500 }}
                      >
                        {user.name} {user.surname}
                      </Typography>
                    }
                    secondary={
                      <Typography
                        variant="body2"
                        sx={{ color: colors.text.secondary }}
                      >
                        @{user.username}
                      </Typography>
                    }
                  />
                </ListItem>
              ))}
            </List>
          </Paper>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <Box sx={{ display: "flex", justifyContent: "center", mt: 3 }}>
            <Pagination
              count={totalPages}
              page={page}
              onChange={handlePageChange}
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
      </Container>
    </Box>
  );
};

export default FollowingPage;
