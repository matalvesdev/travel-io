import { NextRequest } from 'next/server';
import { authenticatedHandler } from '@/lib/api/supabase-helpers';

export async function GET(request: NextRequest) {
  return authenticatedHandler(request, async ({ userId, supabase }) => {
    const { data, error } = await supabase
      .from('payment_methods')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') {
      return Response.json({ success: false, message: error.message }, { status: 500 });
    }
    return Response.json({
      success: true,
      data: data ? {
        paymentMethod: {
          id: data.id, type: data.type, last4: data.last4, brand: data.brand,
          expiryMonth: data.expiry_month, expiryYear: data.expiry_year,
          isDefault: data.is_default,
        },
      } : { paymentMethod: null }});
  });
}

export async function POST(request: NextRequest) {
  return authenticatedHandler(request, async ({ userId, supabase}) => {
    const body = await request.json();
    const { last4, brand, expiryMonth, expiryYear, holderName } = body;
    if (!last4 || !brand) return Response.json({ success: false, message: 'Dados incompletos' }, { status: 400 });

    const { data, error } = await supabase
      .from('payment_methods')
      .insert({ user_id: userId, type: 'card', last4, brand, expiry_month: expiryMonth, expiry_year: expiryYear, holder_name: holderName, is_default: true })
      .select()
      .single();

    if (error) return Response.json({ success: false, message: error.message }, { status: 500 });
    return Response.json({ success: true, message: 'Método de pagamento salvo', data: { last4: data.last4, brand: data.brand } });
  });
}

export async function DELETE(request: NextRequest) {
  return authenticatedHandler(request, async ({ userId, supabase }) => {
    const { error } = await supabase
      .from('payment_methods')
      .delete()
      .eq('user_id', userId);

    if (error) return Response.json({ success: false, message: error.message }, { status: 500 });
    return Response.json({ success: true, message: 'Método de pagamento removido' });
  });
}
