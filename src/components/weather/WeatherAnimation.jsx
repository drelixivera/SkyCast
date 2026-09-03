// src/components/weather/WeatherAnimation.jsx
// ============================================
// WEATHER ANIMATION - RENDERS THE RIGHT EFFECT
// ============================================

import Rain from './animations/Rain';
import Snow from './animations/Snow';
import Clouds from './animations/Clouds';
import Sun from './animations/Sun';

export default function WeatherAnimation({ condition, isDay }) {
  const conditionLower = condition?.toLowerCase() || '';

  // Determine which animation to show
  if (conditionLower.includes('rain') || conditionLower.includes('drizzle') || conditionLower.includes('shower')) {
    return <Rain />;
  }

  if (conditionLower.includes('snow') || conditionLower.includes('sleet')) {
    return <Snow />;
  }

  if (conditionLower.includes('cloud') || conditionLower.includes('overcast') || conditionLower.includes('mist') || conditionLower.includes('fog')) {
    return <Clouds />;
  }

  if (conditionLower.includes('clear') || conditionLower.includes('sunny')) {
    return <Sun isDay={isDay} />;
  }

  // Default: show nothing
  return null;
}