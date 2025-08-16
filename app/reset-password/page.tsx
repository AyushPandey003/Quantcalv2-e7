"use client";
import { Suspense } from 'react';
import { useState, useTransition, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { resetPasswordAction } from '@/actions/auth';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';

function ResetPasswordClient() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token');
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!token) {
      setError('Reset token missing.');
    }
  }, [token]);

  async function handleSubmit(formData: FormData) {
    if (!token) return;
    setError(null);
    formData.append('token', token);
    startTransition(async () => {
      const result = await resetPasswordAction(formData);
      if (result.success) {
        setSuccess(true);
        setTimeout(() => router.push('/login'), 2500);
      } else {
        setError(result.message);
      }
    });
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Reset Password</CardTitle>
          <CardDescription>Enter a new password for your account.</CardDescription>
        </CardHeader>
        {success ? (
          <CardContent>
            <Alert>
              <AlertDescription>Password reset successfully. Redirecting to login...</AlertDescription>
            </Alert>
          </CardContent>
        ) : (
          <form action={handleSubmit}>
            <CardContent className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              <div className="space-y-2">
                <Label htmlFor="newPassword">New Password</Label>
                <Input id="newPassword" name="newPassword" type="password" minLength={8} required disabled={isPending || !token} />
              </div>
            </CardContent>
            <CardFooter className="flex flex-col space-y-4">
              <Button type="submit" className="w-full" disabled={isPending || !token}>
                {isPending ? 'Resetting...' : 'Reset Password'}
              </Button>
              <a href="/login" className="text-sm text-blue-600 hover:underline">Back to login</a>
            </CardFooter>
          </form>
        )}
      </Card>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <ResetPasswordClient />
    </Suspense>
  );
}
