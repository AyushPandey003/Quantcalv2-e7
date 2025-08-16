'use client';

import { useState, useTransition, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { loginAction } from '@/actions/auth';
import { useRedirectIfAuth } from '@/hooks/use-auth';
import { RecaptchaV3Component, useRecaptchaV3 } from '@/components/ui/recaptcha-v3';

export default function LoginPage() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const formRef = useRef<HTMLFormElement>(null);

  // reCAPTCHA v3 hook
  const recaptcha = useRecaptchaV3('login');

  // Redirect if already authenticated
  const { loading } = useRedirectIfAuth('/dashboard');

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  async function handleSubmit(formData: FormData) {
    setError(null);
    setFieldErrors({});

    // Add reCAPTCHA token to form data if available
    if (recaptcha.token) {
      formData.append('recaptchaToken', recaptcha.token);
    }

    startTransition(async () => {
      let result: any;
      try {
        result = await loginAction(formData);
      } catch (e) {
        console.error('loginAction threw error', e);
        setError('Login failed due to a server error.');
        recaptcha.reset();
        return;
      }

      if (!result || typeof result !== 'object') {
        console.error('Unexpected loginAction response', result);
        setError('Unexpected server response.');
        recaptcha.reset();
        return;
      }

      if (result.success) {
        router.push('/dashboard');
        router.refresh();
        return;
      }

      setError(result.message || 'Login failed');
      if (result.errors) {
        setFieldErrors(result.errors as Record<string, string[]>);
      }
      
      // Reset reCAPTCHA on failure
      recaptcha.reset();
    });
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Sign in</CardTitle>
          <CardDescription className="text-center">
            Enter your email and password to access your account
          </CardDescription>
        </CardHeader>
        <form ref={formRef} action={handleSubmit}>
          <CardContent className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                disabled={isPending}
                className={fieldErrors.email ? 'border-red-500' : ''}
              />
              {fieldErrors.email && (
                <p className="text-sm text-red-500">{fieldErrors.email[0]}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                disabled={isPending}
                className={fieldErrors.password ? 'border-red-500' : ''}
              />
              {fieldErrors.password && (
                <p className="text-sm text-red-500">{fieldErrors.password[0]}</p>
              )}
            </div>

            {/* reCAPTCHA v3 Component - Invisible */}
            <div className="space-y-2">
              <RecaptchaV3Component
                siteKey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || ''}
                action="login"
                onChange={recaptcha.handleChange}
                onError={recaptcha.handleError}
                onExpired={recaptcha.handleExpired}
                disabled={isPending}
                autoExecute={true}
                retryAttempts={3}
                retryDelay={1000}
              />
              {recaptcha.error && (
                <p className="text-sm text-red-500">{recaptcha.error}</p>
              )}
            </div>
          </CardContent>

          <CardFooter className="flex flex-col space-y-4">
            <Button 
              type="submit" 
              className="w-full" 
              disabled={isPending}
            >
              {isPending ? 'Signing in...' : 'Sign in'}
            </Button>
            
            <div className="text-center text-sm">
              <a href="/forgot-password" className="text-blue-600 hover:underline">
                Forgot your password?
              </a>
            </div>
            
            <div className="text-center text-sm">
              Don't have an account?{' '}
              <a href="/register" className="text-blue-600 hover:underline">
                Sign up
              </a>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
