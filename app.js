const API_KEY = "YOUR_API_KEY_HERE"; // 🔴 Replace with your real API key later
const BASE_URL = "https://api.openweathermap.org/data/2.5/weather";

// Temporary simple version: just fetch + console.log
async function getWeather(city) {
  const url = `${BASE_URL}?q=${encodeURIComponent(city)}&appid=${API_KEY}&units=metric`;

  try {
    const response = await fetch(url);
    const data = await response.json();
    console.log("Weather API response:", data); // 👀 Output in console
  } catch (error) {
    console.error("Error fetching weather:", error);
  }
}

document.getElementById("weather-form").addEventListener("submit", (event) => {
  event.preventDefault();
  const city = document.getElementById("city-input").value.trim();
  if (!city) return;
  getWeather(city);
});
