'use client';

import { useState, useTransition, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { registerAction } from '@/actions/auth';
import { useRedirectIfAuth } from '@/hooks/use-auth';
import { RecaptchaV3Component, useRecaptchaV3 } from '@/components/ui/recaptcha-v3';

export default function RegisterPage() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const formRef = useRef<HTMLFormElement>(null);

  // reCAPTCHA v3 hook
  const recaptcha = useRecaptchaV3('register');

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
    setSuccess(null);
    setFieldErrors({});

    // Add reCAPTCHA token to form data if available
    if (recaptcha.token) {
      formData.append('recaptchaToken', recaptcha.token);
    }

    startTransition(async () => {
      let result: any;
      try {
        result = await registerAction(formData);
      } catch (e) {
        console.error('registerAction threw error', e);
        setError('Registration failed due to a server error.');
        recaptcha.reset();
        return;
      }

      if (result.success) {
        if (result.data) {
          // User registered and logged in
          router.push('/dashboard');
          router.refresh();
        } else {
          // User registered but needs email verification
          setSuccess(result.message);
        }
      } else {
        setError(result.message);
        if (result.errors) {
          setFieldErrors(result.errors as Record<string, string[]>);
        }
        // Reset reCAPTCHA on failure
        recaptcha.reset();
      }
    });
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Create account</CardTitle>
          <CardDescription className="text-center">
            Enter your details to create your account
          </CardDescription>
        </CardHeader>
        <form ref={formRef} action={handleSubmit}>
          <CardContent className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {success && (
              <Alert>
                <AlertDescription>{success}</AlertDescription>
              </Alert>
            )}
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First name</Label>
                <Input
                  id="firstName"
                  name="firstName"
                  type="text"
                  autoComplete="given-name"
                  disabled={isPending}
                  className={fieldErrors.firstName ? 'border-red-500' : ''}
                />
                {fieldErrors.firstName && (
                  <p className="text-sm text-red-500">{fieldErrors.firstName[0]}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="lastName">Last name</Label>
                <Input
                  id="lastName"
                  name="lastName"
                  type="text"
                  autoComplete="family-name"
                  disabled={isPending}
                  className={fieldErrors.lastName ? 'border-red-500' : ''}
                />
                {fieldErrors.lastName && (
                  <p className="text-sm text-red-500">{fieldErrors.lastName[0]}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="username">Username (optional)</Label>
              <Input
                id="username"
                name="username"
                type="text"
                autoComplete="username"
                disabled={isPending}
                className={fieldErrors.username ? 'border-red-500' : ''}
              />
              {fieldErrors.username && (
                <p className="text-sm text-red-500">{fieldErrors.username[0]}</p>
              )}
            </div>

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
                autoComplete="new-password"
                required
                disabled={isPending}
                className={fieldErrors.password ? 'border-red-500' : ''}
              />
              {fieldErrors.password && (
                <p className="text-sm text-red-500">{fieldErrors.password[0]}</p>
              )}
              <p className="text-xs text-gray-500">
                Password must be at least 8 characters long
              </p>
            </div>

            {/* reCAPTCHA v3 Component - Invisible */}
            <div className="space-y-2">
              <RecaptchaV3Component
                siteKey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || ''}
                action="register"
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
              {isPending ? 'Creating account...' : 'Create account'}
            </Button>
            
            <div className="text-center text-sm">
              Already have an account?{' '}
              <a href="/login" className="text-blue-600 hover:underline">
                Sign in
              </a>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
