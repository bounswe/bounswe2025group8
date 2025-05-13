// TaskDetailStates.jsx - Contains different state components for TaskDetail
import {
  Box,
  Typography,
  Button,
  styled,
  Avatar,
  Divider,
  Stack,
} from "@mui/material";
import {
  AccessTime as AccessTimeIcon,
  LocationOn as LocationOnIcon,
  Person as PersonIcon,
  Phone as PhoneIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Star as StarIcon,
} from "@mui/icons-material";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

// Common styled components
const StatusContainer = styled(Box)(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "flex-start",
  gap: "16px",
  padding: "16px",
  width: "100%",
  height: "100%",
}));

const StatusButton = styled(Button)(({ theme, color = "primary" }) => ({
  height: "44px",
  borderRadius: "22px",
  fontFamily: "Inter",
  fontSize: "16px",
  fontWeight: 500,
}));

const VolunteerInfo = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  gap: "12px",
  padding: "12px",
  borderRadius: "8px",
  backgroundColor: "#F3F4F6",
  marginBottom: "8px",
}));

// TaskDetailSelected - Component for when a volunteer is selected
export const TaskDetailSelected = ({ task, onComplete, onCancel }) => {
  // Get the selected volunteer from the Redux store
  const { selectedVolunteer } = useSelector((state) => state.taskDetail);

  return (
    <Box
      sx={{
        padding: "16px",
        display: "flex",
        flexDirection: "column",
        height: "100%",
        width: "100%",
      }}
    >
      <Typography
        variant="h6"
        sx={{
          fontSize: "18px",
          fontWeight: 500,
          textAlign: "center",
          mb: 2,
        }}
      >
        Selected Volunteer
      </Typography>
      <Box
        sx={{
          backgroundColor: "#f8f9fa",
          borderRadius: "8px",
          padding: "16px",
          display: "flex",
          alignItems: "center",
          mb: 2,
        }}
      >
        <Avatar sx={{ bgcolor: "#CED0F8", width: 48, height: 48 }}>
          {selectedVolunteer?.name?.charAt(0) || "V"}
        </Avatar>
        <Box sx={{ ml: 2 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
            {selectedVolunteer?.name || "Volunteer"}
          </Typography>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ display: "flex", alignItems: "center" }}
          >
            <PhoneIcon fontSize="small" sx={{ mr: 0.5 }} />
            {selectedVolunteer?.phone || "N/A"}
          </Typography>
        </Box>
      </Box>
      <Divider sx={{ my: 2 }} /> {/* Spacer to push buttons to the bottom */}
      <Box sx={{ flexGrow: 1 }} />
      {/* Status Text */}
      <Typography
        sx={{
          width: "100%",
          height: "44px",
          padding: "0 16px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "Inter",
          fontSize: "16px",
          lineHeight: "26px",
          fontWeight: 400,
          color: "#9095A0FF", // neutral-500
          marginBottom: "16px",
        }}
      >
        Assigned to Volunteers
      </Typography>
      {/* Status Button - outlined tertiary button */}
      <Button
        sx={{
          width: "100%",
          height: "44px",
          padding: "0 16px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "Inter",
          fontSize: "16px",
          lineHeight: "26px",
          fontWeight: 400,
          color: "#22CCB2", // tertiary1-500
          backgroundColor: "transparent",
          border: "none",
          borderRadius: "22px",
          mb: 2,
          "&:hover": {
            color: "#22CCB2", // tertiary1-500
            backgroundColor: "#BAF3EB", // tertiary1-200
          },
          "&:active": {
            color: "#22CCB2", // tertiary1-500
            backgroundColor: "#84EADB", // tertiary1-300
          },
          "&:disabled": {
            opacity: 0.4,
          },
        }}
      >
        VIEW VOLUNTEER PROFILE
      </Button>{" "}
      {/* Primary Action Button - blue primary button */}
      <Button
        variant="contained"
        onClick={onComplete}
        sx={{
          width: "100%",
          height: "44px",
          padding: "0 16px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "Inter",
          fontSize: "16px",
          lineHeight: "26px",
          fontWeight: 400,
          color: "#FFFFFF", // white
          backgroundColor: "#636AE8", // primary-500
          border: "none",
          borderRadius: "22px",
          mb: 2,
          "&:hover": {
            color: "#FFFFFF", // white
            backgroundColor: "#4850E4", // primary-550
          },
          "&:active": {
            color: "#FFFFFF", // white
            backgroundColor: "#2C35E0", // primary-600
          },
          "&:disabled": {
            opacity: 0.4,
          },
        }}
      >
        Select Volunteer
      </Button>
      {/* Action Buttons Row */}
      <Box
        sx={{
          display: "flex",
          gap: "12px",
          width: "100%",
        }}
      >
        {/* Edit Button - warning style */}
        <Button
          sx={{
            flex: 1,
            height: "44px",
            padding: "0 16px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: "Inter",
            fontSize: "16px",
            lineHeight: "26px",
            fontWeight: 400,
            color: "#98690C", // warning-700
            backgroundColor: "#FEF9EE", // warning-100
            border: "none",
            borderRadius: "22px",
            gap: "6px",
            "&:hover": {
              color: "#98690C", // warning-700
              backgroundColor: "#FAE7C0", // warning-200
            },
            "&:active": {
              color: "#98690C", // warning-700
              backgroundColor: "#F6D491", // warning-300
            },
            "&:disabled": {
              opacity: 0.4,
            },
          }}
        >
          <span className="icon">✏️</span>
          Edit
        </Button>

        {/* Delete Button - danger style */}
        <Button
          onClick={onCancel}
          sx={{
            flex: 1,
            height: "44px",
            padding: "0 16px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: "Inter",
            fontSize: "16px",
            lineHeight: "26px",
            fontWeight: 400,
            color: "#DE3B40", // danger-500
            backgroundColor: "#FDF2F2", // danger-100
            border: "none",
            borderRadius: "22px",
            gap: "6px",
            "&:hover": {
              color: "#DE3B40", // danger-500
              backgroundColor: "#F9DBDC", // danger-150
            },
            "&:active": {
              color: "#DE3B40", // danger-500
              backgroundColor: "#F5C4C6", // danger-200
            },
            "&:disabled": {
              opacity: 0.4,
            },
          }}
        >
          <span className="icon">❌</span>
          Delete
        </Button>
      </Box>
    </Box>
  );
};

