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
import useMediaQuery from "@mui/material/useMediaQuery";
import { useTheme } from "@mui/material/styles";
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
  // Advanced fields (optional)
  const [neighborhood, setNeighborhood] = useState("");
  const [street, setStreet] = useState("");
  const [buildingNo, setBuildingNo] = useState("");
  const [doorNo, setDoorNo] = useState("");
  const [useExactPhrase, setUseExactPhrase] = useState(false);

  const selectedCountry = useMemo(
    () => countries.find((c) => c.code === countryCode) || null,
    [countries, countryCode]
  );

  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down("sm"));

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
    // Build the query according to selected mode
    let chosen = "";

    if (useExactPhrase) {
      // Construct the same formatted string pattern used when creating tasks
      // Only include provided parts, in a stable order
      const parts = [];
      if (selectedCountry?.name) parts.push(`Country: ${selectedCountry.name}`);
      if (stateName) parts.push(`State: ${stateName}`);
      if (cityName) parts.push(`City: ${cityName}`);
      if (neighborhood) parts.push(`Neighborhood: ${neighborhood}`);
      if (street) parts.push(`Street: ${street}`);
      if (buildingNo) parts.push(`Building: ${buildingNo}`);
      if (doorNo) parts.push(`Door: ${doorNo}`);
      chosen = parts.join(", ");
    } else {
      // Broad matching (recommended): prefer the most specific set value
      // Neighborhood > City > State > Country > Street > Building > Door
      chosen =
        neighborhood ||
        cityName ||
        stateName ||
        (selectedCountry ? selectedCountry.name : "") ||
        street ||
        buildingNo ||
        doorNo ||
        "";
    }

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
    setNeighborhood("");
    setStreet("");
    setBuildingNo("");
    setDoorNo("");
    setUseExactPhrase(false);
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      fullScreen={fullScreen}
    >
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

          {/* District/City */}
          <div>
            <h3 className="text-sm font-bold mb-2">District or City</h3>
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
                <option value="">Select District/City</option>
                {cities.map((c) => (
                  <option key={c.name} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Advanced region details (optional) */}
          <div>
            <h3 className="text-sm font-bold mb-2">Advanced (optional)</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <input
                type="text"
                className="w-full px-3 py-3 border rounded-md bg-white"
                placeholder="Neighborhood"
                value={neighborhood}
                onChange={(e) => setNeighborhood(e.target.value)}
              />
              <input
                type="text"
                className="w-full px-3 py-3 border rounded-md bg-white"
                placeholder="Street"
                value={street}
                onChange={(e) => setStreet(e.target.value)}
              />
              <input
                type="text"
                className="w-full px-3 py-3 border rounded-md bg-white"
                placeholder="Building No"
                value={buildingNo}
                onChange={(e) => setBuildingNo(e.target.value)}
              />
              <input
                type="text"
                className="w-full px-3 py-3 border rounded-md bg-white"
                placeholder="Door No"
                value={doorNo}
                onChange={(e) => setDoorNo(e.target.value)}
              />
            </div>
            <div className="mt-2 flex items-center gap-2">
              <input
                id="useExactPhrase"
                type="checkbox"
                className="h-4 w-4"
                checked={useExactPhrase}
                onChange={(e) => setUseExactPhrase(e.target.checked)}
              />
              <label htmlFor="useExactPhrase" className="text-sm text-gray-700">
                Use exact formatted phrase (stricter match)
              </label>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Broad match uses your most specific entry (e.g., Neighborhood or
              District). Exact phrase builds a combined string (e.g., "Country:
              …, State: …, City: …, Neighborhood: …, Street: …") which matches
              tasks created with the same format.
            </p>
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
