import React, { useEffect } from "react";
import { useDispatch } from "react-redux";
import { Outlet, useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Searchbar from "../components/Searchbar";
import { loadUserFromStorage } from "../features/authentication/store/authSlice";

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
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar Container - Container 120 */}
      <div className="absolute top-0 left-0 w-[287px] h-[844px] bg-white rounded-none shadow-sm">
        <Sidebar />
      </div>

      {/* Main Content Container - Container 121 */}
      <div className="absolute top-0 left-[287px] w-[1153px] h-[844px] bg-white rounded-md shadow-sm">
        {/* Searchbar Group - positioned as per spec */}
        <div className="absolute top-[63px] left-[140px] w-[873px] h-[44px]">
          <Searchbar
            onSearch={handleSearch}
            placeholder="What do you need help with"
            autoFocus={false}
            defaultValue=""
          />
        </div>

        {/* Main content area for pages */}
        <div className="relative w-full h-full overflow-auto">
          <div className="pt-[120px] px-4">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
};

export default MainLayout;
