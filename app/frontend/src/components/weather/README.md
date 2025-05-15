# Weather Widget Implementation

This document explains the implementation of the weather widget added to the application.

## Overview

The weather widget shows current weather conditions for the user's location. It is displayed at the top-right corner of the login page.

## Technical Details

- Uses the **Open Meteo API** (https://open-meteo.com) for weather data
- Retrieves the user's current location using the browser's Geolocation API
- Uses **BigDataCloud** for reverse geocoding to get the city/locality name
- Falls back to a default location (Istanbul) if geolocation is denied or not supported

## Weather Codes

The widget displays different icons based on the WMO weather codes returned by Open Meteo:

- 0-1: Clear sky (Sun icon)
- 2-3: Partly cloudy (Cloud icon)
- 4-49: Fog/haze (Dark Cloud icon)
- 50-69: Drizzle/rain (Water icon)
- 70-79: Snow (Snowflake icon)
- 80-99: Thunderstorm (Storm icon)

## Component Location

The weather widget component is located at:
`/src/components/weather/WeatherWidget.jsx`

## Usage

Simply import and include the widget in any component:

```jsx
import WeatherWidget from "../../components/weather/WeatherWidget";

// Inside your JSX:
<Box>
  <WeatherWidget />
</Box>;
```

## Error Handling

- If there's an error fetching weather data, the widget will not be displayed
- During loading, a small loading spinner is shown
