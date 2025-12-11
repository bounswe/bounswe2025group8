import React, { forwardRef, useImperativeHandle } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useForm, Controller } from "react-hook-form";
import { useTranslation } from "react-i18next";
import {
  updateFormData,
  incrementRequiredPeople,
  decrementRequiredPeople,
} from "../features/request/store/createRequestSlice";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import CreateIcon from "@mui/icons-material/Create";
import { urgencyLevels } from "../constants/urgency_level";
import { useTheme } from "../hooks/useTheme";

const GeneralInformationStep = (props, ref) => {
  const dispatch = useDispatch();
  const { formData, categories } = useSelector((state) => state.createRequest);
  const { colors } = useTheme();
  const { t } = useTranslation();

  const {
    control,
    handleSubmit,
    formState: { errors },
    trigger,
  } = useForm({
    mode: "onChange",
    shouldFocusError: true,
    defaultValues: {
      title: formData.title,
      description: formData.description,
      category: formData.category,
      urgency: formData.urgency,
      requiredPeople: formData.requiredPeople,
    },
  });

  useImperativeHandle(ref, () => ({
    async validateForm() {
      const isValid = await trigger(["title", "description"]);
      if (!isValid)
        console.log(
          "Validation failed: title/description missing or too short"
        );
      return isValid;
    },
  }));

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
      <form
        onSubmit={handleSubmit(onSubmit)}
        aria-describedby={
          errors && (errors.title || errors.description)
            ? "general-info-errors"
            : undefined
        }
      >
        <div className="flex flex-col md:flex-row gap-6 mb-8">
          {/* Left Column */}
          <div className="flex-1">
            {/* Title */}
            <div className="mb-6">
              <label
                htmlFor="title"
                className="text-sm font-bold mb-2"
                style={{ color: colors.text.primary }}
              >
                {t("generalInformationStep.title")}
              </label>
              <Controller
                name="title"
                control={control}
                rules={{
                  required: {
                    value: true,
                    message: t("generalInformationStep.titleRequired"),
                  },
                  minLength: {
                    value: 3,
                    message: t("generalInformationStep.titleMinLength"),
                  },
                }}
                render={({ field }) => (
                  <>
                    <div className="relative mb-1">
                      <div className="absolute left-0 top-1/2 -translate-y-1/2 pl-3 flex items-center pointer-events-none">
                        <CreateIcon
                          sx={{ color: colors.brand.primary }}
                          aria-hidden="true"
                        />
                      </div>
                      <input
                        {...field}
                        type="text"
                        id="title"
                        className={`w-full pl-12 pr-3 py-3 border rounded-md focus:outline-none focus:ring-2 focus:border-transparent ${
                          errors.title ? "border-red-500" : "border-gray-300"
                        }`}
                        style={{
                          backgroundColor: colors.background.secondary,
                          color: colors.text.primary,
                          borderColor: errors.title
                            ? colors.semantic.error
                            : colors.border.primary,
                        }}
                        placeholder={t(
                          "generalInformationStep.titlePlaceholder"
                        )}
                        onChange={(e) => {
                          field.onChange(e);
                          handleFieldChange("title", e.target.value);
                          trigger("title");
                        }}
                        onFocus={(e) =>
                          (e.target.style.boxShadow = `0 0 0 2px ${colors.brand.primary}40`)
                        }
                        onBlur={(e) => {
                          trigger("title");
                          e.target.style.boxShadow = "none";
                        }}
                        aria-required="true"
                        aria-invalid={errors.title ? "true" : "false"}
                        aria-describedby={
                          errors.title ? "title-error" : undefined
                        }
                      />
                    </div>
                    {errors.title && (
                      <p
                        className="mt-1 text-sm"
                        style={{ color: colors.semantic.error }}
                        role="alert"
                        aria-live="assertive"
                        id="title-error"
                      >
                        {errors.title.message}
                      </p>
                    )}
                  </>
                )}
              />
            </div>
            {/* Category */}
            <div className="mb-6">
              <label
                htmlFor="category"
                className="text-sm font-bold mb-2"
                style={{ color: colors.text.primary }}
              >
                {t("generalInformationStep.category")}
              </label>
              <Controller
                name="category"
                control={control}
                render={({ field }) => (
                  <select
                    {...field}
                    id="category"
                    className="w-full px-3 py-3 border rounded-md focus:outline-none focus:ring-2 focus:border-transparent"
                    style={{
                      backgroundColor: colors.background.secondary,
                      color: colors.text.primary,
                      borderColor: colors.border.primary,
                    }}
                    onChange={(e) => {
                      field.onChange(e);
                      handleFieldChange("category", e.target.value);
                    }}
                    onFocus={(e) =>
                      (e.target.style.boxShadow = `0 0 0 2px ${colors.brand.primary}40`)
                    }
                    onBlur={(e) => (e.target.style.boxShadow = "none")}
                    aria-required="true"
                  >
                    {/* Add "Other" as a fallback option even if API doesn't return it */}
                    <option value="OTHER">
                      {t("generalInformationStep.otherServices")}
                    </option>
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
              <label
                htmlFor="description"
                className="text-sm font-bold mb-2"
                style={{ color: colors.text.primary }}
              >
                {t("generalInformationStep.description")}
              </label>
              <Controller
                name="description"
                control={control}
                rules={{
                  required: {
                    value: true,
                    message: t("generalInformationStep.descriptionRequired"),
                  },
                  minLength: {
                    value: 10,
                    message: t("generalInformationStep.descriptionMinLength"),
                  },
                }}
                render={({ field }) => (
                  <div>
                    <textarea
                      {...field}
                      id="description"
                      rows={1}
                      className={`w-full px-3 py-3 border rounded-md focus:outline-none focus:ring-2 focus:border-transparent resize-vertical ${
                        errors.description
                          ? "border-red-500"
                          : "border-gray-300"
                      }`}
                      style={{
                        backgroundColor: colors.background.secondary,
                        color: colors.text.primary,
                        borderColor: errors.description
                          ? colors.semantic.error
                          : colors.border.primary,
                      }}
                      placeholder={t(
                        "generalInformationStep.descriptionPlaceholder"
                      )}
                      onChange={(e) => {
                        field.onChange(e);
                        handleFieldChange("description", e.target.value);
                        trigger("description");
                      }}
                      onFocus={(e) =>
                        (e.target.style.boxShadow = `0 0 0 2px ${colors.brand.primary}40`)
                      }
                      onBlur={(e) => {
                        trigger("description");
                        e.target.style.boxShadow = "none";
                      }}
                      aria-required="true"
                      aria-invalid={errors.description ? "true" : "false"}
                      aria-describedby={
                        errors.description ? "description-error" : undefined
                      }
                    />
                    {errors.description && (
                      <p
                        className="mt-1 text-sm"
                        style={{ color: colors.semantic.error }}
                        role="alert"
                        aria-live="assertive"
                        id="description-error"
                      >
                        {errors.description.message}
                      </p>
                    )}
                  </div>
                )}
              />
            </div>

            {/* Urgency */}
            <div className="mb-6">
              <label
                htmlFor="urgency"
                className="text-sm font-bold mb-2"
                style={{ color: colors.text.primary }}
              >
                {t("generalInformationStep.urgency")}
              </label>
              <Controller
                name="urgency"
                control={control}
                render={({ field }) => (
                  <select
                    {...field}
                    id="urgency"
                    className="w-full px-3 py-3 border rounded-md focus:outline-none focus:ring-2 focus:border-transparent"
                    style={{
                      backgroundColor: colors.background.secondary,
                      color: colors.text.primary,
                      borderColor: colors.border.primary,
                    }}
                    onChange={(e) => {
                      field.onChange(e);
                      handleFieldChange("urgency", e.target.value);
                    }}
                    onFocus={(e) =>
                      (e.target.style.boxShadow = `0 0 0 2px ${colors.brand.primary}40`)
                    }
                    onBlur={(e) => (e.target.style.boxShadow = "none")}
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
          <label
            className="text-sm font-bold mb-2 text-left"
            style={{ color: colors.text.primary }}
            htmlFor="required-people"
          >
            {t("generalInformationStep.requiredPeople")}
          </label>
          <div className="flex items-center">
            <button
              type="button"
              onClick={() => dispatch(decrementRequiredPeople())}
              disabled={formData.requiredPeople <= 1}
              className="hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed rounded p-2 transition-colors"
              style={{
                backgroundColor:
                  formData.requiredPeople <= 1
                    ? colors.interactive.disabled
                    : colors.background.secondary,
              }}
              onMouseOver={(e) =>
                formData.requiredPeople > 1 &&
                (e.currentTarget.style.backgroundColor =
                  colors.interactive.hover)
              }
              onMouseOut={(e) =>
                formData.requiredPeople > 1 &&
                (e.currentTarget.style.backgroundColor =
                  colors.background.secondary)
              }
              aria-label={t("generalInformationStep.decreaseRequiredPeople")}
            >
              <RemoveIcon
                sx={{ color: colors.text.primary }}
                aria-hidden="true"
              />
            </button>

            <span
              className="mx-4 w-8 text-center font-bold"
              style={{ color: colors.text.primary }}
              id="required-people"
              role="status"
              aria-live="polite"
            >
              {formData.requiredPeople}
            </span>

            <button
              type="button"
              onClick={() => dispatch(incrementRequiredPeople())}
              className="rounded p-2 transition-colors"
              style={{
                backgroundColor: colors.brand.primary,
                color: "#FFFFFF",
              }}
              onMouseOver={(e) =>
                (e.currentTarget.style.backgroundColor =
                  colors.brand.primaryHover)
              }
              onMouseOut={(e) =>
                (e.currentTarget.style.backgroundColor = colors.brand.primary)
              }
              aria-label={t("generalInformationStep.increaseRequiredPeople")}
            >
              <AddIcon aria-hidden="true" />
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default forwardRef(GeneralInformationStep);
