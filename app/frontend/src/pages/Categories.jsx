import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import CategoryCardDetailed from "../components/CategoryCardDetailed";
import * as categoryService from "../features/category/services/categoryService.js";
import { getCategoryImage, categoryMapping } from "../constants/categories";

const Categories = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCategories = async () => {
      setLoading(true);
      try {
        const categoriesData = await categoryService.getCategories();

        // Transform API response to match UI component expectations
        const formattedCategories = categoriesData.map((category) => ({
          id: category.value,
          title: categoryMapping[category.value] || category.name,
          image: getCategoryImage(category.value),
          requestCount: category.task_count || 0,
        }));

        setCategories(formattedCategories);
        setError(null);
      } catch (err) {
        console.error("Failed to fetch categories:", err);
        setError("failedToLoadCategoriesLater");
        // Clear categories on error
        setCategories([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  const handleCategoryClick = (categoryId) => {
    // Navigate to requests filtered by this category
    navigate(`/requests?category=${categoryId}`);
  };

  return (
    <main role="main" aria-labelledby="categories-title">
      <div className="">
        <h1 className="text-4xl font-normal mb-4" id="categories-title">
          {t("categories")}
        </h1>
        <p className="text-base text-gray-600 mb-4">{t("browseCategories")}</p>
      </div>

      <hr className="my-8 border-gray-200" />

      {loading ? (
        <div
          className="flex justify-center py-12"
          role="status"
          aria-busy="true"
        >
          <div
            className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"
            aria-hidden="true"
          ></div>
        </div>
      ) : error ? (
        <div className="mt-8" role="alert" aria-live="assertive">
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {t(error)}
          </div>
        </div>
      ) : (
        /* All Categories in Detailed Format */
        <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8 mt-4 justify-items-center">
          {categories.length > 0 ? (
            categories.map((category) => (
              <div key={category.id} className="w-full">
                <CategoryCardDetailed
                  title={category.title}
                  imageUrl={category.image}
                  requestCount={category.requestCount}
                  categoryId={category.id}
                  onClick={() => handleCategoryClick(category.id)}
                />
              </div>
            ))
          ) : (
            <div className="col-span-full w-full text-center py-12">
              <p className="text-gray-500">{t("noCategoriesAvailable")}</p>
            </div>
          )}
        </div>
      )}
    </main>
  );
};

export default Categories;
