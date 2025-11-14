import React, { useEffect } from "react";
import { useDispatch } from "react-redux";
import { Outlet, useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Searchbar from "../components/Searchbar";
import { loadUserFromStorage } from "../features/authentication/store/authSlice";
import { useTheme } from "../hooks/useTheme";

const SIDEBAR_WIDTH = 240;

const MainLayout = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { colors } = useTheme();

  // Load user data from localStorage when the app starts
  useEffect(() => {
    dispatch(loadUserFromStorage());
  }, [dispatch]);

  const handleSearch = (query) => {
    console.log("Search query:", query);
    if (query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query)}`);
    }
  };

  return (
    <div
      className="flex"
      style={{ backgroundColor: colors.background.primary }}
    >
      {/* Sidebar */}
      <Sidebar />
      {/* Fixed Search AppBar */}
      <header
        className="fixed w-[calc(100%-240px)] ml-60 shadow-sm z-30"
        style={{
          backgroundColor: colors.background.elevated,
          borderBottom: `1px solid ${colors.border.primary}`,
          color: colors.text.primary,
        }}
      >
        <div className="px-6 py-4">
          <div className="w-full sm:w-96 md:w-[500px] mx-auto">
            <Searchbar
              onSearch={handleSearch}
              placeholder="Search across the app"
              autoFocus={false}
              defaultValue=""
            />
          </div>
        </div>
      </header>

      {/* Main content area */}
      <div
        className="flex-grow p-0 ml-60 min-h-screen overflow-auto w-[calc(100%-240px)] mt-16"
        style={{ backgroundColor: colors.background.primary }}
      >
        {/* Full-width container */}
        <div className="px-12 py-12">
          {/* Main content outlet */}
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default MainLayout;
