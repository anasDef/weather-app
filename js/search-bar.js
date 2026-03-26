/**
 * @file search-bar.js
 * @description Handles the search bar functionality including:
 * - Fetching location suggestions from the Open-Meteo Geocoding API
 * - Rendering suggestion items in the dropdown list
 * - Fetching weather data based on the selected location
 * - Managing UI state (error, no-result, suggestions visibility)
 *
 * @dependencies
 * - units.js           : Provides the user-selected unit preferences (temperature, wind, precipitation)
 * - current-weather.js : Provides renderWeatherInformation() to render current conditions
 * - daily-forecast.js   : Provides renderDailyForecast() to render the 7-day forecast
 * - hourly-forecast.js  : Provides renderHourlyForecast() to render the detailed hourly breakdown
 *
 * @exports weatherInformation - The raw weather data object returned from the Open-Meteo Forecast API
 * @exports location           - The currently selected location object { place, country, latitude, longitude }
 * @exports getWeatherInformation - Fetches weather data for a given location and unit configuration
 */

import { units } from "./units.js";
import { renderWeatherInformation } from "./current-weather.js";
import { renderDailyForecast } from "./daily-forecast.js";
import { renderHourlyForecast } from "./hourly-forecast.js";

// ─── DOM Element References ───────────────────────────────────────────────────

const searchInputElement = document.getElementById("search-inp");
const searchButtonElement = document.getElementById("search-btn");
const suggestionsListElement = document.getElementById("suggestions");
const retryButtonELement = document.getElementById("retry-btn");
const containerElement = document.getElementById("container");

// ─── Shared State ─────────────────────────────────────────────────────────────

/** @type {Object} Holds the full weather response from the forecast API, plus a `location` string */
export let weatherInformation = {};

/** @type {Object} Holds the currently selected location's coordinates and display name */
export let location = {};

/**
 * A local copy of the suggestions array from the last geocoding response.
 * Used to validate whether a location was actually found before triggering a weather fetch.
 * @type {Array}
 */
let suggestionsArrayCopy = [];

// ─── Functions ────────────────────────────────────────────────────────────────

/**
 * Fetches a list of location suggestions from the Open-Meteo Geocoding API
 * based on the user's search input.
 *
 * - On success: saves the first result into `location`, renders all suggestions,
 *   and keeps a copy in `suggestionsArrayCopy` for validation.
 * - On empty results: clears `suggestionsArrayCopy` and hides the suggestions dropdown.
 * - On network/API error: adds the "error" class to `document.body` to show the error UI.
 *
 * @async
 * @param {string} place - The search term entered by the user (minimum 2 characters)
 * @returns {Promise<void>}
 */
async function getSuggestionsList(place) {
  try {
    const request = await fetch(
      `https://geocoding-api.open-meteo.com/v1/search?name=${place}&count=5&language=en&format=json`,
    );
    const response = await request.json();
    let suggestionsArray;

    if (response.results && response.results.length > 0) {
      suggestionsArray = response.results;

      // Pre-select the first suggestion as the default location
      const firstSuggestion = suggestionsArray[0];
      location.place = firstSuggestion.name;
      location.country = firstSuggestion.country;
      location.longitude = firstSuggestion.longitude;
      location.latitude = firstSuggestion.latitude;

      renderSuggestionsElements(suggestionsArray);

      // Keep a copy so the search button can check if results exist
      suggestionsArrayCopy = [...suggestionsArray];
    } else {
      // No results found — clear copy and hide the dropdown
      suggestionsArrayCopy = [];
      suggestionsListElement.classList.remove("show");
    }
  } catch (err) {
    // Network or parsing error — show the global error state
    document.body.classList.add("error");
  }
}

// ─── Event Listeners ──────────────────────────────────────────────────────────

/**
 * Triggers a suggestions fetch whenever the user types in the search input.
 * Only fires when the input has 2 or more characters to avoid unnecessary API calls.
 */
searchInputElement.addEventListener("input", (event) => {
  if (event.currentTarget.value.length >= 2) {
    getSuggestionsList(event.currentTarget.value);
  } else {
    // Hide suggestions if the input is too short
    suggestionsListElement.classList.remove("show");
  }
});

/**
 * Builds and renders the suggestion `<li>` elements inside the suggestions dropdown.
 *
 * Each suggestion item:
 *  - Displays the place name and its country/region details
 *  - Stores location data as `data-*` attributes on the `<li>` element
 *  - On click: updates the `location` object, fills the input, and closes the dropdown
 *
 * @param {Array<Object>} suggestions - Array of location objects from the Geocoding API
 * @param {string} suggestions[].name        - Place name
 * @param {string} suggestions[].country     - Country name
 * @param {string} suggestions[].admin1      - Administrative region (e.g. state or province)
 * @param {number} suggestions[].latitude    - Geographic latitude
 * @param {number} suggestions[].longitude   - Geographic longitude
 */
