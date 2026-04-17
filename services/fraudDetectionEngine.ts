export interface ClaimInput {
  userId: string;
  zone: string;
  city: string;
  claimedHours: number;
  claimedAmount: number;
  userWeeklyBaseline: number;
  userPastClaims: number;
  weatherRainfall: number;
  weatherConfirmed: boolean;
  submissionTime: Date | string; // accepts both — will be coerced
  userAccountAgeDays: number;
}

export interface FraudAnalysis {
  approved: boolean;
  fraudScore: number;       // 0–100 (higher = more suspicious)
  riskLevel: 'low' | 'medium' | 'high';
  flags: string[];
  approvalConfidence: number;
  processingMethod: string;
}

export function analyzeClaim(input: ClaimInput): FraudAnalysis {
  const flags: string[] = [];
  let fraudScore = 0;

  // ── Safe date coercion (guards against undefined/string crash) ──
  let submissionDate: Date;
  try {
    submissionDate = input.submissionTime instanceof Date
      ? input.submissionTime
      : new Date(input.submissionTime);
    if (isNaN(submissionDate.getTime())) submissionDate = new Date();
  } catch {
    submissionDate = new Date();
  }

  // Rule 1: Weather not confirmed by API
  if (!input.weatherConfirmed) {
    fraudScore += 35;
    flags.push('Weather event not confirmed by external API');
  }

  // Rule 2: Claim amount vs weekly baseline
  const maxReasonablePayout = input.userWeeklyBaseline * 0.45;
  if (input.claimedAmount > maxReasonablePayout) {
    fraudScore += 20;
    flags.push(`Amount ₹${input.claimedAmount} exceeds 45% of weekly baseline (₹${Math.round(maxReasonablePayout)})`);
  }

  // Rule 3: Frequency — too many claims per month
  if (input.userPastClaims > 3) {
    const claimsPerMonth = input.userPastClaims / Math.max(1, input.userAccountAgeDays / 30);
    if (claimsPerMonth > 2.5) {
      fraudScore += 20;
      flags.push(`High frequency: ${claimsPerMonth.toFixed(1)} claims/month`);
    }
  }

  // Rule 4: New account + large claim
  if (input.userAccountAgeDays < 14 && input.claimedAmount > 250) {
    fraudScore += 25;
    flags.push('Large claim from account less than 14 days old');
  }

  // Rule 5: Hours > 8 = impossible workday
  if (input.claimedHours > 8) {
    fraudScore += 15;
    flags.push(`Claimed ${input.claimedHours}h exceeds 8h max work day`);
  }

  // Rule 6: Unusual submission hour (midnight–5am)
  const hour = submissionDate.getHours();
  if (hour >= 0 && hour < 5) {
    fraudScore += 10;
    flags.push(`Submitted at unusual hour (${hour.toString().padStart(2, '0')}:xx)`);
  }

  // Rule 7: Z-score anomaly on amount vs expected
  const expectedAmount = input.userWeeklyBaseline > 0
    ? (input.userWeeklyBaseline / 6 / 8) * input.claimedHours
    : 0;
  if (expectedAmount > 0) {
    const deviation = Math.abs(input.claimedAmount - expectedAmount) / expectedAmount;
    if (deviation > 0.35) {
      const pts = Math.min(Math.round(deviation * 12), 20);
      fraudScore += pts;
      flags.push(`Amount deviates ${Math.round(deviation * 100)}% from expected ₹${Math.round(expectedAmount)}`);
    }
  }

  // Cap at 100
  fraudScore = Math.min(100, fraudScore);

  const riskLevel: 'low' | 'medium' | 'high' =
    fraudScore < 20 ? 'low' : fraudScore < 55 ? 'medium' : 'high';

  // Only approve if weather confirmed and low/medium fraud score
  const approved = fraudScore < 55 && input.weatherConfirmed;
  const approvalConfidence = Math.round((1 - fraudScore / 100) * 100);

  return {
    approved,
    fraudScore,
    riskLevel,
    flags: flags.length > 0 ? flags : ['No suspicious patterns detected'],
    approvalConfidence,
    processingMethod:
      fraudScore < 20
        ? 'Auto-approved by AI engine'
        : fraudScore < 55
          ? 'Approved with manual review flag'
          : 'Flagged for investigation',
  };
}
