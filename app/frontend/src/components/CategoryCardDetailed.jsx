import React from "react";
import { useNavigate } from "react-router-dom";

/**
 * CategoryCardDetailed component displays a category with an image and request count
 *
 * @param {Object} props
 * @param {string} props.title - The title of the category
 * @param {string} props.imageUrl - The URL of the image to display
 * @param {number} props.requestCount - Number of requests in this category
 * @param {string} props.categoryId - ID used for navigation when card is clicked
 * @param {Function} props.onClick - Optional custom click handler
 * @param {string} props.className - Additional CSS classes to apply
 */
const CategoryCardDetailed = ({
  title,
  imageUrl,
  requestCount = 0,
  categoryId,
  onClick,
  className = "",
}) => {
  const navigate = useNavigate();

  const handleClick = () => {
    if (onClick) {
      onClick(categoryId);
    } else if (categoryId) {
      // Default navigation to category page if no custom handler provided
      navigate(`/categories/${categoryId}`);
    }
  };

  return (
    <div
      onClick={handleClick}
      onKeyDown={(e) => {
        // Handle Enter or Space key press
        if (e.key === "Enter" || e.key === " " || e.key === "Spacebar") {
          e.preventDefault(); // Prevent page scroll on Space
          handleClick();
        }
      }}
      role="button" // Add button role for accessibility
      tabIndex={0} // Make it focusable
      aria-label={`${title} category with ${requestCount} ${
        requestCount === 1 ? "request" : "requests"
      }`}
      className={`flex items-center rounded-2xl cursor-pointer transition-all duration-200 overflow-hidden bg-white p-3 w-full sm:w-96 h-[90px] max-w-full shadow-sm hover:shadow-lg hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 ${className}`}
    >
      {/* Image Container - Left Side */}
      <div className="w-[70px] h-[70px] rounded-xl overflow-hidden border border-gray-200 flex-shrink-0 mr-4 bg-gray-100">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-200">
            <span className="text-sm text-gray-500">No Image</span>
          </div>
        )}
      </div>

      {/* Content Container - Right Side */}
      <div className="flex flex-col justify-center">
        {/* Title */}
        <h3 className="text-base font-bold text-gray-900 mb-1">{title}</h3>

        {/* Request Count */}
        <p className="text-sm text-gray-600 flex items-center">
          {requestCount} {requestCount === 1 ? "request" : "requests"}
        </p>
      </div>
    </div>
  );
};

export default CategoryCardDetailed;
