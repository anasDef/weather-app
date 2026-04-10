/**
 * @file current-weather.js
 * @description Handles rendering the current weather data into the DOM.
 *
 *              Reads from the shared `weatherInformation` object (populated by search-bar.js)
 *              and updates all relevant UI elements: location, date, temperature,
 *              feels-like, humidity, wind speed, precipitation, and weather icon.
 *
 * @dependencies
 *  - search-bar.js : Provides the `weatherInformation` shared state object
 */

import { weatherInformation } from "./search-bar.js";
// ─── DOM Element References ───────────────────────────────────────────────────

const locationElement = document.getElementById("location");
const dateElement = document.getElementById("date");
const mainTemperatureElement = document.getElementById("main-temperature");
const feelsLikeElement = document.getElementById("feels-like");
const humidityElement = document.getElementById("humidity");
const windSpeedElement = document.getElementById("wind-speed");
const precipitationElement = document.getElementById("precipitation");

// ─── Weather Code → Icon Mapping ──────────────────────────────────────────────

/**
 * Maps WMO Weather Interpretation Codes (as returned by the Open-Meteo API)
 * to their corresponding local icon image paths.
 *
 * WMO code groups:
 *  - 0        : Clear sky
 *  - 1–2      : Partly cloudy
 *  - 3        : Overcast
 *  - 45, 48   : Fog and depositing rime fog
 *  - 51–57    : Drizzle (light to heavy, freezing)
 *  - 61–67    : Rain (slight to heavy, freezing)
 *  - 71–77    : Snow (slight to heavy, snow grains)
 *  - 80–82    : Rain showers
 *  - 85–86    : Snow showers
 *  - 95, 96, 99 : Thunderstorm (with possible hail)
 *
 * @type {Object.<number, string>}
 */
const weatherCodes = {
  // Clear & Cloudy
  0: "/weather-app/images/icon-sunny.webp",
  1: "/weather-app/images/icon-partly-cloudy.webp",
  2: "/weather-app/images/icon-partly-cloudy.webp",
  3: "/weather-app/images/icon-overcast.webp",

  // Fog
  45: "/weather-app/images/icon-fog.webp",
  48: "/weather-app/images/icon-fog.webp",

  // Drizzle
  51: "/weather-app/images/icon-drizzle.webp",
  53: "/weather-app/images/icon-drizzle.webp",
  55: "/weather-app/images/icon-drizzle.webp",
  56: "/weather-app/images/icon-drizzle.webp",
  57: "/weather-app/images/icon-drizzle.webp",

  // Rain
  61: "/weather-app/images/icon-rain.webp",
  63: "/weather-app/images/icon-rain.webp",
  65: "/weather-app/images/icon-rain.webp",
  66: "/weather-app/images/icon-rain.webp",
  67: "/weather-app/images/icon-rain.webp",
  80: "/weather-app/images/icon-rain.webp",
  81: "/weather-app/images/icon-rain.webp",
  82: "/weather-app/images/icon-rain.webp",

  // Snow
  71: "/weather-app/images/icon-snow.webp",
  73: "/weather-app/images/icon-snow.webp",
  75: "/weather-app/images/icon-snow.webp",
  77: "/weather-app/images/icon-snow.webp",
  85: "/weather-app/images/icon-snow.webp",
  86: "/weather-app/images/icon-snow.webp",

  // Thunderstorm
  95: "/weather-app/images/icon-storm.webp",
  96: "/weather-app/images/icon-storm.webp",
  99: "/weather-app/images/icon-storm.webp",
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Converts an ISO 8601 datetime string into a human-readable date string.
 *
 * Uses the `Intl.DateTimeFormat` API with "en-US" locale and the following format:
 *  - Weekday: long  (e.g. "Monday")
 *  - Year:    numeric
 *  - Month:   short (e.g. "Jan")
 *  - Day:     numeric
 *
 * Example output: "Monday, Jan 6, 2025"
 *
 * @param {string} isoString - An ISO 8601 datetime string (e.g. "2025-01-06T14:00")
 * @returns {string} A formatted, locale-aware date string
 */
export function formatWeatherDate(isoString, options) {
  const date = new Date(isoString);

  return new Intl.DateTimeFormat("en-US", options).format(date);
}

// ─── Main Display Function ────────────────────────────────────────────────────

/**
 * Reads the current weather data from the shared `weatherInformation` object
 * and updates all weather-related DOM elements with the latest values.
 *
 * This function should be called after `weatherInformation` has been populated
 * by `getWeatherInformation()` in search-bar.js.
 *
 * DOM elements updated:
 *  - `#location`         ← formatted "Place, Country" string
 *  - `#date`             ← human-readable current date
 *  - `#main-temperature` ← current temperature with degree symbol
 *  - `#feels-like`       ← apparent (feels-like) temperature
 *  - `#humidity`         ← relative humidity percentage
 *  - `#wind-speed`       ← wind speed with its unit
 *  - `#precipitation`    ← precipitation amount with its unit
 *  - `.weather__temperature` ← dynamically injected weather icon `<img>`
 *
 * Weather icon behavior:
 *  - If an icon already exists inside `.weather__temperature`, it is removed first
 *    to prevent duplicate icons from stacking on repeated searches.
 *  - A new `<img>` element is created, its `src` resolved via the `weatherCodes` map,
 *    and appended to the temperature container.
 *
 * @export
 * @returns {void}
 */
export function renderWeatherInformation() {
  // Destructure current weather conditions from the API response
  const {
    time,
    apparent_temperature,
    precipitation,
    relative_humidity_2m,
    temperature_2m,
    weather_code,
    wind_speed_10m,
  } = weatherInformation.current;

  // Destructure units for values that need a unit label displayed in the UI
  const { precipitation: precipitationUnit, wind_speed_10m: windSpeedUnit } =
    weatherInformation.current_units;

  const currentDate = formatWeatherDate(time, {
    weekday: "long",
    year: "numeric",
    month: "short",
    day: "numeric",
  });
  const { location } = weatherInformation;

  // ── Populate DOM elements ──────────────────────────────────────────────────

  locationElement.innerHTML = location;
  dateElement.innerHTML = currentDate;
  mainTemperatureElement.innerHTML = `${temperature_2m}°`;
  feelsLikeElement.innerHTML = `${apparent_temperature}°`;
  humidityElement.innerHTML = `${relative_humidity_2m} %`;
  windSpeedElement.innerHTML = `${wind_speed_10m} ${windSpeedUnit}`;
  precipitationElement.innerHTML = `${precipitation} ${precipitationUnit}`;

  // ── Weather Icon ───────────────────────────────────────────────────────────

  const mainTempContainer = document.querySelector(".weather__temperature");

  // Remove any existing icon before injecting the new one (prevents duplicates on re-search)
  if (mainTempContainer.querySelector(".weather__weather-icon")) {
    mainTempContainer.querySelector(".weather__weather-icon").remove();
  }

  // Create and append the new icon based on the current WMO weather code
  const weatherIcon = document.createElement("img");
  weatherIcon.src = weatherCodes[weather_code];
  weatherIcon.alt = "";
  weatherIcon.classList.add("weather__weather-icon");
  document.querySelector(".weather__temperature").appendChild(weatherIcon);
}
