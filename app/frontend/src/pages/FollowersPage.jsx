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

const FollowersPage = () => {
  const { colors } = useTheme();
  const { userId } = useParams();
  const navigate = useNavigate();

  const [followers, setFollowers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const itemsPerPage = 20;

  useEffect(() => {
    const fetchFollowers = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await userService.getFollowers(
          userId,
          page,
          itemsPerPage
        );
        console.log("Followers API response:", response);

        // Backend returns format: {status, message, data: [...]}
        // OR paginated: {status, message, results: [...], count: X, next, previous}
        let followersData = [];
        let count = 0;

        if (response.data) {
          // Check if it's a paginated response (has results field)
          if (response.data.results) {
            followersData = response.data.results;
            count = response.data.count || followersData.length;
          } else if (Array.isArray(response.data)) {
            // Direct array in data field
            followersData = response.data;
            count = followersData.length;
          } else {
            // Might be wrapped in another data field
            followersData = response.data.data || [];
            count = followersData.length;
          }
        } else if (response.results) {
          // Paginated at top level
          followersData = response.results;
          count = response.count || followersData.length;
        } else if (Array.isArray(response)) {
          // Direct array response
          followersData = response;
          count = followersData.length;
        }

        console.log("Processed followers data:", followersData);
        setFollowers(followersData);
        setTotalCount(count);
        setTotalPages(Math.ceil(count / itemsPerPage) || 1);
      } catch (err) {
        console.error("Error fetching followers:", err);
        setError(err.message || "Failed to load followers");
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchFollowers();
    }
  }, [userId, page]);

  const handlePageChange = (event, value) => {
    setPage(value);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleUserClick = (followerId) => {
    navigate(`/profile/${followerId}`);
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
          Error loading followers
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
              Followers
            </Typography>
            <Typography variant="body2" sx={{ color: colors.text.secondary }}>
              {totalCount} {totalCount === 1 ? "follower" : "followers"}
            </Typography>
          </Box>
        </Box>

        {/* Followers List */}
        {followers.length === 0 ? (
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
              No followers yet
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
              {followers.map((follower, index) => (
                <ListItem
                  key={follower.id}
                  button
                  onClick={() => handleUserClick(follower.id)}
                  sx={{
                    borderBottom:
                      index < followers.length - 1
                        ? `1px solid ${colors.border.secondary}`
                        : "none",
                    "&:hover": {
                      backgroundColor: colors.background.tertiary,
                    },
                    cursor: "pointer",
                  }}
                >
                  <ListItemAvatar>
                    {follower.profile_photo ? (
                      <Avatar
                        src={toAbsoluteUrl(follower.profile_photo)}
                        alt={follower.username}
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
                        {getInitials(follower.name, follower.surname)}
                      </Avatar>
                    )}
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Typography
                        variant="body1"
                        sx={{ color: colors.text.primary, fontWeight: 500 }}
                      >
                        {follower.name} {follower.surname}
                      </Typography>
                    }
                    secondary={
                      <Typography
                        variant="body2"
                        sx={{ color: colors.text.secondary }}
                      >
                        @{follower.username}
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

export default FollowersPage;
