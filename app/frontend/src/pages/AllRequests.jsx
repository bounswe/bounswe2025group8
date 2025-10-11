import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import RequestCardForHomePage from "../components/RequestCardForHomePage";
import {
  fetchPopularTasks,
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

  const { tasks, loading, error } = useSelector((state) => state.allRequests);

  // Debug logs
  console.log("AllRequests Component State:", { tasks, loading, error });

  useEffect(() => {
    console.log("AllRequests useEffect: Fetching popular tasks...");
    // Fetch popular tasks when component mounts
    dispatch(fetchPopularTasks(6));

    // Clear any existing errors
    return () => {
      dispatch(clearError());
    };
  }, [dispatch]);

  // TEMPORARY: Mock data for testing
  const mockTasks = [
    {
      id: 1,
      title: "Help me to see a doctor",
      category: "HEALTHCARE",
      urgency_level: 4,
      location:
        "Country: Turkey, State: Istanbul, City: Istanbul, Neighborhood: Besiktas",
      created_at: "2025-10-12T10:00:00Z",
    },
    {
      id: 2,
      title: "Need grocery shopping",
      category: "GROCERY_SHOPPING",
      urgency_level: 2,
      location:
        "Country: Turkey, State: Istanbul, City: Istanbul, Neighborhood: Kadikoy",
      created_at: "2025-10-12T09:00:00Z",
    },
  ];

  // Use mock data if tasks array is empty (for testing)
  const displayTasks = tasks.length > 0 ? tasks : mockTasks;

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
            onClick={() => dispatch(fetchPopularTasks(6))}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative up-[10px] left-[125px] w-[873px] h-[572px] bg-transparent rounded-md shadow-sm border border-gray-100/[0.07]">
      {/* Header Section */}
      <div className="relative">
        {/* All Requests Title */}
        <h1 className="absolute top-6 left-5 font-medium text-xl leading-[30px] text-gray-900 font-inter">
          All Requests
        </h1>

        {/* Header Icons */}
        <div className="absolute top-[27px] right-12 flex space-x-4">
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
      <div className="absolute top-[70px] left-5 w-[833px] h-[482px] overflow-hidden">
        {loading ? (
          // Loading state - show skeleton cards
          <div className="grid grid-cols-2 gap-5">
            {[...Array(6)].map((_, index) => (
              <div
                key={index}
                className="w-[407px] h-[122px] bg-gray-100 rounded-2xl animate-pulse"
              >
                <div className="p-2">
                  <div className="w-[72px] h-[72px] bg-gray-200 rounded-xl"></div>
                  <div className="ml-[92px] mt-[-72px] space-y-2">
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
            {displayTasks.map((task) => {
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
            {displayTasks.length < 6 &&
              [...Array(6 - displayTasks.length)].map((_, index) => (
                <div key={`empty-${index}`} className="w-[407px] h-[122px]">
                  {/* Empty slot - maintains grid layout */}
                </div>
              ))}
          </div>
        )}

        {/* Empty state when no tasks */}
        {!loading && displayTasks.length === 0 && (
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
                There are currently no popular requests to display.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AllRequests;
