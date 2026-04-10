# Implementation Overview

The Weather App is built as a collection of **ES6 modules** that each handle a specific responsibility. All modules are imported as `<script type="module">` tags in `index.html`, allowing the browser to load them asynchronously and share state via exported objects.

---

## Core Data Objects
| Object | Purpose | Exported From |
|--------|---------|---------------|
| `location` | Holds the current geographic coordinates, city (`place`), and country. Updated by `default-location.js` after the user grants geolocation permission. | `js/default-location.js` |
| `units` | Stores the active measurement system (temperature, wind, precipitation). Modified by `units.js` when the user toggles the unit switch or selects an individual unit. | `js/units.js` |
| `weatherInformation` | Container for the raw weather data returned by the OpenWeatherMap API. Populated by `search-bar.js`. | `js/search-bar.js` |

---

## Module Interaction Flow

1. **`default-location.js`**
   - On load, it calls `navigator.geolocation.getCurrentPosition` (wrapped in a Promise).
   - If permission is granted, it fetches the city and country via the **OpenStreetMap Nominatim** reverse‑geocoding endpoint.
   - The exported `location` object is mutated with the new `latitude`, `longitude`, `place`, and `country` values.
   - Regardless of success or failure, it invokes `getWeatherInformation(location, units)`.

2. **`search-bar.js`**
   - Exposes `getWeatherInformation(location, units)` which builds the request URL for **OpenWeatherMap** using the supplied `location` and `units`.
   - Performs the fetch, stores the JSON response in the exported `weatherInformation` object, and then triggers UI renderers:
     - `current-weather.js`
     - `daily-forecast.js`
     - `hourly-forecast.js`
   - Handles errors by adding an `error` class to the `<body>` (styled to show a friendly error screen).

3. **`units.js`**
   - Manages the UI for toggling between Metric and Imperial systems.
   - Updates the `units` object and calls `getWeatherInformation(location, units)` so the displayed values refresh instantly.
   - Also updates the visual state of the dropdown items to reflect the active unit.

4. **`current-weather.js`**, **`daily-forecast.js`**, **`hourly-forecast.js`**
   - Each module imports `weatherInformation` and renders its respective section of the UI.
   - They listen for changes indirectly because `search-bar.js` re‑calls them after every successful API fetch.

---

## Author

**@anasDef:** <https://github.com/anasDef>
