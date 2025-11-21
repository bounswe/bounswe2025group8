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
import { useTheme as useMuiTheme } from "@mui/material/styles";
import * as createRequestService from "../features/request/services/createRequestService";
import { useTheme } from "../hooks/useTheme";

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

  const muiTheme = useMuiTheme();
  const fullScreen = useMediaQuery(muiTheme.breakpoints.down("sm"));
  const { colors } = useTheme();

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
      aria-labelledby="address-filter-title"
      PaperProps={{
        sx: {
          backgroundColor: colors.background.elevated,
          border: `1px solid ${colors.border.primary}`,
        },
      }}
    >
      <DialogTitle
        id="address-filter-title"
        sx={{ color: colors.text.primary }}
      >
        Filter by Address
      </DialogTitle>
      <DialogContent>
        {error && (
          <Typography
            variant="body2"
            role="alert"
            aria-live="assertive"
            sx={{
              mb: 2,
              color: colors.semantic.error,
              backgroundColor: `${colors.semantic.error}10`,
              padding: "8px 12px",
              borderRadius: "8px",
            }}
          >
            {error}
          </Typography>
        )}
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
          {/* Country */}
          <div>
            <label
              htmlFor="country-select"
              style={{
                fontSize: "0.875rem",
                fontWeight: "bold",
                marginBottom: "8px",
                color: colors.text.primary,
                display: "block",
              }}
            >
              Country
            </label>
            <div style={{ position: "relative" }}>
              {loading.countries && (
                <div
                  style={{
                    position: "absolute",
                    left: "12px",
                    top: "50%",
                    transform: "translateY(-50%)",
                  }}
                >
                  <div
                    style={{
                      animation: "spin 1s linear infinite",
                      borderRadius: "50%",
                      height: "20px",
                      width: "20px",
                      borderBottom: `2px solid ${colors.brand.primary}`,
                    }}
                    aria-hidden="true"
                  />
                </div>
              )}
              <select
                id="country-select"
                style={{
                  width: "100%",
                  padding: "12px",
                  paddingLeft: loading.countries ? "48px" : "12px",
                  border: `1px solid ${colors.border.primary}`,
                  borderRadius: "6px",
                  backgroundColor: colors.background.secondary,
                  color: colors.text.primary,
                }}
                value={countryCode}
                disabled={loading.countries}
                onChange={(e) => setCountryCode(e.target.value)}
                aria-busy={loading.countries ? "true" : undefined}
                aria-describedby="country-help"
              >
                <option value="">Select Country</option>
                {countries.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.name}
                  </option>
                ))}
              </select>
              <p
                id="country-help"
                style={{
                  fontSize: "0.75rem",
                  color: colors.text.tertiary,
                  marginTop: 4,
                }}
              >
                Choose a country to load states and cities.
              </p>
            </div>
          </div>

          {/* State */}
          <div>
            <label
              htmlFor="state-select"
              style={{
                fontSize: "0.875rem",
                fontWeight: "bold",
                marginBottom: "8px",
                color: colors.text.primary,
                display: "block",
              }}
            >
              State/Province
            </label>
            <div style={{ position: "relative" }}>
              {loading.states && (
                <div
                  style={{
                    position: "absolute",
                    left: "12px",
                    top: "50%",
                    transform: "translateY(-50%)",
                  }}
                >
                  <div
                    style={{
                      animation: "spin 1s linear infinite",
                      borderRadius: "50%",
                      height: "20px",
                      width: "20px",
                      borderBottom: `2px solid ${colors.brand.primary}`,
                    }}
                    aria-hidden="true"
                  />
                </div>
              )}
              <select
                id="state-select"
                style={{
                  width: "100%",
                  padding: "12px",
                  paddingLeft: loading.states ? "48px" : "12px",
                  border: `1px solid ${colors.border.primary}`,
                  borderRadius: "6px",
                  backgroundColor: colors.background.secondary,
                  color: colors.text.primary,
                }}
                value={stateName}
                onChange={(e) => setStateName(e.target.value)}
                disabled={!countryCode || loading.states}
                aria-busy={loading.states ? "true" : undefined}
                aria-describedby="state-help"
              >
                <option value="">Select State/Province</option>
                {states.map((s) => (
                  <option key={s.code || s.name} value={s.name}>
                    {s.name}
                  </option>
                ))}
              </select>
              <p
                id="state-help"
                style={{
                  fontSize: "0.75rem",
                  color: colors.text.tertiary,
                  marginTop: 4,
                }}
              >
                Select a state or province to load cities.
              </p>
            </div>
          </div>

          {/* District/City */}
          <div>
            <label
              htmlFor="city-select"
              style={{
                fontSize: "0.875rem",
                fontWeight: "bold",
                marginBottom: "8px",
                color: colors.text.primary,
                display: "block",
              }}
            >
              District or City
            </label>
            <div style={{ position: "relative" }}>
              {loading.cities && (
                <div
                  style={{
                    position: "absolute",
                    left: "12px",
                    top: "50%",
                    transform: "translateY(-50%)",
                  }}
                >
                  <div
                    style={{
                      animation: "spin 1s linear infinite",
                      borderRadius: "50%",
                      height: "20px",
                      width: "20px",
                      borderBottom: `2px solid ${colors.brand.primary}`,
                    }}
                    aria-hidden="true"
                  />
                </div>
              )}
              <select
                id="city-select"
                style={{
                  width: "100%",
                  padding: "12px",
                  paddingLeft: loading.cities ? "48px" : "12px",
                  border: `1px solid ${colors.border.primary}`,
                  borderRadius: "6px",
                  backgroundColor: colors.background.secondary,
                  color: colors.text.primary,
                }}
                value={cityName}
                onChange={(e) => setCityName(e.target.value)}
                disabled={!stateName || loading.cities}
                aria-busy={loading.cities ? "true" : undefined}
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
            <h3
              id="advanced-section-title"
              style={{
                fontSize: "0.875rem",
                fontWeight: "bold",
                marginBottom: "8px",
                color: colors.text.primary,
              }}
            >
              Advanced (optional)
            </h3>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr",
                gap: "8px",
              }}
            >
              <label
                htmlFor="neighborhood-input"
                style={{
                  position: "absolute",
                  left: "-10000px",
                  width: 1,
                  height: 1,
                  overflow: "hidden",
                }}
              >
                Neighborhood
              </label>
              <input
                id="neighborhood-input"
                type="text"
                style={{
                  width: "100%",
                  padding: "12px",
                  border: `1px solid ${colors.border.primary}`,
                  borderRadius: "6px",
                  backgroundColor: colors.background.secondary,
                  color: colors.text.primary,
                }}
                placeholder="Neighborhood"
                value={neighborhood}
                onChange={(e) => setNeighborhood(e.target.value)}
              />
              <label
                htmlFor="street-input"
                style={{
                  position: "absolute",
                  left: "-10000px",
                  width: 1,
                  height: 1,
                  overflow: "hidden",
                }}
              >
                Street
              </label>
              <input
                id="street-input"
                type="text"
                style={{
                  width: "100%",
                  padding: "12px",
                  border: `1px solid ${colors.border.primary}`,
                  borderRadius: "6px",
                  backgroundColor: colors.background.secondary,
                  color: colors.text.primary,
                }}
                placeholder="Street"
                value={street}
                onChange={(e) => setStreet(e.target.value)}
              />
              <label
                htmlFor="building-input"
                style={{
                  position: "absolute",
                  left: "-10000px",
                  width: 1,
                  height: 1,
                  overflow: "hidden",
                }}
              >
                Building Number
              </label>
              <input
                id="building-input"
                type="text"
                style={{
                  width: "100%",
                  padding: "12px",
                  border: `1px solid ${colors.border.primary}`,
                  borderRadius: "6px",
                  backgroundColor: colors.background.secondary,
                  color: colors.text.primary,
                }}
                placeholder="Building No"
                value={buildingNo}
                onChange={(e) => setBuildingNo(e.target.value)}
              />
              <label
                htmlFor="door-input"
                style={{
                  position: "absolute",
                  left: "-10000px",
                  width: 1,
                  height: 1,
                  overflow: "hidden",
                }}
              >
                Door Number
              </label>
              <input
                id="door-input"
                type="text"
                style={{
                  width: "100%",
                  padding: "12px",
                  border: `1px solid ${colors.border.primary}`,
                  borderRadius: "6px",
                  backgroundColor: colors.background.secondary,
                  color: colors.text.primary,
                }}
                placeholder="Door No"
                value={doorNo}
                onChange={(e) => setDoorNo(e.target.value)}
              />
            </div>
            <div
              style={{
                marginTop: "8px",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <input
                id="useExactPhrase"
                type="checkbox"
                style={{
                  height: "16px",
                  width: "16px",
                  accentColor: colors.brand.primary,
                }}
                checked={useExactPhrase}
                onChange={(e) => setUseExactPhrase(e.target.checked)}
              />
              <label
                htmlFor="useExactPhrase"
                style={{ fontSize: "0.875rem", color: colors.text.primary }}
              >
                Use exact formatted phrase (stricter match)
              </label>
            </div>
            <p
              style={{
                fontSize: "0.75rem",
                color: colors.text.tertiary,
                marginTop: "4px",
              }}
              id="advanced-help"
            >
              Broad match uses your most specific entry (e.g., Neighborhood or
              District). Exact phrase builds a combined string (e.g., "Country:
              …, State: …, City: …, Neighborhood: …, Street: …") which matches
              tasks created with the same format.
            </p>
          </div>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button
          onClick={handleClear}
          sx={{
            color: colors.text.secondary,
            "&:hover": {
              backgroundColor: colors.interactive.hover,
            },
          }}
        >
          Clear
        </Button>
        <Button
          onClick={onClose}
          sx={{
            color: colors.text.secondary,
            "&:hover": {
              backgroundColor: colors.interactive.hover,
            },
          }}
        >
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleApply}
          sx={{
            backgroundColor: colors.brand.primary,
            color: "#FFFFFF",
            "&:hover": {
              backgroundColor: colors.brand.primaryHover,
            },
          }}
        >
          Apply
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddressFilterDialog;
