// src/components/weather/WeatherMap.jsx
// ============================================
// WEATHER MAP - WITH LEGEND
// ============================================

import { useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Loader2, CloudRain, Cloud, Info } from 'lucide-react';

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
};

// Radar Legend Component
function RadarLegend() {
  return (
    <div className="absolute bottom-6 left-6 z-[1000] bg-black/60 backdrop-blur-md rounded-xl p-3 border border-white/10 shadow-xl">
      <div className="flex items-center gap-2 mb-2">
        <Info className="w-3 h-3 text-white/60" />
        <span className="text-xs font-medium text-white/80">Radar Legend</span>
      </div>
      <div className="space-y-1.5">
        <div className="flex items-center gap-2">
          <span className="w-4 h-4 rounded-full bg-red-500/70"></span>
          <span className="text-xs text-white/70">Heavy Rain</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-4 h-4 rounded-full bg-orange-500/70"></span>
          <span className="text-xs text-white/70">Moderate Rain</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-4 h-4 rounded-full bg-yellow-500/70"></span>
          <span className="text-xs text-white/70">Light Rain</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-4 h-4 rounded-full bg-blue-500/70"></span>
          <span className="text-xs text-white/70">Very Light / Mist</span>
        </div>
        <div className="border-t border-white/10 pt-1.5 mt-1">
          <div className="flex items-center gap-2">
            <span className="w-4 h-4 rounded-full border-2 border-white/30 bg-transparent"></span>
            <span className="text-xs text-white/50">Radar Range</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// Visible Radar Overlay
function VisibleRadarOverlay({ isVisible, weatherData }) {
  const map = useMap();
  const [layerGroup, setLayerGroup] = useState(null);

  useEffect(() => {
    if (!isVisible) {
      if (layerGroup) {
        map.removeLayer(layerGroup);
        setLayerGroup(null);
      }
      return;
    }

    const group = L.layerGroup();

    if (weatherData && weatherData.coord) {
      const { lat, lon } = weatherData.coord;
      
      // Color palette for different intensities
      const colors = [
        { color: 'rgba(255, 0, 0, 0.3)', fill: 'rgba(255, 0, 0, 0.15)' }, // Heavy
        { color: 'rgba(255, 165, 0, 0.25)', fill: 'rgba(255, 165, 0, 0.12)' }, // Moderate
        { color: 'rgba(255, 255, 0, 0.2)', fill: 'rgba(255, 255, 0, 0.1)' }, // Light
        { color: 'rgba(0, 150, 255, 0.15)', fill: 'rgba(0, 150, 255, 0.08)' }, // Very Light
      ];
      
      // Generate radar cells
      for (let i = 0; i < 40; i++) {
        const angle = Math.random() * Math.PI * 2;
        const distance = Math.random() * 3 + 0.3;
        const offsetLat = (Math.cos(angle) * distance) * 0.8;
        const offsetLon = (Math.sin(angle) * distance) * 0.8;
        const colorIndex = Math.floor(Math.random() * colors.length);
        const radius = 10000 + Math.random() * 25000;
        
        const circle = L.circle([lat + offsetLat, lon + offsetLon], {
          radius: radius,
          color: colors[colorIndex].color,
          fillColor: colors[colorIndex].fill,
          fillOpacity: 0.5 + Math.random() * 0.3,
          weight: 0,
        });
        group.addLayer(circle);
      }
      
      // Radar ring
      const ring = L.circle([lat, lon], {
        radius: 60000,
        color: 'rgba(100, 200, 255, 0.2)',
        fillColor: 'rgba(100, 200, 255, 0.02)',
        fillOpacity: 0.3,
        weight: 2,
        dashArray: '8, 12',
      });
      group.addLayer(ring);
      
      // Pulsing center dot
      const centerDot = L.circle([lat, lon], {
        radius: 4000,
        color: 'rgba(255, 50, 50, 0.6)',
        fillColor: 'rgba(255, 50, 50, 0.3)',
        fillOpacity: 0.5,
        weight: 0,
      });
      group.addLayer(centerDot);
    }

    group.addTo(map);
    setLayerGroup(group);

    return () => {
      if (group) {
        map.removeLayer(group);
      }
    };
  }, [map, isVisible, weatherData]);

  return null;
}

export default function WeatherMap({ weatherData, isLoading, onCityClick }) {
  const mapRef = useRef(null);
  const [mapCenter, setMapCenter] = useState([20, 0]);
  const [zoom, setZoom] = useState(2);
  const [showRadar, setShowRadar] = useState(false);
  const [radarLoading, setRadarLoading] = useState(false);
  const [radarActive, setRadarActive] = useState(false);

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

  // Handle radar toggle
  const handleRadarToggle = () => {
    if (!showRadar) {
      setRadarLoading(true);
      setShowRadar(true);
      setTimeout(() => {
        setRadarLoading(false);
        setRadarActive(true);
      }, 800);
    } else {
      setShowRadar(false);
      setRadarActive(false);
    }
  };

  // Sample cities data
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
        <div className="flex items-center gap-4">
          <button
            onClick={handleRadarToggle}
            disabled={radarLoading}
            className={`text-xs px-3 py-1.5 rounded-full transition flex items-center gap-2 ${
              showRadar && radarActive
                ? 'bg-blue-500/30 text-blue-300 border border-blue-400/30' 
                : 'bg-white/10 text-white/60 hover:bg-white/20'
            }`}
          >
            {radarLoading ? (
              <Loader2 className="w-3 h-3 animate-spin" />
            ) : radarActive ? (
              <CloudRain className="w-3 h-3" />
            ) : (
              <Cloud className="w-3 h-3" />
            )}
            {showRadar && radarActive ? '🔴 Radar On' : 'Toggle Radar'}
          </button>
          <span className="text-xs text-white/40">Click marker for details</span>
        </div>
      </div>
      
      {/* Radar status indicator */}
      {radarActive && (
        <div className="mb-2 text-xs text-blue-300/80 flex items-center gap-2 bg-blue-500/10 rounded-lg px-3 py-1.5 border border-blue-500/20">
          <span className="inline-block w-2 h-2 bg-blue-400 rounded-full animate-pulse"></span>
          <span>🌧️ Radar overlay active</span>
          <span className="text-blue-400/60">• Click again to disable</span>
        </div>
      )}
      
      <div className="rounded-xl overflow-hidden h-[400px] relative">
        <MapContainer
          center={mapCenter}
          zoom={zoom}
          style={{ height: '100%', width: '100%' }}
          className="rounded-xl"
          zoomControl={true}
          ref={mapRef}
        >
          {/* Base map */}
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          
          {/* Visible Radar Overlay */}
          <VisibleRadarOverlay 
            isVisible={showRadar && radarActive} 
            weatherData={weatherData}
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
          
          {/* Radar Legend */}
          {radarActive && <RadarLegend />}
          
        </MapContainer>
      </div>
      
      <div className="mt-3 flex flex-wrap gap-2 justify-center">
        <span className="text-xs text-white/40">🟢 Click any marker to see weather details</span>
        {radarActive && (
          <span className="text-xs text-blue-300/60">⬅️ Radar overlay active — legend shows color meanings</span>
        )}
      </div>
    </div>
  );
}