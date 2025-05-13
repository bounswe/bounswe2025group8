import React from "react";
import {
  Box,
  Typography,
  Avatar,
  Card,
  IconButton,
  styled,
  Chip,
} from "@mui/material";
import {
  ChevronRight as ChevronRightIcon,
  Star as StarIcon,
  CheckCircle as CheckCircleIcon,
  Phone as PhoneIcon,
} from "@mui/icons-material";

// Card container
const VolunteerCardContainer = styled(Card)(({ selected }) => ({
  margin: "8px 16px",
  padding: "16px",
  display: "flex",
  alignItems: "center",
  borderRadius: "16px",
  border: "1px solid",
  borderColor: selected ? "#636AE8" : "#F3F4F6",
  boxShadow: "none",
  cursor: "pointer",
  backgroundColor: "#FFFFFF",
  width: "auto",
  flexShrink: 0,
  position: "relative",
}));

// Avatar
const VolunteerAvatar = styled(Avatar)({
  width: "56px",
  height: "56px",
  borderRadius: "28px",
  flexShrink: 0,
});

// Volunteer info container
const VolunteerInfo = styled(Box)({
  marginLeft: "16px",
  flex: 1,
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
  minWidth: 0, // Allows text to be truncated if necessary
});

// Volunteer name
const VolunteerName = styled(Typography)({
  fontSize: "16px",
  fontWeight: 500,
  fontFamily: "Inter",
  color: "#171A1F",
  whiteSpace: "nowrap",
  overflow: "hidden",
  textOverflow: "ellipsis",
});

// Rating container
const RatingContainer = styled(Box)({
  display: "flex",
  alignItems: "center",
  marginTop: "4px",
});

// Rating text
const RatingText = styled(Typography)({
  fontSize: "14px",
  fontFamily: "Inter",
  color: "#171A1F",
  display: "flex",
  alignItems: "center",
  fontWeight: "400",
});

// Star icon
const StyledStarIcon = styled(StarIcon)({
  color: "#FFC107",
  fontSize: "16px",
  marginRight: "2px",
});

// Phone container
const PhoneContainer = styled(Box)({
  display: "flex",
  alignItems: "center",
  marginTop: "4px",
});

// Phone number text
const PhoneText = styled(Typography)({
  fontSize: "14px",
  fontFamily: "Inter",
  color: "#636AE8",
  display: "flex",
  alignItems: "center",
  fontWeight: "400",
});

// Phone icon
const StyledPhoneIcon = styled(PhoneIcon)({
  color: "#636AE8",
  fontSize: "16px",
  marginRight: "4px",
});

// Selection button
const SelectionButton = styled(IconButton)(({ selected }) => ({
  color: selected ? "#636AE8" : "#E5E7EB",
  backgroundColor: selected ? "#EEF0FF" : "#FFFFFF",
  marginLeft: "8px",
  flexShrink: 0,
}));

/**
 * SelectVolunteerCard component for displaying a volunteer in the selection list
 * @param {Object} props
 * @param {Object} props.volunteer - Volunteer data
 * @param {boolean} props.selected - Whether this volunteer is selected
 * @param {Function} props.onSelect - Callback function when volunteer is selected
 */
const SelectVolunteerCard = ({ volunteer, selected = false, onSelect }) => {
  const handleClick = () => {
    if (onSelect) onSelect(volunteer);
  };
  return (
    <VolunteerCardContainer selected={selected} onClick={handleClick}>
      <VolunteerAvatar src={volunteer.avatar} alt={volunteer.name} />

      <VolunteerInfo>
        <VolunteerName>{volunteer.name}</VolunteerName>
        <RatingContainer>
          <StyledStarIcon />
          <RatingText>
            {volunteer.rating} ({volunteer.reviewCount} reviews)
          </RatingText>
        </RatingContainer>
        <PhoneContainer>
          <StyledPhoneIcon />
          <PhoneText>{volunteer.phone}</PhoneText>
        </PhoneContainer>
      </VolunteerInfo>

      {selected && (
        <Box
          sx={{
            position: "absolute",
            top: 8,
            right: 8,
            bgcolor: "#EEF0FF",
            borderRadius: "50%",
            p: 0.5,
          }}
        >
          <CheckCircleIcon sx={{ color: "#636AE8", fontSize: 20 }} />
        </Box>
      )}
    </VolunteerCardContainer>
  );
};

export default SelectVolunteerCard;
