import React, { useEffect, useState } from "react";
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

const AllRequests = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const { tasks, pagination, loading, error } = useSelector(
    (state) => state.allRequests
  );

  // Get current page from URL params
  const currentPage = parseInt(searchParams.get("page") || "1", 10);
  
  // Get filter parameters from URL
  const categoryFilter = searchParams.get("category");
  const urgencyFilter = searchParams.get("urgency_level");

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
  }, [dispatch, currentPage, categoryFilter, urgencyFilter]);

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
    navigate(`/requests?category=${category}`);
  };

  // Handle urgency filter navigation
  const handleUrgencyClick = (urgencyLevel) => {
    navigate(`/requests?urgency_level=${urgencyLevel}`);
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
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Error Loading Requests
          </h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => dispatch(fetchAllTasks({ page: currentPage }))}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
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
      <div className="flex justify-between items-start my-8 ">
        {/* All Requests Title */}
        <div>
          <h1 className="font-medium text-xl text-gray-900 font-inter">
            {categoryFilter 
              ? `${categoryMapping[categoryFilter] || categoryFilter} Requests` 
              : urgencyFilter
                ? `${urgencyLevels[urgencyFilter]?.name || urgencyFilter} Priority Requests`
                : "All Requests"
            }
          </h1>
          {(categoryFilter || urgencyFilter) && (
            <p className="text-sm text-gray-600 mt-1">
              {categoryFilter && `Showing requests in ${categoryMapping[categoryFilter] || categoryFilter} category`}
              {urgencyFilter && `Showing ${urgencyLevels[urgencyFilter]?.name || urgencyFilter} priority requests`}
              {categoryFilter && urgencyFilter && " • "}
              <button
                onClick={() => navigate('/requests')}
                className="text-blue-600 hover:text-blue-800 underline ml-2"
              >
                Clear filters
              </button>
            </p>
          )}
        </div>

        {/* Header Icons */}
        <div className="flex space-x-4">
          {/* Sort Icon */}
          <button className="w-6 h-6 text-gray-900 hover:text-indigo-600 transition-colors">
            <img src={sortIcon} alt="Sort" className="w-full h-full" />
          </button>

          {/* Filter Icon */}
          <button className="w-6 h-6 text-gray-900 hover:text-indigo-600 transition-colors">
            <img src={filterIcon} alt="Filter" className="w-full h-full" />
          </button>
        </div>
      </div>

      {/* Request Cards Grid */}
      <div className="px-5 overflow-hidden">
        {loading ? (
          // Loading state - show skeleton cards
          <div className="grid grid-cols-2 gap-5">
            {[...Array(6)].map((_, index) => (
              <div
                key={index}
                className=" bg-gray-100 rounded-2xl animate-pulse"
              >
                <div className="p-2">
                  <div className=" bg-gray-200 rounded-xl"></div>
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          // Actual content
          <div className="grid grid-cols-2 gap-5">
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
              [...Array(6 - tasks.length)].map((_, index) => (
                <div key={`empty-${index}`} className="w-[407px] h-[122px]">
                  {/* Empty slot - maintains grid layout */}
                </div>
              ))}
          </div>
        )}

        {/* Empty state when no tasks */}
        {!loading && tasks.length === 0 && (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-gray-400"
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
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No Requests Available
              </h3>
              <p className="text-gray-600">
                There are currently no requests to display.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Pagination Controls */}
      {!loading && tasks.length > 0 && pagination.totalPages > 1 && (
        <div className="flex justify-center items-center mt-8 space-x-4">
          <button
            onClick={handlePreviousPage}
            disabled={!pagination.hasPreviousPage}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              pagination.hasPreviousPage
                ? "bg-indigo-600 text-white hover:bg-indigo-700"
                : "bg-gray-200 text-gray-400 cursor-not-allowed"
            }`}
          >
            Previous
          </button>

          <div className="flex items-center space-x-2">
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

                return (
                  <button
                    key={pageNumber}
                    onClick={() => handlePageChange(pageNumber)}
                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      currentPage === pageNumber
                        ? "bg-indigo-600 text-white"
                        : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                    }`}
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
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              pagination.hasNextPage
                ? "bg-indigo-600 text-white hover:bg-indigo-700"
                : "bg-gray-200 text-gray-400 cursor-not-allowed"
            }`}
          >
            Next
          </button>
        </div>
      )}

      {/* Pagination Info */}
      {!loading && tasks.length > 0 && (
        <div className="text-center mt-4 text-sm text-gray-600">
          Showing {tasks.length} of {pagination.totalItems} requests
          {pagination.totalPages > 1 && (
            <span>
              {" "}
              (Page {currentPage} of {pagination.totalPages})
            </span>
          )}
        </div>
      )}
    </>
  );
};

export default AllRequests;
