// TaskDetailVolunteerStates.jsx - Contains state components for TaskDetailVolunteer
import {
  Box,
  Typography,
  Button,
  styled,
  Avatar,
  Divider,
  Stack,
  Card,
  CircularProgress,
} from "@mui/material";
import {
  AccessTime as AccessTimeIcon,
  LocationOn as LocationOnIcon,
  Person as PersonIcon,
  Phone as PhoneIcon,
  Check as CheckIcon,
  Close as CloseIcon,
} from "@mui/icons-material";
import { useSelector, useDispatch } from "react-redux";
import {
  setStatus,
  setVolunteerStatus,
  cancelVolunteering,
} from "../store/slices/taskDetailSlice";

// Common styled components with flex layout
const TaskContainer = styled(Card)(({ theme }) => ({
  width: "100%",
  minHeight: "611px",
  background: "#FFFFFFFF" /* white */,
  borderRadius: "16px",
  borderWidth: "1px",
  borderColor: "#F3F4F6FF" /* neutral-200 */,
  borderStyle: "solid",
  boxShadow: "none",
  display: "flex",
  flexDirection: "column",
  padding: "16px",
}));

const HeaderContainer = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  marginBottom: "24px",
}));

const UserAvatar = styled(Avatar)(({ theme }) => ({
  width: "64px",
  height: "64px",
  background: "#CED0F8FF" /* primary-200 */,
  borderRadius: "32px",
  marginRight: "12px",
}));

const UserName = styled(Typography)(({ theme }) => ({
  fontFamily: "Inter" /* Body */,
  fontSize: "18px",
  lineHeight: "28px",
  fontWeight: 500,
  color: "#171A1FFF" /* neutral-900 */,
}));

const TaskDescription = styled(Typography)(({ theme }) => ({
  fontFamily: "Inter" /* Body */,
  fontSize: "14px",
  lineHeight: "22px",
  fontWeight: 300,
  color: "#171A1FFF" /* neutral-900 */,
  marginBottom: "20px",
  width: "100%",
}));

const StatusText = styled(Typography)(({ theme }) => ({
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
  color: "#9095A0FF" /* neutral-500 */,
  background: "transparent",
  borderRadius: "22px",
  margin: "16px 0",
}));

// Status text for pending state
const PendingStatusText = styled(Typography)(({ theme }) => ({
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
  color: "#9095A0FF" /* neutral-500 */,
  background: "#00000000" /* transparent */,
  opacity: 1,
  border: "none",
  borderRadius: "22px",
}));

// Status text for pending volunteer state with proper styling
const PendingText = styled(Typography)(({ theme }) => ({
  fontFamily: "Inter",
  fontSize: "16px",
  lineHeight: "26px",
  fontWeight: 400,
  color: "#9095A0FF" /* neutral-500 */,
  textAlign: "center",
  marginBottom: "16px",
}));

const ActionButton = styled(Button)(({ theme }) => ({
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
  color: "#FFFFFFFF" /* white */,
  background: "#636AE8FF" /* primary-500 */,
  opacity: 1,
  border: "none",
  borderRadius: "22px",
  textTransform: "none",
  marginTop: "auto",
  "&:hover": {
    color: "#FFFFFFFF" /* white */,
    background: "#4850E4FF" /* primary-550 */,
  },
  "&:hover:active": {
    color: "#FFFFFFFF" /* white */,
    background: "#2C35E0FF" /* primary-600 */,
  },
  "&:disabled": {
    opacity: 0.4,
  },
}));

const ButtonContainer = styled(Box)(({ theme }) => ({
  display: "flex",
  gap: "10px",
  width: "100%",
  marginTop: "auto",
}));

const CancelButton = styled(Button)(({ theme }) => ({
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
  color: "#DE3B40FF" /* danger-500 */,
  background: "#FDF2F2FF" /* danger-100 */,
  border: "none",
  borderRadius: "22px",
  gap: "6px",
  textTransform: "none",
  "&:hover": {
    color: "#DE3B40FF" /* danger-500 */,
    background: "#F9DBDCFF" /* danger-150 */,
  },
  "&:hover:active": {
    color: "#DE3B40FF" /* danger-500 */,
    background: "#F5C4C6FF" /* danger-200 */,
  },
  "&:disabled": {
    opacity: 0.4,
  },
}));

const CancelVolunteeringButton = styled(Button)(({ theme }) => ({
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
  color: "#FFFFFFFF" /* white */,
  background: "#DE3B40FF" /* danger-500 */,
  opacity: 1,
  border: "none",
  borderRadius: "22px",
  textTransform: "none",
  marginTop: "auto",
  "&:hover": {
    color: "#FFFFFFFF" /* white */,
    background: "#C12126FF" /* danger-600 */,
  },
  "&:hover:active": {
    color: "#FFFFFFFF" /* white */,
    background: "#AA1D22FF" /* danger-650 */,
  },
  "&:disabled": {
    opacity: 0.4,
  },
}));

