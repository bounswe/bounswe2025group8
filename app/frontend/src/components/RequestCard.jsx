import React from "react";
import { useNavigate } from "react-router-dom";
import { categoryMapping } from "../constants/categories";
import { formatRelativeTime } from "../utils/dateUtils";
import { urgencyLevels } from "../constants/urgency_level";
import { extractRegionFromLocation } from "../utils/taskUtils";

// Custom icons to replace Material-UI icons
const AccessTimeIcon = ({ className }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8z" />
    <path d="M12.5 7H11v6l5.25 3.15.75-1.23-4.5-2.67z" />
  </svg>
);

const LocationOnIcon = ({ className }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
  </svg>
);

const PriorityHighIcon = ({ className }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <circle cx="12" cy="19" r="2" />
    <path d="M10 3h4v12h-4z" />
  </svg>
);
/**
 * RequestCard component that displays a request with category, urgency, and other details.
 * @param {Object} props
 * @param {Object} props.request - The request data
 * @param {string} props.request.id - Unique identifier for the request
 * @param {string} props.request.title - Title of the request
 * @param {string} props.request.category - Category this request belongs to
 * @param {number} props.request?.task?.urgency_level - Urgency level (1-5) when request has nested task structure
 * @param {number} props.request?.urgency_level - Urgency level (1-5) when urgency is directly on request object
 * @param {string} props.request.created_at - ISO timestamp when the request was created
 * @param {string} props.request.deadline - ISO timestamp for the request's deadline
 * @param {string} props.request.imageUrl - Optional image for the request
 * @param {Function} props.onClick - Function called when card is clicked
 * @param {string} props.className - Additional CSS classes to apply
 */
const RequestCard = ({ request, onClick, className = "" }) => {
  const navigate = useNavigate();

  const handleCategoryClick = (category, event) => {
    // Prevent triggering the card's onClick
    event.stopPropagation();

    navigate(`/requests?category=${category}`);
  };
  const handleUrgencyClick = (urgencyLevel, event) => {
    // Prevent triggering the card's onClick
    event.stopPropagation();
    // Navigate to filtered requests by urgency using query params
    // Use urgency_level in URL to match our component state, will be converted to 'urgency' in the API call
    navigate(`/requests?urgency_level=${urgencyLevel}`);
  };

  return (
    <div
      onClick={() => onClick?.(request.id)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " " || e.key === "Spacebar") {
          e.preventDefault();
          onClick(request.id);
        }
      }}
      role="button"
      tabIndex={0}
      className={`flex flex-col rounded-lg cursor-pointer transition-all duration-200 overflow-hidden
        w-full sm:w-96 mx-auto bg-white shadow-md
        hover:-translate-y-1 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500
        ${className}`}
    >
      {/* Top section with image on left, title and time on right */}
      <div className="flex p-2">
        {/* Request Image with padding and rounded corners - smaller dimensions */}
        <div className="w-[90px] h-[90px] flex-shrink-0 bg-gray-100 rounded-[14px] overflow-hidden mr-2.5 border border-gray-200 p-0.5">
          {request.imageUrl ? (
            <img
              src={request.imageUrl}
              alt={request.title}
              className="w-full h-full object-cover rounded-xl"
            />
          ) : (
            // Placeholder when no image
            <div className="w-full h-full flex items-center justify-center">
              <p className="text-sm text-gray-500">No Image</p>
            </div>
          )}
        </div>
        {/* Title and time to the right of image - wider area */}
        <div className="flex flex-col justify-between w-[calc(100%-110px)]">
          {/* Title - left aligned and bold */}
          <div
            className="mt-0 mb-1 overflow-hidden text-ellipsis text-left font-bold leading-[1.3] 
                          [-webkit-line-clamp:2] [-webkit-box-orient:vertical] [display:-webkit-box]"
          >
            {request.title}
          </div>
          {/* Deadline */}
          <div className="flex items-center">
            <PriorityHighIcon className="w-5 h-5 text-gray-600 mr-1" />
            <p className="text-sm text-gray-600">
              Deadline{" "}
              {request.deadline
                ? formatRelativeTime(request.deadline)
                : "time is unknown"}
            </p>
          </div>

          {/* Time Posted */}
          <div className="flex items-center">
            <AccessTimeIcon className="w-5 h-5 text-gray-600 mr-1" />
            <p className="text-sm text-gray-600">
              Posted{" "}
              {request.created_at
                ? formatRelativeTime(request.created_at)
                : "time is unknown"}
            </p>
          </div>
        </div>
      </div>
      <div className="pt-0 px-2 pb-2 flex flex-col">
        <div className="border-t border-gray-200 mt-1 mb-2" />
        {/* Category and Urgency */}
        <div className="flex justify-evenly items-center mb-1.5">
          {/* Single Category chip */}
          {request.category && (
            <button
              onClick={(e) => handleCategoryClick(request.category, e)}
              onKeyDown={(e) => {
                if (
                  e.key === "Enter" ||
                  e.key === " " ||
                  e.key === "Spacebar"
                ) {
                  e.preventDefault();
                  e.stopPropagation(); // Prevent card's keyboard handler
                  handleCategoryClick(request.category, e);
                }
              }}
              tabIndex={0}
              className="rounded-2xl bg-gray-100 hover:bg-gray-200 h-6 text-xs font-medium px-3 w-1/2 transition-colors"
            >
              {categoryMapping[request.category] || request.category}
            </button>
          )}

          {/* Urgency chip/label */}
          <button
            onClick={(e) =>
              handleUrgencyClick(
                request?.task?.urgency_level || request?.urgency_level,
                e
              )
            }
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " " || e.key === "Spacebar") {
                e.preventDefault();
                e.stopPropagation(); // Prevent card's keyboard handler
                handleUrgencyClick(
                  request?.task?.urgency_level || request?.urgency_level,
                  e
                );
              }
            }}
            tabIndex={0}
            className={`rounded-2xl text-white h-6 text-xs font-medium px-3 w-1/2 hover:opacity-90 transition-opacity
              ${
                urgencyLevels[
                  request?.task?.urgency_level || request?.urgency_level
                ] &&
                urgencyLevels[
                  request?.task?.urgency_level || request?.urgency_level
                ].name === "Critical"
                  ? "font-bold"
                  : ""
              }`}
            style={{
              backgroundColor: urgencyLevels[
                request?.task?.urgency_level || request?.urgency_level
              ]
                ? urgencyLevels[
                    request?.task?.urgency_level || request?.urgency_level
                  ].color
                : "#9e9e9e",
            }}
          >
            {"Urgency: " +
              (urgencyLevels[
                request?.task?.urgency_level || request?.urgency_level
              ]
                ? urgencyLevels[
                    request?.task?.urgency_level || request?.urgency_level
                  ].name
                : "Unknown")}
          </button>
        </div>
        {/* Location if available */}
        {request.location && (
          <div className="flex items-center mt-0.5">
            <LocationOnIcon className="w-5 h-5 text-gray-600 mr-1" />
            <p className="text-sm text-gray-600 overflow-hidden text-ellipsis whitespace-nowrap max-w-[85%]">
              {extractRegionFromLocation(request.location)}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default RequestCard;
