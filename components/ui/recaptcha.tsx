'use client';

import { useEffect, useRef, useState } from 'react';
import ReCAPTCHA from 'react-google-recaptcha';

export interface RecaptchaProps {
  siteKey: string;
  version?: 'v2' | 'v3';
  onChange: (token: string | null) => void;
  onError?: (error: string) => void;
  onExpired?: () => void;
  theme?: 'light' | 'dark';
  size?: 'normal' | 'compact' | 'invisible';
  tabindex?: number;
  className?: string;
  disabled?: boolean;
  action?: string; // For v3
}

export function RecaptchaComponent({
  siteKey,
  version = 'v3',
  onChange,
  onError,
  onExpired,
  theme = 'light',
  size = 'invisible',
  tabindex = 0,
  className = '',
  disabled = false,
  action = 'submit',
}: RecaptchaProps) {
  const recaptchaRef = useRef<ReCAPTCHA>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  const handleChange = (token: string | null) => {
    setError(null);
    onChange(token);
  };

  const handleError = (error: string) => {
    setError(error);
    onError?.(error);
  };

  const handleExpired = () => {
    setError('reCAPTCHA expired. Please try again.');
    onExpired?.();
  };

  const reset = () => {
    recaptchaRef.current?.reset();
  };

  const execute = () => {
    if (version === 'v3') {
      recaptchaRef.current?.execute();
    }
  };

  // Auto-execute v3 reCAPTCHA when component mounts
  useEffect(() => {
    if (version === 'v3' && isLoaded && recaptchaRef.current) {
      // Small delay to ensure component is fully mounted
      const timer = setTimeout(() => {
        execute();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [version, isLoaded]);

  // Expose methods to parent component
  useEffect(() => {
    if (recaptchaRef.current) {
      (recaptchaRef.current as any).reset = reset;
      (recaptchaRef.current as any).execute = execute;
    }
  }, [recaptchaRef.current]);

  if (!isLoaded) {
    return (
      <div className={`recaptcha-loading ${className}`}>
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900"></div>
        <span className="ml-2 text-sm text-gray-600">Loading reCAPTCHA...</span>
      </div>
    );
  }

  if (!siteKey) {
    return (
      <div className={`recaptcha-error ${className}`}>
        <span className="text-sm text-red-600">reCAPTCHA not configured</span>
      </div>
    );
  }

  return (
    <div className={`recaptcha-container ${className}`}>
      <ReCAPTCHA
        ref={recaptchaRef}
        sitekey={siteKey}
        onChange={handleChange}
        onError={handleError}
        onExpired={handleExpired}
        theme={theme}
        size={size}
        tabindex={tabindex}
        disabled={disabled}
        {...(version === 'v3' && { action })}
      />
      {error && (
        <div className="mt-2 text-sm text-red-600">
          {error}
        </div>
      )}
    </div>
  );
}

// Hook for managing reCAPTCHA state
export function useRecaptcha() {
  const [token, setToken] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isExpired, setIsExpired] = useState(false);

  const handleChange = (newToken: string | null) => {
    setToken(newToken);
    setError(null);
    setIsExpired(false);
  };

  const handleError = (error: string) => {
    setError(error);
    setToken(null);
  };

  const handleExpired = () => {
    setIsExpired(true);
    setToken(null);
  };

  const reset = () => {
    setToken(null);
    setError(null);
    setIsExpired(false);
  };

  return {
    token,
    error,
    isExpired,
    handleChange,
    handleError,
    handleExpired,
    reset,
  };
}
