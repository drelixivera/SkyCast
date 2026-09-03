// src/components/weather/WeatherMap.jsx
// ============================================
// WEATHER MAP - INTERACTIVE RADAR MAP
// ============================================

import { useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Loader2 } from 'lucide-react';

// Custom marker icon
const createWeatherIcon = (iconCode) => {
  const iconUrl = `https://openweathermap.org/img/wn/${iconCode}.png`;
  return L.divIcon({
    html: `<img src="${iconUrl}" style="width: 40px; height: 40px; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3));" />`,
    className: '',
    iconSize: [40, 40],
    iconAnchor: [20, 40],
    popupAnchor: [0, -40],
  });
};

// Component to center the map on a city
function MapController({ center }) {
  const map = useMap();
  
  useEffect(() => {
    if (center) {
      map.flyTo(center, 10, { duration: 1.5 });
    }
  }, [center, map]);

  return null;
}

export default function WeatherMap({ weatherData, isLoading, onCityClick }) {
  const mapRef = useRef(null);
  const [mapCenter, setMapCenter] = useState([20, 0]);
  const [zoom, setZoom] = useState(2);

  // Update map center when weather data changes
  useEffect(() => {
    if (weatherData) {
      const lat = weatherData.coord?.lat || 0;
      const lon = weatherData.coord?.lon || 0;
      if (lat && lon) {
        setMapCenter([lat, lon]);
        setZoom(8);
      }
    }
  }, [weatherData]);

  // Sample cities data (in real app, this would come from API)
  const sampleCities = [
    { name: 'London', lat: 51.5074, lon: -0.1278, weather: 'Clouds', icon: '04d' },
    { name: 'Paris', lat: 48.8566, lon: 2.3522, weather: 'Clear', icon: '01d' },
    { name: 'New York', lat: 40.7128, lon: -74.0060, weather: 'Rain', icon: '10d' },
    { name: 'Tokyo', lat: 35.6762, lon: 139.6503, weather: 'Clear', icon: '01d' },
    { name: 'Sydney', lat: -33.8688, lon: 151.2093, weather: 'Clouds', icon: '03d' },
    { name: 'Cape Town', lat: -33.9249, lon: 18.4241, weather: 'Clear', icon: '01d' },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[400px] bg-white/10 backdrop-blur-md rounded-2xl border border-white/10">
        <div className="text-center text-white">
          <Loader2 className="w-10 h-10 animate-spin mx-auto mb-2" />
          <p className="text-white/60">Loading map...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10 shadow-2xl">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">🌍 Weather Map</h3>
        <span className="text-xs text-white/40">Click a marker for details</span>
      </div>
      
      <div className="rounded-xl overflow-hidden h-[400px] relative">
        <MapContainer
          center={mapCenter}
          zoom={zoom}
          style={{ height: '100%', width: '100%' }}
          className="rounded-xl"
          zoomControl={true}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          
          {/* Main city marker */}
          {weatherData && weatherData.coord && (
            <Marker
              position={[weatherData.coord.lat, weatherData.coord.lon]}
              icon={createWeatherIcon(weatherData.weather?.[0]?.icon || '01d')}
              eventHandlers={{
                click: () => onCityClick && onCityClick(weatherData),
              }}
            >
              <Popup>
                <div className="text-center min-w-[150px]">
                  <img
                    src={`https://openweathermap.org/img/wn/${weatherData.weather?.[0]?.icon}@2x.png`}
                    alt={weatherData.weather?.[0]?.description}
                    className="w-12 h-12 mx-auto"
                  />
                  <p className="font-bold text-lg">{weatherData.name}</p>
                  <p className="text-sm text-gray-600 capitalize">{weatherData.weather?.[0]?.description}</p>
                  <p className="text-xl font-bold">{Math.round(weatherData.main?.temp)}°C</p>
                </div>
              </Popup>
            </Marker>
          )}

          {/* Sample cities */}
          {sampleCities.map((city) => (
            <Marker
              key={city.name}
              position={[city.lat, city.lon]}
              icon={createWeatherIcon(city.icon)}
            >
              <Popup>
                <div className="text-center min-w-[120px]">
                  <img
                    src={`https://openweathermap.org/img/wn/${city.icon}@2x.png`}
                    alt={city.weather}
                    className="w-10 h-10 mx-auto"
                  />
                  <p className="font-bold">{city.name}</p>
                  <p className="text-sm text-gray-600">{city.weather}</p>
                </div>
              </Popup>
            </Marker>
          ))}

          <MapController center={mapCenter} />
        </MapContainer>
      </div>
      
      <div className="mt-3 flex flex-wrap gap-2 justify-center">
        <span className="text-xs text-white/40">🟢 Click any marker to see weather details</span>
      </div>
    </div>
  );
}