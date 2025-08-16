export interface SecurityConfig {
  // Rate Limiting
  rateLimit: {
    enabled: boolean;
    loginAttempts: {
      window: string;
      max: number;
    };
    loginEmail: {
      window: string;
      max: number;
    };
    registerAttempts: {
      window: string;
      max: number;
    };
    passwordReset: {
      window: string;
      max: number;
    };
    apiRequests: {
      window: string;
      max: number;
    };
    recaptchaFailures: {
      window: string;
      max: number;
    };
  };

  // IP Blocking
  ipBlock: {
    enabled: boolean;
    failedAttemptsThreshold: number;
    blockDuration: number; // in seconds
    permanentBlockThreshold: number;
  };

  // reCAPTCHA
  recaptcha: {
    enabled: boolean;
    siteKey: string;
    secretKey: string;
    version: 'v2' | 'v3';
    minScore: number; // for v3
  };

  // Redis
  redis: {
    url: string;
    token: string;
  };
}

export const securityConfig: SecurityConfig = {
  rateLimit: {
    enabled: true,
    loginAttempts: {
      window: '5 m',
      max: 5,
    },
    loginEmail: {
      window: '15 m',
      max: 3,
    },
    registerAttempts: {
      window: '10 m',
      max: 3,
    },
    passwordReset: {
      window: '1 h',
      max: 3,
    },
    apiRequests: {
      window: '1 m',
      max: 60,
    },
    recaptchaFailures: {
      window: '10 m',
      max: 5,
    },
  },

  ipBlock: {
    enabled: true,
    failedAttemptsThreshold: 10,
    blockDuration: 24 * 60 * 60, // 24 hours
    permanentBlockThreshold: 3,
  },

  recaptcha: {
    enabled: !!(process.env.RECAPTCHA_SITE_KEY && process.env.RECAPTCHA_SECRET_KEY),
    siteKey: process.env.RECAPTCHA_SITE_KEY || '',
    secretKey: process.env.RECAPTCHA_SECRET_KEY || '',
    version: (process.env.RECAPTCHA_VERSION as 'v2' | 'v3') || 'v3',
    minScore: process.env.RECAPTCHA_MIN_SCORE ? parseFloat(process.env.RECAPTCHA_MIN_SCORE) : 0.5,
  },

  redis: {
    url: process.env.UPSTASH_REDIS_REST_URL || '',
    token: process.env.UPSTASH_REDIS_REST_TOKEN || '',
  },
};

export function validateSecurityConfig(): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Check Redis configuration
  if (!securityConfig.redis.url || !securityConfig.redis.token) {
    errors.push('Redis configuration is missing. Set UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN');
  }

  // Check reCAPTCHA configuration if enabled
  if (securityConfig.recaptcha.enabled) {
    if (!securityConfig.recaptcha.siteKey || !securityConfig.recaptcha.secretKey) {
      errors.push('reCAPTCHA is enabled but site key or secret key is missing');
    }
    
    if (securityConfig.recaptcha.version === 'v3' && 
        (securityConfig.recaptcha.minScore < 0 || securityConfig.recaptcha.minScore > 1)) {
      errors.push('reCAPTCHA v3 min score must be between 0.0 and 1.0');
    }
  }

  // Validate rate limit configurations
  const rateLimits = [
    { name: 'loginAttempts', config: securityConfig.rateLimit.loginAttempts },
    { name: 'loginEmail', config: securityConfig.rateLimit.loginEmail },
    { name: 'registerAttempts', config: securityConfig.rateLimit.registerAttempts },
    { name: 'passwordReset', config: securityConfig.rateLimit.passwordReset },
    { name: 'apiRequests', config: securityConfig.rateLimit.apiRequests },
    { name: 'recaptchaFailures', config: securityConfig.rateLimit.recaptchaFailures },
  ];

  for (const { name, config } of rateLimits) {
    if (config.max <= 0) {
      errors.push(`${name} rate limit max must be greater than 0`);
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

// Environment variables documentation
export const ENV_VARS_DOCS = `
Required Environment Variables for Security Features:

1. Redis (Required for rate limiting and IP blocking):
   - UPSTASH_REDIS_REST_URL: Your Upstash Redis REST URL
   - UPSTASH_REDIS_REST_TOKEN: Your Upstash Redis REST token

2. reCAPTCHA (Optional but recommended):
   - RECAPTCHA_SITE_KEY: Your reCAPTCHA site key
   - RECAPTCHA_SECRET_KEY: Your reCAPTCHA secret key
   - RECAPTCHA_VERSION: "v2" or "v3" (default: "v2")
   - RECAPTCHA_MIN_SCORE: Minimum score for v3 (0.0 to 1.0, default: 0.5)
   - NEXT_PUBLIC_RECAPTCHA_SITE_KEY: Public site key for frontend

Setup Instructions:
1. Create an Upstash Redis database at https://upstash.com/
2. Get your reCAPTCHA keys from https://www.google.com/recaptcha/
3. Add the environment variables to your .env.local file
4. Restart your development server

Security Features:
- Rate limiting per IP and per email
- IP blocking after repeated failures
- reCAPTCHA integration (v2 or v3)
- Comprehensive security event logging
- Automatic IP detection from various headers
`;
