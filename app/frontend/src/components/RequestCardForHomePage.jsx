import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { urgencyLevels } from "../constants/urgency_level";
import { useTheme } from "../hooks/useTheme";

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
  const { t } = useTranslation();
  const { colors } = useTheme();
  const [isHovered, setIsHovered] = useState(false);
  const [categoryHovered, setCategoryHovered] = useState(false);
  const [navHovered, setNavHovered] = useState(false);
  const [navFocused, setNavFocused] = useState(false);
  const [categoryFocused, setCategoryFocused] = useState(false);

  const getBGColorForUrgency = (level) => {
    for (const key in urgencyLevels) {
      if (urgencyLevels[key].name === level) {
        return urgencyLevels[key].color;
      }
    }
  };
  return (
    <div
      style={{
        width: "100%",
        backgroundColor: colors.background.elevated,
        borderRadius: "12px",
        border: `1px solid ${colors.border.primary}`,
        boxShadow: isHovered ? colors.shadow.md : colors.shadow.sm,
        transition: "box-shadow 0.2s ease",
        cursor: "pointer",
        padding: "8px",
        display: "flex",
      }}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick?.();
        }
      }}
      onFocus={(e) => {
        e.currentTarget.style.outline = `3px solid ${colors.border.focus}`;
        e.currentTarget.style.outlineOffset = "2px";
      }}
      onBlur={(e) => {
        e.currentTarget.style.outline = "none";
      }}
      aria-label={t("requestCardForHomePage.viewRequest", { title })}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Left side - Request Image and Urgency Badge */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          width: "64px",
          flexShrink: 0,
        }}
      >
        {/* Request Image */}
        <div
          style={{
            width: "64px",
            height: "64px",
            borderRadius: "12px",
            overflow: "hidden",
            backgroundColor: colors.background.secondary,
          }}
        >
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={imageAlt}
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          ) : (
            <div
              style={{
                width: "100%",
                height: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: colors.text.tertiary,
                fontSize: "0.75rem",
              }}
            >
              {t("requestCardForHomePage.noImage")}
            </div>
          )}
        </div>

        {/* Urgency Badge */}
        <button
          style={{
            fontSize: "0.75rem",
            borderRadius: "12px",
            padding: "2px 8px",
            marginTop: "8px",
            backgroundColor: getBGColorForUrgency(urgencyLevel),
            border: "none",
            cursor: "pointer",
            color: colors.text.inverse,
          }}
          onClick={(e) => {
            e.stopPropagation();
            onUrgencyClick?.(urgencyLevel);
          }}
        >
          {urgencyLevel}
        </button>
      </div>

      {/* Right side - Main Content */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          marginLeft: "16px",
          paddingRight: "12px",
          paddingTop: "8px",
        }}
      >
        {/* Header with Title and Navigation Arrow */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "start",
            marginBottom: "4px",
          }}
        >
          {/* Main Title */}
          <div style={{ flex: 1, marginRight: "8px" }}>
            <h3
              style={{
                fontWeight: 500,
                fontSize: "0.875rem",
                lineHeight: "1.25rem",
                color: colors.text.primary,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
                fontFamily: "Inter, sans-serif",
              }}
            >
              {title}
            </h3>
          </div>

          {/* Navigation Arrow Button */}
          <button
            style={{
              width: "32px",
              height: "32px",
              flexShrink: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: colors.brand.primary,
              backgroundColor: navHovered
                ? colors.interactive.hover
                : "transparent",
              borderRadius: "16px",
              border: "none",
              cursor: "pointer",
              transition: "background-color 0.15s ease",
              outline: navFocused ? `3px solid ${colors.border.focus}` : "none",
              outlineOffset: "2px",
            }}
            onClick={(e) => {
              e.stopPropagation();
              onNavigateClick?.();
            }}
            onMouseEnter={() => setNavHovered(true)}
            onMouseLeave={() => setNavHovered(false)}
            onFocus={() => setNavFocused(true)}
            onBlur={() => setNavFocused(false)}
            aria-label={t("requestCardForHomePage.viewRequestDetails")}
          >
            <svg
              style={{
                width: "20px",
                height: "20px",
                fill: colors.brand.primary,
              }}
              viewBox="0 0 24 24"
            >
              <path d="M9.29 15.88L13.17 12L9.29 8.12C8.9 7.73 8.9 7.1 9.29 6.71C9.68 6.32 10.31 6.32 10.7 6.71L15.29 11.3C15.68 11.69 15.68 12.32 15.29 12.71L10.7 17.3C10.31 17.69 9.68 17.69 9.29 17.3C8.9 16.91 8.9 16.27 9.29 15.88Z" />
            </svg>
          </button>
        </div>

        {/* Location and Time */}
        <div style={{ marginBottom: "8px" }}>
          <p
            style={{
              fontWeight: 300,
              fontSize: "0.75rem",
              lineHeight: "1rem",
              color: colors.text.secondary,
              fontFamily: "Inter, sans-serif",
            }}
          >
            {location} • {timeAgo}
          </p>
        </div>

        {/* Category Tag */}
        <button
          style={{
            width: "100%",
            maxWidth: "256px",
            height: "20px",
            padding: "0 8px",
            marginTop: "8px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "0.75rem",
            lineHeight: "1rem",
            fontWeight: 400,
            color: colors.brand.primary,
            backgroundColor: categoryHovered
              ? colors.interactive.hover
              : colors.background.secondary,
            borderRadius: "12px",
            border: "none",
            fontFamily: "Inter, sans-serif",
            cursor: "pointer",
            transition: "background-color 0.15s ease",
            outline: categoryFocused
              ? `3px solid ${colors.border.focus}`
              : "none",
            outlineOffset: "2px",
          }}
          onClick={(e) => {
            e.stopPropagation();
            onCategoryClick?.(category);
          }}
          onMouseEnter={() => setCategoryHovered(true)}
          onMouseLeave={() => setCategoryHovered(false)}
          onFocus={() => setCategoryFocused(true)}
          onBlur={() => setCategoryFocused(false)}
          aria-label={t("requestCardForHomePage.filterByCategory", {
            category,
          })}
        >
          {category}
        </button>
      </div>
    </div>
  );
};

export default RequestCardForHomePage;
