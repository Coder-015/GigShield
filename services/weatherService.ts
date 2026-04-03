import { WeatherAlert, Zone } from '@/types';

// Flag to use mock data (set to false when API is working)
const USE_MOCK = true;

// OpenWeatherMap API configuration
const WEATHER_API_KEY = 'YOUR_OPENWEATHERMAP_API_KEY'; // Replace with actual API key
const WEATHER_BASE_URL = 'https://api.openweathermap.org/data/2.5';

// Mumbai zones with coordinates
const MUMBAI_ZONES: Zone[] = [
  { id: 'bandra', name: 'Bandra', risk: 'high', color: '#EF4444' },
  { id: 'kurla', name: 'Kurla', risk: 'medium', color: '#F59E0B' },
  { id: 'dharavi', name: 'Dharavi', risk: 'safe', color: '#10B981' },
  { id: 'andheri', name: 'Andheri', risk: 'high', color: '#EF4444' },
  { id: 'borivali', name: 'Borivali', risk: 'medium', color: '#F59E0B' },
  { id: 'powai', name: 'Powai', risk: 'safe', color: '#10B981' },
];

// Zone coordinates (lat, lon)
const ZONE_COORDINATES: Record<string, { lat: number; lon: number }> = {
  bandra: { lat: 19.0596, lon: 72.8295 },
  kurla: { lat: 19.0728, lon: 72.8826 },
  dharavi: { lat: 19.0360, lon: 72.8497 },
  andheri: { lat: 19.1199, lon: 72.8464 },
  borivali: { lat: 19.2317, lon: 72.8577 },
  powai: { lat: 19.1198, lon: 72.9085 },
};

// Mock weather data for development
const MOCK_WEATHER_DATA: Record<string, WeatherData> = {
  dharavi: { 
    temperature: 31, 
    humidity: 89, 
    windSpeed: 12, 
    rainfall: 52, 
    aqi: 187, 
    condition: 'Heavy Rain', 
    riskLevel: 'high' 
  },
  kurla: { 
    temperature: 30, 
    humidity: 85, 
    windSpeed: 10, 
    rainfall: 28, 
    aqi: 165, 
    condition: 'Moderate Rain', 
    riskLevel: 'medium' 
  },
  andheri: { 
    temperature: 29, 
    humidity: 82, 
    windSpeed: 8, 
    rainfall: 18, 
    aqi: 142, 
    condition: 'Light Rain', 
    riskLevel: 'medium' 
  },
  bandra: { 
    temperature: 28, 
    humidity: 78, 
    windSpeed: 6, 
    rainfall: 5, 
    aqi: 98, 
    condition: 'Partly Cloudy', 
    riskLevel: 'safe' 
  },
  borivali: { 
    temperature: 29, 
    humidity: 75, 
    windSpeed: 7, 
    rainfall: 12, 
    aqi: 125, 
    condition: 'Light Rain', 
    riskLevel: 'medium' 
  },
  powai: { 
    temperature: 30, 
    humidity: 80, 
    windSpeed: 9, 
    rainfall: 35, 
    aqi: 156, 
    condition: 'Heavy Rain', 
    riskLevel: 'high' 
  },
};

interface WeatherData {
  temperature: number;
  humidity: number;
  windSpeed: number;
  rainfall: number;
  aqi: number;
  condition: string;
  riskLevel: 'high' | 'medium' | 'safe';
}

