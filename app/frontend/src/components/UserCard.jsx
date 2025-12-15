import React from "react";
import { useTranslation } from "react-i18next";
import { Avatar, Rating } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../hooks/useTheme";

/**
 * UserCard component for displaying user search results
 * @param {Object} props
 * @param {Object} props.user - User object with id, name, surname, username, profile_photo, rating
 * @param {Function} props.onClick - Optional click handler (defaults to navigating to profile)
 */
const UserCard = ({ user, onClick }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { colors } = useTheme();

  const handleClick = () => {
    if (onClick) {
      onClick(user);
    } else {
      navigate(`/profile/${user.id}`);
    }
  };

  const getInitials = () => {
    const name = user?.name || "";
    const surname = user?.surname || "";

    if (name && surname) {
      return `${name.charAt(0)}${surname.charAt(0)}`.toUpperCase();
    } else if (name) {
      return name.charAt(0).toUpperCase();
    } else if (user?.username) {
      return user.username.charAt(0).toUpperCase();
    }
    return "U";
  };

  const fullName =
    [user.name, user.surname].filter(Boolean).join(" ") ||
    user.username ||
    t("userCard.unknownUser");

  return (
    <div
      onClick={handleClick}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          handleClick();
        }
      }}
      role="button"
      tabIndex={0}
      aria-label={t("userCard.viewProfileOf", { name: fullName })}
      style={{
        display: "flex",
        alignItems: "center",
        gap: "16px",
        padding: "16px",
        backgroundColor: colors.background.elevated,
        borderRadius: "12px",
        border: `1px solid ${colors.border.primary}`,
        cursor: "pointer",
        transition: "all 0.2s ease-in-out",
      }}
      onMouseOver={(e) => {
        e.currentTarget.style.borderColor = colors.brand.primary;
        e.currentTarget.style.boxShadow = `0 4px 12px ${colors.brand.primary}20`;
      }}
      onMouseOut={(e) => {
        e.currentTarget.style.borderColor = colors.border.primary;
        e.currentTarget.style.boxShadow = "none";
      }}
      onFocus={(e) => {
        e.currentTarget.style.outline = `3px solid ${colors.border.focus}`;
        e.currentTarget.style.outlineOffset = "2px";
      }}
      onBlur={(e) => {
        e.currentTarget.style.outline = "none";
      }}
    >
      {/* Avatar */}
      {user.profile_photo || user.profilePhoto || user.profilePicture ? (
        <Avatar
          src={user.profile_photo || user.profilePhoto || user.profilePicture}
          alt={fullName}
          sx={{ width: 56, height: 56 }}
        />
      ) : (
        <Avatar
          sx={{
            width: 56,
            height: 56,
            backgroundColor: colors.brand.primary,
            fontSize: "1.25rem",
            fontWeight: "bold",
          }}
        >
          {getInitials()}
        </Avatar>
      )}

      {/* User Info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <h3
          style={{
            margin: 0,
            fontSize: "1rem",
            fontWeight: 600,
            color: colors.text.primary,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {fullName}
        </h3>
        {user.username && (
          <p
            style={{
              margin: "4px 0 0 0",
              fontSize: "0.875rem",
              color: colors.text.secondary,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            @{user.username}
          </p>
        )}
        {/* Rating */}
        {user.rating !== undefined && user.rating !== null && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              marginTop: "8px",
            }}
          >
            <Rating
              value={user.rating || 0}
              precision={0.1}
              readOnly
              size="small"
              sx={{
                "& .MuiRating-iconFilled": {
                  color: colors.semantic?.warning || "#FFC107",
                },
                "& .MuiRating-iconEmpty": {
                  color: colors.border.secondary || colors.border.primary,
                },
              }}
            />
            <span
              style={{
                fontSize: "0.75rem",
                color: colors.text.secondary,
              }}
            >
              {(Math.round((user.rating || 0) * 10) / 10).toFixed(1)}
            </span>
          </div>
        )}
      </div>

      {/* Arrow indicator */}
      <div
        style={{
          color: colors.text.tertiary,
          fontSize: "1.25rem",
        }}
      >
        →
      </div>
    </div>
  );
};

export default UserCard;