// TaskDetailCompleted - Component for when a task is completed
export const TaskDetailCompleted = ({ task }) => {
  const navigate = useNavigate();

  const handleRateClick = () => {
    navigate(`/tasks/${task.id}/rate-review`);
  };

  return (
    <Box
      sx={{
        width: "100%",
        minHeight: "611px",
        background: "#FFFFFFFF",
        borderRadius: "16px",
        borderWidth: "1px",
        borderColor: "#F3F4F6FF",
        borderStyle: "solid",
        boxShadow: "none",
        display: "flex",
        flexDirection: "column",
        padding: "16px",
      }}
    >
      {/* Header with Avatar and Name */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          marginBottom: "24px",
        }}
      >
        <Avatar
          alt={task.requester.name}
          src={task.requester.avatar}
          sx={{
            width: "64px",
            height: "64px",
            background: "#CED0F8FF",
            borderRadius: "32px",
            marginRight: "12px",
          }}
        />
        <Typography
          sx={{
            fontFamily: "Inter",
            fontSize: "18px",
            lineHeight: "28px",
            fontWeight: 500,
            color: "#171A1FFF",
          }}
        >
          {task.requester.name}
        </Typography>
      </Box>
      {/* Task Description */}
      <Typography
        sx={{
          fontFamily: "Inter",
          fontSize: "14px",
          lineHeight: "22px",
          fontWeight: 300,
          color: "#171A1FFF",
          marginBottom: "20px",
          width: "100%",
        }}
      >
        {task.description} - requested {task.requestedAt}
      </Typography>
      {/* Task Details with flex layout */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          marginBottom: "16px",
        }}
      >
        <AccessTimeIcon
          sx={{
            width: "24px",
            height: "24px",
            fill: "#424955FF",
            marginRight: "8px",
          }}
        />
        <Typography
          sx={{
            fontFamily: "Inter",
            fontSize: "14px",
            lineHeight: "22px",
            fontWeight: 300,
            color: "#171A1FFF",
          }}
        >
          {task.date}
        </Typography>
      </Box>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          marginBottom: "16px",
        }}
      >
        <LocationOnIcon
          sx={{
            width: "24px",
            height: "24px",
            fill: "#424955FF",
            marginRight: "8px",
          }}
        />
        <Typography
          sx={{
            fontFamily: "Inter",
            fontSize: "14px",
            lineHeight: "22px",
            fontWeight: 300,
            color: "#171A1FFF",
          }}
        >
          {task.location}
        </Typography>
      </Box>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          marginBottom: "16px",
        }}
      >
        <PersonIcon
          sx={{
            width: "24px",
            height: "24px",
            fill: "#424955FF",
            marginRight: "8px",
          }}
        />
        <Typography
          sx={{
            fontFamily: "Inter",
            fontSize: "14px",
            lineHeight: "22px",
            fontWeight: 300,
            color: "#171A1FFF",
          }}
        >
          {task.requiredPeople} person required
        </Typography>
      </Box>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          marginBottom: "16px",
        }}
      >
        <PhoneIcon
          sx={{
            width: "24px",
            height: "24px",
            fill: "#424955FF",
            marginRight: "8px",
          }}
        />
        <Typography
          sx={{
            fontFamily: "Inter",
            fontSize: "14px",
            lineHeight: "22px",
            fontWeight: 300,
            color: "#171A1FFF",
          }}
        >
          {task.phoneNumber}
        </Typography>
      </Box>
      {/* Spacer to push elements to bottom */}
      <Box sx={{ flexGrow: 1 }} />
      {/* Completed Status */}
      <Typography
        sx={{
          width: "100%",
          height: "44px",
          padding: "0 16px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "Inter",
          fontSize: "16px",
          lineHeight: "26px",
          fontWeight: 400,
          color: "#22A958", // Green color for completed status
          background: "transparent",
          borderRadius: "22px",
          marginBottom: "16px",
        }}
      >
        Completed
      </Typography>{" "}
      {/* Rate & Review Button */}
      <Button
        onClick={handleRateClick}
        startIcon={<StarIcon />}
        sx={{
          width: "100%",
          height: "44px",
          padding: "0 16px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "Inter",
          fontSize: "16px",
          lineHeight: "26px",
          fontWeight: 500,
          color: "#FFFFFFFF",
          background: "#E15B97", // Pink color from the image
          border: "none",
          borderRadius: "22px",
          textTransform: "none",
          marginTop: "auto", // Push to bottom
          marginBottom: "16px",
          "&:hover": {
            color: "#FFFFFFFF",
            background: "#D04D89", // Darker pink on hover
          },
          "&:active": {
            color: "#FFFFFFFF",
            background: "#C13F7A", // Even darker pink when active
          },
          "&:disabled": {
            opacity: 0.4,
          },
          "& .MuiButton-startIcon": {
            marginRight: "8px",
          },
        }}
      >
        Rate & Review
      </Button>
    </Box>
  );
};

