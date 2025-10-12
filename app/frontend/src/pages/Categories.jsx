import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import CategoryCardDetailed from "../components/CategoryCardDetailed";
import * as categoryService from "../features/category/services/categoryService";
import { getCategoryImage, categoryMapping } from "../constants/categories";

const Categories = () => {
  const navigate = useNavigate();
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
        setError("Failed to load categories. Please try again later.");
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
    <>
      <div className="">
        <h1 className="text-4xl font-normal mb-4">Categories</h1>
        <p className="text-base text-gray-600 mb-4">
          Browse available service categories and find help with your tasks
        </p>
      </div>

      <hr className="my-8 border-gray-200" />

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : error ? (
        <div className="mt-8">
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
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
              <p className="text-gray-500">No categories available</p>
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default Categories;
