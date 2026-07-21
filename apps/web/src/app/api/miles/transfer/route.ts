import { NextRequest } from 'next/server';
import { authenticatedHandler } from '@/lib/api/supabase-helpers';

export async function POST(request: NextRequest) {
  return authenticatedHandler(request, async ({ userId, supabase }) => {
    const body = await request.json();
    const { fromProgram, toProgram, miles } = body;

    if (!fromProgram || !toProgram || !miles) {
      return Response.json({ success: false, message: 'fromProgram, toProgram and miles are required' }, { status: 400 });
    }

    if (typeof miles !== 'number' || miles <= 0) {
      return Response.json({ success: false, message: 'miles must be a positive number' }, { status: 400 });
    }

    if (fromProgram === toProgram) {
      return Response.json({ success: false, message: 'Cannot transfer to the same program' }, { status: 400 });
    }

    const { data: route, error: routeError } = await supabase
      .from('transfer_routes')
      .select('*')
      .eq('from_program', fromProgram)
      .eq('to_program', toProgram)
      .single();

    if (routeError || !route) {
      return Response.json({ success: false, message: 'Transfer route not found' }, { status: 404 });
    }

    if (miles < route.min_transfer) {
      return Response.json({ success: false, message: `Minimum transfer is ${route.min_transfer} miles` }, { status: 400 });
    }

    if (route.max_transfer && miles > route.max_transfer) {
      return Response.json({ success: false, message: `Maximum transfer is ${route.max_transfer} miles` }, { status: 400 });
    }

    const conversionRate = route.conversion_rate;
    const convertedMiles = Math.floor(miles * conversionRate);

    const { data: sourceAccount, error: sourceError } = await supabase
      .from('miles')
      .select('id, balance')
      .eq('user_id', userId)
      .eq('program', fromProgram)
      .single();

    if (sourceError || !sourceAccount) {
      return Response.json({ success: false, message: 'Source miles account not found' }, { status: 404 });
    }

    if (sourceAccount.balance < miles) {
      return Response.json({ success: false, message: 'Insufficient miles balance' }, { status: 400 });
    }

    const { data: destAccount } = await supabase
      .from('miles')
      .select('id')
      .eq('user_id', userId)
      .eq('program', toProgram)
      .single();

    const transfer = {
      user_id: userId,
      from_program: fromProgram,
      to_program: toProgram,
      miles,
      converted_miles: convertedMiles,
      conversion_rate: conversionRate,
      status: 'COMPLETED',
    };

    const { data: transferRecord, error: transferError } = await supabase
      .from('miles_transfers')
      .insert(transfer)
      .select()
      .single();

    if (transferError) {
      return Response.json({ success: false, message: transferError.message }, { status: 500 });
    }

    await supabase
      .from('miles')
      .update({ balance: sourceAccount.balance - miles })
      .eq('id', sourceAccount.id);

    if (destAccount) {
      const { data: destMiles } = await supabase
        .from('miles')
        .select('balance')
        .eq('id', destAccount.id)
        .single();

      if (destMiles) {
        await supabase
          .from('miles')
          .update({ balance: destMiles.balance + convertedMiles })
          .eq('id', destAccount.id);
      }
    } else {
      await supabase.from('miles').insert({
        user_id: userId,
        program: toProgram,
        balance: convertedMiles,
      });
    }

    return Response.json({
      success: true,
      data: {
        id: transferRecord.id,
        fromProgram: transferRecord.from_program,
        toProgram: transferRecord.to_program,
        miles: transferRecord.miles,
        convertedMiles: transferRecord.converted_miles,
        conversionRate: transferRecord.conversion_rate,
        status: transferRecord.status,
        createdAt: transferRecord.created_at,
      },
    });
  });
}

export async function GET(request: NextRequest) {
  return authenticatedHandler(request, async ({ userId, supabase }) => {
    const { data, error } = await supabase
      .from('miles_transfers')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      return Response.json({ success: false, message: error.message }, { status: 500 });
    }

    const transfers = (data || []).map((t) => ({
      id: t.id,
      fromProgram: t.from_program,
      toProgram: t.to_program,
      miles: t.miles,
      convertedMiles: t.converted_miles,
      conversionRate: t.conversion_rate,
      status: t.status,
      createdAt: t.created_at,
    }));

    return Response.json({ success: true, data: transfers });
  });
}
