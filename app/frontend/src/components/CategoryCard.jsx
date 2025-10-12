import React from "react";

/**
 * CategoryCard component that displays a category with an image
 * @param {Object} props
 * @param {string} props.title - The title of the category
 * @param {string} props.image - The URL of the image to display
 * @param {Function} props.onClick - Function called when card is clicked
 * @param {string} props.className - Additional CSS classes to apply
 */
const CategoryCard = ({ title, image, onClick, className = "" }) => {
  return (
    <div
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          onClick();
          e.preventDefault(); // Prevent page scroll on space
        }
      }}
      className={`flex flex-col rounded-xl cursor-pointer transition-all duration-300 ease-out overflow-hidden
        w-full sm:w-52 h-[270px] bg-white mx-auto shadow-md
        hover:-translate-y-1 hover:shadow-2xl
        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
        ${className}`}
    >
      {/* Title at top with proper padding and styling */}
      <div className="p-6 pt-8 pb-0 pl-12 h-auto flex items-start justify-start">
        <h6
          className="text-lg font-bold text-left overflow-hidden text-ellipsis 
            line-clamp-2 mt-8 mb-4 leading-tight"
        >
          {title}
        </h6>
      </div>
      {/* Image below title with proper sizing and rounded corners */}
      <div className="px-12 pb-12 pt-4 flex-grow flex">
        <div className="w-full h-full rounded-xl overflow-hidden flex-grow">
          <img
            src={image}
            alt={`${title}`}
            className="h-full w-full object-cover"
          />
        </div>
      </div>
    </div>
  );
};

export default CategoryCard;
