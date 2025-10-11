import React from "react";

/**
 * RequestCardForHomePage component that displays a request card with image, title, location/time info,
 * category tag, urgency badge, and navigation arrow.
 *
 * @param {Object} props
 * @param {string} props.title - The main title of the request
 * @param {string} props.location - Location text (e.g., "2 km away")
 * @param {string} props.timeAgo - Time posted text (e.g., "3 hours ago")
 * @param {string} props.category - Category name (e.g., "Healthcare")
 * @param {string} props.urgencyLevel - Urgency level (e.g., "High Urgency")
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
  urgencyLevel = "High Urgency",
  imageUrl,
  imageAlt = "Request image",
  onClick,
  onCategoryClick,
  onUrgencyClick,
  onNavigateClick,
}) => {
  return (
    <div
      className="relative w-[407px] h-[122px] bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-200 cursor-pointer"
      onClick={onClick}
    >
      {/* Request Image */}
      <div className="absolute top-2 left-2 w-[72px] h-[72px] rounded-xl overflow-hidden bg-gray-100">
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

      {/* Main Title */}
      <div className="absolute top-[13px] left-[92px] w-[191px] h-[22px]">
        <h3 className="font-medium text-sm leading-[22px] text-gray-900 truncate font-inter">
          {title}
        </h3>
      </div>

      {/* Location and Time */}
      <div className="absolute top-[34px] left-[92px]">
        <p className="font-light text-[11px] leading-[18px] text-gray-600 font-inter">
          {location} • {timeAgo}
        </p>
      </div>

      {/* Category Tag */}
      <button
        className="absolute top-[61px] left-[92px] w-[264px] h-[19px] px-2 
                   flex items-center justify-center text-[10px] leading-4 font-normal text-indigo-500 
                   bg-indigo-50 rounded-md border-none font-inter
                   hover:bg-indigo-100 active:bg-indigo-200 
                   disabled:opacity-40 transition-colors duration-150"
        onClick={(e) => {
          e.stopPropagation();
          onCategoryClick?.(category);
        }}
      >
        {category}
      </button>

      {/* Navigation Arrow Button */}
      <button
        className="absolute top-[18px] right-[7px] w-8 h-8 
                   flex items-center justify-center text-indigo-500 bg-transparent rounded-2xl border-none
                   hover:bg-indigo-100 active:bg-indigo-200 
                   disabled:opacity-40 transition-colors duration-150"
        onClick={(e) => {
          e.stopPropagation();
          onNavigateClick?.();
        }}
      >
        <svg className="w-[19px] h-[19px] fill-indigo-500" viewBox="0 0 24 24">
          <path d="M9.29 15.88L13.17 12L9.29 8.12C8.9 7.73 8.9 7.1 9.29 6.71C9.68 6.32 10.31 6.32 10.7 6.71L15.29 11.3C15.68 11.69 15.68 12.32 15.29 12.71L10.7 17.3C10.31 17.69 9.68 17.69 9.29 17.3C8.9 16.91 8.9 16.27 9.29 15.88Z" />
        </svg>
      </button>

      {/* Urgency Badge */}
      <button
        className="absolute bottom-2 left-2 w-[97px] h-[19px] px-2 
                   flex items-center justify-center text-[10px] leading-4 font-normal text-white 
                   bg-red-600 rounded-md border-none font-inter
                   hover:bg-red-700 active:bg-red-800 
                   disabled:opacity-40 transition-colors duration-150"
        onClick={(e) => {
          e.stopPropagation();
          onUrgencyClick?.(urgencyLevel);
        }}
      >
        {urgencyLevel}
      </button>
    </div>
  );
};

export default RequestCardForHomePage;
