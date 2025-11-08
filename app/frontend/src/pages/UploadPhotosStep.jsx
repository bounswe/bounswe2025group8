import React from "react";
import ConstructionIcon from "@mui/icons-material/Construction";
import { useTheme } from "../hooks/useTheme";

const UploadPhotosStep = () => {
  const { colors } = useTheme();

  return (
    <div>
      {/* Information box */}
      <div
        className="p-8 text-center border-2 border-dashed rounded-lg mb-8"
        style={{
          borderColor: colors.border.secondary,
          backgroundColor: colors.background.secondary,
        }}
      >
        <ConstructionIcon
          sx={{ fontSize: 60, color: colors.text.tertiary, mb: 2 }}
        />

        <h3
          className="text-lg font-medium mb-2"
          style={{ color: colors.text.primary }}
        >
          Feature Not Implemented
        </h3>

        <p className="text-base mb-4" style={{ color: colors.text.secondary }}>
          We're working on implementing the photo upload functionality.
        </p>

        <p className="text-sm" style={{ color: colors.text.secondary }}>
          Please proceed to the next step to continue creating your request.
        </p>
      </div>

      {/* Instructions */}
      <div className="mt-8">
        <h4
          className="text-sm font-bold mb-2"
          style={{ color: colors.text.primary }}
        >
          Note:
        </h4>
        <p className="text-sm" style={{ color: colors.text.secondary }}>
          Your request can still be submitted without photos. You can add photos
          to your request later when this feature becomes available.
        </p>
      </div>
    </div>
  );
};

export default UploadPhotosStep;
