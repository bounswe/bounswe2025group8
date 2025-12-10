import React from "react";
import { useTranslation } from "react-i18next";
import { useTheme } from "../hooks/useTheme";

/**
 * CategoryCard component that displays a category with an image
 * @param {Object} props
 * @param {string} props.title - The title of the category
 * @param {string} props.image - The URL of the image to display
 * @param {Function} props.onClick - Function called when card is clicked
 * @param {string} props.className - Additional CSS classes to apply
 */
const CategoryCard = ({ title, image, onClick, className = "" }) => {
  const { t } = useTranslation();
  const { colors } = useTheme();

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
        w-full sm:w-52 h-[270px] mx-auto
        hover:-translate-y-1
        ${className}`}
      style={{
        backgroundColor: colors.background.elevated,
        boxShadow: `0 4px 6px -1px ${colors.shadow.sm}, 0 2px 4px -1px ${colors.shadow.sm}`,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = `0 20px 25px -5px ${colors.shadow.lg}, 0 10px 10px -5px ${colors.shadow.md}`;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = `0 4px 6px -1px ${colors.shadow.sm}, 0 2px 4px -1px ${colors.shadow.sm}`;
      }}
      onFocus={(e) => {
        e.currentTarget.style.outline = `3px solid ${colors.border.focus}`;
        e.currentTarget.style.outlineOffset = "2px";
      }}
      onBlur={(e) => {
        e.currentTarget.style.outline = "none";
      }}
      aria-label={`${t("viewCategory")} ${title}`}
    >
      {/* Title at top with proper padding and styling */}
      <div className="p-6 pt-8 pb-0 pl-12 h-28 flex items-start justify-start">
        <h6
          className="text-lg font-bold text-left overflow-hidden text-ellipsis
            line-clamp-2 mt-8 mb-4 leading-tight"
          style={{ color: colors.text.primary }}
        >
          {title}
        </h6>
      </div>
      {/* Image below title with proper sizing and rounded corners */}
      <div className="px-12 pb-12 pt-4 flex">
        <div className="w-full h-24 rounded-xl overflow-hidden">
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
