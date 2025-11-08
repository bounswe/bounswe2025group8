import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
// Icons - keeping MUI icons for now as they provide good icon support
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import PersonIcon from "@mui/icons-material/Person";
import PhoneIcon from "@mui/icons-material/Phone";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import VolunteerActivismIcon from "@mui/icons-material/VolunteerActivism";
import {
  updateTask,
  updateTaskStatus,
} from "../features/request/services/createRequestService";
import { cancelTask } from "../features/request/services/createRequestService"; // Add this import
import {
  getTaskById as getRequestById,
  getTaskVolunteers,
  volunteerForTask,
  checkUserVolunteerStatus,
  withdrawFromTask,
} from "../features/request/services/requestService";
import { useAppSelector, useAppDispatch } from "../store/hooks";
import {
  selectCurrentUser,
  selectIsAuthenticated,
} from "../features/authentication/store/authSlice";
import { removeTaskFromList } from "../features/request/store/allRequestsSlice";
import Sidebar from "../components/Sidebar";
import EditRequestModal from "../components/EditRequestModal";
import { urgencyLevels } from "../constants/urgency_level";
import { getCategoryImage } from "../constants/categories";

const RequestDetail = () => {
  const { requestId } = useParams();
  const navigate = useNavigate();

  // Authentication state
  const currentUser = useAppSelector(selectCurrentUser);
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const dispatch = useAppDispatch();

  // State for request data, loading, and error
  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Edit dialog state
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  // Add these new state variables
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState(null);
  const [deleteSuccess, setDeleteSuccess] = useState(false);
  const [isVolunteering, setIsVolunteering] = useState(false);
  const [volunteerRecord, setVolunteerRecord] = useState(null);
  const [isMarkingComplete, setIsMarkingComplete] = useState(false);

  // Helper function to check if deadline has passed
  const isDeadlinePassed = (deadline) => {
    if (!deadline) return false;
    const now = new Date();
    const deadlineDate = new Date(deadline);
    return now > deadlineDate;
  };

  // Fetch request details and volunteer status
  useEffect(() => {
    const fetchRequest = async () => {
      try {
        console.log("Fetching request with ID:", requestId);
        setLoading(true);
        setError(null);

        // Fetch request data
        const requestData = await getRequestById(requestId);
        console.log("Received request data:", requestData);

        // Fetch volunteers for the task
        try {
          const volunteers = await getTaskVolunteers(requestId);
          console.log("Received volunteers data:", volunteers);
          requestData.volunteers = volunteers;
        } catch (volunteersError) {
          console.warn(
            `Could not fetch volunteers for task ${requestId}:`,
            volunteersError
          );
          requestData.volunteers = [];
        }

        setRequest(requestData);

        // Check if current user has volunteered for this task
        if (isAuthenticated && currentUser) {
          try {
            console.log(
              "Checking volunteer status for user:",
              currentUser.id,
              "task:",
              requestId
            );
            const volunteerRecord = await checkUserVolunteerStatus(requestId);
            console.log("User volunteer status result:", volunteerRecord);
            setVolunteerRecord(volunteerRecord);
          } catch (volunteerError) {
            console.warn("Could not check volunteer status:", volunteerError);
            // Set to null if we can't determine status
            setVolunteerRecord(null);
          }
        } else {
          console.log(
            "Not authenticated or no current user, skipping volunteer status check"
          );
          setVolunteerRecord(null);
        }
      } catch (err) {
        console.error("Error fetching request:", err);
        console.error("Error details:", err.response?.data);

        // Fallback to mock data for development
        console.log("Falling back to mock data...");
        try {
          const { getMockTaskById } = await import(
            "../features/request/services/requestService"
          );
          const mockData = getMockTaskById(requestId);
          if (mockData) {
            console.log("Using mock data:", mockData);
            setRequest(mockData);
          } else {
            setError(
              err.response?.data?.message ||
                err.message ||
                "Failed to fetch request details"
            );
          }
        } catch (mockError) {
          console.error("Mock data fallback failed:", mockError);
          setError(
            err.response?.data?.message ||
              err.message ||
              "Failed to fetch request details"
          );
        }
      } finally {
        setLoading(false);
      }
    };

    if (requestId) {
      fetchRequest();
    }
  }, [requestId, isAuthenticated, currentUser]);

  // Auto-hide success message after 5 seconds
  useEffect(() => {
    if (deleteSuccess) {
      const timer = setTimeout(() => {
        setDeleteSuccess(false);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [deleteSuccess]);

  // Auto-hide error message after 5 seconds
  useEffect(() => {
    if (deleteError) {
      const timer = setTimeout(() => {
        setDeleteError(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [deleteError]);

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  // Format time
  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  // Get time ago
  const getTimeAgo = (dateString) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));

    if (diffInHours < 1) return "Just now";
    if (diffInHours === 1) return "1 hour ago";
    if (diffInHours < 24) return `${diffInHours} hours ago`;

    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays === 1) return "1 day ago";
    return `${diffInDays} days ago`;
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh] flex-col gap-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <p className="text-gray-600">Loading request details...</p>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar />
        <div className="flex-grow p-6 flex items-center justify-center">
          <div className="text-center max-w-md">
            <h2 className="text-2xl font-semibold text-red-600 mb-4">
              Error loading request
            </h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <button
              onClick={() => navigate("/requests")}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              <ArrowBackIcon className="mr-2 w-4 h-4" />
              Back to Requests
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Request not found
  if (!request) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar />
        <div className="flex-grow p-6 flex items-center justify-center">
          <div className="text-center max-w-md">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              Request not found
            </h2>
            <p className="text-gray-600 mb-6">
              The request you're looking for doesn't exist or has been removed.
            </p>
            <button
              onClick={() => navigate("/requests")}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              <ArrowBackIcon className="mr-2 w-4 h-4" />
              Back to Requests
            </button>
          </div>
        </div>
      </div>
    );
  }

  const urgency = urgencyLevels[request.urgency_level];

  // Permission checks
  const isTaskCreator =
    currentUser && request && currentUser.id === request.creator?.id;
  const canEdit = isAuthenticated && isTaskCreator;
  const canDelete = isAuthenticated && isTaskCreator;
  const acceptedVolunteersCount =
    request.volunteers?.filter((v) => v.status === "ACCEPTED").length || 0;
  const canVolunteer =
    isAuthenticated &&
    !isTaskCreator &&
    (request?.status === "POSTED" || request?.status === "ASSIGNED") &&
    acceptedVolunteersCount < request.volunteer_number &&
    !volunteerRecord;
  const canWithdraw = isAuthenticated && !isTaskCreator && volunteerRecord;
  const canMarkAsComplete =
    isAuthenticated &&
    isTaskCreator &&
    (request?.status === "ASSIGNED" || request?.status === "IN_PROGRESS") &&
    acceptedVolunteersCount > 0 &&
    request?.status !== "COMPLETED";

  // Debug logging
  console.log("Permission debug:", {
    isAuthenticated,
    currentUser: currentUser?.id,
    requestCreator: request?.creator?.id,
    isTaskCreator,
    requestStatus: request?.status,
    volunteerRecord: volunteerRecord?.id,
    canVolunteer,
    canWithdraw,
    canMarkAsComplete,
    isDeadlinePassed: isDeadlinePassed(request.deadline),
    deadline: request?.deadline,
  });

  // Button handlers
  const handleEditTask = () => {
    if (canEdit) {
      setEditDialogOpen(true);
    }
  };

  const handleDeleteTask = async () => {
    if (canDelete) {
      if (window.confirm("Are you sure you want to delete this task?")) {
        try {
          setIsDeleting(true);
          setDeleteError(null);

          await cancelTask(request.id);

          // Remove the task from AllRequests list immediately
          dispatch(removeTaskFromList(request.id));

          setDeleteSuccess(true);
          // Redirect after a short delay
          setTimeout(() => {
            navigate("/requests");
          }, 1500);
        } catch (err) {
          console.error("Error deleting request:", err);
          setDeleteError(
            err.response?.data?.message ||
              err.message ||
              "Failed to delete request"
          );
        } finally {
          setIsDeleting(false);
        }
      }
    }
  };

  const handleEditSubmit = async (payload) => {
    try {
      const response = await updateTask(request.id, payload);
      const updatedTask = response?.data ?? response;
      setRequest((prev) => ({ ...prev, ...updatedTask }));
      setEditDialogOpen(false);
    } catch (err) {
      console.error("Failed to update task:", err);
      alert(
        err?.response?.data?.message ?? err?.message ?? "Failed to update task."
      );
    }
  };
  const handleVolunteer = async () => {
    if (!canVolunteer) return;

    try {
      console.log("Volunteering for task:", request.id);
      setIsVolunteering(true);

      const result = await volunteerForTask(request.id);
      console.log("Volunteer result:", result);

      // Update volunteer status
      const volunteerRecord = result.data || result;
      setVolunteerRecord(volunteerRecord);
      setIsVolunteering(false);

      alert("Successfully volunteered for this task!");

      // Refresh the request data to get updated status
      const updatedRequest = await getRequestById(requestId);
      setRequest(updatedRequest);
    } catch (error) {
      console.error("Error volunteering for task:", error);
      setIsVolunteering(false);

      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Failed to volunteer for task";
      alert(`Error: ${errorMessage}`);
    }
  };

  const handleWithdrawVolunteer = async () => {
    if (!volunteerRecord) return;

    try {
      console.log("Withdrawing from task:", request.id);
      setIsVolunteering(true);

      await withdrawFromTask(volunteerRecord.id);
      console.log("Withdrawn from task");

      // Update volunteer status
      setVolunteerRecord(null);
      setIsVolunteering(false);

      alert("Successfully withdrew from this task");

      // Refresh the request data
      const updatedRequest = await getRequestById(requestId);
      setRequest(updatedRequest);
    } catch (error) {
      console.error("Error withdrawing from task:", error);
      setIsVolunteering(false);

      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Failed to withdraw from task";
      alert(`Error: ${errorMessage}`);
    }
  };

  const handleSelectVolunteer = () => {
    if (canEdit) {
      console.log("Select volunteer for task:", request.id);
      navigate(`/requests/${request.id}/select-volunteer`);
    }
  };

  const handleMarkAsComplete = async () => {
    if (!canMarkAsComplete) return;

    try {
      console.log("Marking task as completed:", request.id);
      console.log("Current task status:", request.status);
      setIsMarkingComplete(true);

      // According to backend validation, tasks can only be marked as COMPLETED from IN_PROGRESS status
      // So if the task is in ASSIGNED status, we need to first transition to IN_PROGRESS
      if (request.status === "ASSIGNED") {
        console.log("Task is ASSIGNED, first transitioning to IN_PROGRESS...");
        await updateTaskStatus(request.id, "IN_PROGRESS");
        console.log("Successfully transitioned to IN_PROGRESS");
      }

      // Now transition to COMPLETED
      console.log("Transitioning to COMPLETED...");
      const statusUpdateResult = await updateTaskStatus(
        request.id,
        "COMPLETED"
      );
      console.log("Task status updated to COMPLETED:", statusUpdateResult);

      // Refresh the task data from the backend to get the latest state
      console.log("Refreshing task data after marking complete...");
      const refreshedTask = await getRequestById(request.id);
      console.log("Refreshed task data:", refreshedTask);

      // Update the request state with the refreshed data
      setRequest(refreshedTask);

      // Remove the completed task from AllRequests list immediately
      dispatch(removeTaskFromList(request.id));

      alert("Task marked as completed successfully!");
    } catch (error) {
      console.error("Error marking task as completed:", error);
      console.error("Error details:", error.response?.data);
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        "Failed to mark task as completed";
      alert(`Error: ${errorMessage}`);
    } finally {
      setIsMarkingComplete(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar />

      {/* Success/Error Messages */}
      {deleteSuccess && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50">
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded shadow-lg flex items-center">
            <span>Request deleted successfully! Redirecting...</span>
            <button
              onClick={() => setDeleteSuccess(false)}
              className="ml-4 text-green-700 hover:text-green-900"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {deleteError && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded shadow-lg flex items-center">
            <span>{deleteError}</span>
            <button
              onClick={() => setDeleteError(null)}
              className="ml-4 text-red-700 hover:text-red-900"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-grow p-6">
        {/* Back Button and Title */}
        <div className="flex items-center mb-6">
          <button
            onClick={() => navigate("/requests")}
            className="mr-4 p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ArrowBackIcon className="w-6 h-6" />
          </button>
          <h1 className="flex-grow text-3xl font-bold text-gray-900">
            {request.title}
          </h1>
          <div className="flex gap-2 items-center">
            <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full">
              {request.category_display}
            </span>
            <span
              className="px-3 py-1 text-white text-sm font-medium rounded-full"
              style={{ backgroundColor: urgency.color }}
            >
              {urgency.name} Urgency
            </span>
            <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors">
              <MoreVertIcon className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Main Content Card - Improved Layout */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-6">
          <div className="grid grid-cols-1 lg:grid-cols-2">
            {/* Left Column - Image */}
            <div className="relative h-120">
              <img
                src={
                  request.photos?.[0]?.image ||
                  request.photos?.[0]?.photo_url ||
                  getCategoryImage(request.category)
                }
                alt={request.title}
                className="w-full h-full object-cover"
              />
              {/* Image overlay with category */}
              <div className="absolute bottom-4 left-4">
                <span className="px-3 py-2 bg-black bg-opacity-60 text-white text-sm font-medium rounded-lg">
                  {request.category_display}
                </span>
              </div>
            </div>

            {/* Right Column - Details */}
            <div className="p-6 flex flex-col justify-between">
              {/* Requester Info */}
              <div
                className="flex items-center mb-6 p-3 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => navigate(`/profile/${request.creator.id}`)}
              >
                <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold text-lg mr-4">
                  {request.creator.name.charAt(0)}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {request.creator.name} {request.creator.surname}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {getTimeAgo(request.created_at)}
                  </p>
                </div>
              </div>

              {/* Description */}
              <div className="mb-6 flex-grow">
                <p className="text-gray-700 leading-relaxed">
                  {request.description}
                </p>
              </div>

              {/* Details Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                <div className="flex items-center text-gray-600">
                  <AccessTimeIcon className="w-5 h-5 mr-3 text-gray-400" />
                  <span className="text-sm">
                    {formatDate(request.deadline)} -{" "}
                    {formatTime(request.deadline)}
                  </span>
                </div>

                <div className="flex items-center text-gray-600">
                  <LocationOnIcon className="w-5 h-5 mr-3 text-gray-400" />
                  <span className="text-sm">{request.location}</span>
                </div>

                <div className="flex items-center text-gray-600">
                  <PersonIcon className="w-5 h-5 mr-3 text-gray-400" />
                  <span className="text-sm">
                    {request.volunteer_number} person
                    {request.volunteer_number > 1 ? "s" : ""} required
                  </span>
                </div>

                <div className="flex items-center text-gray-600">
                  <PhoneIcon className="w-5 h-5 mr-3 text-gray-400" />
                  <span className="text-sm">
                    {request.creator.phone_number}
                  </span>
                </div>
              </div>

              {/* Status */}
              {(request.status === "POSTED" ||
                request.status === "ASSIGNED" ||
                request.status === "IN_PROGRESS" ||
                request.status === "COMPLETED") && (
                <div className="mb-6">
                  <p className="text-sm text-gray-500">
                    {request.status === "POSTED"
                      ? "Waiting for Volunteers"
                      : request.status === "ASSIGNED"
                      ? isTaskCreator
                        ? acceptedVolunteersCount > 0
                          ? "Ready to mark as complete"
                          : null
                        : volunteerRecord &&
                          volunteerRecord.status === "ACCEPTED"
                        ? "Task Assigned to You"
                        : acceptedVolunteersCount < request.volunteer_number
                        ? "Waiting for More Volunteers"
                        : "Task Assigned"
                      : request.status === "IN_PROGRESS"
                      ? isTaskCreator && acceptedVolunteersCount > 0
                        ? "Ready to mark as complete"
                        : "In Progress"
                      : request.status === "COMPLETED"
                      ? "Task Completed"
                      : "Unknown Status"}
                  </p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="space-y-3">
                {/* Primary Action Buttons for Task Creator - Mark as Complete and Select Volunteer */}
                {canEdit &&
                  (request.status === "POSTED" ||
                    request.status === "ASSIGNED") && (
                    <div
                      className={
                        canMarkAsComplete ? "grid grid-cols-2 gap-3" : ""
                      }
                    >
                      {/* Select Volunteer Button */}
                      <button
                        onClick={handleSelectVolunteer}
                        className={`py-3 px-6 bg-purple-600 text-white text-base font-medium rounded-lg hover:bg-purple-700 transition-colors ${
                          canMarkAsComplete ? "" : "w-full"
                        }`}
                      >
                        {request.status === "ASSIGNED"
                          ? "Change Volunteers"
                          : "Select Volunteer"}
                      </button>

                      {/* Mark as Complete Button */}
                      {canMarkAsComplete && (
                        <button
                          onClick={handleMarkAsComplete}
                          disabled={isMarkingComplete}
                          className="py-3 px-6 bg-green-600 text-white text-base font-medium rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
                        >
                          {isMarkingComplete ? (
                            <>
                              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                              Marking...
                            </>
                          ) : (
                            "Mark as Complete"
                          )}
                        </button>
                      )}
                    </div>
                  )}

                {/* Mark as Complete Button (when not in Edit mode) */}
                {canMarkAsComplete &&
                  (!canEdit ||
                    (request.status !== "POSTED" &&
                      request.status !== "ASSIGNED")) && (
                    <button
                      onClick={handleMarkAsComplete}
                      disabled={isMarkingComplete}
                      className="w-full py-3 px-6 bg-green-600 text-white text-base font-medium rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
                    >
                      {isMarkingComplete ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                          Marking Complete...
                        </>
                      ) : (
                        "Mark as Complete"
                      )}
                    </button>
                  )}

                {canVolunteer && (
                  <button
                    onClick={handleVolunteer}
                    disabled={isVolunteering}
                    className="w-full py-3 px-6 bg-green-600 text-white text-base font-medium rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
                  >
                    <VolunteerActivismIcon className="w-5 h-5 mr-2" />
                    {isVolunteering
                      ? "Volunteering..."
                      : "Volunteer for this Task"}
                  </button>
                )}

                {canWithdraw && (
                  <button
                    onClick={handleWithdrawVolunteer}
                    disabled={isVolunteering}
                    className="w-full py-3 px-6 border-2 border-red-500 text-red-600 text-base font-medium rounded-lg hover:bg-red-50 disabled:border-gray-300 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
                  >
                    <VolunteerActivismIcon className="w-5 h-5 mr-2" />
                    {isVolunteering ? "Withdrawing..." : "Withdraw from Task"}
                  </button>
                )}

                {!isAuthenticated && (
                  <button
                    onClick={() => navigate("/login")}
                    className="w-full py-3 px-6 bg-blue-600 text-white text-base font-medium rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Login to Volunteer
                  </button>
                )}

                {/* Secondary Action Buttons - Only for Task Creator and not completed */}
                {canEdit && request.status !== "COMPLETED" && (
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={handleEditTask}
                      className="py-2 px-4 border-2 border-amber-500 text-amber-600 text-sm font-medium rounded-lg hover:bg-amber-50 transition-colors flex items-center justify-center"
                    >
                      <EditIcon className="w-4 h-4 mr-2" />
                      Edit
                    </button>
                    <button
                      onClick={handleDeleteTask}
                      disabled={isDeleting}
                      className="py-2 px-4 border-2 border-red-500 text-red-600 text-sm font-medium rounded-lg hover:bg-red-50 disabled:border-gray-300 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
                    >
                      {isDeleting ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-500 mr-2"></div>
                      ) : (
                        <DeleteIcon className="w-4 h-4 mr-2" />
                      )}
                      {isDeleting ? "Deleting..." : "Delete"}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <EditRequestModal
        open={editDialogOpen}
        onClose={() => setEditDialogOpen(false)}
        request={request}
        onSubmit={handleEditSubmit}
      />
    </div>
  );
};

export default RequestDetail;
