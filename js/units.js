/**
 * @file units.js
 * @description Manages the measurement unit preferences (temperature, wind speed, precipitation)
 *              used when fetching weather data from the Open-Meteo Forecast API.
 *
 *              Provides two ways for the user to change units:
 *                1. A toggle button that switches between the full Metric and Imperial systems at once.
 *                2. A dropdown menu where each unit category can be changed individually.
 *
 * @dependencies
 *  - search-bar.js : Provides `getWeatherInformation()` to re-fetch weather when units change,
 *                    and `location` to pass the current location into that re-fetch.
 *
 * @exports units - The currently active unit configuration object { temperature, wind, precipitation }
 */

import { getWeatherInformation } from "./search-bar.js";
import { location } from "./default-location.js";

// ─── DOM Element References ───────────────────────────────────────────────────

const switchBtn = document.getElementById("switch-btn"); // Metric ↔ Imperial toggle button
const headerLists = document.getElementById("header-lists"); // The dropdown menu container
const showDropdownBtn = document.getElementById("show-dropdown-btn"); // Button that opens/closes the dropdown
const dropdownItems = document.querySelectorAll(".header__item"); // All individual unit option items
const unitSystemEle = document.getElementById("unite-system"); // Label that displays the active system name

// ─── Shared State ─────────────────────────────────────────────────────────────

/**
 * The currently selected measurement units, consumed by `getWeatherInformation()`
 * in search-bar.js when building the Open-Meteo API request URL.
 *
 * Defaults to the Metric system on page load.
 *
 * @type {{ temperature: string, wind: string, precipitation: string }}
 */
export let units = {
  temperature: "celsius",
  wind: "kmh",
  precipitation: "mm",
};

// ─── Functions ────────────────────────────────────────────────────────────────

/**
 * Switches all unit preferences at once between the Metric and Imperial systems.
 *
 * Metric  → Imperial : celsius/kmh/mm      becomes fahrenheit/mph/inch
 * Imperial → Metric  : fahrenheit/mph/inch becomes celsius/kmh/mm
 *
 * After updating `units`, it also flips the `data-system` attribute on the toggle
 * button so the next click knows which direction to switch, then syncs the
 * active-state styling on the dropdown items.
 *
 * @param {string} sys - The system that is currently active ("metric" or "imperial")
 * @returns {void}
 */
function toggleMeasurementSystem(sys) {
  if (sys === "metric") {
    // Switch to Imperial
    units = {
      temperature: "fahrenheit",
      wind: "mph",
      precipitation: "inch",
    };
    // Mark the button so the next click knows to switch back to metric
    switchBtn.setAttribute("data-system", "imperial");
  } else if (sys === "imperial") {
    // Switch back to Metric
    units = {
      temperature: "celsius",
      wind: "kmh",
      precipitation: "mm",
    };
    switchBtn.setAttribute("data-system", "metric");
  }

  // Re-sync the visual active state in the dropdown to reflect the new units
  updateActiveStatus();
}

/**
 * Iterates over every dropdown item and adds or removes the "active" CSS class
 * depending on whether that item's unit matches the current value in `units`.
 *
 * Each dropdown `<li>` element carries two data attributes:
 *  - `data-category` : which unit group it belongs to ("temperature", "wind", or "precipitation")
 *  - `data-unite`    : the unit value it represents (e.g. "celsius", "mph", "inch")
 *
 * This keeps the dropdown in sync after either a system toggle or an individual selection.
 *
 * @returns {void}
 */
function updateActiveStatus() {
  dropdownItems.forEach((item) => {
    const category = item.getAttribute("data-category");
    const unite = item.getAttribute("data-unite");

    // Highlight the item whose unit matches what is currently selected in `units`
    if (units[category] === unite) {
      item.classList.add("active");
    } else {
      item.classList.remove("active");
    }
  });
}

/**
 * Updates a single unit category inside the `units` object based on
 * the item the user clicked in the dropdown, then re-fetches weather
 * data using the updated units so the displayed values refresh immediately.
 *
 * @param {HTMLElement} element - The clicked dropdown `<li>` element,
 *                                expected to have `data-category` and `data-unite` attributes
 * @returns {void}
 */
function updateUnitSelection(element) {
  const unitCategory = element.getAttribute("data-category"); // e.g. "temperature"
  const unit = element.getAttribute("data-unite"); // e.g. "fahrenheit"

  // Patch only the relevant category; leave the others unchanged
  units[unitCategory] = unit;

  // Re-fetch weather with the updated units so the UI reflects the change
  getWeatherInformation(location, units);
}

// ─── Event Listeners ──────────────────────────────────────────────────────────

/**
 * Handles clicks on the Metric ↔ Imperial toggle button.
 *
 * Reads the current system from the button's `data-system` attribute,
 * passes it to `toggleMeasurementSystem()`, re-fetches weather data,
 * and updates the system label text in the header.
 */
switchBtn.addEventListener("click", () => {
  const unitSystem = switchBtn.getAttribute("data-system");
  toggleMeasurementSystem(unitSystem);
  getWeatherInformation(location, units);

  // Update the visible label to show which system was just switched FROM
  // (e.g. clicking while on metric shows "metric" as the previous state)
  unitSystemEle.innerHTML = unitSystem;
});

/**
 * Attaches a click listener to every individual unit option in the dropdown.
 *
 * On click:
 *  1. Calls `updateUnitSelection()` to update `units` and re-fetch weather.
 *  2. Removes "active" from all siblings in the same category to prevent
 *     multiple items in the same group from appearing selected at once.
 *  3. Adds "active" to the clicked item for visual feedback.
 */
dropdownItems.forEach((item) => {
  item.addEventListener("click", () => {
    updateUnitSelection(item);

    // Deactivate every other option that belongs to the same category
    document
      .querySelectorAll(`[data-category=${item.getAttribute("data-category")}]`)
      .forEach((it) => it.classList.remove("active"));

    // Mark this option as the currently selected one
    item.classList.add("active");
  });
});

/**
 * Toggles the visibility of the unit selection dropdown menu
 * by adding/removing the "active" class on the menu container.
 */
showDropdownBtn.addEventListener("click", () => {
  headerLists.classList.toggle("active");
});
