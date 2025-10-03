// Platform Character Limits

// Constants for better maintainability
export const PLATFORM_LIMITS = {
  TWITTER: 280,
  INSTAGRAM: 2200,
  SMS: 160,
  FACEBOOK: 63206,
  LINKEDIN: 3000,
  DEFAULT_CUSTOM: 1000,
} as const;

export interface Platform {
  name: string;
  limit: number;
  icon?: string;
}

export const PLATFORMS: Record<string, Platform> = {
  twitter: {
    name: "Twitter/X",
    limit: PLATFORM_LIMITS.TWITTER,
  },
  instagram: {
    name: "Instagram Caption",
    limit: PLATFORM_LIMITS.INSTAGRAM,
  },
  sms: {
    name: "SMS",
    limit: PLATFORM_LIMITS.SMS,
  },
  facebook: {
    name: "Facebook Post",
    limit: PLATFORM_LIMITS.FACEBOOK,
  },
  linkedin: {
    name: "LinkedIn Post",
    limit: PLATFORM_LIMITS.LINKEDIN,
  },
  custom: {
    name: "Custom Limit",
    limit: PLATFORM_LIMITS.DEFAULT_CUSTOM,
  },
};

export interface LimitStatus {
  current: number;
  limit: number;
  remaining: number;
  percentage: number;
  status: "safe" | "warning" | "danger" | "critical" | "over";
  color: string;
}

export function calculateLimitStatus(
  charCount: number,
  limit: number
): LimitStatus {
  const remaining = limit - charCount;
  const percentage = (charCount / limit) * 100;

  let status: LimitStatus["status"] = "safe";
  let color = "#10B981"; // Green

  if (percentage > 100) {
    status = "over";
    color = "#DC2626"; // Dark Red
  } else if (percentage >= 99) {
    status = "critical";
    color = "#EF4444"; // Red
  } else if (percentage >= 91) {
    status = "danger";
    color = "#F97316"; // Orange
  } else if (percentage >= 76) {
    status = "warning";
    color = "#FBBF24"; // Yellow
  }

  return {
    current: charCount,
    limit,
    remaining,
    percentage: Math.min(percentage, 100),
    status,
    color,
  };
}

export function getSMSMessageCount(charCount: number): number {
  // Input validation
  if (typeof charCount !== 'number' || charCount < 0) {
    console.warn('Invalid character count for SMS calculation:', charCount);
    return 0;
  }

  if (charCount === 0) return 0;
  if (charCount <= 160) return 1;

  // Multi-part SMS uses 153 chars per message (160 - 7 bytes for concatenation info)
  return Math.ceil(charCount / 153);
}
