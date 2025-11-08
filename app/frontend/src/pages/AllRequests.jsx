import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useSearchParams } from "react-router-dom";
import RequestCardForHomePage from "../components/RequestCardForHomePage";
import {
  fetchAllTasks,
  clearError,
} from "../features/request/store/allRequestsSlice";
import { categoryMapping, getCategoryImage } from "../constants/categories";
import { urgencyLevels } from "../constants/urgency_level";
import { formatRelativeTime } from "../utils/dateUtils";
import { extractRegionFromLocation } from "../utils/taskUtils";
import sortIcon from "../assets/sort.svg";
import filterIcon from "../assets/filter.svg";
import AddressFilterDialog from "../components/AddressFilterDialog";
import { useTheme } from "../hooks/useTheme";

const AllRequests = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { colors } = useTheme();

  const { tasks, pagination, loading, error } = useSelector(
    (state) => state.allRequests
  );

  // Get current page from URL params
  const currentPage = parseInt(searchParams.get("page") || "1", 10);

  // Get filter parameters from URL
  const categoryFilter = searchParams.get("category");
  const urgencyFilter = searchParams.get("urgency_level");
  const locationFilter = searchParams.get("location");

  const [locationInput, setLocationInput] = useState(locationFilter || "");
  const [addressDialogOpen, setAddressDialogOpen] = useState(false);

  // Debug logs
  console.log("AllRequests Component State:", {
    tasks,
    pagination,
    loading,
    error,
    categoryFilter,
    urgencyFilter,
  });

  useEffect(() => {
    // Build filters object from URL parameters
    const filters = {};
    if (categoryFilter) {
      filters.category = categoryFilter;
    }
    if (urgencyFilter) {
      filters.urgency_level = urgencyFilter;
    }
    if (locationFilter) {
      filters.location = locationFilter;
    }

    // Always exclude cancelled tasks from AllRequests page
    // You can modify this if you want to show cancelled tasks in some scenarios
    // Note: The backend expects multiple status values to be comma-separated
    // For now, we'll handle this in the frontend by filtering the results

    console.log(
      "AllRequests useEffect: Fetching tasks for page:",
      currentPage,
      "with filters:",
      filters
    );

    // Fetch tasks with filters and pagination
    dispatch(fetchAllTasks({ filters, page: currentPage }));

    // Clear any existing errors
    return () => {
      dispatch(clearError());
    };
  }, [dispatch, currentPage, categoryFilter, urgencyFilter, locationFilter]);

  // Handle pagination
  const handlePageChange = (newPage) => {
    const newSearchParams = new URLSearchParams(searchParams);
    newSearchParams.set("page", newPage.toString());
    setSearchParams(newSearchParams);
  };

  const handlePreviousPage = () => {
    if (pagination.hasPreviousPage) {
      handlePageChange(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (pagination.hasNextPage) {
      handlePageChange(currentPage + 1);
    }
  };

  // Handle card navigation
  const handleCardClick = (taskId) => {
    navigate(`/requests/${taskId}`);
  };

  // Handle category filter navigation
  const handleCategoryClick = (category) => {
    const newSearchParams = new URLSearchParams(searchParams);
    newSearchParams.set("category", category);
    newSearchParams.set("page", "1");
    setSearchParams(newSearchParams);
  };

  // Handle urgency filter navigation
  const handleUrgencyClick = (urgencyLevel) => {
    const newSearchParams = new URLSearchParams(searchParams);
    newSearchParams.set("urgency_level", urgencyLevel);
    newSearchParams.set("page", "1");
    setSearchParams(newSearchParams);
  };

  const applyLocationFilter = () => {
    const newSearchParams = new URLSearchParams(searchParams);
    if (locationInput && locationInput.trim()) {
      newSearchParams.set("location", locationInput.trim());
    } else {
      newSearchParams.delete("location");
    }
    newSearchParams.set("page", "1");
    setSearchParams(newSearchParams);
  };

  // Handle navigate button click
  const handleNavigateClick = (taskId) => {
    navigate(`/requests/${taskId}`);
  };

  // Format task data for RequestCardForHomePage component
  const formatTaskForCard = (task) => {
    const categoryDisplayName = categoryMapping[task.category] || task.category;
    const urgencyDisplayName =
      urgencyLevels[task.urgency_level]?.name || "Unknown";
    const imageUrl = getCategoryImage(task.category);

    // Format location (fallback to "Location not specified")
    const location = task.location
      ? extractRegionFromLocation(task.location)
      : "Location not specified";

    // Format time ago
    const timeAgo = task.created_at
      ? formatRelativeTime(task.created_at)
      : "Time unknown";

    return {
      id: task.id,
      title: task.title,
      location: location,
      timeAgo: timeAgo,
      category: categoryDisplayName,
      urgencyLevel: urgencyDisplayName,
      imageUrl: imageUrl,
      imageAlt: `${categoryDisplayName} request`,
    };
  };

  if (error) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "24rem",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <h3
            style={{
              fontSize: "1.125rem",
              fontWeight: 500,
              color: colors.text.primary,
              marginBottom: "8px",
            }}
          >
            Error Loading Requests
          </h3>
          <p style={{ color: colors.text.secondary, marginBottom: "16px" }}>
            {error}
          </p>
          <button
            onClick={() => dispatch(fetchAllTasks({ page: currentPage }))}
            style={{
              padding: "8px 16px",
              backgroundColor: colors.brand.primary,
              color: "#FFFFFF",
              borderRadius: "6px",
              border: "none",
              cursor: "pointer",
              transition: "background-color 0.2s",
            }}
            onMouseOver={(e) =>
              (e.currentTarget.style.backgroundColor =
                colors.brand.primaryHover)
            }
            onMouseOut={(e) =>
              (e.currentTarget.style.backgroundColor = colors.brand.primary)
            }
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Header Section */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "start",
          margin: "32px 0",
        }}
      >
        {/* All Requests Title */}
        <div>
          <h1
            style={{
              fontWeight: 500,
              fontSize: "1.25rem",
              color: colors.text.primary,
              fontFamily: "Inter, sans-serif",
            }}
          >
            {categoryFilter
              ? `${categoryMapping[categoryFilter] || categoryFilter} Requests`
              : urgencyFilter
              ? `${
                  urgencyLevels[urgencyFilter]?.name || urgencyFilter
                } Priority Requests`
              : "All Requests"}
          </h1>
          {(categoryFilter || urgencyFilter || locationFilter) && (
            <p
              style={{
                fontSize: "0.875rem",
                color: colors.text.secondary,
                marginTop: "4px",
              }}
            >
              {categoryFilter &&
                `Showing requests in ${
                  categoryMapping[categoryFilter] || categoryFilter
                } category`}
              {urgencyFilter &&
                `${categoryFilter ? " • " : ""}Showing ${
                  urgencyLevels[urgencyFilter]?.name || urgencyFilter
                } priority requests`}
              {locationFilter &&
                `${
                  categoryFilter || urgencyFilter ? " • " : ""
                }Near: ${locationFilter}`}
              <button
                onClick={() => navigate("/requests")}
                style={{
                  color: colors.brand.primary,
                  textDecoration: "underline",
                  marginLeft: "8px",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  fontSize: "0.875rem",
                }}
                onMouseOver={(e) =>
                  (e.currentTarget.style.color = colors.brand.primaryHover)
                }
                onMouseOut={(e) =>
                  (e.currentTarget.style.color = colors.brand.primary)
                }
              >
                Clear filters
              </button>
            </p>
          )}
        </div>

        {/* Header Icons */}
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          {/* Location filter */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              backgroundColor: colors.background.elevated,
              border: `1px solid ${colors.border.primary}`,
              borderRadius: "9999px",
              overflow: "hidden",
            }}
          >
            <input
              type="text"
              placeholder="Filter by location (district/city)"
              style={{
                padding: "8px 16px",
                fontSize: "0.875rem",
                outline: "none",
                minWidth: "220px",
                backgroundColor: "transparent",
                color: colors.text.primary,
                border: "none",
              }}
              value={locationInput}
              onChange={(e) => setLocationInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") applyLocationFilter();
              }}
            />
            <button
              onClick={applyLocationFilter}
              style={{
                padding: "8px 16px",
                fontSize: "0.875rem",
                backgroundColor: colors.brand.primary,
                color: "#FFFFFF",
                border: "none",
                cursor: "pointer",
                transition: "background-color 0.2s",
              }}
              onMouseOver={(e) =>
                (e.currentTarget.style.backgroundColor =
                  colors.brand.primaryHover)
              }
              onMouseOut={(e) =>
                (e.currentTarget.style.backgroundColor = colors.brand.primary)
              }
            >
              Apply
            </button>
          </div>
          {/* Sort Icon */}
          <button
            style={{
              width: "24px",
              height: "24px",
              color: colors.text.primary,
              transition: "color 0.2s",
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: 0,
            }}
            onMouseOver={(e) =>
              (e.currentTarget.style.color = colors.brand.primary)
            }
            onMouseOut={(e) =>
              (e.currentTarget.style.color = colors.text.primary)
            }
            aria-label="Sort requests"
          >
            <img
              src={sortIcon}
              alt="Sort"
              style={{
                width: "100%",
                height: "100%",
                filter:
                  colors.text.primary === "#FFFFFF" ? "invert(1)" : "none",
              }}
            />
          </button>

          {/* Filter Icon */}
          <button
            style={{
              width: "24px",
              height: "24px",
              color: colors.text.primary,
              transition: "color 0.2s",
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: 0,
            }}
            onClick={() => setAddressDialogOpen(true)}
            onMouseOver={(e) =>
              (e.currentTarget.style.color = colors.brand.primary)
            }
            onMouseOut={(e) =>
              (e.currentTarget.style.color = colors.text.primary)
            }
            aria-label="Open address filter"
          >
            <img
              src={filterIcon}
              alt="Filter"
              style={{
                width: "100%",
                height: "100%",
                filter:
                  colors.text.primary === "#FFFFFF" ? "invert(1)" : "none",
              }}
            />
          </button>
        </div>
      </div>

      {/* Request Cards Grid */}
      <div style={{ padding: "0 20px", overflow: "hidden" }}>
        {loading ? (
          // Loading state - show skeleton cards
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(2, 1fr)",
              gap: "20px",
            }}
          >
            {[...Array(6)].map((_, index) => (
              <div
                key={index}
                style={{
                  backgroundColor: colors.background.secondary,
                  borderRadius: "16px",
                  animation: "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
                }}
              >
                <div style={{ padding: "8px" }}>
                  <div
                    style={{
                      backgroundColor: colors.background.tertiary,
                      borderRadius: "12px",
                      height: "64px",
                      marginBottom: "8px",
                    }}
                  ></div>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "8px",
                    }}
                  >
                    <div
                      style={{
                        height: "16px",
                        backgroundColor: colors.background.tertiary,
                        borderRadius: "4px",
                        width: "75%",
                      }}
                    ></div>
                    <div
                      style={{
                        height: "12px",
                        backgroundColor: colors.background.tertiary,
                        borderRadius: "4px",
                        width: "50%",
                      }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          // Actual content
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(2, 1fr)",
              gap: "20px",
            }}
          >
            {tasks.map((task) => {
              const formattedTask = formatTaskForCard(task);
              return (
                <RequestCardForHomePage
                  key={task.id}
                  title={formattedTask.title}
                  location={formattedTask.location}
                  timeAgo={formattedTask.timeAgo}
                  category={formattedTask.category}
                  urgencyLevel={formattedTask.urgencyLevel}
                  imageUrl={formattedTask.imageUrl}
                  imageAlt={formattedTask.imageAlt}
                  onClick={() => handleCardClick(task.id)}
                  onCategoryClick={() => handleCategoryClick(task.category)}
                  onUrgencyClick={() => handleUrgencyClick(task.urgency_level)}
                  onNavigateClick={() => handleNavigateClick(task.id)}
                />
              );
            })}

            {/* Fill empty slots if less than 6 tasks */}
            {tasks.length < 6 &&
              [...Array(Math.max(0, 6 - tasks.length))].map((_, index) => (
                <div
                  key={`empty-${index}`}
                  style={{ width: "407px", height: "122px" }}
                >
                  {/* Empty slot - maintains grid layout */}
                </div>
              ))}
          </div>
        )}

        {/* Empty state when no tasks */}
        {!loading && tasks.length === 0 && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              height: "100%",
            }}
          >
            <div style={{ textAlign: "center" }}>
              <div
                style={{
                  width: "64px",
                  height: "64px",
                  backgroundColor: colors.background.secondary,
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 16px",
                }}
              >
                <svg
                  style={{
                    width: "32px",
                    height: "32px",
                    color: colors.text.tertiary,
                  }}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
              <h3
                style={{
                  fontSize: "1.125rem",
                  fontWeight: 500,
                  color: colors.text.primary,
                  marginBottom: "8px",
                }}
              >
                No Requests Available
              </h3>
              <p style={{ color: colors.text.secondary }}>
                There are currently no requests to display.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Pagination Controls */}
      {!loading && tasks.length > 0 && pagination.totalPages > 1 && (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            marginTop: "32px",
            gap: "16px",
          }}
        >
          <button
            onClick={handlePreviousPage}
            disabled={!pagination.hasPreviousPage}
            style={{
              padding: "8px 16px",
              borderRadius: "6px",
              fontSize: "0.875rem",
              fontWeight: 500,
              transition: "all 0.2s",
              backgroundColor: pagination.hasPreviousPage
                ? colors.brand.primary
                : colors.interactive.disabled,
              color: pagination.hasPreviousPage
                ? colors.text.inverse
                : colors.text.tertiary,
              cursor: pagination.hasPreviousPage ? "pointer" : "not-allowed",
              border: "none",
            }}
            onMouseOver={(e) => {
              if (pagination.hasPreviousPage) {
                e.currentTarget.style.backgroundColor =
                  colors.brand.primaryHover;
              }
            }}
            onMouseOut={(e) => {
              if (pagination.hasPreviousPage) {
                e.currentTarget.style.backgroundColor = colors.brand.primary;
              }
            }}
          >
            Previous
          </button>

          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            {/* Page numbers */}
            {Array.from(
              { length: Math.min(5, pagination.totalPages) },
              (_, i) => {
                let pageNumber;
                if (pagination.totalPages <= 5) {
                  pageNumber = i + 1;
                } else if (currentPage <= 3) {
                  pageNumber = i + 1;
                } else if (currentPage >= pagination.totalPages - 2) {
                  pageNumber = pagination.totalPages - 4 + i;
                } else {
                  pageNumber = currentPage - 2 + i;
                }

                const isActive = currentPage === pageNumber;
                return (
                  <button
                    key={pageNumber}
                    onClick={() => handlePageChange(pageNumber)}
                    style={{
                      padding: "8px 12px",
                      borderRadius: "6px",
                      fontSize: "0.875rem",
                      fontWeight: 500,
                      transition: "all 0.2s",
                      backgroundColor: isActive
                        ? colors.brand.primary
                        : colors.background.secondary,
                      color: isActive
                        ? colors.text.inverse
                        : colors.text.primary,
                      cursor: "pointer",
                      border: "none",
                    }}
                    onMouseOver={(e) => {
                      if (!isActive) {
                        e.currentTarget.style.backgroundColor =
                          colors.interactive.hover;
                      }
                    }}
                    onMouseOut={(e) => {
                      if (!isActive) {
                        e.currentTarget.style.backgroundColor =
                          colors.background.secondary;
                      }
                    }}
                  >
                    {pageNumber}
                  </button>
                );
              }
            )}
          </div>

          <button
            onClick={handleNextPage}
            disabled={!pagination.hasNextPage}
            style={{
              padding: "8px 16px",
              borderRadius: "6px",
              fontSize: "0.875rem",
              fontWeight: 500,
              transition: "all 0.2s",
              backgroundColor: pagination.hasNextPage
                ? colors.brand.primary
                : colors.interactive.disabled,
              color: pagination.hasNextPage
                ? colors.text.inverse
                : colors.text.tertiary,
              cursor: pagination.hasNextPage ? "pointer" : "not-allowed",
              border: "none",
            }}
            onMouseOver={(e) => {
              if (pagination.hasNextPage) {
                e.currentTarget.style.backgroundColor =
                  colors.brand.primaryHover;
              }
            }}
            onMouseOut={(e) => {
              if (pagination.hasNextPage) {
                e.currentTarget.style.backgroundColor = colors.brand.primary;
              }
            }}
          >
            Next
          </button>
        </div>
      )}

      {/* Pagination Info */}
      {!loading && tasks.length > 0 && (
        <div
          style={{
            textAlign: "center",
            marginTop: "16px",
            fontSize: "0.875rem",
            color: colors.text.secondary,
          }}
        >
          Showing {tasks.length} of {pagination.totalItems} requests
          {pagination.totalPages > 1 && (
            <span>
              {" "}
              (Page {currentPage} of {pagination.totalPages})
            </span>
          )}
        </div>
      )}

      {/* Address filter modal */}
      <AddressFilterDialog
        open={addressDialogOpen}
        onClose={() => setAddressDialogOpen(false)}
        onApply={(selectedLocation) => {
          setLocationInput(selectedLocation);
          const newSearchParams = new URLSearchParams(searchParams);
          if (selectedLocation && selectedLocation.trim()) {
            newSearchParams.set("location", selectedLocation.trim());
          } else {
            newSearchParams.delete("location");
          }
          newSearchParams.set("page", "1");
          setSearchParams(newSearchParams);
        }}
      />
    </>
  );
};

export default AllRequests;
