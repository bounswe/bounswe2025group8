import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { useForm, Controller } from "react-hook-form";
import {
  updateFormData,
  incrementRequiredPeople,
  decrementRequiredPeople,
} from "../features/request/store/createRequestSlice";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import CreateIcon from "@mui/icons-material/Create";
import { urgencyLevels } from "../constants/urgency_level";

const GeneralInformationStep = () => {
  const dispatch = useDispatch();
  const { formData, categories } = useSelector((state) => state.createRequest);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      title: formData.title,
      description: formData.description,
      category: formData.category,
      urgency: formData.urgency,
      requiredPeople: formData.requiredPeople,
    },
  });

  // Handle form data changes
  const onSubmit = (data) => {
    dispatch(updateFormData(data));
  };

  // Auto-save form data when fields change
  const handleFieldChange = (field, value) => {
    dispatch(updateFormData({ [field]: value }));
  };

  return (
    <div className="w-full">
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="flex flex-col md:flex-row gap-6 mb-8">
          {/* Left Column */}
          <div className="flex-1">
            {/* Title */}
            <div className="mb-6">
              <h3 className="text-sm font-bold mb-2">Title</h3>
              <Controller
                name="title"
                control={control}
                rules={{
                  required: "Title is required",
                  minLength: {
                    value: 3,
                    message: "Title must be at least 3 characters",
                  },
                }}
                render={({ field }) => (
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <CreateIcon sx={{ color: "#5C69FF" }} />
                    </div>
                    <input
                      {...field}
                      type="text"
                      className={`w-full pl-12 pr-3 py-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        errors.title ? "border-red-500" : "border-gray-300"
                      }`}
                      placeholder="Help me to see a doctor"
                      onChange={(e) => {
                        field.onChange(e);
                        handleFieldChange("title", e.target.value);
                      }}
                    />
                    {errors.title && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.title.message}
                      </p>
                    )}
                  </div>
                )}
              />
            </div>
            {/* Category */}
            <div className="mb-6">
              <h3 className="text-sm font-bold mb-2">Category</h3>
              <Controller
                name="category"
                control={control}
                render={({ field }) => (
                  <select
                    {...field}
                    className="w-full px-3 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                    onChange={(e) => {
                      field.onChange(e);
                      handleFieldChange("category", e.target.value);
                    }}
                  >
                    {/* Add "Other" as a fallback option even if API doesn't return it */}
                    <option value="OTHER">Other Services</option>
                    {categories.map((category) => (
                      <option key={category.value} value={category.value}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                )}
              />
            </div>
          </div>

          {/* Right Column */}
          <div className="flex-1">
            {/* Description */}
            <div className="mb-6">
              <h3 className="text-sm font-bold mb-2">Description</h3>
              <Controller
                name="description"
                control={control}
                rules={{
                  required: "Description is required",
                }}
                render={({ field }) => (
                  <div>
                    <textarea
                      {...field}
                      rows={1}
                      className={`w-full px-3 py-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-vertical ${
                        errors.description
                          ? "border-red-500"
                          : "border-gray-300"
                      }`}
                      placeholder="Input text"
                      onChange={(e) => {
                        field.onChange(e);
                        handleFieldChange("description", e.target.value);
                      }}
                    />
                    {errors.description && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.description.message}
                      </p>
                    )}
                  </div>
                )}
              />
            </div>

            {/* Urgency */}
            <div className="mb-6">
              <h3 className="text-sm font-bold mb-2">Urgency</h3>
              <Controller
                name="urgency"
                control={control}
                render={({ field }) => (
                  <select
                    {...field}
                    className="w-full px-3 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                    onChange={(e) => {
                      field.onChange(e);
                      handleFieldChange("urgency", e.target.value);
                    }}
                  >
                    {Object.entries(urgencyLevels).map(([key, value]) => (
                      <option key={key} value={key}>
                        {value.name}
                      </option>
                    ))}
                  </select>
                )}
              />
            </div>
          </div>
        </div>

        {/* Required number of people - Full width */}
        <div className="mb-6">
          <h3 className="text-sm font-bold mb-2 text-left">
            Required number of people
          </h3>
          <div className="flex items-center">
            <button
              type="button"
              onClick={() => dispatch(decrementRequiredPeople())}
              disabled={formData.requiredPeople <= 1}
              className="bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed rounded p-2 transition-colors"
            >
              <RemoveIcon />
            </button>

            <span className="mx-4 w-8 text-center font-bold">
              {formData.requiredPeople}
            </span>

            <button
              type="button"
              onClick={() => dispatch(incrementRequiredPeople())}
              className="bg-blue-600 hover:bg-blue-700 text-white rounded p-2 transition-colors"
            >
              <AddIcon />
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default GeneralInformationStep;
