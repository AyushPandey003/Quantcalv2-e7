# Security Features Implementation

This project implements industry-grade security features including rate limiting, IP blocking, and Google reCAPTCHA integration using Upstash Redis.

## 🛡️ Security Features Overview

### 1. Rate Limiting
- **Per-IP rate limiting**: Prevents brute force attacks from single IP addresses
- **Per-email rate limiting**: Prevents targeted attacks on specific accounts
- **Sliding window algorithm**: More accurate than fixed windows
- **Configurable limits**: Different limits for different actions (login, register, API calls)

### 2. IP Blocking
- **Automatic blocking**: IPs are blocked after repeated failed attempts
- **Temporary blocks**: 24-hour blocks for first violations
- **Permanent blocks**: After 3 temporary blocks
- **Manual blocking**: Admin can manually block IPs
- **Block expiration**: Automatic cleanup of expired blocks

### 3. Google reCAPTCHA v3
- **Invisible verification**: No user interaction required
- **Score-based security**: Configurable score thresholds (0.0 to 1.0)
- **Server-side verification**: Secure token verification with IP validation
- **Automatic execution**: Runs automatically on page load
- **Smart retry logic**: Automatic retry on failures with configurable attempts

### 4. Security Logging
- **Comprehensive logging**: All security events are logged to Redis
- **Event tracking**: Failed attempts, successful logins, IP blocks, etc.
- **7-day retention**: Logs are automatically cleaned up
- **Structured data**: JSON format for easy analysis

## 🚀 Quick Setup

### 1. Install Dependencies
```bash
pnpm add @upstash/redis @upstash/ratelimit react-google-recaptcha
```

