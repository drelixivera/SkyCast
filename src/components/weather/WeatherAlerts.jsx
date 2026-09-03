// src/components/weather/WeatherAlerts.jsx
// ============================================
// WEATHER ALERTS - SEVERE WEATHER WARNINGS
// ============================================

import { useState, useEffect } from 'react';
import { AlertTriangle, X, Info, AlertCircle, Wind, Droplets, Thermometer, CloudLightning } from 'lucide-react';

// Sample alert data (in a real app, this would come from an API)
const generateMockAlerts = (cityName) => {
  const alerts = [];
  const alertTypes = [
    {
      type: 'Flood Warning',
      icon: Droplets,
      color: 'bg-blue-500/20 border-blue-500/30',
      iconColor: 'text-blue-400',
      severity: 'warning',
      description: 'Heavy rainfall expected. Avoid low-lying areas.'
    },
    {
      type: 'Severe Thunderstorm',
      icon: CloudLightning,
      color: 'bg-orange-500/20 border-orange-500/30',
      iconColor: 'text-orange-400',
      severity: 'watch',
      description: 'Severe thunderstorms with damaging winds possible.'
    },
    {
      type: 'Extreme Heat Advisory',
      icon: Thermometer,
      color: 'bg-red-500/20 border-red-500/30',
      iconColor: 'text-red-400',
      severity: 'advisory',
      description: 'Dangerous heat levels expected. Stay hydrated and indoors.'
    },
    {
      type: 'High Wind Warning',
      icon: Wind,
      color: 'bg-yellow-500/20 border-yellow-500/30',
      iconColor: 'text-yellow-400',
      severity: 'warning',
      description: 'Gusty winds up to 60 mph expected. Secure outdoor objects.'
    }
  ];

  // Randomly select 1-2 alerts
  const numAlerts = Math.floor(Math.random() * 2) + 1;
  const shuffled = [...alertTypes].sort(() => 0.5 - Math.random());
  
  for (let i = 0; i < numAlerts && i < shuffled.length; i++) {
    const alert = shuffled[i];
    alerts.push({
      id: `alert-${Date.now()}-${i}`,
      type: alert.type,
      icon: alert.icon,
      color: alert.color,
      iconColor: alert.iconColor,
      severity: alert.severity,
      description: alert.description,
      location: cityName || 'Your Area',
      issued: new Date().toLocaleString(),
    });
  }
  
  return alerts;
};

export default function WeatherAlerts({ cityName }) {
  const [alerts, setAlerts] = useState([]);
  const [dismissedAlerts, setDismissedAlerts] = useState([]);

  useEffect(() => {
    if (cityName) {
      // In production, fetch real alerts from an API
      const mockAlerts = generateMockAlerts(cityName);
      setAlerts(mockAlerts);
    }
  }, [cityName]);

  const dismissAlert = (alertId) => {
    setDismissedAlerts([...dismissedAlerts, alertId]);
  };

  const getSeverityBadge = (severity) => {
    const badges = {
      warning: { label: '⚠️ WARNING', color: 'bg-red-500/30 text-red-300' },
      watch: { label: '👀 WATCH', color: 'bg-orange-500/30 text-orange-300' },
      advisory: { label: 'ℹ️ ADVISORY', color: 'bg-yellow-500/30 text-yellow-300' },
    };
    return badges[severity] || badges.advisory;
  };

  const visibleAlerts = alerts.filter(a => !dismissedAlerts.includes(a.id));

  if (visibleAlerts.length === 0) {
    return (
      <div className="bg-white/10 backdrop-blur-md rounded-3xl p-6 text-center text-white/40 border border-white/10 shadow-2xl">
        <AlertTriangle className="w-8 h-8 mx-auto mb-2 text-white/20" />
        <p className="text-sm">No active weather alerts in your area</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {visibleAlerts.map((alert) => {
        const Icon = alert.icon;
        const badge = getSeverityBadge(alert.severity);
        return (
          <div
            key={alert.id}
            className={`${alert.color} backdrop-blur-md rounded-2xl p-4 border shadow-xl relative`}
          >
            <button
              onClick={() => dismissAlert(alert.id)}
              className="absolute top-3 right-3 text-white/30 hover:text-white/60 transition"
              aria-label="Dismiss alert"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-start gap-3 pr-8">
              <div className={`p-2 rounded-full ${alert.color} flex-shrink-0`}>
                <Icon className={`w-5 h-5 ${alert.iconColor}`} />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3 flex-wrap">
                  <h4 className="text-white font-semibold">{alert.type}</h4>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${badge.color}`}>
                    {badge.label}
                  </span>
                </div>
                <p className="text-sm text-white/70 mt-1">{alert.description}</p>
                <div className="flex items-center gap-3 mt-2 text-xs text-white/40">
                  <span>📍 {alert.location}</span>
                  <span>•</span>
                  <span>🕐 {alert.issued}</span>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}