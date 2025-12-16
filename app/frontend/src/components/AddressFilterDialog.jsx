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
import { useTranslation } from "react-i18next";
import { Country, State, City } from "country-state-city";
import { useTheme } from "../hooks/useTheme";

// A lightweight address picker dialog for filtering requests by location.
// Mimics the Country -> State -> City flow of SetupAddressStep.
// onApply receives a human-friendly location string (City[, State][, Country]).
const AddressFilterDialog = ({ open, onClose, onApply }) => {
  const { t } = useTranslation();
  const [countries] = useState(() => Country.getAllCountries());
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);

  const [error, setError] = useState(null);

  const [countryName, setCountryName] = useState("");
  const [countryIsoCode, setCountryIsoCode] = useState("");
  const [stateName, setStateName] = useState("");
  const [stateIsoCode, setStateIsoCode] = useState("");
  const [cityName, setCityName] = useState("");
  // Advanced fields (optional)
  const [neighborhood, setNeighborhood] = useState("");
  const [street, setStreet] = useState("");
  const [buildingNo, setBuildingNo] = useState("");
  const [doorNo, setDoorNo] = useState("");
  const [useExactPhrase, setUseExactPhrase] = useState(false);

  const muiTheme = useMuiTheme();
  const fullScreen = useMediaQuery(muiTheme.breakpoints.down("sm"));
  const { colors } = useTheme();

  // Update states when country changes
  useEffect(() => {
    if (!countryIsoCode) {
      setStates([]);
      return;
    }

    try {
      setError(null);
      const statesData = State.getStatesOfCountry(countryIsoCode);
      setStates(statesData);
    } catch (err) {
      console.error("Error loading states/provinces:", err);
      setError(t("failedToLoadStates"));
      setStates([]);
    }
  }, [countryIsoCode]);

  // Update cities when state changes
  useEffect(() => {
    if (!countryIsoCode || !stateIsoCode) {
      setCities([]);
      return;
    }

    try {
      setError(null);
      const citiesData = City.getCitiesOfState(countryIsoCode, stateIsoCode);
      setCities(citiesData);
    } catch (err) {
      console.error("Error loading cities:", err);
      setError(t("failedToLoadCities"));
      setCities([]);
    }
  }, [countryIsoCode, stateIsoCode]);

  const handleApply = () => {
    // Build the query according to selected mode
    let chosen = "";

    if (useExactPhrase) {
      // Construct the same formatted string pattern used when creating tasks
      // Only include provided parts, in a stable order
      const parts = [];
      if (countryName) parts.push(`Country: ${countryName}`);
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
        countryName ||
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
    setCountryName("");
    setCountryIsoCode("");
    setStateName("");
    setStateIsoCode("");
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
        {t("filterByAddress")}
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
              {t("country")}
            </label>
            <div style={{ position: "relative" }}>
              <select
                id="country-select"
                style={{
                  width: "100%",
                  padding: "12px",
                  border: `1px solid ${colors.border.primary}`,
                  borderRadius: "6px",
                  backgroundColor: colors.background.secondary,
                  color: colors.text.primary,
                }}
                value={
                  countryName && countryIsoCode
                    ? JSON.stringify({
                        name: countryName,
                        isoCode: countryIsoCode,
                      })
                    : ""
                }
                onChange={(e) => {
                  const selectedValue = e.target.value;
                  if (selectedValue) {
                    const countryData = JSON.parse(selectedValue);
                    setCountryName(countryData.name);
                    setCountryIsoCode(countryData.isoCode);
                  } else {
                    setCountryName("");
                    setCountryIsoCode("");
                  }
                  // Reset state and city when country changes
                  setStateName("");
                  setStateIsoCode("");
                  setCityName("");
                }}
                aria-describedby="country-help"
              >
                <option value="">{t("selectCountry")}</option>
                {countries.map((country) => (
                  <option
                    key={country.isoCode}
                    value={JSON.stringify({
                      name: country.name,
                      isoCode: country.isoCode,
                    })}
                  >
                    {country.name}
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
                {t("chooseCountryToLoad")}
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
              {t("stateProvince")}
            </label>
            <div style={{ position: "relative" }}>
              <select
                id="state-select"
                style={{
                  width: "100%",
                  padding: "12px",
                  border: `1px solid ${colors.border.primary}`,
                  borderRadius: "6px",
                  backgroundColor: colors.background.secondary,
                  color: colors.text.primary,
                }}
                value={
                  stateName && stateIsoCode
                    ? JSON.stringify({ name: stateName, isoCode: stateIsoCode })
                    : ""
                }
                onChange={(e) => {
                  const selectedValue = e.target.value;
                  if (selectedValue) {
                    const stateData = JSON.parse(selectedValue);
                    setStateName(stateData.name);
                    setStateIsoCode(stateData.isoCode);
                  } else {
                    setStateName("");
                    setStateIsoCode("");
                  }
                  // Reset city when state changes
                  setCityName("");
                }}
                disabled={!countryIsoCode}
                aria-describedby="state-help"
              >
                <option value="">{t("selectStateProvince")}</option>
                {states.map((state) => (
                  <option
                    key={state.isoCode}
                    value={JSON.stringify({
                      name: state.name,
                      isoCode: state.isoCode,
                    })}
                  >
                    {state.name}
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
                {t("selectStateToLoadCities")}
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
              {t("districtOrCity")}
            </label>
            <div style={{ position: "relative" }}>
              <select
                id="city-select"
                style={{
                  width: "100%",
                  padding: "12px",
                  border: `1px solid ${colors.border.primary}`,
                  borderRadius: "6px",
                  backgroundColor: colors.background.secondary,
                  color: colors.text.primary,
                }}
                value={cityName}
                onChange={(e) => setCityName(e.target.value)}
                disabled={!stateIsoCode}
              >
                <option value="">{t("selectDistrictCity")}</option>
                {cities.map((city) => (
                  <option key={city.name} value={city.name}>
                    {city.name}
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
              {t("advancedOptional")}
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
                {t("neighborhood")}
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
                placeholder={t("neighborhood")}
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
                {t("street")}
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
                placeholder={t("street")}
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
                {t("buildingNumber")}
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
                placeholder={t("buildingNo")}
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
                {t("doorNumber")}
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
                placeholder={t("doorNo")}
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
                {t("useExactFormattedPhrase")}
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
              {t("broadMatchDescription")}
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
          {t("clear")}
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
          {t("cancel")}
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
          {t("apply")}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddressFilterDialog;
