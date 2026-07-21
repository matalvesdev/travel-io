import { NextRequest } from 'next/server';
import { z } from 'zod';
import { authenticatedHandler } from '@/lib/api/supabase-helpers';

const createInvestmentSchema = z.object({
  ticker: z.string().min(1, 'Ticker é obrigatório'),
  name: z.string().optional(),
  type: z.string().min(1, 'Tipo é obrigatório'),
  quantity: z.number().positive('Quantidade deve ser maior que 0'),
  avgCost: z.number().positive('Custo médio deve ser maior que 0'),
});

const updateInvestmentSchema = z.object({
  id: z.string().min(1, 'ID é obrigatório'),
  ticker: z.string().optional(),
  name: z.string().optional(),
  type: z.string().optional(),
  quantity: z.number().positive('Quantidade deve ser maior que 0').optional(),
  avgCost: z.number().positive('Custo médio deve ser maior que 0').optional(),
});

export async function GET(request: NextRequest) {
  return authenticatedHandler(request, async ({ userId, supabase }) => {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');

    let query = supabase
      .from('investments')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (type) query = query.eq('type', type);

    const { data, error } = await query;
    if (error) return Response.json({ success: false, message: error.message }, { status: 500 });
    return Response.json({ success: true, data: { investments: data } });
  });
}

export async function POST(request: NextRequest) {
  return authenticatedHandler(request, async ({ userId, supabase }) => {
    const body = await request.json();
    const parsed = createInvestmentSchema.safeParse(body);
    if (!parsed.success) {
      return Response.json({ success: false, message: parsed.error.errors[0].message }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('investments')
      .insert({ ...parsed.data, user_id: userId })
      .select()
      .single();

    if (error) return Response.json({ success: false, message: error.message }, { status: 500 });
    return Response.json({ success: true, data });
  });
}

export async function PATCH(request: NextRequest) {
  return authenticatedHandler(request, async ({ userId, supabase }) => {
    const body = await request.json();
    const parsed = updateInvestmentSchema.safeParse(body);
    if (!parsed.success) {
      return Response.json({ success: false, message: parsed.error.errors[0].message }, { status: 400 });
    }

    const { id, ...updates } = parsed.data;
    const { data, error } = await supabase
      .from('investments')
      .update(updates)
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) return Response.json({ success: false, message: error.message }, { status: 500 });
    return Response.json({ success: true, data });
  });
}

export async function DELETE(request: NextRequest) {
  return authenticatedHandler(request, async ({ userId, supabase }) => {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return Response.json({ success: false, message: 'ID não informado' }, { status: 400 });

    const { error } = await supabase
      .from('investments')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    if (error) return Response.json({ success: false, message: error.message }, { status: 500 });
    return Response.json({ success: true, message: 'Investimento excluído' });
  });
}
