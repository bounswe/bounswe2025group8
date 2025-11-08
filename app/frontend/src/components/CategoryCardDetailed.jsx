import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../hooks/useTheme";

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
  const { colors } = useTheme();
  const [isHovered, setIsHovered] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

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
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onFocus={() => setIsFocused(true)}
      onBlur={() => setIsFocused(false)}
      role="button" // Add button role for accessibility
      tabIndex={0} // Make it focusable
      aria-label={`${title} category with ${requestCount} ${
        requestCount === 1 ? "request" : "requests"
      }`}
      style={{
        display: "flex",
        alignItems: "center",
        borderRadius: "16px",
        cursor: "pointer",
        transition: "all 0.2s ease",
        overflow: "hidden",
        backgroundColor: colors.background.elevated,
        padding: "12px",
        width: "100%",
        maxWidth: "24rem",
        height: "5rem",
        boxShadow: isHovered ? colors.shadow.lg : colors.shadow.sm,
        transform: isHovered ? "translateY(-2px)" : "translateY(0)",
        outline: isFocused ? `3px solid ${colors.border.focus}` : "none",
        outlineOffset: "2px",
      }}
      className={className}
    >
      {/* Image Container - Left Side */}
      <div
        style={{
          width: "3rem",
          height: "3rem",
          borderRadius: "12px",
          overflow: "hidden",
          border: `1px solid ${colors.border.primary}`,
          flexShrink: 0,
          marginRight: "12px",
          backgroundColor: colors.background.secondary,
        }}
      >
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={title}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
            }}
          />
        ) : (
          <div
            style={{
              width: "100%",
              height: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: colors.background.tertiary,
            }}
          >
            <span style={{ fontSize: "0.875rem", color: colors.text.tertiary }}>
              No Image
            </span>
          </div>
        )}
      </div>

      {/* Content Container - Right Side */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
        }}
      >
        {/* Title */}
        <h3
          style={{
            fontSize: "0.875rem",
            fontWeight: "bold",
            color: colors.text.primary,
            marginBottom: "4px",
          }}
        >
          {title}
        </h3>

        {/* Request Count */}
        <p
          style={{
            fontSize: "0.75rem",
            color: colors.text.secondary,
            display: "flex",
            alignItems: "center",
          }}
        >
          {requestCount} {requestCount === 1 ? "request" : "requests"}
        </p>
      </div>
    </div>
  );
};

export default CategoryCardDetailed;
