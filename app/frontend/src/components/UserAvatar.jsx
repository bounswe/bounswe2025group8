import { Box } from "@mui/material";
import { getInitials, stringToColor } from "../utils/utils";

/**
 * UserAvatar component displays a user's avatar or their initials in a colored circle as fallback
 *
 * @param {Object} props - Component props
 * @param {Object} props.user - User object containing name and optional avatar URL
 * @param {number} props.size - Size of the avatar in pixels (default 40)
 * @param {string} props.marginRight - Right margin of avatar (default 2 units)
 * @returns {JSX.Element} UserAvatar component
 */
const UserAvatar = ({ user, size = 40, marginRight = 2 }) => {
  if (user?.avatar) {
    // If user has an avatar URL, use it with error handling
    return (
      <Box
        component="img"
        src={user.avatar}
        alt={`${user?.name || "User"}'s avatar`}
        sx={{
          width: size,
          height: size,
          borderRadius: "50%",
          mr: marginRight,
          objectFit: "cover",
        }}
        onError={(e) => {
          // If image fails to load, switch to initials
          e.target.style.display = "none";
          e.target.parentElement.innerHTML = `<div style="
            width: ${size}px; 
            height: ${size}px; 
            border-radius: 50%; 
            margin-right: ${marginRight * 8}px; 
            background-color: ${stringToColor(user?.name || "User")};
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-weight: bold;
          ">${getInitials(user?.name || "User")}</div>`;
        }}
      />
    );
  }

  // If no avatar, use initials
  return (
    <Box
      sx={{
        width: size,
        height: size,
        borderRadius: "50%",
        mr: marginRight,
        bgcolor: stringToColor(user?.name || "User"),
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "white",
        fontWeight: "bold",
        fontSize: size * 0.4, // Scale font size proportionally to avatar size
      }}
    >
      {getInitials(user?.name || "User")}
    </Box>
  );
};

export default UserAvatar;
