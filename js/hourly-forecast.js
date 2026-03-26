/**
 * @file hourly-forecast.js
 * @description Manages the processing and display of hourly weather data for each day of the week.
 * It splits the flat 168-hour array from Open-Meteo into 24-hour daily segments
 * and updates the UI based on the user's selected day.
 *
 * @dependencies
 * - search-bar.js : Provides `weatherInformation` containing the raw hourly data from the API.
 * - current-weather.js : Provides `formatWeatherDate()` to format ISO strings into readable time (e.g., 4 PM).
 *
 * @exports renderHourlyForecast - Function to populate the UI with hourly cards for a specific day.
 */

import { weatherInformation } from "./search-bar.js";
import { formatWeatherDate } from "./current-weather.js";

// ─── DOM Element References ───────────────────────────────────────────────────

const hourlyButtonElement = document.getElementById("hourly-forecastBtn"); // Button to toggle the days dropdown
const hourlyForecastListElement = document.getElementById(
  "hourly-forecastList",
); // Container for the hourly cards
const daysList = document.getElementById("days-list"); // The dropdown menu containing the days of the week
const daysElements = document.querySelectorAll(".weather__day-item"); // Individual day items in the dropdown
const weekDayElement = document.getElementById("week-day"); // Label displaying the currently selected day

// ─── Shared State & Constants ─────────────────────────────────────────────────

/** @type {Object} Stores processed 24-hour chunks indexed by day name */
const weeklyForecast = {};

/** @type {string[]} Map for converting Date.getDay() integers to string keys */
const dayNames = [
  "sunday",
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
];

/** @type {Object} Maps Open-Meteo weather codes to local image paths */
const weatherCodesIcons = {
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

// ─── Functions ────────────────────────────────────────────────────────────────

/**
 * Organizes the flat hourly array into a structured object grouped by day.
 * * It iterates through the 168-hour list in steps of 24, using .slice() to
 * extract a full day's worth of times, temperatures, and weather codes.
 *
 * @param {string} day - The name of the day to retrieve (e.g., "friday")
 * @returns {Object} The 24-hour data arrays for the requested day
 */
function getWeatherForecast(day) {
  const hourlyData = weatherInformation.hourly;

  // Jump 24 indexes at a time to separate the 7 days
  for (let i = 0; i < hourlyData.time.length; i += 24) {
    const dateObj = new Date(hourlyData.time[i]);
    const dayName = dayNames[dateObj.getDay()];

    // Store the sliced segments into the weeklyForecast object
    weeklyForecast[dayName] = {
      times: hourlyData.time.slice(i, i + 24),
      temperatures: hourlyData.temperature_2m.slice(i, i + 24),
      weatherCodes: hourlyData.weather_code.slice(i, i + 24),
    };
  }

  return weeklyForecast[day];
}

/**
 * Renders the hourly weather cards into the DOM for a specific day.
 * * Clears the existing list and generates new <li> elements for every
 * hour, applying icons based on weather codes and formatting the time.
 *
 * @param {string} [day="tuesday"] - The day to render, defaults to "tuesday"
 * @returns {void}
 */
export function renderHourlyForecast(day = "tuesday") {
  const { times, temperatures, weatherCodes } = getWeatherForecast(day);

  // Clear the current list before rendering new items
  hourlyForecastListElement.innerHTML = "";

  times.forEach((time, index) => {
    const li = document.createElement("li");
    li.classList.add("weather__forecast-card");

    // Container for the icon and time
    const div = document.createElement("div");
    div.classList.add("weather__time");

    const img = document.createElement("img");
    img.src = weatherCodesIcons[weatherCodes[index]];
    img.alt = "";

    const span = document.createElement("span");
    // Format the ISO time string to "4 PM" using the utility function
    span.innerHTML = formatWeatherDate(time, { hour: "numeric", hour12: true });

    div.appendChild(img);
    div.appendChild(span);

    // Temperature display
    const h3 = document.createElement("h3");
    h3.classList.add("weather__forecast-cardTemp");
    h3.innerHTML = temperatures[index] + "°";

    li.appendChild(div);
    li.appendChild(h3);

    // Append the completed card to the list
    hourlyForecastListElement.appendChild(li);
  });
}

// ─── Event Listeners ──────────────────────────────────────────────────────────

/**
 * Toggles the visibility of the days selection menu.
 */
hourlyButtonElement.addEventListener("click", () => {
  daysList.classList.toggle("active");
});

/**
 * Listens for clicks on individual day items in the dropdown.
 * Updates the UI with the selected day's hourly forecast and updates labels.
 */
daysElements.forEach((dayElement) => {
  dayElement.addEventListener("click", (event) => {
    const day = event.currentTarget.getAttribute("data-day");

    // Only render if weather data has been successfully fetched
    if (weatherInformation) {
      renderHourlyForecast(day);
    }

    // Update the heading to show the selected day name
    weekDayElement.innerHTML = day;
  });
});