function renderSuggestionsElements(suggestions) {
  if (suggestions) {
    // Clear any previously rendered suggestion items
    suggestionsListElement.innerHTML = "";

    suggestions.map((suggestion) => {
      // Create the <li> element for this suggestion
      const suggestionElement = document.createElement("li");

      // Place name label
      const placeSpanElement = document.createElement("span");
      placeSpanElement.innerHTML = suggestion.name;
      suggestionElement.appendChild(placeSpanElement);

      /**
       * On click: read location data from the element's data attributes,
       * update the shared `location` object, reflect the selection in the input,
       * then close the suggestions dropdown.
       */
      suggestionElement.addEventListener("click", (event) => {
        location.place = event.currentTarget.getAttribute("data-place");
        location.country = event.currentTarget.getAttribute("data-country");
        location.longitude = event.currentTarget.getAttribute("data-longitude");
        location.latitude = event.currentTarget.getAttribute("data-latitude");

        // Show the selected location in the search input field
        searchInputElement.value = `${location.place}, ${location.country}`;

        suggestionsListElement.classList.remove("show");
      });

      // Embed location data as data attributes to be read on click
      suggestionElement.setAttribute("data-place", suggestion.name);
      suggestionElement.setAttribute("data-country", suggestion.country);
      suggestionElement.setAttribute("data-latitude", suggestion.latitude);
      suggestionElement.setAttribute("data-longitude", suggestion.longitude);

      // Secondary label showing country and region for disambiguation
      const suggestionDetailsElement = document.createElement("span");
      suggestionDetailsElement.classList.add("search__place-details");
      suggestionDetailsElement.innerHTML = ` (${suggestion.country}, ${suggestion.admin1})`;
      suggestionElement.appendChild(suggestionDetailsElement);

      suggestionsListElement.appendChild(suggestionElement);
    });

    // Make the dropdown visible
    suggestionsListElement.classList.add("show");
  }
}

/**
 * Closes the suggestions dropdown when the user clicks anywhere
 * outside the search input or the suggestions list.
 */
document.addEventListener("click", (event) => {
  const isClickInside =
    suggestionsListElement.contains(event.target) ||
    searchInputElement.contains(event.target);

  if (!isClickInside) {
    suggestionsListElement.classList.remove("show");
  }
});

/**
 * Handles the search button click:
 *  - If suggestions exist and the input is long enough, fetches weather data.
 *  - If no suggestions exist (location not found), briefly adds a "no-result"
 *    CSS class to the container to show a visual feedback, then removes it after 2 seconds.
 *  - Clears the search input after every click.
 */
searchButtonElement.addEventListener("click", () => {
  if (suggestionsArrayCopy.length) {
    if (searchInputElement.value.length >= 2) {
      getWeatherInformation(location, units);
    }
  } else {
    // Trigger the "no result found" animation/style for 2 seconds
    containerElement.classList.add("no-result");

    setTimeout(() => {
      containerElement.classList.remove("no-result");
    }, 2000);
  }

  searchInputElement.value = "";
});

// ─── Weather Fetching ─────────────────────────────────────────────────────────

/**
 * Fetches weather data from the Open-Meteo Forecast API for a given location
 * and unit configuration, then triggers the UI to display the results.
 *
 * The API response includes:
 *  - `current`  : real-time conditions (temperature, humidity, wind, precipitation, weather code)
 *  - `hourly`   : hourly temperature and weather codes
 *  - `daily`    : daily min/max temperatures and weather codes
 *
 * After a successful fetch, the `weatherInformation` export is updated with the response
 * and a formatted `location` string, then it triggers three main UI update functions:
 * 1. renderWeatherInformation() - Updates current weather card
 * 2. renderDailyForecast()      - Updates the 7-day forecast list
 * 3. renderHourlyForecast()     - Updates the hourly breakdown cards
 *
 * On error, the "error" class is added to `document.body` to show the error overlay.
 *
 * @async
 * @export
 * @param {Object} locationObject              - The selected location
 * @param {number} locationObject.latitude     - Latitude coordinate
 * @param {number} locationObject.longitude    - Longitude coordinate
 * @param {string} locationObject.place        - Display name of the place
 * @param {string} locationObject.country      - Country name
 * @param {Object} unitsObject                 - User-selected unit preferences
 * @param {string} unitsObject.temperature     - Temperature unit (e.g. "celsius" | "fahrenheit")
 * @param {string} unitsObject.wind            - Wind speed unit (e.g. "kmh" | "mph" | "ms")
 * @param {string} unitsObject.precipitation   - Precipitation unit (e.g. "mm" | "inch")
 * @returns {Promise<void>}
 */
export async function getWeatherInformation(locationObject, unitsObject) {
  const { latitude, longitude, place, country } = locationObject;
  const { temperature, wind, precipitation } = unitsObject;

  try {
    const request = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m&hourly=temperature_2m,weather_code&daily=weather_code,temperature_2m_max,temperature_2m_min&wind_speed_unit=${wind}&precipitation_unit=${precipitation}&temperature_unit=${temperature}&timezone=auto`,
    );

    const response = await request.json();

    // Attach the formatted location string to the response before displaying
    weatherInformation = response;
    weatherInformation.location = `${place}, ${country}`;
    renderWeatherInformation();
    renderDailyForecast();
    renderHourlyForecast();
  } catch (err) {
    document.body.classList.add("error");
  }
}

// ─── Error Recovery ───────────────────────────────────────────────────────────

/**
 * Removes the "error" class from `document.body` when the user clicks the retry button,
 * restoring the app to its normal state so the user can search again.
 */
retryButtonELement.addEventListener("click", () => {
  document.body.classList.remove("error");
});
