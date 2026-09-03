// src/services/weatherApi.js
// ============================================
// WEATHER API SERVICE
// ============================================
// Handles all API calls to OpenWeatherMap

const API_KEY = import.meta.env.VITE_WEATHER_API_KEY;
const BASE_URL = 'https://api.openweathermap.org/data/2.5';

// Fetch current weather by city name
export const fetchCurrentWeather = async (city) => {
  const response = await fetch(
    `${BASE_URL}/weather?q=${encodeURIComponent(city)}&appid=${API_KEY}&units=metric`
  );
  
  if (!response.ok) {
    throw new Error('City not found');
  }
  
  return response.json();
};

// Fetch 5-day forecast by city name
export const fetchForecast = async (city) => {
  const response = await fetch(
    `${BASE_URL}/forecast?q=${encodeURIComponent(city)}&appid=${API_KEY}&units=metric`
  );
  
  if (!response.ok) {
    throw new Error('City not found');
  }
  
  return response.json();
};

// Fetch weather by coordinates (for geolocation)
export const fetchWeatherByCoords = async (lat, lon) => {
  const response = await fetch(
    `${BASE_URL}/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`
  );
  
  if (!response.ok) {
    throw new Error('Location not found');
  }
  
  return response.json();
};