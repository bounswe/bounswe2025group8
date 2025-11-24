import React, {
  useState,
  useEffect,
  forwardRef,
  useImperativeHandle,
} from "react";
import { useSelector, useDispatch } from "react-redux";
import { useForm, Controller } from "react-hook-form";
import { updateFormData } from "../features/request/store/createRequestSlice";
import { Country, State, City } from "country-state-city";
import { useTheme } from "../hooks/useTheme";

const SetupAddressStep = (props, ref) => {
  const { colors } = useTheme();
  const dispatch = useDispatch();
  const { formData } = useSelector((state) => state.createRequest);

  // State for location data
  const [countries] = useState(() => Country.getAllCountries());
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  const [error, setError] = useState(null);
  const {
    control,
    handleSubmit,
    watch,
    formState: { errors },
    setValue,
    trigger,
  } = useForm({
    defaultValues: {
      country: formData.country || "",
      state: formData.state || "",
      city: formData.city || "",
      neighborhood: formData.neighborhood || "",
      street: formData.street || "",
      buildingNo: formData.buildingNo || "",
      doorNo: formData.doorNo || "",
      addressDescription: formData.addressDescription || "",
    },
  });

  // Watch country, state, and city values for filtering
  const watchCountry = watch("country");
  const watchState = watch("state");
  const watchCity = watch("city");

  // Update states when country changes
  useEffect(() => {
    if (!watchCountry) {
      setStates([]);
      return;
    }

    try {
      setError(null);
      const statesData = State.getStatesOfCountry(watchCountry);
      setStates(statesData);
    } catch (err) {
      console.error("Error loading states/provinces:", err);
      setError("Failed to load states/provinces. Please try again later.");
      setStates([]);
    }
  }, [watchCountry]);

  // Update cities when state changes
  useEffect(() => {
    if (!watchCountry || !watchState) {
      setCities([]);
      return;
    }

    try {
      setError(null);
      const citiesData = City.getCitiesOfState(watchCountry, watchState);
      setCities(citiesData);
    } catch (err) {
      console.error("Error loading cities:", err);
      setError("Failed to load cities. Please try again later.");
      setCities([]);
    }
  }, [watchCountry, watchState]);
  // Auto-save form data happens when fields change (handled by handleFieldChange)
  // Auto-save form data when fields change
  const handleFieldChange = (field, value) => {
    dispatch(updateFormData({ [field]: value }));
  };

  // Expose a validate method to parent using ref (to block submission when invalid)
  useImperativeHandle(ref, () => ({
    async validateForm() {
      // Validate the required address fields
      const isValid = await trigger(["country", "state", "city"]);
      return isValid;
    },
  }));

  return (
    <div className="w-full">
      {error && (
        <div
          className="border px-4 py-3 rounded mb-4"
          style={{
            backgroundColor: colors.semantic.errorBackground,
            borderColor: colors.semantic.error,
            color: colors.semantic.error,
          }}
          role="alert"
          aria-live="assertive"
        >
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit((data) => dispatch(updateFormData(data)))}>
        {/* Country | State/Province */}
        <div className="flex flex-col md:flex-row gap-6 mb-6">
          {/* Country */}
          <div className="flex-1">
            <label
              htmlFor="country-select"
              className="text-sm font-bold mb-2 block"
              style={{ color: colors.text.primary }}
            >
              Country
            </label>
            <Controller
              name="country"
              control={control}
              rules={{ required: "Country is required" }}
              render={({ field }) => (
                <div>
                  <div className="relative">
                    <select
                      {...field}
                      id="country-select"
                      className="w-full px-3 py-3 border rounded-md focus:outline-none"
                      style={{
                        backgroundColor: colors.background.secondary,
                        color: colors.text.primary,
                        borderColor: errors.country
                          ? colors.semantic.error
                          : colors.border.primary,
                      }}
                      aria-required="true"
                      aria-invalid={errors.country ? "true" : "false"}
                      aria-describedby={
                        errors.country ? "country-error" : undefined
                      }
                      onFocus={(e) =>
                        (e.target.style.boxShadow = `0 0 0 2px ${colors.brand.primary}40`)
                      }
                      onBlur={(e) => {
                        field.onBlur();
                        e.target.style.boxShadow = "none";
                      }}
                      onChange={(e) => {
                        field.onChange(e);
                        handleFieldChange("country", e.target.value);
                        // Reset state and city when country changes
                        setValue("state", "");
                        setValue("city", "");
                        handleFieldChange("state", "");
                        handleFieldChange("city", "");
                      }}
                    >
                      <option value="">Select Country</option>
                      {countries.map((country) => (
                        <option key={country.isoCode} value={country.isoCode}>
                          {country.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  {errors.country && (
                    <p
                      className="mt-1 text-sm"
                      style={{ color: colors.semantic.error }}
                      id="country-error"
                    >
                      {errors.country.message}
                    </p>
                  )}
                </div>
              )}
            />
          </div>

          {/* State/Province */}
          <div className="flex-1">
            <label
              htmlFor="state-select"
              className="text-sm font-bold mb-2 block"
              style={{ color: colors.text.primary }}
            >
              State/Province
            </label>
            <Controller
              name="state"
              control={control}
              rules={{ required: "State/Province is required" }}
              render={({ field }) => (
                <div>
                  <div className="relative">
                    <select
                      {...field}
                      id="state-select"
                      className="w-full px-3 py-3 border rounded-md focus:outline-none"
                      style={{
                        backgroundColor: colors.background.secondary,
                        color: colors.text.primary,
                        borderColor: errors.state
                          ? colors.semantic.error
                          : colors.border.primary,
                      }}
                      aria-required="true"
                      aria-invalid={errors.state ? "true" : "false"}
                      aria-describedby={
                        errors.state ? "state-error" : undefined
                      }
                      onFocus={(e) =>
                        (e.target.style.boxShadow = `0 0 0 2px ${colors.brand.primary}40`)
                      }
                      onBlur={(e) => {
                        field.onBlur();
                        e.target.style.boxShadow = "none";
                      }}
                      disabled={!watchCountry}
                      onChange={(e) => {
                        field.onChange(e);
                        handleFieldChange("state", e.target.value);
                        // Reset city when state changes
                        setValue("city", "");
                        handleFieldChange("city", "");
                      }}
                    >
                      <option value="">Select State/Province</option>
                      {states.map((state) => (
                        <option
                          key={state.isoCode}
                          value={state.isoCode}
                        >
                          {state.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  {errors.state && (
                    <p
                      className="mt-1 text-sm"
                      style={{ color: colors.semantic.error }}
                      id="state-error"
                    >
                      {errors.state.message}
                    </p>
                  )}
                </div>
              )}
            />
          </div>
        </div>{" "}
        {/* City */}
        <div className="flex flex-col md:flex-row gap-6 mb-6">
          <div className="flex-1">
            <label
              htmlFor="city-select"
              className="text-sm font-bold mb-2 block"
              style={{ color: colors.text.primary }}
            >
              City/District
            </label>
            <Controller
              name="city"
              control={control}
              rules={{ required: "City/District is required" }}
              render={({ field }) => (
                <div>
                  <div className="relative">
                    <select
                      {...field}
                      id="city-select"
                      className="w-full px-3 py-3 border rounded-md focus:outline-none"
                      style={{
                        backgroundColor: colors.background.secondary,
                        color: colors.text.primary,
                        borderColor: errors.city
                          ? colors.semantic.error
                          : colors.border.primary,
                      }}
                      aria-required="true"
                      aria-invalid={errors.city ? "true" : "false"}
                      aria-describedby={errors.city ? "city-error" : undefined}
                      onFocus={(e) =>
                        (e.target.style.boxShadow = `0 0 0 2px ${colors.brand.primary}40`)
                      }
                      onBlur={(e) => {
                        field.onBlur();
                        e.target.style.boxShadow = "none";
                      }}
                      disabled={!watchState}
                      onChange={(e) => {
                        field.onChange(e);
                        handleFieldChange("city", e.target.value);
                      }}
                    >
                      <option value="">Select City</option>
                      {cities.map((city) => (
                        <option key={city.name} value={city.name}>
                          {city.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  {errors.city && (
                    <p
                      className="mt-1 text-sm"
                      style={{ color: colors.semantic.error }}
                      id="city-error"
                    >
                      {errors.city.message}
                    </p>
                  )}
                </div>
              )}
            />
          </div>
        </div>
        {/* Neighborhood | Street */}
        <div className="flex flex-col md:flex-row gap-6 mb-6">
          {/* Neighborhood */}
          <div className="flex-1">
            <label
              htmlFor="neighborhood-input"
              className="text-sm font-bold mb-2 block"
              style={{ color: colors.text.primary }}
            >
              Neighborhood
            </label>
            <Controller
              name="neighborhood"
              control={control}
              render={({ field }) => (
                <input
                  {...field}
                  type="text"
                  id="neighborhood-input"
                  className="w-full px-3 py-3 border rounded-md focus:outline-none disabled:cursor-not-allowed"
                  style={{
                    backgroundColor: !watchCity
                      ? colors.interactive.disabled
                      : colors.background.secondary,
                    color: colors.text.primary,
                    borderColor: colors.border.primary,
                  }}
                  onFocus={(e) =>
                    (e.target.style.boxShadow = `0 0 0 2px ${colors.brand.primary}40`)
                  }
                  onBlur={(e) => (e.target.style.boxShadow = "none")}
                  placeholder="Enter neighborhood"
                  disabled={!watchCity}
                  onChange={(e) => {
                    field.onChange(e);
                    handleFieldChange("neighborhood", e.target.value);
                  }}
                />
              )}
            />
          </div>

          {/* Street */}
          <div className="flex-1">
            <label
              htmlFor="street-input"
              className="text-sm font-bold mb-2 block"
              style={{ color: colors.text.primary }}
            >
              Street
            </label>
            <Controller
              name="street"
              control={control}
              render={({ field }) => (
                <input
                  {...field}
                  type="text"
                  id="street-input"
                  className="w-full px-3 py-3 border rounded-md focus:outline-none disabled:cursor-not-allowed"
                  style={{
                    backgroundColor: !watchCity
                      ? colors.interactive.disabled
                      : colors.background.secondary,
                    color: colors.text.primary,
                    borderColor: colors.border.primary,
                  }}
                  onFocus={(e) =>
                    (e.target.style.boxShadow = `0 0 0 2px ${colors.brand.primary}40`)
                  }
                  onBlur={(e) => (e.target.style.boxShadow = "none")}
                  placeholder="Enter street"
                  disabled={!watchCity}
                  onChange={(e) => {
                    field.onChange(e);
                    handleFieldChange("street", e.target.value);
                  }}
                />
              )}
            />
          </div>
        </div>
        {/* Building No | Door No */}
        <div className="flex flex-col md:flex-row gap-6 mb-6">
          {/* Building No */}
          <div className="flex-1">
            <label
              htmlFor="building-input"
              className="text-sm font-bold mb-2 block"
              style={{ color: colors.text.primary }}
            >
              Building Number
            </label>
            <Controller
              name="buildingNo"
              control={control}
              render={({ field }) => (
                <input
                  {...field}
                  type="text"
                  id="building-input"
                  className="w-full px-3 py-3 border rounded-md focus:outline-none"
                  style={{
                    backgroundColor: colors.background.secondary,
                    color: colors.text.primary,
                    borderColor: colors.border.primary,
                  }}
                  onFocus={(e) =>
                    (e.target.style.boxShadow = `0 0 0 2px ${colors.brand.primary}40`)
                  }
                  onBlur={(e) => (e.target.style.boxShadow = "none")}
                  placeholder="e.g. 14"
                  onChange={(e) => {
                    field.onChange(e);
                    handleFieldChange("buildingNo", e.target.value);
                  }}
                />
              )}
            />
          </div>

          {/* Door No */}
          <div className="flex-1">
            <label
              htmlFor="door-input"
              className="text-sm font-bold mb-2 block"
              style={{ color: colors.text.primary }}
            >
              Door / Apartment Number
            </label>
            <Controller
              name="doorNo"
              control={control}
              render={({ field }) => (
                <input
                  {...field}
                  type="text"
                  id="door-input"
                  className="w-full px-3 py-3 border rounded-md focus:outline-none"
                  style={{
                    backgroundColor: colors.background.secondary,
                    color: colors.text.primary,
                    borderColor: colors.border.primary,
                  }}
                  onFocus={(e) =>
                    (e.target.style.boxShadow = `0 0 0 2px ${colors.brand.primary}40`)
                  }
                  onBlur={(e) => (e.target.style.boxShadow = "none")}
                  placeholder="e.g. 5"
                  onChange={(e) => {
                    field.onChange(e);
                    handleFieldChange("doorNo", e.target.value);
                  }}
                />
              )}
            />
          </div>
        </div>
        {/* Additional Address Details */}
        <div className="mb-6">
          <label
            htmlFor="address-description"
            className="text-sm font-bold mb-2 block"
            style={{ color: colors.text.primary }}
          >
            Additional Address Details
          </label>
          <Controller
            name="addressDescription"
            control={control}
            render={({ field }) => (
              <textarea
                {...field}
                id="address-description"
                rows={4}
                className="w-full px-3 py-3 border rounded-md focus:outline-none resize-vertical"
                style={{
                  backgroundColor: colors.background.secondary,
                  color: colors.text.primary,
                  borderColor: colors.border.primary,
                }}
                onFocus={(e) =>
                  (e.target.style.boxShadow = `0 0 0 2px ${colors.brand.primary}40`)
                }
                onBlur={(e) => (e.target.style.boxShadow = "none")}
                placeholder="Add any additional details for finding the address..."
                onChange={(e) => {
                  field.onChange(e);
                  handleFieldChange("addressDescription", e.target.value);
                }}
              />
            )}
          />
        </div>
      </form>
    </div>
  );
};

export default forwardRef(SetupAddressStep);
