import { getWeatherInformation } from "./search-bar.js";
import { units } from "./units.js";

/**
 * Default location used when the user denies geolocation permission.
 * This object will be updated with real coordinates and place information
 * if the user grants permission and the reverse‑geocoding request succeeds.
 */
export let location = {
  latitude: 31.20176,
  longitude: 29.91582,
  place: "Alexandria",
  country: "Egypt",
};

/**
 * Placeholder for the weather data returned by the API.
 */
export let weatherInformation = {};

/**
 * Wrap the Geolocation API in a Promise so it can be used with async/await.
 *
 * @returns {Promise<GeolocationPosition>} Resolves with the position object.
 */
function requestGeolocation() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Geolocation is not supported by this browser."));
      return;
    }
    navigator.geolocation.getCurrentPosition(resolve, reject);
  });
}

/**
 * Resolve a human‑readable city and country name from latitude/longitude
 * using the OpenStreetMap Nominatim reverse‑geocoding service.
 *
 * @param {number} latitude
 * @param {number} longitude
 * @returns {Promise<{city: string, country: string}>}
 */
async function resolveLocationName(latitude, longitude) {
  const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`;
  const response = await fetch(url);
  const data = await response.json();
  const address = data.address || {};
  // Nominatim may return city, town, village, or hamlet – pick the first available.
  const city =
    address.city || address.town || address.village || address.hamlet || "";
  const country = address.country || "";
  return { city, country };
}

/**
 * Initialise the location flow:
 *   1. Ask the user for geolocation permission.
 *   2. If granted, fetch the city/country name and update the exported `location`.
 *   3. In all cases, call `getWeatherInformation` with the (possibly updated) location
 *      and the imported `units` configuration.
 * Errors (permission denied, network failure, missing fields) are silently ignored –
 * the default location remains unchanged.
 */
async function initLocation() {
  try {
    const position = await requestGeolocation();
    const { latitude, longitude } = position.coords;
    const { city, country } = await resolveLocationName(latitude, longitude);

    // Update the exported location object (mutating the existing reference).
    location.latitude = latitude;
    location.longitude = longitude;
    if (city) location.place = city;
    if (country) location.country = country;
  } catch (error) {
    // Permission denied or any other error – keep the default location.
  } finally {
    // Always fetch weather information after attempting to resolve location.
    getWeatherInformation(location, units);
  }
}

// Execute the flow as soon as the module loads.
initLocation();
