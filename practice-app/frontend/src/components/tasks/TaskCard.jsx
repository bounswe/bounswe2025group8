import {
  Box,
  Card,
  CardContent,
  Typography,
  Avatar,
  Chip,
  Button,
  Stack,
  Divider,
  IconButton,
} from "@mui/material";
import {
  AccessTime as AccessTimeIcon,
  LocationOn as LocationOnIcon,
  Person as PersonIcon,
  Phone as PhoneIcon,
  Star as StarIcon,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";

const TaskCard = ({
  task,
  onVolunteer,
  onCancel,
  onComplete,
  onReview,
  viewType = "volunteer",
  showActions = true,
  statusText,
}) => {
  const navigate = useNavigate();

  const formatDate = (date) => {
    if (!date) return "";
    const d = new Date(date);
    return d.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "numeric",
      hour12: true,
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "#f5a623";
      case "accepted":
        return "#5cb85c";
      case "in-progress":
        return "#5cb85c";
      case "completed":
        return "#007bff";
      default:
        return "#f5a623";
    }
  };

  const getUrgencyColor = (urgency) => {
    if (urgency.includes("High")) return "#f44336";
    if (urgency.includes("Medium")) return "#ff9800";
    return "#4caf50";
  };

  const renderActionButton = () => {
    if (!showActions) return null;

    if (viewType === "volunteer") {
      switch (task.status) {
        case "pending":
          return (
            <Button
              variant="contained"
              fullWidth
              sx={{
                borderRadius: 28,
                backgroundColor: "#6C63FF",
                "&:hover": { backgroundColor: "#5a52d5" },
                py: 1.5,
              }}
              onClick={() => onVolunteer(task.id)}
            >
              Be Volunteer
            </Button>
          );
        case "accepted":
        case "in-progress":
          return (
            <Button
              variant="outlined"
              color="error"
              fullWidth
              sx={{
                borderRadius: 28,
                py: 1.5,
              }}
              onClick={() => onCancel(task.id)}
            >
              Cancel Volunteering
            </Button>
          );
        case "completed":
          return task.volunteerReview ? (
            <Button
              variant="outlined"
              fullWidth
              startIcon={<StarIcon />}
              sx={{
                borderRadius: 28,
                py: 1.5,
                color: "#FF69B4",
                borderColor: "#FF69B4",
              }}
              onClick={() => navigate(`/volunteer/review/${task.id}`)}
            >
              Edit Rate & Review
            </Button>
          ) : (
            <Button
              variant="contained"
              fullWidth
              startIcon={<StarIcon />}
              sx={{
                borderRadius: 28,
                py: 1.5,
                bgcolor: "#FF69B4",
                "&:hover": { bgcolor: "#E45D9F" },
              }}
              onClick={() => onReview(task.id)}
            >
              Rate & Review
            </Button>
          );
        default:
          return null;
      }
    } else {
      // requester view
      switch (task.status) {
        case "pending":
          return (
            <Stack direction="row" spacing={1} width="100%">
              <Button
                variant="outlined"
                color="primary"
                sx={{ flex: 1, borderRadius: 28, py: 1 }}
                onClick={() =>
                  navigate(`/requester/select-volunteer/${task.id}`)
                }
              >
                Select Volunteer
              </Button>
              <Button
                variant="outlined"
                color="error"
                sx={{ flex: 1, borderRadius: 28, py: 1 }}
                onClick={() => onCancel(task.id)}
              >
                Delete Request
              </Button>
            </Stack>
          );
        case "accepted":
        case "in-progress":
          return (
            <Button
              variant="contained"
              color="success"
              fullWidth
              sx={{ borderRadius: 28, py: 1.5 }}
              onClick={() => onComplete(task.id)}
            >
              Mark as Completed
            </Button>
          );
        case "completed":
          return task.requesterReview ? (
            <Button
              variant="outlined"
              fullWidth
              startIcon={<StarIcon />}
              sx={{
                borderRadius: 28,
                py: 1.5,
                color: "#FF69B4",
                borderColor: "#FF69B4",
              }}
              onClick={() => navigate(`/requester/edit-review/${task.id}`)}
            >
              Edit Rate & Review
            </Button>
          ) : (
            <Button
              variant="contained"
              fullWidth
              startIcon={<StarIcon />}
              sx={{
                borderRadius: 28,
                py: 1.5,
                bgcolor: "#FF69B4",
                "&:hover": { bgcolor: "#E45D9F" },
              }}
              onClick={() => onReview(task.id)}
            >
              Rate & Review
            </Button>
          );
        default:
          return null;
      }
    }
  };

  const renderStatusIndicator = () => {
    let displayStatus;

    if (statusText) {
      // Use provided statusText if available
      displayStatus = statusText;
    } else {
      // Otherwise generate status text based on task status
      switch (task.status) {
        case "pending":
          displayStatus = "Waiting for Selecting";
          break;
        case "accepted":
          displayStatus = "Assigned to Volunteer";
          break;
        case "in-progress":
          displayStatus = "In Progress";
          break;
        case "completed":
          displayStatus = "Completed";
          break;
        default:
          displayStatus =
            task.status.charAt(0).toUpperCase() + task.status.slice(1);
      }
    }

    return (
      <Box
        sx={{
          textAlign: "center",
          py: 1.5,
          bgcolor:
            task.status === "completed"
              ? "#e8f5e9"
              : task.status === "accepted" || task.status === "in-progress"
              ? "#fff8e1"
              : "#f5f5f5",
          borderRadius: "0 0 8px 8px",
          mt: 2,
        }}
      >
        <Typography variant="body2" fontWeight={500} color="text.secondary">
          {displayStatus}
        </Typography>
      </Box>
    );
  };

  // Display volunteer information if task is assigned
  const renderVolunteerInfo = () => {
    if (
      (task.status === "accepted" ||
        task.status === "in-progress" ||
        task.status === "completed") &&
      task.volunteerId &&
      viewType === "requester"
    ) {
      return (
        <Box mt={2}>
          <Divider sx={{ my: 1 }} />
          <Box display="flex" alignItems="center" mt={1}>
            <Avatar
              src={`https://ui-avatars.com/api/?name=${encodeURIComponent(
                task.volunteerName || "Volunteer"
              )}`}
              sx={{ width: 24, height: 24, mr: 1 }}
            />
            <Typography variant="body2">
              Volunteer: {task.volunteerName || "Assigned Volunteer"}
            </Typography>
          </Box>
        </Box>
      );
    }
    return null;
  };

  return (
    <Card sx={{ mb: 2, borderRadius: 2, boxShadow: 2, overflow: "hidden" }}>
      <Box
        sx={{
          p: 1,
          backgroundColor: getUrgencyColor(task.urgency),
          color: "white",
        }}
      >
        <Typography variant="body2" fontWeight="bold">
          {task.urgency}
        </Typography>
      </Box>

      {task.imageUrl && (
        <Box sx={{ width: "100%", height: 200, overflow: "hidden" }}>
          <img
            src={task.imageUrl}
            alt={task.title}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        </Box>
      )}

      <CardContent>
        <Stack spacing={2}>
          <Box display="flex" alignItems="center">
            <Avatar
              src={`https://ui-avatars.com/api/?name=${encodeURIComponent(
                task.requesterName
              )}`}
              sx={{ width: 40, height: 40, mr: 2 }}
            />
            <Box>
              <Typography variant="subtitle1" fontWeight="bold">
                {task.requesterName}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {task.description}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                requested {formatDate(task.createdAt).split(",")[0]}
              </Typography>
            </Box>
          </Box>

          <Divider />

          <Box display="flex" alignItems="center">
            <AccessTimeIcon
              sx={{ color: "text.secondary", mr: 1 }}
              fontSize="small"
            />
            <Typography variant="body2" color="text.secondary">
              {formatDate(task.createdAt)}
            </Typography>
          </Box>

          <Box display="flex" alignItems="center">
            <LocationOnIcon
              sx={{ color: "text.secondary", mr: 1 }}
              fontSize="small"
            />
            <Typography variant="body2" color="text.secondary">
              {task.location}
            </Typography>
          </Box>

          <Box display="flex" alignItems="center">
            <PersonIcon
              sx={{ color: "text.secondary", mr: 1 }}
              fontSize="small"
            />
            <Typography variant="body2" color="text.secondary">
              {task.requiredPeople} person required
            </Typography>
          </Box>

          <Box display="flex" alignItems="center">
            <PhoneIcon
              sx={{ color: "text.secondary", mr: 1 }}
              fontSize="small"
            />
            <Typography variant="body2" color="text.secondary">
              {task.phoneNumber || "+1 121 542 593"}
            </Typography>
          </Box>

          {renderVolunteerInfo()}

          {renderActionButton()}
        </Stack>
      </CardContent>

      {renderStatusIndicator()}
    </Card>
  );
};

export default TaskCard;
