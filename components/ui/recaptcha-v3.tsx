'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import ReCAPTCHA from 'react-google-recaptcha';

export interface RecaptchaV3Props {
  siteKey: string;
  action: string;
  onChange: (token: string | null) => void;
  onError?: (error: string) => void;
  onExpired?: () => void;
  className?: string;
  disabled?: boolean;
  autoExecute?: boolean;
  retryAttempts?: number;
  retryDelay?: number;
}

export function RecaptchaV3Component({
  siteKey,
  action,
  onChange,
  onError,
  onExpired,
  className = '',
  disabled = false,
  autoExecute = true,
  retryAttempts = 3,
  retryDelay = 1000,
}: RecaptchaV3Props) {
  const recaptchaRef = useRef<ReCAPTCHA>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [isExecuting, setIsExecuting] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  const execute = useCallback(async () => {
    if (!recaptchaRef.current || disabled || isExecuting) {
      return;
    }

    setIsExecuting(true);
    setError(null);

    try {
      const token = await recaptchaRef.current.executeAsync();
      if (token) {
        onChange(token);
        setRetryCount(0); // Reset retry count on success
      } else {
        throw new Error('Failed to get reCAPTCHA token');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'reCAPTCHA execution failed';
      setError(errorMessage);
      onError?.(errorMessage);

      // Retry logic
      if (retryCount < retryAttempts) {
        setRetryCount(prev => prev + 1);
        setTimeout(() => {
          setIsExecuting(false);
          execute();
        }, retryDelay);
        return;
      }
    } finally {
      setIsExecuting(false);
    }
  }, [disabled, isExecuting, onChange, onError, retryCount, retryAttempts, retryDelay]);

  const handleExpired = useCallback(() => {
    setError('reCAPTCHA expired. Please try again.');
    onExpired?.();
    // Auto-retry on expiration
    if (autoExecute && retryCount < retryAttempts) {
      setTimeout(() => {
        execute();
      }, retryDelay);
    }
  }, [autoExecute, retryCount, retryAttempts, retryDelay, onExpired, execute]);

  const reset = useCallback(() => {
    recaptchaRef.current?.reset();
    setError(null);
    setRetryCount(0);
    setIsExecuting(false);
  }, []);

  // Auto-execute when component mounts
  useEffect(() => {
    if (autoExecute && isLoaded && !disabled) {
      const timer = setTimeout(() => {
        execute();
      }, 500); // Slightly longer delay for v3
      return () => clearTimeout(timer);
    }
  }, [autoExecute, isLoaded, disabled, execute]);

  // Re-execute when disabled state changes
  useEffect(() => {
    if (autoExecute && isLoaded && !disabled && !isExecuting) {
      execute();
    }
  }, [disabled, autoExecute, isLoaded, isExecuting, execute]);

  if (!isLoaded) {
    return (
      <div className={`recaptcha-v3-loading ${className}`}>
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900"></div>
        <span className="ml-2 text-xs text-gray-600">Loading security verification...</span>
      </div>
    );
  }

  if (!siteKey) {
    return (
      <div className={`recaptcha-v3-error ${className}`}>
        <span className="text-xs text-red-600">Security verification not configured</span>
      </div>
    );
  }

  return (
    <div className={`recaptcha-v3-container ${className}`}>
      <ReCAPTCHA
        ref={recaptchaRef}
        sitekey={siteKey}
        onChange={onChange}
        onError={(error) => {
          setError(error);
          onError?.(error);
        }}
        onExpired={handleExpired}
        size="invisible"
        badge="bottomright"
      />
      {error && (
        <div className="mt-1 text-xs text-red-600">
          {error}
          {retryCount > 0 && (
            <span className="ml-1 text-gray-500">
              (Retry {retryCount}/{retryAttempts})
            </span>
          )}
        </div>
      )}
      {isExecuting && (
        <div className="mt-1 text-xs text-blue-600">
          Verifying security...
        </div>
      )}
    </div>
  );
}

// Hook for managing reCAPTCHA v3 state
export function useRecaptchaV3(action: string = 'submit') {
  const [token, setToken] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isExpired, setIsExpired] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);

  const handleChange = useCallback((newToken: string | null) => {
    setToken(newToken);
    setError(null);
    setIsExpired(false);
    setIsVerifying(false);
  }, []);

  const handleError = useCallback((error: string) => {
    setError(error);
    setToken(null);
    setIsVerifying(false);
  }, []);

  const handleExpired = useCallback(() => {
    setIsExpired(true);
    setToken(null);
    setIsVerifying(false);
  }, []);

  const reset = useCallback(() => {
    setToken(null);
    setError(null);
    setIsExpired(false);
    setIsVerifying(false);
  }, []);

  const execute = useCallback(() => {
    setIsVerifying(true);
  }, []);

  return {
    token,
    error,
    isExpired,
    isVerifying,
    handleChange,
    handleError,
    handleExpired,
    reset,
    execute,
    action,
  };
}
