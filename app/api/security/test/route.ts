import { NextRequest, NextResponse } from 'next/server';
import { RateLimiterService } from '@/lib/security/rate-limiter';
import { RecaptchaService } from '@/lib/security/recaptcha';
import { SecurityMiddleware } from '@/lib/security/middleware';
import { validateSecurityConfig } from '@/lib/security/config';

export async function GET(request: NextRequest) {
  try {
    // Test security configuration
    const configValidation = validateSecurityConfig();
    
    const clientIP = RateLimiterService.getClientIP(request.headers);
    const ipBlockInfo = await RateLimiterService.checkIPBlock(clientIP);

    return NextResponse.json({
      success: true,
      message: 'Security test endpoint',
      data: {
        clientIP,
        ipBlockInfo,
        configValidation,
        recaptchaEnabled: RecaptchaService.isEnabled(),
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('Security test error:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Security test failed',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Apply security middleware
    const securityResponse = await SecurityMiddleware.handle(request, {
      enableRateLimit: true,
      enableIPBlock: true,
      enableRecaptcha: true,
      recaptchaAction: 'test',
      rateLimitType: 'api',
    });

    if (securityResponse) {
      return securityResponse;
    }

    const clientIP = RateLimiterService.getClientIP(request.headers);
    const formData = await request.formData();
    const recaptchaToken = formData.get('recaptchaToken') as string;

    // Test reCAPTCHA verification
    let recaptchaResult = null;
    if (recaptchaToken) {
      recaptchaResult = await RecaptchaService.verifyToken(recaptchaToken, clientIP);
    }

    // Log the test event
    await RateLimiterService.logSecurityEvent(clientIP, 'security_test', {
      method: 'POST',
      recaptchaResult,
    });

    return NextResponse.json({
      success: true,
      message: 'Security test passed',
      data: {
        clientIP,
        recaptchaResult,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('Security test POST error:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Security test failed',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const clientIP = RateLimiterService.getClientIP(request.headers);
    
    // Test IP blocking
    const testIP = request.nextUrl.searchParams.get('ip') || clientIP;
    const reason = request.nextUrl.searchParams.get('reason') || 'Test block';
    const duration = request.nextUrl.searchParams.get('duration') 
      ? parseInt(request.nextUrl.searchParams.get('duration')!) 
      : undefined;

    await RateLimiterService.blockIP(testIP, reason, duration);

    return NextResponse.json({
      success: true,
      message: `IP ${testIP} blocked for testing`,
      data: {
        blockedIP: testIP,
        reason,
        duration,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('IP block test error:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'IP block test failed',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