// TaskDetailCancelled - Component for when a task is cancelled
export const TaskDetailCancelled = ({ onReactivate }) => {
  return (
    <StatusContainer>
      <Box
        sx={{
          backgroundColor: "#FDEEEE",
          padding: "16px",
          borderRadius: "8px",
          textAlign: "center",
          width: "100%",
        }}
      >
        <Typography variant="h6" sx={{ color: "#E53535", mb: 1 }}>
          Task Cancelled
        </Typography>
        <Typography variant="body2">
          This task has been cancelled and is no longer active
        </Typography>
      </Box>

      <Divider sx={{ width: "100%" }} />

      {/* Spacer to push button to bottom if needed */}
      <Box sx={{ flexGrow: 1 }} />

      <StatusButton
        variant="contained"
        color="primary"
        onClick={onReactivate}
        sx={{ width: "100%" }}
      >
        Reactivate Task
      </StatusButton>
    </StatusContainer>
  );
};

// TaskDetailAssigned - Component for when a task is assigned
export const TaskDetailAssigned = ({
  task,
  onSelectVolunteer,
  onEdit,
  onDelete,
  onComplete,
}) => {
  // Get the selected volunteer from the Redux store
  const { selectedVolunteer } = useSelector((state) => state.taskDetail);
  return (
    <Box
      sx={{
        width: "100%",
        minHeight: "611px",
        background: "#FFFFFFFF",
        borderRadius: "16px",
        borderWidth: "1px",
        borderColor: "#F3F4F6FF",
        borderStyle: "solid",
        boxShadow: "none",
        display: "flex",
        flexDirection: "column",
        padding: "16px",
      }}
    >
      {/* Header with Avatar and Name */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          marginBottom: "24px",
        }}
      >
        <Avatar
          alt={task.requester.name}
          src={task.requester.avatar}
          sx={{
            width: "64px",
            height: "64px",
            background: "#CED0F8FF",
            borderRadius: "32px",
            marginRight: "12px",
          }}
        />
        <Typography
          sx={{
            fontFamily: "Inter",
            fontSize: "18px",
            lineHeight: "28px",
            fontWeight: 500,
            color: "#171A1FFF",
          }}
        >
          {task.requester.name}
        </Typography>
      </Box>
      {/* Task Description */}
      <Typography
        sx={{
          fontFamily: "Inter",
          fontSize: "14px",
          lineHeight: "22px",
          fontWeight: 300,
          color: "#171A1FFF",
          marginBottom: "20px",
          width: "100%",
        }}
      >
        {task.description} - requested {task.requestedAt}
      </Typography>
      {/* Task Details with flex layout */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          marginBottom: "16px",
        }}
      >
        <AccessTimeIcon
          sx={{
            width: "24px",
            height: "24px",
            fill: "#424955FF",
            marginRight: "8px",
          }}
        />
        <Typography
          sx={{
            fontFamily: "Inter",
            fontSize: "14px",
            lineHeight: "22px",
            fontWeight: 300,
            color: "#171A1FFF",
          }}
        >
          {task.date}
        </Typography>
      </Box>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          marginBottom: "16px",
        }}
      >
        <LocationOnIcon
          sx={{
            width: "24px",
            height: "24px",
            fill: "#424955FF",
            marginRight: "8px",
          }}
        />
        <Typography
          sx={{
            fontFamily: "Inter",
            fontSize: "14px",
            lineHeight: "22px",
            fontWeight: 300,
            color: "#171A1FFF",
          }}
        >
          {task.location}
        </Typography>
      </Box>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          marginBottom: "16px",
        }}
      >
        <PersonIcon
          sx={{
            width: "24px",
            height: "24px",
            fill: "#424955FF",
            marginRight: "8px",
          }}
        />
        <Typography
          sx={{
            fontFamily: "Inter",
            fontSize: "14px",
            lineHeight: "22px",
            fontWeight: 300,
            color: "#171A1FFF",
          }}
        >
          {task.requiredPeople} person required
        </Typography>
      </Box>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          marginBottom: "16px",
        }}
      >
        <PhoneIcon
          sx={{
            width: "24px",
            height: "24px",
            fill: "#424955FF",
            marginRight: "8px",
          }}
        />
        <Typography
          sx={{
            fontFamily: "Inter",
            fontSize: "14px",
            lineHeight: "22px",
            fontWeight: 300,
            color: "#171A1FFF",
          }}
        >
          {task.phoneNumber}
        </Typography>
      </Box>{" "}
      {/* Spacer to push elements to bottom */}
      <Box sx={{ flexGrow: 1 }} />
      {/* Mark as Completed Button */}
      <Button
        onClick={onComplete}
        sx={{
          width: "100%",
          height: "44px",
          padding: "0 16px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "Inter",
          fontSize: "16px",
          lineHeight: "26px",
          fontWeight: 400,
          color: "#FFFFFFFF",
          background: "#22CCB2", // tertiary1-500 (green)
          border: "none",
          borderRadius: "22px",
          textTransform: "none",
          marginBottom: "16px",
          "&:hover": {
            color: "#FFFFFFFF",
            background: "#1EBBCB", // slightly darker green
          },
          "&:active": {
            color: "#FFFFFFFF",
            background: "#15A090", // even darker green
          },
          "&:disabled": {
            opacity: 0.4,
          },
        }}
      >
        Mark as Completed
      </Button>
      {/* Status Section */}
      <Typography
        sx={{
          width: "100%",
          height: "44px",
          padding: "0 16px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "Inter",
          fontSize: "16px",
          lineHeight: "26px",
          fontWeight: 400,
          color: "#9095A0FF",
          background: "transparent",
          borderRadius: "22px",
          marginTop: "0",
          marginBottom: "16px",
        }}
      >
        Assigned to Volunteers
      </Typography>
      {/* Action Button */}
      <Button
        onClick={onSelectVolunteer}
        sx={{
          width: "100%",
          height: "44px",
          padding: "0 16px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "Inter",
          fontSize: "16px",
          lineHeight: "26px",
          fontWeight: 400,
          color: "#FFFFFFFF",
          background: "#636AE8FF",
          border: "none",
          borderRadius: "22px",
          textTransform: "none",
          marginBottom: "16px",
          "&:hover": {
            color: "#FFFFFFFF",
            background: "#4850E4FF",
          },
          "&:active": {
            color: "#FFFFFFFF",
            background: "#2C35E0FF",
          },
          "&:disabled": {
            opacity: 0.4,
          },
        }}
      >
        Select Volunteer
      </Button>
      {/* Edit/Delete Actions */}
      <Box
        sx={{
          display: "flex",
          gap: "12px",
          width: "100%",
        }}
      >
        <Button
          startIcon={<EditIcon />}
          onClick={onEdit}
          sx={{
            flex: 1,
            height: "44px",
            padding: "0 16px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: "Inter",
            fontSize: "16px",
            lineHeight: "26px",
            fontWeight: 400,
            color: "#98690CFF",
            background: "#FEF9EEFF",
            border: "none",
            borderRadius: "22px",
            gap: "6px",
            textTransform: "none",
            "& .MuiSvgIcon-root": {
              fill: "#98690CFF",
            },
            "&:hover": {
              color: "#98690CFF",
              background: "#FAE7C0FF",
            },
            "&:active": {
              color: "#98690CFF",
              background: "#F6D491FF",
            },
            "&:disabled": {
              opacity: 0.4,
            },
          }}
        >
          Edit
        </Button>
        <Button
          startIcon={<DeleteIcon />}
          onClick={onDelete}
          sx={{
            flex: 1,
            height: "44px",
            padding: "0 16px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: "Inter",
            fontSize: "16px",
            lineHeight: "26px",
            fontWeight: 400,
            color: "#DE3B40FF",
            background: "#FDF2F2FF",
            border: "none",
            borderRadius: "22px",
            gap: "6px",
            textTransform: "none",
            "& .MuiSvgIcon-root": {
              fill: "#DE3B40FF",
            },
            "&:hover": {
              color: "#DE3B40FF",
              background: "#F9DBDCFF",
            },
            "&:active": {
              color: "#DE3B40FF",
              background: "#F5C4C6FF",
            },
            "&:disabled": {
              opacity: 0.4,
            },
          }}
        >
          Delete
        </Button>
      </Box>
    </Box>
  );
};

export default {
  TaskDetailSelected,
  TaskDetailCompleted,
  TaskDetailCancelled,
  TaskDetailAssigned,
};
