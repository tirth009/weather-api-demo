// ====== CONFIGURATION ======
const API_KEY = "e1e8269e0e5e724bd8ba712a983408e3";
const BASE_URL = "https://api.openweathermap.org/data/2.5/weather";

// ====== DOM ELEMENTS ======
const form = document.getElementById("weather-form");
const cityInput = document.getElementById("city-input");
const resultsSection = document.getElementById("results");
const errorSection = document.getElementById("error");

const cityNameEl = document.getElementById("city-name");
const descriptionEl = document.getElementById("description");
const temperatureEl = document.getElementById("temperature");
const feelsLikeEl = document.getElementById("feels-like");
const humidityEl = document.getElementById("humidity");
const windEl = document.getElementById("wind");
const cloudsEl = document.getElementById("clouds");
const sunTimesEl = document.getElementById("sun-times");

// ====== TIME FORMATTER ======
function formatTimeFromUnix(timestamp, timezoneOffsetSeconds) {
  const localMillis = (timestamp + timezoneOffsetSeconds) * 1000;
  const date = new Date(localMillis);
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

// ====== FETCH WEATHER DATA ======
async function getWeather(city) {
  const url = `${BASE_URL}?q=${encodeURIComponent(city)}&appid=${API_KEY}&units=metric`;

  // Reset UI before new request
  errorSection.textContent = "";
  errorSection.classList.add("hidden");
  resultsSection.classList.add("hidden");

  try {
    const response = await fetch(url);

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error("City not found — check spelling and try again.");
      } else if (response.status === 401) {
        throw new Error("Invalid API key — check your key and try again.");
      } else {
        throw new Error("Unable to get weather data — please try later.");
      }
    }

    const data = await response.json();
    displayWeather(data);
  } catch (error) {
    errorSection.textContent = error.message;
    errorSection.classList.remove("hidden");
  }
}

// ====== RENDER UI ======
function displayWeather(data) {
  const timezoneOffset = data.timezone;
  const sunriseTime = formatTimeFromUnix(data.sys.sunrise, timezoneOffset);
  const sunsetTime = formatTimeFromUnix(data.sys.sunset, timezoneOffset);

  cityNameEl.textContent = `${data.name}, ${data.sys.country}`;
  descriptionEl.textContent = data.weather[0].description;
  temperatureEl.textContent = `Temperature: ${Math.round(data.main.temp)} °C`;
  feelsLikeEl.textContent = `Feels like: ${Math.round(data.main.feels_like)} °C`;
  humidityEl.textContent = `Humidity: ${data.main.humidity}%`;
  windEl.textContent = `Wind Speed: ${data.wind.speed} m/s`;
  cloudsEl.textContent = `Cloud Coverage: ${data.clouds.all}%`;
  sunTimesEl.textContent = `Sunrise: ${sunriseTime} • Sunset: ${sunsetTime}`;

  resultsSection.classList.remove("hidden");
}

// ====== FORM HANDLER ======
form.addEventListener("submit", (event) => {
  event.preventDefault();
  const city = cityInput.value.trim();
  if (!city) return;
  getWeather(city);
});