### 2. Set Up Upstash Redis
1. Go to [Upstash Console](https://console.upstash.com/)
2. Create a new Redis database
3. Copy the REST URL and REST Token

### 3. Set Up Google reCAPTCHA v3
1. Go to [Google reCAPTCHA Admin](https://www.google.com/recaptcha/admin)
2. Create a new site
3. Choose **reCAPTCHA v3** (recommended for better UX)
4. Add your domain
5. Copy the Site Key and Secret Key

### 4. Environment Variables
Create a `.env.local` file with the following variables:

```env
# Required: Redis for rate limiting and IP blocking
UPSTASH_REDIS_REST_URL="https://your-redis-url.upstash.io"
UPSTASH_REDIS_REST_TOKEN="your-redis-token-here"

# Required: reCAPTCHA v3 configuration
RECAPTCHA_SITE_KEY="your-recaptcha-v3-site-key"
RECAPTCHA_SECRET_KEY="your-recaptcha-v3-secret-key"
RECAPTCHA_VERSION="v3"
RECAPTCHA_MIN_SCORE="0.5" # Score threshold (0.0 to 1.0)

# Required: Frontend reCAPTCHA v3 (public key)
NEXT_PUBLIC_RECAPTCHA_SITE_KEY="your-recaptcha-v3-site-key"
```

### 5. Validate Configuration
The system will automatically validate your configuration on startup. Check the console for any configuration errors.

## 📁 File Structure

```
lib/security/
├── rate-limiter.ts      # Rate limiting and IP blocking logic
├── recaptcha.ts         # reCAPTCHA verification service
├── middleware.ts        # Security middleware for API routes
└── config.ts           # Security configuration and validation

components/ui/
├── recaptcha.tsx       # reCAPTCHA v2/v3 React component
└── recaptcha-v3.tsx    # Specialized reCAPTCHA v3 component

app/api/security/
└── test/route.ts       # Test endpoint for security features
```

## 🔧 Configuration

### Rate Limiting Configuration
```typescript
// Default rate limits (configurable in lib/security/config.ts)
{
  loginAttempts: { window: '5 m', max: 5 },      // 5 attempts per 5 minutes per IP
  loginEmail: { window: '15 m', max: 3 },        // 3 attempts per 15 minutes per email
  registerAttempts: { window: '10 m', max: 3 },  // 3 attempts per 10 minutes per IP
  passwordReset: { window: '1 h', max: 3 },      // 3 attempts per hour per email
  apiRequests: { window: '1 m', max: 60 },       // 60 requests per minute per IP
  recaptchaFailures: { window: '10 m', max: 5 }  // 5 failures per 10 minutes per IP
}
```

### IP Blocking Configuration
```typescript
{
  failedAttemptsThreshold: 10,    // Block after 10 failed attempts
  blockDuration: 24 * 60 * 60,    // 24 hours temporary block
  permanentBlockThreshold: 3      // Permanent block after 3 temporary blocks
}
```

## 🎯 Usage Examples

### 1. Using Security Middleware in API Routes

```typescript
import { loginSecurityMiddleware } from '@/lib/security/middleware';

export async function POST(request: NextRequest) {
  // Apply security middleware
  const securityResponse = await loginSecurityMiddleware(request);
  if (securityResponse) {
    return securityResponse; // Returns 429, 403, or 400 if blocked
  }

  // Your API logic here
  return NextResponse.json({ success: true });
}
```

### 2. Manual Rate Limit Checking

```typescript
import { RateLimiterService } from '@/lib/security/rate-limiter';

const clientIP = RateLimiterService.getClientIP(request.headers);
const rateLimitResult = await RateLimiterService.checkLoginRateLimit(clientIP, email);

if (!rateLimitResult.success) {
  return NextResponse.json(
    { error: 'Rate limit exceeded' },
    { status: 429 }
  );
}
```

### 3. Manual IP Blocking

```typescript
import { RateLimiterService } from '@/lib/security/rate-limiter';

// Block an IP for 1 hour
await RateLimiterService.blockIP('192.168.1.1', 'Suspicious activity', 3600);

// Check if IP is blocked
const ipBlockInfo = await RateLimiterService.checkIPBlock('192.168.1.1');
if (ipBlockInfo.isBlocked) {
  // Handle blocked IP
}
```

### 4. reCAPTCHA v3 Integration

```typescript
// Server-side verification
import { RecaptchaService } from '@/lib/security/recaptcha';

const recaptchaResult = await RecaptchaService.verifyToken(token, clientIP);
if (!recaptchaResult.success) {
  return NextResponse.json(
    { error: 'reCAPTCHA verification failed' },
    { status: 400 }
  );
}
```

```tsx
// Client-side component (v3 - Invisible)
import { RecaptchaV3Component, useRecaptchaV3 } from '@/components/ui/recaptcha-v3';

function LoginForm() {
  const recaptcha = useRecaptchaV3('login');

  const handleSubmit = async (formData: FormData) => {
    if (recaptcha.token) {
      formData.append('recaptchaToken', recaptcha.token);
    }
    // Submit form
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Form fields */}
      <RecaptchaV3Component
        siteKey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY!}
        action="login"
        onChange={recaptcha.handleChange}
        onError={recaptcha.handleError}
        onExpired={recaptcha.handleExpired}
        autoExecute={true}
        retryAttempts={3}
        retryDelay={1000}
      />
    </form>
  );
}
```

## 🧪 Testing

### Test Security Configuration
```bash
curl http://localhost:3000/api/security/test
```

### Test Rate Limiting
```bash
# Make multiple requests to trigger rate limiting
for i in {1..10}; do
  curl -X POST http://localhost:3000/api/security/test
done
```

### Test IP Blocking
```bash
# Block an IP for testing
curl -X DELETE "http://localhost:3000/api/security/test?ip=192.168.1.100&reason=Test&duration=3600"
```

## 📊 Monitoring and Analytics

### Security Events Logged
- `login_success` / `login_failed`
- `register_success` / `register_failed`
- `rate_limit_exceeded`
- `ip_blocked` / `ip_unblocked`
- `recaptcha_success` / `recaptcha_failed`
- `security_test`

### Redis Keys Structure
```
login_attempts:{ip}           # Rate limit counters
login_email:{email}          # Email-based rate limits
ip_block:{ip}               # IP block information
ip_failed:{ip}              # Failed attempts counter
ip_block_count:{ip}         # Number of times IP was blocked
security_log:{timestamp}    # Security event logs
```

## 🔒 Security Best Practices

1. **Environment Variables**: Never commit sensitive keys to version control
2. **Rate Limits**: Start with conservative limits and adjust based on usage
3. **IP Detection**: Ensure proper IP detection behind proxies/load balancers
4. **Monitoring**: Regularly check security logs for suspicious activity
5. **Updates**: Keep dependencies updated for security patches
6. **Testing**: Regularly test security features in staging environment

## 🚨 Troubleshooting

### Common Issues

1. **Redis Connection Failed**
   - Check UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN
   - Verify Redis database is active in Upstash console

2. **reCAPTCHA v3 Not Working**
   - Verify site key and secret key match
   - Check domain is added to reCAPTCHA v3 settings
   - Ensure NEXT_PUBLIC_RECAPTCHA_SITE_KEY is set
   - Verify score threshold is appropriate (0.5 is recommended)
   - Check browser console for any JavaScript errors

3. **Rate Limiting Too Aggressive**
   - Adjust limits in `lib/security/config.ts`
   - Check if IP detection is working correctly

4. **IP Blocking Not Working**
   - Verify Redis is connected
   - Check IP detection logic for your deployment setup

### Debug Mode
Enable debug logging by setting:
```env
NODE_ENV=development
```

## 📈 Performance Considerations

- **Redis Operations**: All security checks are Redis operations (fast)
- **Caching**: Rate limit data is cached in Redis
- **Cleanup**: Automatic cleanup of expired data
- **Scaling**: Works with multiple server instances

## 🔄 Migration from Existing Auth

If you have existing authentication without these security features:

1. Add the new dependencies
2. Set up environment variables
3. Update your auth actions to include security checks
4. Add reCAPTCHA to your forms
5. Test thoroughly in staging
6. Deploy with monitoring enabled

## 📞 Support

For issues or questions:
1. Check the troubleshooting section
2. Review security logs in Redis
3. Test with the provided test endpoints
4. Check configuration validation output
