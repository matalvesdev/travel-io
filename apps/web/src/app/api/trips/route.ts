import { NextRequest } from 'next/server';
import { authenticatedHandler } from '@/lib/api/supabase-helpers';

function toSnakeCase(body: Record<string, unknown>): Record<string, unknown> {
  const map: Record<string, string> = {
    name: 'name',
    destination: 'destination',
    startDate: 'start_date',
    endDate: 'end_date',
    totalCost: 'total_cost',
    notes: 'notes',
    status: 'status',
    user_id: 'user_id',
  };
  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(body)) {
    const dbKey = map[key] || key;
    result[dbKey] = value;
  }
  return result;
}

const DB_FIELDS = ['id', 'name', 'destination', 'start_date', 'end_date', 'notes', 'total_cost', 'status', 'created_at', 'updated_at', 'user_id'];

function toCamelCase(row: Record<string, unknown>) {
  const map: Record<string, string> = {
    start_date: 'startDate',
    end_date: 'endDate',
    total_cost: 'totalCost',
    user_id: 'userId',
    created_at: 'createdAt',
    updated_at: 'updatedAt',
  };
  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(row)) {
    result[map[key] || key] = value;
  }
  return result;
}

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

    const trips = (data || []).map(toCamelCase);
    return Response.json({ success: true, data: { trips } });
  });
}

export async function POST(request: NextRequest) {
  return authenticatedHandler(request, async ({ userId, supabase }) => {
    const body = await request.json();
    const dbBody = toSnakeCase({ ...body, user_id: userId });

    const { data, error } = await supabase
      .from('trips')
      .insert(dbBody)
      .select()
      .single();

    if (error) return Response.json({ success: false, message: error.message }, { status: 500 });
    return Response.json({ success: true, data: toCamelCase(data) });
  });
}

export async function PATCH(request: NextRequest) {
  return authenticatedHandler(request, async ({ userId, supabase }) => {
    const body = await request.json();
    const { id, ...updates } = body;
    if (!id) return Response.json({ success: false, message: 'ID não informado' }, { status: 400 });

    const dbUpdates = toSnakeCase(updates);
    const { data, error } = await supabase
      .from('trips')
      .update(dbUpdates)
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) return Response.json({ success: false, message: error.message }, { status: 500 });
    return Response.json({ success: true, data: toCamelCase(data) });
  });
}

export async function DELETE(request: NextRequest) {
  return authenticatedHandler(request, async ({ userId, supabase }) => {
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

export async function PUT(request: NextRequest) {
  return PATCH(request);
}
