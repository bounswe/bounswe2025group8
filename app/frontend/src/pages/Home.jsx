import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import CategoryCard from "../components/CategoryCard";
import RequestCard from "../components/RequestCard";
import * as categoryService from "../features/category/services/categoryService";
import * as requestService from "../features/request/services/requestService";
import { toAbsoluteUrl } from "../utils/url";
import { getCategoryImage, getCategoryName } from "../constants/categories";
import { useTheme } from "../hooks/useTheme";

const Home = () => {
  const navigate = useNavigate();
  const { colors } = useTheme();
  const { t } = useTranslation();
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

  // Fetch categories function
  const fetchCategories = async () => {
    setLoading((prev) => ({ ...prev, categories: true }));
    try {
      const popularCategories = await categoryService.getPopularCategories(4);
      // Transform API response to match UI component expectations
      const formattedCategories = popularCategories.map((category) => ({
        id: category.value,
        title: getCategoryName(category.value, t),
        image: getCategoryImage(category.value),
        requestCount: category.task_count,
      }));
      setCategories(formattedCategories);
      setError((prev) => ({ ...prev, categories: null }));
    } catch (err) {
      console.error("Failed to fetch categories:", err);
      setError((prev) => ({
        ...prev,
        categories: "failedToLoadCategories",
      }));
    } finally {
      setLoading((prev) => ({ ...prev, categories: false }));
    }
  };

  // Fetch requests function
  const fetchRequests = async () => {
    setLoading((prev) => ({ ...prev, requests: true }));
    try {
      const popularTasks = await requestService.getPopularTasks(6);
      const withImages = popularTasks.map((t) => {
        const photoFromList =
          t.photos?.[0]?.url ||
          t.photos?.[0]?.image ||
          t.photos?.[0]?.photo_url;
        const preferred = t.primary_photo_url || photoFromList || null;
        return { ...t, imageUrl: toAbsoluteUrl(preferred) };
      });
      setRequests(withImages);
      setError((prev) => ({ ...prev, requests: null }));
    } catch (err) {
      console.error("Failed to fetch popular requests:", err);
      setError((prev) => ({
        ...prev,
        requests: "failedToLoadPopularRequests",
      }));
      // Clear requests on error
      setRequests([]);
    } finally {
      setLoading((prev) => ({ ...prev, requests: false }));
    }
  };

  // Fetch data from API
  useEffect(() => {
    fetchCategories();
    fetchRequests();
  }, []);
  // Using the centralized getCategoryImage function from constants/categories.js

  return (
    <main
      role="main"
      aria-labelledby="home-page-title"
      style={{ backgroundColor: colors.background.primary, minHeight: "100vh" }}
    >
      {" "}
      {/* Popular Categories Section */}
      <div
        className="mb-12"
        role="region"
        aria-labelledby="popular-categories-title"
      >
        <div className="flex justify-between items-center mb-4">
          <h2
            className="text-2xl font-medium"
            style={{ color: colors.text.primary }}
            id="popular-categories-title"
          >
            {t("home.popularCategories")}
          </h2>
          {categories.length > 4 && (
            <button
              className="text-sm font-medium"
              onClick={() => navigate("/categories")}
              style={{
                color: colors.brand.secondary,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = colors.brand.secondaryHover;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = colors.brand.secondary;
              }}
              onFocus={(e) => {
                e.currentTarget.style.outline = `3px solid ${colors.border.focus}`;
                e.currentTarget.style.outlineOffset = "2px";
              }}
              onBlur={(e) => {
                e.currentTarget.style.outline = "none";
              }}
              aria-label={t("home.viewAllCategories")}
            >
              {t("home.seeAll")}
            </button>
          )}
        </div>

        {loading.categories ? (
          <div
            className="flex justify-center py-12"
            role="status"
            aria-live="polite"
            aria-label={t("home.loadingPopularCategories")}
            aria-busy="true"
          >
            <div
              className="animate-spin rounded-full h-8 w-8 border-b-2"
              style={{ borderColor: colors.brand.primary }}
              aria-hidden="true"
            ></div>
          </div>
        ) : error.categories ? (
          <div className="text-center py-8" role="alert" aria-live="assertive">
            <p
              className="mb-4"
              style={{ color: colors.semantic.error }}
              id="categories-error"
            >
              {t(`home.${error.categories}`)}
            </p>
            <button
              className="px-4 py-2 rounded transition-colors"
              style={{
                backgroundColor: colors.brand.primary,
                color: "#FFFFFF",
              }}
              aria-describedby="categories-error"
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor =
                  colors.brand.primaryHover;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = colors.brand.primary;
              }}
              onFocus={(e) => {
                e.currentTarget.style.outline = `3px solid ${colors.border.focus}`;
                e.currentTarget.style.outlineOffset = "2px";
              }}
              onBlur={(e) => {
                e.currentTarget.style.outline = "none";
              }}
              onClick={fetchCategories}
            >
              {t("home.tryAgain")}
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
                <p style={{ color: colors.text.secondary }}>
                  {t("home.noCategoriesAvailable")}
                </p>
              </div>
            )}
          </div>
        )}
      </div>{" "}
      {/* Popular Requests Section */}
      <div
        className="mb-12"
        role="region"
        aria-labelledby="popular-requests-title"
      >
        <div className="flex justify-between items-center mb-4">
          <h2
            className="text-2xl font-medium"
            style={{ color: colors.text.primary }}
            id="popular-requests-title"
          >
            {t("home.popularRequests")}
          </h2>
          {requests.length > 6 && (
            <button
              className="text-sm font-medium"
              onClick={() => navigate("/requests")}
              style={{
                color: colors.brand.secondary,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = colors.brand.secondaryHover;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = colors.brand.secondary;
              }}
              onFocus={(e) => {
                e.currentTarget.style.outline = `3px solid ${colors.border.focus}`;
                e.currentTarget.style.outlineOffset = "2px";
              }}
              onBlur={(e) => {
                e.currentTarget.style.outline = "none";
              }}
              aria-label={t("home.viewAllRequests")}
            >
              {t("home.seeAll")}
            </button>
          )}
        </div>

        {loading.requests ? (
          <div
            className="flex justify-center py-12"
            role="status"
            aria-live="polite"
            aria-label={t("home.loadingPopularRequests")}
            aria-busy="true"
          >
            <div
              className="animate-spin rounded-full h-8 w-8 border-b-2"
              style={{ borderColor: colors.brand.primary }}
              aria-hidden="true"
            ></div>
          </div>
        ) : error.requests ? (
          <div className="text-center py-8" role="alert" aria-live="assertive">
            <p
              className="mb-4"
              style={{ color: colors.semantic.error }}
              id="requests-error"
            >
              {t(`home.${error.requests}`)}
            </p>
            <button
              className="px-4 py-2 rounded transition-colors"
              style={{
                backgroundColor: colors.brand.primary,
                color: "#FFFFFF",
              }}
              aria-describedby="requests-error"
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor =
                  colors.brand.primaryHover;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = colors.brand.primary;
              }}
              onFocus={(e) => {
                e.currentTarget.style.outline = `3px solid ${colors.border.focus}`;
                e.currentTarget.style.outlineOffset = "2px";
              }}
              onBlur={(e) => {
                e.currentTarget.style.outline = "none";
              }}
              onClick={fetchRequests}
            >
              {t("home.tryAgain")}
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
                <p style={{ color: colors.text.secondary }}>
                  {t("home.noRequestsAvailable")}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
      {/* Page Title for landmark association */}
      <h1 id="home-page-title" className="sr-only">
        {t("home.pageTitle")}
      </h1>
    </main>
  );
};

export default Home;
