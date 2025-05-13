import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useParams } from "react-router-dom";
import {
  Box,
  Typography,
  Avatar,
  Card,
  CardContent,
  Button,
  Divider,
  CircularProgress,
  styled,
} from "@mui/material";
import {
  AccessTime as AccessTimeIcon,
  LocationOn as LocationOnIcon,
  Person as PersonIcon,
  Phone as PhoneIcon,
} from "@mui/icons-material";
import {
  setSelectedVolunteer,
  setStatus,
  setVolunteerStatus,
  setAssignedVolunteers,
  volunteerForTask,
} from "../store/slices/taskDetailSlice";
import { TaskDetailVolunteerStates } from "./TaskDetailVolunteerStates";

// Styled components with flex layout
const TaskContainer = styled(Card)(({ theme }) => ({
  width: "100%",
  height: "auto",
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

const TaskDetailItem = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  marginBottom: "16px",
}));

const WaitingText = styled(Typography)(({ theme }) => ({
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

// Volunteer button styling with flex
const BeVolunteerButton = styled(Button)(({ theme }) => ({
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
  marginTop: "auto", // Push the button to the bottom
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

const TaskDetailVolunteer = () => {
  const { taskId } = useParams();
  const dispatch = useDispatch();
  const { task, status, loading, isVolunteer } = useSelector(
    (state) => state.taskDetail
  );

  // Temporary mock data based on the image
  const mockTask = {
    id: taskId || 1,
    requester: {
      name: "Ashley Robinson",
      avatar: "/path/to/avatar.png",
    },
    description:
      "Minim sit fugiat est dolor laboris nisi ullamco cillum reprehenderit nulla aute. Laboris occaecat adipisicing",
    requestedAt: "3 hours ago",
    date: "May 16, 2025 - 16:30 PM",
    location: "848 King Street, Denver, CO 80204",
    requiredPeople: 1,
    phoneNumber: "+1 121 542 593",
  };

  // Load task data when component mounts
  useEffect(() => {
    // In a real app, this would fetch task data from an API
    // For now, we'll use our mock data after a brief delay to simulate API loading

    const fetchTask = async () => {
      try {
        // Simulate API call delay
        await new Promise((resolve) => setTimeout(resolve, 500));

        // Set the mock task data in Redux state
        dispatch({ type: "taskDetail/setTask", payload: mockTask });
      } catch (error) {
        console.error("Error fetching task:", error);
      }
    };

    fetchTask();
  }, [dispatch, taskId]);

  // Use mock data until real data is available
  const taskData = task || mockTask;

  // Handler for volunteering
  const handleBeVolunteer = () => {
    // Dispatch the async thunk to handle volunteering for a task
    dispatch(volunteerForTask(taskId));
  };

  // Get active button color based on state
  const getButtonStyles = () => {
    if (isVolunteer) {
      return {
        background: "#DE3B40FF", // Red for cancel button
        "&:hover": {
          background: "#C12126FF",
        },
        "&:active": {
          background: "#AA1D22FF",
        },
      };
    }
    return {
      background: "#636AE8FF", // Blue for be volunteer button
      "&:hover": {
        background: "#4850E4FF",
      },
      "&:active": {
        background: "#2C35E0FF",
      },
    };
  };

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
  // If the user is a volunteer or the status is not "pending",
  // render the appropriate state component
  if (isVolunteer || status !== "pending") {
    return <TaskDetailVolunteerStates status={status} task={taskData} />;
  }
  // Default: Pending state (user hasn't volunteered yet)
  return (
    <TaskContainer>
      {/* Header with Avatar and Name */}
      <HeaderContainer>
        <UserAvatar
          alt={taskData.requester.name}
          src={taskData.requester.avatar}
        />
        <UserName>{taskData.requester.name}</UserName>
      </HeaderContainer>

      {/* Task Description */}
      <TaskDescription>
        {taskData.description} - requested {taskData.requestedAt}
      </TaskDescription>

      {/* Task Details - Using flex layout */}
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
          {taskData.date}
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
          {taskData.location}
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
          {taskData.requiredPeople} person required
        </Typography>
      </TaskDetailItem>

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
          {taskData.phoneNumber}
        </Typography>
      </TaskDetailItem>

      {/* Spacer to push button to the bottom */}
      <Box sx={{ flexGrow: 1 }} />

      {/* Be Volunteer Button */}
      <BeVolunteerButton onClick={handleBeVolunteer} sx={getButtonStyles()}>
        Be Volunteer
      </BeVolunteerButton>
    </TaskContainer>
  );
};

export default TaskDetailVolunteer;
