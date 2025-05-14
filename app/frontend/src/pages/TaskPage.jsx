import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Button,
  Divider,
  Chip,
  CircularProgress,
  Paper,
  Container,
  Grid,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import TaskDetailComponent from "../components/TaskDetailComponent";
import taskImage from "../assets/task.jpeg";

// TaskPage component with flexible layout
const TaskPage = () => {
  const { taskId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [task, setTask] = useState(null);

  useEffect(() => {
    // Simulate API fetch
    setLoading(true);

    // Mock task data with updated fields for urgency and task type
    const mockTask = {
      id: taskId,
      title: "I need to clean my house",
      description:
        "Minim sit fugiat est dolor laboris nisi ullamco cillum reprehenderit nulla aute. Laboris occaecat adipisicing.",
      status: "Open",
      taskType: "House Cleaning",
      urgencyLevel: "Low Urgency",
      createdAt: "2023-05-01T10:00:00Z",
      location: "848 King Street, Denver, CO 80204",
      creator: {
        id: 1,
        name: "Ashley Robinson",
        rating: 4.8,
      },
      volunteers: [],
      tags: ["Cleaning", "House", "Assistance"],
    };

    setTimeout(() => {
      setTask(mockTask);
      setLoading(false);
    }, 500);
  }, [taskId]);

  const handleBackClick = () => {
    navigate("/tasks");
  };
  if (loading) {
    return (
      <Box
        data-testid="loading-indicator"
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "60vh",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }
  if (!task) {
    return (
      <Box data-testid="no-task-found" sx={{ textAlign: "center", py: 4 }}>
        <Typography variant="h5">Task not found</Typography>
        <Button
          variant="contained"
          sx={{ mt: 2 }}
          onClick={() => navigate("/tasks")}
        >
          Back to Task List
        </Button>
      </Box>
    );
  }

  return (
    <Container
      maxWidth="xl"
      sx={{
        mt: { xs: 2, md: 3 },
        mb: { xs: 4, md: 5 },
        px: { xs: 2, sm: 3, md: 4 },
        position: "relative",
      }}
    >
      {/* Back button and task info header */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between", // push left/right sections apart
          alignItems: "center",
          mb: 3,
          pt: 3,
          flexWrap: "wrap", // allows wrapping on small screens
          width: "100%",
          gap: 2,
        }}
      >
        {/* LEFT SECTION: Back Button + Title */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            flex: 1,
            minWidth: 0, // allows title text to shrink if needed
            gap: 2,
          }}
        >
          <Button
            variant="text"
            startIcon={<ArrowBackIcon />}
            onClick={handleBackClick}
            sx={{ minWidth: "fit-content" }}
          />
          <Typography
            variant="h5"
            fontWeight="bold"
            sx={{
              fontSize: { xs: "1.25rem", sm: "1.5rem", md: "1.75rem" },
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {task.title}
          </Typography>
        </Box>

        {/* RIGHT SECTION: Task Type + Urgency */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 2,
            flexShrink: 0, // prevents shrinking on small screens
          }}
        >
          <Box
            sx={{
              width: { xs: "100%", sm: "287px" },
              height: "31px",
              padding: "0 16px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontFamily: "Inter",
              fontSize: "16px",
              lineHeight: "26px",
              fontWeight: 400,
              color: "#636AE8FF",
              background: "#F2F2FDFF",
              borderRadius: "6px",
              textTransform: "none",
              "&:hover": { background: "#E0E1FAFF" },
              "&:active": { background: "#CED0F8FF" },
              "&:disabled": { opacity: 0.4 },
            }}
          >
            {task.taskType}
          </Box>

          <Box
            sx={{
              width: { xs: "100%", sm: "171px" },
              height: "31px",
              padding: "0 16px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontFamily: "Inter",
              fontSize: "16px",
              lineHeight: "26px",
              fontWeight: 400,
              color: "#0A4D20FF",
              background: "#1DD75BFF",
              borderRadius: "6px",
              textTransform: "none",
              "&:hover": { background: "#1AC052FF" },
              "&:active": { background: "#17A948FF" },
              "&:disabled": { opacity: 0.4 },
            }}
          >
            {task.urgencyLevel}
          </Box>
        </Box>
      </Box>

      <Box
        sx={{
          mt: 4,
          display: "flex",
          flexDirection: { xs: "column", md: "row" },
          gap: { xs: 3, md: 4 },
          justifyContent: "center",
          position: "relative",
        }}
      >
        {/* Left column - Task Image */}
        <Box
          sx={{
            flex: 1,
            height: "611px",
            borderRadius: "8px",
            overflow: "hidden",
            maxWidth: "100%",
          }}
        >
          <Box
            component="img"
            src={taskImage}
            alt="Task Image"
            sx={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              borderRadius: "8px",
            }}
          />
        </Box>

        {/* Right column - Task Detail Card */}
        <Box
          sx={{
            flex: 1,
            height: "611px",
            display: "flex",
            flexDirection: "column", // Makes it stack if needed inside
          }}
        >
          <Box
            sx={{
              width: "100%",
              height: "100%",
            }}
          >
            <TaskDetailComponent task={task} />
          </Box>
        </Box>
      </Box>
    </Container>
  );
};

export default TaskPage;
