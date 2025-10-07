import React from "react";
import ConstructionIcon from "@mui/icons-material/Construction";

const UploadPhotosStep = () => {
  return (
    <div>
      {/* Information box */}
      <div className="p-8 text-center border-2 border-dashed border-gray-300 rounded-lg bg-gray-50 mb-8">
        <ConstructionIcon sx={{ fontSize: 60, color: "#9e9e9e", mb: 2 }} />

        <h3 className="text-lg font-medium mb-2">Feature Not Implemented</h3>

        <p className="text-base text-gray-600 mb-4">
          We're working on implementing the photo upload functionality.
        </p>

        <p className="text-sm text-gray-600">
          Please proceed to the next step to continue creating your request.
        </p>
      </div>

      {/* Instructions */}
      <div className="mt-8">
        <h4 className="text-sm font-bold mb-2">Note:</h4>
        <p className="text-sm text-gray-600">
          Your request can still be submitted without photos. You can add photos
          to your request later when this feature becomes available.
        </p>
      </div>
    </div>
  );
};

export default UploadPhotosStep;
