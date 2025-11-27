import React, { useState, useEffect } from "react";
import PersonIcon from "@mui/icons-material/Person";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../hooks/useTheme";
import {
  getTaskComments,
  createComment,
  updateComment,
  deleteComment,
} from "../services/commentService";
import { toAbsoluteUrl } from "../utils/url";
import CommentInput from "./CommentInput";

const CommentSection = ({ taskId, currentUser, isAuthenticated }) => {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editContent, setEditContent] = useState("");
  const { colors } = useTheme();
  const navigate = useNavigate();

  // Fetch comments on mount
  useEffect(() => {
    fetchComments();
  }, [taskId]);

  const fetchComments = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getTaskComments(taskId);
      // API returns response.data.comments, not response.data
      const commentsData = response.data?.comments || response.data || [];
      const sortedComments = Array.isArray(commentsData) ? commentsData : [];
      // Sort comments by timestamp, newest first
      sortedComments.sort(
        (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
      );
      setComments(sortedComments);
    } catch (err) {
      console.error("Error fetching comments:", err);
      setError("Failed to load comments");
      setComments([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitComment = async (content) => {
    try {
      const response = await createComment(taskId, content);
      // Add the new comment to the beginning of the list (newest first)
      if (response.data) {
        setComments((prev) => [response.data, ...prev]);
      } else {
        // Refresh comments if response format is unexpected
        await fetchComments();
      }
    } catch (err) {
      console.error("Error creating comment:", err);
      alert(
        err.response?.data?.message ||
          "Failed to post comment. Please try again."
      );
      throw err;
    }
  };

  const handleEditComment = async (commentId) => {
    if (!editContent.trim()) return;

    try {
      const response = await updateComment(commentId, editContent);
      // Update the comment in the list
      setComments((prev) =>
        prev.map((c) =>
          c.id === commentId ? { ...c, content: response.data.content } : c
        )
      );
      setEditingCommentId(null);
      setEditContent("");
    } catch (err) {
      console.error("Error updating comment:", err);
      alert(
        err.response?.data?.message ||
          "Failed to update comment. Please try again."
      );
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm("Are you sure you want to delete this comment?")) {
      return;
    }

    try {
      await deleteComment(commentId);
      // Remove the comment from the list
      setComments((prev) => prev.filter((c) => c.id !== commentId));
    } catch (err) {
      console.error("Error deleting comment:", err);
      alert(
        err.response?.data?.message ||
          "Failed to delete comment. Please try again."
      );
    }
  };

  const startEditing = (comment) => {
    setEditingCommentId(comment.id);
    setEditContent(comment.content);
  };

  const cancelEditing = () => {
    setEditingCommentId(null);
    setEditContent("");
  };

  const formatTimeAgo = (timestamp) => {
    const now = new Date();
    const date = new Date(timestamp);
    const diffInSeconds = Math.floor((now - date) / 1000);

    if (diffInSeconds < 60) return "Just now";
    if (diffInSeconds < 3600)
      return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400)
      return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    if (diffInSeconds < 604800)
      return `${Math.floor(diffInSeconds / 86400)} days ago`;

    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
    });
  };

  return (
    <div
      className="rounded-lg p-6 mb-6"
      style={{
        backgroundColor: colors.background.elevated,
        boxShadow: `0 10px 15px -3px ${colors.shadow.lg}`,
      }}
    >
      {/* Header */}
      <h2
        className="text-2xl font-bold mb-6"
        style={{ color: colors.text.primary }}
      >
        Comments ({comments.length})
      </h2>

      {/* Comment Input */}
      {isAuthenticated ? (
        <div className="mb-6">
          <CommentInput onSubmit={handleSubmitComment} />
        </div>
      ) : (
        <div
          className="p-4 rounded-lg mb-6 text-center"
          style={{
            backgroundColor: colors.background.secondary,
            border: `1px solid ${colors.border.secondary}`,
          }}
        >
          <p style={{ color: colors.text.secondary }}>
            Please{" "}
            <button
              onClick={() => navigate("/login")}
              className="font-medium underline"
              style={{ color: colors.brand.primary }}
            >
              log in
            </button>{" "}
            to post a comment
          </p>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="flex justify-center items-center py-8">
          <div
            className="animate-spin rounded-full h-8 w-8 border-b-2"
            style={{ borderColor: colors.brand.primary }}
            aria-hidden="true"
          ></div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div
          className="p-4 rounded-lg mb-4"
          style={{
            backgroundColor: colors.semantic.errorBg,
            border: `1px solid ${colors.semantic.error}`,
            color: colors.semantic.error,
          }}
          role="alert"
        >
          {error}
        </div>
      )}

      {/* Comments List */}
      {!loading && !error && (
        <div className="space-y-2">
          {comments.length === 0 ? (
            <div
              className="text-center py-8"
              style={{ color: colors.text.secondary }}
            >
              No comments yet. Be the first to comment!
            </div>
          ) : (
            comments.map((comment) => {
              const isOwner =
                isAuthenticated && currentUser?.id === comment.user?.id;
              const userPhoto = toAbsoluteUrl(
                comment.user?.profile_photo ||
                  comment.user?.profilePhoto ||
                  comment.user?.avatar
              );

              return (
                <div
                  key={comment.id}
                  className="p-3 rounded-lg transition-colors"
                  style={{
                    backgroundColor: colors.background.secondary,
                    border: `1px solid ${colors.border.secondary}`,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor =
                      colors.background.tertiary;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor =
                      colors.background.secondary;
                  }}
                >
                  {/* Comment Header */}
                  <div className="flex items-start justify-between mb-2">
                    <div
                      className="flex items-center gap-2 cursor-pointer"
                      onClick={() => navigate(`/profile/${comment.user?.id}`)}
                      role="link"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          navigate(`/profile/${comment.user?.id}`);
                        }
                      }}
                    >
                      {userPhoto ? (
                        <img
                          src={userPhoto}
                          alt={`${comment.user?.name} ${comment.user?.surname}`}
                          className="w-8 h-8 rounded-full object-cover border"
                          style={{ borderColor: colors.border.secondary }}
                        />
                      ) : (
                        <div
                          className="w-8 h-8 rounded-full flex items-center justify-center text-white font-semibold text-sm"
                          style={{ backgroundColor: colors.brand.primary }}
                        >
                          {comment.user?.name?.charAt(0) || "U"}
                        </div>
                      )}
                      <div>
                        <p
                          className="font-semibold text-sm"
                          style={{ color: colors.text.primary }}
                        >
                          {comment.user?.name} {comment.user?.surname}
                        </p>
                        <div
                          className="flex items-center gap-1 text-xs"
                          style={{ color: colors.text.tertiary }}
                        >
                          <AccessTimeIcon
                            className="w-3 h-3"
                            aria-hidden="true"
                          />
                          <span>{formatTimeAgo(comment.timestamp)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    {isOwner && (
                      <div className="flex gap-1">
                        {editingCommentId !== comment.id && (
                          <>
                            <button
                              onClick={() => startEditing(comment)}
                              className="p-1 rounded-full transition-colors"
                              style={{ color: colors.text.secondary }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.color =
                                  colors.semantic.warning;
                                e.currentTarget.style.backgroundColor =
                                  colors.semantic.warningBg;
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.color =
                                  colors.text.secondary;
                                e.currentTarget.style.backgroundColor =
                                  "transparent";
                              }}
                              aria-label="Edit comment"
                            >
                              <EditIcon
                                className="w-3.5 h-3.5"
                                aria-hidden="true"
                              />
                            </button>
                            <button
                              onClick={() => handleDeleteComment(comment.id)}
                              className="p-1 rounded-full transition-colors"
                              style={{ color: colors.text.secondary }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.color =
                                  colors.semantic.error;
                                e.currentTarget.style.backgroundColor =
                                  colors.semantic.errorBg;
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.color =
                                  colors.text.secondary;
                                e.currentTarget.style.backgroundColor =
                                  "transparent";
                              }}
                              aria-label="Delete comment"
                            >
                              <DeleteIcon
                                className="w-3.5 h-3.5"
                                aria-hidden="true"
                              />
                            </button>
                          </>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Comment Content */}
                  {editingCommentId === comment.id ? (
                    <div className="space-y-2">
                      <textarea
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                        className="w-full px-2 py-1.5 text-sm rounded-md resize-none focus:outline-none focus:ring-2"
                        style={{
                          backgroundColor: colors.background.primary,
                          color: colors.text.primary,
                          border: `1px solid ${colors.border.secondary}`,
                        }}
                        rows={2}
                        autoFocus
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEditComment(comment.id)}
                          className="px-3 py-1 text-sm rounded-md font-medium transition-colors"
                          style={{
                            backgroundColor: colors.brand.primary,
                            color: colors.text.inverse,
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor =
                              colors.brand.primaryHover;
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor =
                              colors.brand.primary;
                          }}
                        >
                          Save
                        </button>
                        <button
                          onClick={cancelEditing}
                          className="px-3 py-1 text-sm rounded-md font-medium transition-colors"
                          style={{
                            backgroundColor: colors.background.primary,
                            color: colors.text.primary,
                            border: `1px solid ${colors.border.secondary}`,
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor =
                              colors.interactive.hover;
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor =
                              colors.background.primary;
                          }}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <p
                      className="whitespace-pre-wrap text-sm"
                      style={{ color: colors.text.primary }}
                    >
                      {comment.content}
                    </p>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
};

export default CommentSection;
