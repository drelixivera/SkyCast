// src/pages/Dashboard.jsx
// ============================================
// DASHBOARD - WITH FIXED VOICE SEARCH
// ============================================

import { useState, useEffect, useRef } from 'react';
import { 
  Search, Loader2, X, Thermometer, Droplets, Wind, Eye, Compass, MapPin, Clock, Mic, MicOff 
} from 'lucide-react';
import { useRecentSearches } from '../hooks/useRecentSearches';
import SkeletonCard from '../components/common/SkeletonCard';

const API_KEY = import.meta.env.VITE_WEATHER_API_KEY;
const BASE_URL = 'https://api.openweathermap.org/data/2.5';

export default function Dashboard() {
  const [city, setCity] = useState('');
  const [weather, setWeather] = useState(null);
  const [forecast, setForecast] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [unit, setUnit] = useState('metric');
  const [isLocating, setIsLocating] = useState(false);
  const [locationDetected, setLocationDetected] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const { recentSearches, addSearch, clearSearches } = useRecentSearches();
  
  const recognitionRef = useRef(null);
  const inputRef = useRef(null);

  // ===== VOICE SEARCH - FIXED (NO INFINITE LOOP) =====
  const startVoiceSearch = () => {
    // Check if browser supports speech recognition
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      setError('Voice search is not supported in your browser.');
      return;
    }

    // Don't start if already listening
    if (isListening) return;

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = 'en-US';
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        console.log('🎤 Voice recognition started');
        setIsListening(true);
        setTranscript('');
        setError(null);
      };

      recognition.onresult = (event) => {
        console.log('🎤 Voice result received');
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          }
        }

        if (finalTranscript) {
          const cityName = finalTranscript.trim();
          if (cityName) {
            console.log(`🔍 Searching for: ${cityName}`);
            setCity(cityName);
            setLocationDetected(false);
            fetchWeather(cityName);
            setTranscript(`✅ Found: "${cityName}"`);
            setTimeout(() => setTranscript(''), 2000);
            
            // Stop listening after getting result
            try {
              recognition.stop();
            } catch (e) {
              // Ignore
            }
          }
        }
      };

      recognition.onerror = (event) => {
        console.log('🎤 Voice error:', event.error);
        setIsListening(false);
        
        // Only show errors for user-facing issues
        if (event.error === 'not-allowed') {
          setError('Please allow microphone access.');
        } else if (event.error === 'audio-capture') {
          setError('No microphone found.');
        } else if (event.error === 'no-speech') {
          setTranscript('No speech detected. Try again.');
          setTimeout(() => setTranscript(''), 2000);
        } else {
          // For network errors or other issues, just show a generic message
          setTranscript('Voice search failed. Please type your city.');
          setTimeout(() => setTranscript(''), 2000);
        }
        // ❌ REMOVED: No automatic retry - let user click again
      };

      recognition.onend = () => {
        console.log('🎤 Voice recognition ended');
        setIsListening(false);
      };

      // Store reference
      recognitionRef.current = recognition;

      // Start recognition
      recognition.start();
      
      // Auto-stop after 8 seconds
      const timeoutId = setTimeout(() => {
        if (isListening) {
          try {
            recognition.stop();
          } catch (e) {
            // Ignore
          }
          setIsListening(false);
          setTranscript('⏱️ Timeout - click mic to try again');
          setTimeout(() => setTranscript(''), 2000);
        }
      }, 8000);

      // Store timeout ID for cleanup
      recognition._timeoutId = timeoutId;

    } catch (err) {
      console.error('Voice search error:', err);
      setError('Voice search failed. Please try typing.');
      setIsListening(false);
    }
  };

  const stopVoiceSearch = () => {
    setIsListening(false);
    setTranscript('');
    if (recognitionRef.current) {
      try {
        // Clear the timeout if it exists
        if (recognitionRef.current._timeoutId) {
          clearTimeout(recognitionRef.current._timeoutId);
        }
        recognitionRef.current.stop();
      } catch (e) {
        // Ignore
      }
    }
  };

  // ===== GEOLOCATION =====
  const detectLocation = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser.');
      return;
    }

    setIsLocating(true);
    setError(null);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const [weatherRes, forecastRes] = await Promise.all([
            fetch(`${BASE_URL}/weather?lat=${latitude}&lon=${longitude}&appid=${API_KEY}&units=${unit}`),
            fetch(`${BASE_URL}/forecast?lat=${latitude}&lon=${longitude}&appid=${API_KEY}&units=${unit}`)
          ]);

          if (!weatherRes.ok || !forecastRes.ok) {
            throw new Error('Unable to fetch weather data.');
          }

          const weatherData = await weatherRes.json();
          const forecastData = await forecastRes.json();

          setWeather(weatherData);
          setForecast(forecastData);
          setLocationDetected(true);
          addSearch(weatherData.name);
        } catch (err) {
          setError(err.message);
        } finally {
          setIsLocating(false);
        }
      },
      () => {
        setError('Location access denied. Please search for a city manually.');
        setIsLocating(false);
        fetchWeather('London');
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  // ===== FETCH WEATHER & FORECAST =====
  const fetchWeather = async (cityName) => {
    try {
      setLoading(true);
      setError(null);

      const [weatherRes, forecastRes] = await Promise.all([
        fetch(`${BASE_URL}/weather?q=${encodeURIComponent(cityName)}&appid=${API_KEY}&units=${unit}`),
        fetch(`${BASE_URL}/forecast?q=${encodeURIComponent(cityName)}&appid=${API_KEY}&units=${unit}`)
      ]);

      if (!weatherRes.ok || !forecastRes.ok) {
        if (weatherRes.status === 404) {
          throw new Error('City not found. Please check the spelling.');
        }
        throw new Error('Something went wrong. Please try again.');
      }

      const weatherData = await weatherRes.json();
      const forecastData = await forecastRes.json();

      setWeather(weatherData);
      setForecast(forecastData);
      addSearch(cityName);
    } catch (err) {
      setError(err.message);
      setWeather(null);
      setForecast(null);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (!city.trim()) return;
    setLocationDetected(false);
    fetchWeather(city.trim());
    setCity('');
  };

  const handleRecentClick = (cityName) => {
    setLocationDetected(false);
    fetchWeather(cityName);
  };

  const toggleUnit = () => {
    setUnit(unit === 'metric' ? 'imperial' : 'metric');
    if (weather) {
      fetchWeather(weather.name);
    }
  };

  const handleRetryLocation = () => {
    detectLocation();
  };

  // ===== ON MOUNT =====
  useEffect(() => {
    const timer = setTimeout(detectLocation, 500);
    return () => clearTimeout(timer);
  }, []);

  // ===== CLEANUP RECOGNITION ON UNMOUNT =====
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try {
          if (recognitionRef.current._timeoutId) {
            clearTimeout(recognitionRef.current._timeoutId);
          }
          recognitionRef.current.stop();
        } catch (e) {
          // Ignore
        }
      }
    };
  }, []);

  // ===== HELPERS =====
  const formatTemp = (temp) => Math.round(temp);
  const getUnitSymbol = () => (unit === 'metric' ? '°C' : '°F');
  const getWeatherIcon = (iconCode) => `https://openweathermap.org/img/wn/${iconCode}@2x.png`;

  const getDate = (timestamp) => {
    return new Date(timestamp * 1000).toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getTime = (timestamp) => {
    return new Date(timestamp * 1000).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getHourlyForecast = () => {
    if (!forecast) return [];
    const hourlyData = forecast.list.slice(0, 8);
    return hourlyData.map(item => ({
      time: new Date(item.dt * 1000).toLocaleTimeString('en-US', {
        hour: 'numeric',
        hour12: true,
      }),
      temp: Math.round(item.main.temp),
      icon: item.weather[0].icon,
      description: item.weather[0].description,
    }));
  };

  // ===== RENDER =====
  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: 'url(https://images.unsplash.com/photo-1534088568595-a066f410bcda?w=1600)',
        }}
      />
      
      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-black/50" />

      {/* Content */}
      <div className="relative z-10 min-h-screen p-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-white tracking-tight">
                SkyCast
              </h1>
              <p className="text-white/50 text-sm">Real-time weather updates</p>
            </div>
            
            <button
              onClick={toggleUnit}
              className="flex items-center gap-2 bg-white/10 backdrop-blur-sm text-white px-4 py-2 rounded-full hover:bg-white/20 transition border border-white/10"
            >
              <Thermometer className="w-4 h-4" />
              <span className="text-sm font-medium">
                {unit === 'metric' ? '°C' : '°F'}
              </span>
            </button>
          </div>

          {/* Search Bar with Voice Button */}
          <form onSubmit={handleSearch} className="relative max-w-md mx-auto mb-4">
            <div className="relative flex items-center gap-2">
              <div className="relative flex-1">
                <input
                  ref={inputRef}
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder={isListening ? "🎤 Listening..." : "Search for a city..."}
                  className="w-full px-5 py-4 pl-12 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 text-white placeholder-white/50 focus:ring-2 focus:ring-white/30 focus:outline-none transition"
                  disabled={loading || isLocating || isListening}
                />
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                {(loading || isLocating) && (
                  <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40 animate-spin" />
                )}
              </div>

              {/* Voice Search Button */}
              <button
                type="button"
                onClick={isListening ? stopVoiceSearch : startVoiceSearch}
                className={`px-4 py-4 rounded-2xl transition-all duration-300 flex items-center justify-center ${
                  isListening 
                    ? 'bg-red-500/80 hover:bg-red-600/80 shadow-lg shadow-red-500/20' 
                    : 'bg-white/10 backdrop-blur-md hover:bg-white/20 border border-white/10'
                }`}
                aria-label={isListening ? 'Stop listening' : 'Search by voice'}
                disabled={loading || isLocating}
              >
                {isListening ? (
                  <MicOff className="w-5 h-5 text-white animate-pulse" />
                ) : (
                  <Mic className="w-5 h-5 text-white" />
                )}
              </button>
            </div>

            {/* Transcript display */}
            {isListening && (
              <div className="absolute top-full left-0 right-0 mt-2 p-3 bg-white/10 backdrop-blur-md rounded-xl text-white text-sm text-center border border-white/10">
                <span className="text-white/60">🎤</span> 
                {transcript || 'Listening... Speak now'}
              </div>
            )}
          </form>

          {/* Geolocation Status */}
          <div className="flex flex-wrap items-center justify-center gap-2 max-w-md mx-auto mb-4">
            {isLocating ? (
              <div className="flex items-center gap-2 text-white/60 text-sm">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Detecting your location...</span>
              </div>
            ) : locationDetected ? (
              <div className="flex items-center gap-2 text-white/40 text-sm">
                <MapPin className="w-4 h-4" />
                <span>📍 Using your location</span>
              </div>
            ) : null}

            {error && !isLocating && (
              <button
                onClick={handleRetryLocation}
                className="text-sm text-white/60 hover:text-white transition underline underline-offset-2"
              >
                Try detecting location again
              </button>
            )}
          </div>

          {/* Recent Searches */}
          {recentSearches.length > 0 && (
            <div className="flex flex-wrap items-center justify-center gap-2 max-w-md mx-auto mb-8">
              {recentSearches.map((cityName) => (
                <button
                  key={cityName}
                  onClick={() => handleRecentClick(cityName)}
                  className="px-4 py-1.5 bg-white/10 backdrop-blur-sm text-white/80 text-sm rounded-full hover:bg-white/20 transition border border-white/5"
                >
                  {cityName}
                </button>
              ))}
              <button
                onClick={clearSearches}
                className="text-white/30 hover:text-white/60 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Error Message */}
          {error && !isLocating && (
            <div className="max-w-md mx-auto bg-red-500/20 backdrop-blur-sm text-white p-4 rounded-2xl text-center border border-red-500/20">
              {error}
            </div>
          )}

          {/* Weather Display */}
          {loading || isLocating ? (
            <SkeletonCard />
          ) : !error && weather ? (
            <div className="relative">
              <div className="relative z-10 space-y-6">
                {/* Main Weather Card */}
                <div className="bg-white/10 backdrop-blur-md rounded-3xl p-8 text-white border border-white/10 shadow-2xl">
                  <div className="text-center">
                    <h2 className="text-4xl font-bold">{weather.name}, {weather.sys?.country}</h2>
                    <p className="text-white/60">{getDate(weather.dt)}</p>
                  </div>

                  <div className="flex flex-col md:flex-row items-center justify-center gap-6 mt-4">
                    <div className="flex items-center gap-4">
                      <img
                        src={getWeatherIcon(weather.weather?.[0]?.icon)}
                        alt={weather.weather?.[0]?.description}
                        className="w-24 h-24"
                      />
                      <div>
                        <p className="text-6xl font-bold">
                          {formatTemp(weather.main?.temp)}{getUnitSymbol()}
                        </p>
                        <p className="text-white/60 text-lg capitalize">
                          {weather.weather?.[0]?.description}
                        </p>
                      </div>
                    </div>
                    <div className="text-center md:text-left">
                      <p className="text-white/50 text-sm">
                        Feels like {formatTemp(weather.main?.feels_like)}{getUnitSymbol()}
                      </p>
                      <p className="text-white/50 text-sm">
                        Sunrise: {getTime(weather.sys?.sunrise)} · Sunset: {getTime(weather.sys?.sunset)}
                      </p>
                    </div>
                  </div>

                  {/* Details Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8 pt-6 border-t border-white/10">
                    <div className="text-center p-3 bg-white/5 rounded-xl">
                      <Droplets className="w-5 h-5 mx-auto text-white/50 mb-1" />
                      <p className="text-white/50 text-xs">Humidity</p>
                      <p className="text-lg font-semibold">{weather.main?.humidity}%</p>
                    </div>
                    <div className="text-center p-3 bg-white/5 rounded-xl">
                      <Wind className="w-5 h-5 mx-auto text-white/50 mb-1" />
                      <p className="text-white/50 text-xs">Wind</p>
                      <p className="text-lg font-semibold">{Math.round(weather.wind?.speed)} {unit === 'metric' ? 'km/h' : 'mph'}</p>
                    </div>
                    <div className="text-center p-3 bg-white/5 rounded-xl">
                      <Eye className="w-5 h-5 mx-auto text-white/50 mb-1" />
                      <p className="text-white/50 text-xs">Visibility</p>
                      <p className="text-lg font-semibold">{(weather.visibility || 0) / 1000} km</p>
                    </div>
                    <div className="text-center p-3 bg-white/5 rounded-xl">
                      <Compass className="w-5 h-5 mx-auto text-white/50 mb-1" />
                      <p className="text-white/50 text-xs">Pressure</p>
                      <p className="text-lg font-semibold">{weather.main?.pressure} hPa</p>
                    </div>
                  </div>
                </div>

                {/* Hourly Forecast */}
                <div className="bg-white/10 backdrop-blur-md rounded-3xl p-6 text-white border border-white/10 shadow-2xl">
                  <div className="flex items-center gap-2 mb-4">
                    <Clock className="w-5 h-5 text-white/60" />
                    <h3 className="text-lg font-semibold">Hourly Forecast</h3>
                  </div>
                  <div className="flex overflow-x-auto gap-6 pb-4 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                    {getHourlyForecast().map((hour, index) => (
                      <div key={index} className="flex flex-col items-center min-w-[70px]">
                        <p className="text-sm text-white/60">{hour.time}</p>
                        <img
                          src={getWeatherIcon(hour.icon)}
                          alt={hour.description}
                          className="w-10 h-10"
                        />
                        <p className="text-sm font-semibold">{hour.temp}{getUnitSymbol()}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center text-white/50 text-lg mt-12">
              <p>🌤️ Search for a city to see the weather</p>
              <p className="text-sm mt-2 text-white/30">Enter a city name above to get started</p>
            </div>
          )}

          {/* Powered by */}
          <p className="text-center text-white/20 text-xs mt-6">
            Powered by OpenWeatherMap
          </p>
        </div>
      </div>
    </div>
  );
}