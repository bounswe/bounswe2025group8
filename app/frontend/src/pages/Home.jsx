import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
// import CategoryCard from "../components/CategoryCard";
// import RequestCard from "../components/RequestCard"; // Import the RequestCard component
// import * as categoryService from "../services/categoryService";
// import * as taskService from "../services/taskService";
// import { getCategoryImage } from "../constants/categories";

const Home = () => {
  const navigate = useNavigate();
  const handleCategoryClick = (categoryId) => {
    // Navigate to requests filtered by this category
    navigate(`/requests?category=${categoryId}`);
  }; // We're now fetching categories and requests from the API
  const [categories, setCategories] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState({
    categories: false,
    requests: false,
  });
  const [error, setError] = useState({
    categories: null,
    requests: null,
  });

  // Fetch data from API
  useEffect(() => {
    const fetchData = async () => {
      // Fetch categories
      setLoading((prev) => ({ ...prev, categories: true }));
      try {
        const popularCategories = await categoryService.getPopularCategories(4);
        // Transform API response to match UI component expectations
        const formattedCategories = popularCategories.map((category) => ({
          id: category.value,
          title: category.name,
          image: getCategoryImage(category.value),
          requestCount: category.task_count,
        }));
        setCategories(formattedCategories);
        setError((prev) => ({ ...prev, categories: null }));
      } catch (err) {
        console.error("Failed to fetch categories:", err);
        setError((prev) => ({
          ...prev,
          categories: "Failed to load categories",
        }));
      } finally {
        setLoading((prev) => ({ ...prev, categories: false }));
      }

      // Fetch popular requests
      setLoading((prev) => ({ ...prev, requests: true }));
      try {
        const popularTasks = await taskService.getPopularTasks(6);
        setRequests(popularTasks);
        setError((prev) => ({ ...prev, requests: null }));
      } catch (err) {
        console.error("Failed to fetch popular requests:", err);
        setError((prev) => ({
          ...prev,
          requests: "Failed to load popular requests",
        }));
        // Clear requests on error
        setRequests([]);
      } finally {
        setLoading((prev) => ({ ...prev, requests: false }));
      }
    };
    fetchData();
  }, []);
  // Using the centralized getCategoryImage function from constants/categories.js

  return (
    <>
      {" "}
      {/* Popular Categories Section */}
      <div className="mb-12">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-medium">Popular Categories</h2>
          {categories.length > 4 && (
            <button
              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              onClick={() => navigate("/categories")}
            >
              See All
            </button>
          )}
        </div>

        {loading.categories ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : error.categories ? (
          <div className="text-center py-8">
            <p className="text-red-600 mb-4">{error.categories}</p>
            <button
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
              onClick={() => {
                setLoading((prev) => ({ ...prev, categories: true }));
                categoryService
                  .getPopularCategories(4)
                  .then((data) => {
                    const formattedCategories = data.map((category) => ({
                      id: category.value,
                      title: category.name,
                      image: getCategoryImage(category.value),
                      requestCount: category.task_count,
                    }));
                    setCategories(formattedCategories);
                    setError((prev) => ({ ...prev, categories: null }));
                  })
                  .catch((err) => {
                    console.error("Failed to fetch categories:", err);
                    setError((prev) => ({
                      ...prev,
                      categories: "Failed to load categories",
                    }));
                  })
                  .finally(() => {
                    setLoading((prev) => ({ ...prev, categories: false }));
                  });
              }}
            >
              Try Again
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mt-4 justify-items-center">
            {categories.length > 0 ? (
              categories.slice(0, 4).map((category) => (
                <div key={category.id} className="col-span-1">
                  <CategoryCard
                    title={category.title}
                    image={category.image}
                    categoryId={category.id}
                    onClick={() => handleCategoryClick(category.id)}
                  />
                </div>
              ))
            ) : (
              <div className="col-span-full text-center py-8">
                <p className="text-gray-500">No categories available</p>
              </div>
            )}
          </div>
        )}
      </div>{" "}
      {/* Popular Requests Section */}
      <div className="mb-12">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-medium">Popular Requests</h2>
          {requests.length > 6 && (
            <button
              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              onClick={() => navigate("/requests")}
            >
              See All
            </button>
          )}
        </div>

        {loading.requests ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : error.requests ? (
          <div className="text-center py-8">
            <p className="text-red-600 mb-4">{error.requests}</p>
            <button
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
              onClick={() => {
                setLoading((prev) => ({ ...prev, requests: true }));
                taskService
                  .getPopularTasks(6)
                  .then((data) => {
                    setRequests(data);
                    setError((prev) => ({ ...prev, requests: null }));
                  })
                  .catch((err) => {
                    console.error("Failed to fetch popular requests:", err);
                    setError((prev) => ({
                      ...prev,
                      requests: "Failed to load popular requests",
                    }));
                    setRequests([]); // Clear requests on error
                  })
                  .finally(() => {
                    setLoading((prev) => ({ ...prev, requests: false }));
                  });
              }}
            >
              Try Again
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-4 justify-items-center">
            {requests.length > 0 ? (
              requests.slice(0, 6).map((request) => (
                <div key={request.id} className="col-span-1">
                  <RequestCard
                    request={request}
                    onClick={() => navigate(`/requests/${request.id}`)}
                  />
                </div>
              ))
            ) : (
              <div className="col-span-full text-center py-8">
                <p className="text-gray-500">No requests available</p>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
};

export default Home;
