import React, { useEffect, useMemo, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import AddAPhotoIcon from "@mui/icons-material/AddAPhoto";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import { removePhoto, uploadPhotos as uploadPhotosThunk } from "../features/request/store/createRequestSlice";

const MAX_PHOTOS = 4;
const MAX_SIZE_MB = 10; // keep in sync with backend limit

const UploadPhotosStep = () => {
  const dispatch = useDispatch();
  const fileInputRef = useRef(null);
  const { uploadedPhotos, loading } = useSelector(
    (state) => state.createRequest
  );

  const [localError, setLocalError] = useState("");

  const remainingSlots = useMemo(
    () => Math.max(MAX_PHOTOS - uploadedPhotos.length, 0),
    [uploadedPhotos.length]
  );

  useEffect(() => {
    if (uploadedPhotos.length < MAX_PHOTOS) {
      setLocalError((prev) => {
        if (!prev) return prev;
        if (prev.includes("Only the first") || prev.includes("You can upload up to")) {
          return "";
        }
        return prev;
      });
    }
  }, [uploadedPhotos.length]);

  const handleFiles = (filesList) => {
    const files = Array.from(filesList ?? []);

    if (!files.length) {
      return;
    }

    const availableSlots = Math.max(MAX_PHOTOS - uploadedPhotos.length, 0);

    if (availableSlots === 0) {
      setLocalError(`You can upload up to ${MAX_PHOTOS} photos.`);
      return;
    }

    const imageFiles = files.filter((file) => file.type.startsWith("image/"));

    const invalidTypeCount = files.length - imageFiles.length;
    const sizeValidImages = imageFiles.filter((file) => file.size <= MAX_SIZE_MB * 1024 * 1024);
    const oversizedCount = imageFiles.length - sizeValidImages.length;

    const filesToUpload = sizeValidImages.slice(0, availableSlots);
    const capacityTruncated = sizeValidImages.length > availableSlots;

    // Decide on a single, accurate message (do not overwrite with a later generic one)
    let message = "";
    if (availableSlots === 0) {
      message = `You can upload up to ${MAX_PHOTOS} photos.`;
    } else if (invalidTypeCount > 0) {
      message = "Only image files are supported.";
    } else if (oversizedCount > 0) {
      message = `Some files exceed ${MAX_SIZE_MB}MB and were skipped.`;
    } else if (capacityTruncated) {
      message = `Only the first ${availableSlots} image${availableSlots === 1 ? "" : "s"} were added.`;
    }

    setLocalError(message);

    if (!filesToUpload.length) {
      return;
    }

    dispatch(uploadPhotosThunk(filesToUpload));
  };

  const handleFileChange = (event) => {
    handleFiles(event.target.files);
    event.target.value = "";
  };

  const handleDrop = (event) => {
    event.preventDefault();
    handleFiles(event.dataTransfer.files);
  };

  const handleDragOver = (event) => {
    event.preventDefault();
  };

  const handleRemovePhoto = (photoId) => {
    const photo = uploadedPhotos.find((item) => item.id === photoId);
    if (photo?.url) {
      URL.revokeObjectURL(photo.url);
    }
    dispatch(removePhoto(photoId));
  };

  const triggerFileDialog = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const latestPhotosRef = useRef(uploadedPhotos);

  useEffect(() => {
    latestPhotosRef.current = uploadedPhotos;
  }, [uploadedPhotos]);

  useEffect(() => {
    return () => {
      latestPhotosRef.current.forEach((photo) => {
        if (photo?.url) {
          URL.revokeObjectURL(photo.url);
        }
      });
    };
  }, []);

  return (
    <div className="space-y-6">
      <div
        className="relative flex flex-col items-center justify-center gap-4 rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 p-8 text-center transition hover:border-blue-400 hover:bg-blue-50"
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        role="button"
        aria-label="Upload photos by dragging and dropping or selecting files"
      >
        <CloudUploadIcon sx={{ fontSize: 52, color: "#2563eb" }} />
        <div>
          <h3 className="text-lg font-semibold text-gray-800">
            Drag & drop photos here
          </h3>
          <p className="text-sm text-gray-600">
            Upload up to {MAX_PHOTOS} images to showcase your request better.
          </p>
        </div>

        <button
          type="button"
          className="flex items-center gap-2 rounded-full bg-blue-600 px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          onClick={triggerFileDialog}
          disabled={remainingSlots === 0 || loading}
        >
          <AddAPhotoIcon fontSize="small" />
          {remainingSlots === 0 ? "Maximum reached" : "Select photos"}
        </button>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={handleFileChange}
        />

        <p className="text-xs text-gray-500">
          {remainingSlots === 0
            ? "You cannot add more photos."
            : `You can add ${remainingSlots} more photo${remainingSlots === 1 ? "" : "s"}.`}
        </p>
      </div>

      {localError ? (
        <div className="flex items-start gap-2 rounded-lg border border-red-100 bg-red-50 p-3 text-sm text-red-700">
          <ErrorOutlineIcon fontSize="small" />
          <span>{localError}</span>
        </div>
      ) : null}

      {uploadedPhotos.length > 0 ? (
        <div>
          <h4 className="mb-3 text-sm font-semibold text-gray-700">
            Selected photos ({uploadedPhotos.length}/{MAX_PHOTOS})
          </h4>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {uploadedPhotos.map((photo) => (
              <div
                key={photo.id}
                className="relative overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm"
              >
                <img
                  src={photo.url}
                  alt={photo.name}
                  className="h-48 w-full object-cover"
                />

                <div className="flex items-center justify-between px-4 py-3">
                  <div className="min-w-0 flex-1 pr-3">
                    <p className="truncate text-sm font-medium text-gray-800">
                      {photo.name}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemovePhoto(photo.id)}
                    className="inline-flex items-center gap-1 rounded-full border border-gray-200 px-3 py-1 text-xs font-medium text-gray-600 transition hover:border-red-200 hover:text-red-600"
                  >
                    <DeleteOutlineIcon fontSize="inherit" />
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="rounded-lg border border-gray-200 bg-white p-4 text-sm text-gray-600">
          <p>
            Adding photos helps volunteers understand your request quickly.
            You can continue without photos if needed.
          </p>
        </div>
      )}
    </div>
  );
};

export default UploadPhotosStep;
