import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Button,
  Grid,
  Paper,
  CircularProgress,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import CategoryCard from "../components/CategoryCard";
import RequestCard from "../components/RequestCard"; // Import the RequestCard component
import * as categoryService from "../services/categoryService";
import * as taskService from "../services/taskService";
import { getCategoryImage } from "../constants/categories";

const Home = () => {
  const navigate = useNavigate();
  const handleCategoryClick = (categoryId) => {
    // Navigate to requests filtered by this category
    navigate(`/requests?category=${categoryId}`);
  }; // We're now fetching categories and requests from the API
  const [categories, setCategories] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState({
    categories: false,
    requests: false,
  });
  const [error, setError] = useState({
    categories: null,
    requests: null,
  });

  // Fetch data from API
  useEffect(() => {
    const fetchData = async () => {
      // Fetch categories
      setLoading((prev) => ({ ...prev, categories: true }));
      try {
        const popularCategories = await categoryService.getPopularCategories(4);
        // Transform API response to match UI component expectations
        const formattedCategories = popularCategories.map((category) => ({
          id: category.value,
          title: category.name,
          image: getCategoryImage(category.value),
          requestCount: category.task_count,
        }));
        setCategories(formattedCategories);
        setError((prev) => ({ ...prev, categories: null }));
      } catch (err) {
        console.error("Failed to fetch categories:", err);
        setError((prev) => ({
          ...prev,
          categories: "Failed to load categories",
        }));
      } finally {
        setLoading((prev) => ({ ...prev, categories: false }));
      }

      // Fetch popular requests
      setLoading((prev) => ({ ...prev, requests: true }));
      try {
        const popularTasks = await taskService.getPopularTasks(6);
        setRequests(popularTasks);
        setError((prev) => ({ ...prev, requests: null }));
      } catch (err) {
        console.error("Failed to fetch popular requests:", err);
        setError((prev) => ({
          ...prev,
          requests: "Failed to load popular requests",
        }));
        // Clear requests on error
        setRequests([]);
      } finally {
        setLoading((prev) => ({ ...prev, requests: false }));
      }
    };
    fetchData();
  }, []);
  // Using the centralized getCategoryImage function from constants/categories.js

  return (
    <>
      {" "}
      {/* Popular Categories Section */}
      <Box sx={{ mb: 6 }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 2,
          }}
        >
          <Typography variant="h5" component="h2" sx={{ fontWeight: "medium" }}>
            Popular Categories
          </Typography>
          {categories.length > 4 && (
            <Button
              variant="text"
              color="primary"
              onClick={() => navigate("/categories")}
              size="small"
            >
              See All
            </Button>
          )}
        </Box>

        {loading.categories ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
            <CircularProgress />
          </Box>
        ) : error.categories ? (
          <Box sx={{ textAlign: "center", py: 4 }}>
            <Typography color="error">{error.categories}</Typography>
            <Button
              variant="contained"
              sx={{ mt: 2 }}
              onClick={() => {
                setLoading((prev) => ({ ...prev, categories: true }));
                categoryService
                  .getPopularCategories(4)
                  .then((data) => {
                    const formattedCategories = data.map((category) => ({
                      id: category.value,
                      title: category.name,
                      image: getCategoryImage(category.value),
                      requestCount: category.task_count,
                    }));
                    setCategories(formattedCategories);
                    setError((prev) => ({ ...prev, categories: null }));
                  })
                  .catch((err) => {
                    console.error("Failed to fetch categories:", err);
                    setError((prev) => ({
                      ...prev,
                      categories: "Failed to load categories",
                    }));
                  })
                  .finally(() => {
                    setLoading((prev) => ({ ...prev, categories: false }));
                  });
              }}
            >
              Try Again
            </Button>
          </Box>
        ) : (
          <Grid container spacing={2} sx={{ mt: 2, justifyContent: "center" }}>
            {categories.length > 0 ? (
              categories.slice(0, 4).map((category) => (
                <Grid item xs={6} sm={6} md={3} lg={3} key={category.id}>
                  <CategoryCard
                    title={category.title}
                    image={category.image}
                    categoryId={category.id}
                    onClick={() => handleCategoryClick(category.id)}
                  />
                </Grid>
              ))
            ) : (
              <Box sx={{ textAlign: "center", py: 4, width: "100%" }}>
                <Typography color="text.secondary">
                  No categories available
                </Typography>
              </Box>
            )}
          </Grid>
        )}
      </Box>{" "}
      {/* Popular Requests Section */}
      <Box sx={{ mb: 6 }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 2,
          }}
        >
          <Typography variant="h5" component="h2" sx={{ fontWeight: "medium" }}>
            Popular Requests
          </Typography>
          {requests.length > 6 && (
            <Button
              variant="text"
              color="primary"
              onClick={() => navigate("/requests")}
              size="small"
            >
              See All
            </Button>
          )}
        </Box>

        {loading.requests ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
            <CircularProgress />
          </Box>
        ) : error.requests ? (
          <Box sx={{ textAlign: "center", py: 4 }}>
            <Typography color="error">{error.requests}</Typography>
            <Button
              variant="contained"
              sx={{ mt: 2 }}
              onClick={() => {
                setLoading((prev) => ({ ...prev, requests: true }));
                taskService
                  .getPopularTasks(6)
                  .then((data) => {
                    setRequests(data);
                    setError((prev) => ({ ...prev, requests: null }));
                  })
                  .catch((err) => {
                    console.error("Failed to fetch popular requests:", err);
                    setError((prev) => ({
                      ...prev,
                      requests: "Failed to load popular requests",
                    }));
                    setRequests([]); // Clear requests on error
                  })
                  .finally(() => {
                    setLoading((prev) => ({ ...prev, requests: false }));
                  });
              }}
            >
              Try Again
            </Button>
          </Box>
        ) : (
          <Grid container spacing={3} sx={{ mt: 2, justifyContent: "center" }}>
            {requests.length > 0 ? (
              requests.slice(0, 6).map((request) => (
                <Grid item xs={12} sm={6} key={request.id}>
                  <RequestCard
                    request={request}
                    onClick={() => navigate(`/requests/${request.id}`)}
                  />
                </Grid>
              ))
            ) : (
              <Box sx={{ textAlign: "center", py: 4, width: "100%" }}>
                <Typography color="text.secondary">
                  No requests available
                </Typography>
              </Box>
            )}
          </Grid>
        )}
      </Box>
    </>
  );
};

export default Home;
