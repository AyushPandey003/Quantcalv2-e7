// lib/auth/jwt.ts
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
// Edge runtime does not support Node's 'crypto' randomBytes. Use Web Crypto instead.

function randomHex(byteLength: number): string {
  const arr = new Uint8Array(byteLength);
  // globalThis.crypto is available in both Edge runtime and modern Node (>=18)
  globalThis.crypto.getRandomValues(arr);
  return Array.from(arr, b => b.toString(16).padStart(2, '0')).join('');
}

const secretKey = process.env.JWT_ACCESS_TOKEN_SECRET;
const refreshSecretKey = process.env.JWT_REFRESH_TOKEN_SECRET || secretKey;

// Validate that we have valid secret keys
if (!secretKey || secretKey.length < 16) {
  console.error('⚠️ JWT_ACCESS_TOKEN_SECRET must be at least 16 characters long');
  console.error('⚠️ Using fallback key for development only');
}

const key = new TextEncoder().encode(secretKey);
const refreshKey = new TextEncoder().encode(refreshSecretKey);

export interface UserJWTPayload {
  jti: string; // JWT ID
  iat: number; // Issued at
  sub: string; // Subject (user ID)
  role: string; // User role
  [key: string]: any; // Index signature for flexibility
}

export interface JWTPayload {
  jti: string;
  iat: number;
  exp: number;
  sub: string;
  role: string;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export async function encrypt(payload: UserJWTPayload) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(process.env.JWT_ACCESS_TOKEN_EXPIRES_IN || "300m")
    .sign(key);
}

export async function decrypt(input: string): Promise<UserJWTPayload | null> {
  try {
    const { payload } = await jwtVerify<UserJWTPayload>(input, key, {
      algorithms: ["HS256"],
    });
    return payload;
  } catch (error) {
    // Token is invalid or expired
    console.error("JWT Verification Error:", error);
    return null;
  }
}

export async function getSession() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("session")?.value;
  if (!sessionCookie) return null;
  return await decrypt(sessionCookie);
}

// This function can be used to update the session cookie.
// For example, after refreshing the token.
export async function updateSession(request: NextRequest) {
  const sessionCookie = request.cookies.get("session")?.value;
  const refreshTokenCookie = request.cookies.get("refreshToken")?.value;

  if (!sessionCookie && !refreshTokenCookie) return;

  // Assume a refresh logic exists that provides a new token
  // For simplicity, we'll just re-verify and re-set the current one
  // In a real app, you'd have a /api/auth/refresh endpoint
  
  const parsed = await decrypt(sessionCookie!);
  if (!parsed) {
    // If the access token is expired, you would use the refresh token here
    // to get a new one. This part is simplified.
    return NextResponse.redirect(new URL("/login", request.url));
  }

  const res = NextResponse.next();
  // Refresh the cookie's expiration time
  res.cookies.set({
    name: "session",
    value: sessionCookie!,
    httpOnly: true,
    expires: new Date(Date.now() + 15 * 60 * 1000), // 15 mins from now
  });

  return res;
}

export class JWTAuth {
  static async generateTokenPair(userId: string, email: string, role: string): Promise<TokenPair> {
  const jti = randomHex(16);
    const now = Math.floor(Date.now() / 1000);
    
    // Access token - short lived
    const accessToken = await new SignJWT({
      jti,
      iat: now,
      sub: userId,
      role,
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setExpirationTime(process.env.JWT_ACCESS_TOKEN_EXPIRES_IN || '30m')
      .sign(key);

    // Refresh token - long lived
    const refreshToken = await new SignJWT({
      jti,
      iat: now,
      sub: userId,
      role,
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setExpirationTime(process.env.JWT_REFRESH_TOKEN_EXPIRES_IN || '7d')
      .sign(refreshKey);

    const expiresIn = parseInt(process.env.JWT_ACCESS_TOKEN_EXPIRES_IN || '900'); // 15 minutes in seconds

    return {
      accessToken,
      refreshToken,
      expiresIn,
    };
  }

  static async verifyAccessToken(token: string): Promise<JWTPayload | null> {
    try {
      console.log('🔍 JWT: Verifying access token...');
      const { payload } = await jwtVerify<JWTPayload>(token, key, {
        algorithms: ['HS256'],
      });
      console.log('✅ JWT: Token verified successfully:', { 
        sub: payload.sub, 
        role: payload.role, 
        exp: payload.exp 
      });
      return payload;
    } catch (error) {
      console.error('❌ JWT: Access token verification failed:', error);
      return null;
    }
  }

  static async verifyRefreshToken(token: string): Promise<JWTPayload | null> {
    try {
      const { payload } = await jwtVerify<JWTPayload>(token, refreshKey, {
        algorithms: ['HS256'],
      });
      return payload;
    } catch (error) {
      console.error('Refresh token verification failed:', error);
      return null;
    }
  }

  static extractTokenFromHeader(authHeader: string): string | null {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }
    return authHeader.substring(7);
  }

  static async refreshAccessToken(refreshToken: string): Promise<string | null> {
    try {
      const decoded = await this.verifyRefreshToken(refreshToken);
      if (!decoded) return null;
  const jti = randomHex(16);
      const now = Math.floor(Date.now() / 1000);

      const newAccessToken = await new SignJWT({
        jti,
        iat: now,
        sub: decoded.sub,
        role: decoded.role,
      })
        .setProtectedHeader({ alg: 'HS256' })
        .setExpirationTime(process.env.JWT_ACCESS_TOKEN_EXPIRES_IN || '30m')
        .sign(key);

      return newAccessToken;
    } catch (error) {
      console.error('Token refresh failed:', error);
      return null;
    }
  }
}

export function generateSecureToken(): string {
  return randomHex(32);
}

export function isTokenExpired(expiresAt: Date): boolean {
  return new Date() > expiresAt;
}