const CompleteButton = styled(Button)(({ theme }) => ({
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
  color: "#22A958FF" /* success-500 */,
  background: "#E6F7EAFF" /* success-100 */,
  border: "none",
  borderRadius: "22px",
  gap: "6px",
  textTransform: "none",
  "&:hover": {
    color: "#22A958FF" /* success-500 */,
    background: "#D4F1DDFF" /* success-150 */,
  },
  "&:hover:active": {
    color: "#22A958FF" /* success-500 */,
    background: "#C1EBD1FF" /* success-200 */,
  },
  "&:disabled": {
    opacity: 0.4,
  },
}));

const TaskDetailItem = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  marginBottom: "16px",
}));

// Base component for task details
const TaskDetailBase = ({ task, status, statusText, children }) => {
  return (
    <TaskContainer>
      {/* Header with Avatar and Name */}
      <HeaderContainer>
        <UserAvatar alt={task.requester.name} src={task.requester.avatar} />
        <UserName>{task.requester.name}</UserName>
      </HeaderContainer>
      {/* Task Description */}
      <TaskDescription>
        {task.description} - requested {task.requestedAt}
      </TaskDescription>
      {/* Task Details with flex layout */}
      <TaskDetailItem>
        <AccessTimeIcon
          sx={{
            width: "24px",
            height: "24px",
            fill: "#424955FF" /* neutral-650 */,
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
      </TaskDetailItem>
      <TaskDetailItem>
        <LocationOnIcon
          sx={{
            width: "24px",
            height: "24px",
            fill: "#424955FF" /* neutral-650 */,
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
      </TaskDetailItem>
      <TaskDetailItem>
        <PersonIcon
          sx={{
            width: "24px",
            height: "24px",
            fill: "#424955FF" /* neutral-650 */,
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
      </TaskDetailItem>{" "}
      <TaskDetailItem>
        <PhoneIcon
          sx={{
            width: "24px",
            height: "24px",
            fill: "#424955FF" /* neutral-650 */,
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
      </TaskDetailItem>{" "}
      {/* Spacer to push elements to bottom */}
      <Box sx={{ flexGrow: 1 }} />
      {/* Status Section */}
      <StatusText>{statusText}</StatusText>
      {/* Render children (action buttons) */}
      {Array.isArray(children) ? (
        <ButtonContainer>{children}</ButtonContainer>
      ) : (
        children
      )}
    </TaskContainer>
  );
};

// Main component that renders different states based on status
export const TaskDetailVolunteerStates = ({ status, task }) => {
  const dispatch = useDispatch();
  const { loading } = useSelector((state) => state.taskDetail);

  // Handlers
  const handleCancelVolunteering = () => {
    // Use the thunk to handle canceling volunteer status
    dispatch(cancelVolunteering(task.id));
  };

  const handleMarkComplete = () => {
    dispatch(setStatus("completed"));
  };

  // If loading, show loading indicator
  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        height="100vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  if (status === "pending_volunteer") {
    return (
      <TaskDetailBase task={task} status={status}>
        <Box
          sx={{
            width: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 2, // spacing between "Pending" and button
            mt: 2, // optional top margin
          }}
        >
          <PendingText>Pending</PendingText>
          <CancelVolunteeringButton onClick={handleCancelVolunteering}>
            Cancel Volunteering
          </CancelVolunteeringButton>
        </Box>
      </TaskDetailBase>
    );
  }

  // In-progress state (User has been confirmed as volunteer)
  if (status === "volunteered") {
    return (
      <TaskDetailBase
        task={task}
        status={status}
        statusText="You're assigned to this task"
      >
        <CancelButton
          startIcon={<CloseIcon />}
          onClick={handleCancelVolunteering}
        >
          Cancel
        </CancelButton>
        <CompleteButton startIcon={<CheckIcon />} onClick={handleMarkComplete}>
          Complete
        </CompleteButton>
      </TaskDetailBase>
    );
  }

  // Completed state (User has marked the task as complete)
  if (status === "completed") {
    return (
      <TaskDetailBase
        task={task}
        status={status}
        statusText="You've completed this task"
      >
        <ActionButton disabled>Task Completed</ActionButton>
      </TaskDetailBase>
    );
  }

  // Default state - should not happen normally, but included for safety
  return (
    <TaskDetailBase
      task={task}
      status={status}
      statusText="Task Status Unknown"
    >
      <ActionButton onClick={() => dispatch(setStatus("pending"))}>
        Return to Task List
      </ActionButton>
    </TaskDetailBase>
  );
};

export default TaskDetailVolunteerStates;
