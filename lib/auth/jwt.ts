import { createId } from '@paralleldrive/cuid2';

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'your-super-secret-refresh-key-change-in-production';

export interface JWTPayload {
  userId: string;
  email: string;
  role: string;
  sessionId?: string;
  iat?: number;
  exp?: number;
  iss?: string;
  aud?: string;
}

export interface RefreshTokenPayload {
  userId: string;
  sessionId: string;
  iat?: number;
  exp?: number;
  iss?: string;
  aud?: string;
}

// Web Crypto API-based JWT implementation
class EdgeJWT {
  private static async base64UrlEncode(str: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(str);
    const base64 = btoa(String.fromCharCode(...new Uint8Array(data)));
    return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
  }

  private static async base64UrlDecode(str: string): Promise<string> {
    const base64 = str.replace(/-/g, '+').replace(/_/g, '/');
    const padding = '='.repeat((4 - base64.length % 4) % 4);
    const base64Padded = base64 + padding;
    const binaryString = atob(base64Padded);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    const decoder = new TextDecoder();
    return decoder.decode(bytes);
  }

  private static async hmacSha256(message: string, secret: string): Promise<string> {
    const encoder = new TextEncoder();
    const keyData = encoder.encode(secret);
    const messageData = encoder.encode(message);

    const cryptoKey = await crypto.subtle.importKey(
      'raw',
      keyData,
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    );

    const signature = await crypto.subtle.sign('HMAC', cryptoKey, messageData);
    const signatureArray = new Uint8Array(signature);
    return btoa(String.fromCharCode(...signatureArray))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '');
  }

  private static async verifyHmacSha256(message: string, signature: string, secret: string): Promise<boolean> {
    const expectedSignature = await this.hmacSha256(message, secret);
    return expectedSignature === signature;
  }

  static async sign(payload: any, secret: string, options: any = {}): Promise<string> {
    const header = {
      alg: 'HS256',
      typ: 'JWT',
    };

    const now = Math.floor(Date.now() / 1000);
    const finalPayload = {
      ...payload,
      iat: now,
      exp: now + (options.expiresIn || 900), // Default 15 minutes
      iss: options.issuer || 'quantcal',
      aud: options.audience || 'quantcal-users',
    };

    const headerB64 = await this.base64UrlEncode(JSON.stringify(header));
    const payloadB64 = await this.base64UrlEncode(JSON.stringify(finalPayload));
    const data = `${headerB64}.${payloadB64}`;
    const signature = await this.hmacSha256(data, secret);

    return `${data}.${signature}`;
  }

  static async verify(token: string, secret: string, options: any = {}): Promise<any> {
    const parts = token.split('.');
    if (parts.length !== 3) {
      throw new Error('Invalid token format');
    }

    const [headerB64, payloadB64, signature] = parts;
    const data = `${headerB64}.${payloadB64}`;

    // Verify signature
    const isValid = await this.verifyHmacSha256(data, signature, secret);
    if (!isValid) {
      throw new Error('Invalid signature');
    }

    // Decode payload
    const payloadStr = await this.base64UrlDecode(payloadB64);
    const payload = JSON.parse(payloadStr);

    // Check expiration
    const now = Math.floor(Date.now() / 1000);
    if (payload.exp && payload.exp < now) {
      throw new Error('Token expired');
    }

    // Check issuer
    if (options.issuer && payload.iss !== options.issuer) {
      throw new Error('Invalid issuer');
    }

    // Check audience
    if (options.audience && payload.aud !== options.audience) {
      throw new Error('Invalid audience');
    }

    return payload;
  }
}

export class JWTAuth {
  // Generate access token (short-lived)
  static async generateAccessToken(payload: JWTPayload): Promise<string> {
    return await EdgeJWT.sign(payload, JWT_SECRET, {
      expiresIn: 15 * 60, // 15 minutes
      issuer: 'quantcal',
      audience: 'quantcal-users',
    });
  }

  // Generate refresh token (long-lived)
  static async generateRefreshToken(payload: RefreshTokenPayload): Promise<string> {
    return await EdgeJWT.sign(payload, JWT_REFRESH_SECRET, {
      expiresIn: 7 * 24 * 60 * 60, // 7 days
      issuer: 'quantcal',
      audience: 'quantcal-users',
    });
  }

  // Verify access token
  static async verifyAccessToken(token: string): Promise<JWTPayload | null> {
    try {
      const decoded = await EdgeJWT.verify(token, JWT_SECRET, {
        issuer: 'quantcal',
        audience: 'quantcal-users',
      }) as JWTPayload;
      return decoded;
    } catch (error) {
      console.error('JWT verification failed:', error);
      return null;
    }
  }

  // Verify refresh token
  static async verifyRefreshToken(token: string): Promise<RefreshTokenPayload | null> {
    try {
      const decoded = await EdgeJWT.verify(token, JWT_REFRESH_SECRET, {
        issuer: 'quantcal',
        audience: 'quantcal-users',
      }) as RefreshTokenPayload;
      return decoded;
    } catch (error) {
      console.error('Refresh token verification failed:', error);
      return null;
    }
  }

  // Generate token pair
  static async generateTokenPair(userId: string, email: string, role: string) {
    const sessionId = createId();
    
    const accessToken = await this.generateAccessToken({
      userId,
      email,
      role,
      sessionId,
    });

    const refreshToken = await this.generateRefreshToken({
      userId,
      sessionId,
    });

    return {
      accessToken,
      refreshToken,
      sessionId,
      expiresIn: 15 * 60, // 15 minutes in seconds
    };
  }

  // Extract token from Authorization header
  static extractTokenFromHeader(authHeader: string | null): string | null {
    if (!authHeader) return null;
    
    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      return null;
    }
    
    return parts[1];
  }
}

// Utility function to generate secure tokens for email verification, password reset, etc.
export function generateSecureToken(): string {
  return createId() + '-' + Date.now().toString(36);
}

// Utility function to check if token is expired
export function isTokenExpired(expiresAt: Date): boolean {
  return new Date() > expiresAt;
}
