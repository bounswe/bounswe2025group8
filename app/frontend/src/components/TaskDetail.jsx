// filepath: c:\Users\musak\OneDrive\Desktop\bounswe2025group8\practice-app\frontend\src\components\TaskDetail.jsx
import { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
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
  Edit as EditIcon,
  Delete as DeleteIcon,
} from "@mui/icons-material";
import {
  setSelectedVolunteer,
  setStatus,
  setAssignedVolunteers,
} from "../store/slices/taskDetailSlice";
import {
  TaskDetailCompleted,
  TaskDetailCancelled,
  TaskDetailAssigned,
} from "./TaskDetailStates";

// Styled components with flex layout
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
  marginTop: "auto", // Push text to bottom
}));

const TaskDetailItem = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  marginBottom: "16px",
}));

const SelectButton = styled(Button)(({ theme }) => ({
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
  border: "none",
  borderRadius: "22px",
  textTransform: "none",
  marginTop: "auto", // Push button to bottom
  marginBottom: "16px",
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
  gap: "12px",
  width: "100%",
}));

const EditButton = styled(Button)(({ theme }) => ({
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
  color: "#98690CFF" /* warning-700 */,
  background: "#FEF9EEFF" /* warning-100 */,
  border: "none",
  borderRadius: "22px",
  gap: "6px",
  textTransform: "none",
  "& .MuiSvgIcon-root": {
    fill: "#98690CFF" /* warning-700 */,
  },
  "&:hover": {
    color: "#98690CFF" /* warning-700 */,
    background: "#FAE7C0FF" /* warning-200 */,
  },
  "&:hover:active": {
    color: "#98690CFF" /* warning-700 */,
    background: "#F6D491FF" /* warning-300 */,
  },
  "&:disabled": {
    opacity: 0.4,
  },
}));

const DeleteButton = styled(Button)(({ theme }) => ({
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
  "& .MuiSvgIcon-root": {
    fill: "#DE3B40FF" /* danger-500 */,
  },
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

const TaskDetail = () => {
  const { taskId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { task, status, loading } = useSelector((state) => state.taskDetail);
  const [selectedVolunteer, setVolunteer] = useState(null);

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

  // Use mock data until real data is available
  const taskData = task || mockTask; // Handlers for different actions
  const handleSelectVolunteer = () => {
    // Navigate to select volunteer page using React Router's navigate
    navigate(`/tasks/${taskId}/select-volunteer`);
  };

  const handleAssignVolunteers = (volunteers) => {
    // For demo purposes, we'll simulate assigning volunteers
    const assignedVolunteers = volunteers || [
      {
        id: 101,
        name: "John Doe",
        avatar: "/path/to/avatar.png",
        rating: 4.8,
      },
    ];

    dispatch(setAssignedVolunteers(assignedVolunteers));
    dispatch(setStatus("assigned"));
  };

  const handleEdit = () => {
    console.log("Edit task clicked");
    // Logic for editing the task
  };

  const handleDelete = () => {
    console.log("Delete task clicked");
    // Logic for deleting the task
  };

  const handleCompleteTask = () => {
    dispatch(setStatus("completed"));
  };

  const handleCancelTask = () => {
    dispatch(setStatus("cancelled"));
  };

  const handleReopenTask = () => {
    dispatch(setStatus("pending"));
    dispatch(setSelectedVolunteer(null));
  };

  const handleRateVolunteer = () => {
    // Logic for rating volunteer
    console.log("Rating volunteer...");
    alert("This would open rating dialog");
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
  // Render different components based on status
  if (status === "assigned") {
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

        {/* Spacer to push elements to bottom */}
        <Box sx={{ flexGrow: 1 }} />

        {/* Status Section */}
        <WaitingText>Assigned to Volunteers</WaitingText>

        {/* Action Button */}
        <SelectButton onClick={handleSelectVolunteer}>
          Select Volunteer
        </SelectButton>

        {/* Edit/Delete Actions */}
        <ButtonContainer>
          <EditButton startIcon={<EditIcon />} onClick={handleEdit}>
            Edit
          </EditButton>
          <DeleteButton startIcon={<DeleteIcon />} onClick={handleDelete}>
            Delete
          </DeleteButton>
        </ButtonContainer>
      </TaskContainer>
    );
  }
  if (status === "selected") {
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
      </TaskContainer>
    );
  }

  if (status === "completed") {
    return <TaskDetailCompleted task={taskData} onRate={handleRateVolunteer} />;
  }

  if (status === "cancelled") {
    return <TaskDetailCancelled task={taskData} onReopen={handleReopenTask} />;
  }

  // Default: Pending state (no volunteer selected yet)
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

      {/* Spacer to push elements to bottom */}
      <Box sx={{ flexGrow: 1 }} />

      {/* Status Section */}
      <WaitingText>
        {status === "assigned"
          ? "Assigned to Volunteers"
          : "Waiting for Selecting"}
      </WaitingText>

      {/* Action Button */}
      <SelectButton onClick={handleSelectVolunteer}>
        Select Volunteer
      </SelectButton>

      {/* Edit/Delete Actions */}
      <ButtonContainer>
        <EditButton startIcon={<EditIcon />} onClick={handleEdit}>
          Edit
        </EditButton>
        <DeleteButton startIcon={<DeleteIcon />} onClick={handleDelete}>
          Delete
        </DeleteButton>
      </ButtonContainer>
    </TaskContainer>
  );
};

export default TaskDetail;
