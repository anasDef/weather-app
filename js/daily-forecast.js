import { weatherInformation } from "./search-bar.js";
import { formatWeatherDate } from "./current-weather.js";

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

const dailyForecastList = document.getElementById("daily-forecastList");

export function renderDailyForecast() {
  dailyForecastList.innerHTML = "";
  // get the wanted data
  const { temperature_2m_max, temperature_2m_min, time, weather_code } =
    weatherInformation.daily;

  // all the data have the same length so use any one to start a loop
  time.forEach((date, index) => {
    // get day
    const day = formatWeatherDate(date, { weekday: "short" });

    // get weather icon
    const weatherCode = weather_code[index];

    // get temperature min and max
    const temperatureMin = temperature_2m_min[index];
    const temperatureMax = temperature_2m_max[index];

    // create forecast card element
    const forecastCardElement = document.createElement("li");
    forecastCardElement.classList.add("weather__forecast-card");

    // create forecast card date
    const DateElement = document.createElement("h3");
    DateElement.classList.add("weather__forecast-date");
    DateElement.innerHTML = day;

    // create weather icon
    const weatherIconElement = document.createElement("img");
    weatherIconElement.src = weatherCodes[weatherCode];
    weatherIconElement.alt = "";
    weatherIconElement.classList.add("weather__forecast-cardIcon");

    // create weather temp
    const weatherTemperatureElement = document.createElement("div");
    weatherTemperatureElement.classList.add("weather__forecast-cardTemp");

    const minTempElement = document.createElement("span");
    minTempElement.innerHTML = temperatureMin + "°";
    const maxTempElement = document.createElement("span");
    maxTempElement.innerHTML = temperatureMax + "°";

    weatherTemperatureElement.appendChild(maxTempElement);
    weatherTemperatureElement.appendChild(minTempElement);

    forecastCardElement.appendChild(DateElement);
    forecastCardElement.appendChild(weatherIconElement);
    forecastCardElement.appendChild(weatherTemperatureElement);

    dailyForecastList.appendChild(forecastCardElement);
  });
}
