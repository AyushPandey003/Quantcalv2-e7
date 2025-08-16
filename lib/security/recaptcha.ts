export interface RecaptchaConfig {
  siteKey: string;
  secretKey: string;
  version: 'v2' | 'v3';
  minScore?: number; // For v3, minimum score threshold (0.0 to 1.0)
}

export interface RecaptchaVerificationResult {
  success: boolean;
  score?: number; // For v3
  action?: string; // For v3
  challengePassed?: boolean; // For v2
  error?: string;
}

export class RecaptchaService {
  private static config: RecaptchaConfig;

  static initialize(config: RecaptchaConfig) {
    this.config = config;
  }

  /**
   * Verify reCAPTCHA token on the server side
   */
  static async verifyToken(token: string, remoteIP?: string): Promise<RecaptchaVerificationResult> {
    if (!this.config) {
      throw new Error('RecaptchaService not initialized');
    }

    if (!token) {
      return {
        success: false,
        error: 'No reCAPTCHA token provided',
      };
    }

    try {
      const verificationURL = 'https://www.google.com/recaptcha/api/siteverify';
      const formData = new URLSearchParams();
      formData.append('secret', this.config.secretKey);
      formData.append('response', token);
      if (remoteIP) {
        formData.append('remoteip', remoteIP);
      }

      const response = await fetch(verificationURL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formData.toString(),
      });

      const result = await response.json();

      if (!result.success) {
        return {
          success: false,
          error: 'reCAPTCHA verification failed',
          score: result.score,
          action: result.action,
          challengePassed: result.success,
        };
      }

      // For v3, check score threshold
      if (this.config.version === 'v3' && this.config.minScore !== undefined) {
        if (result.score < this.config.minScore) {
          return {
            success: false,
            score: result.score,
            action: result.action,
            error: `reCAPTCHA score too low: ${result.score} (minimum: ${this.config.minScore})`,
          };
        }
      }

      return {
        success: true,
        score: result.score,
        action: result.action,
        challengePassed: result.success,
      };
    } catch (error) {
      console.error('reCAPTCHA verification error:', error);
      return {
        success: false,
        error: 'Failed to verify reCAPTCHA',
      };
    }
  }

  /**
   * Get client-side configuration
   */
  static getClientConfig() {
    if (!this.config) {
      throw new Error('RecaptchaService not initialized');
    }

    return {
      siteKey: this.config.siteKey,
      version: this.config.version,
      minScore: this.config.minScore,
    };
  }

  /**
   * Check if reCAPTCHA is enabled
   */
  static isEnabled(): boolean {
    return !!(this.config?.siteKey && this.config?.secretKey);
  }
}

// Initialize with environment variables
if (process.env.NODE_ENV !== 'test') {
  RecaptchaService.initialize({
    siteKey: process.env.RECAPTCHA_SITE_KEY || '',
    secretKey: process.env.RECAPTCHA_SECRET_KEY || '',
    version: (process.env.RECAPTCHA_VERSION as 'v2' | 'v3') || 'v3',
    minScore: process.env.RECAPTCHA_MIN_SCORE ? parseFloat(process.env.RECAPTCHA_MIN_SCORE) : 0.5,
  });
}
