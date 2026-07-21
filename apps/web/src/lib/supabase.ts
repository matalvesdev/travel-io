import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { createServerClient as createSupabaseServerClient } from '@supabase/ssr';
import type { NextRequest, NextResponse } from 'next/server';

// Lazy Supabase client - only created when first accessed
let _client: SupabaseClient | null = null;

function getClient(): SupabaseClient {
  if (!_client) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!url || !key) throw new Error('Supabase env vars not configured');
    _client = createClient(url, key);
  }
  return _client;
}

// Export as a lazy proxy that delegates to the real client
export const supabase: SupabaseClient = new Proxy({} as SupabaseClient, {
  get(_, prop) {
    const client = getClient();
    const value = (client as any)[prop];
    return typeof value === 'function' ? value.bind(client) : value;
  },
});

// Server-side client with service role key (for API routes)
export function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const secretKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !secretKey) throw new Error('Supabase env vars not configured');
  return createClient(url, secretKey);
}

// Server-side client with cookie support (for Route Handlers & Server Components)
export function createServerClient(request: NextRequest, response: NextResponse) {
  return createSupabaseServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options);
        });
      },
    },
  });
}

// Browser-side client with cookie support
export function createBrowserClient() {
  return createSupabaseServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        const cookies: { name: string; value: string }[] = [];
        if (typeof document !== 'undefined') {
          document.cookie.split(';').forEach((c) => {
            const [name, ...rest] = c.trim().split('=');
            if (name) cookies.push({ name, value: rest.join('=') });
          });
        }
        return cookies;
      },
      setAll(cookiesToSet) {
        if (typeof document !== 'undefined') {
          cookiesToSet.forEach(({ name, value, options }) => {
            const cookieStr = `${name}=${value}; path=/; max-age=${options?.maxAge ?? 86400}; SameSite=Lax`;
            document.cookie = cookieStr;
          });
        }
      },
    },
  });
}

// Database types
export interface DBTransaction {
  id: string;
  user_id: string;
  type: 'INCOME' | 'EXPENSE';
  amount: number;
  description: string;
  category_name: string;
  transaction_date: string;
  method: string;
  installment_current: number | null;
  installment_total: number | null;
  created_at: string;
}

export interface DBInvestment {
  id: string;
  user_id: string;
  type: string;
  ticker: string;
  name: string;
  quantity: number;
  avg_cost: number;
  current_price: number;
}

export interface DBPriceMonitor {
  id: string;
  user_id: string;
  product_name: string;
  url: string;
  target_price: number;
  current_price: number;
  is_active: boolean;
  created_at: string;
}

export interface DBMilesAccount {
  id: string;
  user_id: string;
  program: string;
  balance: number;
  expiring_in_30_days: number;
}

export interface DBWishlist {
  id: string;
  user_id: string;
  name: string;
  items: DBWishlistItem[];
}

export interface DBWishlistItem {
  id: string;
  name: string;
  store: string;
  current_price: number;
  target_price: number;
  url: string;
  monitor_price: boolean;
}
