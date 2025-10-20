import React, { useState } from "react";
import SearchIcon from "@mui/icons-material/Search";
import ClearIcon from "@mui/icons-material/Clear";

/**
 * Searchbar component that matches the provided design
 * @param {Object} props
 * @param {Function} props.onSearch - Function called when search is submitted
 * @param {string} props.placeholder - Placeholder text for the search input
 * @param {boolean} props.autoFocus - Whether to autofocus the search input
 * @param {string} props.defaultValue - Default search query
 * @param {string} props.className - Additional CSS classes to apply
 */
const Searchbar = ({
  onSearch,
  placeholder = "What do you need help with",
  autoFocus = false,
  defaultValue = "",
  className = "",
}) => {
  const [query, setQuery] = useState(defaultValue);
  const [focused, setFocused] = useState(false);

  const handleSubmit = (e) => {
    if (e) e.preventDefault();
    if (onSearch && query.trim()) {
      onSearch(query);
    }
  };

  const handleClear = () => {
    setQuery("");
    if (onSearch) {
      onSearch("");
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className={`flex items-center w-full max-w-md min-w-72 rounded-full overflow-hidden 
        bg-blue-50 border border-blue-200 transition-all duration-200 ease-in-out
        hover:bg-blue-100 hover:border-blue-300 ${
          focused
            ? "border-blue-500 shadow-[0_0_0_2px_rgba(59,130,246,0.2)] bg-blue-100"
            : ""
        }
        ${className}`}
    >
      <button
        className="p-3 text-blue-500 bg-blue-500/20 border-0 ml-0 rounded-l-full 
          hover:bg-blue-500/30 transition-colors duration-200 focus:outline-none 
          focus:ring-2 focus:ring-blue-500/50 flex items-center justify-center"
        aria-label="search"
        onClick={handleSubmit}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            handleSubmit(e);
          }
        }}
        type="button"
      >
        <SearchIcon />
      </button>

      <input
        className="ml-2 flex-1 bg-transparent py-3 px-4 w-full outline-none 
          text-gray-900 placeholder-gray-500 text-sm"
        placeholder={placeholder}
        aria-label="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        autoFocus={autoFocus}
      />

      {query && (
        <button
          className="p-2.5 mr-4 text-gray-600 hover:text-gray-800 transition-colors 
            duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50 rounded-full"
          aria-label="clear"
          onClick={handleClear}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              handleClear(e);
            }
          }}
          type="button"
        >
          <ClearIcon fontSize="small" />
        </button>
      )}
    </form>
  );
};

export default Searchbar;
