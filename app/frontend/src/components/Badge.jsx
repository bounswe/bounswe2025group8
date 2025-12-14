import React from "react";
import { Box, Typography, Tooltip, CircularProgress } from "@mui/material";
import { Icon } from "@mui/material";
import { formatDate } from "../utils/dateUtils";
import { useTranslation } from "react-i18next";
import { useTheme } from "../hooks/useTheme";

const Badge = ({ badge }) => {
  const { colors } = useTheme();

  const { t } = useTranslation();

  // Handle both old/mock format and new API format
  // API format: { badge_type_display, name, description, icon_url, earned_at, badge_type }
  // UserBadge wrapper: { earned_at, badge: { ... } }

  // If badge is wrapped in a UserBadge object (from user-badges API)
  const actualBadge = badge.badge || badge;
  const isEarned = badge.earned || !!badge.earned_at;
  const earnedDate = badge.earnedDate || badge.earned_at;

  // Get translation key from badge_type
  const badgeTypeKey = actualBadge.badge_type ? actualBadge.badge_type.toLowerCase() : null;

  // Try to get translated title and description
  const translatedTitle = badgeTypeKey ? t(`profile.badges.names.${badgeTypeKey}`) : null;
  const translatedDesc = badgeTypeKey ? t(`profile.badges.descriptions.${badgeTypeKey}`) : null;

  // Fallback to existing properties if translation returns the key or is missing
  // i18next returns the key if translation is missing usually, but we check if it equals key
  const title = (translatedTitle && translatedTitle !== `profile.badges.names.${badgeTypeKey}`)
    ? translatedTitle
    : (actualBadge.title || actualBadge.badge_type_display || actualBadge.name);

  const description = (translatedDesc && translatedDesc !== `profile.badges.descriptions.${badgeTypeKey}`)
    ? translatedDesc
    : actualBadge.description;

  const image = actualBadge.image || actualBadge.icon_url;
  // Use color from prop if available, otherwise generate one or use default
  const color = actualBadge.color || colors.brand.primary;

  // Determine opacity based on earned status
  const opacity = isEarned ? 1 : 0.5;

  return (
    <Tooltip
      title={
        <Box
          sx={{
            backgroundColor: colors.background.elevated,
            color: colors.text.primary,
          }}
        >
          <Typography variant="subtitle2" sx={{ color: colors.text.primary }}>
            {title}
          </Typography>
          <Typography variant="body2" sx={{ color: colors.text.secondary }}>
            {description}
          </Typography>
          {isEarned && earnedDate && (
            <Typography variant="caption" sx={{ color: colors.text.tertiary, display: 'block', mt: 1 }}>
              Earned on {formatDate(earnedDate, "MMM d, yyyy")}
            </Typography>
          )}
        </Box>
      }
      arrow
      componentsProps={{
        tooltip: {
          sx: {
            backgroundColor: colors.background.elevated,
            border: `1px solid ${colors.border.primary}`,
            boxShadow: `0 4px 6px ${colors.shadow.md}`,
          },
        },
        arrow: {
          sx: {
            color: colors.background.elevated,
          },
        },
      }}
    >
      <Box
        sx={{
          position: "relative",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          width: 90,
          height: 110,
          opacity,
          transition: "transform 0.2s, opacity 0.2s",
          cursor: "pointer",
          "&:hover": {
            transform: "scale(1.05)",
            opacity: 1,
          },
        }}
        tabIndex={0}
        role="img"
        aria-label={`${title}${isEarned ? ", earned" : ", not yet earned"}`}
      >
        <Box
          sx={{
            width: 64,
            height: 64,
            borderRadius: "50%",
            bgcolor: color,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: isEarned ? "0 3px 8px rgba(0,0,0,0.2)" : "none",
            mb: 1,
            position: "relative",
            overflow: "hidden",
            border: isEarned ? `2px solid ${colors.brand.secondary}` : `2px solid ${colors.border.secondary}`,
          }}
        >
          {/* Display either image or icon based on what's provided */}
          {image ? (
            <Box
              component="img"
              src={image}
              alt={title}
              sx={{
                width: 40,
                height: 40,
                objectFit: "contain",
              }}
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.parentNode.children[1].style.display = 'block'; // Show fallback icon
              }}
            />
          ) : null}

          {/* Fallback icon if no image or image fails */}
          <Icon
            sx={{
              color: "white",
              fontSize: 32,
              display: image ? 'none' : 'block'
            }}
            aria-hidden
          >
            emoji_events
          </Icon>
        </Box>
        <Typography
          variant="caption"
          align="center"
          sx={{
            width: "100%",
            fontWeight: isEarned ? "bold" : "normal",
            color: colors.text.primary,
            lineHeight: 1.2,
            fontSize: '0.75rem',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {title}
        </Typography>
      </Box>
    </Tooltip>
  );
};

export default Badge;
