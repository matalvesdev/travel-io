'use client';

import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';

interface OAuthButtonsProps {
  mode?: 'login' | 'register';
}

export function OAuthButtons({ mode = 'login' }: OAuthButtonsProps) {
  const handleOAuth = async (provider: 'google' | 'apple') => {
    await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
  };

  return (
    <div className="grid grid-cols-2 gap-3">
      <Button variant="outline" className="w-full" type="button" onClick={() => handleOAuth('google')}>
        <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24">
          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.05z" fill="#4285F4"/>
          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.61z" fill="#FBBC05"/>
          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l2.85 2.22c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
        </svg>
        Google
      </Button>
      <Button variant="outline" className="w-full" type="button" onClick={() => handleOAuth('apple')}>
        <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24" fill="currentColor">
          <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.04 2.29.74 3.08.78 1.18-.24 2.31-.93 3.57-.84 1.55.12 2.93.74 3.8 1.84-3.37 2.04-2.59 5.83.39 7.16-.89 2.27-2.26 4.08-3.98 5.18zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.32 2.21-1.6 4.25-3.74 4.25z"/>
        </svg>
        Apple
      </Button>
    </div>
  );
}
