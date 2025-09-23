import React from "react";
import {
  Box,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  CardActions,
  Container,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";

const HomeDashboard = () => {
  const navigate = useNavigate();
  const { currentUser } = useSelector((state) => state.auth);

  const quickLinks = [
    {
      title: "Browse Tasks",
      description: "Find tasks that need help in your neighborhood",
      path: "/tasks",
      color: "#4caf50",
    },
    {
      title: "Post a Task",
      description: "Request assistance from volunteers",
      path: "/create-task",
      color: "#2196f3",
    },
    {
      title: "My Activities",
      description: "View your ongoing and past tasks",
      path: "/my-tasks",
      color: "#ff9800",
    },
  ];

  return (
    <Container>
      <Box sx={{ mb: 4, textAlign: "left" }}>
        <Typography variant="h4" gutterBottom>
          {currentUser
            ? `Welcome back, ${currentUser.name || "User"}!`
            : "Welcome to Neighborhood Assistance Board!"}
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          Connect with your community, help neighbors, and get assistance when
          you need it.
        </Typography>
      </Box>

      <Grid container spacing={4}>
        {quickLinks.map((link) => (
          <Grid item xs={12} md={4} key={link.title}>
            <Card
              sx={{
                height: "100%",
                display: "flex",
                flexDirection: "column",
                borderTop: `4px solid ${link.color}`,
                "&:hover": { boxShadow: "0 4px 20px rgba(0,0,0,0.1)" },
                transition: "all 0.3s ease",
              }}
            >
              <CardContent sx={{ flexGrow: 1 }}>
                <Typography gutterBottom variant="h5" component="h2">
                  {link.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {link.description}
                </Typography>
              </CardContent>
              <CardActions>
                <Button
                  size="small"
                  onClick={() => navigate(link.path)}
                  sx={{ color: link.color }}
                >
                  Explore
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Box sx={{ mt: 6, mb: 4, textAlign: "center" }}>
        <Typography variant="h5" gutterBottom>
          How It Works
        </Typography>
        <Grid container spacing={3} sx={{ mt: 2 }}>
          <Grid item xs={12} md={4}>
            <Box sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Request Help
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Post a task describing what you need help with in your
                neighborhood
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} md={4}>
            <Box sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Connect
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Volunteers in your area will respond to your request
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} md={4}>
            <Box sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Get Help
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Select a volunteer and get the assistance you need
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
};

export default HomeDashboard;
