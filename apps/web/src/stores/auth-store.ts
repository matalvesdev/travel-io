import { create } from 'zustand';
import { supabase } from '@/lib/supabase';

interface User {
  id: string;
  email: string;
  name: string;
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; message?: string }>;
  logout: () => Promise<void>;
  setUser: (user: User | null) => void;
  hydrate: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  accessToken: null,
  isAuthenticated: false,

  hydrate: async () => {
    // First try to restore from Supabase session
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (authUser) {
        const name = authUser.user_metadata?.name || authUser.email?.split('@')[0] || 'Usuário';
        set({
          user: { id: authUser.id, email: authUser.email || '', name },
          accessToken: session.access_token,
          isAuthenticated: true,
        });
        // Immediately set token on API client
        if (typeof window !== 'undefined') {
          const { apiClient } = await import('@/lib/api');
          apiClient.setAccessToken(session.access_token);
        }
        return;
      }
    }
    // Fallback: try to restore token from localStorage
    if (typeof window !== 'undefined') {
      const storedToken = localStorage.getItem('accessToken');
      if (storedToken) {
        set({ accessToken: storedToken, isAuthenticated: true });
        // Immediately set token on API client
        const { apiClient } = await import('@/lib/api');
        apiClient.setAccessToken(storedToken);
      }
    }
  },

  login: async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) return { success: false, message: error.message };
      if (!data.session || !data.user) return { success: false, message: 'Falha no login' };

      const name = data.user.user_metadata?.name || email.split('@')[0];
      const user = { id: data.user.id, email: data.user.email || '', name };

      set({
        user,
        accessToken: data.session.access_token,
        isAuthenticated: true,
      });

      document.cookie = `accessToken=${data.session.access_token}; path=/; max-age=86400; SameSite=Lax`;

      return { success: true };
    } catch (err: any) {
      return { success: false, message: err.message || 'Erro de conexão' };
    }
  },

  logout: async () => {
    await supabase.auth.signOut();
    set({ user: null, accessToken: null, isAuthenticated: false });
    document.cookie = 'accessToken=; path=/; max-age=0';
  },

  setUser: (user) => set({ user, isAuthenticated: !!user }),
}));
