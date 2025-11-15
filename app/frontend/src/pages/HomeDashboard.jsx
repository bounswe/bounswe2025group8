import React from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";

const HomeDashboard = () => {
  const navigate = useNavigate();
  const { currentUser } = useSelector((state) => state.auth);

  const quickLinks = [
    {
      title: "Browse Tasks",
      description: "Find tasks that need help in your neighborhood",
      path: "/tasks",
      color: "#4caf50",
    },
    {
      title: "Post a Task",
      description: "Request assistance from volunteers",
      path: "/create-task",
      color: "#2196f3",
    },
    {
      title: "My Activities",
      description: "View your ongoing and past tasks",
      path: "/my-tasks",
      color: "#ff9800",
    },
  ];

  return (
    <main
      role="main"
      aria-labelledby="home-dashboard-title"
      className="container mx-auto px-4"
    >
      <div className="mb-8 text-left">
        <h1 className="text-4xl mb-4" id="home-dashboard-title">
          {currentUser
            ? `Welcome back, ${currentUser.name || "User"}!`
            : "Welcome to Neighborhood Assistance Board!"}
        </h1>
        <p className="text-base text-gray-600 mb-4">
          Connect with your community, help neighbors, and get assistance when
          you need it.
        </p>
      </div>

      <div
        className="grid grid-cols-1 md:grid-cols-3 gap-8"
        role="region"
        aria-label="Quick links"
      >
        {quickLinks.map((link) => (
          <div key={link.title} className="col-span-1">
            <div
              className="h-full flex flex-col bg-white rounded-lg shadow-md hover:shadow-xl transition-all duration-300 ease-in-out"
              style={{ borderTop: `4px solid ${link.color}` }}
            >
              <div className="flex-grow p-4">
                <h2 className="text-xl font-medium mb-2">{link.title}</h2>
                <p className="text-sm text-gray-600">{link.description}</p>
              </div>
              <div className="p-4 pt-0">
                <button
                  className="text-sm hover:underline transition-colors"
                  onClick={() => navigate(link.path)}
                  style={{ color: link.color }}
                  aria-label={`Explore ${link.title}`}
                >
                  Explore
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div
        className="mt-12 mb-8 text-center"
        role="region"
        aria-labelledby="how-it-works-title"
      >
        <h2 className="text-2xl mb-4" id="how-it-works-title">
          How It Works
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
          <div className="col-span-1">
            <div className="p-6">
              <h3 className="text-lg font-medium mb-2">Request Help</h3>
              <p className="text-sm text-gray-600">
                Post a task describing what you need help with in your
                neighborhood
              </p>
            </div>
          </div>
          <div className="col-span-1">
            <div className="p-6">
              <h3 className="text-lg font-medium mb-2">Connect</h3>
              <p className="text-sm text-gray-600">
                Volunteers in your area will respond to your request
              </p>
            </div>
          </div>
          <div className="col-span-1">
            <div className="p-6">
              <h3 className="text-lg font-medium mb-2">Get Help</h3>
              <p className="text-sm text-gray-600">
                Select a volunteer and get the assistance you need
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default HomeDashboard;
