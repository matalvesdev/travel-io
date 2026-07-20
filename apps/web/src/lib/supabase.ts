import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Server-side client with service role key (for API routes)
export function getSupabaseAdmin() {
  const secretKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!secretKey) throw new Error('SUPABASE_SERVICE_ROLE_KEY not configured');
  return createClient(supabaseUrl, secretKey);
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
