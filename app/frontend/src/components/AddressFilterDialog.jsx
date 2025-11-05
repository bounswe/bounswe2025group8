import React, { useEffect, useMemo, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
} from "@mui/material";
import * as createRequestService from "../features/request/services/createRequestService";

// A lightweight address picker dialog for filtering requests by location.
// Mimics the Country -> State -> City flow of SetupAddressStep.
// onApply receives a human-friendly location string (City[, State][, Country]).
const AddressFilterDialog = ({ open, onClose, onApply }) => {
  const [countries, setCountries] = useState([]); // {name, code}
  const [states, setStates] = useState([]); // {name, code?}
  const [cities, setCities] = useState([]); // {name}

  const [loading, setLoading] = useState({
    countries: false,
    states: false,
    cities: false,
  });
  const [error, setError] = useState(null);

  const [countryCode, setCountryCode] = useState("");
  const [stateName, setStateName] = useState("");
  const [cityName, setCityName] = useState("");

  const selectedCountry = useMemo(
    () => countries.find((c) => c.code === countryCode) || null,
    [countries, countryCode]
  );

  useEffect(() => {
    if (!open) return;
    const loadCountries = async () => {
      try {
        setLoading((p) => ({ ...p, countries: true }));
        setError(null);
        const res = await createRequestService.fetchCountries();
        setCountries(res || []);
      } catch (e) {
        console.error("Failed to load countries", e);
        setError("Failed to load countries");
      } finally {
        setLoading((p) => ({ ...p, countries: false }));
      }
    };
    loadCountries();
  }, [open]);

  useEffect(() => {
    // Reset dependent fields
    setStates([]);
    setStateName("");
    setCities([]);
    setCityName("");
    if (!countryCode || !selectedCountry) return;
    const loadStates = async () => {
      try {
        setLoading((p) => ({ ...p, states: true }));
        setError(null);
        const res = await createRequestService.fetchStates(
          selectedCountry.name
        );
        setStates(res || []);
      } catch (e) {
        console.error("Failed to load states", e);
        setError("Failed to load states");
      } finally {
        setLoading((p) => ({ ...p, states: false }));
      }
    };
    loadStates();
  }, [countryCode, selectedCountry]);

  useEffect(() => {
    // Reset city when state changes
    setCities([]);
    setCityName("");
    if (!countryCode || !stateName || !selectedCountry) return;
    const loadCities = async () => {
      try {
        setLoading((p) => ({ ...p, cities: true }));
        setError(null);
        const res = await createRequestService.fetchCities(
          selectedCountry.name,
          stateName
        );
        setCities(res || []);
      } catch (e) {
        console.error("Failed to load cities", e);
        setError("Failed to load cities");
      } finally {
        setLoading((p) => ({ ...p, cities: false }));
      }
    };
    loadCities();
  }, [countryCode, stateName, selectedCountry]);

  const handleApply = () => {
    // Prefer the most specific selection for filtering
    const chosen =
      cityName || stateName || (selectedCountry ? selectedCountry.name : "");
    if (!chosen) {
      onClose?.();
      return;
    }
    onApply?.(chosen);
    onClose?.();
  };

  const handleClear = () => {
    setCountryCode("");
    setStateName("");
    setCityName("");
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Filter by Address</DialogTitle>
      <DialogContent>
        {error && (
          <Typography color="error" variant="body2" sx={{ mb: 2 }}>
            {error}
          </Typography>
        )}
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
          {/* Country */}
          <div>
            <h3 className="text-sm font-bold mb-2">Country</h3>
            <div className="relative">
              {loading.countries && (
                <div className="absolute left-3 top-1/2 -translate-y-1/2">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600" />
                </div>
              )}
              <select
                className={`w-full px-3 py-3 border rounded-md bg-white ${
                  loading.countries ? "pl-12" : ""
                }`}
                value={countryCode}
                disabled={loading.countries}
                onChange={(e) => setCountryCode(e.target.value)}
              >
                <option value="">Select Country</option>
                {countries.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* State */}
          <div>
            <h3 className="text-sm font-bold mb-2">State/Province</h3>
            <div className="relative">
              {loading.states && (
                <div className="absolute left-3 top-1/2 -translate-y-1/2">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600" />
                </div>
              )}
              <select
                className={`w-full px-3 py-3 border rounded-md bg-white ${
                  loading.states ? "pl-12" : ""
                }`}
                value={stateName}
                onChange={(e) => setStateName(e.target.value)}
                disabled={!countryCode || loading.states}
              >
                <option value="">Select State/Province</option>
                {states.map((s) => (
                  <option key={s.code || s.name} value={s.name}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* City */}
          <div>
            <h3 className="text-sm font-bold mb-2">City/District</h3>
            <div className="relative">
              {loading.cities && (
                <div className="absolute left-3 top-1/2 -translate-y-1/2">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600" />
                </div>
              )}
              <select
                className={`w-full px-3 py-3 border rounded-md bg-white ${
                  loading.cities ? "pl-12" : ""
                }`}
                value={cityName}
                onChange={(e) => setCityName(e.target.value)}
                disabled={!stateName || loading.cities}
              >
                <option value="">Select City</option>
                {cities.map((c) => (
                  <option key={c.name} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClear} color="inherit">
          Clear
        </Button>
        <Button onClick={onClose} color="inherit">
          Cancel
        </Button>
        <Button variant="contained" onClick={handleApply}>
          Apply
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddressFilterDialog;
