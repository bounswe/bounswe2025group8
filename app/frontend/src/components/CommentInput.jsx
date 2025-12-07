import React, { useState } from "react";
import SendIcon from "@mui/icons-material/Send";
import { useTheme } from "../hooks/useTheme";

const CommentInput = ({ onSubmit, disabled = false }) => {
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { colors } = useTheme();

  const handleSubmit = async (e) => {
    e.preventDefault();

    const trimmedContent = content.trim();
    if (!trimmedContent || isSubmitting) return;

    try {
      setIsSubmitting(true);
      await onSubmit(trimmedContent);
      setContent(""); // Clear input after successful submission
    } catch (error) {
      console.error("Error submitting comment:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyPress = (e) => {
    // Submit on Ctrl+Enter or Cmd+Enter
    if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
      handleSubmit(e);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div
        className="flex gap-2 p-4 rounded-lg"
        style={{
          backgroundColor: colors.background.elevated,
          border: `1px solid ${colors.border.secondary}`,
        }}
      >
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyDown={handleKeyPress}
          placeholder="Write a comment... (Ctrl+Enter to submit)"
          disabled={disabled || isSubmitting}
          rows={1}
          className="flex-grow px-3 py-2 rounded-md resize-none focus:outline-none focus:ring-2 transition-all"
          style={{
            backgroundColor: colors.background.primary,
            color: colors.text.primary,
            border: `1px solid ${colors.border.secondary}`,
            focusRing: colors.brand.primary,
          }}
          aria-label="Comment input"
        />
        <button
          type="submit"
          disabled={!content.trim() || disabled || isSubmitting}
          className="px-4 py-2 rounded-md font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          style={{
            backgroundColor:
              !content.trim() || disabled || isSubmitting
                ? colors.interactive.disabled
                : colors.brand.primary,
            color: colors.text.inverse,
            minWidth: "80px",
          }}
          onMouseEnter={(e) => {
            if (content.trim() && !disabled && !isSubmitting) {
              e.currentTarget.style.backgroundColor = colors.brand.primaryHover;
            }
          }}
          onMouseLeave={(e) => {
            if (content.trim() && !disabled && !isSubmitting) {
              e.currentTarget.style.backgroundColor = colors.brand.primary;
            }
          }}
          aria-label="Submit comment"
        >
          {isSubmitting ? (
            <div
              className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"
              aria-hidden="true"
            ></div>
          ) : (
            <>
              <SendIcon className="w-5 h-5 mr-1" aria-hidden="true" />
              Send
            </>
          )}
        </button>
      </div>
    </form>
  );
};

export default CommentInput;
