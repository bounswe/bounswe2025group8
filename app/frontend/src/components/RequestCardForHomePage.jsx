import React from "react";
import { urgencyLevels } from "../constants/urgency_level";

/**
 * RequestCardForHomePage component that displays a request card with image, title, location/time info,
 * category tag, urgency badge, and navigation arrow.
 *
 * @param {Object} props
 * @param {string} props.title - The main title of the request
 * @param {string} props.location - Location text (e.g., "2 km away")
 * @param {string} props.timeAgo - Time posted text (e.g., "3 hours ago")
 * @param {string} props.category - Category name (e.g., "Healthcare")
 * @param {string} props.urgencyLevel - Urgency level (e.g., "High")
 * @param {string} props.imageUrl - URL for the request image
 * @param {string} props.imageAlt - Alt text for the image
 * @param {Function} props.onClick - Function called when card is clicked
 * @param {Function} props.onCategoryClick - Function called when category tag is clicked
 * @param {Function} props.onUrgencyClick - Function called when urgency badge is clicked
 * @param {Function} props.onNavigateClick - Function called when arrow button is clicked
 */
const RequestCardForHomePage = ({
  title = "Help me to see a doctor",
  location = "2 km away",
  timeAgo = "3 hours ago",
  category = "Healthcare",
  urgencyLevel = "High",
  imageUrl,
  imageAlt = "Request image",
  onClick,
  onCategoryClick,
  onUrgencyClick,
  onNavigateClick,
}) => {
  const getBGColorForUrgency = (level) => {
    for (const key in urgencyLevels) {
      if (urgencyLevels[key].name === level) {
        return urgencyLevels[key].color;
      }
    }
  };
  return (
    <div
      className="w-full bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-200 cursor-pointer p-2 flex"
      onClick={onClick}
    >
      {/* Left side - Request Image and Urgency Badge */}
      <div className="flex flex-col justify-between w-16 sm:w-18 shrink-0">
        {/* Request Image */}
        <div className="w-16 h-16 sm:w-18 sm:h-18 rounded-xl overflow-hidden bg-gray-100">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={imageAlt}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
              No Image
            </div>
          )}
        </div>

        {/* Urgency Badge */}
        <button
          className={"text-xs rounded-xl px-2 py-0.5 mt-2"}
          style={{ backgroundColor: getBGColorForUrgency(urgencyLevel) }}
          onClick={(e) => {
            e.stopPropagation();
            onUrgencyClick?.(urgencyLevel);
          }}
        >
          {urgencyLevel}
        </button>
      </div>

      {/* Right side - Main Content */}
      <div className="flex-1 flex flex-col ml-4 sm:ml-5 pr-3 sm:pr-4 pt-2">
        {/* Header with Title and Navigation Arrow */}
        <div className="flex justify-between items-start mb-1">
          {/* Main Title */}
          <div className="flex-1 mr-2">
            <h3 className="font-medium text-sm leading-5 text-gray-900 truncate font-inter">
              {title}
            </h3>
          </div>

          {/* Navigation Arrow Button */}
          <button
            className="w-8 h-8 shrink-0 flex items-center justify-center text-indigo-500 bg-transparent rounded-2xl border-none
                       hover:bg-indigo-100 active:bg-indigo-200 
                       disabled:opacity-40 transition-colors duration-150"
            onClick={(e) => {
              e.stopPropagation();
              onNavigateClick?.();
            }}
          >
            <svg className="w-5 h-5 fill-indigo-500" viewBox="0 0 24 24">
              <path d="M9.29 15.88L13.17 12L9.29 8.12C8.9 7.73 8.9 7.1 9.29 6.71C9.68 6.32 10.31 6.32 10.7 6.71L15.29 11.3C15.68 11.69 15.68 12.32 15.29 12.71L10.7 17.3C10.31 17.69 9.68 17.69 9.29 17.3C8.9 16.91 8.9 16.27 9.29 15.88Z" />
            </svg>
          </button>
        </div>

        {/* Location and Time */}
        <div className="mb-2 sm:mb-3">
          <p className="font-light text-xs leading-4 text-gray-600 font-inter">
            {location} • {timeAgo}
          </p>
        </div>

        {/* Category Tag */}
        <button
          className="w-full max-w-64 h-5 px-2 mt-2
                     flex items-center justify-center text-xs leading-4 font-normal text-indigo-500 
                     bg-indigo-50 rounded-xl border-none font-inter
                     hover:bg-indigo-100 active:bg-indigo-200 
                     disabled:opacity-40 transition-colors duration-150"
          onClick={(e) => {
            e.stopPropagation();
            onCategoryClick?.(category);
          }}
        >
          {category}
        </button>
      </div>
    </div>
  );
};

export default RequestCardForHomePage;
