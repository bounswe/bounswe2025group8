import React, { useEffect } from "react";
import { useDispatch } from "react-redux";
import { Outlet, useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Searchbar from "../components/Searchbar";
import { loadUserFromStorage } from "../features/authentication/store/authSlice";

const SIDEBAR_WIDTH = 240;

const MainLayout = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

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
    <div className="flex">
      {/* Sidebar */}
      <Sidebar />
      {/* Fixed Search AppBar */}
      <header className="fixed w-[calc(100%-240px)] ml-60 shadow-sm bg-white text-gray-900 z-30">
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
      <div className="flex-grow p-0 ml-60 min-h-screen overflow-auto w-[calc(100%-240px)] mt-16">
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
