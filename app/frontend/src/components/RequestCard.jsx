import React from "react";
import {
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  useTheme,
  Divider,
  Paper,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import PriorityHighIcon from "@mui/icons-material/PriorityHigh";
import { categoryMapping } from "../constants/categories";
import { formatRelativeTime } from "../utils/dateUtils";
import { urgencyLevels } from "../constants/urgency_level";
/**
 * RequestCard component that displays a request with category, urgency, and other details.
 * @param {Object} props
 * @param {Object} props.request - The request data
 * @param {string} props.request.id - Unique identifier for the request
 * @param {string} props.request.title - Title of the request
 * @param {string} props.request.category - Category this request belongs to
 * @param {string} props.request.urgency_level - Urgency level (e.g. 'High', 'Medium', 'Low')
 * @param {string} props.request.created_at - ISO timestamp when the request was created
 * @param {string} props.request.deadline - ISO timestamp for the request's deadline
 * @param {string} props.request.imageUrl - Optional image for the request
 * @param {Function} props.onClick - Function called when card is clicked
 * @param {Object} props.sx - Additional MUI sx styles to apply
 */
const RequestCard = ({ request, onClick, sx = {} }) => {
  const theme = useTheme();
  const navigate = useNavigate();

  const handleCategoryClick = (category, event) => {
    // Prevent triggering the card's onClick
    event.stopPropagation();

    navigate(`/requests?category=${category}`);
  };
  const handleUrgencyClick = (urgencyLevel, event) => {
    // Prevent triggering the card's onClick
    event.stopPropagation();
    // Navigate to filtered requests by urgency using query params
    navigate(`/requests?urgency_level=${urgencyLevel}`);
  };

  return (
    <Card
      onClick={() => onClick?.(request.id)}
      elevation={2}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " " || e.key === "Spacebar") {
          e.preventDefault();
          onClick(request.id);
        }
      }}
      role="button"
      tabIndex={0}
      sx={{
        display: "flex",
        flexDirection: "column",
        borderRadius: 2,
        cursor: "pointer",
        transition: "transform 0.2s, box-shadow 0.2s",
        overflow: "hidden",
        width: {
          xs: "100%", // Full width on mobile
          sm: "400px", // Increased width on tablet and up
        },
        mx: "auto", // Center card in parent container
        backgroundColor: "white",
        "&:hover": {
          transform: "translateY(-4px)",
          boxShadow: theme.shadows[4],
        },
        ...sx,
      }}
    >
      {/* Top section with image on left, title and time on right */}
      <Box sx={{ display: "flex", p: 2 }}>
        {/* Request Image with padding and rounded corners - smaller dimensions */}
        <Box
          sx={{
            width: 90,
            height: 90,
            flexShrink: 0,
            backgroundColor: theme.palette.grey[100],
            borderRadius: 3.5, // More rounded corners
            overflow: "hidden",
            mr: 2.5, // Increased margin right to separate from text
            border: `1px solid ${theme.palette.grey[200]}`, // Subtle border
            p: 0.5, // Padding inside the image container
          }}
        >
          {request.imageUrl ? (
            <Box
              component="img"
              src={request.imageUrl}
              alt={request.title}
              sx={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                borderRadius: 3, // Rounded image corners
              }}
            />
          ) : (
            // Placeholder when no image
            <Box
              sx={{
                width: "100%",
                height: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Typography variant="body2" color="text.secondary">
                No Image
              </Typography>
            </Box>
          )}
        </Box>
        {/* Title and time to the right of image - wider area */}
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            width: "calc(100% - 110px)", // Adjust width based on image size + margin
          }}
        >
          {/* Title - left aligned and bold */}
          <Typography
            variant="subtitle1"
            component="div"
            fontWeight="bold"
            align="left"
            sx={{
              mt: 0,
              mb: 1,
              overflow: "hidden",
              textOverflow: "ellipsis",
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              lineHeight: 1.3, // Tighter line height
            }}
          >
            {request.title}
          </Typography>
          {/* Deadline */}
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <PriorityHighIcon
              fontSize="small"
              sx={{ color: "text.secondary", mr: 0.5 }}
            />
            <Typography variant="body2" color="text.secondary">
              Deadline{" "}
              {request.deadline
                ? formatRelativeTime(request.deadline)
                : "time is unknown"}
            </Typography>
          </Box>

          {/* Time Posted */}
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <AccessTimeIcon
              fontSize="small"
              sx={{ color: "text.secondary", mr: 0.5 }}
            />
            <Typography variant="body2" color="text.secondary">
              Posted{" "}
              {request.created_at
                ? formatRelativeTime(request.created_at)
                : "time is unknown"}
            </Typography>
          </Box>
        </Box>
      </Box>
      <CardContent
        sx={{ pt: 0, px: 2, pb: 2, display: "flex", flexDirection: "column" }}
      >
        <Divider sx={{ mt: 1, mb: 2 }} />
        {/* Category and Urgency */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 1.5,
          }}
        >
          {/* Single Category chip */}
          {request.category && (
            <Chip
              label={categoryMapping[request.category] || request.category}
              size="small"
              onClick={(e) => handleCategoryClick(request.category, e)}
              sx={{
                borderRadius: "16px",
                bgcolor: theme.palette.action.hover,
                "&:hover": {
                  bgcolor: theme.palette.action.selected,
                },
              }}
            />
          )}          {/* Urgency chip/label */}
          <Chip
            label={"Urgency: " + (request.urgency_level && urgencyLevels[request.urgency_level] 
              ? urgencyLevels[request.urgency_level].name 
              : request.urgency || "Unknown")}
            size="small"
            onClick={(e) => handleUrgencyClick(request.urgency_level || request.urgency || "3", e)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " " || e.key === "Spacebar") {
                e.preventDefault();
                e.stopPropagation(); // Prevent card's keyboard handler
                handleUrgencyClick(request.urgency_level || request.urgency || "3", e);
              }
            }}            tabIndex={0}
            sx={{
              borderRadius: "16px",
              color: "white",
              bgcolor: (request.urgency_level && urgencyLevels[request.urgency_level]) 
                ? urgencyLevels[request.urgency_level].color
                : theme.palette.grey[500],
              fontWeight: "medium",
              "&:hover": {
                opacity: 0.9,
              },
              // Make high urgency chips slightly more prominent
              ...(request.urgency_level && urgencyLevels[request.urgency_level] && 
                urgencyLevels[request.urgency_level].name === "Critical" && {
                fontWeight: "bold",
                px: 0.5, // Slightly more padding for high urgency
              }),
            }}
          />
        </Box>

        {/* Location if available */}
        {request.location && (
          <Box sx={{ display: "flex", alignItems: "center", mt: 0.5 }}>
            <LocationOnIcon
              fontSize="small"
              sx={{ color: "text.secondary", mr: 0.5 }}
            />
            <Typography variant="body2" color="text.secondary">
              {request.location}
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default RequestCard;
