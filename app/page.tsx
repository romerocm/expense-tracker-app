'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from './context/AuthContext';
import { ThemeToggle } from './components/theme-toggle';
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';

export default function Home() {
  const { user, loading, signInWithGoogle } = useAuth();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && user) {
      router.push('/dashboard');
    }
  }, [user, loading, router]);

  const handleSignIn = async () => {
    try {
      setError(null);
      await signInWithGoogle();
    } catch (err: any) {
      if (err?.code === 'auth/popup-blocked') {
        setError('Please allow popups for this website to sign in with Google');
      } else {
        setError('Failed to sign in. Please try again.');
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse">Loading...</div>
      </div>
    );
  }

  if (user) return null;

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      
      <div className="min-h-screen flex flex-col items-center justify-center px-4">
        <div className="glass p-8 rounded-lg max-w-md w-full">
          <h1 className="text-2xl font-bold text-center mb-2">
            Welcome to Expense Tracker
          </h1>
          <p className="text-muted-foreground text-center mb-8">
            Beautiful spending, beautifully simple
          </p>

          {error && (
            <div className="mb-6 p-3 rounded-md bg-destructive/10 text-destructive flex items-center gap-2">
              <ExclamationTriangleIcon className="h-5 w-5 flex-shrink-0" />
              <p className="text-sm">{error}</p>
            </div>
          )}

          <button
            onClick={handleSignIn}
            className="w-full bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 transition-colors flex items-center justify-center space-x-2"
          >
            <span>Continue with Google</span>
          </button>
        </div>
      </div>
    </div>
  );
}