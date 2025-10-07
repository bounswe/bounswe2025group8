import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useForm, Controller } from "react-hook-form";
import { updateFormData } from "../features/request/store/createRequestSlice";
import * as createRequestService from "../features/request/services/createRequestService";

const SetupAddressStep = () => {
  const dispatch = useDispatch();
  const { formData } = useSelector((state) => state.createRequest);

  // State for location data
  const [countries, setCountries] = useState([]);
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  const [loading, setLoading] = useState({
    countries: false,
    states: false,
    cities: false,
  });
  const [error, setError] = useState(null);
  const {
    control,
    handleSubmit,
    watch,
    formState: { errors },
    setValue,
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

  // Fetch countries when component mounts
  useEffect(() => {
    const fetchCountryData = async () => {
      try {
        setLoading((prev) => ({ ...prev, countries: true }));
        setError(null);
        const countriesData = await createRequestService.fetchCountries();
        setCountries(countriesData);
      } catch (err) {
        console.error("Error fetching countries:", err);
        setError("Failed to load countries. Please try again later.");
      } finally {
        setLoading((prev) => ({ ...prev, countries: false }));
      }
    };

    fetchCountryData();
  }, []);

  // Fetch states when country changes
  useEffect(() => {
    if (!watchCountry) {
      setStates([]);
      return;
    }

    const fetchStateData = async () => {
      try {
        setLoading((prev) => ({ ...prev, states: true }));
        setError(null);

        // Get the country code from the selected country value
        const selectedCountry = countries.find((c) => c.code === watchCountry);
        if (!selectedCountry) return;

        const statesData = await createRequestService.fetchStates(
          selectedCountry.name
        );
        setStates(statesData);
      } catch (err) {
        console.error("Error fetching states/provinces:", err);
        setError("Failed to load states/provinces. Please try again later.");
      } finally {
        setLoading((prev) => ({ ...prev, states: false }));
      }
    };

    fetchStateData();
  }, [watchCountry, countries]);

  // Fetch cities when state changes
  useEffect(() => {
    if (!watchCountry || !watchState) {
      setCities([]);
      return;
    }

    const fetchCityData = async () => {
      try {
        setLoading((prev) => ({ ...prev, cities: true }));
        setError(null);

        // Get the country name from the selected country code
        const selectedCountry = countries.find((c) => c.code === watchCountry);
        if (!selectedCountry) return;

        const citiesData = await createRequestService.fetchCities(
          selectedCountry.name,
          watchState
        );
        setCities(citiesData);
      } catch (err) {
        console.error("Error fetching cities:", err);
        setError("Failed to load cities. Please try again later.");
      } finally {
        setLoading((prev) => ({ ...prev, cities: false }));
      }
    };

    fetchCityData();
  }, [watchCountry, watchState, countries]);
  // Auto-save form data happens when fields change (handled by handleFieldChange)
  // Auto-save form data when fields change
  const handleFieldChange = (field, value) => {
    dispatch(updateFormData({ [field]: value }));
  };

  return (
    <div className="w-full">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit((data) => dispatch(updateFormData(data)))}>
        {/* Country | State/Province */}
        <div className="flex flex-col md:flex-row gap-6 mb-6">
          {/* Country */}
          <div className="flex-1">
            <h3 className="text-sm font-bold mb-2">Country</h3>
            <Controller
              name="country"
              control={control}
              rules={{ required: "Country is required" }}
              render={({ field }) => (
                <div>
                  <div className="relative">
                    {loading.countries && (
                      <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                      </div>
                    )}
                    <select
                      {...field}
                      className={`w-full px-3 py-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white ${
                        loading.countries ? "pl-12" : ""
                      } ${
                        errors.country ? "border-red-500" : "border-gray-300"
                      }`}
                      disabled={loading.countries}
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
                        <option key={country.code} value={country.code}>
                          {country.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  {errors.country && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.country.message}
                    </p>
                  )}
                </div>
              )}
            />
          </div>

          {/* State/Province */}
          <div className="flex-1">
            <h3 className="text-sm font-bold mb-2">State/Province</h3>
            <Controller
              name="state"
              control={control}
              rules={{ required: "State/Province is required" }}
              render={({ field }) => (
                <div>
                  <div className="relative">
                    {loading.states && (
                      <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                      </div>
                    )}
                    <select
                      {...field}
                      className={`w-full px-3 py-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white ${
                        loading.states ? "pl-12" : ""
                      } ${errors.state ? "border-red-500" : "border-gray-300"}`}
                      disabled={!watchCountry || loading.states}
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
                          key={state.code || state.name}
                          value={state.name}
                        >
                          {state.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  {errors.state && (
                    <p className="mt-1 text-sm text-red-600">
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
            <h3 className="text-sm font-bold mb-2">City/District</h3>
            <Controller
              name="city"
              control={control}
              rules={{ required: "City is required" }}
              render={({ field }) => (
                <div>
                  <div className="relative">
                    {loading.cities && (
                      <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                      </div>
                    )}
                    <select
                      {...field}
                      className={`w-full px-3 py-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white ${
                        loading.cities ? "pl-12" : ""
                      } ${errors.city ? "border-red-500" : "border-gray-300"}`}
                      disabled={!watchState || loading.cities}
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
                    <p className="mt-1 text-sm text-red-600">
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
            <h3 className="text-sm font-bold mb-2">Neighborhood</h3>
            <Controller
              name="neighborhood"
              control={control}
              render={({ field }) => (
                <input
                  {...field}
                  type="text"
                  className="w-full px-3 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
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
            <h3 className="text-sm font-bold mb-2">Street</h3>
            <Controller
              name="street"
              control={control}
              render={({ field }) => (
                <input
                  {...field}
                  type="text"
                  className="w-full px-3 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
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
            <h3 className="text-sm font-bold mb-2">Building Number</h3>
            <Controller
              name="buildingNo"
              control={control}
              render={({ field }) => (
                <input
                  {...field}
                  type="text"
                  className="w-full px-3 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
            <h3 className="text-sm font-bold mb-2">Door / Apartment Number</h3>
            <Controller
              name="doorNo"
              control={control}
              render={({ field }) => (
                <input
                  {...field}
                  type="text"
                  className="w-full px-3 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
          <h3 className="text-sm font-bold mb-2">Additional Address Details</h3>
          <Controller
            name="addressDescription"
            control={control}
            render={({ field }) => (
              <textarea
                {...field}
                rows={4}
                className="w-full px-3 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-vertical"
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

export default SetupAddressStep;
