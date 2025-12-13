// ====== CONFIGURATION ======
const API_KEY = "57b400101e4ce266435cf89f21e01c8e";
const BASE_URL = "https://api.openweathermap.org/data/2.5/weather";

// ====== DOM ELEMENTS ======
const form = document.getElementById("weather-form");
const cityInput = document.getElementById("city-input");
const resultsSection = document.getElementById("results");
const errorSection = document.getElementById("error");
const loadingEl = document.getElementById("loading");
const recentSection = document.getElementById("recent");
const recentButtons = document.getElementById("recent-buttons");


const cityNameEl = document.getElementById("city-name");
const descriptionEl = document.getElementById("description");
const temperatureEl = document.getElementById("temperature");
const feelsLikeEl = document.getElementById("feels-like");
const humidityEl = document.getElementById("humidity");
const windEl = document.getElementById("wind");
const cloudsEl = document.getElementById("clouds");
const sunTimesEl = document.getElementById("sun-times");

// ====== STATE ======
let currentUnits = "metric"; // metric = Celsius, imperial = Fahrenheit

// ====== TIME FORMATTER ======
function formatTimeFromUnix(timestamp, timezoneOffsetSeconds) {
  const localMillis = (timestamp + timezoneOffsetSeconds) * 1000;
  const date = new Date(localMillis);
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

// ====== UI HELPERS ======
function resetUIForRequest() {
  errorSection.textContent = "";
  errorSection.classList.add("hidden");
  resultsSection.classList.add("hidden");
}

function showLoading(show) {
  if (!loadingEl) return;
  if (show) loadingEl.classList.remove("hidden");
  else loadingEl.classList.add("hidden");
}

function showError(message) {
  errorSection.textContent = message;
  errorSection.classList.remove("hidden");
}
// ====== RECENT SEARCHES (localStorage) ======
function getRecentCities() {
  return JSON.parse(localStorage.getItem("recentCities")) || [];
}

function saveRecentCity(city) {
  let cities = getRecentCities();
  cities = [city, ...cities.filter(c => c !== city)].slice(0, 5);
  localStorage.setItem("recentCities", JSON.stringify(cities));
  renderRecentCities();
}

function renderRecentCities() {
  const cities = getRecentCities();
  recentButtons.innerHTML = "";

  if (cities.length === 0) {
    recentSection.classList.add("hidden");
    return;
  }

  cities.forEach(city => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.textContent = city;
    btn.addEventListener("click", () => {
      cityInput.value = city;
      getWeather(city);
    });
    recentButtons.appendChild(btn);
  });

  recentSection.classList.remove("hidden");
}

// ====== FETCH WEATHER DATA ======
async function getWeather(city) {
  const url = `${BASE_URL}?q=${encodeURIComponent(city)}&appid=${API_KEY}&units=${currentUnits}`;

  resetUIForRequest();
  showLoading(true);

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
    showError(error.message);
  } finally {
    showLoading(false);
  }
}

// ====== RENDER UI ======
function displayWeather(data) {
  const timezoneOffset = data.timezone;
  const sunriseTime = formatTimeFromUnix(data.sys.sunrise, timezoneOffset);
  const sunsetTime = formatTimeFromUnix(data.sys.sunset, timezoneOffset);

  const unitSymbol = currentUnits === "imperial" ? "°F" : "°C";
  const windUnits = currentUnits === "imperial" ? "mph" : "m/s";

  cityNameEl.textContent = `${data.name}, ${data.sys.country}`;
  descriptionEl.textContent = data.weather[0].description;

  temperatureEl.textContent = `Temperature: ${Math.round(data.main.temp)} ${unitSymbol}`;
  feelsLikeEl.textContent = `Feels like: ${Math.round(data.main.feels_like)} ${unitSymbol}`;
  humidityEl.textContent = `Humidity: ${data.main.humidity}%`;
  windEl.textContent = `Wind Speed: ${data.wind.speed} ${windUnits}`;
  cloudsEl.textContent = `Cloud Coverage: ${data.clouds.all}%`;
  sunTimesEl.textContent = `Sunrise: ${sunriseTime} • Sunset: ${sunsetTime}`;
saveRecentCity(`${data.name}, ${data.sys.country}`);

  resultsSection.classList.remove("hidden");
}

// ====== EVENTS ======
form.addEventListener("submit", (event) => {
  event.preventDefault();
  const city = cityInput.value.trim();
  if (!city) return;
  getWeather(city);
});

// Unit toggle radios
document.querySelectorAll('input[name="units"]').forEach((radio) => {
  radio.addEventListener("change", (e) => {
    currentUnits = e.target.value;
    const city = cityInput.value.trim();
    if (city) getWeather(city);
  });
});
renderRecentCities();
