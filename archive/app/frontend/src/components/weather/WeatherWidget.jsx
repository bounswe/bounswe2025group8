import { useState, useEffect } from "react";
import { Box, Typography, CircularProgress, Tooltip } from "@mui/material";
import WbSunnyIcon from "@mui/icons-material/WbSunny";
import CloudIcon from "@mui/icons-material/Cloud";
import GrainIcon from "@mui/icons-material/Grain";
import AcUnitIcon from "@mui/icons-material/AcUnit";
import ThunderstormIcon from "@mui/icons-material/Thunderstorm";
import WaterIcon from "@mui/icons-material/Water";

const WeatherWidget = () => {
  const [weather, setWeather] = useState(null);
  const [location, setLocation] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Get weather icon based on weather code
  const getWeatherIcon = (weatherCode) => {
    // Weather codes based on WMO standard used by Open Meteo
    if (weatherCode <= 1) return <WbSunnyIcon sx={{ color: "#FFD700" }} />; // Clear
    if (weatherCode <= 3) return <CloudIcon sx={{ color: "#A9A9A9" }} />; // Partly cloudy
    if (weatherCode <= 49) return <CloudIcon sx={{ color: "#696969" }} />; // Fog, haze
    if (weatherCode <= 69) return <WaterIcon sx={{ color: "#4682B4" }} />; // Drizzle/rain
    if (weatherCode <= 79) return <AcUnitIcon sx={{ color: "#ADD8E6" }} />; // Snow
    if (weatherCode <= 99)
      return <ThunderstormIcon sx={{ color: "#4169E1" }} />; // Thunderstorm
    return <GrainIcon sx={{ color: "#A9A9A9" }} />;
  };

  useEffect(() => {
    const fetchWeather = async (latitude, longitude) => {
      try {
        // Get current date
        const today = new Date().toISOString().split("T")[0];

        // Call Open Meteo API
        const response = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,weather_code&temperature_unit=celsius&timezone=auto`
        );

        if (!response.ok) {
          throw new Error("Weather data not available");
        }

        const data = await response.json();

        // Get location name using reverse geocoding
        const geoResponse = await fetch(
          `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
        );

        if (geoResponse.ok) {
          const geoData = await geoResponse.json();
          setLocation(geoData.city || geoData.locality || "Your location");
        }

        setWeather(data);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching weather:", err);
        setError("Unable to get weather data");
        setLoading(false);
      }
    };

    // Get user's location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          fetchWeather(latitude, longitude);
        },
        (err) => {
          console.error("Error getting location:", err);
          setError("Location access denied");
          setLoading(false);
          // Fallback to a default location (Istanbul)
          fetchWeather(41.0082, 28.9784);
        }
      );
    } else {
      setError("Geolocation not supported");
      setLoading(false);
      // Fallback to a default location (Istanbul)
      fetchWeather(41.0082, 28.9784);
    }
  }, []);

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          p: 1,
        }}
      >
        <CircularProgress size={16} sx={{ mr: 1, color: "#6366f1" }} />
        <Typography variant="caption">Loading weather...</Typography>
      </Box>
    );
  }

  if (error) {
    return null; // Hide the widget if there's an error
  }

  return weather ? (
    <Tooltip
      title={`${location}: ${weather.current.temperature_2m}°C, Humidity: ${weather.current.relative_humidity_2m}%`}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          bgcolor: "rgba(255,255,255,0.8)",
          borderRadius: 2,
          px: 1.5,
          py: 0.5,
          boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
          maxWidth: "fit-content",
        }}
      >
        {getWeatherIcon(weather.current.weather_code)}
        <Box sx={{ ml: 1 }}>
          <Typography
            variant="body2"
            sx={{ fontWeight: "medium", lineHeight: 1 }}
          >
            {location}
          </Typography>
          <Typography
            variant="caption"
            sx={{ color: "text.secondary", display: "block", lineHeight: 1 }}
          >
            {weather.current.temperature_2m}°C
          </Typography>
        </Box>
      </Box>
    </Tooltip>
  ) : null;
};

export default WeatherWidget;
