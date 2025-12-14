import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import SearchIcon from "@mui/icons-material/Search";
import ClearIcon from "@mui/icons-material/Clear";
import { useTheme } from "../hooks/useTheme";

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
  placeholder,
  autoFocus = false,
  defaultValue = "",
  className = "",
}) => {
  const { t } = useTranslation();
  const [query, setQuery] = useState(defaultValue);
  const [focused, setFocused] = useState(false);
  const { colors } = useTheme();

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
        transition-all duration-200 ease-in-out ${className}`}
      style={{
        backgroundColor: colors.background.secondary,
        border: `1px solid ${
          focused ? colors.border.focus : colors.border.primary
        }`,
        boxShadow: focused ? `0 0 0 2px ${colors.border.focus}40` : "none",
      }}
    >
      <button
        className="p-3 border-0 ml-0 rounded-l-full 
          transition-colors duration-200 flex items-center justify-center"
        aria-label={t("searchbar.search")}
        onClick={handleSubmit}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            handleSubmit(e);
          }
        }}
        type="button"
        style={{
          color: colors.brand.secondary,
          backgroundColor: `${colors.brand.secondary}33`,
        }}
        onFocus={(e) => {
          e.currentTarget.style.outline = `3px solid ${colors.border.focus}`;
          e.currentTarget.style.outlineOffset = "2px";
        }}
        onBlur={(e) => {
          e.currentTarget.style.outline = "none";
        }}
      >
        <SearchIcon />
      </button>

      <input
        type="search"
        className="ml-2 flex-1 bg-transparent py-3 px-4 w-full outline-none text-sm
          [&::-webkit-search-cancel-button]:hidden [&::-webkit-search-decoration]:hidden"
        placeholder={placeholder || t("searchbar.placeholder")}
        aria-label={t("searchbar.searchInput")}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        autoFocus={autoFocus}
        style={{
          color: colors.text.primary,
        }}
      />

      {query && (
        <button
          className="p-2.5 mr-4 transition-colors 
            duration-200 rounded-full"
          aria-label={t("searchbar.clearSearch")}
          onClick={handleClear}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              handleClear(e);
            }
          }}
          type="button"
          style={{
            color: colors.text.secondary,
          }}
          onFocus={(e) => {
            e.currentTarget.style.outline = `3px solid ${colors.border.focus}`;
            e.currentTarget.style.outlineOffset = "2px";
          }}
          onBlur={(e) => {
            e.currentTarget.style.outline = "none";
          }}
        >
          <ClearIcon fontSize="small" />
        </button>
      )}
    </form>
  );
};

export default Searchbar;