class WeatherService {
  // Get weather data for a specific zone
  async getWeatherForZone(zoneId: string): Promise<WeatherData> {
    try {
      console.log(`Getting weather for zone: ${zoneId}`);
      
      // Use mock data if flag is set
      if (USE_MOCK) {
        console.log('Using mock weather data');
        const mockData = MOCK_WEATHER_DATA[zoneId];
        if (mockData) {
          return mockData;
        }
        // Fallback mock data if zone not found
        return {
          temperature: 29,
          humidity: 75,
          windSpeed: 8,
          rainfall: 15,
          aqi: 120,
          condition: 'Partly Cloudy',
          riskLevel: 'medium',
        };
      }

      // Try real API call
      const coords = ZONE_COORDINATES[zoneId];
      if (!coords) {
        throw new Error(`Coordinates not found for zone: ${zoneId}`);
      }

      const response = await fetch(
        `${WEATHER_BASE_URL}/weather?lat=${coords.lat}&lon=${coords.lon}&appid=${WEATHER_API_KEY}&units=metric`
      );

      if (!response.ok) {
        throw new Error(`Weather API failed: ${response.status}`);
      }

      const data = await response.json();
      
      // Convert API response to our format
      const weatherData: WeatherData = {
        temperature: Math.round(data.main.temp),
        humidity: data.main.humidity,
        windSpeed: Math.round(data.wind.speed * 3.6), // Convert m/s to km/h
        rainfall: data.rain?.['1h'] || 0,
        aqi: 120, // Would need separate AQI API call
        condition: data.weather[0].description,
        riskLevel: this.calculateRiskLevel(data.rain?.['1h'] || 0),
      };

      console.log('Real weather data fetched:', weatherData);
      return weatherData;

    } catch (error) {
      console.error('Weather service error:', error);
      
      // Fallback to mock data on any error
      console.log('Falling back to mock data due to error');
      const mockData = MOCK_WEATHER_DATA[zoneId];
      if (mockData) {
        return mockData;
      }
      
      // Final fallback
      return {
        temperature: 29,
        humidity: 75,
        windSpeed: 8,
        rainfall: 15,
        aqi: 120,
        condition: 'Partly Cloudy',
        riskLevel: 'medium',
      };
    }
  }

  // Calculate risk level based on rainfall
  private calculateRiskLevel(rainfall: number): 'high' | 'medium' | 'safe' {
    if (rainfall >= 40) return 'high';
    if (rainfall >= 15) return 'medium';
    return 'safe';
  }

  // Create weather alert for a zone
  async createWeatherAlert(zoneId: string): Promise<WeatherAlert> {
    try {
      const weatherData = await this.getWeatherForZone(zoneId);
      
      // Create alert if rainfall exceeds threshold
      const threshold = 40; // mm/hr
      if (weatherData.rainfall >= threshold) {
        const payoutAmount = this.calculatePayoutAmount(weatherData.rainfall);
        
        return {
          intensity: weatherData.rainfall,
          threshold,
          time: new Date().toISOString(),
          payoutAmount,
        };
      }
      
      // Return minimal alert if no threshold exceeded
      return {
        intensity: weatherData.rainfall,
        threshold,
        time: new Date().toISOString(),
        payoutAmount: 0,
      };
    } catch (error) {
      console.error('Error creating weather alert:', error);
      
      // Fallback alert
      return {
        intensity: 25,
        threshold: 40,
        time: new Date().toISOString(),
        payoutAmount: 0,
      };
    }
  }

  // Calculate payout amount based on rainfall intensity
  private calculatePayoutAmount(rainfall: number): number {
    // Base calculation: ₹73/hr × 4 hours = ₹292 for moderate rain
    // Scale based on intensity
    const baseAmount = 292;
    const multiplier = Math.min(rainfall / 40, 2); // Cap at 2x
    return Math.round(baseAmount * multiplier);
  }

  // Get all zones with current weather
  async getAllZonesWeather(): Promise<(Zone & { weather: WeatherData })[]> {
    try {
      console.log('Getting weather for all zones');
      const zonesWeather = await Promise.all(
        MUMBAI_ZONES.map(async (zone) => {
          const weather = await this.getWeatherForZone(zone.id);
          return { ...zone, weather };
        })
      );
      
      return zonesWeather;
    } catch (error) {
      console.error('Error getting all zones weather:', error);
      
      // Fallback: return zones with mock weather
      return MUMBAI_ZONES.map(zone => ({
        ...zone,
        weather: MOCK_WEATHER_DATA[zone.id] || {
          temperature: 29,
          humidity: 75,
          windSpeed: 8,
          rainfall: 15,
          aqi: 120,
          condition: 'Partly Cloudy',
          riskLevel: 'medium',
        },
      }));
    }
  }

  // Check if any zone has high risk weather
  async getHighRiskZones(): Promise<string[]> {
    try {
      const allWeather = await this.getAllZonesWeather();
      return allWeather
        .filter(zone => zone.weather.riskLevel === 'high')
        .map(zone => zone.id);
    } catch (error) {
      console.error('Error getting high risk zones:', error);
      return ['dharavi']; // Fallback
    }
  }
}

// Export singleton instance
export const weatherService = new WeatherService();
export default weatherService;
