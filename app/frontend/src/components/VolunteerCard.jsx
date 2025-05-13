// VolunteerCard.jsx - Simplified volunteer card component matching provided CSS specs
import React from "react";
import { Typography, Avatar, Box, styled, Card } from "@mui/material";
import { Star as StarIcon } from "@mui/icons-material";
import { useDispatch } from "react-redux";
import { setSelectedVolunteer } from "../store/slices/taskDetailSlice";

// Volunteer card container with flex layout
const VolunteerContainer = styled(Card)(({ theme }) => ({
  width: "100%",
  height: "96px",
  background: "#FFFFFFFF" /* white */,
  borderRadius: "16px",
  borderWidth: "1px",
  borderColor: "#F3F4F6FF" /* neutral-200 */,
  borderStyle: "solid",
  display: "flex",
  alignItems: "center",
  padding: "16px",
  boxSizing: "border-box",
  margin: "8px 0",
}));

const VolunteerAvatar = styled(Avatar)(({ theme }) => ({
  width: "64px",
  height: "64px",
  background: "#CED0F8FF" /* primary-200 */,
  borderRadius: "32px",
  flexShrink: 0,
}));

const VolunteerInfo = styled(Box)(({ theme }) => ({
  marginLeft: "16px",
  flex: 1,
}));

const VolunteerName = styled(Typography)(({ theme }) => ({
  fontFamily: "Inter",
  fontSize: "18px",
  lineHeight: "28px",
  fontWeight: 500,
  color: "#171A1FFF" /* neutral-900 */,
}));

const RatingContainer = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  marginTop: "4px",
}));

const Rating = styled(Typography)(({ theme }) => ({
  fontFamily: "Inter",
  fontSize: "14px",
  lineHeight: "22px",
  fontWeight: 300,
  color: "#171A1FFF" /* neutral-900 */,
  marginLeft: "4px",
}));

// This component exactly matches the CSS specs provided
const VolunteerCard = ({ volunteer, onClick }) => {
  const dispatch = useDispatch();

  const handleClick = () => {
    if (onClick) onClick(volunteer);
    dispatch(setSelectedVolunteer(volunteer));
  };

  return (
    <VolunteerContainer onClick={handleClick}>
      <VolunteerAvatar alt={volunteer.name} src={volunteer.avatar} />

      <VolunteerInfo>
        <VolunteerName>{volunteer.name}</VolunteerName>
        <RatingContainer>
          <StarIcon
            sx={{ width: 16, height: 16, color: "#636AE8FF" /* primary-500 */ }}
          />
          <Rating>
            {volunteer.rating} ({volunteer.reviewCount} reviews)
          </Rating>
        </RatingContainer>
      </VolunteerInfo>
    </VolunteerContainer>
  );
};

export default VolunteerCard;
