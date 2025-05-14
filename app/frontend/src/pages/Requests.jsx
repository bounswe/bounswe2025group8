import React, { useState, useEffect, useMemo } from "react";
import {
  Grid,
  Typography,
  Box,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  TextField,
  InputAdornment,
  IconButton,
  Paper,
  CircularProgress,
} from "@mui/material";
import RequestCard from "../components/RequestCard";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchRequests, setPage } from "../store/slices/requestSlice";
import SearchIcon from "@mui/icons-material/Search";
import FilterListIcon from "@mui/icons-material/FilterList";
import ClearIcon from "@mui/icons-material/Clear";
import { categoryMapping } from "../constants/categories.js";
import { urgencyLevels } from "../constants/urgency_level.js";

const Requests = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [searchParams, setSearchParams] = useSearchParams();

  // Get all required state from Redux store at once to avoid conditional hook calls
  const { filteredRequests, loading, error, pagination } = useSelector(
    (state) => state.requests
  );

  // Extract pagination values for use in render
  const { page, totalPages } = pagination;
  // Get filter values directly from URL parameters
  const [searchTerm, setSearchTerm] = useState(
    searchParams.get("search") || ""
  ); // Local filter state to match URL parameters
  const [filters, setLocalFilters] = useState({
    category: searchParams.get("category") || "",
    urgency_level: searchParams.get("urgency_level") || "", // Use urgency_level consistently in UI
    // Removed distance filter as it's not needed
  }); // Initial data fetch and setup - only uses URL parameters
  useEffect(() => {
    // Get current page from URL or default to 1
    const currentPage = parseInt(searchParams.get("page") || "1", 10);

    // Build filters object from URL parameters
    const urlFilters = {
      category: searchParams.get("category") || undefined,
      urgency_level: searchParams.get("urgency_level") || undefined, // Use urgency_level consistently
      search: searchParams.get("search") || undefined,
    };

    // Clean up undefined values
    Object.keys(urlFilters).forEach((key) => {
      if (urlFilters[key] === undefined) {
        delete urlFilters[key];
      }
    });

    // Fetch data from API with URL filters
    dispatch(
      fetchRequests({
        filters: urlFilters,
        page: currentPage,
      })
    );
  }, [dispatch, searchParams]);

  // Update local filters when URL parameters change
  useEffect(() => {
    // Get updated parameters from URL whenever they change
    const currentCategoryParam = searchParams.get("category") || "";
    const currentUrgencyLevelParam = searchParams.get("urgency_level") || ""; // Use urgency_level consistently
    const currentSearchParam = searchParams.get("search") || "";

    // Update our local filter state to match URL parameters
    setLocalFilters({
      category: currentCategoryParam,
      urgency_level: currentUrgencyLevelParam,
    });

    // Update search term state if it changed in the URL
    if (currentSearchParam !== searchTerm) {
      setSearchTerm(currentSearchParam);
    }
  }, [searchParams, searchTerm]);

  // Apply search term filter with debounce
  useEffect(() => {
    // Skip the initial render or when searchTerm is coming from URL
    if (searchTerm === searchParams.get("search")) {
      return;
    }

    const debouncedSearch = setTimeout(() => {
      // Update URL with search term
      const newSearchParams = new URLSearchParams(searchParams);

      if (searchTerm.trim()) {
        newSearchParams.set("search", searchTerm.trim());
      } else {
        newSearchParams.delete("search");
      }

      // Reset to page 1 when search changes
      if (searchParams.has("page")) {
        newSearchParams.set("page", "1");
      }

      setSearchParams(newSearchParams);
    }, 300);

    return () => clearTimeout(debouncedSearch);
  }, [searchTerm, searchParams, setSearchParams]);

  const handleRequestClick = (requestId) => {
    navigate(`/requests/${requestId}`);
  };
  const handleFilterChange = (event) => {
    const { name, value } = event.target;

    // Update local filter state
    setLocalFilters((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Update URL parameters
    const newSearchParams = new URLSearchParams(searchParams);

    if (value) {
      newSearchParams.set(name, value);
    } else {
      newSearchParams.delete(name);
    }

    // Reset to page 1 when filters change
    if (newSearchParams.has("page")) {
      newSearchParams.set("page", "1");
    }

    setSearchParams(newSearchParams);
  };
  const handleClearFilters = () => {
    // Clear local filters
    setLocalFilters({
      category: "",
      urgency_level: "", // Fixed: Use urgency_level consistently
      // Removed distance filter
    });
    setSearchTerm("");

    // Clear URL parameters - but keep any non-filter params if needed
    setSearchParams({});
  };

  const handlePageChange = (newPage) => {
    // Update URL with new page number
    const newSearchParams = new URLSearchParams(searchParams);
    newSearchParams.set("page", newPage.toString());
    setSearchParams(newSearchParams);

    // Update Redux page state
    dispatch(setPage(newPage));
  };
  const hasActiveFilters = useMemo(() => {
    return filters.category || filters.urgency_level || searchTerm;
  }, [filters.category, filters.urgency_level, searchTerm]);

  const getCategoryDisplayName = (categoryId) => {
    return categoryMapping[categoryId] || categoryId;
  };
  return (
    <>
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Help Requests
          {filters.category && (
            <Typography
              component="span"
              variant="h5"
              color="primary.main"
              sx={{ ml: 1, fontWeight: "normal" }}
            >
              • {getCategoryDisplayName(filters.category)}
            </Typography>
          )}
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          {filters.category
            ? `Browse ${getCategoryDisplayName(
                filters.category
              )} requests in your area`
            : "Browse open requests in your area and offer your help"}
        </Typography>
      </Box>

      {/* Search and Filters Section */}
      <Paper
        elevation={2}
        sx={{
          mb: 4,
          p: 2,
          borderRadius: 2,
          backgroundColor: "background.paper",
        }}
      >
        <Grid container spacing={2} alignItems="center">
          {/* Category Filter */}
          <Grid item xs={12} sm={6} md={3} sx={{ display: "flex" }}>
            <FormControl sx={{ minWidth: 180, width: "auto" }} size="small">
              <InputLabel>Category</InputLabel>
              <Select
                name="category"
                value={filters.category}
                onChange={handleFilterChange}
                label="Category"
              >
                <MenuItem value="">All Categories</MenuItem>
                {Object.entries(categoryMapping).map(([id, name]) => (
                  <MenuItem key={id} value={id}>
                    {name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>{" "}
          {/* Urgency Level Filter */}
          <Grid item xs={12} sm={6} md={2} sx={{ display: "flex" }}>
            <FormControl sx={{ minWidth: 180, width: "auto" }} size="small">
              <InputLabel>Urgency</InputLabel>
              <Select
                name="urgency_level" // Change from "urgency" to "urgency_level" to match API parameter
                value={filters.urgency_level} // Update to use urgency_level from filters
                onChange={handleFilterChange}
                label="Urgency"
              >
                <MenuItem value="">Any</MenuItem>
                <MenuItem value="1">Very Low</MenuItem>
                <MenuItem value="2">Low</MenuItem>
                <MenuItem value="3">Medium</MenuItem>
                <MenuItem value="4">High</MenuItem>
                <MenuItem value="5">Critical</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          {/* Clear Filters */}
          {hasActiveFilters && (
            <Grid
              item
              xs={12}
              sm={6}
              md={3}
              sx={{ display: "flex", justifyContent: "flex-end" }}
            >
              <Button
                variant="outlined"
                color="primary"
                onClick={handleClearFilters}
                startIcon={<ClearIcon />}
                size="small"
              >
                Clear Filters
              </Button>
            </Grid>
          )}
        </Grid>

        {/* Active Filters */}
        {hasActiveFilters && (
          <Box sx={{ mt: 2, display: "flex", flexWrap: "wrap", gap: 1 }}>
            <Typography
              variant="body2"
              sx={{
                color: "text.secondary",
                mr: 1,
                display: "flex",
                alignItems: "center",
              }}
            >
              <FilterListIcon fontSize="small" sx={{ mr: 0.5 }} />
              Active filters:
            </Typography>
            {filters.category && (
              <Chip
                label={`Category: ${getCategoryDisplayName(filters.category)}`}
                size="small"
                onDelete={() =>
                  handleFilterChange({
                    target: { name: "category", value: "" },
                  })
                }
              />
            )}{" "}
            {filters.urgency_level && (
              <Chip
                label={`Urgency: ${
                  filters.urgency_level
                    ? urgencyLevels[filters.urgency_level]?.name ||
                      filters.urgency_level
                    : ""
                }`}
                size="small"
                onDelete={() =>
                  handleFilterChange({
                    target: { name: "urgency_level", value: "" },
                  })
                }
              />
            )}
            {searchTerm && (
              <Chip
                label={`Search: ${searchTerm}`}
                size="small"
                onDelete={() => setSearchTerm("")}
              />
            )}
          </Box>
        )}
      </Paper>
      {/* Loading State */}
      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Box sx={{ textAlign: "center", py: 8 }}>
          <Typography variant="h6" color="error">
            {error}
          </Typography>{" "}
          <Button
            variant="contained"
            color="primary"
            sx={{ mt: 3 }}
            onClick={() => {
              // Rebuild URL with current filters
              const newSearchParams = new URLSearchParams(); // Add current filters to URL if they exist
              if (filters.category)
                newSearchParams.set("category", filters.category);
              if (filters.urgency_level)
                newSearchParams.set("urgency_level", filters.urgency_level);
              if (searchTerm) newSearchParams.set("search", searchTerm);

              // Set page to 1
              newSearchParams.set("page", "1");

              // Update URL - this will trigger fetch via the useEffect
              setSearchParams(newSearchParams);
            }}
          >
            Try Again
          </Button>
        </Box>
      ) : (
        <>
          {/* Results section */}
          <Box sx={{ mb: 2 }}>
            <Typography
              variant="subtitle1"
              component="div"
              sx={{ fontWeight: "medium", mb: 1 }}
            >
              {filteredRequests.length}{" "}
              {filteredRequests.length === 1 ? "request" : "requests"} found
            </Typography>
          </Box>

          {/* Request Cards */}
          {filteredRequests.length > 0 ? (
            <Box
              sx={{ display: "flex", justifyContent: "center", width: "100%" }}
            >
              <Box sx={{ width: "100%", maxWidth: "1200px" }}>
                <Grid
                  container
                  spacing={3}
                  sx={{
                    mb: 4,
                    justifyContent: "center", // Centers grid items when they don't fill the row
                  }}
                >
                  {filteredRequests.map((request) => (
                    <Grid
                      item
                      xs={12}
                      sm={12}
                      md={6}
                      lg={4}
                      key={request.id}
                      sx={{ display: "flex", justifyContent: "center" }} // Centers each card
                    >
                      <Box sx={{ width: "100%", maxWidth: "400px" }}>
                        <RequestCard
                          request={request}
                          onClick={() => handleRequestClick(request.id)}
                        />
                      </Box>
                    </Grid>
                  ))}
                </Grid>{" "}
                {/* Pagination */}
                {totalPages > 1 && (
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "center",
                      mt: 4,
                      mb: 2,
                    }}
                  >
                    <Button
                      disabled={page <= 1}
                      onClick={() => handlePageChange(page - 1)}
                      sx={{ mx: 1 }}
                    >
                      Previous
                    </Button>
                    <Typography
                      sx={{ mx: 2, display: "flex", alignItems: "center" }}
                    >
                      Page {page} of {totalPages}
                    </Typography>
                    <Button
                      disabled={page >= totalPages}
                      onClick={() => handlePageChange(page + 1)}
                      sx={{ mx: 1 }}
                    >
                      Next
                    </Button>
                  </Box>
                )}
              </Box>
            </Box>
          ) : (
            <Box sx={{ textAlign: "center", py: 8 }}>
              <Typography variant="h6" color="text.secondary">
                No requests found matching your criteria
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Try adjusting your filters or search term
              </Typography>
              <Button
                variant="contained"
                color="primary"
                sx={{ mt: 3 }}
                onClick={handleClearFilters}
              >
                Clear All Filters
              </Button>
            </Box>
          )}
        </>
      )}
    </>
  );
};

export default Requests;
