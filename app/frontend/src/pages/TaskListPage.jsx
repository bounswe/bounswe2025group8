import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Grid,
  CircularProgress,
  Button,
  Container,
} from "@mui/material";
import { useNavigate } from "react-router-dom";

// Basic placeholder component for task list
const TaskListPage = () => {
  const [loading, setLoading] = useState(false);
  const [tasks, setTasks] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    // Simulating data fetch
    setLoading(true);

    // Placeholder data for development
    const placeholderTasks = [
      {
        id: 1,
        title: "Grocery Shopping",
        status: "Open",
        createdAt: "2023-05-01",
      },
      {
        id: 2,
        title: "Dog Walking",
        status: "Assigned",
        createdAt: "2023-05-02",
      },
      {
        id: 3,
        title: "House Cleaning",
        status: "Completed",
        createdAt: "2023-05-03",
      },
      {
        id: 4,
        title: "Medication Pickup",
        status: "Open",
        createdAt: "2023-05-04",
      },
    ];

    setTimeout(() => {
      setTasks(placeholderTasks);
      setLoading(false);
    }, 500);
  }, []);

  const handleTaskClick = (taskId) => {
    navigate(`/tasks/${taskId}`);
  };

  if (loading) {
    return (
      <Box
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

  return (
    <Container>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Available Tasks
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Browse through available tasks in your neighborhood
        </Typography>
      </Box>

      {tasks.length === 0 ? (
        <Box sx={{ textAlign: "center", py: 4 }}>
          <Typography variant="body1">
            No tasks available at the moment
          </Typography>
        </Box>
      ) : (
        <Grid container spacing={3}>
          {tasks.map((task) => (
            <Grid item xs={12} key={task.id}>
              <Box
                sx={{
                  p: 3,
                  border: "1px solid #e0e0e0",
                  borderRadius: 2,
                  "&:hover": { boxShadow: "0 2px 8px rgba(0,0,0,0.1)" },
                  cursor: "pointer",
                }}
                onClick={() => handleTaskClick(task.id)}
              >
                <Typography variant="h6">{task.title}</Typography>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    mt: 2,
                  }}
                >
                  <Typography variant="body2" color="text.secondary">
                    Status:{" "}
                    <span
                      style={{
                        color: task.status === "Open" ? "#4caf50" : "#ff9800",
                      }}
                    >
                      {task.status}
                    </span>
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Created: {task.createdAt}
                  </Typography>
                </Box>
              </Box>
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  );
};

export default TaskListPage;
