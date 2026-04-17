const WEATHER_API_KEY = process.env.EXPO_PUBLIC_WEATHER_API_KEY;

const CITY_COORDS: Record<string, { lat: number; lon: number }> = {
  Mumbai: { lat: 19.0760, lon: 72.8777 },
  Delhi: { lat: 28.6139, lon: 77.2090 },
  Bengaluru: { lat: 12.9716, lon: 77.5946 },
  Chennai: { lat: 13.0827, lon: 80.2707 },
  Hyderabad: { lat: 17.3850, lon: 78.4867 },
};

export interface LiveWeatherData {
  city: string;
  temperature: number;
  humidity: number;
  rainfall: number;        // mm/hr
  condition: string;
  aqi: number;
  windSpeed: number;
  riskLevel: 'high' | 'medium' | 'safe';
  triggerActive: boolean;
  triggerReason: string;
  lastUpdated: string;
  isLive: boolean;         // true = real API, false = mock fallback
}

export async function getLiveWeather(city: string): Promise<LiveWeatherData> {
  const coords = CITY_COORDS[city] || CITY_COORDS.Mumbai;
  
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    // Real OpenWeatherMap API call
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?` +
      `lat=${coords.lat}&lon=${coords.lon}` +
      `&appid=${WEATHER_API_KEY}&units=metric`,
      { signal: controller.signal }
    );
    
    clearTimeout(timeoutId);
    
    if (!response.ok) throw new Error(`API error: ${response.status}`);
    
    const data = await response.json();
    
    const rainfall = data.rain?.['1h'] || data.rain?.['3h'] || 0;
    const temp = Math.round(data.main.temp);
    const humidity = data.main.humidity;
    const windSpeed = data.wind.speed;
    const condition = data.weather[0].description;
    
    // Determine risk and triggers
    const { riskLevel, triggerActive, triggerReason } = 
      evaluateRisk(rainfall, temp, humidity);
    
    return {
      city,
      temperature: temp,
      humidity,
      rainfall,
      condition,
      aqi: 0, // Need separate AQI API
      windSpeed,
      riskLevel,
      triggerActive,
      triggerReason,
      lastUpdated: new Date().toLocaleTimeString('en-IN'),
      isLive: true,
    };
  } catch (error) {
    console.log('Weather API unavailable, using smart mock:', error);
    return getSmartMockWeather(city);
  }
}

function evaluateRisk(rainfall: number, temp: number, humidity: number): {
  riskLevel: 'high' | 'medium' | 'safe';
  triggerActive: boolean;
  triggerReason: string;
} {
  if (rainfall >= 40) {
    return {
      riskLevel: 'high',
      triggerActive: true,
      triggerReason: `Heavy rain: ${rainfall.toFixed(1)}mm/hr (threshold: 40mm/hr)`,
    };
  }
  if (temp >= 43) {
    return {
      riskLevel: 'high',
      triggerActive: true,
      triggerReason: `Extreme heat: ${temp}°C (threshold: 43°C)`,
    };
  }
  if (rainfall >= 20) {
    return { riskLevel: 'medium', triggerActive: false, triggerReason: 'Moderate rain' };
  }
  if (humidity >= 90 && rainfall > 5) {
    return { riskLevel: 'medium', triggerActive: false, triggerReason: 'High humidity' };
  }
  return { riskLevel: 'safe', triggerActive: false, triggerReason: 'Clear conditions' };
}

// Smart mock that feels real — uses time + season for realism
function getSmartMockWeather(city: string): LiveWeatherData {
  const hour = new Date().getHours();
  const month = new Date().getMonth() + 1;
  const isMonsoon = month >= 6 && month <= 9;
  const isAfternoon = hour >= 14 && hour <= 18;
  
  // Mumbai monsoon afternoon = likely rain
  const rainfall = (city === 'Mumbai' && isMonsoon && isAfternoon) ? 
    Math.random() * 60 + 20 : Math.random() * 15;
  
  const temp = city === 'Delhi' && month >= 4 && month <= 6 ? 
    Math.round(38 + Math.random() * 8) : 
    Math.round(28 + Math.random() * 6);

  const { riskLevel, triggerActive, triggerReason } = 
    evaluateRisk(rainfall, temp, 75);

  return {
    city,
    temperature: temp,
    humidity: Math.round(65 + Math.random() * 30),
    rainfall: Math.round(rainfall * 10) / 10,
    condition: rainfall > 40 ? 'Heavy rain' : rainfall > 10 ? 'Light rain' : 'Partly cloudy',
    aqi: Math.round(100 + Math.random() * 150),
    windSpeed: Math.round(10 + Math.random() * 20),
    riskLevel,
    triggerActive,
    triggerReason,
    lastUpdated: new Date().toLocaleTimeString('en-IN'),
    isLive: false,
  };
}
