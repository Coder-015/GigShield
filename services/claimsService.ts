import { api } from './api';
import { Claim, ClaimStep, WeatherAlert, ApiResponse } from '@/types';

class ClaimsService {
  // Get all claims for current user
  async getClaims(): Promise<ApiResponse<Claim[]>> {
    return api.get('/claims');
  }

  // Get single claim by ID
  async getClaim(claimId: string): Promise<ApiResponse<Claim>> {
    return api.get(`/claims/${claimId}`);
  }

  // Create new claim (triggered by weather)
  async createClaim(weatherData: {
    intensity: number;
    threshold: number;
    zone: string;
  }): Promise<ApiResponse<Claim>> {
    return api.post('/claims', weatherData);
  }

  // Get claim steps/tracking
  async getClaimSteps(claimId: string): Promise<ApiResponse<ClaimStep[]>> {
    return api.get(`/claims/${claimId}/steps`);
  }

  // Simulate weather trigger for demo
  async simulateWeatherTrigger(zone: string): Promise<ApiResponse<{
    claim: Claim;
    weatherAlert: WeatherAlert;
  }>> {
    return api.post('/claims/simulate-trigger', { zone });
  }

  // Calculate payout amount based on disruption
  calculatePayoutAmount(
    intensity: number,
    weeklyEarnings: string,
    hoursDisrupted: number = 4
  ): number {
    const earnings = parseInt(weeklyEarnings.replace(/[^\d]/g, ''));
    const hourlyRate = earnings / 6; // Assuming 6 working days, 8 hours per day
    const payoutAmount = hourlyRate * hoursDisrupted;
    
    // Apply maximum payout limit (Rs. 500)
    return Math.min(payoutAmount, 500);
  }

  // Validate claim before submission
  validateClaim(weatherData: {
    intensity: number;
    threshold: number;
    zone: string;
  }): { isValid: boolean; error?: string } {
    if (weatherData.intensity < weatherData.threshold) {
      return {
        isValid: false,
        error: 'Rain intensity does not meet threshold requirements',
      };
    }

    if (!weatherData.zone || weatherData.zone.trim() === '') {
      return {
        isValid: false,
        error: 'Zone is required',
      };
    }

    return { isValid: true };
  }

  // Get claim statistics
  async getClaimStats(): Promise<ApiResponse<{
    totalClaims: number;
    successfulClaims: number;
    totalPayout: number;
    avgProcessingTime: string;
  }>> {
    return api.get('/claims/stats');
  }
}

export const claimsService = new ClaimsService();
export default claimsService;
