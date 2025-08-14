import { NextResponse } from 'next/server';

export async function GET() {
  const envVars = {
    DATABASE_URL: process.env.DATABASE_URL ? 'Set' : 'Not set',
    JWT_ACCESS_TOKEN_SECRET: process.env.JWT_ACCESS_TOKEN_SECRET ? 'Set' : 'Not set',
    JWT_REFRESH_TOKEN_SECRET: process.env.JWT_REFRESH_TOKEN_SECRET ? 'Set' : 'Not set',
    JWT_ACCESS_TOKEN_EXPIRES_IN: process.env.JWT_ACCESS_TOKEN_EXPIRES_IN || 'Not set',
    JWT_REFRESH_TOKEN_EXPIRES_IN: process.env.JWT_REFRESH_TOKEN_EXPIRES_IN || 'Not set',
    NODE_ENV: process.env.NODE_ENV || 'Not set',
  };

  return NextResponse.json({
    success: true,
    message: 'Environment variables check',
    environment: envVars,
    hasRequiredVars: !!(
      process.env.DATABASE_URL && 
      process.env.JWT_ACCESS_TOKEN_SECRET
    )
  });
}
