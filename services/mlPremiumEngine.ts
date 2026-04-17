export interface WorkerRiskFeatures {
  city: string;
  zone: string;
  platform: string;
  weeklyEarnings: number;
  monthsActive: number;
  pastClaims: number;
  currentSeason: 'monsoon' | 'winter' | 'summer' | 'normal';
  zoneFloodHistory: number; // 0-10 scale
  avgWeeklyHours: number;
}

// ── Calibrated weights (logistic regression, recalibrated) ──────────────────
// Final score = sigmoid(linear) * 100, calibrated so:
//   Mumbai + monsoon + high flood → ~72–78
//   Bengaluru + normal + low flood → ~35–42
//   Delhi + summer + medium flood  → ~52–58

const CITY_RISK: Record<string, number> = {
  Mumbai: 1.4, Delhi: 0.9, Chennai: 0.8, Hyderabad: 0.6, Bengaluru: 0.3,
};

const SEASON_RISK: Record<string, number> = {
  monsoon: 0.9, summer: 0.5, winter: 0.1, normal: 0.0,
};

// Zone-specific flood index (0–10) → lookup table
const ZONE_FLOOD: Record<string, number> = {
  'Dharavi': 8.5, 'Kurla': 7.2, 'Andheri East': 6.8, 'Andheri': 6.4,
  'Powai': 6.1, 'Thane': 5.8, 'Bandra': 4.2, 'Worli': 3.8,
  'Lajpat Nagar': 5.5, 'Dwarka': 4.2, 'Rohini': 2.8,
  'Koramangala': 3.8, 'HSR Layout': 5.2, 'Whitefield': 2.9, 'Indiranagar': 3.1,
  'Anna Nagar': 4.5, 'Adyar': 5.8, 'T. Nagar': 4.2,
  'Hitech City': 3.2, 'Banjara Hills': 2.5, 'Secunderabad': 3.8,
};

// sigmoid function
function sigmoid(x: number): number {
  return 1 / (1 + Math.exp(-x));
}

export function calculateMLPremium(features: WorkerRiskFeatures): {
  basePremium: number;
  riskScore: number;
  riskFactors: { factor: string; impact: 'High' | 'Medium' | 'Low'; score: number }[];
  confidence: number;
} {
  const riskFactors: { factor: string; impact: 'High' | 'Medium' | 'Low'; score: number }[] = [];

  // ─── Linear combination (intercept calibrated so outputs land 30–80 range) ───
  let z = -1.8; // Calibrated intercept (was +2.3 — way too high)

  // 1. City base risk
  const cityRisk = CITY_RISK[features.city] ?? 0.5;
  z += cityRisk;
  riskFactors.push({
    factor: `${features.city} city risk`,
    impact: cityRisk > 1.0 ? 'High' : cityRisk > 0.6 ? 'Medium' : 'Low',
    score: cityRisk,
  });

  // 2. Season
  const seasonRisk = SEASON_RISK[features.currentSeason] ?? 0.0;
  z += seasonRisk;
  riskFactors.push({
    factor: `${features.currentSeason.charAt(0).toUpperCase() + features.currentSeason.slice(1)} season`,
    impact: seasonRisk > 0.7 ? 'High' : seasonRisk > 0.3 ? 'Medium' : 'Low',
    score: seasonRisk,
  });

  // 3. Zone flood history (normalised: 0–10 → 0–0.8)
  const floodScore = (features.zoneFloodHistory / 10) * 0.8;
  z += floodScore;
  riskFactors.push({
    factor: 'Zone flood history',
    impact: features.zoneFloodHistory > 6 ? 'High' : features.zoneFloodHistory > 3 ? 'Medium' : 'Low',
    score: floodScore,
  });

  // 4. Past claims rate (capped)
  const claimsRate = Math.min(features.pastClaims * 0.12, 0.5);
  z += claimsRate;
  if (features.pastClaims > 0) {
    riskFactors.push({
      factor: `${features.pastClaims} past claim${features.pastClaims > 1 ? 's' : ''}`,
      impact: features.pastClaims > 3 ? 'High' : 'Medium',
      score: claimsRate,
    });
  }

  // 5. Hours exposure (normalised: 40hr/wk nominal)
  const hoursRisk = Math.min((features.avgWeeklyHours / 40) * 0.3, 0.45);
  z += hoursRisk;
  if (features.avgWeeklyHours > 45) {
    riskFactors.push({
      factor: `${features.avgWeeklyHours}hr/week road exposure`,
      impact: features.avgWeeklyHours > 55 ? 'High' : 'Medium',
      score: hoursRisk,
    });
  }

  // ─── Convert to 0-100 score ───────────────────────────────────────────────
  const probability = sigmoid(z);
  // Map sigmoid output to a 25–85 display range (avoids 99 and 1 extremes)
  const riskScore = Math.round(25 + probability * 60);

  // ─── Premium: ₹25 base + risk adjustment, loyalty discount ───────────────
  const rawPremium = 25 + Math.round(probability * 90);
  const loyaltyDiscount = features.monthsActive > 6 ? 10 : features.monthsActive > 3 ? 5 : 0;
  const basePremium = Math.max(25, rawPremium - loyaltyDiscount);

  // ─── Confidence grows with data richness ─────────────────────────────────
  const confidence = Math.round(
    Math.min(95, 55 + features.monthsActive * 1.5 + features.pastClaims * 4)
  );

  return {
    basePremium,
    riskScore,
    riskFactors: riskFactors.slice(0, 4), // show top 4 factors
    confidence,
  };
}

export function getCurrentSeason(): 'monsoon' | 'winter' | 'summer' | 'normal' {
  const month = new Date().getMonth() + 1; // 1-12
  if (month >= 6 && month <= 9) return 'monsoon';
  if (month >= 11 || month <= 2) return 'winter';
  if (month >= 3 && month <= 5) return 'summer';
  return 'normal';
}

export function getZoneFloodHistory(zone: string): number {
  return ZONE_FLOOD[zone] ?? 5.0;
}
