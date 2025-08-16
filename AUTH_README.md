# JWT Authentication System

This project implements a comprehensive JWT-based authentication system using Next.js Server Actions and best practices.

## Features

- **JWT Authentication**: Secure token-based authentication with access and refresh tokens
- **Server Actions**: Modern Next.js server actions for form handling and data mutations
- **Database Schema**: Comprehensive database schema with users, sessions, and security features
- **Middleware Protection**: Route protection for both pages and API endpoints
- **Email Verification**: Email verification system for new accounts
- **Password Reset**: Secure password reset functionality
- **Session Management**: Multiple session support with device tracking
- **Activity Logging**: Complete user activity logging for security audit
- **TypeScript**: Full TypeScript support with proper type definitions

## Quick Start

### 1. Environment Setup

Copy the environment template and configure your variables:

```bash
cp .env.template .env.local
```

Update the following required variables in `.env.local`:

```env
DATABASE_URL="your-postgresql-connection-string"
JWT_SECRET="your-super-secret-jwt-key-min-32-chars"
JWT_REFRESH_SECRET="your-super-secret-refresh-key-min-32-chars"
```

### 2. Database Setup

Generate and apply database migrations:

```bash
# Generate migration
npx drizzle-kit generate

# Apply migration to your database
npx drizzle-kit push
```

### 3. Run the Application

```bash
npm run dev
```

## Authentication Flow

### Registration
1. User submits registration form
2. Server validates input using Zod schemas
3. Password is hashed using bcrypt
4. User is created in database
5. Email verification token is generated (optional)
6. JWT tokens are generated and set as HTTP-only cookies
7. User is redirected to dashboard

### Login
1. User submits login credentials
2. Server validates credentials
3. Password is verified against hash
4. New session is created with device info
5. JWT tokens are generated and set as HTTP-only cookies
6. User activity is logged
7. User is redirected to dashboard

### Token Refresh
1. Client automatically refreshes tokens before expiry (14 minutes)
2. Refresh token is validated
3. New access token is generated
4. Session last_used_at is updated

### Logout
1. Session is marked as inactive in database
2. Auth cookies are cleared
3. User is redirected to login page

## Server Actions

All authentication operations use Next.js server actions for optimal performance and security:

- `registerAction(formData)`: Handle user registration
- `loginAction(formData)`: Handle user login
- `logoutAction()`: Handle user logout
- `refreshTokenAction()`: Refresh access token
- `changePasswordAction(formData)`: Change user password
- `verifyEmailAction(token)`: Verify email address
- `requestPasswordResetAction(formData)`: Request password reset
- `resetPasswordAction(formData)`: Reset password with token

## React Hooks

### `useAuth()`
Main authentication hook providing user state and auth functions:

```tsx
const { user, loading, refreshUser, logout, isAuthenticated } = useAuth();
```

### `useRequireAuth()`
Hook for protecting pages that require authentication:

```tsx
const { user, loading } = useRequireAuth();
// Automatically redirects to login if not authenticated
```

### `useRedirectIfAuth(redirectTo)`
Hook for redirecting authenticated users (e.g., login/register pages):

```tsx
const { user, loading } = useRedirectIfAuth('/dashboard');
// Redirects authenticated users to dashboard
```

## Route Protection

### Middleware
The middleware automatically protects routes based on configuration:

- **Public paths**: `/`, `/login`, `/register`, `/forgot-password`
- **Protected pages**: `/dashboard`, `/profile`, `/settings`
- **Protected API**: `/api/dashboard`, `/api/user`, `/api/watchlists`

### Manual Protection
You can also manually protect components:

```tsx
import { useRequireAuth } from '@/hooks/use-auth';

export default function ProtectedPage() {
  const { user, loading } = useRequireAuth();
  
  if (loading) return <div>Loading...</div>;
  if (!user) return null; // Will redirect
  
  return <div>Protected content</div>;
}
```

## Database Schema

### Core Tables
- **users**: User accounts with authentication data
- **user_sessions**: Active sessions with refresh tokens
- **email_verification_tokens**: Email verification tokens
- **password_reset_tokens**: Password reset tokens
- **user_preferences**: User settings and preferences
- **user_activity_logs**: Complete activity audit trail

### Security Features
- **Password hashing**: bcrypt with salt rounds
- **Token encryption**: JWT with RSA signatures
- **Session tracking**: Device and IP logging
- **Activity monitoring**: Complete audit trail
- **Email verification**: Optional email verification
- **Password policies**: Configurable password requirements

## Security Best Practices

### Implemented
✅ HTTP-only cookies for token storage  
✅ Short-lived access tokens (15 minutes)  
✅ Automatic token refresh  
✅ Password hashing with bcrypt  
✅ Input validation with Zod  
✅ SQL injection prevention with Drizzle ORM  
✅ CSRF protection via SameSite cookies  
✅ Session invalidation on password change  
✅ Activity logging for security audits  

### Recommended Additions
- Rate limiting for authentication endpoints
- Account lockout after failed attempts
- Two-factor authentication (2FA)
- Email notifications for security events
- IP allowlisting for admin accounts
- Regular security token rotation

## API Examples

### Login Form with Server Action

```tsx
'use client';

import { useState, useTransition } from 'react';
import { loginAction } from '@/actions/auth';

export function LoginForm() {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(formData: FormData) {
    setError(null);
    
    startTransition(async () => {
      const result = await loginAction(formData);
      
      if (result.success) {
        window.location.href = '/dashboard';
      } else {
        setError(result.message);
      }
    });
  }

  return (
    <form action={handleSubmit}>
      <input name="email" type="email" required />
      <input name="password" type="password" required />
      <button type="submit" disabled={isPending}>
        {isPending ? 'Signing in...' : 'Sign in'}
      </button>
      {error && <p>{error}</p>}
    </form>
  );
}
```

### Protected API Route

```tsx
import { headers } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const headersList = await headers();
  const userId = headersList.get('x-user-id');
  
  if (!userId) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  // Use userId to fetch user-specific data
  return NextResponse.json({ userId, data: 'protected data' });
}
```

## Development

### Running Tests
```bash
npm run test
```

### Database Operations
```bash
# Generate migration
npx drizzle-kit generate

# Apply migration
npx drizzle-kit push

# View database in Drizzle Studio
npx drizzle-kit studio
```

### Type Generation
Types are automatically generated from the database schema. After schema changes, restart your TypeScript server.

## Production Deployment

### Environment Variables
Ensure all production environment variables are properly set:

- Use strong, unique JWT secrets (minimum 32 characters)
- Configure proper database connection
- Set up email service credentials
- Configure proper CORS and security headers

### Security Checklist
- [ ] Strong JWT secrets configured
- [ ] Database credentials secured
- [ ] HTTPS enabled
- [ ] Rate limiting implemented
- [ ] Error logging configured
- [ ] Security headers configured
- [ ] Regular security audits scheduled

## Troubleshooting

### Common Issues

**Token not found errors**: Check that cookies are properly set and the domain configuration is correct.

**Database connection issues**: Verify DATABASE_URL is correct and database is accessible.

**JWT errors**: Ensure JWT_SECRET and JWT_REFRESH_SECRET are properly configured and consistent.

**Middleware redirects**: Check that public/protected path configurations match your routing structure.

### Debug Mode
Enable debug logging by setting:
```env
DEBUG=true
```
