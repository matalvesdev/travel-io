import { NextRequest } from 'next/server';
import { z } from 'zod';
import { authenticatedHandler } from '@/lib/api/supabase-helpers';

const updateTripSchema = z.object({
  id: z.string().min(1, 'ID é obrigatório'),
  status: z.string().optional(),
  name: z.string().optional(),
  destination: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  notes: z.string().optional(),
  totalCost: z.number().optional(),
});

export async function GET(request: NextRequest) {
  return authenticatedHandler(request, async ({ userId, supabase }) => {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');

    let query = supabase
      .from('trips')
      .select('*')
      .eq('user_id', userId)
      .order('start_date', { ascending: false });

    if (status) query = query.eq('status', status);

    const { data, error } = await query;
    if (error) return Response.json({ success: false, message: error.message }, { status: 500 });
    return Response.json({ success: true, data: { trips: data } });
  });
}

export async function POST(request: NextRequest) {
  return authenticatedHandler(request, async ({ userId, supabase}) => {
    const body = await request.json();
    const { data, error } = await supabase
      .from('trips')
      .insert({ ...body, user_id: userId })
      .select()
      .single();

    if (error) return Response.json({ success: false, message: error.message }, { status: 500 });
    return Response.json({ success: true, data });
  });
}

export async function PATCH(request: NextRequest) {
  return authenticatedHandler(request, async ({ userId, supabase }) => {
    const body = await request.json();
    const parsed = updateTripSchema.safeParse(body);
    if (!parsed.success) {
      return Response.json({ success: false, message: parsed.error.errors[0].message }, { status: 400 });
    }

    const { id, ...updates } = parsed.data;
    const { data, error } = await supabase
      .from('trips')
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
  return authenticatedHandler(request, async ({ userId, supabase}) => {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return Response.json({ success: false, message: 'ID não informado' }, { status: 400 });

    const { error } = await supabase
      .from('trips')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    if (error) return Response.json({ success: false, message: error.message }, { status: 500 });
    return Response.json({ success: true, message: 'Viagem excluída' });
  });
}
