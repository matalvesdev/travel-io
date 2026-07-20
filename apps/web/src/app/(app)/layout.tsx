'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Sidebar } from '@/components/layout/sidebar';
import { useAuthStore } from '@/stores/auth-store';
import { apiClient } from '@/lib/api';

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarCollapsed, setSidebarCollapsed] = React.useState(false);
  const [hydrated, setHydrated] = React.useState(false);
  const hydrate = useAuthStore((s) => s.hydrate);
  const user = useAuthStore((s) => s.user);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const router = useRouter();

  const accessToken = useAuthStore((s) => s.accessToken);

  // Hydrate auth from Supabase session on mount
  React.useEffect(() => {
    hydrate().finally(() => setHydrated(true));
  }, []);

  React.useEffect(() => {
    if (hydrated && !isAuthenticated) {
      router.push('/auth/login');
    }
  }, [hydrated, isAuthenticated]);

  // Sync token to API client whenever it changes
  React.useEffect(() => {
    if (accessToken) {
      apiClient.setAccessToken(accessToken);
    }
  }, [accessToken]);

  return (
    <div className="min-h-screen bg-background">
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
      />
      <main
        className="transition-all duration-200"
        style={{
          marginLeft: sidebarCollapsed ? '72px' : '256px',
        }}
      >
        <div className="container mx-auto p-6">
          {children}
        </div>
      </main>
    </div>
  );
}
